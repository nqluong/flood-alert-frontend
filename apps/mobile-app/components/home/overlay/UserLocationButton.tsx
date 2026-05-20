import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserLocationButtonProps {
  onPress: () => void;
  hasLocation: boolean;
  error?: string | null;
}

export function UserLocationButton({ onPress, hasLocation, error }: UserLocationButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, !hasLocation && styles.buttonDisabled]}
      onPress={onPress}
      disabled={!hasLocation}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {error ? (
          <Ionicons name="location-outline" size={20} color="#ef5350" />
        ) : hasLocation ? (
          <Ionicons name="locate" size={20} color="#3b82f6" />
        ) : (
          <Ionicons name="locate-outline" size={20} color="#9e9e9e" />
        )}
      </View>
      {error && (
        <View style={styles.errorBadge}>
          <Ionicons name="alert-circle" size={12} color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef5350',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
