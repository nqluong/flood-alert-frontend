import L from 'leaflet';
import type { SeverityLevel } from '../../../../types/flood.types';

// ---- Severity ----

export const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  SAFE:    '#22c55e',
  WARNING: '#f59e0b',
  DANGER:  '#ef4444',
  UNKNOWN: '#6b7280',
};

export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  SAFE:    'Bình thường',
  WARNING: 'Cảnh báo',
  DANGER:  'Nguy hiểm',
  UNKNOWN: 'Không xác định',
};

export const SEVERITY_PRIORITY: Record<SeverityLevel, number> = {
  UNKNOWN: 0, SAFE: 1, WARNING: 2, DANGER: 3,
};

export const SEVERITY_HALO: Partial<Record<SeverityLevel, { radius: number; fillOpacity: number }>> = {
  WARNING: { radius: 50,  fillOpacity: 0.18 },
  DANGER:  { radius: 150, fillOpacity: 0.22 },
};

// ---- Sensor status ----

export const STATUS_SENSOR_COLOR: Record<string, string> = {
  NORMAL:   '#22c55e',
  ACTIVE:   '#22c55e',
  WARNING:  '#f59e0b',
  DANGER:   '#ef4444',
  INACTIVE: '#6b7280',
};

export const SENSOR_STATUS_LABEL: Record<string, string> = {
  ACTIVE:      'Hoạt động',
  NORMAL:      'Hoạt động',
  OFFLINE:     'Ngoại tuyến',
  INACTIVE:    'Không hoạt động',
  DISABLED:    'Vô hiệu hóa',
  MAINTENANCE: 'Bảo trì',
  WARNING:     'Cảnh báo',
  DANGER:      'Nguy hiểm',
  DELETED:     'Đã xóa',
};

export const SENSOR_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:      { bg: '#dcfce7', color: '#15803d' },
  NORMAL:      { bg: '#dcfce7', color: '#15803d' },
  WARNING:     { bg: '#fef9c3', color: '#92400e' },
  DANGER:      { bg: '#fee2e2', color: '#b91c1c' },
  OFFLINE:     { bg: '#f3f4f6', color: '#4b5563' },
  INACTIVE:    { bg: '#f3f4f6', color: '#4b5563' },
  DISABLED:    { bg: '#fef3c7', color: '#b45309' },
  MAINTENANCE: { bg: '#dbeafe', color: '#1d4ed8' },
  DELETED:     { bg: '#fce7f3', color: '#9d174d' },
};

// ---- Icon factories ----

export function createFloodMarkerIcon(severity: SeverityLevel): L.DivIcon {
  const color = SEVERITY_COLOR[severity];
  return L.divIcon({
    className: '',
    html: `<span class="flood-marker" style="background:${color};border-color:${color}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function createSensorIcon(status: string): L.DivIcon {
  const color = STATUS_SENSOR_COLOR[status] ?? '#6b7280';
  return L.divIcon({
    className: '',
    html: `<span class="sensor-marker" style="background:${color};border-color:${color}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function createSensorClusterIcon(cluster: any): L.DivIcon {
  const count: number = cluster.getChildCount();
  return L.divIcon({
    className: '',
    html: `<span class="sensor-cluster">${count}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function createClusterIcon(cluster: any): L.DivIcon {
  const children: any[] = cluster.getAllChildMarkers();
  let maxPriority = 0;
  let maxSeverity: SeverityLevel = 'SAFE';
  for (const m of children) {
    const sev = (m.options?.alt ?? 'SAFE') as SeverityLevel;
    if (SEVERITY_PRIORITY[sev] > maxPriority) {
      maxPriority = SEVERITY_PRIORITY[sev];
      maxSeverity = sev;
    }
  }
  const color = SEVERITY_COLOR[maxSeverity];
  const count: number = cluster.getChildCount();
  return L.divIcon({
    className: '',
    html: `<span class="flood-cluster" style="background:${color};border-color:${color}">${count}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// ---- Shared action type ----

export type ActionType = 'view' | 'edit' | 'status' | 'delete' | 'restore';
