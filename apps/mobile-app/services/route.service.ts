import { apiFetch } from './apiClient';
import type { SafeRouteRequest, SafeRouteResponse } from '../types/route.types';

/**
 * Route Service
 * API để tìm đường đi an toàn tránh ngập lụt
 */
export const routeService = {
  /**
   * Tìm đường đi an toàn từ điểm A đến điểm B
   * Tránh các điểm ngập nặng
   */
  findSafeRoute: async (request: SafeRouteRequest): Promise<SafeRouteResponse> => {
    const params = new URLSearchParams({
      startLat: request.startLat.toString(),
      startLon: request.startLon.toString(),
      endLat: request.endLat.toString(),
      endLon: request.endLon.toString(),
      vehicleType: request.vehicleType,
    });

    return apiFetch<SafeRouteResponse>(`/core/routes/safe-path?${params.toString()}`);
  },
};
