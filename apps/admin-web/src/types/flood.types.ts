export type SeverityLevel = 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';
export type FloodStatus    = 'CONFIRMED' | 'PENDING' | 'RESOLVED';

export interface ActiveFloodEvent {
  eventId:       string;
  lat:           number;
  lon:           number;
  location:      string;
  waterLevel:    number;
  severityLevel: SeverityLevel;
  status:        FloodStatus;
  updatedAt:     string | null;
}

export interface ActiveFloodsResponse {
  success:   boolean;
  code:      number;
  message:   string | null;
  data:      ActiveFloodEvent[];
  timestamp: string;
}

// ---- WebSocket: Telemetry từ cảm biến ----
export interface ProcessedSensorData {
  sensorId:   string;
  lat:        number;
  lon:        number;
  waterLevel: number;
  status:     string; // "NORMAL" | "WARNING" | "DANGER" | ...
  recordedAt: string | null;
}

// ---- WebSocket: Sự kiện vòng đời điểm ngập ----
export type FloodLifecycleType = 'CREATED' | 'ESCALATED' | 'RESOLVED';

export interface FloodLifecycleEvent {
  eventId:       string;
  type:          FloodLifecycleType;
  lat:           number;
  lon:           number;
  location:      string;
  waterLevel:    number;
  severityLevel: SeverityLevel;
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

export interface SensorMapResponse {
  success:   boolean;
  code:      number;
  message:   string | null;
  data:      SensorMapFeatureCollection;
  timestamp: string;
}

