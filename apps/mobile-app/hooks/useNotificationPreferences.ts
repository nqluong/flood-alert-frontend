import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/notification.service';
import { useAlert } from './useAlert';
import type { NotificationPreferenceDTO } from '../types/notification.types';

export function useNotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [severeOnly, setSevereOnly] = useState(false);
  const [radius, setRadius] = useState(5);
  const { showError } = useAlert();
  
  // Store full preferences from server
  const fullPreferences = useRef<NotificationPreferenceDTO>({
    enabled: true,
    preferPush: true,
    floodAlerts: true,
    quietHoursEnabled: false,
    alertRadiusMeters: 5000,
  });
  
  // Debounce timer for radius updates
  const radiusUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (radiusUpdateTimer.current) {
        clearTimeout(radiusUpdateTimer.current);
      }
    };
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getPreferences();
      
      // Store full preferences
      fullPreferences.current = {
        enabled: prefs.enabled,
        preferPush: prefs.preferPush,
        floodAlerts: prefs.floodAlerts,
        quietHoursEnabled: prefs.quietHoursEnabled,
        quietHoursStart: prefs.quietHoursStart,
        quietHoursEnd: prefs.quietHoursEnd,
        alertRadiusMeters: prefs.alertRadiusMeters,
      };
      
      // Map to UI state
      setPushEnabled(prefs.enabled && prefs.preferPush);
      setSevereOnly(!prefs.floodAlerts); // severeOnly is inverse of floodAlerts
      setRadius(prefs.alertRadiusMeters / 1000); // Convert meters to km
    } catch (error) {
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Không thể tải cài đặt thông báo';
      
      showError('Không thể tải cài đặt', errorMessage);
      
      setPushEnabled(true);
      setSevereOnly(false);
      setRadius(5);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: NotificationPreferenceDTO) => {
    try {
      // Merge with existing preferences to send all required fields
      const fullUpdate: NotificationPreferenceDTO = {
        ...fullPreferences.current,
        ...updates,
      };
      
      await notificationService.updatePreferences(fullUpdate);
      
      // Update stored preferences
      fullPreferences.current = fullUpdate;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      
      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Không thể cập nhật cài đặt';
      
      showError('Cập nhật thất bại', errorMessage);
      
      // Reload preferences to revert UI to server state
      loadPreferences();
    }
  };

  const handlePushEnabledChange = (value: boolean) => {
    setPushEnabled(value);
    updatePreferences({ 
      enabled: value,
      preferPush: value,
    });
  };

  const handleSevereOnlyChange = (value: boolean) => {
    setSevereOnly(value);
    updatePreferences({ 
      floodAlerts: !value, // Inverse mapping
    });
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    
    // Clear existing timer
    if (radiusUpdateTimer.current) {
      clearTimeout(radiusUpdateTimer.current);
    }
    
    // Set new timer to update after 1 second of no changes
    radiusUpdateTimer.current = setTimeout(() => {
      updatePreferences({ 
        alertRadiusMeters: value * 1000, // Convert km to meters
      });
    }, 1000);
  };

  return {
    loading,
    pushEnabled,
    severeOnly,
    radius,
    handlePushEnabledChange,
    handleSevereOnlyChange,
    handleRadiusChange,
  };
}
