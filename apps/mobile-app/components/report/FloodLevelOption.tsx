import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import type { FloodLevel } from '../../types/flood.types';

export type { FloodLevel };

interface FloodLevelConfig {
  level: FloodLevel;
  label: string;
  description: string;
  iconBg: string;
  borderColor: string;
  icon: React.ReactNode;
}

const LEVEL_CONFIGS: FloodLevelConfig[] = [
  {
    level: 'ankle',
    label: 'Ngập mắt cá chân',
    description: 'Mức nước 5-15cm, xe có thể di chuyển chậm',
    iconBg: 'rgba(251,140,0,0.1)',
    borderColor: '#fb8c00',
    icon: <MaterialCommunityIcons name="waves" size={24} color="#fb8c00" />,
  },
  {
    level: 'half_wheel',
    label: 'Ngập nửa bánh xe',
    description: 'Mức nước 15-30cm, nguy cơ hỏng xe cao',
    iconBg: 'rgba(251,140,0,0.15)',
    borderColor: '#fb8c00',
    icon: <FontAwesome5 name="motorcycle" size={22} color="#fb8c00" />,
  },
  {
    level: 'engine_off',
    label: 'Ngập chết máy',
    description: 'Mức nước >30cm, không thể di chuyển',
    iconBg: 'rgba(229,57,53,0.1)',
    borderColor: '#e53935',
    icon: <Ionicons name="warning" size={24} color="#e53935" />,
  },
];

interface FloodLevelOptionProps {
  level: FloodLevel;
  selected: boolean;
  onSelect: (level: FloodLevel) => void;
}

export function FloodLevelOption({ level, selected, onSelect }: FloodLevelOptionProps) {
  const config = LEVEL_CONFIGS.find((c) => c.level === level)!;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && { borderColor: config.borderColor, borderWidth: 2 },
      ]}
      onPress={() => onSelect(level)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
        {config.icon}
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{config.label}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** Convenience: render all 3 options as a group */
interface FloodLevelGroupProps {
  selected: FloodLevel | null;
  onSelect: (level: FloodLevel) => void;
}

export function FloodLevelGroup({ selected, onSelect }: FloodLevelGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.sectionTitle}>Chọn mức độ ngập</Text>
      {LEVEL_CONFIGS.map((config) => (
        <FloodLevelOption
          key={config.level}
          level={config.level}
          selected={selected === config.level}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: -0.5,
    lineHeight: 18,
  },
});
