import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBarWithAutocomplete } from './SearchBarWithAutocomplete';
import { UserLocationButton } from './UserLocationButton';
import { MapControlButton } from './MapControlButton';
import { FABCamera } from './FABCamera';
import type { GeocodingResult } from '../../services/geocoding.service';

interface MapOverlayProps {
  topInset: number;
  userLocation: [number, number] | null;
  locationError: string | null;
  onSelectLocation: (result: GeocodingResult) => void;
  onClearSearch: () => void; // Thêm prop
  onLocateUser: () => void;
  onCameraPress: () => void;
}

export function MapOverlay({
  topInset,
  userLocation,
  locationError,
  onSelectLocation,
  onClearSearch,
  onLocateUser,
  onCameraPress,
}: MapOverlayProps) {
  return (
    <>
      {/* Search Bar */}
      <View style={[styles.searchBarWrapper, { top: topInset + 8 }]}>
        <SearchBarWithAutocomplete
          onSelectLocation={onSelectLocation}
          onClearSearch={onClearSearch}
          userLocation={userLocation}
        />
      </View>

      {/* Map Controls */}
      <View style={[styles.mapControls, { top: topInset + 72 }]}>
        <UserLocationButton
          onPress={onLocateUser}
          hasLocation={!!userLocation}
          error={locationError}
        />
        <MapControlButton>
          <MaterialIcons name="layers" size={22} color="#374151" />
        </MapControlButton>
      </View>

      {/* Camera FAB */}
      <View style={styles.fabWrapper}>
        <FABCamera onPress={onCameraPress} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchBarWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    gap: 12,
    zIndex: 10,
  },
  fabWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    zIndex: 30,
  },
});
