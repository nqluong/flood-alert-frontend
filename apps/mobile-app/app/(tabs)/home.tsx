import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {MapView, Camera} from '@maplibre/maplibre-react-native';

import {useNearbyFloods} from '../../hooks/useNearbyFloods';
import {useUserLocation} from '../../hooks/useUserLocation';
import {useMapViewport} from '../../hooks/useMapViewport';
import {useMapCamera} from '../../hooks/useMapCamera';
import {useSearchLocation} from '../../hooks/useSearchLocation';
import {useFloodMarkers} from '../../hooks/useFloodMarkers';
import {useSafeRoute} from '../../hooks/useSafeRoute';
import {useNavigationTracking} from '../../hooks/useNavigationTracking';

import {MapMarkers} from '../../components/home/MapMarkers';
import {MapOverlay} from '../../components/home/MapOverlay';
import {FloodDetailSheet} from '../../components/home/FloodDetailSheet';
import {DirectionsButton} from '../../components/home/DirectionsButton';
import {RouteInfoPanel} from '../../components/home/RouteInfoPanel';
import {RouteLayer} from '../../components/home/RouteLayer';

import type {VehicleType} from '../../types/route.types';

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const MAPTILER_STYLE = `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`;

const HANOI_CENTER: [number, number] = [105.8342, 21.0278];
const FALLBACK_COORD: [number, number] = [0, 0];
const REROUTE_COOLDOWN_MS = 5000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [mapStyle, setMapStyle] = useState<string>(OPENFREEMAP_STYLE);

  const handleMapFinishedLoading = () => {
  };

  const handleMapLoadFailed = () => {
    if (mapStyle === OPENFREEMAP_STYLE) {
      setMapStyle(MAPTILER_STYLE);
    }
  };

  // State for map tap location
  const [tappedLocation, setTappedLocation] = useState<{
    coordinate: [number, number];
    name: string;
  } | null>(null);

  // State for navigation mode
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentVehicleType, setCurrentVehicleType] = useState<VehicleType>('MOTORBIKE');
  const [isRerouting, setIsRerouting] = useState(false);
  const lastRerouteAtRef = useRef(0);

  // Hooks
  const {coordinate: userCoordinate, error: locationError, isRealLocation} = useUserLocation();
  const {viewport, onRegionDidChange} = useMapViewport();
  const {cameraRef, flyToLocation, flyToUserLocation} = useMapCamera();
  const {searchedLocation, handleSelectLocation, clearSearchedLocation} = useSearchLocation();

  const {data: floods = []} = useNearbyFloods(viewport);
  const {floodsGeoJSON, selectedFlood, handleFloodPress, clearSelectedFlood} =
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

  // Destination (search hoặc tap) — memoize để giữ tham chiếu ổn định
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
    Alert.alert('Đã đến đích', 'Bạn đã đến nơi!', [
      {
        text: 'OK',
        onPress: () => {
          setIsNavigating(false);
        },
      },
    ]);
  }, []);

  // Navigation tracking hook - Chỉ active khi đang navigation
  const {
    snappedCoordinate,
    rawCoordinate,
    remainingRouteGeoJSON,
    progressPercent,
    isOffRoute,
    distanceFromRoute,
  } = useNavigationTracking({
    routeGeoJSON: trackingRouteFeature,
    destinationCoordinate,
    onOffRoute: handleOffRouteAutoReroute,
    onArrival: handleArrival,
  });

  useEffect(() => {
    // Chỉ auto-fly khi có GPS thật, không fly đến fallback location
    if (isRealLocation) {
      flyToUserLocation(userCoordinate);
    }
  }, [userCoordinate, isRealLocation, flyToUserLocation]);

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
          router.setParams({focusLat: undefined, focusLon: undefined});
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
              geometry: {type: 'Point', coordinates: coords},
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
              geometry: {type: 'Point', coordinates: destination.coordinate},
              properties: {name: destination.name},
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
      flyToLocation(userCoordinate, {zoomLevel: 15, animationDuration: 800});
    } else if (locationError) {
      Alert.alert('Không thể định vị', locationError);
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

  const handleMapPress = (event: any) => {
    if (isNavigating) return;

    const {geometry} = event;
    if (!geometry || !geometry.coordinates) return;

    const [lon, lat] = geometry.coordinates;

    setTappedLocation({
      coordinate: [lon, lat],
      name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    });

    clearSearchedLocation();
  };

  // Camera bám theo vị trí khi đang navigation
  // - On-route: bám snappedCoordinate (mượt theo đường)
  // - Off-route: bám rawCoordinate (vị trí thật) để user thấy mình đang đâu
  useEffect(() => {
    if (!isNavigating || !cameraRef.current) return;

    const followCoord = isOffRoute
      ? rawCoordinate || snappedCoordinate || userCoordinate
      : snappedCoordinate || userCoordinate;

    if (!followCoord) return;

    cameraRef.current.setCamera({
      centerCoordinate: followCoord,
      zoomLevel: 17,
      animationDuration: 500,
      pitch: 60,
    });
  }, [isNavigating, snappedCoordinate, rawCoordinate, userCoordinate, isOffRoute]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={mapStyle}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={onRegionDidChange}
        onPress={handleMapPress}
        onDidFinishLoadingMap={handleMapFinishedLoading}
        onDidFailLoadingMap={handleMapLoadFailed}
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
              ? {type: 'FeatureCollection', features: [remainingRouteGeoJSON]}
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
      <FloodDetailSheet flood={selectedFlood} onClose={clearSelectedFlood}/>

      {/* Directions Button - Hiện khi chưa có route */}
      <DirectionsButton
        visible={!!destination && !routeGeoJSON && !!userCoordinate}
        destinationName={destination?.name || ''}
        destinationCoordinate={destinationCoordinate}
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

      {/* Navigation Info - Hiện khi đang navigation */}
      {isNavigating && (
        <View style={[styles.navigationInfo, {top: insets.top + 10}]}>
          <View style={styles.navHeader}>
            <View style={styles.navHeaderLeft}>
              <View style={styles.navIcon}>
                <View style={styles.navIconInner}/>
              </View>
              <View>
                <Text style={styles.navLabel}>Đang đi đến</Text>
                <Text style={styles.navDestination} numberOfLines={1}>
                  {destination?.name || 'Đích đến'}
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
                    {text: 'Hủy', style: 'cancel'},
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

          {/* Banner thông báo đang tìm lại đường (auto re-route khi lệch) */}
          {isRerouting && (
            <View style={styles.rerouteBanner}>
              <ActivityIndicator size="small" color="#FFC107"/>
              <Text style={styles.rerouteText}>Đang tìm lại đường đi mới...</Text>
            </View>
          )}

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
    shadowOffset: {width: 0, height: 4},
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
  rerouteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.45)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  rerouteText: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
