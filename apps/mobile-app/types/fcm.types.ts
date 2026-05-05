

export interface FcmTokenRequest {
  token: string;
  deviceType: 'ANDROID' | 'IOS';
  deviceId: string;
  deviceName?: string;
}

export interface FcmTokenResponse {
  success: boolean;
  message: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'ANDROID' | 'IOS';
  deviceName: string;
}
