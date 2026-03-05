import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsNavRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  /** Right-side value text instead of chevron (e.g. "1.0.5") */
  value?: string;
  onPress?: () => void;
  last?: boolean;
}

export function SettingsNavRow({
  icon,
  iconBg,
  label,
  value,
  onPress,
  last = false,
}: SettingsNavRowProps) {
  const Wrapper = onPress && !value ? TouchableOpacity : View;
  const wrapperProps = onPress && !value ? { onPress, activeOpacity: 0.7 } : {};

  return (
    // @ts-ignore dynamic wrapper props
    <Wrapper style={[styles.row, !last && styles.divider]} {...wrapperProps}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      )}
    </Wrapper>
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
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: -0.3,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: -0.3,
  },
});
