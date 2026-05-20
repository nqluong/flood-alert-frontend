/**
 * useNavigationTracking Hook
 * Xử lý GPS tracking thời gian thực với Snapping, Slicing, Off-route Detection,
 * Turn-by-turn instruction (ORS steps) và phát hiện đến đích chính xác.
 */

import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as turf from '@turf/turf';
import type { Feature, LineString } from 'geojson';
import {
  snapToRoute,
  sliceRemainingRoute,
  isOffRoute,
  isValidRouteGeoJSON,
} from '../utils/navigationHelpers';

export interface RouteStep {
  distance: number; // meters
  duration: number; // seconds
  type: number; // mã loại rẽ của ORS (0..13)
  instruction: string; // text tiếng Việt
  name: string; // tên đường
  way_points: [number, number]; // [startIdx, endIdx] trong geometry.coordinates
}

interface NavigationTrackingOptions {
  routeGeoJSON: Feature<LineString> | null;
  destinationCoordinate: [number, number]; // [lon, lat]
  onOffRoute?: () => void;
  onArrival?: () => void;
  offRouteThreshold?: number;
  offRouteCountThreshold?: number;
  arrivalThreshold?: number; // bán kính raw GPS tới đích để coi là đã đến
  arrivalProgressThreshold?: number; // % tiến độ tối thiểu để được phép báo đến (chống false positive)
}

interface NavigationTrackingState {
  snappedCoordinate: [number, number] | null;
  rawCoordinate: [number, number] | null;
  remainingRouteGeoJSON: Feature<LineString> | null;
  progressPercent: number;
  isOffRoute: boolean;
  hasArrived: boolean;
  distanceFromRoute: number;
  currentStep: RouteStep | null;
  nextStep: RouteStep | null;
  distanceToNextStep: number; // mét từ vị trí hiện tại đến điểm bắt đầu step kế tiếp
  totalRemainingDistance: number; // tổng mét còn lại trên tuyến
}

function extractSteps(route: Feature<LineString> | null): RouteStep[] {
  if (!route) return [];
  const props: any = route.properties || {};
  const segments = props.segments;
  if (!Array.isArray(segments) || segments.length === 0) return [];
  // Ghép steps của tất cả segments (route 2 điểm thường có 1 segment, đa điểm có nhiều)
  return segments.flatMap((s: any) => (Array.isArray(s.steps) ? s.steps : [])) as RouteStep[];
}

