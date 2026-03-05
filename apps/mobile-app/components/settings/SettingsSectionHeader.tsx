import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface SettingsSectionHeaderProps {
  title: string;
}

export function SettingsSectionHeader({ title }: SettingsSectionHeaderProps) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
});
