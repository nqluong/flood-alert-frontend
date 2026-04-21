import { useMemo, useCallback, useState } from 'react';
import type { OnPressEvent } from '@maplibre/maplibre-react-native';
import type { FloodEvent } from '../types/flood.types';

export function useFloodMarkers(floods: FloodEvent[]) {
  const [selectedFlood, setSelectedFlood] = useState<FloodEvent | null>(null);

  const floodsGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: 'FeatureCollection',
      features: floods.map((flood) => ({
        type: 'Feature',
        id: flood.eventId,
        geometry: { type: 'Point', coordinates: [flood.lon, flood.lat] },
        properties: { ...flood },
      })),
    }),
    [floods],
  );

  const handleFloodPress = useCallback(
    (e: OnPressEvent) => {
      const eventId = e.features[0]?.properties?.eventId as string | undefined;
      if (!eventId) return;
      setSelectedFlood(floods.find((f) => f.eventId === eventId) ?? null);
    },
    [floods],
  );

  const clearSelectedFlood = useCallback(() => {
    setSelectedFlood(null);
  }, []);

  return {
    floodsGeoJSON,
    selectedFlood,
    handleFloodPress,
    clearSelectedFlood,
  };
}
