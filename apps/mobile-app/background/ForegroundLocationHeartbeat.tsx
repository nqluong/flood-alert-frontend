import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { storageService } from '../services/storage.service';
import { shouldSendLocation, sendLocationToBackend, MIN_TIME_MS } from './locationSync';

const HEARTBEAT_INTERVAL_MS = MIN_TIME_MS; // 2 phút — giữ heartbeat Redis (TTL 300s) luôn sống khi user đang dùng app

/**
 * Giữ user ở trạng thái "active" với backend kể cả khi đứng yên:
 * BackgroundLocationTask chỉ được OS gọi khi di chuyển đủ distanceInterval (100m),
 * nên user mở app nhưng không di chuyển sẽ bị rớt heartbeat sau 300s và không còn
 * nhận thông báo ngập theo vị trí hiện tại. Component này gửi vị trí định kỳ khi
 * app đang foreground, dùng chung throttle với background task nên không gửi trùng.
 */
export function ForegroundLocationHeartbeat() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sendHeartbeat = async () => {
      try {
        const token = await storageService.getAccessToken();
        if (!token || cancelled) return;

        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;

        // Ưu tiên last known position (không bật GPS → không tốn pin);
        // chỉ fallback sang getCurrentPositionAsync khi cache quá cũ.
        let coords = (await Location.getLastKnownPositionAsync({ maxAge: HEARTBEAT_INTERVAL_MS }))
          ?.coords ?? null;
        if (!coords) {
          coords = (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })).coords;
        }
        if (cancelled || !coords) return;

        if (shouldSendLocation(coords.latitude, coords.longitude)) {
          await sendLocationToBackend(coords.latitude, coords.longitude);
        }
      } catch (error) {
        console.warn('[ForegroundHeartbeat] Failed to send heartbeat:', error);
      }
    };

    const start = () => {
      if (intervalRef.current) return;
      // Gửi ngay khi app trở thành active — heartbeat có thể đã hết hạn lúc ở background
      sendHeartbeat();
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (AppState.currentState === 'active') {
      start();
    }

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        start();
      } else {
        stop();
      }
    });

    return () => {
      cancelled = true;
      stop();
      subscription.remove();
    };
  }, []);

  return null;
}
