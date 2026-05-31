import type { ApiResponse } from './api.types';

export type SeverityLevel = 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';
export type FloodStatus    = 'CONFIRMED' | 'PENDING' | 'RESOLVED';

export interface ActiveFloodEvent {
  eventId:       string;
  lat:           number;
  lon:           number;
  location:      string;
  waterLevel:    number | null;
  severityLevel: SeverityLevel;
  status:        FloodStatus;
  source?:       string;
  updatedAt:     string | null;
}

export type ActiveFloodsResponse = ApiResponse<ActiveFloodEvent[]>;

// ---- WebSocket: Telemetry từ cảm biến ----
export interface ProcessedSensorData {
  sensorId:         string;
  lat:              number;
  lon:              number;
  waterLevel:       number | null;
  battery:          number;           // % pin còn lại (0-100)
  warningThreshold: number;           // Ngưỡng cảnh báo (cm)
  dangerThreshold:  number;           // Ngưỡng nguy hiểm (cm)
  timestamp:        string;           // ISO 8601 format
  locationName:     string;           // Tên địa điểm
  status?:          string;           // Optional: "NORMAL" | "WARNING" | "DANGER"
  recordedAt?:      string | null;    // Deprecated, dùng timestamp
}

// ---- WebSocket: Sự kiện vòng đời điểm ngập ----
export type FloodLifecycleType = 'CREATED' | 'ESCALATED' | 'DE_ESCALATED' | 'RESOLVED' | 'UPDATED';
export type AlertLevel = 'CRITICAL' | 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO';

export interface FloodLifecycleEvent {
  eventId:       string;
  type:          FloodLifecycleType;
  lat:           number;
  lon:           number;
  location:      string;
  waterLevel:    number | null;
  severityLevel: SeverityLevel;
  timestamp:     string;
  alertMessage:  string;
  alertLevel:    AlertLevel;
  source?:       string;
}

export interface SensorMapItem {
  sensorId:     string;
  name:         string;
  status:       string; // "ACTIVE" | "INACTIVE" | ...
  batteryLevel: number;
  lat:          number;
  lon:          number;
}

interface SensorMapFeatureProperties {
  sensorId:     string;
  name:         string;
  status:       string;
  batteryLevel: number;
}

interface SensorMapFeature {
  type:     'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: SensorMapFeatureProperties;
}

interface SensorMapFeatureCollection {
  type:     'FeatureCollection';
  features: SensorMapFeature[];
}

export type SensorMapResponse = ApiResponse<SensorMapFeatureCollection>;

