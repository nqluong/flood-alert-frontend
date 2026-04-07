export type SeverityLevel = 'DANGER' | 'WARNING';

export type FloodLevel = 'ankle' | 'half_wheel' | 'engine_off';

export interface ReportPayload {
  lat: number;
  lon: number;
  severityLevel: FloodLevel;
  imageUrl?: string;
}

export interface FloodEvent {
  eventId: string;
  lat: number;
  lon: number;
  severityLevel: SeverityLevel;
  waterLevel: number;
  location: string;
  updatedAt: string;
}

export interface Viewport {
  centerLat: number;
  centerLon: number;
  radius: number;
}
