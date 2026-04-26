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

/**
 * Notification API Types
 */

export type NotificationType = 'FLOOD_ALERT' | 'FLOOD_UPDATE' | 'SYSTEM_UPDATE';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface NotificationData {
  eventId?: string;
  lat?: number;
  lon?: number;
  severityLevel?: string;
  waterLevel?: number;
  voteCount?: number;
  [key: string]: any;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  data: NotificationData;
  isRead: boolean;
  createdAt: string;
  sentAt: string;
  clickedAt: string | null;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
