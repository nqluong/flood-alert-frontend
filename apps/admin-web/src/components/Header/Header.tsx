import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = 'Bảng điều khiển',
  subtitle = 'Giám sát thời gian thực hệ thống cảnh báo lũ lụt',
}: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <h1 className="dashboard-header__title">{title}</h1>
        <p className="dashboard-header__subtitle">{subtitle}</p>
      </div>
    </header>
  );
}
