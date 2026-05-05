import React, { useEffect, useMemo, useState } from 'react';
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
import { useSafeRoute } from '../../hooks/useSafeRoute';

import { MapMarkers } from '../../components/home/MapMarkers';
import { MapOverlay } from '../../components/home/MapOverlay';
import { FloodDetailSheet } from '../../components/home/FloodDetailSheet';
import { DirectionsButton } from '../../components/home/DirectionsButton';
import { RouteInfoPanel } from '../../components/home/RouteInfoPanel';
import { RouteLayer } from '../../components/home/RouteLayer';

import type { VehicleType } from '../../types/route.types';

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`;
const HANOI_CENTER: [number, number] = [105.8342, 21.0278];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State for map tap location
  const [tappedLocation, setTappedLocation] = useState<{
    coordinate: [number, number];
    name: string;
  } | null>(null);

  // Hooks
  const { coordinate: userCoordinate, error: locationError } = useUserLocation();
  const { viewport, onRegionDidChange } = useMapViewport();
  const { cameraRef, flyToLocation, flyToUserLocation } = useMapCamera();
  const { searchedLocation, handleSelectLocation, clearSearchedLocation } = useSearchLocation();

  const { data: floods = [] } = useNearbyFloods(viewport);
  const { floodsGeoJSON, selectedFlood, handleFloodPress, clearSelectedFlood } =
    useFloodMarkers(floods);

  // Safe route hook
  const {
    routeGeoJSON,
    isLoading: isRoutingLoading,
    error: routingError,
    avoidedFloodsCount,
    message: routingMessage,
    findRoute,
    clearRoute,
  } = useSafeRoute();

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

  // GeoJSON for searched location or tapped location
  const searchedLocationGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection | undefined => {
      const location = searchedLocation || tappedLocation;
      return location
        ? {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                id: 'searched',
                geometry: { type: 'Point', coordinates: location.coordinate },
                properties: { name: location.name },
              },
            ],
          }
        : undefined;
    },
    [searchedLocation, tappedLocation],
  );

  // Handlers
  const handleLocateUser = () => {
    if (userCoordinate) {
      flyToLocation(userCoordinate, { zoomLevel: 15, animationDuration: 800 });
    }
  };

  const handleSelectLocationWithMarker = (result: any) => {
    handleSelectLocation(result);
    setTappedLocation(null); // Clear tapped location khi search
  };

  // Directions handler - Tìm đường từ vị trí hiện tại đến địa điểm đã chọn
  const handleGetDirections = async (vehicleType: VehicleType) => {
    const destination = searchedLocation || tappedLocation;
    if (!userCoordinate || !destination) return;

    await findRoute({
      startLat: userCoordinate[1], // latitude
      startLon: userCoordinate[0], // longitude
      endLat: destination.coordinate[1],
      endLon: destination.coordinate[0],
      vehicleType,
    });
  };

  const handleClearDirections = () => {
    clearRoute();
    clearSearchedLocation();
    setTappedLocation(null);
  };

  // Handle map tap
  const handleMapPress = (event: any) => {
    const { geometry } = event;
    if (!geometry || !geometry.coordinates) return;

    const [lon, lat] = geometry.coordinates;
    
    setTappedLocation({
      coordinate: [lon, lat],
      name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    });
    
    // Clear searched location khi tap vào map
    clearSearchedLocation();
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
        onPress={handleMapPress}
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

        {/* Route Layer */}
        <RouteLayer routeGeoJSON={routeGeoJSON} />
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
          onClearSearch={handleClearDirections}
          onLocateUser={handleLocateUser}
          onCameraPress={() => router.push('/(tabs)/report')}
        />
      </KeyboardAvoidingView>

      {/* Flood Detail Sheet */}
      <FloodDetailSheet flood={selectedFlood} onClose={clearSelectedFlood} />

      {/* Directions Button - Hiện khi chưa có route */}
      <DirectionsButton
        visible={!!(searchedLocation || tappedLocation) && !routeGeoJSON && !!userCoordinate}
        destinationName={(searchedLocation || tappedLocation)?.name || ''}
        destinationCoordinate={(searchedLocation || tappedLocation)?.coordinate || [0, 0]}
        onDirections={handleGetDirections}
        onClose={handleClearDirections}
      />

      {/* Route Info Panel - Hiện khi đã có route */}
      <RouteInfoPanel
        visible={!!routeGeoJSON}
        destinationName={(searchedLocation || tappedLocation)?.name || ''}
        avoidedFloodsCount={avoidedFloodsCount}
        message={routingMessage}
        onClose={handleClearDirections}
      />
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
