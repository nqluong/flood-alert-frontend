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
      anchor={{ x: 0.5, y: 0.9 }}
      allowOverlap={true}
      style={{ zIndex: 1000 }}
    >
      <View style={styles.container}>
        {/* Action buttons */}
        {(showDirections || onClose) && (
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
        )}
        
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
    width: 140,
    zIndex: 1000,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    zIndex: 1001,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1002,
  },
  directionsButton: {
    backgroundColor: '#3b82f6',
    minWidth: 80,
  },
  closeButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 10,
    minWidth: 40,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});
