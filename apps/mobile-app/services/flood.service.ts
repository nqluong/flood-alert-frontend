import { apiFetch } from './apiClient';
import type { FloodEvent, Viewport, ReportPayload } from '../types/flood.types';

export const floodService = {
  getNearbyFloods: (viewport: Viewport): Promise<FloodEvent[]> =>
    apiFetch<FloodEvent[]>(
      `/core/floods/active/nearby?lat=${viewport.centerLat}&lon=${viewport.centerLon}&radius=${viewport.radius}`,
    ),

  submitReport: (payload: ReportPayload): Promise<void> =>
    apiFetch<void>('/core/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
