import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CameraModeButton, type CameraMode } from './CameraModeButton';
import { NavigationInstructionCard } from './NavigationInstructionCard';
import { useAlert } from '../../../hooks/useAlert';
import type { RouteStep } from '../../../hooks/useNavigationTracking';

interface Props {
  topInset: number;
  destinationName: string;
  currentStep: RouteStep | null;
  nextStep: RouteStep | null;
  distanceToNextStep: number;
  cameraMode: CameraMode;
  onCycleCameraMode: () => void;
  onStop: () => void;
}

/**
 * Panel hiển thị trạng thái và hướng dẫn khi đang điều hướng.
 */
export function NavigationPanel({
  topInset,
  destinationName,
  currentStep,
  nextStep,
  distanceToNextStep,
  cameraMode,
  onCycleCameraMode,
  onStop,
}: Props) {
  const { showConfirm } = useAlert();

  const handleStopPress = () => {
    showConfirm(
      'Dừng điều hướng',
      'Bạn có chắc muốn dừng điều hướng?',
      onStop,
      { cancelLabel: 'Huỷ', confirmLabel: 'Dừng', destructive: true },
    );
  };

  return (
    <View style={[styles.panel, { top: topInset + 10 }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="navigate" size={20} color="#2196F3" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>Đang đi đến</Text>
            <Text style={styles.headerDestination} numberOfLines={1}>
              {destinationName || 'Đích đến'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <CameraModeButton mode={cameraMode} onPress={onCycleCameraMode} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleStopPress}
            hitSlop={6}
            accessibilityLabel="Dừng điều hướng"
          >
            <Ionicons name="close" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <NavigationInstructionCard
        currentStep={currentStep}
        nextStep={nextStep}
        distanceToNextStep={distanceToNextStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  headerDestination: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
