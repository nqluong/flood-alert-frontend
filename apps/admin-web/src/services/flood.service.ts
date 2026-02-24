import type { ActiveFloodEvent, ActiveFloodsResponse } from '../types/flood.types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/flood-alert/api/v1';

function getAccessToken(): string | null {
  return localStorage.getItem('fg_access_token');
}

export const floodService = {
  async getActiveFloods(): Promise<ActiveFloodEvent[]> {
    const token = getAccessToken();

    const res = await fetch(`${API_BASE_URL}/admin/floods/active`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`Lỗi tải dữ liệu lũ lụt: ${res.status}`);
    }

    const body = (await res.json()) as ActiveFloodsResponse;

    if (!body.success) {
      throw new Error(body.message ?? 'Không thể tải dữ liệu lũ lụt.');
    }

    return body.data;
  },
};
