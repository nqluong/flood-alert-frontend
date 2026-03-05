import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { circle: 48, icon: 22, fontSize: 22 },
  md: { circle: 64, icon: 30, fontSize: 28 },
  lg: { circle: 72, icon: 34, fontSize: 32 },
};

export function AppLogo({ size = 'md' }: AppLogoProps) {
  const s = SIZE_MAP[size];
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.circle,
          { width: s.circle, height: s.circle, borderRadius: s.circle / 2 },
        ]}
      >
        <Ionicons name="umbrella" size={s.icon} color="#ffffff" />
      </View>
      <Text style={[styles.name, { fontSize: s.fontSize }]}>FloodGuard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circle: {
    backgroundColor: '#009688',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
});
