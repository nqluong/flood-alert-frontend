
import { useEffect, type RefObject } from 'react';
import * as turf from '@turf/turf';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import type { Feature, LineString } from 'geojson';

import type { CameraMode } from '../components/home/navigation/CameraModeButton';

interface Options {
  cameraRef: RefObject<CameraRef>;
  isNavigating: boolean;
  cameraMode: CameraMode;
  snappedCoordinate: [number, number] | null;
  rawCoordinate: [number, number] | null;
  userCoordinate: [number, number] | null;
  isOffRoute: boolean;
  remainingRouteGeoJSON: Feature<LineString> | null;
}

export function useNavigationCamera({
  cameraRef,
  isNavigating,
  cameraMode,
  snappedCoordinate,
  rawCoordinate,
  userCoordinate,
  isOffRoute,
  remainingRouteGeoJSON,
}: Options) {
  useEffect(() => {
    if (!isNavigating || !cameraRef.current) return;

    if (cameraMode === 'overview') {
      const userPoint = rawCoordinate || snappedCoordinate || userCoordinate;
      try {
        if (remainingRouteGeoJSON) {
          const fc: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [
              remainingRouteGeoJSON,
              ...(userPoint
                ? ([
                    {
                      type: 'Feature',
                      properties: {},
                      geometry: { type: 'Point', coordinates: userPoint },
                    },
                  ] as GeoJSON.Feature[])
                : []),
            ],
          };
          const [minLon, minLat, maxLon, maxLat] = turf.bbox(fc);
          cameraRef.current.setCamera({
            bounds: {
              ne: [maxLon, maxLat],
              sw: [minLon, minLat],
              paddingTop: 200,
              paddingBottom: 240,
              paddingLeft: 60,
              paddingRight: 60,
            },
            pitch: 0,
            animationDuration: 600,
          });
        } else if (userPoint) {
          cameraRef.current.setCamera({
            centerCoordinate: userPoint,
            zoomLevel: 15,
            pitch: 0,
            animationDuration: 600,
          });
        }
      } catch (e) {
        console.warn('[Camera] Overview fitBounds error:', e);
      }
      return;
    }

    const followCoord = isOffRoute
      ? rawCoordinate || snappedCoordinate || userCoordinate
      : snappedCoordinate || userCoordinate;
    if (!followCoord) return;

    cameraRef.current.setCamera({
      centerCoordinate: followCoord,
      zoomLevel: 17,
      pitch: cameraMode === 'follow_3d' ? 60 : 0,
      animationDuration: 500,
    });
  }, [
    cameraRef,
    isNavigating,
    cameraMode,
    snappedCoordinate,
    rawCoordinate,
    userCoordinate,
    isOffRoute,
    remainingRouteGeoJSON,
  ]);
}
