import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFloodToastContext } from '../../context/FloodToastContext';

const AUTO_DISMISS_MS = 5000;

type ToastStyle = {
  bg: string;
  border: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
};

const TYPE_MAP: Record<string, ToastStyle> = {
  FLOOD_ALERT: {
    bg: '#fff7ed',
    border: '#fed7aa',
    iconName: 'water',
    iconColor: '#ea580c',
    iconBg: '#ffedd5',
  },
  FLOOD_RESOLVED: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    iconName: 'checkmark-circle',
    iconColor: '#16a34a',
    iconBg: '#dcfce7',
  },
  FLOOD_UPDATE: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    iconName: 'information-circle',
    iconColor: '#2563eb',
    iconBg: '#dbeafe',
  },
  SYSTEM_UPDATE: {
    bg: '#f9fafb',
    border: '#e5e7eb',
    iconName: 'notifications',
    iconColor: '#6b7280',
    iconBg: '#f3f4f6',
  },
};

const DEFAULT_STYLE = TYPE_MAP.FLOOD_ALERT;

export function FloodToastBanner() {
  const { toast, dismissToast } = useFloodToastContext();
  const { top } = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slideOut = useCallback(
    (onDone?: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -140,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        dismissToast();
        onDone?.();
      });
    },
    [translateY, opacity, dismissToast],
  );

  useEffect(() => {
    if (!toast) return;

    // Reset position before animating in
    translateY.setValue(-140);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 160,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => slideOut(), AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!toast) return null;

  const ts = TYPE_MAP[toast.notificationType] ?? DEFAULT_STYLE;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: top + 8, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => slideOut()}
        style={[styles.card, { backgroundColor: ts.bg, borderColor: ts.border }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: ts.iconBg }]}>
          <Ionicons name={ts.iconName} size={22} color={ts.iconColor} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {toast.title}
          </Text>
          {!!toast.body && (
            <Text style={styles.body} numberOfLines={2}>
              {toast.body}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={() => slideOut()} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
  },
});
