import { apiFetch } from './apiClient';
import type { UserProfileResponse, UserProfileUpdateRequest } from '../types/user.types';

export const userService = {
  /**
   * Lấy thông tin cá nhân của user hiện tại
   */
  async getProfile(): Promise<UserProfileResponse> {
    return apiFetch<UserProfileResponse>('/users/profile');
  },

  /**
   * Cập nhật thông tin cá nhân của user hiện tại
   */
  async updateProfile(data: UserProfileUpdateRequest): Promise<UserProfileResponse> {
    return apiFetch<UserProfileResponse>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
