import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RouteInfoPanelProps {
  visible: boolean;
  destinationName: string;
  avoidedFloodsCount: number;
  message: string | null;
  onClose: () => void;
  onStartNavigation?: () => void;
}

/**
 * Panel hiển thị thông tin đường đi đã tìm
 */
export function RouteInfoPanel({
  visible,
  destinationName,
  avoidedFloodsCount,
  message,
  onClose,
  onStartNavigation,
}: RouteInfoPanelProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="navigate" size={24} color="#009688" />
            <View style={styles.headerText}>
              <Text style={styles.title}>Đường đi đến</Text>
              <Text style={styles.destination} numberOfLines={1}>
                {destinationName}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={28} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Route Info */}
        <View style={styles.infoContainer}>
          {/* Success Message */}
          {message && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.infoText}>{message}</Text>
            </View>
          )}

          {/* Avoided Floods */}
          {avoidedFloodsCount > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={18} color="#009688" />
              <Text style={styles.infoText}>
                Tránh được {avoidedFloodsCount} điểm ngập
              </Text>
            </View>
          )}

          {/* Route Line Indicator */}
          <View style={styles.routeIndicator}>
            <View style={styles.routeLine} />
            <Text style={styles.routeText}>Đường đi màu xanh trên bản đồ</Text>
          </View>

          {/* Start Navigation Button */}
          {onStartNavigation && (
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={onStartNavigation}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-circle" size={24} color="#ffffff" />
              <Text style={styles.navigationButtonText}>Bắt đầu điều hướng</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  destination: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  routeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#e6f7f5',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#009688',
  },
  routeLine: {
    width: 24,
    height: 4,
    backgroundColor: '#009688',
    borderRadius: 2,
  },
  routeText: {
    flex: 1,
    fontSize: 13,
    color: '#00695c',
    fontWeight: '600',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#009688',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
