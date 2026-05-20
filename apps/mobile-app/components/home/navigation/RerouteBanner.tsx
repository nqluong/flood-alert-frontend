import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  text?: string;
}

export function RerouteBanner({ visible, text = 'Đang tìm lại đường đi mới...' }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.banner}>
      <ActivityIndicator size="small" color="#FFC107" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.45)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  text: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
