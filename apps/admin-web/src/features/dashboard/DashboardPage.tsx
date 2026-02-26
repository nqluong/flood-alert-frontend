import { useState } from 'react';
import './DashboardPage.css';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatsGrid } from './components/StatsCard/StatsCard';
import SensorMap from './components/SensorMap/SensorMap';
import RecentActivity from './components/RecentActivity/RecentActivity';
import SensorsPage from '../sensors/SensorsPage';
import type { AuthSession } from '../../types/auth.types';
import { useFloodWebSocket } from './hooks/useFloodWebSocket';

interface DashboardPageProps {
  session: AuthSession;
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

function DashboardView() {
  const ws = useFloodWebSocket();
  return (
    <>
      <StatsGrid />
      <div className="dashboard-page__widgets">
        <SensorMap
          activeFloods={ws.activeFloods}
          sensors={ws.sensors}
          sensorMarkers={ws.sensorMarkers}
          loading={ws.loading}
          apiError={ws.apiError}
          wsStatus={ws.wsStatus}
          wsError={ws.wsError}
          onClearWsError={ws.clearWsError}
        />
        <RecentActivity
          recentActivities={ws.recentActivities}
          wsStatus={ws.wsStatus}
        />
      </div>
    </>
  );
}

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

export default function DashboardPage({ session, onLogout }: DashboardPageProps) {
  const [activeNav, setActiveNav] = useState('dashboard');

  const meta = PAGE_META[activeNav] ?? { title: activeNav };

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardView />;
      case 'sensors':   return <SensorsPage />;
      default:          return <PlaceholderPage title={meta.title} />;
    }
  };

  return (
    <DashboardLayout
      title={meta.title}
      subtitle={meta.subtitle}
      user={session.user}
      onLogout={onLogout}
      activeNav={activeNav}
      onNavChange={setActiveNav}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

