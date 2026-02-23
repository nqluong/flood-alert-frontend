import { useState } from 'react';
import './DashboardLayout.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="dashboard-layout">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="dashboard-layout__main">
        <Header title={title} subtitle={subtitle} />
        <main className="dashboard-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}
