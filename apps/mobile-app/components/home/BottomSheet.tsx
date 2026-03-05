import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { FloodPointCard, FloodPoint } from './FloodPointCard';

interface BottomSheetProps {
  title?: string;
  items: FloodPoint[];
}

export function BottomSheet({ title = 'Điểm ngập gần bạn', items }: BottomSheetProps) {
  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handle} />

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Flood point list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <FloodPointCard
            key={item.id}
            name={item.name}
            description={item.description}
            timeAgo={item.timeAgo}
            severity={item.severity}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    maxHeight: 240,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
