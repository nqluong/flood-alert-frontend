import './Sidebar.css';
import {
  LayoutDashboard,
  Radio,
  FileText,
  Users,
  Settings,
  HelpCircle,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import type { User } from '../../types/auth.types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeNav?: string;
  onNavChange?: (id: string) => void;
  onLogout?: () => void;
  user?: User;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Tổng quan',   icon: <LayoutDashboard size={16} /> },
  { id: 'sensors',   label: 'Cảm biến',    icon: <Radio size={16} /> },
  { id: 'reports',   label: 'Báo cáo',     icon: <FileText size={16} /> },
  { id: 'users',     label: 'Người dùng',  icon: <Users size={16} /> },
];

const settingsNavItems: NavItem[] = [
  { id: 'config',  label: 'Cấu hình', icon: <Settings size={16} /> },
  { id: 'support', label: 'Hỗ trợ',   icon: <HelpCircle size={16} /> },
];

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=';

export default function Sidebar({ activeNav = 'dashboard', onNavChange, onLogout, user }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <ShieldCheck size={14} />
        </div>
        <span className="sidebar__logo-text">FloodGuard</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar__nav">
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeNav === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => onNavChange?.(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Settings section */}
        <div className="sidebar__settings">
          <p className="sidebar__section-label">Cài đặt</p>
          {settingsNavItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar__nav-item ${activeNav === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => onNavChange?.(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="sidebar__user">
        <img
          className="sidebar__user-avatar"
          src={user?.avatarUrl ?? `${DEFAULT_AVATAR}${encodeURIComponent(user?.name ?? 'Admin')}`}
          alt={user?.name ?? 'Admin'}
        />
        <div className="sidebar__user-info">
          <p className="sidebar__user-name">{user?.name ?? 'Admin'}</p>
          <p className="sidebar__user-role">{user?.email ?? ''}</p>
        </div>
        <button
          className="sidebar__user-menu-btn sidebar__user-logout-btn"
          aria-label="Đăng xuất"
          title="Đăng xuất"
          onClick={onLogout}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
