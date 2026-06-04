import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const MAP_STYLES = [
  {
    id: 'liberty' as const,
    label: 'Mặc định',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    color: '#3b82f6',
  },
  {
    id: 'bright' as const,
    label: 'Tươi sáng',
    url: 'https://tiles.openfreemap.org/styles/bright',
    color: '#f59e0b',
  },
  {
    id: 'positron' as const,
    label: 'Tối giản',
    url: 'https://tiles.openfreemap.org/styles/positron',
    color: '#9ca3af',
  },
] as const;

export type MapStyleId = (typeof MAP_STYLES)[number]['id'];

interface MapStylePickerProps {
  currentStyleId: MapStyleId;
  onSelect: (styleId: MapStyleId) => void;
}

export function MapStylePicker({ currentStyleId, onSelect }: MapStylePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Loại bản đồ</Text>
      {MAP_STYLES.map((style) => {
        const isActive = style.id === currentStyleId;
        return (
          <TouchableOpacity
            key={style.id}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onSelect(style.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: style.color }]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {style.label}
            </Text>
            {isActive && (
              <MaterialIcons name="check" size={14} color="#009688" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
  },
  heading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  optionActive: {
    backgroundColor: '#f0faf9',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  labelActive: {
    color: '#009688',
    fontWeight: '600',
  },
});
