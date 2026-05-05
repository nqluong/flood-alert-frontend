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
