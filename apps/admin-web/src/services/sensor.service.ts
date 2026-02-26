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
import { getValidAccessToken } from './auth.service';
import { parseApiError, ApiError } from './api.helpers';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/flood-alert/api/v1';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getValidAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const sensorService = {
  async getSensors(
    filter: SensorApiFilter = {},
  ): Promise<PageResponse<SensorSummaryResponse>> {
    const params = new URLSearchParams();

    if (filter.page !== undefined) params.set('page', String(filter.page));
    if (filter.size !== undefined) params.set('size', String(filter.size));
    if (filter.status)            params.set('status', filter.status);
    if (filter.search?.trim())    params.set('search', filter.search.trim());
    if (filter.region?.trim())    params.set('region', filter.region.trim());
    if (filter.sortBy)            params.set('sortBy', filter.sortBy);
    if (filter.sortDirection)     params.set('sortDirection', filter.sortDirection);

    const res = await fetch(`${API_BASE_URL}/sensors?${params.toString()}`, {
      headers: await authHeaders(),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as SensorsApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Không thể tải danh sách cảm biến.', body.code);

    return body.data;
  },

  async createSensor(payload: CreateSensorRequest): Promise<CreateSensorResponse> {
    const res = await fetch(`${API_BASE_URL}/sensors`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as CreateSensorApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Tạo cảm biến thất bại.', body.code);

    return body.data!;
  },

  async updateSensor(id: string, payload: UpdateSensorRequest): Promise<UpdateSensorResponse> {
    const res = await fetch(`${API_BASE_URL}/sensors/${id}`, {
      method: 'PUT',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as UpdateSensorApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Cập nhật cảm biến thất bại.', body.code);

    return body.data!;
  },

  async changeSensorStatus(id: string, payload: ChangeStatusRequest): Promise<ChangeStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/sensors/${id}/status`, {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as ChangeStatusApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Chuyển trạng thái thất bại.', body.code);

    return body.data!;
  },

  async softDeleteSensor(id: string, payload: DeleteSensorRequest): Promise<DeleteSensorResponse> {
    const res = await fetch(`${API_BASE_URL}/sensors/${id}`, {
      method: 'DELETE',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as DeleteSensorApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Xóa cảm biến thất bại.', body.code);

    return body.data!;
  },

  async hardDeleteSensor(id: string, payload: DeleteSensorRequest): Promise<DeleteSensorResponse> {
    const res = await fetch(`${API_BASE_URL}/sensors/${id}/permanent`, {
      method: 'DELETE',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as DeleteSensorApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Xóa vĩnh viễn cảm biến thất bại.', body.code);

    return body.data!;
  },

  async restoreSensor(id: string): Promise<DeleteSensorResponse> {
    const res = await fetch(`${API_BASE_URL}/sensors/${id}/restore`, {
      method: 'POST',
      headers: await authHeaders(),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as DeleteSensorApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Khôi phục cảm biến thất bại.', body.code);

    return body.data!;
  },

  async getSensorById(id: string, options: { includeLogs?: boolean } = {}): Promise<SensorDetailResponse> {
    const params = options.includeLogs ? '?includeLogs=true' : '';
    const res = await fetch(`${API_BASE_URL}/sensors/${id}${params}`, {
      headers: await authHeaders(),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as SensorDetailApiResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Không thể tải chi tiết cảm biến.', body.code);

    return body.data;
  },
};
