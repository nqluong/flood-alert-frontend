import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface SettingsToggleRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  /** Hide bottom divider on last item */
  last?: boolean;
}

export function SettingsToggleRow({
  icon,
  iconBg,
  label,
  description,
  value,
  onValueChange,
  last = false,
}: SettingsToggleRowProps) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#009688' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
});
