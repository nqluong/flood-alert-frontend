import type {
  UserApiFilter,
  UserSummaryResponse,
  UserDetailResponse,
  PageResponse,
  UsersApiResponse,
  UpdateUserRequest,
  ChangeUserStatusRequest,
  ChangeUserRoleRequest,
  ApiResponse,
} from '../types/user.types';
import { apiClient } from './api.client';
import { ApiError } from './api.helpers';

export const userService = {
  /**
   * Tìm kiếm người dùng với filter và phân trang
   * GET /api/v1/users/search
   */
  async getUsers(
    filter: UserApiFilter = {},
  ): Promise<PageResponse<UserSummaryResponse>> {
    const params: Record<string, string | number | boolean | string[]> = {};

    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;
    if (filter.keyword?.trim()) params.keyword = filter.keyword.trim();
    if (filter.status) params.status = filter.status;
    if (filter.emailVerified !== undefined) params.emailVerified = filter.emailVerified;
    if (filter.authProvider) params.authProvider = filter.authProvider;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortDirection) params.sortDirection = filter.sortDirection;
    
    // Xử lý roles array - backend nhận List<String> với parameter name "roles"
    if (filter.roles && filter.roles.length > 0) {
      params.roles = filter.roles;
    }

    const body = await apiClient.get<UsersApiResponse>('/users/search', params);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải danh sách người dùng.', body.code);
    }

    return body.data;
  },

  /**
   * Lấy chi tiết người dùng
   * GET /api/v1/admin/users/{id}
   */
  async getUserById(id: string): Promise<UserDetailResponse> {
    const body = await apiClient.get<ApiResponse<UserDetailResponse>>(`/users/${id}`);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải chi tiết người dùng.', body.code);
    }

    return body.data;
  },

  /**
   * Cập nhật thông tin người dùng
   * PUT /api/v1/admin/users/{id}
   */
  async updateUser(id: string, payload: UpdateUserRequest): Promise<UserDetailResponse> {
    const body = await apiClient.put<ApiResponse<UserDetailResponse>>(
      `/admin/users/${id}`,
      payload,
    );

    if (!body.success) {
      throw new ApiError(body.message ?? 'Cập nhật người dùng thất bại.', body.code);
    }

    return body.data;
  },

  /**
   * Thay đổi trạng thái người dùng (ACTIVE/LOCKED)
   * PATCH /api/v1/admin/users/{id}/status
   */
  async changeUserStatus(
    id: string,
    payload: ChangeUserStatusRequest,
  ): Promise<UserDetailResponse> {
    const body = await apiClient.patch<ApiResponse<UserDetailResponse>>(
      `/admin/users/${id}/status`,
      payload,
    );

    if (!body.success) {
      throw new ApiError(body.message ?? 'Thay đổi trạng thái thất bại.', body.code);
    }

    return body.data;
  },

  /**
   * Thay đổi role người dùng (USER/ADMIN)
   * PATCH /api/v1/admin/users/{id}/role
   */
  async changeUserRole(
    id: string,
    payload: ChangeUserRoleRequest,
  ): Promise<UserDetailResponse> {
    const body = await apiClient.patch<ApiResponse<UserDetailResponse>>(
      `/admin/users/${id}/role`,
      payload,
    );

    if (!body.success) {
      throw new ApiError(body.message ?? 'Thay đổi role thất bại.', body.code);
    }

    return body.data;
  },

  /**
   * Xóa người dùng (soft delete)
   * DELETE /api/v1/admin/users/{id}
   */
  async deleteUser(id: string, reason?: string): Promise<void> {
    const body = await apiClient.delete<ApiResponse<void>>(
      `/admin/users/${id}`,
      reason ? { reason } : undefined,
    );

    if (!body.success) {
      throw new ApiError(body.message ?? 'Xóa người dùng thất bại.', body.code);
    }
  },
};
