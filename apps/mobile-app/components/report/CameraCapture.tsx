import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';

const CAMERA_HEIGHT = Math.max(200, Math.round(Dimensions.get('window').height * 0.32));
import { Ionicons } from '@expo/vector-icons';

interface CameraCaptureProps {
  /** URI of captured/selected image, null = show placeholder */
  imageUri?: string | null;
  onCapturePress?: () => void;
}

export function CameraCapture({ imageUri, onCapturePress }: CameraCaptureProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.4)" />
            <Text style={styles.placeholderText}>Chụp ảnh điểm ngập</Text>
          </View>
        )}
        {/* Border overlay */}
        <View style={styles.borderOverlay} pointerEvents="none" />
      </View>

      {/* Shutter button — sits at the bottom edge of the card */}
      <TouchableOpacity
        style={styles.shutterOuter}
        onPress={onCapturePress}
        activeOpacity={0.85}
      >
        <View style={styles.shutterRing} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: CAMERA_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  borderOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shutterOuter: {
    position: 'absolute',
    bottom: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  shutterRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#009688',
    backgroundColor: 'transparent',
  },
});
