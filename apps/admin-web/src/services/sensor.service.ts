import type {
  SensorApiFilter,
  SensorSummaryResponse,
  PageResponse,
  SensorsApiResponse,
  CreateSensorRequest,
  CreateSensorResponse,
  CreateSensorApiResponse,
  UpdateSensorRequest,
  UpdateSensorResponse,
  UpdateSensorApiResponse,
  ChangeStatusRequest,
  ChangeStatusResponse,
  ChangeStatusApiResponse,
  DeleteSensorRequest,
  DeleteSensorResponse,
  DeleteSensorApiResponse,
  SensorDetailResponse,
  SensorDetailApiResponse,
} from '../types/sensor.types';
import { apiClient } from './api.client';
import { ApiError } from './api.helpers';

export const sensorService = {
  async getSensors(
    filter: SensorApiFilter = {},
  ): Promise<PageResponse<SensorSummaryResponse>> {
    const params: Record<string, string | number> = {};

    if (filter.page !== undefined) params.page = filter.page;
    if (filter.size !== undefined) params.size = filter.size;
    if (filter.status) params.status = filter.status;
    if (filter.search?.trim()) params.search = filter.search.trim();
    if (filter.region?.trim()) params.region = filter.region.trim();
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortDirection) params.sortDirection = filter.sortDirection;

    const body = await apiClient.get<SensorsApiResponse>('/sensors', params);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải danh sách cảm biến.', body.code);
    }

    return body.data;
  },

  async createSensor(payload: CreateSensorRequest): Promise<CreateSensorResponse> {
    const body = await apiClient.post<CreateSensorApiResponse>('/sensors', payload);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Tạo cảm biến thất bại.', body.code);
    }

    return body.data!;
  },

  async updateSensor(id: string, payload: UpdateSensorRequest): Promise<UpdateSensorResponse> {
    const body = await apiClient.put<UpdateSensorApiResponse>(`/sensors/${id}`, payload);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Cập nhật cảm biến thất bại.', body.code);
    }

    return body.data!;
  },

  async changeSensorStatus(id: string, payload: ChangeStatusRequest): Promise<ChangeStatusResponse> {
    const body = await apiClient.patch<ChangeStatusApiResponse>(`/sensors/${id}/status`, payload);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Chuyển trạng thái thất bại.', body.code);
    }

    return body.data!;
  },

  async softDeleteSensor(id: string, payload: DeleteSensorRequest): Promise<DeleteSensorResponse> {
    const body = await apiClient.delete<DeleteSensorApiResponse>(`/sensors/${id}`, payload);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Xóa cảm biến thất bại.', body.code);
    }

    return body.data!;
  },

  async hardDeleteSensor(id: string, payload: DeleteSensorRequest): Promise<DeleteSensorResponse> {
    const body = await apiClient.delete<DeleteSensorApiResponse>(`/sensors/${id}/permanent`, payload);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Xóa vĩnh viễn cảm biến thất bại.', body.code);
    }

    return body.data!;
  },

  async restoreSensor(id: string): Promise<DeleteSensorResponse> {
    const body = await apiClient.post<DeleteSensorApiResponse>(`/sensors/${id}/restore`);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Khôi phục cảm biến thất bại.', body.code);
    }

    return body.data!;
  },

  async getSensorById(id: string, options: { includeLogs?: boolean } = {}): Promise<SensorDetailResponse> {
    const params = options.includeLogs ? { includeLogs: true } : {};
    // @ts-ignore
    const body = await apiClient.get<SensorDetailApiResponse>(`/sensors/${id}`, params);

    if (!body.success) {
      throw new ApiError(body.message ?? 'Không thể tải chi tiết cảm biến.', body.code);
    }

    return body.data;
  },
};
