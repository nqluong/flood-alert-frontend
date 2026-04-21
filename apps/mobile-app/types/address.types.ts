/**
 * User Address Types
 */

export interface UserAddressResponse {
  id: string;
  addressText: string;
  lat: number;
  lon: number;
  isPrimary: boolean;
  addressType: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressRequest {
  addressText: string;
  lat: number;
  lon: number;
  isPrimary?: boolean;
  addressType?: string;
}

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  HOME: 'Nhà riêng',
  WORK: 'Nơi làm việc',
  OTHER: 'Khác',
};
