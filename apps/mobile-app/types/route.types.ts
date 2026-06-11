/**
 * Route Types
 */

export type VehicleType = 'MOTORBIKE' | 'CAR';

export interface SafeRouteRequest {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  vehicleType: VehicleType;
}

export interface SafeRouteResponse {
  geoJson: string; // GeoJSON string from OpenRouteService
  avoidedFloodsCount: number;
  message: string;
}

/**
 * Mã lỗi routing trả về từ backend (CoreErrorCode) khi không tìm được đường đi an toàn.
 */
export const ROUTE_ERROR_CODE = {
  ROUTE_NOT_FOUND: 4014,
  ROUTE_POINT_NOT_FOUND: 4015,
  ROUTE_POINT_NOT_ACCESSIBLE: 4016,
} as const;

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteState {
  start: RouteCoordinate | null;
  end: RouteCoordinate | null;
  vehicleType: VehicleType;
}
