import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as Device from 'expo-device';

interface UserLocation {
  coordinate: [number, number] | null; // [longitude, latitude]
  error: string | null;
}

const FALLBACK_LOCATION: [number, number] = [105.8342, 21.0278];

export function useUserLocation(): UserLocation {
  const [coordinate, setCoordinate] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLocationRef = useRef(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setError('Quyền truy cập vị trí bị từ chối');
            setCoordinate(FALLBACK_LOCATION);
          }
          return;
        }

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          if (!cancelled) {
            setError('Dịch vụ vị trí (GPS) chưa được bật trên thiết bị');
            setCoordinate(FALLBACK_LOCATION);
          }
          return;
        }

        const isEmulator = !Device.isDevice;
        const timeout = isEmulator ? 3000 : 8000; // Emulator timeout ngắn hơn

        try {
          const last = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
          if (last && !cancelled) {
            setCoordinate([last.coords.longitude, last.coords.latitude]);
            hasLocationRef.current = true;
            setError(null);
          }
        } catch (lastError) {
          console.log('getLastKnownPositionAsync failed:', lastError);
        }

        // Set timeout để fallback nếu không lấy được vị trí
        timeoutId = setTimeout(() => {
          if (!cancelled && !hasLocationRef.current) {
            setCoordinate(FALLBACK_LOCATION);
            setError(isEmulator ? 'Sử dụng vị trí mặc định (Emulator)' : 'Không thể lấy vị trí GPS');
          }
        }, timeout);

        try {
          const initial = await Location.getCurrentPositionAsync({
            accuracy: isEmulator ? Location.Accuracy.Low : Location.Accuracy.Balanced,
          });
          if (!cancelled) {
            setCoordinate([initial.coords.longitude, initial.coords.latitude]);
            setError(null);
            hasLocationRef.current = true;
            clearTimeout(timeoutId);

            if (!isEmulator) {
              subscription = await Location.watchPositionAsync(
                {
                  accuracy: Location.Accuracy.Balanced,
                  timeInterval: 5000,
                  distanceInterval: 10,
                },
                (loc) => {
                  if (!cancelled) {
                    setCoordinate([loc.coords.longitude, loc.coords.latitude]);
                  }
                },
              );
            }
          }
        } catch (getCurrentError) {
          // Nếu không lấy được vị trí hiện tại và chưa có last known position
          if (!cancelled && !hasLocationRef.current) {
            setCoordinate(FALLBACK_LOCATION);
            setError(isEmulator ? 'Sử dụng vị trí mặc định (Emulator)' : 'Không thể lấy vị trí GPS');
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError('Không thể lấy vị trí: ' + String(e));
          // Sử dụng fallback location
          setCoordinate(FALLBACK_LOCATION);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.remove();
    };
  }, []);

  return { coordinate, error };
}
