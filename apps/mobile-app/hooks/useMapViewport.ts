import { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import type { Viewport } from '../types/flood.types';

const DEFAULT_VIEWPORT: Viewport = {
  centerLat: 21.0278,
  centerLon: 105.8342,
  radius: 5,
};

export function useMapViewport() {
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);

  const debouncedSetViewport = useRef(
    debounce((v: Viewport) => setViewport(v), 500),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSetViewport.cancel();
    };
  }, [debouncedSetViewport]);

  const onRegionDidChange = useCallback(
    (feature: GeoJSON.Feature) => {
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      if (coords) {
        debouncedSetViewport({
          centerLon: coords[0],
          centerLat: coords[1],
          radius: viewport.radius,
        });
      }
    },
    [debouncedSetViewport, viewport.radius],
  );

  return {
    viewport,
    onRegionDidChange,
  };
}
