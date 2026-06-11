import { locationService } from '../services/location.service';
import { storageService } from '../services/storage.service';

export const MIN_DISTANCE_METERS = 100; // Chỉ gửi khi di chuyển > 100m
export const MIN_TIME_MS = 120000; // Heartbeat: 2 phút — phải < Redis heartbeat TTL (300s) để user không bị coi là ghost

// State throttle dùng chung giữa BackgroundLocationTask và ForegroundLocationHeartbeat
// (cùng JS runtime khi app đang mở) — đảm bảo không gửi trùng request lên backend.
let lastSentLocation: { lat: number; lon: number; timestamp: number } | null = null;

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Kiểm tra có nên gửi location không: lần đầu, hoặc đủ 2 phút (heartbeat),
 * hoặc di chuyển đủ 100m.
 */
export function shouldSendLocation(lat: number, lon: number): boolean {
  const now = Date.now();

  // Lần đầu tiên → gửi
  if (!lastSentLocation) {
    return true;
  }

  // Kiểm tra thời gian (heartbeat)
  const timeDiff = now - lastSentLocation.timestamp;
  if (timeDiff >= MIN_TIME_MS) {
    console.log(`[LocationSync] Heartbeat: ${Math.round(timeDiff / 1000)}s passed`);
    return true;
  }

  // Kiểm tra khoảng cách
  const distance = calculateDistance(
    lastSentLocation.lat,
    lastSentLocation.lon,
    lat,
    lon
  );

  if (distance >= MIN_DISTANCE_METERS) {
    console.log(`[LocationSync] Distance: ${Math.round(distance)}m moved`);
    return true;
  }

  console.log(
    `[LocationSync] Skipped: ${Math.round(distance)}m, ${Math.round(timeDiff / 1000)}s`
  );
  return false;
}

export async function sendLocationToBackend(lat: number, lon: number): Promise<void> {
  try {
    await locationService.updateUserLocationBackgroundWithRefresh(lat, lon);

    console.log('[LocationSync] Location sent successfully:', { lat, lon });

    lastSentLocation = { lat, lon, timestamp: Date.now() };
  } catch (error) {
    console.error('[LocationSync] Failed to send location:', error);

    if (error instanceof Error && error.message.includes('401')) {
      console.warn('[LocationSync] Token refresh failed, user needs to re-login');
    }

    if (error instanceof Error &&
        (error.message.includes('SESSION_EXPIRED') ||
         error.message.includes('No valid access token'))) {
      console.warn('[LocationSync] Session expired, clearing tokens');
      await storageService.clearAll();
    }
  }
}
