/**
 * Background Tasks & Polling Module
 * 
 * Tất cả các logic chạy ngầm và polling được tổ chức tại đây
 */

// Background Location Task
export { LOCATION_TASK_NAME } from './BackgroundLocationTask';

// Unread Notifications Context (với polling)
export {
  UnreadNotificationsProvider,
  useUnreadNotificationsContext,
} from './UnreadNotificationsContext';
export type { UnreadNotificationsContextType } from './UnreadNotificationsContext';

// Auto-start utilities
export { autoStartLocationTracking } from './autoStartLocationTracking';
