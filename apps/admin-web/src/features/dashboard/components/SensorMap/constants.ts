import L from 'leaflet';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Droplets, Flag } from 'lucide-react';
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

const USER_REPORT_SEVERITY_LABEL: Record<string, string> = {
  LOW:      'Thấp',
  MEDIUM:   'Trung bình',
  HIGH:     'Cao',
  CRITICAL: 'Nghiêm trọng',
};

const USER_REPORT_SEVERITY_COLOR: Record<string, string> = {
  LOW:      '#22c55e',
  MEDIUM:   '#f59e0b',
  HIGH:     '#ef4444',
  CRITICAL: '#b91c1c',
};

export function getSeverityLabel(severity?: string | null): string {
  const key = (severity ?? '').toUpperCase();
  return (SEVERITY_LABEL as Record<string, string>)[key]
    ?? USER_REPORT_SEVERITY_LABEL[key]
    ?? SEVERITY_LABEL.UNKNOWN;
}

/** Trả về màu cho severity, hỗ trợ cả thang cảm biến lẫn báo cáo cộng đồng. */
export function getSeverityColor(severity?: string | null): string {
  const key = (severity ?? '').toUpperCase();
  return (SEVERITY_COLOR as Record<string, string>)[key]
    ?? USER_REPORT_SEVERITY_COLOR[key]
    ?? SEVERITY_COLOR.UNKNOWN;
}

export const SEVERITY_PRIORITY: Record<SeverityLevel, number> = {
  UNKNOWN: 0, SAFE: 1, WARNING: 2, DANGER: 3,
};

export const SEVERITY_HALO: Partial<Record<SeverityLevel, { radius: number; fillOpacity: number }>> = {
  WARNING: { radius: 50,  fillOpacity: 0.18 },
  DANGER:  { radius: 150, fillOpacity: 0.22 },
};

// Purple for community reports whose severity hasn't been confirmed yet
const USER_REPORT_COLOR = '#7c3aed';

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

// Pre-render SVG strings once to avoid repeated renderToStaticMarkup calls
const _dropletsIcon = renderToStaticMarkup(
  createElement(Droplets, { size: 15, color: '#ffffff', strokeWidth: 2 })
);
const _flagIcon = renderToStaticMarkup(
  createElement(Flag, { size: 12, color: '#ffffff', strokeWidth: 2.5 })
);

// Cache icon theo severity/status — giữ nguyên tham chiếu giữa các lần render
// để react-leaflet không gọi setIcon() (thay DOM) cho mọi marker mỗi lần re-render
const _floodIconCache      = new Map<SeverityLevel, L.DivIcon>();
const _userReportIconCache = new Map<SeverityLevel, L.DivIcon>();
const _sensorIconCache     = new Map<string, L.DivIcon>();

export function createFloodMarkerIcon(severity: SeverityLevel): L.DivIcon {
  let icon = _floodIconCache.get(severity);
  if (!icon) {
    const color = SEVERITY_COLOR[severity];
    icon = L.divIcon({
      className: '',
      html: `<div class="flood-icon" style="background:${color};border-color:${color}">${_dropletsIcon}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    _floodIconCache.set(severity, icon);
  }
  return icon;
}

export function createUserReportFloodMarkerIcon(severity: SeverityLevel): L.DivIcon {
  let icon = _userReportIconCache.get(severity);
  if (!icon) {
    // Use severity color only when confirmed; fall back to purple for unconfirmed (UNKNOWN) reports
    const color = severity !== 'UNKNOWN' ? (SEVERITY_COLOR[severity] ?? USER_REPORT_COLOR) : USER_REPORT_COLOR;
    icon = L.divIcon({
      className: '',
      html: `<div class="flood-icon flood-icon--user-report" style="--flood-color:${color}">${_flagIcon}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    _userReportIconCache.set(severity, icon);
  }
  return icon;
}

export function createSensorIcon(status: string): L.DivIcon {
  let icon = _sensorIconCache.get(status);
  if (!icon) {
    const color = STATUS_SENSOR_COLOR[status] ?? '#6b7280';
    icon = L.divIcon({
      className: '',
      html: `<span class="sensor-marker" style="background:${color};border-color:${color}"></span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    _sensorIconCache.set(status, icon);
  }
  return icon;
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
