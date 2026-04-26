import { apiFetch } from './apiClient';
import type {
  NotificationPreferenceResponse,
  NotificationPreferenceDTO,
  NotificationListResponse,
  UnreadCountResponse,
} from '../types/notification.types';

export const notificationService = {
  /**
   * Lấy cấu hình thông báo của user
   */
  getPreferences: (): Promise<NotificationPreferenceResponse> =>
    apiFetch<NotificationPreferenceResponse>('/notifications/preferences'),

  /**
   * Cập nhật cấu hình thông báo
   */
  updatePreferences: (dto: NotificationPreferenceDTO): Promise<NotificationPreferenceResponse> =>
    apiFetch<NotificationPreferenceResponse>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  /**
   * Lấy danh sách thông báo với phân trang
   */
  getNotifications: (page = 0, size = 20): Promise<NotificationListResponse> =>
    apiFetch<NotificationListResponse>(`/notifications?page=${page}&size=${size}`),

  /**
   * Đếm số thông báo chưa đọc
   */
  getUnreadCount: (): Promise<UnreadCountResponse> =>
    apiFetch<UnreadCountResponse>('/notifications/unread-count'),

  /**
   * Đánh dấu một thông báo đã đọc
   */
  markAsRead: (notificationId: string): Promise<void> =>
    apiFetch<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: (): Promise<void> =>
    apiFetch<void>('/notifications/read-all', {
      method: 'PUT',
    }),
};
