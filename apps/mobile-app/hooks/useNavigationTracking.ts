/**
 * useNavigationTracking Hook
 * Xử lý GPS tracking thời gian thực với Snapping, Slicing, Off-route Detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import type { Feature, LineString } from 'geojson';
import {
  snapToRoute,
  sliceRemainingRoute,
  isOffRoute,
  hasArrived,
  isValidRouteGeoJSON,
  type SnappedPosition,
} from '../utils/navigationHelpers';

interface NavigationTrackingOptions {
  routeGeoJSON: Feature<LineString> | null;
  destinationCoordinate: [number, number]; // [lon, lat]
  onOffRoute?: () => void; // Callback khi đi lạc
  onArrival?: () => void; // Callback khi đến đích
  offRouteThreshold?: number; // Ngưỡng lệch đường (meters)
  offRouteCountThreshold?: number; // Số lần lệch liên tiếp để báo off-route
  arrivalThreshold?: number; // Ngưỡng đến đích (meters)
}

interface NavigationTrackingState {
  snappedCoordinate: [number, number] | null; // Tọa độ đã bám đường
  rawCoordinate: [number, number] | null; // Tọa độ GPS thô
  remainingRouteGeoJSON: Feature<LineString> | null; // Đoạn đường còn lại
  progressPercent: number; // % tiến độ
  isOffRoute: boolean; // Có đang đi lạc không
  hasArrived: boolean; // Đã đến đích chưa
  distanceFromRoute: number; // Khoảng cách từ GPS đến đường
}

export function useNavigationTracking({
  routeGeoJSON,
  destinationCoordinate,
  onOffRoute,
  onArrival,
  offRouteThreshold = 30,
  offRouteCountThreshold = 3,
  arrivalThreshold = 20,
}: NavigationTrackingOptions): NavigationTrackingState {
  // State cho UI
  const [snappedCoordinate, setSnappedCoordinate] = useState<[number, number] | null>(null);
  const [rawCoordinate, setRawCoordinate] = useState<[number, number] | null>(null);
  const [remainingRouteGeoJSON, setRemainingRouteGeoJSON] = useState<Feature<LineString> | null>(
    null,
  );
  const [progressPercent, setProgressPercent] = useState(0);
  const [isOffRouteState, setIsOffRouteState] = useState(false);
  const [hasArrivedState, setHasArrivedState] = useState(false);
  const [distanceFromRoute, setDistanceFromRoute] = useState(0);

  // Refs cho logic không cần render
  const offRouteCounterRef = useRef(0);
  const hasNotifiedOffRouteRef = useRef(false);
  const hasNotifiedArrivalRef = useRef(false);

  // Reset khi route thay đổi
  useEffect(() => {
    if (routeGeoJSON) {
      setRemainingRouteGeoJSON(routeGeoJSON);
      setProgressPercent(0);
      setIsOffRouteState(false);
      setHasArrivedState(false);
      offRouteCounterRef.current = 0;
      hasNotifiedOffRouteRef.current = false;
      hasNotifiedArrivalRef.current = false;
    }
  }, [routeGeoJSON]);

  // GPS Tracking
  useEffect(() => {
    if (!routeGeoJSON || !isValidRouteGeoJSON(routeGeoJSON)) {
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        // Kiểm tra quyền
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted');
          return;
        }

        // Lắng nghe GPS liên tục
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000, // Cập nhật mỗi 1 giây
            distanceInterval: 5, // Hoặc khi di chuyển 5 mét
          },
          (location) => {
            if (cancelled) return;

            const rawGPS: [number, number] = [
              location.coords.longitude,
              location.coords.latitude,
            ];

            setRawCoordinate(rawGPS);

            // 1. SNAPPING - Bám đường
            const snapped = snapToRoute(rawGPS, routeGeoJSON);
            setSnappedCoordinate(snapped.snappedCoordinate);
            setDistanceFromRoute(snapped.distanceFromRoute);

            // 2. ROUTE SLICING - Cắt đường đã đi
            const sliced = sliceRemainingRoute(
              snapped.snappedCoordinate,
              routeGeoJSON,
              destinationCoordinate,
            );
            setRemainingRouteGeoJSON(sliced.remainingRoute);
            setProgressPercent(sliced.progressPercent);

            // 3. OFF-ROUTE DETECTION - Phát hiện đi lạc
            const isCurrentlyOffRoute = isOffRoute(snapped.distanceFromRoute, offRouteThreshold);

            if (isCurrentlyOffRoute) {
              offRouteCounterRef.current += 1;

              // Nếu lệch liên tiếp > threshold lần
              if (
                offRouteCounterRef.current >= offRouteCountThreshold &&
                !hasNotifiedOffRouteRef.current
              ) {
                setIsOffRouteState(true);
                hasNotifiedOffRouteRef.current = true;
                onOffRoute?.();
              }
            } else {
              // Quay lại đường đúng -> reset counter
              if (offRouteCounterRef.current > 0) {
                offRouteCounterRef.current = 0;
                setIsOffRouteState(false);
                hasNotifiedOffRouteRef.current = false;
              }
            }

            // 4. ARRIVAL DETECTION - Phát hiện đến đích
            const arrived = hasArrived(
              snapped.snappedCoordinate,
              destinationCoordinate,
              arrivalThreshold,
            );

            if (arrived && !hasNotifiedArrivalRef.current) {
              setHasArrivedState(true);
              hasNotifiedArrivalRef.current = true;
              onArrival?.();
            }
          },
        );
      } catch (error) {
        console.error('Navigation tracking error:', error);
      }
    })();

    // Cleanup - QUAN TRỌNG để tránh memory leak
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [
    routeGeoJSON,
    destinationCoordinate,
    onOffRoute,
    onArrival,
    offRouteThreshold,
    offRouteCountThreshold,
    arrivalThreshold,
  ]);

  return {
    snappedCoordinate,
    rawCoordinate,
    remainingRouteGeoJSON,
    progressPercent,
    isOffRoute: isOffRouteState,
    hasArrived: hasArrivedState,
    distanceFromRoute,
  };
}
