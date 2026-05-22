import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { floodService } from '../services/flood.service';
import type { FloodEvent, Viewport } from '../types/flood.types';

export function useNearbyFloods(viewport: Viewport) {
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  return useQuery<FloodEvent[]>({
    queryKey: ['nearbyFloods', viewport.centerLat, viewport.centerLon, viewport.radius],
    queryFn: () => floodService.getNearbyFloods(viewport),
    refetchInterval: isFocused ? 30_000 : false,
    staleTime: 10_000,
    // Giữ nguyên data cũ làm placeholder trong khi fetch viewport mới
    // → marker không biến mất, không bị nháy
    placeholderData: (prev) => prev,
  });
}
