import type { FloodLifecycleEvent } from '../../types/flood.types';

export type ActivityColor = 'red' | 'orange' | 'green' | 'blue';

export interface ActivityItemData {
  id:          string;
  title:       string;
  description: string;
  time:        string;
  color:       ActivityColor;
}

export function eventToActivity(event: FloodLifecycleEvent): ActivityItemData {
  const timeStr = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const loc = event.location || event.eventId;

  switch (event.type) {
    case 'CREATED':
      return {
        id:          `${event.eventId}-created-${Date.now()}`,
        title:       'Phát hiện điểm ngập mới',
        description: `${loc} — Mực nước: ${event.waterLevel.toFixed(2)} cm`,
        time:        timeStr,
        color:       event.severityLevel === 'DANGER' ? 'red' : 'orange',
      };
    case 'ESCALATED':
      return {
        id:          `${event.eventId}-escalated-${Date.now()}`,
        title:       `Mức độ ngập tăng lên ${event.severityLevel}`,
        description: `${loc} — Mực nước: ${event.waterLevel.toFixed(2)} cm`,
        time:        timeStr,
        color:       event.severityLevel === 'DANGER' ? 'red' : 'orange',
      };
    case 'RESOLVED':
      return {
        id:          `${event.eventId}-resolved-${Date.now()}`,
        title:       'Điểm ngập đã được giải quyết',
        description: loc,
        time:        timeStr,
        color:       'green',
      };
    default:
      return {
        id:          `${event.eventId}-unknown-${Date.now()}`,
        title:       'Sự kiện lũ lụt',
        description: loc,
        time:        timeStr,
        color:       'blue',
      };
  }
}
