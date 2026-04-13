import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useLocationTracker } from '../hooks/useLocationTracker';

interface LocationTrackingToggleProps {
  autoStart?: boolean;
}

export function LocationTrackingToggle({ autoStart = false }: LocationTrackingToggleProps) {
  const {
    isTracking,
    permissionStatus,
    requestPermissions,
    startTracking,
    stopTracking,
  } = useLocationTracker();

  useEffect(() => {
    if (autoStart && permissionStatus === 'background-granted' && !isTracking) {
      startTracking();
    }
  }, [autoStart, permissionStatus, isTracking, startTracking]);

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Bật tracking
      if (permissionStatus !== 'background-granted') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Cần cấp quyền',
            'Vui lòng vào Cài đặt > FloodGuard > Vị trí > Chọn "Luôn luôn" để nhận cảnh báo ngập lụt kịp thời.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      const success = await startTracking();
      if (!success) {
        Alert.alert('Lỗi', 'Không thể bật theo dõi vị trí');
      }
    } else {
      // Tắt tracking
      await stopTracking();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Theo dõi vị trí</Text>
          <Text style={styles.subtitle}>
            {isTracking 
              ? 'Đang gửi vị trí để nhận cảnh báo' 
              : 'Tắt - Không nhận cảnh báo theo vị trí'}
          </Text>
        </View>
        <Switch
          value={isTracking}
          onValueChange={handleToggle}
          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
          thumbColor={isTracking ? '#ffffff' : '#f3f4f6'}
        />
      </View>
      
      {permissionStatus !== 'background-granted' && (
        <Text style={styles.warning}>
          Cần cấp quyền "Luôn luôn" để hoạt động
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  warning: {
    marginTop: 12,
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
});
