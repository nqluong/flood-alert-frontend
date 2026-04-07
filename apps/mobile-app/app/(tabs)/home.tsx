import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  type CameraRef,
  type OnPressEvent,
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
} from '@maplibre/maplibre-react-native';
import { debounce } from 'lodash';

import { useNearbyFloods } from '../../hooks/useNearbyFloods';
import { useUserLocation } from '../../hooks/useUserLocation';
import type { FloodEvent, Viewport } from '../../types/flood.types';

import { SearchBar } from '../../components/home/SearchBar';
import { MapControlButton } from '../../components/home/MapControlButton';
import { FABCamera } from '../../components/home/FABCamera';
import { FloodDetailSheet } from '../../components/home/FloodDetailSheet';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const HANOI_CENTER: [number, number] = [105.8342, 21.0278];
const DEFAULT_VIEWPORT: Viewport = { centerLat: 21.0278, centerLon: 105.8342, radius: 5 };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const router = useRouter();

  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);

  const [selectedFlood, setSelectedFlood] = useState<FloodEvent | null>(null);

  const { coordinate: userCoordinate } = useUserLocation();

  // Tự bay về vị trí người dùng ngay khi GPS lần đầu có tín hiệu
  const hasFlownToUser = useRef(false);
  useEffect(() => {
    if (userCoordinate && !hasFlownToUser.current) {
      hasFlownToUser.current = true;
      cameraRef.current?.flyTo(userCoordinate, 1000);
    }
  }, [userCoordinate]);

  const userGeoJSON = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: userCoordinate
      ? [{ type: 'Feature', id: 'user', geometry: { type: 'Point', coordinates: userCoordinate }, properties: {} }]
      : [],
  }), [userCoordinate]);

  const { data: floods = [] } = useNearbyFloods(viewport);

  const floodsGeoJSON = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: floods.map((flood) => ({
      type: 'Feature',
      id: flood.eventId,
      geometry: { type: 'Point', coordinates: [flood.lon, flood.lat] },
      properties: { ...flood },
    })),
  }), [floods]);

  const debouncedSetViewport = useRef(
    debounce((v: Viewport) => setViewport(v), 500),
  ).current;

  useEffect(() => () => debouncedSetViewport.cancel(), [debouncedSetViewport]);

  const onRegionDidChange = useCallback(
    (feature: GeoJSON.Feature) => {
      const coords = (feature.geometry as GeoJSON.Point).coordinates;
      if (coords) {
        debouncedSetViewport({
          centerLon: coords[0],
          centerLat: coords[1],
          radius: viewport.radius,
        });
      }
    },
    [debouncedSetViewport, viewport.radius],
  );

  const handleFloodPress = useCallback(
    (e: OnPressEvent) => {
      const eventId = e.features[0]?.properties?.eventId as string | undefined;
      if (!eventId) return;
      setSelectedFlood(floods.find((f) => f.eventId === eventId) ?? null);
    },
    [floods],
  );

  const handleLocateUser = () => {
    if (userCoordinate) cameraRef.current?.flyTo(userCoordinate, 800);
  };

  return (
    <View style={styles.container}>
      {/* ── MapLibre Map ── */}
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={onRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={HANOI_CENTER}
          zoomLevel={14.5}
          animationDuration={0}
        />

        {/* Vị trí người dùng — native layer, không lag khi pan */}
        <ShapeSource id="userLocation" shape={userGeoJSON}>
          <CircleLayer
            id="userHalo"
            style={{
              circleRadius: 20,
              circleColor: '#60a5fa',
              circleOpacity: 0.35,
              circlePitchAlignment: 'map',
            }}
          />
          <CircleLayer
            id="userDot"
            style={{
              circleRadius: 9,
              circleColor: '#3b82f6',
              circleStrokeWidth: 3,
              circleStrokeColor: '#ffffff',
              circlePitchAlignment: 'map',
            }}
          />
        </ShapeSource>

        <ShapeSource id="floods" shape={floodsGeoJSON} onPress={handleFloodPress} hitbox={{ width: 48, height: 48 }}>
          {/* Halo */}
          <CircleLayer
            id="floodHalo"
            style={{
              circleRadius: 24,
              circleColor: ['match', ['get', 'severityLevel'], 'DANGER', '#E53935', '#FB8C00'],
              circleOpacity: 0.3,
              circlePitchAlignment: 'map',
            }}
          />
          {/* Dot */}
          <CircleLayer
            id="floodDot"
            style={{
              circleRadius: 13,
              circleColor: ['match', ['get', 'severityLevel'], 'DANGER', '#E53935', '#FB8C00'],
              circleStrokeWidth: 2.5,
              circleStrokeColor: '#ffffff',
              circlePitchAlignment: 'map',
            }}
          />
        </ShapeSource>
      </MapView>

      {/* ── Overlay UI ── */}
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

      <View style={styles.fabWrapper}>
        <FABCamera onPress={() => router.push('/(tabs)/report')} />
      </View>

      {/* ── Flood detail sheet ── */}
      <FloodDetailSheet flood={selectedFlood} onClose={() => setSelectedFlood(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
  fabWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    zIndex: 30,
  },
});
