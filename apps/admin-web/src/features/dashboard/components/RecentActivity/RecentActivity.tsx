import { useRef } from 'react';
import './RecentActivity.css';
import type { ActivityItemData } from '../../dashboard.types';
import type { WsStatus } from '../../hooks/useFloodWebSocket';

// ---- ActivityItem sub-component ----
interface ActivityItemProps {
  item: ActivityItemData;
  isNew?: boolean;
}

function ActivityItem({ item, isNew }: ActivityItemProps) {
  return (
    <div className={`activity-item${isNew ? ' activity-item--new' : ''}`}>
      <span className={`activity-item__dot activity-item__dot--${item.color}`} />
      <div className="activity-item__body">
        <p className="activity-item__title">{item.title}</p>
        <p className="activity-item__description">{item.description}</p>
        <p className="activity-item__time">{item.time}</p>
      </div>
    </div>
  );
}

// ---- RecentActivity panel ----
interface RecentActivityProps {
  recentActivities: ActivityItemData[];
  wsStatus:         WsStatus;
}

export default function RecentActivity({ recentActivities, wsStatus }: RecentActivityProps) {
  const newestIdRef = useRef<string | null>(null);

  if (recentActivities.length > 0) {
    newestIdRef.current = recentActivities[0].id;
  }

  const wsLabel =
    wsStatus === 'connected'  ? { text: '● Live',           cls: 'recent-activity__badge--ws-on'  } :
    wsStatus === 'connecting' ? { text: '◌ Đang kết nối…', cls: 'recent-activity__badge--loading' } :
                                { text: '○ Offline',         cls: 'recent-activity__badge--ws-off'  };

  return (
    <div className="recent-activity">
      <div className="recent-activity__header">
        <h2 className="recent-activity__title">Hoạt động gần đây</h2>
        <span className={`recent-activity__badge ${wsLabel.cls}`}>{wsLabel.text}</span>
      </div>

      <div className="recent-activity__list">
        {recentActivities.length === 0 ? (
          <div className="recent-activity__empty">
            {wsStatus === 'connected'
              ? 'Chưa có sự kiện nào. Đang theo dõi…'
              : 'Đang kết nối tới máy chủ…'}
          </div>
        ) : (
          recentActivities.map((item) => (
            <ActivityItem key={item.id} item={item} isNew={item.id === newestIdRef.current} />
          ))
        )}
      </div>
    </div>
  );
}
