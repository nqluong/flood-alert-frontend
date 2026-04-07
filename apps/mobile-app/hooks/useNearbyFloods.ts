import { useQuery } from '@tanstack/react-query';
import { floodService } from '../services/flood.service';
import type { FloodEvent, Viewport } from '../types/flood.types';

export function useNearbyFloods(viewport: Viewport) {
  return useQuery<FloodEvent[]>({
    queryKey: ['nearbyFloods', viewport.centerLat, viewport.centerLon, viewport.radius],
    queryFn: () => floodService.getNearbyFloods(viewport),
    refetchInterval: 30_000,
    staleTime: 10_000,
    // Giữ nguyên data cũ làm placeholder trong khi fetch viewport mới
    // → marker không biến mất, không bị nháy
    placeholderData: (prev) => prev,
  });
}
