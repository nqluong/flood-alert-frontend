import type { Ionicons } from '@expo/vector-icons';
import type { UserAddressResponse } from '../../types/address.types';


/** Khoảng cách Haversine (mét) giữa 2 toạ độ. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // bán kính Trái Đất (mét)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function findNearestAddress(
  addresses: UserAddressResponse[],
  floodLat: number,
  floodLon: number,
): UserAddressResponse | null {
  if (!addresses || addresses.length === 0) return null;
  return addresses.reduce((nearest, addr) => {
    const dNearest = haversineMeters(nearest.lat, nearest.lon, floodLat, floodLon);
    const dAddr = haversineMeters(addr.lat, addr.lon, floodLat, floodLon);
    return dAddr < dNearest ? addr : nearest;
  });
}

// ─── Geographic circle ────────────────────────────────────────────────────────

export function createRadiusCircle(
  centerLon: number,
  centerLat: number,
  radiusMeters: number,
  numPoints = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const dlat = (radiusMeters / 111320) * Math.cos(angle);
    const dlon =
      (radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180))) *
      Math.sin(angle);
    coords.push([centerLon + dlon, centerLat + dlat]);
  }
  coords.push(coords[0]);
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

// ─── Camera bounds ────────────────────────────────────────────────────────────

export function getBounds(
  homeLat: number,
  homeLon: number,
  floodLat: number,
  floodLon: number,
  radiusMeters: number,
) {
  const padDeg = (radiusMeters / 111320) * 1.5;
  return {
    ne: [
      Math.max(homeLon, floodLon) + padDeg,
      Math.max(homeLat, floodLat) + padDeg,
    ] as [number, number],
    sw: [
      Math.min(homeLon, floodLon) - padDeg,
      Math.min(homeLat, floodLat) - padDeg,
    ] as [number, number],
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 40,
    paddingRight: 40,
  };
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

export function getSeverityColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'DANGER':  return '#e53935';
    case 'WARNING': return '#fb8c00';
    default:        return '#43a047';
  }
}

export function getSeverityLabel(level: string): string {
  switch (level?.toUpperCase()) {
    case 'DANGER':  return 'Nguy hiểm';
    case 'WARNING': return 'Cảnh báo';
    default:        return level ?? '';
  }
}

export function getSeverityIcon(
  level: string,
): React.ComponentProps<typeof Ionicons>['name'] {
  switch (level?.toUpperCase()) {
    case 'DANGER':  return 'alert-circle';
    case 'WARNING': return 'warning';
    default:        return 'checkmark-circle';
  }
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

// ─── Distance formatting ──────────────────────────────────────────────────────

export function formatMeters(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`
    : `${meters.toFixed(0)} m`;
}
