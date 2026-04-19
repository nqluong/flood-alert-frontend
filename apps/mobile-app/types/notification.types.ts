/**
 * Notification Preference Types
 */

export interface NotificationPreferenceResponse {
  enabled: boolean;
  floodAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "HH:mm" format
  quietHoursEnd: string;   // "HH:mm" format
  alertRadiusMeters: number;
  preferPush: boolean;
}

export interface NotificationPreferenceDTO {
  enabled?: boolean;
  floodAlerts?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  alertRadiusMeters?: number;
  preferPush?: boolean;
}
