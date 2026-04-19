export type SeverityLevel = 'DANGER' | 'WARNING';

export type FloodLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReportPayload {
  lat: number;
  lon: number;
  level: FloodLevel;
  imageUrl?: string;
  description?: string;
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
