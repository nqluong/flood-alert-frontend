import './DashboardLayout.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import type { User } from '../../types/auth.types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  user?: User;
  onLogout?: () => void;
  activeNav: string;
  onNavChange: (id: string) => void;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  user,
  onLogout,
  activeNav,
  onNavChange,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar activeNav={activeNav} onNavChange={onNavChange} onLogout={onLogout} user={user} />

      <div className="dashboard-layout__main">
        <Header title={title} subtitle={subtitle} />
        <main className="dashboard-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}
