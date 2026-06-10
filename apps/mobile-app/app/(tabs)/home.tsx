import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapView, Camera } from '@maplibre/maplibre-react-native';

import { useNearbyFloods } from '../../hooks/useNearbyFloods';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useMapViewport } from '../../hooks/useMapViewport';
import { useMapCamera } from '../../hooks/useMapCamera';
import { useSearchLocation } from '../../hooks/useSearchLocation';
import { useFloodMarkers } from '../../hooks/useFloodMarkers';
import { useSafeRoute } from '../../hooks/useSafeRoute';
import { useNavigationTracking } from '../../hooks/useNavigationTracking';
import { useNavigationCamera } from '../../hooks/useNavigationCamera';

import { MapMarkers } from '../../components/home/map/MapMarkers';
import { RouteLayer } from '../../components/home/map/RouteLayer';
import { MapOverlay } from '../../components/home/overlay/MapOverlay';
import { FloodDetailSheet } from '../../components/home/sheet/FloodDetailSheet';
import { DirectionsButton } from '../../components/home/route/DirectionsButton';
import { RouteInfoPanel } from '../../components/home/route/RouteInfoPanel';
import { NavigationPanel } from '../../components/home/navigation/NavigationPanel';
import {
  type CameraMode,
  nextCameraMode,
} from '../../components/home/navigation/CameraModeButton';

import { geocodingService } from '../../services/geocoding.service';
import { MAP_STYLES, type MapStyleId } from '../../components/home/overlay/MapStylePicker';
import { useAlertContext } from '../../context/AlertContext';
import type { VehicleType } from '../../types/route.types';

