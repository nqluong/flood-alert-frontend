import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsInfoBoxProps {
  message: string;
}

export function SettingsInfoBox({ message }: SettingsInfoBoxProps) {
  return (
    <View style={styles.box}>
      <Ionicons
        name="information-circle"
        size={18}
        color="#1d4ed8"
        style={styles.icon}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(219,234,254,0.7)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  icon: {
    marginTop: 1,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: '#1e3a5f',
    letterSpacing: -0.2,
    lineHeight: 19,
  },
});
