import React from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { SearchBar } from '../../components/home/SearchBar';
import { MapControlButton } from '../../components/home/MapControlButton';
import { UserLocationMarker } from '../../components/home/UserLocationMarker';
import { FloodZoneMarker } from '../../components/home/FloodZoneMarker';
import { BottomSheet } from '../../components/home/BottomSheet';
import { FABCamera } from '../../components/home/FABCamera';
import { FloodPoint } from '../../components/home/FloodPointCard';

// TODO: Replace this placeholder with react-native-maps <MapView /> for a real map
// Install: npx expo install react-native-maps
const MAP_PLACEHOLDER =
  'https://www.figma.com/api/mcp/asset/37241891-2ee0-481b-aa05-5139fe0fed0e';

const FLOOD_POINTS: FloodPoint[] = [
  {
    id: '1',
    name: 'Đường Nguyễn Huệ',
    description: 'Ngập chết máy - 2.1 km',
    timeAgo: '5 phút trước',
    severity: 'danger',
  },
  {
    id: '2',
    name: 'Đường Lê Lợi',
    description: 'Ngập nửa bánh xe - 3.8 km',
    timeAgo: '12 phút trước',
    severity: 'warning',
  },
  {
    id: '3',
    name: 'Đường Trần Hưng Đạo',
    description: 'Ngập nhẹ - 5.2 km',
    timeAgo: '20 phút trước',
    severity: 'warning',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale factor from design width (375px) to actual screen
const sx = SCREEN_WIDTH / 375;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* ── Map area ────────────────────────────── */}
      <ImageBackground
        source={{ uri: MAP_PLACEHOLDER }}
        style={styles.map}
        resizeMode="cover"
      >
        {/* Search bar */}
        <View style={[styles.searchBarWrapper, { top: insets.top + 8 }]}>
          <SearchBar />
        </View>

        {/* Map control buttons (right side) */}
        <View style={[styles.mapControls, { top: insets.top + 72 }]}>
          <MapControlButton>
            <Ionicons name="locate" size={20} color="#374151" />
          </MapControlButton>
          <MapControlButton>
            <MaterialIcons name="layers" size={22} color="#374151" />
          </MapControlButton>
        </View>

        {/* Flood zone marker – danger (red) */}
        <View style={[styles.markerAbsolute, { top: 216 * sx, left: 124 * sx }]}>
          <FloodZoneMarker type="flood" />
        </View>

        {/* User location (blue pulsing dot) */}
        <View style={[styles.markerAbsolute, { top: 396 * sx, left: 164 * sx }]}>
          <UserLocationMarker />
        </View>

        {/* Water sensor marker – warning (orange) */}
        <View style={[styles.markerAbsolute, { top: 372 * sx, left: 247 * sx }]}>
          <FloodZoneMarker type="water" />
        </View>
      </ImageBackground>

      {/* ── Bottom sheet ────────────────────────── */}
      <View style={styles.bottomSheetWrapper}>
        <BottomSheet items={FLOOD_POINTS} />
      </View>

      {/* ── FAB camera (overlaps bottom sheet top) ── */}
      <View style={styles.fabWrapper}>
        <FABCamera onPress={() => console.log('Open camera / report')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  map: {
    flex: 1,
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
  markerAbsolute: {
    position: 'absolute',
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