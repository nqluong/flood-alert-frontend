// ---- Enums / Literals ----

export type SensorStatus = 'active' | 'offline' | 'disabled';

// ---- Sub-models ----

export interface SensorThreshold {
  /** Cảnh báo level (cm) */
  warning: number;
  /** Nguy cấp level (cm) */
  danger: number;
}

export interface SensorReading {
  /** Water level in cm */
  value: number;
  /** Human-readable relative time, e.g. "2 phút trước" */
  timestamp: string;
}

// ---- Core model ----

export interface Sensor {
  id: string;            // e.g. SENS-HN-001
  name: string;          // e.g. Ngã tư Cầu Giấy
  district: string;      // e.g. Quận Cầu Giấy, Hà Nội
  status: SensorStatus;
  lastReading: SensorReading;
  thresholds: SensorThreshold;
  /** Latitude/longitude for map rendering */
  coordinates: [number, number];
}

// ---- Filter shape ----

export interface SensorFilters {
  search: string;
  status: SensorStatus | 'all';
  district: string | 'all';
}
