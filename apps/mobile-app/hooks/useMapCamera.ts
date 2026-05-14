import { useRef, useEffect } from 'react';
import type { CameraRef } from '@maplibre/maplibre-react-native';

interface FlyToOptions {
  zoomLevel?: number;
  animationDuration?: number;
  pitch?: number;
}

export function useMapCamera() {
  const cameraRef = useRef<CameraRef>(null);
  const hasFlownToUser = useRef(false);

  const flyToLocation = (
    coordinate: [number, number],
    options: FlyToOptions = {},
  ) => {
    const { zoomLevel = 15, animationDuration = 800, pitch } = options;
    cameraRef.current?.setCamera({
      centerCoordinate: coordinate,
      zoomLevel,
      animationDuration,
      ...(pitch !== undefined && { pitch }),
    });
  };

  const flyToUserLocation = (
    userCoordinate: [number, number] | null,
    options: FlyToOptions = {},
  ) => {
    if (!userCoordinate) return;

    const { zoomLevel = 15, animationDuration = 1200 } = options;

    if (!hasFlownToUser.current) {
      hasFlownToUser.current = true;
      flyToLocation(userCoordinate, { zoomLevel, animationDuration });
    }
  };

  const resetUserLocationFlag = () => {
    hasFlownToUser.current = false;
  };

  return {
    cameraRef,
    flyToLocation,
    flyToUserLocation,
    resetUserLocationFlag,
  };
}
