import type { FloodLifecycleEvent } from '../../types/flood.types';

export type ActivityColor = 'critical' | 'danger' | 'warning' | 'success' | 'info';

export interface ActivityItemData {
  id: string;
  title: string;
  description: string;
  time: string;
  color: ActivityColor;
  alertLevel: string;
}

export function eventToActivity(event: FloodLifecycleEvent): ActivityItemData {
  const timeStr = new Date(event.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  // Map alertLevel to color
  const colorMap: Record<string, ActivityColor> = {
    CRITICAL: 'critical',
    DANGER:   'danger',
    WARNING:  'warning',
    SUCCESS:  'success',
    INFO:     'info',
  };

  const color = colorMap[event.alertLevel] || 'info';

  const message = event.alertMessage;
  const parts = message.split(' - ');
  const title = parts[0] || message;
  const wl = event.waterLevel != null ? `${event.waterLevel.toFixed(1)} cm` : '—';
  const description = parts.length > 1
    ? `${parts.slice(1).join(' - ')} - Mực nước: ${wl}`
    : `${event.location} - Mực nước: ${wl}`;

  return {
    id: `${event.eventId}-${event.type.toLowerCase()}-${Date.now()}`,
    title,
    description,
    time: timeStr,
    color,
    alertLevel: event.alertLevel,
  };
}