const HANOI_CENTER: [number, number] = [105.8342, 21.0278];
const FALLBACK_COORD: [number, number] = [0, 0];
const REROUTE_COOLDOWN_MS = 5000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // State for map tap location
  const [tappedLocation, setTappedLocation] = useState<{
    coordinate: [number, number];
    name: string;
  } | null>(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const { show: showAlert } = useAlertContext();

  // State for map style
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>('liberty');
  const mapStyleUrl = MAP_STYLES.find((s) => s.id === mapStyleId)!.url;

  // State for navigation mode
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentVehicleType, setCurrentVehicleType] = useState<VehicleType>('MOTORBIKE');
  const [isRerouting, setIsRerouting] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('follow_3d');
  const lastRerouteAtRef = useRef(0);

  // Follow mode: camera tự theo user khi di chuyển
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const hasFocusedInitially = useRef(false);

  // Hooks
  const { coordinate: userCoordinate, error: locationError, isRealLocation } = useUserLocation();
  const { viewport, onRegionDidChange } = useMapViewport();
  const { cameraRef, flyToLocation } = useMapCamera();
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

  const destination = useMemo(
    () => searchedLocation || tappedLocation,
    [searchedLocation, tappedLocation],
  );
  const destinationCoordinate = useMemo<[number, number]>(
    () => destination?.coordinate ?? FALLBACK_COORD,
    [destination],
  );

  // Route feature truyền vào hook
  const trackingRouteFeature = useMemo(() => {
    if (!isNavigating) return null;
    const feature = routeGeoJSON?.features?.[0];
    return (feature as any) ?? null;
  }, [isNavigating, routeGeoJSON]);

  // Refs để callback off-route/arrival luôn đọc state mới nhất
  const userCoordinateRef = useRef(userCoordinate);
  const destinationRef = useRef(destination);
  const vehicleTypeRef = useRef<VehicleType>(currentVehicleType);

  useEffect(() => {
    userCoordinateRef.current = userCoordinate;
  }, [userCoordinate]);
  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);
  useEffect(() => {
    vehicleTypeRef.current = currentVehicleType;
  }, [currentVehicleType]);

  const handleOffRouteAutoReroute = useCallback(async () => {
    const now = Date.now();
    if (now - lastRerouteAtRef.current < REROUTE_COOLDOWN_MS) return;
    const start = userCoordinateRef.current;
    const dest = destinationRef.current;
    if (!start || !dest) return;

    lastRerouteAtRef.current = now;
    setIsRerouting(true);
    try {
      await findRoute({
        startLat: start[1],
        startLon: start[0],
        endLat: dest.coordinate[1],
        endLon: dest.coordinate[0],
        vehicleType: vehicleTypeRef.current,
      });
    } finally {
      setIsRerouting(false);
    }
  }, [findRoute]);

  const handleArrival = useCallback(() => {
    showAlert({
      type: 'success',
      title: 'Đã đến đích',
      message: 'Bạn đã đến nơi!',
      buttons: [{ text: 'OK', style: 'default', onPress: () => setIsNavigating(false) }],
    });
  }, [showAlert]);

  // Navigation tracking hook - Chỉ active khi đang navigation
  const {
    snappedCoordinate,
    rawCoordinate,
    remainingRouteGeoJSON,
    isOffRoute,
    distanceFromRoute,
    currentStep,
    nextStep,
    distanceToNextStep,
    totalRemainingDistance,
  } = useNavigationTracking({
    routeGeoJSON: trackingRouteFeature,
    destinationCoordinate,
    onOffRoute: handleOffRouteAutoReroute,
    onArrival: handleArrival,
  });

  // Initial fly + follow mode
  useEffect(() => {
    if (!isRealLocation || !userCoordinate || isNavigating) return;
    if (!hasFocusedInitially.current) {
      hasFocusedInitially.current = true;
      flyToLocation(userCoordinate, { zoomLevel: 15, animationDuration: 1200 });
      return;
    }
    if (isFollowingUser) {
      flyToLocation(userCoordinate, { zoomLevel: 15, animationDuration: 300 });
    }
  }, [userCoordinate, isRealLocation, isNavigating, isFollowingUser, flyToLocation]);

  // Resume follow mode khi thoát navigation
  useEffect(() => {
    if (!isNavigating) setIsFollowingUser(true);
  }, [isNavigating]);

  // Tắt follow khi user kéo bản đồ, bật lại khi camera di chuyển programmatically
  const handleRegionDidChange = useCallback(
    (feature: GeoJSON.Feature) => {
      onRegionDidChange(feature);
      if ((feature.properties as any)?.isUserInteraction === true) {
        setIsFollowingUser(false);
      }
    },
    [onRegionDidChange],
  );

  const hasFocusedFromNotification = React.useRef(false);
  useEffect(() => {
    if (params.focusLat && params.focusLon && !hasFocusedFromNotification.current) {
      const lat = parseFloat(params.focusLat as string);
      const lon = parseFloat(params.focusLon as string);

      if (!isNaN(lat) && !isNaN(lon)) {
        hasFocusedFromNotification.current = true;
        setIsFollowingUser(false);
        flyToLocation([lon, lat], {
          zoomLevel: 16,
          animationDuration: 1000,
        });

        // Clear params sau khi focus để không bị focus lại
        setTimeout(() => {
          router.setParams({ focusLat: undefined, focusLon: undefined });
        }, 100);
      }
    }
  }, [params.focusLat, params.focusLon, flyToLocation, router]);

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

  const userGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection => {
      let coords: [number, number] | null = userCoordinate;
      if (isNavigating) {
        if (isOffRoute) {
          coords = rawCoordinate || userCoordinate;
        } else {
          coords = snappedCoordinate || userCoordinate;
        }
      }

      return {
        type: 'FeatureCollection',
        features: coords
          ? [
            {
              type: 'Feature',
              id: 'user',
              geometry: { type: 'Point', coordinates: coords },
              properties: {
                isNavigating,
                isOffRoute: isNavigating ? isOffRoute : false,
              },
            },
          ]
          : [],
      };
    },
    [userCoordinate, isNavigating, snappedCoordinate, rawCoordinate, isOffRoute],
  );

  // GeoJSON for searched location or tapped location
  const searchedLocationGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection | undefined => {
      return destination
        ? {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: 'searched',
              geometry: { type: 'Point', coordinates: destination.coordinate },
              properties: { name: destination.name },
            },
          ],
        }
        : undefined;
    },
    [destination],
  );

  // Handlers
  const handleLocateUser = () => {
    if (isRealLocation && userCoordinate) {
      setIsFollowingUser(true);
      flyToLocation(userCoordinate, { zoomLevel: 15, animationDuration: 800 });
    } else if (locationError) {
      showAlert({
        type: 'error',
        title: 'Không thể định vị',
        message: locationError,
        buttons: [{ text: 'Đóng', style: 'cancel' }],
      });
    }
  };

  const handleSelectLocationWithMarker = (result: any) => {
    handleSelectLocation(result);
    setTappedLocation(null);
  };

  const handleGetDirections = async (vehicleType: VehicleType) => {
    if (!userCoordinate || !destination) return;

    setCurrentVehicleType(vehicleType);
    await findRoute({
      startLat: userCoordinate[1], // latitude
      startLon: userCoordinate[0], // longitude
      endLat: destination.coordinate[1],
      endLon: destination.coordinate[0],
      vehicleType,
    });
  };

  const handleClearDirections = () => {
    setIsNavigating(false);
    setIsRerouting(false);
    clearRoute();
    clearSearchedLocation();
    setTappedLocation(null);

    // Reset camera về góc nhìn bình thường
    if (cameraRef.current && userCoordinate) {
      cameraRef.current.setCamera({
        centerCoordinate: userCoordinate,
        zoomLevel: 15,
        pitch: 0, // Reset pitch về 0
        animationDuration: 800,
      });
    }
  };

  const handleStartNavigation = () => {
    if (!routeGeoJSON || !destination || !userCoordinate) return;

    setIsNavigating(true);

    flyToLocation(userCoordinate, {
      zoomLevel: 17,
      animationDuration: 800,
      pitch: 60,
    });
  };

  const handleMapPress = async (event: any) => {
    if (isNavigating) return;

    const { geometry } = event;
    if (!geometry || !geometry.coordinates) return;

    const [lon, lat] = geometry.coordinates;
    const fallbackName = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    setTappedLocation({ coordinate: [lon, lat], name: fallbackName });
    setIsFetchingAddress(true);
    clearSearchedLocation();

    try {
      const result = await geocodingService.reverse(lon, lat);
      if (result?.place_name) {
        setTappedLocation({ coordinate: [lon, lat], name: result.place_name });
      }
    } catch {
      // giữ fallback tọa độ nếu API lỗi hoặc timeout
    } finally {
      setIsFetchingAddress(false);
    }
  };

  useNavigationCamera({
    cameraRef,
    isNavigating,
    cameraMode,
    snappedCoordinate,
    rawCoordinate,
    userCoordinate,
    isOffRoute,
    remainingRouteGeoJSON,
  });

  // Khi rời chế độ navigation, reset camera mode về mặc định
  useEffect(() => {
    if (!isNavigating) setCameraMode('follow_3d');
  }, [isNavigating]);

  const cycleCameraMode = useCallback(() => {
    setCameraMode((prev) => nextCameraMode(prev));
  }, []);

  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    if (cameraRef.current && userCoordinate) {
      cameraRef.current.setCamera({
        centerCoordinate: userCoordinate,
        zoomLevel: 15,
        pitch: 0,
        animationDuration: 800,
      });
    }
  }, [cameraRef, userCoordinate]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={mapStyleUrl}
        logoEnabled={false}
        attributionEnabled={false}
        compassViewMargins={{ x: 16, y: insets.top + 196 }}
        onRegionDidChange={handleRegionDidChange}
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

        <RouteLayer
          routeGeoJSON={
            isNavigating && remainingRouteGeoJSON
              ? { type: 'FeatureCollection', features: [remainingRouteGeoJSON] }
              : routeGeoJSON
          }
        />
      </MapView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlayContainer}
        keyboardVerticalOffset={0}
      >
        {/* Ẩn overlay khi đang navigation */}
        {!isNavigating && (
          <MapOverlay
            topInset={insets.top}
            userLocation={userCoordinate}
            locationError={locationError}
            onSelectLocation={handleSelectLocationWithMarker}
            onClearSearch={handleClearDirections}
            onLocateUser={handleLocateUser}
            onCameraPress={() => router.push('/(tabs)/report')}
            currentMapStyleId={mapStyleId}
            onMapStyleChange={setMapStyleId}
          />
        )}
      </KeyboardAvoidingView>

      {/* Flood Detail Sheet */}
      <FloodDetailSheet flood={selectedFlood} onClose={clearSelectedFlood} />

      {/* Directions Button - Hiện khi chưa có route */}
      <DirectionsButton
        visible={!!destination && !routeGeoJSON && !!userCoordinate}
        destinationName={destination?.name || ''}
        destinationCoordinate={destinationCoordinate}
        isLoadingAddress={isFetchingAddress}
        onDirections={handleGetDirections}
        onClose={handleClearDirections}
      />

      {/* Route Info Panel - Hiện khi đã có route */}
      <RouteInfoPanel
        visible={!!routeGeoJSON && !isNavigating}
        destinationName={destination?.name || ''}
        avoidedFloodsCount={avoidedFloodsCount}
        message={routingMessage}
        onClose={handleClearDirections}
        onStartNavigation={handleStartNavigation}
      />

      {/* Navigation Panel - Hiện khi đang navigation */}
      {isNavigating && (
        <NavigationPanel
          topInset={insets.top}
          destinationName={destination?.name || ''}
          currentStep={currentStep}
          nextStep={nextStep}
          distanceToNextStep={distanceToNextStep}
          cameraMode={cameraMode}
          onCycleCameraMode={cycleCameraMode}
          onStop={handleStopNavigation}
        />
      )}
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
    pointerEvents: 'box-none',
  },
});
