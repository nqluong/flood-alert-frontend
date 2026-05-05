import { apiFetch } from './apiClient';
import type { FcmTokenRequest, FcmTokenResponse } from '../types/fcm.types';

export const fcmTokenService = {

  upsertToken: async (request: FcmTokenRequest): Promise<void> => {
    await apiFetch<void>('/fcm-tokens', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  deactivateToken: async (deviceId: string): Promise<void> => {
    await apiFetch<void>(`/fcm-tokens/${deviceId}`, {
      method: 'DELETE',
    });
  },

  deactivateAllTokens: async (): Promise<void> => {
    await apiFetch<void>('/fcm-tokens/all', {
      method: 'DELETE',
    });
  },
};
