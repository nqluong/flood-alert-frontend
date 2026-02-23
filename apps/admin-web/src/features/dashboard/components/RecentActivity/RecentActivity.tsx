import './RecentActivity.css';

export type ActivityColor = 'red' | 'orange' | 'green' | 'blue';

export interface ActivityItemData {
  id: string;
  title: string;
  description: string;
  time: string;
  color: ActivityColor;
}

// ---- ActivityItem sub-component ----
interface ActivityItemProps {
  item: ActivityItemData;
}

function ActivityItem({ item }: ActivityItemProps) {
  return (
    <div className="activity-item">
      <span className={`activity-item__dot activity-item__dot--${item.color}`} />
      <div className="activity-item__body">
        <p className="activity-item__title">{item.title}</p>
        <p className="activity-item__description">{item.description}</p>
        <p className="activity-item__time">{item.time}</p>
      </div>
    </div>
  );
}

// ---- Default data ----
const DEFAULT_ACTIVITIES: ActivityItemData[] = [
  {
    id: '1',
    title: 'Cảm biến S-01 báo mức nước cao',
    description: 'Khu vực: Quận 1, TP.HCM',
    time: '2 phút trước',
    color: 'red',
  },
  {
    id: '2',
    title: 'Báo cáo #123 đã được phê duyệt',
    description: 'Người gửi: Trần Thị Mai',
    time: '5 phút trước',
    color: 'orange',
  },
  {
    id: '3',
    title: 'Cảm biến S-15 trở lại bình thường',
    description: 'Khu vực: Quận 7, TP.HCM',
    time: '8 phút trước',
    color: 'green',
  },
  {
    id: '4',
    title: 'Cập nhật firmware cảm biến',
    description: '25 cảm biến đã được cập nhật',
    time: '15 phút trước',
    color: 'blue',
  },
  {
    id: '5',
    title: 'Cảnh báo lũ khu vực Bình Thạnh',
    description: '3 cảm biến đang phát hiện mực nước cao',
    time: '22 phút trước',
    color: 'red',
  },
  {
    id: '6',
    title: 'Hệ thống backup hoạt động bình thường',
    description: 'Kiểm tra định kỳ thành công',
    time: '30 phút trước',
    color: 'green',
  },
];

// ---- RecentActivity panel ----
interface RecentActivityProps {
  activities?: ActivityItemData[];
}

export default function RecentActivity({ activities = DEFAULT_ACTIVITIES }: RecentActivityProps) {
  return (
    <div className="recent-activity">
      <div className="recent-activity__header">
        <h2 className="recent-activity__title">Hoạt động gần đây</h2>
      </div>
      <div className="recent-activity__list">
        {activities.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
