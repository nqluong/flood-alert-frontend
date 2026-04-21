import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

MapLibreGL.setAccessToken(null);

interface LocationPickerProps {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number, lon: number) => void;
}

const DEFAULT_CENTER = { lat: 21.0278, lon: 105.8342 }; // Hà Nội
const DEFAULT_ZOOM = 11;

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function LocationPicker({ lat, lon, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const hasPosition = lat !== null && lon !== null;

  const handleMapPress = (feature: any) => {
    const coordinates = feature.geometry.coordinates;
    const newLat = Math.round(coordinates[1] * 1e6) / 1e6;
    const newLon = Math.round(coordinates[0] * 1e6) / 1e6;
    onChange(newLat, newLon);
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

      const newLat = Math.round(location.coords.latitude * 1e6) / 1e6;
      const newLon = Math.round(location.coords.longitude * 1e6) / 1e6;
      onChange(newLat, newLon);
    } catch (error) {
      console.error('Error getting location:', error);
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
        <Text style={styles.hintText}>
          Chạm vào bản đồ để chọn vị trí
          {hasPosition && (
            <Text style={styles.coordsText}>
              {'\n'}Đã chọn: {lat}, {lon}
            </Text>
          )}
        </Text>
        <TouchableOpacity
          style={styles.currentLocationButton}
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
          onPress={handleMapPress}
        >
          <MapLibreGL.Camera
            zoomLevel={hasPosition ? 14 : DEFAULT_ZOOM}
            centerCoordinate={centerCoordinate}
            animationMode="flyTo"
            animationDuration={600}
          />

          <MapLibreGL.RasterSource
            id="osm-source"
            tileUrlTemplates={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
            tileSize={256}
          >
            <MapLibreGL.RasterLayer id="osm-layer" sourceID="osm-source" />
          </MapLibreGL.RasterSource>

          {hasPosition && (
            <MapLibreGL.PointAnnotation
              id="selected-location"
              coordinate={[lon!, lat!]}
            >
              <View style={styles.marker}>
                <Ionicons name="location" size={32} color="#ef5350" />
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
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  coordsText: {
    fontSize: 12,
    color: '#009688',
    fontWeight: '500',
  },
  currentLocationButton: {
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
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
