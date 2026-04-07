import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
  coordinate: [number, number] | null; // [longitude, latitude]
  error: string | null;
}

export function useUserLocation(): UserLocation {
  const [coordinate, setCoordinate] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setError('Quyền truy cập vị trí bị từ chối');
          return;
        }

        // Kiểm tra dịch vụ vị trí có bật không
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          if (!cancelled) setError('Dịch vụ vị trí (GPS) chưa được bật trên thiết bị');
          return;
        }

        // Thử lấy vị trí đã cache trước (nhanh, hoạt động tốt trên emulator)
        const last = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
        if (last && !cancelled) {
          setCoordinate([last.coords.longitude, last.coords.latitude]);
        }

        // Lấy vị trí chính xác lần đầu
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) setCoordinate([initial.coords.longitude, initial.coords.latitude]);

        // Theo dõi liên tục
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (loc) => {
            if (!cancelled) setCoordinate([loc.coords.longitude, loc.coords.latitude]);
          },
        );
      } catch (e) {
        if (!cancelled) setError('Không thể lấy vị trí: ' + String(e));
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { coordinate, error };
}
