import type { ApiResponse } from './api.types';

export type SensorStatus = 'active' | 'offline' | 'disabled';

export interface SensorThreshold {
  warning: number;
  danger: number;
}

export interface SensorReading {
  value: number;
  timestamp: string;
}


export interface Sensor {
  id: string;            // e.g. SENS-HN-001
  name: string;          // e.g. Ngã tư Cầu Giấy
  district: string;      // e.g. Quận Cầu Giấy, Hà Nội
  status: SensorStatus;
  lastReading: SensorReading;
  thresholds: SensorThreshold;
  coordinates: [number, number];
}


export interface SensorFilters {
  search: string;
  status: SensorApiStatus | 'all';
  region: string;
}

export type SensorApiStatus = 'ACTIVE' | 'DISABLED' | 'MAINTENANCE' | 'OFFLINE';

export interface SensorSummaryResponse {
  id: string;
  sensorId: string;
  name: string;
  locationName: string | null;
  lat: number;
  lon: number;
  status: SensorApiStatus;
  batteryLevel: number | null;
  signalStrength: number | null;
  lastHeartbeat: string | null;
  lastReadingAt: string | null;
  hardwareModel: string | null;
  firmwareVersion: string | null;
  warningThreshold: number | null;
  dangerThreshold: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  sorted: boolean;
}

export interface SensorApiFilter {
  page?: number;
  size?: number;
  status?: SensorApiStatus | '';
  search?: string;
  region?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export type SensorsApiResponse = ApiResponse<PageResponse<SensorSummaryResponse>>;

export interface CreateSensorRequest {
  sensorId: string;
  name: string;
  locationName?: string;
  lat: number;
  lon: number;
  warningThreshold: number;
  dangerThreshold: number;
  hardwareModel?: string;
  firmwareVersion?: string;
}

export interface CreateSensorResponse {
  id: string;
  sensorId: string;
  name: string;
  locationName: string | null;
  lat: number;
  lon: number;
  status: SensorApiStatus;
  apiKey: string;
  warningThreshold: number;
  dangerThreshold: number;
  hardwareModel: string | null;
  firmwareVersion: string | null;
  createdAt: string;
  message: string | null;
}

export type CreateSensorApiResponse = ApiResponse<CreateSensorResponse | null>;


export interface UpdateSensorRequest {
  name?: string;
  locationName?: string;
  lat?: number;
  lon?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
  hardwareModel?: string;
  firmwareVersion?: string;
  comment?: string;
}

export interface UpdateSensorResponse {
  id: string;
  sensorId: string;
  name: string;
  locationName: string | null;
  lat: number;
  lon: number;
  status: SensorApiStatus;
  warningThreshold: number;
  dangerThreshold: number;
  hardwareModel: string | null;
  firmwareVersion: string | null;
  updatedAt: string;
  changedFields: string[];
  message: string | null;
}

export type UpdateSensorApiResponse = ApiResponse<UpdateSensorResponse | null>;

export interface ChangeStatusRequest {
  newStatus: SensorApiStatus;
  reason: string;
  comment?: string;
}

export interface ChangeStatusResponse {
  id: string;
  sensorId: string;
  name: string;
  previousStatus: SensorApiStatus;
  currentStatus: SensorApiStatus;
  allowedNextStatuses: SensorApiStatus[];
  syncedToRedis: boolean;
  addedToBlacklist: boolean;
  message: string | null;
  changedAt: string;
}

export type ChangeStatusApiResponse = ApiResponse<ChangeStatusResponse | null>;

export interface DeleteSensorRequest {
  reason: string;
  removeFromMap?: boolean;
}

export interface DeleteSensorResponse {
  id: string;
  sensorId: string;
  deleteType: string;        // 'SOFT' | 'HARD'
  status: string;
  message: string | null;
  deletedAt: string;
  removedFromMap: boolean;
  removedFromRedis: boolean;
}

export type DeleteSensorApiResponse = ApiResponse<DeleteSensorResponse | null>;

export interface SensorLog {
  id: string;
  sensorId: string;
  action: string;         // 'CREATED' | 'STATUS_CHANGED' | 'UPDATED' | ...
  performedBy: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  comment: string | null;
  createdAt: string;
}

export interface SensorDetailResponse extends SensorSummaryResponse {
  installedAt: string | null;
  createdBy: string | null;
  logs: SensorLog[] | null;
}

export type SensorDetailApiResponse = ApiResponse<SensorDetailResponse>;
