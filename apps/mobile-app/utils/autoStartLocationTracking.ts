
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../services/BackgroundLocationTask';

export async function autoStartLocationTracking(): Promise<boolean> {
  try {
    console.log('[AutoStart] Checking location tracking...');

    // Kiểm tra quyền
    const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();

    if (fgStatus !== 'granted' || bgStatus !== 'granted') {
      console.log('[AutoStart] Permissions not granted, skipping auto-start');
      return false;
    }

    // Kiểm tra task đã chạy chưa
    const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRunning) {
      console.log('[AutoStart] Already running');
      return true;
    }

    // Start tracking
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 100,
      timeInterval: 240000,
      foregroundService: {
        notificationTitle: 'FloodGuard đang hoạt động',
        notificationBody: 'Đang theo dõi vị trí để cảnh báo ngập lụt',
        notificationColor: '#009688',
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });

    console.log('[AutoStart] Location tracking started successfully');
    return true;
  } catch (error) {
    console.error('[AutoStart] Failed to start tracking:', error);
    return false;
  }
}
