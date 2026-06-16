import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFloodToastContext, type FloodToastData } from '../../context/FloodToastContext';

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
  REPORT_APPROVED: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    iconName: 'checkmark-done-circle',
    iconColor: '#16a34a',
    iconBg: '#dcfce7',
  },
  REPORT_REJECTED: {
    bg: '#fef2f2',
    border: '#fecaca',
    iconName: 'close-circle',
    iconColor: '#dc2626',
    iconBg: '#fee2e2',
  },
};

const DEFAULT_STYLE = TYPE_MAP.FLOOD_ALERT;

function ToastItem({
  toast,
  index,
  onDismiss,
}: {
  toast: FloodToastData;
  index: number;
  onDismiss: (id: string) => void;
}) {
  // Mỗi toast có timer tự ẩn riêng; toast cũ (thêm trước) sẽ hết hạn trước → stack
  // tự dọn dần từ dưới lên.
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const ts = TYPE_MAP[toast.notificationType] ?? DEFAULT_STYLE;

  // Toast càng ở dưới (index lớn = cũ hơn) càng mờ và thu nhỏ nhẹ để tạo chiều sâu,
  // báo hiệu sắp bị ẩn — nhưng vẫn giữ đủ độ rõ để đọc.
  const itemOpacity = Math.max(0.7, 1 - index * 0.14);
  const itemScale = 1 - index * 0.03;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onDismiss(toast.id)}
      style={[
        styles.card,
        {
          backgroundColor: ts.bg,
          borderColor: ts.border,
          opacity: itemOpacity,
          transform: [{ scale: itemScale }],
        },
      ]}
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

      <TouchableOpacity onPress={() => onDismiss(toast.id)} hitSlop={10} style={styles.closeBtn}>
        <Ionicons name="close" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function FloodToastBanner() {
  const { toasts, dismissToast } = useFloodToastContext();
  const { top } = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.wrapper, { top: top + 8 }]} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} onDismiss={dismissToast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
    gap: 10,
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
