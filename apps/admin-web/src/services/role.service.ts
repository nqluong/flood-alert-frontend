import type {
  RoleResponse,
  UserRoleResponse,
  AssignRoleRequest,
  ApiResponse,
} from '../types/user.types';
import { apiClient } from './api.client';
import { ApiError } from './api.helpers';

export const roleService = {
  /**
   * Lấy tất cả roles
   * GET /api/v1/roles
   */
  async getAllRoles(): Promise<RoleResponse[]> {
    const body = await apiClient.get<ApiResponse<RoleResponse[]>>('/roles');

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải danh sách roles.', body.code);
    }

    return body.data;
  },

  /**
   * Lấy role theo ID
   * GET /api/v1/roles/{roleId}
   */
  async getRoleById(roleId: string): Promise<RoleResponse> {
    const body = await apiClient.get<ApiResponse<RoleResponse>>(`/roles/${roleId}`);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải thông tin role.', body.code);
    }

    return body.data;
  },

  /**
   * Lấy roles của user
   * GET /api/v1/user-roles/user/{userId}
   */
  async getUserRoles(userId: string): Promise<UserRoleResponse[]> {
    const body = await apiClient.get<ApiResponse<UserRoleResponse[]>>(`/user-roles/user/${userId}`);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải roles của người dùng.', body.code);
    }

    return body.data;
  },

  /**
   * Gán role cho user
   * POST /api/v1/user-roles
   */
  async assignRole(request: AssignRoleRequest): Promise<UserRoleResponse> {
    const body = await apiClient.post<ApiResponse<UserRoleResponse>>('/user-roles', request);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Gán role thất bại.', body.code);
    }

    return body.data;
  },

  /**
   * Xóa role của user
   * DELETE /api/v1/user-roles?userId={userId}&roleId={roleId}
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    const body = await apiClient.delete<ApiResponse<void>>(`/user-roles?userId=${userId}&roleId=${roleId}`);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Xóa role thất bại.', body.code);
    }
  },
};