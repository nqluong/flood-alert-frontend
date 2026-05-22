import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { storageService } from '../services/storage.service';
import { fcmTokenService } from '../services/fcmToken.service';
import { getDeviceInfo } from './deviceInfo';

const FCM_TOKEN_CACHE_KEY = 'fcm_token_cache';

/**
 * FCM Token Manager
 * Quản lý việc lấy, cache và đồng bộ FCM Token với Backend
 */
export class FcmTokenManager {
  private static instance: FcmTokenManager;
  private tokenRefreshUnsubscribe: (() => void) | null = null;

  private constructor() {}

  static getInstance(): FcmTokenManager {
    if (!FcmTokenManager.instance) {
      FcmTokenManager.instance = new FcmTokenManager();
    }
    return FcmTokenManager.instance;
  }

  /**
   * Xin quyền và lấy FCM Token
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      console.log('[FCM] Requesting notification permission...');

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('[FCM] Permission denied by user');
        return null;
      }

      console.log('[FCM] Permission granted, getting token...');

      const token = await messaging().getToken();
      
      if (!token) {
        console.error('[FCM] Failed to get FCM token');
        return null;
      }

      console.log('[FCM] Token obtained successfully');
      return token;
    } catch (error) {
      console.error('[FCM] Error requesting permission or getting token:', error);
      return null;
    }
  }

  /**
   * Đồng bộ FCM Token lên Backend
   */
  async syncTokenWithBackend(token: string): Promise<boolean> {
    try {
      console.log('[FCM] Syncing token with backend...');

      // Lấy thông tin thiết bị
      const deviceInfo = await getDeviceInfo();
      console.log('[FCM] Device info:', deviceInfo);

      // Kiểm tra cache
      const cachedToken = await this.getCachedToken();
      
      if (cachedToken === token) {
        console.log('[FCM] Token unchanged, skipping sync');
        return true;
      }

      // Gửi lên Backend
      await fcmTokenService.upsertToken({
        token,
        deviceType: deviceInfo.deviceType,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
      });

      // Lưu vào cache
      await this.cacheToken(token);
      
      console.log('[FCM] Token synced successfully');
      return true;
    } catch (error) {
      console.error('[FCM] Error syncing token with backend:', error);
      return false;
    }
  }

  /**
   * Lắng nghe sự kiện Token Refresh
   */
  startTokenRefreshListener(): void {
    if (this.tokenRefreshUnsubscribe) {
      console.log('[FCM] Token refresh listener already running');
      return;
    }

    console.log('[FCM] Starting token refresh listener...');

    this.tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (newToken) => {
      console.log('[FCM] Token refreshed by Firebase:', newToken);
      
      // Đồng bộ token mới lên Backend
      await this.syncTokenWithBackend(newToken);
    });
  }

  /**
   * Dừng lắng nghe Token Refresh
   */
  stopTokenRefreshListener(): void {
    if (this.tokenRefreshUnsubscribe) {
      console.log('[FCM] Stopping token refresh listener...');
      this.tokenRefreshUnsubscribe();
      this.tokenRefreshUnsubscribe = null;
    }
  }

  /**
   * Hủy FCM Token khi Logout
   */
  async deactivateTokenOnLogout(): Promise<boolean> {
    try {
      console.log('[FCM] Deactivating token on logout...');

      const deviceInfo = await getDeviceInfo();

      await fcmTokenService.deactivateToken(deviceInfo.deviceId);

      await this.clearCachedToken();

      this.stopTokenRefreshListener();

      try {
        await messaging().deleteToken();
      } catch (error) {
        console.warn('[FCM] Failed to delete Firebase token:', error);
      }

      console.log('[FCM] Token deactivated successfully');
      return true;
    } catch (error) {
      console.error('[FCM] Error deactivating token:', error);
      return false;
    }
  }

  /**
   * Xin quyền + Lấy token + Đồng bộ + Lắng nghe
   * Gọi sau khi user đăng nhập thành công
   */
  async initializeAfterLogin(): Promise<boolean> {
    try {
      console.log('[FCM] Initializing FCM after login...');

      // Clear stale cache so syncTokenWithBackend always re-syncs on login,
      // even if the app was killed before logout could clear it.
      await this.clearCachedToken();

      const token = await this.requestPermissionAndGetToken();
      
      if (!token) {
        console.log('[FCM] No token obtained, initialization stopped');
        return false;
      }

      const synced = await this.syncTokenWithBackend(token);
      
      if (!synced) {
        console.warn('[FCM] Token sync failed, but continuing...');
      }

      this.startTokenRefreshListener();

      console.log('[FCM] Initialization completed successfully');
      return true;
    } catch (error) {
      console.error('[FCM] Error during initialization:', error);
      return false;
    }
  }

  /**
   * Lấy FCM Token hiện tại (nếu có)
   */
  async getCurrentToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token || null;
    } catch (error) {
      console.error('[FCM] Error getting current token:', error);
      return null;
    }
  }

  /**
   * Kiểm tra quyền thông báo
   */
  async checkPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('[FCM] Error checking permission:', error);
      return false;
    }
  }

  private async getCachedToken(): Promise<string | null> {
    try {
      return await storageService.getItem(FCM_TOKEN_CACHE_KEY);
    } catch (error) {
      console.error('[FCM] Error getting cached token:', error);
      return null;
    }
  }

  private async cacheToken(token: string): Promise<void> {
    try {
      await storageService.setItem(FCM_TOKEN_CACHE_KEY, token);
    } catch (error) {
      console.error('[FCM] Error caching token:', error);
    }
  }

  private async clearCachedToken(): Promise<void> {
    try {
      await storageService.removeItem(FCM_TOKEN_CACHE_KEY);
    } catch (error) {
      console.error('[FCM] Error clearing cached token:', error);
    }
  }
}

export const fcmTokenManager = FcmTokenManager.getInstance();
