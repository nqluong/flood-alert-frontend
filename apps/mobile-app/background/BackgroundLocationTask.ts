import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { locationService } from '../services/location.service';
import { storageService } from '../services/storage.service';

export const LOCATION_TASK_NAME = 'background-location-task';

type BackgroundLocationTaskData = {
  locations?: Location.LocationObject[];
};

let lastSentLocation: { lat: number; lon: number; timestamp: number } | null = null;

const MIN_DISTANCE_METERS = 100; // Chỉ gửi khi di chuyển > 100m
const MIN_TIME_MS = 240000;


function calculateDistance(
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
    await locationService.updateUserLocationBackgroundWithRefresh(lat, lon);
    
    console.log('[BackgroundLocation] Location sent successfully:', { lat, lon });
    
    lastSentLocation = { lat, lon, timestamp: Date.now() };
  } catch (error) {
    console.error('[BackgroundLocation] Failed to send location:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      console.warn('[BackgroundLocation] Token refresh failed, user needs to re-login');
    }
    
    if (error instanceof Error && 
        (error.message.includes('SESSION_EXPIRED') || 
         error.message.includes('No valid access token'))) {
      console.warn('[BackgroundLocation] Session expired, clearing tokens');
      await storageService.clearAll();
    }
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

        if (shouldSendLocation(latitude, longitude)) {
          await sendLocationToBackend(latitude, longitude);
        }
      }
    }
  }
);
