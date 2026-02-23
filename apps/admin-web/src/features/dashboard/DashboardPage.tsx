import './DashboardPage.css';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatsGrid } from './components/StatsCard/StatsCard';
import SensorMap from './components/SensorMap/SensorMap';
import RecentActivity from './components/RecentActivity/RecentActivity';

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Bảng điều khiển"
      subtitle="Giám sát thời gian thực hệ thống cảnh báo lũ lụt"
    >
      {/* Row 1 — Stat Cards */}
      <StatsGrid />

      {/* Row 2 — Map + Activity */}
      <div className="dashboard-page__widgets">
        <SensorMap />
        <RecentActivity />
      </div>
    </DashboardLayout>
  );
}
