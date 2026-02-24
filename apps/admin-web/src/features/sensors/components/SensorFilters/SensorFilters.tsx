import './SensorFilters.css';
import type { SensorFilters, SensorStatus } from '../../../../types/sensor.types';
import { IconSearch, IconFilter, IconChevronDown } from '../../../../components/icons/Icons';

const STATUS_OPTIONS: { value: SensorStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Tất cả trạng thái' },
  { value: 'active',   label: 'Hoạt động' },
  { value: 'offline',  label: 'Ngoại tuyến' },
  { value: 'disabled', label: 'Vô hiệu hóa' },
];

interface SensorFiltersProps {
  filters: SensorFilters;
  districts: string[];
  onChange: (filters: SensorFilters) => void;
}

export default function SensorFiltersBar({ filters, districts, onChange }: SensorFiltersProps) {
  const set = <K extends keyof SensorFilters>(key: K, value: SensorFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="sensor-filters">
      {/* Search */}
      <div className="sensor-filters__search-wrap">
        <span className="sensor-filters__search-icon">
          <IconSearch size={15} />
        </span>
        <input
          type="text"
          className="sensor-filters__search"
          placeholder="Tìm kiếm cảm biến..."
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
        <span className="sensor-filters__select-arrow"><IconChevronDown size={16} /></span>
      </div>

      {/* District select */}
      <div className="sensor-filters__select-wrap">
        <select
          className="sensor-filters__select"
          value={filters.district}
          onChange={(e) => set('district', e.target.value)}
        >
          <option value="all">Tất cả vị trí</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <span className="sensor-filters__select-arrow"><IconChevronDown size={16} /></span>
      </div>

      {/* Filter icon button */}
      <button
        className="sensor-filters__icon-btn"
        title="Bộ lọc nâng cao"
        onClick={() => onChange({ search: '', status: 'all', district: 'all' })}
      >
        <IconFilter size={15} />
      </button>
    </div>
  );
}
