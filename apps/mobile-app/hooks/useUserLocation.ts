import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
  coordinate: [number, number] | null;
  error: string | null;
  isRealLocation: boolean;
}

const LOCATION_TIMEOUT_MS = 15000;

export function useUserLocation(): UserLocation {
  const [coordinate, setCoordinate] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRealLocation, setIsRealLocation] = useState(false);
  const hasLocationRef = useRef(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const onLocationReceived = (coords: Location.LocationObjectCoords) => {
      if (cancelled) return;
      setCoordinate([coords.longitude, coords.latitude]);
      setError(null);
      hasLocationRef.current = true;
      setIsRealLocation(true);
      clearTimeout(timeoutId);
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('[Location] Permission status:', status);
        if (status !== 'granted') {
          console.warn('[Location] Quyền bị từ chối');
          if (!cancelled) setError('Quyền truy cập vị trí bị từ chối');
          return;
        }

        const enabled = await Location.hasServicesEnabledAsync();
        console.log('[Location] GPS services enabled:', enabled);
        if (!enabled) {
          console.warn('[Location] Dịch vụ GPS chưa bật');
          if (!cancelled) setError('Dịch vụ vị trí (GPS) chưa được bật trên thiết bị');
          return;
        }

        try {
          const last = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
          if (last && !cancelled) {
            console.log('[Location] Last known position:', {
              lat: last.coords.latitude,
              lon: last.coords.longitude,
              accuracy: last.coords.accuracy,
              age: Date.now() - last.timestamp + 'ms',
            });
            onLocationReceived(last.coords);
          } else {
            console.log('[Location] Không có last known position');
          }
        } catch (e) {
          console.warn('[Location] getLastKnownPositionAsync lỗi:', e);
        }

        timeoutId = setTimeout(() => {
          if (!cancelled && !hasLocationRef.current) {
            console.warn('[Location] Timeout sau', LOCATION_TIMEOUT_MS, 'ms — không lấy được GPS');
            setError('Không thể lấy vị trí GPS');
          }
        }, LOCATION_TIMEOUT_MS);

        // Chạy song song: getCurrentPositionAsync (nhanh) + watchPositionAsync (liên tục)
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          .then((initial) => {
            console.log('[Location] getCurrentPositionAsync thành công');
            onLocationReceived(initial.coords);
          })
          .catch((e) => {
            console.warn('[Location] getCurrentPositionAsync không khả dụng:', String(e));
          });

        console.log('[Location] Bắt đầu watchPositionAsync');
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 0,
          },
          (loc) => {
            onLocationReceived(loc.coords);
          },
        );
      } catch (e) {
        console.error('[Location] Lỗi không xác định:', e);
        if (!cancelled) setError('Không thể lấy vị trí: ' + String(e));
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      subscription?.remove();
    };
  }, []);

  return { coordinate, error, isRealLocation };
}
