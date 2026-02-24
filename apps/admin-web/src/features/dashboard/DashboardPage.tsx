import { useState } from 'react';
import './DashboardPage.css';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatsGrid } from './components/StatsCard/StatsCard';
import SensorMap from './components/SensorMap/SensorMap';
import RecentActivity from './components/RecentActivity/RecentActivity';
import SensorsPage from '../sensors/SensorsPage';

interface DashboardPageProps {
  onLogout?: () => void;
}

interface PageMeta {
  title: string;
  subtitle?: string;
}

const PAGE_META: Record<string, PageMeta> = {
  dashboard: { title: 'Bảng điều khiển', subtitle: 'Giám sát thời gian thực hệ thống cảnh báo lũ lụt' },
  sensors:   { title: 'Quản lý Cảm biến' },
  alerts:    { title: 'Cảnh báo' },
  map:       { title: 'Bản đồ' },
  reports:   { title: 'Báo cáo' },
  users:     { title: 'Người dùng' },
  config:    { title: 'Cấu hình' },
  support:   { title: 'Hỗ trợ' },
};

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: 12,
      color: 'var(--color-text-muted)', fontSize: 15,
    }}>
      <span style={{ fontSize: 40 }}>🚧</span>
      <span>Trang <strong>{title}</strong> đang được phát triển</span>
    </div>
  );
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const [activeNav, setActiveNav] = useState('dashboard');

  const meta = PAGE_META[activeNav] ?? { title: activeNav };

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <>
            <StatsGrid />
            <div className="dashboard-page__widgets">
              <SensorMap />
              <RecentActivity />
            </div>
          </>
        );
      case 'sensors':
        return <SensorsPage />;
      default:
        return <PlaceholderPage title={meta.title} />;
    }
  };

  return (
    <DashboardLayout
      title={meta.title}
      subtitle={meta.subtitle}
      onLogout={onLogout}
      activeNav={activeNav}
      onNavChange={setActiveNav}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

