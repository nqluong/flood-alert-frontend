import './SensorFilters.css';
import type { SensorFilters, SensorApiStatus } from '../../../../types/sensor.types';
import { Search, BrushCleaning } from 'lucide-react';
import Select from '../../../../components/Select/Select';

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
      <Select
        className="sensor-filters__status-select"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(v) => set('status', v)}
      />

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


