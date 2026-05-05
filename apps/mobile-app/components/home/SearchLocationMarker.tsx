import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarkerView } from '@maplibre/maplibre-react-native';

interface SearchLocationMarkerProps {
  coordinate: [number, number];
  name: string;
}

/**
 * Marker đơn giản cho địa điểm đã chọn
 * Không có nút action - tất cả action ở bottom sheet
 */
export function SearchLocationMarker({ 
  coordinate, 
  name,
}: SearchLocationMarkerProps) {
  return (
    <MarkerView 
      id="search-marker" 
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1 }}
      allowOverlap={true}
    >
      <View style={styles.container}>
        {/* Pin Icon */}
        <Ionicons name="location-sharp" size={44} color="#ef4444" />
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
