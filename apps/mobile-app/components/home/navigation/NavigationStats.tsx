import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { formatDistance } from '../../../utils/orsStepIcon';

interface Props {
  isOffRoute: boolean;
  distanceFromRoute: number;
  totalRemainingDistance: number;
}

export function NavigationStats({ isOffRoute, distanceFromRoute, totalRemainingDistance }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <View style={styles.statHeader}>
          <MaterialIcons
            name={isOffRoute ? 'warning' : 'check-circle'}
            size={14}
            color={isOffRoute ? '#F44336' : '#4CAF50'}
          />
          <Text style={styles.label}>Trạng thái</Text>
        </View>
        <Text style={[styles.value, isOffRoute && styles.error]}>
          {isOffRoute ? 'Lệch đường' : 'Đúng đường'}
        </Text>
      </View>

      <View style={styles.stat}>
        <View style={styles.statHeader}>
          <MaterialIcons name="my-location" size={14} color="#90CAF9" />
          <Text style={styles.label}>Lệch</Text>
        </View>
        <Text style={styles.value}>{Math.round(distanceFromRoute)} m</Text>
      </View>

      <View style={styles.stat}>
        <View style={styles.statHeader}>
          <MaterialIcons name="flag" size={14} color="#90CAF9" />
          <Text style={styles.label}>Còn lại</Text>
        </View>
        <Text style={styles.value}>{formatDistance(totalRemainingDistance)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  value: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '700',
  },
  error: {
    color: '#F44336',
  },
});
