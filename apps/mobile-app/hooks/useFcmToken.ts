import { useEffect, useState } from 'react';
import { fcmTokenManager } from '../utils/fcmTokenManager';

/**
 * Hook để quản lý FCM Token
 * Sử dụng trong các component cần theo dõi trạng thái FCM
 */
export function useFcmToken() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Đồng bộ FCM token (chỉ gửi Backend khi token thay đổi)
   */
  const initializeAfterLogin = async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await fcmTokenManager.ensureTokenSynced();
      setIsInitialized(success);
      
      if (success) {
        const token = await fcmTokenManager.getCurrentToken();
        setCurrentToken(token);
        setHasPermission(true);
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể khởi tạo FCM';
      setError(message);
      return false;
    }
  };

  /**
   * Hủy kích hoạt FCM khi logout
   */
  const deactivateOnLogout = async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await fcmTokenManager.deactivateTokenOnLogout();
      
      if (success) {
        setIsInitialized(false);
        setHasPermission(false);
        setCurrentToken(null);
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể hủy FCM token';
      setError(message);
      return false;
    }
  };

  /**
   * Kiểm tra quyền thông báo
   */
  const checkPermission = async (): Promise<boolean> => {
    try {
      const hasPermission = await fcmTokenManager.checkPermission();
      setHasPermission(hasPermission);
      return hasPermission;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể kiểm tra quyền';
      setError(message);
      return false;
    }
  };

  /**
   * Lấy token hiện tại
   */
  const refreshToken = async (): Promise<string | null> => {
    try {
      const token = await fcmTokenManager.getCurrentToken();
      setCurrentToken(token);
      return token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lấy token';
      setError(message);
      return null;
    }
  };

  return {
    isInitialized,
    hasPermission,
    currentToken,
    error,
    initializeAfterLogin,
    deactivateOnLogout,
    checkPermission,
    refreshToken,
  };
}
