import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { DeviceInfo } from '../types/fcm.types';

/**
 * Lấy thông tin thiết bị
 * Device ID phải là unique và persistent (không đổi khi reinstall app)
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  // Lấy Device ID duy nhất
  // Trên Android: androidId hoặc installationId
  // Trên iOS: identifierForVendor hoặc installationId
  const deviceId = await getUniqueDeviceId();
  
  // Xác định loại thiết bị
  const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
  
  // Lấy tên thiết bị
  const deviceName = getDeviceName();
  
  return {
    deviceId,
    deviceType,
    deviceName,
  };
}

/**
 * Lấy Device ID duy nhất
 * Priority:
 * 1. Android ID (Android) / Identifier For Vendor (iOS)
 * 2. Installation ID (Expo)
 */
async function getUniqueDeviceId(): Promise<string> {
  try {
    // Trên Android: sử dụng androidId
    if (Platform.OS === 'android' && Device.osBuildId) {
      return `android_${Device.osBuildId}`;
    }
    
    // Trên iOS: sử dụng identifierForVendor (không available trong Expo Go)
    // Fallback to installationId
    const installationId = Constants.installationId;
    
    if (installationId) {
      return `${Platform.OS}_${installationId}`;
    }
    
    // Fallback cuối cùng: tạo ID từ device info
    const fallbackId = `${Platform.OS}_${Device.modelName}_${Date.now()}`;
    console.warn('[DeviceInfo] Using fallback device ID:', fallbackId);
    return fallbackId;
  } catch (error) {
    console.error('[DeviceInfo] Error getting device ID:', error);
    // Fallback ID
    return `${Platform.OS}_${Date.now()}`;
  }
}

/**
 * Lấy tên thiết bị dễ đọc
 * VD: "iPhone 14 Pro", "Samsung Galaxy S23"
 */
function getDeviceName(): string {
  const modelName = Device.modelName || 'Unknown Device';
  const osVersion = Device.osVersion || '';
  
  if (Platform.OS === 'ios') {
    return `${modelName} (iOS ${osVersion})`;
  } else {
    return `${modelName} (Android ${osVersion})`;
  }
}
