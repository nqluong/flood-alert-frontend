import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { getBaseUrl } from './apiClient';
import { storageService } from './storage.service';

export const LOCATION_TASK_NAME = 'background-location-task';

type BackgroundLocationTaskData = {
  locations?: Location.LocationObject[];
};

let lastSentLocation: { lat: number; lon: number; timestamp: number } | null = null;

const MIN_DISTANCE_METERS = 100; // Chỉ gửi khi di chuyển > 100m
const MIN_TIME_MS = 240000; // Hoặc sau 4 phút (heartbeat)


/**
 * Tính khoảng cách giữa 2 điểm (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Bán kính Trái Đất (mét)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách (mét)
}

/**
 * Kiểm tra có nên gửi location không
 */
function shouldSendLocation(lat: number, lon: number): boolean {
  const now = Date.now();

  // Lần đầu tiên → gửi
  if (!lastSentLocation) {
    return true;
  }

  // Kiểm tra thời gian (heartbeat)
  const timeDiff = now - lastSentLocation.timestamp;
  if (timeDiff >= MIN_TIME_MS) {
    console.log(`[BackgroundLocation] Heartbeat: ${Math.round(timeDiff / 1000)}s passed`);
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
    console.log(`[BackgroundLocation] Distance: ${Math.round(distance)}m moved`);
    return true;
  }

  console.log(
    `[BackgroundLocation] Skipped: ${Math.round(distance)}m, ${Math.round(timeDiff / 1000)}s`
  );
  return false;
}

async function sendLocationToBackend(lat: number, lon: number): Promise<void> {
  try {
    const token = await storageService.getAccessToken();
    
    if (!token) {
      console.warn('[BackgroundLocation] No access token found, skipping API call');
      return;
    }

    const url = `${getBaseUrl()}/users/location`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lon }),
    });

    if (!response.ok) {
      console.error('[BackgroundLocation] API error:', response.status);
    } else {
      console.log('[BackgroundLocation] Location sent successfully:', { lat, lon });
      
      // Cập nhật cache
      lastSentLocation = { lat, lon, timestamp: Date.now() };
    }
  } catch (error) {
    console.error('[BackgroundLocation] Failed to send location:', error);
  }
}

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<BackgroundLocationTaskData>) => {
    if (error) {
      console.error('[BackgroundLocation] Task error:', error);
      return;
    }

    if (data) {
      const { locations } = data;
      
      if (locations && locations.length > 0) {
        const latestLocation = locations[locations.length - 1];
        const { latitude, longitude } = latestLocation.coords;
        
        console.log('[BackgroundLocation] New location received:', {
          lat: latitude,
          lon: longitude,
          timestamp: new Date(latestLocation.timestamp).toISOString(),
        });

        // Kiểm tra điều kiện trước khi gửi
        if (shouldSendLocation(latitude, longitude)) {
          await sendLocationToBackend(latitude, longitude);
        }
      }
    }
  }
);
