import type {
  UserReportApiResponse,
  ReportFilterRequest,
  PageResponse,
  ApiResponse,
} from '../features/reports/reports.types';
import { apiClient } from './api.client';
import { ApiError } from './api.helpers';

export const reportService = {
  /**
   * Lấy tất cả báo cáo (Admin)
   * GET /api/v1/reports/admin
   */
  async getAllReports(
    filter: ReportFilterRequest = {},
  ): Promise<PageResponse<UserReportApiResponse>> {
    const params: Record<string, string | number> = {};

    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;
    if (filter.status) params.status = filter.status;
    if (filter.severityLevel) params.severityLevel = filter.severityLevel;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortDirection) params.sortDirection = filter.sortDirection;

    const body = await apiClient.get<ApiResponse<PageResponse<UserReportApiResponse>>>(
      '/reports/admin',
      params,
    );

    if (!body.success) {
      throw new ApiError(
        body.message ?? 'Không thể tải danh sách báo cáo.',
        body.code,
      );
    }

    return body.data;
  },

  /**
   * Lấy báo cáo của một user cụ thể (Admin)
   * GET /api/v1/reports/admin/users/{userId}
   */
  async getReportsByUser(
    userId: string,
    filter: ReportFilterRequest = {},
  ): Promise<PageResponse<UserReportApiResponse>> {
    const params: Record<string, string | number> = {};

    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;
    if (filter.status) params.status = filter.status;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortDirection) params.sortDirection = filter.sortDirection;

    const body = await apiClient.get<ApiResponse<PageResponse<UserReportApiResponse>>>(
      `/reports/admin/users/${userId}`,
      params,
    );

    if (!body.success) {
      throw new ApiError(
        body.message ?? 'Không thể tải báo cáo của người dùng.',
        body.code,
      );
    }

    return body.data;
  },

  /**
   * Phê duyệt flood event (tạo flood event từ report)
   * POST /api/v1/admin/floods/{eventId}/approve
   */
  async approveFloodEvent(eventId: string): Promise<void> {
    const body = await apiClient.post<ApiResponse<void>>(
      `/admin/floods/${eventId}/approve`,
    );

    if (!body.success) {
      throw new ApiError(body.message ?? 'Phê duyệt flood event thất bại.', body.code);
    }
  },

  /**
   * Từ chối flood event
   * POST /api/v1/admin/floods/{eventId}/reject
   */
  async rejectFloodEvent(eventId: string): Promise<void> {
    const body = await apiClient.post<ApiResponse<void>>(
      `/admin/floods/${eventId}/reject`,
    );

    if (!body.success) {
      throw new ApiError(body.message ?? 'Từ chối flood event thất bại.', body.code);
    }
  },
};
