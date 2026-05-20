import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { formatDistance, getOrsStepIcon } from '../../../utils/orsStepIcon';
import type { RouteStep } from '../../../hooks/useNavigationTracking';

interface Props {
  currentStep: RouteStep | null;
  nextStep: RouteStep | null;
  distanceToNextStep: number;
}

/**
 * Card hiển thị hướng dẫn rẽ kế tiếp lấy từ ORS steps.
 */
export function NavigationInstructionCard({ currentStep, nextStep, distanceToNextStep }: Props) {
  if (!currentStep) return null;

  const shown = nextStep ?? currentStep;
  const iconName = getOrsStepIcon(shown.type);

  const secondary = nextStep
    ? `Còn ${formatDistance(distanceToNextStep)}${nextStep.name ? ` · ${nextStep.name}` : ''}`
    : 'Tiếp tục đi thẳng đến đích';

  return (
    <View style={styles.box}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={iconName} size={32} color="#90CAF9" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.primary} numberOfLines={2}>
          {shown.instruction}
        </Text>
        <Text style={styles.secondary}>{secondary}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.4)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  primary: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  secondary: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});
