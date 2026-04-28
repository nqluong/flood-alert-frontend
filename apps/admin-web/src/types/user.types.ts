// User Management Types

export interface UserSummaryResponse {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: Array<'USER' | 'ADMIN'> | 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  reportCount?: number;
}

export interface UserDetailResponse extends UserSummaryResponse {
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  updatedAt?: string;
}

export interface UserFilters {
  search: string;
  role: 'all' | 'USER' | 'ADMIN';
  status: 'all' | 'ACTIVE' | 'LOCKED' | 'PENDING';
  emailVerified?: 'all' | 'true' | 'false';
  authProvider?: 'all' | 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
}

export interface UserApiFilter {
  page?: number;
  size?: number;
  keyword?: string;
  roles?: string[];
  status?: string;
  emailVerified?: boolean;
  authProvider?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface UsersApiResponse extends ApiResponse<PageResponse<UserSummaryResponse>> {}

export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface ChangeUserStatusRequest {
  status: 'ACTIVE' | 'LOCKED';
  reason?: string;
}

export interface ChangeUserRoleRequest {
  role: 'USER' | 'ADMIN';
}

// Role Management Types
export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface UserRoleResponse {
  id: string;
  userId: string;
  roleId: string;
  userFullName: string;
  userEmail: string;
  roleName: string;
  assignedAt: string;
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
}
