import {
  LoginRequest,
  LoginApiResponse,
  LoginData,
  RegisterRequest,
  UserResponse,
  SocialLoginRequest
} from '../types/auth.types';
import type { ApiResponse } from '../types/auth.types';
import { storageService } from './storage.service';
import { getBaseUrl } from './apiClient';

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

    const json = (await response.json()) as LoginApiResponse;

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

  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await fetch(`${getBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = (await response.json()) as ApiResponse<UserResponse>;

    if (!response.ok || !json.success) {
      throw new Error(json.message ?? 'Đăng ký thất bại');
    }

    return json.data;
  },

 async verifyFirebaseToken (data: SocialLoginRequest): Promise<LoginData> {
    const response = await fetch(`${getBaseUrl()}/auth/social/login`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });

    const json = (await response.json()) as LoginApiResponse;
   if (!response.ok || !json.success) {
     throw new Error(json.message ?? 'Đăng nhập thất bại');
   }

   await storageService.saveTokens(json.data.accessToken, json.data.refreshToken);
   await storageService.saveUser(json.data.userResponse);

   return json.data;
  }
};
