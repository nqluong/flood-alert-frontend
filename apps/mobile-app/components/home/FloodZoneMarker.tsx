import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type MarkerType = 'flood' | 'water';

interface FloodZoneMarkerProps {
  type: MarkerType;
}

export function FloodZoneMarker({ type }: FloodZoneMarkerProps) {
  if (type === 'flood') {
    return (
      <View style={styles.floodContainer}>
        <View style={styles.floodHalo} />
        <View style={styles.floodInner}>
          <MaterialCommunityIcons name="waves" size={27} color="#ffffff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.waterContainer}>
      <View style={styles.waterHalo} />
      <View style={styles.waterInner}>
        <Ionicons name="water" size={20} color="#ffffff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Flood (red) - larger
  floodContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floodHalo: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#e53935',
    opacity: 0.49,
  },
  floodInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  // Water sensor (orange) - smaller
  waterContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterHalo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fb8c00',
    opacity: 0.45,
  },
  waterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fb8c00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
