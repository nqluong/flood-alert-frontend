import { useState, useCallback } from 'react';
import type { GeocodingResult } from '../services/geocoding.service';

export function useSearchLocation() {
  const [searchedLocation, setSearchedLocation] = useState<{
    coordinate: [number, number];
    name: string;
  } | null>(null);

  const handleSelectLocation = useCallback((result: GeocodingResult) => {
    setSearchedLocation({
      coordinate: result.center,
      name: result.place_name,
    });
  }, []);

  const clearSearchedLocation = useCallback(() => {
    setSearchedLocation(null);
  }, []);

  return {
    searchedLocation,
    handleSelectLocation,
    clearSearchedLocation,
  };
}
