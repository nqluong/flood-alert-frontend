import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { shouldSendLocation, sendLocationToBackend } from './locationSync';

export const LOCATION_TASK_NAME = 'background-location-task';

type BackgroundLocationTaskData = {
  locations?: Location.LocationObject[];
};

// Lưu ý: task này chỉ được OS gọi khi thiết bị di chuyển đủ distanceInterval.
// User đứng yên (app foreground) được cover bởi ForegroundLocationHeartbeat.
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
