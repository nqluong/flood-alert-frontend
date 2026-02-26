import './StatsCard.css';
import { TrendingUp, AlertTriangle, FileText, ShieldCheck, Radio } from 'lucide-react';

export type StatsColorVariant = 'default' | 'red' | 'orange' | 'green';
export type StatsIconVariant  = 'blue' | 'red' | 'orange' | 'green';

export interface StatsCardProps {
  label: string;
  value: string;
  meta: string;
  metaIcon?: React.ReactNode;
  colorVariant?: StatsColorVariant;
  iconVariant?: StatsIconVariant;
  icon: React.ReactNode;
}

export function StatsCard({
  label,
  value,
  meta,
  metaIcon,
  colorVariant = 'default',
  iconVariant = 'blue',
  icon,
}: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="stats-card__body">
        <p className="stats-card__label">{label}</p>
        <p className={`stats-card__value stats-card__value--${colorVariant}`}>{value}</p>
        <div className={`stats-card__meta stats-card__meta--${colorVariant}`}>
          {metaIcon}
          <span>{meta}</span>
        </div>
      </div>
      <div className={`stats-card__icon-box stats-card__icon-box--${iconVariant}`}>
        {icon}
      </div>
    </div>
  );
}

// ---- Preset stats used on the Dashboard ----
export function StatsGrid() {
  return (
    <div className="stats-grid">
      <StatsCard
        label="Tổng số cảm biến"
        value="5,247"
        meta="+2.5% so với tháng trước"
        metaIcon={<TrendingUp size={14} />}
        colorVariant="default"
        iconVariant="blue"
        icon={<Radio size={20} />}
      />
      <StatsCard
        label="Cảnh báo đang hoạt động"
        value="12"
        meta="Cần xử lý ngay"
        metaIcon={<AlertTriangle size={14} />}
        colorVariant="red"
        iconVariant="red"
        icon={<AlertTriangle size={20} />}
      />
      <StatsCard
        label="Báo cáo đang chờ"
        value="45"
        meta="Đang xem xét"
        metaIcon={<FileText size={14} />}
        colorVariant="orange"
        iconVariant="orange"
        icon={<FileText size={20} />}
      />
      <StatsCard
        label="Tình trạng hệ thống"
        value="99.8%"
        meta="Hoạt động tốt"
        metaIcon={<ShieldCheck size={14} />}
        colorVariant="green"
        iconVariant="green"
        icon={<ShieldCheck size={20} />}
      />
    </div>
  );
}
