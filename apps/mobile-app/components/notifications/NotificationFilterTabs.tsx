import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type NotificationFilter = 'all' | 'urgent' | 'unread';

interface FilterOption {
  key: NotificationFilter;
  label: string;
}

const FILTERS: FilterOption[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'urgent', label: 'Khẩn cấp' },
  { key: 'unread', label: 'Chưa đọc' },
];

interface NotificationFilterTabsProps {
  active: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
  unreadCount?: number;
}

export function NotificationFilterTabs({ active, onChange, unreadCount = 0 }: NotificationFilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {FILTERS.map((item) => {
          const isActive = active === item.key;
          const showBadge = item.key === 'unread' && unreadCount > 0;
          
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChange(item.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#009688',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: -0.3,
  },
  labelActive: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#e53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
