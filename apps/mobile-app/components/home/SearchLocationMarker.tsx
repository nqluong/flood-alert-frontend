import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarkerView } from '@maplibre/maplibre-react-native';
import * as Linking from 'expo-linking';

interface SearchLocationMarkerProps {
  coordinate: [number, number];
  name: string;
  onClose?: () => void;
  showDirections?: boolean;
}

export function SearchLocationMarker({ 
  coordinate, 
  name, 
  onClose,
  showDirections = false 
}: SearchLocationMarkerProps) {
  const handleDirections = () => {
    const [lon, lat] = coordinate;
    // Mở Google Maps với directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url);
  };

  return (
    <MarkerView 
      id="search-marker" 
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1 }}
      allowOverlap={true}
    >
      <View style={styles.container}>
        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          {showDirections && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.directionsButton]} 
              onPress={handleDirections}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={16} color="#ffffff" />
              <Text style={styles.actionText}>Chỉ đường</Text>
            </TouchableOpacity>
          )}
          
          {onClose && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.closeButton]} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Pin Icon */}
        <View style={styles.pinContainer}>
          <Ionicons name="location-sharp" size={44} color="#10b981" />
        </View>
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 120,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  directionsButton: {
    backgroundColor: '#3b82f6',
  },
  closeButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
