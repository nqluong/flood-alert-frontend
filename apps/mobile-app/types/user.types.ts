/**
 * User Profile Types
 */

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface UserProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}
