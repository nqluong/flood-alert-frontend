import './Sidebar.css';
import {
  IconDashboard,
  IconSensor,
  IconAlert,
  IconReport,
  IconUsers,
  IconSettings,
  IconHelp,
  IconMoreVertical,
  IconShield,
} from '../icons/Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeNav?: string;
  onNavChange?: (id: string) => void;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Tổng quan',   icon: <IconDashboard size={16} /> },
  { id: 'sensors',   label: 'Cảm biến',    icon: <IconSensor size={16} /> },
  { id: 'alerts',    label: 'Cảnh báo',    icon: <IconAlert size={16} /> },
  { id: 'reports',   label: 'Báo cáo',     icon: <IconReport size={16} /> },
  { id: 'users',     label: 'Người dùng',  icon: <IconUsers size={16} /> },
];

const settingsNavItems: NavItem[] = [
  { id: 'config',  label: 'Cấu hình', icon: <IconSettings size={16} /> },
  { id: 'support', label: 'Hỗ trợ',   icon: <IconHelp size={16} /> },
];

export default function Sidebar({ activeNav = 'dashboard', onNavChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <IconShield size={14} />
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
          src="https://www.figma.com/api/mcp/asset/fda90483-6c15-4304-bbaf-5aa1c8f6b7f7"
          alt="User avatar"
        />
        <div className="sidebar__user-info">
          <p className="sidebar__user-name">Nguyễn Văn A</p>
          <p className="sidebar__user-role">Quản trị viên</p>
        </div>
        <button className="sidebar__user-menu-btn" aria-label="Tùy chọn người dùng">
          <IconMoreVertical size={16} />
        </button>
      </div>
    </aside>
  );
}
