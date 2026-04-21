import { apiFetch } from './apiClient';
import type { UserAddressResponse, UserAddressRequest } from '../types/address.types';

export const addressService = {
  /**
   * Lấy danh sách địa chỉ của user hiện tại
   */
  async getUserAddresses(): Promise<UserAddressResponse[]> {
    return apiFetch<UserAddressResponse[]>('/users/addresses/current');
  },

  /**
   * Lấy danh sách địa chỉ theo userId
   */
  async getUserAddressesByUserId(userId: string): Promise<UserAddressResponse[]> {
    return apiFetch<UserAddressResponse[]>(`/users/addresses/user/${userId}`);
  },

  /**
   * Tạo địa chỉ mới
   */
  async createAddress(data: UserAddressRequest): Promise<UserAddressResponse> {
    return apiFetch<UserAddressResponse>('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(
    addressId: string,
    data: UserAddressRequest,
  ): Promise<UserAddressResponse> {
    return apiFetch<UserAddressResponse>(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(addressId: string): Promise<void> {
    return apiFetch<void>(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Đặt địa chỉ làm địa chỉ chính
   */
  async setPrimaryAddress(addressId: string): Promise<UserAddressResponse> {
    return apiFetch<UserAddressResponse>(`/users/addresses/${addressId}/primary`, {
      method: 'PUT',
    });
  },
};
