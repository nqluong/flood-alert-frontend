import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, PanResponder } from 'react-native';
import { FloodPointCard, FloodPoint } from './FloodPointCard';

// Height of the visible "handle" zone when the sheet is collapsed
const PEEK_HEIGHT = 36;
// Minimum drag distance (px) or velocity to trigger snap
const DRAG_THRESHOLD = 50;

interface BottomSheetProps {
  title?: string;
  items: FloodPoint[];
}

export function BottomSheet({ title = 'Điểm ngập gần bạn', items }: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(0);
  const isCollapsed = useRef(false);

  const getMaxTranslate = () => Math.max(0, sheetHeight.current - PEEK_HEIGHT);

  const snapTo = (toValue: number) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 3,
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, { dy }) => {
        const maxY = getMaxTranslate();
        const baseY = isCollapsed.current ? maxY : 0;
        const clamped = Math.max(0, Math.min(baseY + dy, maxY));
        translateY.setValue(clamped);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const maxY = getMaxTranslate();
        if (!isCollapsed.current) {
          if (dy > DRAG_THRESHOLD || vy > 0.5) {
            isCollapsed.current = true;
            snapTo(maxY);
          } else {
            snapTo(0);
          }
        } else {
          if (dy < -DRAG_THRESHOLD || vy < -0.5) {
            isCollapsed.current = false;
            snapTo(0);
          } else {
            snapTo(maxY);
          }
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      onLayout={(e) => {
        sheetHeight.current = e.nativeEvent.layout.height;
      }}
    >
      {/* Drag handle area — pan responder lives here */}
      <View style={styles.handleArea} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>

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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleArea: {
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
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
