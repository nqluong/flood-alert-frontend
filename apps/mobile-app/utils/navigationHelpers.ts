/**
 * Navigation Helpers - Turf.js utilities for GPS tracking
 * Xử lý Snapping, Slicing, Off-route Detection
 */

import * as turf from '@turf/turf';
import type { Feature, LineString, Point } from 'geojson';

export interface SnappedPosition {
  snappedCoordinate: [number, number]; // [lon, lat] đã bám đường
  rawCoordinate: [number, number]; // [lon, lat] GPS thô
  distanceFromRoute: number; // Khoảng cách từ GPS thô đến đường (meters)
}

export interface SlicedRoute {
  remainingRoute: Feature<LineString>; // Đoạn đường còn lại
  progressPercent: number; // % đã đi được
}

/**
 * 1. SNAPPING - Bám tọa độ GPS vào đường
 * Dùng turf.nearestPointOnLine để ép GPS dính chặt vào vạch đường
 */
export function snapToRoute(
  rawGPSCoordinate: [number, number], // [lon, lat]
  routeFeature: Feature<LineString>,
): SnappedPosition {
  const gpsPoint = turf.point(rawGPSCoordinate);
  const nearestPoint = turf.nearestPointOnLine(routeFeature, gpsPoint);

  // Tính khoảng cách từ GPS thô đến đường (để phát hiện đi lạc)
  const distanceFromRoute = turf.distance(gpsPoint, nearestPoint, { units: 'meters' });

  return {
    snappedCoordinate: nearestPoint.geometry.coordinates as [number, number],
    rawCoordinate: rawGPSCoordinate,
    distanceFromRoute,
  };
}

/**
 * 2. ROUTE SLICING - Cắt đường đã đi qua
 * Dùng turf.lineSlice để cắt từ vị trí hiện tại đến đích
 */
export function sliceRemainingRoute(
  snappedCoordinate: [number, number], // [lon, lat] đã bám đường
  routeFeature: Feature<LineString>,
  destinationCoordinate: [number, number], // [lon, lat] điểm đích
): SlicedRoute {
  const startPoint = turf.point(snappedCoordinate);
  const endPoint = turf.point(destinationCoordinate);

  // Cắt đoạn đường từ vị trí hiện tại đến đích
  const slicedLine = turf.lineSlice(startPoint, endPoint, routeFeature);

  // Tính % tiến độ
  const totalLength = turf.length(routeFeature, { units: 'meters' });
  const remainingLength = turf.length(slicedLine, { units: 'meters' });
  const progressPercent = ((totalLength - remainingLength) / totalLength) * 100;

  return {
    remainingRoute: slicedLine,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
  };
}

/**
 * 3. OFF-ROUTE DETECTION - Phát hiện đi lạc
 * Kiểm tra xem GPS có lệch khỏi đường quá xa không
 */
export function isOffRoute(
  distanceFromRoute: number,
  thresholdMeters: number = 30,
): boolean {
  return distanceFromRoute > thresholdMeters;
}

/**
 * 4. ARRIVAL DETECTION - Phát hiện đã đến đích
 * Kiểm tra xem user đã đến gần đích chưa
 */
export function hasArrived(
  currentCoordinate: [number, number],
  destinationCoordinate: [number, number],
  thresholdMeters: number = 20,
): boolean {
  const currentPoint = turf.point(currentCoordinate);
  const destinationPoint = turf.point(destinationCoordinate);
  const distance = turf.distance(currentPoint, destinationPoint, { units: 'meters' });
  return distance <= thresholdMeters;
}

/**
 * Validate route GeoJSON
 */
export function isValidRouteGeoJSON(geoJSON: any): geoJSON is Feature<LineString> {
  return (
    geoJSON &&
    geoJSON.type === 'Feature' &&
    geoJSON.geometry &&
    geoJSON.geometry.type === 'LineString' &&
    Array.isArray(geoJSON.geometry.coordinates) &&
    geoJSON.geometry.coordinates.length >= 2
  );
}
