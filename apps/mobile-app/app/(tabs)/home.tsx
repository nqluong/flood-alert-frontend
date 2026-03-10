import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { type CameraRef, MarkerView, MapView, Camera } from '@maplibre/maplibre-react-native';

import { SearchBar } from '../../components/home/SearchBar';
import { MapControlButton } from '../../components/home/MapControlButton';
import { FloodZoneMarker } from '../../components/home/FloodZoneMarker';
import { UserLocationMarker } from '../../components/home/UserLocationMarker';
import { BottomSheet } from '../../components/home/BottomSheet';
import { FABCamera } from '../../components/home/FABCamera';
import { FloodPoint } from '../../components/home/FloodPointCard';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Trung tâm Quận 1, TP.HCM [longitude, latitude]
const HCM_CENTER: [number, number] = [105.8256, 21.0059];

interface FloodMarker extends FloodPoint {
  coordinate: [number, number]; // [longitude, latitude]
}

const FLOOD_POINTS: FloodMarker[] = [
  {
    id: '1',
    name: 'Đường Nguyễn Huệ',
    description: 'Ngập chết máy - 2.1 km',
    timeAgo: '5 phút trước',
    severity: 'danger',
    coordinate: [106.7029, 10.7730],
  },
  {
    id: '2',
    name: 'Đường Lê Lợi',
    description: 'Ngập nửa bánh xe - 3.8 km',
    timeAgo: '12 phút trước',
    severity: 'warning',
    coordinate: [106.7003, 10.7728],
  },
  {
    id: '3',
    name: 'Đường Trần Hưng Đạo',
    description: 'Ngập nhẹ - 5.2 km',
    timeAgo: '20 phút trước',
    severity: 'warning',
    coordinate: [106.6982, 10.7655],
  },
];

// Cảm biến nước thêm
const SENSOR_COORDINATE: [number, number] = [106.7050, 10.7755];

// Vị trí user giả lập (sẽ được thay bằng GPS thực tế)
const USER_COORDINATE: [number, number] = [105.8256273, 21.0059432];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const router = useRouter();

  const handleLocateUser = () => {
    cameraRef.current?.flyTo(USER_COORDINATE, 800);
  };

  return (
    <View style={styles.container}>
      {/* ── MapLibre Map ── */}
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={HCM_CENTER}
          zoomLevel={14.5}
          animationDuration={0}
        />

        {/* Vị trí người dùng */}
        <MarkerView coordinate={USER_COORDINATE}>
          <UserLocationMarker />
        </MarkerView>

        {/*/!* Marker điểm ngập *!/*/}
        {/*{FLOOD_POINTS.map((point) => (*/}
        {/*  <MarkerView key={point.id} coordinate={point.coordinate}>*/}
        {/*    <FloodZoneMarker type={point.severity === 'danger' ? 'flood' : 'water'} />*/}
        {/*  </MarkerView>*/}
        {/*))}*/}

        {/* Cảm biến nước bổ sung */}
        {/*<MarkerView coordinate={SENSOR_COORDINATE}>*/}
        {/*  <FloodZoneMarker type="water" />*/}
        {/*</MarkerView>*/}
      </MapView>

      {/* ── Overlay UI ── */}

      {/* Search bar */}
      <View style={[styles.searchBarWrapper, { top: insets.top + 8 }]}>
        <SearchBar />
      </View>

      <View style={[styles.mapControls, { top: insets.top + 72 }]}>
        <MapControlButton onPress={handleLocateUser}>
          <Ionicons name="locate" size={20} color="#374151" />
        </MapControlButton>
        <MapControlButton>
          <MaterialIcons name="layers" size={22} color="#374151" />
        </MapControlButton>
      </View>

      <View style={styles.bottomSheetWrapper}>
        <BottomSheet items={FLOOD_POINTS} />
      </View>

      <View style={styles.fabWrapper}>
        <FABCamera onPress={() => router.push('/(tabs)/report')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  searchBarWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    gap: 12,
    zIndex: 10,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  fabWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 230,
    zIndex: 30,
  },
});
