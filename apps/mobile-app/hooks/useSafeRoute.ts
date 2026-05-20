import { useState, useCallback } from 'react';
import { routeService } from '../services/route.service';
import type { SafeRouteRequest, SafeRouteResponse, VehicleType } from '../types/route.types';

interface UseSafeRouteReturn {
  routeGeoJSON: GeoJSON.FeatureCollection | null;
  isLoading: boolean;
  error: string | null;
  avoidedFloodsCount: number;
  message: string | null;
  findRoute: (request: SafeRouteRequest) => Promise<void>;
  clearRoute: () => void;
}

/**
 * Hook để tìm đường đi an toàn
 */
export function useSafeRoute(): UseSafeRouteReturn {
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avoidedFloodsCount, setAvoidedFloodsCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const findRoute = useCallback(async (request: SafeRouteRequest) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('[SafeRoute] Finding route:', request);
      
      const response = await routeService.findSafeRoute(request);
      
      console.log('[SafeRoute] Response:', response);
      
      // Backend trả về geoJson có thể là string hoặc object
      let geoJSON: GeoJSON.FeatureCollection;
      
      if (typeof response.geoJson === 'string') {
        // Nếu là string, parse nó
        geoJSON = JSON.parse(response.geoJson) as GeoJSON.FeatureCollection;
      } else {
        // Nếu đã là object, dùng trực tiếp
        geoJSON = response.geoJson as any;
      }
      
      setRouteGeoJSON(geoJSON);
      setAvoidedFloodsCount(response.avoidedFloodsCount || 0);
      setMessage(response.message || 'Đã tìm thấy đường đi');
      
      console.log('[SafeRoute] Route found, avoided floods:', response.avoidedFloodsCount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tìm đường đi';
      setError(errorMessage);
      console.error('[SafeRoute] Error finding route:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRouteGeoJSON(null);
    setError(null);
    setMessage(null);
    setAvoidedFloodsCount(0);
  }, []);

  return {
    routeGeoJSON,
    isLoading,
    error,
    avoidedFloodsCount,
    message,
    findRoute,
    clearRoute
  };
}
