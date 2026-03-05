import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';

interface SettingsSliderRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (val: number) => void;
}

export function SettingsSliderRow({
  icon,
  iconBg,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onValueChange,
}: SettingsSliderRowProps) {
  const trackWidth = useRef(0);

  const clamp = useCallback(
    (raw: number) => {
      const stepped = Math.round((raw - min) / step) * step + min;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (trackWidth.current === 0) return;
        const ratio = e.nativeEvent.locationX / trackWidth.current;
        onValueChange(clamp(min + ratio * (max - min)));
      },
      onPanResponderMove: (e) => {
        if (trackWidth.current === 0) return;
        const ratio = Math.max(
          0,
          Math.min(1, e.nativeEvent.locationX / trackWidth.current),
        );
        onValueChange(clamp(min + ratio * (max - min)));
      },
    }),
  ).current;

  const progress = (value - min) / (max - min);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>
          {value} {unit}
        </Text>
      </View>

      {/* Slider track */}
      <View
        style={styles.trackWrapper}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { flex: progress }]} />
          <View style={styles.thumbWrapper}>
            <View style={styles.thumb} />
          </View>
          <View style={{ flex: 1 - progress }} />
        </View>
      </View>

      {/* Min/max labels */}
      <View style={styles.rangeRow}>
        <Text style={styles.rangeLabel}>
          {min} {unit}
        </Text>
        <Text style={styles.rangeLabel}>
          {max} {unit}
        </Text>
      </View>
    </View>
  );
}

const THUMB_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: -0.3,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#009688',
    letterSpacing: -0.3,
  },
  trackWrapper: {
    paddingVertical: 10,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fill: {
    height: 6,
    backgroundColor: '#009688',
    borderRadius: 3,
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginHorizontal: -(THUMB_SIZE / 2),
    zIndex: 1,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#009688',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: -0.2,
  },
});

