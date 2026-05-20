import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type CameraMode = 'follow_3d' | 'follow_2d' | 'overview';

export const CAMERA_MODE_ORDER: CameraMode[] = ['follow_3d', 'follow_2d', 'overview'];

const CAMERA_MODE_LABEL: Record<CameraMode, string> = {
  follow_3d: '3D',
  follow_2d: '2D',
  overview: 'Tổng',
};

const CAMERA_MODE_ICON: Record<CameraMode, React.ComponentProps<typeof MaterialIcons>['name']> = {
  follow_3d: '3d-rotation',
  follow_2d: 'map',
  overview: 'zoom-out-map',
};

export function nextCameraMode(mode: CameraMode): CameraMode {
  const idx = CAMERA_MODE_ORDER.indexOf(mode);
  return CAMERA_MODE_ORDER[(idx + 1) % CAMERA_MODE_ORDER.length];
}

interface Props {
  mode: CameraMode;
  onPress: () => void;
}

export function CameraModeButton({ mode, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityLabel="Đổi góc nhìn camera"
      hitSlop={6}
    >
      <MaterialIcons name={CAMERA_MODE_ICON[mode]} size={18} color="#90CAF9" />
      <Text style={styles.label}>{CAMERA_MODE_LABEL[mode]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.55)',
    justifyContent: 'center',
  },
  label: {
    color: '#90CAF9',
    fontSize: 13,
    fontWeight: '700',
  },
});
