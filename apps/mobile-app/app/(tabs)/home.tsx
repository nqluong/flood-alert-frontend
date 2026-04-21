import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapView, Camera } from '@maplibre/maplibre-react-native';

import { useNearbyFloods } from '../../hooks/useNearbyFloods';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useMapViewport } from '../../hooks/useMapViewport';
import { useMapCamera } from '../../hooks/useMapCamera';
import { useSearchLocation } from '../../hooks/useSearchLocation';
import { useFloodMarkers } from '../../hooks/useFloodMarkers';

import { MapMarkers } from '../../components/home/MapMarkers';
import { MapOverlay } from '../../components/home/MapOverlay';
import { FloodDetailSheet } from '../../components/home/FloodDetailSheet';

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`;
const HANOI_CENTER: [number, number] = [105.8342, 21.0278];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Hooks
  const { coordinate: userCoordinate, error: locationError } = useUserLocation();
  const { viewport, onRegionDidChange } = useMapViewport();
  const { cameraRef, flyToLocation, flyToUserLocation } = useMapCamera();
  const { searchedLocation, handleSelectLocation, clearSearchedLocation } = useSearchLocation();

  const { data: floods = [] } = useNearbyFloods(viewport);
  const { floodsGeoJSON, selectedFlood, handleFloodPress, clearSelectedFlood } =
    useFloodMarkers(floods);

  useEffect(() => {
    flyToUserLocation(userCoordinate);
  }, [userCoordinate, flyToUserLocation]);

  const prevSearchedLocation = React.useRef<typeof searchedLocation>(null);
  useEffect(() => {
    if (
      searchedLocation &&
      searchedLocation !== prevSearchedLocation.current
    ) {
      prevSearchedLocation.current = searchedLocation;
      flyToLocation(searchedLocation.coordinate, {
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  }, [searchedLocation, flyToLocation]);

  // GeoJSON for user location
  const userGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: 'FeatureCollection',
      features: userCoordinate
        ? [
            {
              type: 'Feature',
              id: 'user',
              geometry: { type: 'Point', coordinates: userCoordinate },
              properties: {},
            },
          ]
        : [],
    }),
    [userCoordinate],
  );

  // GeoJSON for searched location
  const searchedLocationGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection | undefined =>
      searchedLocation
        ? {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                id: 'searched',
                geometry: { type: 'Point', coordinates: searchedLocation.coordinate },
                properties: { name: searchedLocation.name },
              },
            ],
          }
        : undefined,
    [searchedLocation],
  );

  // Handlers
  const handleLocateUser = () => {
    if (userCoordinate) {
      flyToLocation(userCoordinate, { zoomLevel: 15, animationDuration: 800 });
    }
  };

  const handleSelectLocationWithMarker = (result: any) => {
    handleSelectLocation(result);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={onRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: HANOI_CENTER,
            zoomLevel: 14.5,
          }}
        />

        <MapMarkers
          userGeoJSON={userGeoJSON}
          floodsGeoJSON={floodsGeoJSON}
          searchedLocationGeoJSON={searchedLocationGeoJSON}
          onFloodPress={handleFloodPress}
          onClearSearch={clearSearchedLocation}
        />
      </MapView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlayContainer}
        keyboardVerticalOffset={0}
      >
        <MapOverlay
          topInset={insets.top}
          userLocation={userCoordinate}
          locationError={locationError}
          onSelectLocation={handleSelectLocationWithMarker}
          onClearSearch={clearSearchedLocation}
          onLocateUser={handleLocateUser}
          onCameraPress={() => router.push('/(tabs)/report')}
        />
      </KeyboardAvoidingView>

      {/* Flood Detail Sheet */}
      <FloodDetailSheet flood={selectedFlood} onClose={clearSelectedFlood} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none', // Cho phép touch events đi qua container
  },
});
