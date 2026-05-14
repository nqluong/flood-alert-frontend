import { apiFetch, getValidAccessToken, getBaseUrl } from './apiClient';

export interface UserLocationRequest {
  lat: number;
  lon: number;
}

export const locationService = {
  /**
   * Cập nhật vị trí hiện tại của user lên server
   * PUT /api/v1/users/location
   */
  async updateUserLocation(lat: number, lon: number): Promise<void> {
    return apiFetch<void>('/users/location', {
      method: 'PUT',
      body: JSON.stringify({ lat, lon }),
    });
  },

  /**
   * Cập nhật vị trí từ background task (không dùng apiFetch)
   * Dùng fetch trực tiếp với token từ storage
   */
  async updateUserLocationBackground(
    lat: number,
    lon: number,
    token: string,
    baseUrl: string
  ): Promise<void> {
    const response = await fetch(`${baseUrl}/users/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lon }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  },

  /**
   * Cập nhật vị trí từ background task với token refresh tự động
   * Sử dụng getValidAccessToken để tự động refresh token nếu cần
   */
  async updateUserLocationBackgroundWithRefresh(lat: number, lon: number): Promise<void> {
    const token = await getValidAccessToken();
    
    if (!token) {
      throw new Error('No valid access token available');
    }

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/users/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lon }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  },
};
