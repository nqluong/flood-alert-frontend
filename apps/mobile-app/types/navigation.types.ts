/**
 * Navigation Types
 * Type definitions cho navigation tracking
 */

import type { Feature, LineString } from 'geojson';

/**
 * Vị trí đã bám đường
 */
export interface SnappedPosition {
  snappedCoordinate: [number, number]; // [lon, lat] đã bám đường
  rawCoordinate: [number, number]; // [lon, lat] GPS thô
  distanceFromRoute: number; // Khoảng cách từ GPS thô đến đường (meters)
}

/**
 * Đoạn đường đã cắt
 */
export interface SlicedRoute {
  remainingRoute: Feature<LineString>; // Đoạn đường còn lại
  progressPercent: number; // % đã đi được
}

/**
 * Trạng thái navigation
 */
export interface NavigationState {
  snappedCoordinate: [number, number] | null;
  rawCoordinate: [number, number] | null;
  remainingRouteGeoJSON: Feature<LineString> | null;
  progressPercent: number;
  isOffRoute: boolean;
  hasArrived: boolean;
  distanceFromRoute: number;
}

/**
 * Cấu hình navigation tracking
 */
export interface NavigationConfig {
  offRouteThreshold: number; // Ngưỡng lệch đường (meters)
  offRouteCountThreshold: number; // Số lần lệch liên tiếp
  arrivalThreshold: number; // Ngưỡng đến đích (meters)
  updateInterval: number; // Thời gian cập nhật GPS (ms)
  distanceInterval: number; // Khoảng cách cập nhật GPS (meters)
}

/**
 * Navigation callbacks
 */
export interface NavigationCallbacks {
  onOffRoute?: () => void;
  onArrival?: () => void;
  onProgress?: (percent: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Navigation route data
 */
export interface NavigationRoute {
  routeGeoJSON: Feature<LineString>;
  destinationCoordinate: [number, number];
  destinationName?: string;
  startCoordinate?: [number, number];
  startName?: string;
  distance?: number; // Tổng khoảng cách (meters)
  duration?: number; // Thời gian ước tính (seconds)
}

/**
 * Default navigation config
 */
export const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  offRouteThreshold: 30, // 30 mét
  offRouteCountThreshold: 3, // 3 lần
  arrivalThreshold: 20, // 20 mét
  updateInterval: 1000, // 1 giây
  distanceInterval: 5, // 5 mét
};
