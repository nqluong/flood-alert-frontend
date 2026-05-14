import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity } from 'react-native';
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
  const params = useLocalSearchParams();

  // State for map tap location
  const [tappedLocation, setTappedLocation] = useState<{
    coordinate: [number, number];
    name: string;
  } | null>(null);

  // State for navigation mode
  const [isNavigating, setIsNavigating] = useState(false);

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

  // Navigation tracking hook - Chỉ active khi đang navigation
  const {
    snappedCoordinate,
    remainingRouteGeoJSON,
    progressPercent,
    isOffRoute,
    hasArrived,
    distanceFromRoute,
  } = useNavigationTracking({
    routeGeoJSON: isNavigating && routeGeoJSON?.features?.[0] 
      ? (routeGeoJSON.features[0] as any)
      : null,
    destinationCoordinate: (searchedLocation || tappedLocation)?.coordinate || [0, 0],
    onOffRoute: () => {
      Alert.alert(
        'Đi lạc đường',
        'Bạn đã đi lệch khỏi tuyến đường. Bạn có muốn tìm đường mới?',
        [
          { text: 'Tiếp tục', style: 'cancel' },
          {
            text: 'Tìm đường mới',
            onPress: async () => {
              const destination = searchedLocation || tappedLocation;
              if (!userCoordinate || !destination) return;
              
              await findRoute({
                startLat: userCoordinate[1],
                startLon: userCoordinate[0],
                endLat: destination.coordinate[1],
                endLon: destination.coordinate[0],
                vehicleType: 'MOTORBIKE', // Có thể lưu vehicle type vào state
              });
            },
          },
        ],
      );
    },
    onArrival: () => {
      Alert.alert('Đã đến đích', 'Bạn đã đến nơi!', [
        {
          text: 'OK',
          onPress: () => {
            setIsNavigating(false);
            handleClearDirections();
          },
        },
      ]);
    },
  });

  useEffect(() => {
    flyToUserLocation(userCoordinate);
  }, [userCoordinate, flyToUserLocation]);

  // Focus vào vị trí từ notification - CHỈ 1 LẦN
  const hasFocusedFromNotification = React.useRef(false);
  useEffect(() => {
    if (params.focusLat && params.focusLon && !hasFocusedFromNotification.current) {
      const lat = parseFloat(params.focusLat as string);
      const lon = parseFloat(params.focusLon as string);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        hasFocusedFromNotification.current = true;
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

  // GeoJSON for user location
  const userGeoJSON = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: 'FeatureCollection',
      features: userCoordinate
        ? [
            {
              type: 'Feature',
              id: 'user',
              geometry: { 
                type: 'Point', 
                // Khi đang navigation, dùng snappedCoordinate (đã bám đường)
                // Khi không navigation, dùng userCoordinate (GPS thô)
                coordinates: isNavigating && snappedCoordinate ? snappedCoordinate : userCoordinate 
              },
              properties: {
                isNavigating,
                isOffRoute: isNavigating ? isOffRoute : false,
              },
            },
          ]
        : [],
    }),
    [userCoordinate, isNavigating, snappedCoordinate, isOffRoute],
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
    setIsNavigating(false);
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
    const destination = searchedLocation || tappedLocation;
    if (!routeGeoJSON || !destination || !userCoordinate) return;

    setIsNavigating(true);
    
    flyToLocation(userCoordinate, {
      zoomLevel: 17, 
      animationDuration: 800,
      pitch: 60, // Góc nghiêng cho navigation view
    });
  };

  const handleMapPress = (event: any) => {
    if (isNavigating) return;
    
    const { geometry } = event;
    if (!geometry || !geometry.coordinates) return;

    const [lon, lat] = geometry.coordinates;
    
    setTappedLocation({
      coordinate: [lon, lat],
      name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    });
    
    clearSearchedLocation();
  };

  useEffect(() => {
    if (isNavigating && snappedCoordinate && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: snappedCoordinate,
        zoomLevel: 17,
        animationDuration: 500,
        pitch: 60,
      });
    }
  }, [isNavigating, snappedCoordinate]);

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

        {/* Route Layer - Hiển thị đường còn lại khi đang navigation, hoặc đường gốc khi chưa navigation */}
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
          />
        )}
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
        visible={!!routeGeoJSON && !isNavigating}
        destinationName={(searchedLocation || tappedLocation)?.name || ''}
        avoidedFloodsCount={avoidedFloodsCount}
        message={routingMessage}
        onClose={handleClearDirections}
        onStartNavigation={handleStartNavigation}
      />

      {/* Navigation Info - Hiện khi đang navigation */}
      {isNavigating && (
        <View style={[styles.navigationInfo, { top: insets.top + 10 }]}>
          <View style={styles.navHeader}>
            <View style={styles.navHeaderLeft}>
              <View style={styles.navIcon}>
                <View style={styles.navIconInner} />
              </View>
              <View>
                <Text style={styles.navLabel}>Đang đi đến</Text>
                <Text style={styles.navDestination} numberOfLines={1}>
                  {(searchedLocation || tappedLocation)?.name || 'Đích đến'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.navCloseButton}
              onPress={() => {
                Alert.alert(
                  'Dừng điều hướng',
                  'Bạn có chắc muốn dừng điều hướng?',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Dừng',
                      style: 'destructive',
                      onPress: () => {
                        setIsNavigating(false);
                        // Reset camera về góc nhìn bình thường
                        if (cameraRef.current && userCoordinate) {
                          cameraRef.current.setCamera({
                            centerCoordinate: userCoordinate,
                            zoomLevel: 15,
                            pitch: 0,
                            animationDuration: 800,
                          });
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={styles.navCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.navStats}>
            <View style={styles.navStat}>
              <Text style={styles.navStatLabel}>Tiến độ</Text>
              <Text style={styles.navStatValue}>{progressPercent.toFixed(0)}%</Text>
            </View>
            <View style={styles.navStat}>
              <Text style={styles.navStatLabel}>Trạng thái</Text>
              <Text style={[styles.navStatValue, isOffRoute && styles.navStatError]}>
                {isOffRoute ? 'Lệch đường' : 'Đúng đường'}
              </Text>
            </View>
            <View style={styles.navStat}>
              <Text style={styles.navStatLabel}>Khoảng cách</Text>
              <Text style={styles.navStatValue}>{distanceFromRoute.toFixed(0)}m</Text>
            </View>
          </View>
        </View>
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
  navigationInfo: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
  },
  navLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  navDestination: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCloseText: {
    color: '#F44336',
    fontSize: 20,
    fontWeight: '600',
  },
  navStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  navStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  navStatValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  navStatError: {
    color: '#F44336',
  },
});
