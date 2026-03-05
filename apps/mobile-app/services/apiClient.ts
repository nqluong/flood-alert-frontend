import { Platform } from 'react-native';
import { storageService } from './storage.service';
import type { ApiResponse, RefreshData } from '../types/auth.types';

export function getBaseUrl(): string {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return process.env.EXPO_PUBLIC_API_URL_ANDROID;
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return process.env.EXPO_PUBLIC_API_URL;
}

const REFRESH_THRESHOLD_SECONDS = 60;

function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (exp === null) return true;
  return exp - Date.now() / 1000 < REFRESH_THRESHOLD_SECONDS;
}


let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const currentRefreshToken = await storageService.getRefreshToken();
  if (!currentRefreshToken) return null;

  try {
    const res = await fetch(`${getBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!res.ok) return null;

    const body = (await res.json()) as ApiResponse<RefreshData>;
    if (!body.success) return null;

    const { accessToken, refreshToken: newRefreshToken } = body.data;
    await storageService.saveTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
}


export async function getValidAccessToken(): Promise<string | null> {
  const token = await storageService.getAccessToken();

  if (token && !isTokenExpiringSoon(token)) {
    return token;
  }

  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}


type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = await getValidAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = `${getBaseUrl()}${path}`;
  let response = await fetch(url, { ...fetchOptions, headers });

  // 401: thử refresh rồi retry 1 lần
  if (response.status === 401 && !skipAuth) {
    const newToken = await doRefresh();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...fetchOptions, headers });
    } else {
      // Refresh thất bại → clear session
      await storageService.clearAll();
      throw new Error('SESSION_EXPIRED');
    }
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? 'Có lỗi xảy ra');
  }

  return json.data;
}
