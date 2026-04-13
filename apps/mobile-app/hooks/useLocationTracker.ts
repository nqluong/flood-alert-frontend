import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../services/BackgroundLocationTask';

export type LocationPermissionStatus = 
  | 'not-requested'
  | 'foreground-granted'
  | 'background-granted'
  | 'denied';

export interface UseLocationTrackerReturn {
  isTracking: boolean;
  permissionStatus: LocationPermissionStatus;
  requestPermissions: () => Promise<boolean>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
}

export function useLocationTracker(): UseLocationTrackerReturn {
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('not-requested');

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Xin quyền Foreground
      const foregroundStatus = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus.status !== 'granted') {
        setPermissionStatus('denied');
        console.warn('[LocationTracker] Foreground permission denied');
        return false;
      }

      setPermissionStatus('foreground-granted');

      // Xin quyền Background
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus.status !== 'granted') {
        console.warn('[LocationTracker] Background permission denied');
        return false;
      }

      setPermissionStatus('background-granted');
      console.log('[LocationTracker] All permissions granted');
      return true;
    } catch (error) {
      console.error('[LocationTracker] Permission request failed:', error);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      // Kiểm tra quyền trước khi start
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

      if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
        console.warn('[LocationTracker] Missing permissions, requesting...');
        const granted = await requestPermissions();
        if (!granted) return false;
      }

      // Kiểm tra xem task đã đang chạy chưa
      const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      if (!isTaskDefined) {
        console.error('[LocationTracker] Task not defined. Import BackgroundLocationTask first!');
        return false;
      }

      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isTaskRegistered) {
        console.log('[LocationTracker] Task already running');
        setIsTracking(true);
        return true;
      }

      // Start location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100, // Trigger khi di chuyển > 100m
        timeInterval: 240000,  // Heartbeat: 4 phút (240,000ms)
        foregroundService: {
          notificationTitle: 'FloodGuard đang hoạt động',
          notificationBody: 'Đang theo dõi vị trí để cảnh báo ngập lụt',
          notificationColor: '#3b82f6',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      setIsTracking(true);
      console.log('[LocationTracker] Tracking started successfully');
      return true;
    } catch (error) {
      console.error('[LocationTracker] Failed to start tracking:', error);
      return false;
    }
  }, [requestPermissions]);

  const stopTracking = useCallback(async (): Promise<void> => {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('[LocationTracker] Tracking stopped');
      }

      setIsTracking(false);
    } catch (error) {
      console.error('[LocationTracker] Failed to stop tracking:', error);
    }
  }, []);

  return {
    isTracking,
    permissionStatus,
    requestPermissions,
    startTracking,
    stopTracking,
  };
}
