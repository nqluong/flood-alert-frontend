import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBarWithAutocomplete } from './SearchBarWithAutocomplete';
import { UserLocationButton } from './UserLocationButton';
import { MapControlButton } from './MapControlButton';
import { FABCamera } from './FABCamera';
import { MapStylePicker, type MapStyleId } from './MapStylePicker';
import type { GeocodingResult } from '../../../services/geocoding.service';

interface MapOverlayProps {
  topInset: number;
  userLocation: [number, number] | null;
  locationError: string | null;
  onSelectLocation: (result: GeocodingResult) => void;
  onClearSearch: () => void;
  onLocateUser: () => void;
  onCameraPress: () => void;
  currentMapStyleId: MapStyleId;
  onMapStyleChange: (id: MapStyleId) => void;
}

export function MapOverlay({
  topInset,
  userLocation,
  locationError,
  onSelectLocation,
  onClearSearch,
  onLocateUser,
  onCameraPress,
  currentMapStyleId,
  onMapStyleChange,
}: MapOverlayProps) {
  const [showStylePicker, setShowStylePicker] = useState(false);

  return (
    <>
      {/* Backdrop — closes picker when tapping outside */}
      {showStylePicker && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, styles.backdrop]}
          activeOpacity={1}
          onPress={() => setShowStylePicker(false)}
        />
      )}

      {/* Search Bar */}
      <View style={[styles.searchBarWrapper, { top: topInset + 8 }]}>
        <SearchBarWithAutocomplete
          onSelectLocation={onSelectLocation}
          onClearSearch={onClearSearch}
          userLocation={userLocation}
        />
      </View>

      {/* Map Controls */}
      <View style={[styles.mapControls, { top: topInset + 80 }]}>
        <UserLocationButton
          onPress={onLocateUser}
          hasLocation={!!userLocation}
          error={locationError}
        />
        <MapControlButton onPress={() => setShowStylePicker((p) => !p)}>
          <MaterialIcons
            name="layers"
            size={22}
            color={showStylePicker ? '#009688' : '#374151'}
          />
        </MapControlButton>
      </View>

      {/* Style Picker Popup — rendered outside mapControls to avoid Android overflow clipping */}
      {showStylePicker && (
        <View style={[styles.pickerPopup, { top: topInset + 140 }]}>
          <MapStylePicker
            currentStyleId={currentMapStyleId}
            onSelect={(id) => {
              onMapStyleChange(id);
              setShowStylePicker(false);
            }}
          />
        </View>
      )}

      {/* Camera FAB */}
      <View style={styles.fabWrapper}>
        <FABCamera onPress={onCameraPress} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 9,
  },
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
  pickerPopup: {
    position: 'absolute',
    right: 80, // 16 (screen margin) + 56 (button width) + 8 (gap)
    zIndex: 11,
  },
  fabWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    zIndex: 30,
  },
});
