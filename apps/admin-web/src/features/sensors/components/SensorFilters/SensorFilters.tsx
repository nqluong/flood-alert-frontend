import './SensorFilters.css';
import type { SensorFilters, SensorApiStatus } from '../../../../types/sensor.types';
import { Search, SlidersHorizontal, ChevronDown, BrushCleaning } from 'lucide-react';

const STATUS_OPTIONS: { value: SensorApiStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'Tất cả trạng thái' },
  { value: 'ACTIVE',      label: 'Hoạt động' },
  { value: 'OFFLINE',     label: 'Ngoại tuyến' },
  { value: 'DISABLED',    label: 'Vô hiệu hóa' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
];

interface SensorFiltersProps {
  filters: SensorFilters;
  onChange: (filters: SensorFilters) => void;
}

export default function SensorFiltersBar({ filters, onChange }: SensorFiltersProps) {
  const set = <K extends keyof SensorFilters>(key: K, value: SensorFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="sensor-filters">
      {/* Search */}
      <div className="sensor-filters__search-wrap">
        <span className="sensor-filters__search-icon">
          <Search size={15} />
        </span>
        <input
          type="text"
          className="sensor-filters__search"
          placeholder="Tìm kiếm theo tên hoặc mã cảm biến..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>

      {/* Status select */}
      <div className="sensor-filters__select-wrap">
        <select
          className="sensor-filters__select"
          value={filters.status}
          onChange={(e) => set('status', e.target.value as SensorFilters['status'])}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="sensor-filters__select-arrow"><ChevronDown size={16} /></span>
      </div>

      {/* Reset filter button */}
      <button
        className="sensor-filters__icon-btn"
        title="Xóa bộ lọc"
        onClick={() => onChange({ search: '', status: 'all', region: '' })}
      >
        <BrushCleaning size={15} />
      </button>
    </div>
  );
}