export function useNavigationTracking({
  routeGeoJSON,
  destinationCoordinate,
  onOffRoute,
  onArrival,
  offRouteThreshold = 30,
  offRouteCountThreshold = 3,
  arrivalThreshold = 25,
  arrivalProgressThreshold = 95,
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
  const [currentStep, setCurrentStep] = useState<RouteStep | null>(null);
  const [nextStep, setNextStep] = useState<RouteStep | null>(null);
  const [distanceToNextStep, setDistanceToNextStep] = useState(0);
  const [totalRemainingDistance, setTotalRemainingDistance] = useState(0);

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

  // Reset state khi route đổi
  useEffect(() => {
    if (routeGeoJSON) {
      setRemainingRouteGeoJSON(routeGeoJSON);
      setProgressPercent(0);
      setIsOffRouteState(false);
      setHasArrivedState(false);
      offRouteCounterRef.current = 0;
      hasNotifiedOffRouteRef.current = false;
      hasNotifiedArrivalRef.current = false;
      // Step ban đầu = step đầu tiên (nếu có)
      const steps = extractSteps(routeGeoJSON);
      setCurrentStep(steps[0] ?? null);
      setNextStep(steps[1] ?? null);
      setDistanceToNextStep(0);
      setTotalRemainingDistance(
        turf.length(routeGeoJSON, { units: 'meters' }),
      );
    } else {
      setSnappedCoordinate(null);
      setRawCoordinate(null);
      setRemainingRouteGeoJSON(null);
      setProgressPercent(0);
      setIsOffRouteState(false);
      setDistanceFromRoute(0);
      setCurrentStep(null);
      setNextStep(null);
      setDistanceToNextStep(0);
      setTotalRemainingDistance(0);
    }
  }, [routeGeoJSON]);

  // GPS Tracking — chỉ subscribe lại khi route đổi
  useEffect(() => {
    if (!routeGeoJSON || !isValidRouteGeoJSON(routeGeoJSON)) {
      return;
    }

    const steps = extractSteps(routeGeoJSON);
    const coords = routeGeoJSON.geometry.coordinates;

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

            // SNAPPING
            const gpsPoint = turf.point(rawGPS);
            const nearest = turf.nearestPointOnLine(routeGeoJSON, gpsPoint, {
              units: 'meters',
            });
            const snappedCoord = nearest.geometry.coordinates as [number, number];
            const distFromRoute = (nearest.properties as any).dist ?? 0;
            const segmentIndex = (nearest.properties as any).index ?? 0;

            setSnappedCoordinate(snappedCoord);
            setDistanceFromRoute(distFromRoute);

            // ROUTE SLICING
            const sliced = sliceRemainingRoute(
              snappedCoord,
              routeGeoJSON,
              destinationRef.current,
            );
            setRemainingRouteGeoJSON(sliced.remainingRoute);
            setProgressPercent(sliced.progressPercent);
            setTotalRemainingDistance(
              turf.length(sliced.remainingRoute, { units: 'meters' }),
            );

            // TURN-BY-TURN STEP
            if (steps.length > 0) {
              const idx = steps.findIndex(
                (s) =>
                  segmentIndex >= s.way_points[0] && segmentIndex <= s.way_points[1],
              );
              const cur = idx >= 0 ? steps[idx] : steps[steps.length - 1];
              const nxt = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : null;
              setCurrentStep(cur ?? null);
              setNextStep(nxt);

              if (nxt && coords[nxt.way_points[0]]) {
                const maneuver = coords[nxt.way_points[0]] as [number, number];
                const dist = turf.distance(turf.point(snappedCoord), turf.point(maneuver), {
                  units: 'meters',
                });
                setDistanceToNextStep(dist);
              } else {
                setDistanceToNextStep(0);
              }
            }

            // OFF-ROUTE DETECTION
            const off = isOffRoute(distFromRoute, offRouteThreshold);
            if (off) {
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
            // Yêu cầu BA điều kiện để chống báo sớm:
            //   1) raw GPS thật sự nằm trong bán kính `arrivalThreshold` quanh đích
            //   2) progress >= `arrivalProgressThreshold`% (đã đi gần hết tuyến)
            //   3) GPS phải gần điểm cuối thực sự của route (không chỉ gần tuyến gần đích)
            const distGpsToDest = turf.distance(
              turf.point(rawGPS),
              turf.point(destinationRef.current),
              { units: 'meters' },
            );
            const endOfRoute = coords[coords.length - 1] as [number, number];
            const distGpsToRouteEnd = turf.distance(
              turf.point(rawGPS),
              turf.point(endOfRoute),
              { units: 'meters' },
            );

            const arrived =
              distGpsToDest <= arrivalThreshold &&
              distGpsToRouteEnd <= arrivalThreshold &&
              sliced.progressPercent >= arrivalProgressThreshold;

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
  }, [
    routeGeoJSON,
    offRouteThreshold,
    offRouteCountThreshold,
    arrivalThreshold,
    arrivalProgressThreshold,
  ]);

  return {
    snappedCoordinate,
    rawCoordinate,
    remainingRouteGeoJSON,
    progressPercent,
    isOffRoute: isOffRouteState,
    hasArrived: hasArrivedState,
    distanceFromRoute,
    currentStep,
    nextStep,
    distanceToNextStep,
    totalRemainingDistance,
  };
}
