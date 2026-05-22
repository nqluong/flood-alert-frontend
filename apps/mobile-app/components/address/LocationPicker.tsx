import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const DEFAULT_CENTER = { lat: 21.0278, lon: 105.8342 };
const DEFAULT_ZOOM = 11;
const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

interface LocationPickerProps {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number, lon: number) => void;
}

export function LocationPicker({ lat, lon, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const hasPosition = lat !== null && lon !== null;

  const handleMapPress = (feature: any) => {
    const coordinates = feature.geometry.coordinates;
    onChange(
      Math.round(coordinates[1] * 1e6) / 1e6,
      Math.round(coordinates[0] * 1e6) / 1e6,
    );
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Vui lòng cấp quyền truy cập vị trí');
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      onChange(
        Math.round(location.coords.latitude * 1e6) / 1e6,
        Math.round(location.coords.longitude * 1e6) / 1e6,
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    } finally {
      setLoading(false);
    }
  };

  const centerCoordinate = hasPosition
    ? [lon!, lat!]
    : [DEFAULT_CENTER.lon, DEFAULT_CENTER.lat];

  return (
    <View style={styles.container}>
      <View style={styles.hintContainer}>
        <View style={styles.hintTextWrapper}>
          {hasPosition ? (
            <>
              <Text style={styles.hintSelected}>Vị trí đã chọn</Text>
              <Text style={styles.hintCoords}>{lat}, {lon}</Text>
            </>
          ) : (
            <Text style={styles.hintIdle}>Chạm vào bản đồ để chọn vị trí</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.locateButton}
          onPress={handleGetCurrentLocation}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#009688" />
          ) : (
            <Ionicons name="locate" size={20} color="#009688" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.map}
          styleURL={OPENFREEMAP_STYLE}
          onPress={handleMapPress}
        >
          <MapLibreGL.Camera
            zoomLevel={hasPosition ? 15 : DEFAULT_ZOOM}
            centerCoordinate={centerCoordinate}
            animationMode="flyTo"
            animationDuration={600}
          />

          {hasPosition && (
            <MapLibreGL.PointAnnotation
              id="selected-location"
              coordinate={[lon!, lat!]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.pinWrapper}>
                <View style={styles.pinBubble}>
                  <Ionicons name="location-sharp" size={22} color="#ffffff" />
                </View>
                <View style={styles.pinTail} />
              </View>
            </MapLibreGL.PointAnnotation>
          )}
        </MapLibreGL.MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Hint bar
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 52,
  },
  hintTextWrapper: {
    flex: 1,
  },
  hintIdle: {
    fontSize: 13,
    color: '#6b7280',
  },
  hintSelected: {
    fontSize: 13,
    fontWeight: '600',
    color: '#009688',
  },
  hintCoords: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  locateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginLeft: 8,
  },

  // Map
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },

  // Pin marker — anchor={x:0.5, y:1} khiến đuôi pin trỏ đúng vào tọa độ
  pinWrapper: {
    alignItems: 'center',
  },
  pinBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#009688',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#009688',
    marginTop: -2,
  },
});
