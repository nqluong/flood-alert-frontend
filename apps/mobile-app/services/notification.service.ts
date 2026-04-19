import { apiFetch } from './apiClient';
import type {
  NotificationPreferenceResponse,
  NotificationPreferenceDTO,
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
};
