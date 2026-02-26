import type { ActiveFloodEvent, ActiveFloodsResponse, SensorMapItem, SensorMapResponse } from '../types/flood.types';
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

export const floodService = {
  async getActiveFloods(): Promise<ActiveFloodEvent[]> {
    const res = await fetch(`${API_BASE_URL}/admin/floods/active`, {
      headers: await authHeaders(),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as ActiveFloodsResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Không thể tải dữ liệu lũ lụt.', body.code);

    return body.data;
  },

  async getSensorsMap(): Promise<SensorMapItem[]> {
    const res = await fetch(`${API_BASE_URL}/sensors/map`, {
      headers: await authHeaders(),
    });

    if (!res.ok) await parseApiError(res);

    const body = (await res.json()) as SensorMapResponse;

    if (!body.success) throw new ApiError(body.message ?? 'Không thể tải bản đồ cảm biến.', body.code);

    // Chuyển GeoJSON features thành SensorMapItem (đảo lon/lat thành lat/lon)
    return body.data.features.map((f) => ({
      sensorId:     f.properties.sensorId,
      name:         f.properties.name,
      status:       f.properties.status,
      batteryLevel: f.properties.batteryLevel,
      lat:          f.geometry.coordinates[1],
      lon:          f.geometry.coordinates[0],
    }));
  },
};
