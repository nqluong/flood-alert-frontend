import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import type { Feature, LineString } from 'geojson';
import {
  snapToRoute,
  sliceRemainingRoute,
  isOffRoute,
  hasArrived,
  isValidRouteGeoJSON,
} from '../utils/navigationHelpers';

interface NavigationTrackingOptions {
  routeGeoJSON: Feature<LineString> | null;
  destinationCoordinate: [number, number];
  onOffRoute?: () => void;
  onArrival?: () => void;
  offRouteThreshold?: number;
  offRouteCountThreshold?: number;
  arrivalThreshold?: number;
}

interface NavigationTrackingState {
  snappedCoordinate: [number, number] | null;
  rawCoordinate: [number, number] | null;
  remainingRouteGeoJSON: Feature<LineString> | null;
  progressPercent: number;
  isOffRoute: boolean;
  hasArrived: boolean;
  distanceFromRoute: number;
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
  const [snappedCoordinate, setSnappedCoordinate] = useState<[number, number] | null>(null);
  const [rawCoordinate, setRawCoordinate] = useState<[number, number] | null>(null);
  const [remainingRouteGeoJSON, setRemainingRouteGeoJSON] = useState<Feature<LineString> | null>(
    null,
  );
  const [progressPercent, setProgressPercent] = useState(0);
  const [isOffRouteState, setIsOffRouteState] = useState(false);
  const [hasArrivedState, setHasArrivedState] = useState(false);
  const [distanceFromRoute, setDistanceFromRoute] = useState(0);

  const destinationRef = useRef(destinationCoordinate);
  const onOffRouteRef = useRef(onOffRoute);
  const onArrivalRef = useRef(onArrival);

  const offRouteCounterRef = useRef(0);
  const hasNotifiedOffRouteRef = useRef(false);
  const hasNotifiedArrivalRef = useRef(false);

  useEffect(() => {
    destinationRef.current = destinationCoordinate;
  }, [destinationCoordinate]);

  useEffect(() => {
    onOffRouteRef.current = onOffRoute;
  }, [onOffRoute]);

  useEffect(() => {
    onArrivalRef.current = onArrival;
  }, [onArrival]);

  // Reset state khi route thay đổi (start nav mới hoặc reroute)
  useEffect(() => {
    if (routeGeoJSON) {
      setRemainingRouteGeoJSON(routeGeoJSON);
      setProgressPercent(0);
      setIsOffRouteState(false);
      setHasArrivedState(false);
      offRouteCounterRef.current = 0;
      hasNotifiedOffRouteRef.current = false;
      hasNotifiedArrivalRef.current = false;
    } else {
      setSnappedCoordinate(null);
      setRawCoordinate(null);
      setRemainingRouteGeoJSON(null);
      setProgressPercent(0);
      setIsOffRouteState(false);
      setDistanceFromRoute(0);
    }
  }, [routeGeoJSON]);

  // GPS Tracking — CHỈ subscribe lại khi route đổi (hoặc threshold thay đổi)
  useEffect(() => {
    if (!routeGeoJSON || !isValidRouteGeoJSON(routeGeoJSON)) {
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('[Navigation] Location permission not granted');
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 2,
          },
          (location) => {
            if (cancelled) return;

            const rawGPS: [number, number] = [
              location.coords.longitude,
              location.coords.latitude,
            ];
            setRawCoordinate(rawGPS);

            // SNAPPING - Bám đường
            const snapped = snapToRoute(rawGPS, routeGeoJSON);
            setSnappedCoordinate(snapped.snappedCoordinate);
            setDistanceFromRoute(snapped.distanceFromRoute);

            // ROUTE SLICING - Cắt đường đã đi
            const sliced = sliceRemainingRoute(
              snapped.snappedCoordinate,
              routeGeoJSON,
              destinationRef.current,
            );
            setRemainingRouteGeoJSON(sliced.remainingRoute);
            setProgressPercent(sliced.progressPercent);

            // OFF-ROUTE DETECTION
            const isCurrentlyOffRoute = isOffRoute(snapped.distanceFromRoute, offRouteThreshold);

            if (isCurrentlyOffRoute) {
              offRouteCounterRef.current += 1;
              if (
                offRouteCounterRef.current >= offRouteCountThreshold &&
                !hasNotifiedOffRouteRef.current
              ) {
                setIsOffRouteState(true);
                hasNotifiedOffRouteRef.current = true;
                onOffRouteRef.current?.();
              }
            } else if (offRouteCounterRef.current > 0) {
              offRouteCounterRef.current = 0;
              setIsOffRouteState(false);
              hasNotifiedOffRouteRef.current = false;
            }

            // ARRIVAL DETECTION
            const arrived = hasArrived(
              snapped.snappedCoordinate,
              destinationRef.current,
              arrivalThreshold,
            );
            if (arrived && !hasNotifiedArrivalRef.current) {
              setHasArrivedState(true);
              hasNotifiedArrivalRef.current = true;
              onArrivalRef.current?.();
            }
          },
        );
      } catch (error) {
        console.error('[Navigation] Tracking error:', error);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [routeGeoJSON, offRouteThreshold, offRouteCountThreshold, arrivalThreshold]);

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
