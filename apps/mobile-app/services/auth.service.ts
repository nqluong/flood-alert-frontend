import { Platform } from 'react-native';
import type { LoginRequest, LoginApiResponse, LoginData } from '../types/auth.types';
import { storageService } from './storage.service';

function getBaseUrl(): string {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return process.env.EXPO_PUBLIC_API_URL_ANDROID;
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return process.env.EXPO_PUBLIC_API_URL;
}

/** Phân biệt số điện thoại vs email để xây đúng payload */
function buildLoginPayload(identifier: string, password: string): LoginRequest {
  const trimmed = identifier.trim();
  const isPhone = /^[0-9+\-()\s]+$/.test(trimmed);
  return isPhone
    ? { phoneNumber: trimmed, password }
    : { email: trimmed, password };
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginData> {
    const payload = buildLoginPayload(identifier, password);

    const response = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json: LoginApiResponse = await response.json() as LoginApiResponse;

    if (!response.ok || !json.success) {
      throw new Error(json.message ?? 'Đăng nhập thất bại');
    }

    await storageService.saveTokens(json.data.accessToken, json.data.refreshToken);
    await storageService.saveUser(json.data.userResponse);

    return json.data;
  },

  async logout(): Promise<void> {
    await storageService.clearAll();
  },
};
