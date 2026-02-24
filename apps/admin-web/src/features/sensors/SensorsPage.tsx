import { useMemo, useState } from 'react';
import './SensorsPage.css';
import type { SensorFilters } from '../../types/sensor.types';
import { MOCK_SENSORS, MOCK_DISTRICTS } from './data/sensors.mock';
import SensorTable from './components/SensorTable/SensorTable';
import SensorFiltersBar from './components/SensorFilters/SensorFilters';
import { IconPlus } from '../../components/icons/Icons';

const DEFAULT_FILTERS: SensorFilters = {
  search: '',
  status: 'all',
  district: 'all',
};

export default function SensorsPage() {
  const [filters, setFilters] = useState<SensorFilters>(DEFAULT_FILTERS);
  const [showAddModal, setShowAddModal] = useState(false);  // placeholder

  const filteredSensors = useMemo(() => {
    return MOCK_SENSORS.filter((s) => {
      const matchSearch =
        filters.search.trim() === '' ||
        s.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.district.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === 'all' || s.status === filters.status;

      const matchDistrict =
        filters.district === 'all' || s.district === filters.district;

      return matchSearch && matchStatus && matchDistrict;
    });
  }, [filters]);

  // Stats derived from data
  const totalActive   = MOCK_SENSORS.filter((s) => s.status === 'active').length;
  const totalOffline  = MOCK_SENSORS.filter((s) => s.status === 'offline').length;
  const totalDisabled = MOCK_SENSORS.filter((s) => s.status === 'disabled').length;

  return (
    <div className="sensors-page">
      {/* ---- Top bar: title + add button ---- */}
      <div className="sensors-page__top">
        <div>
          <h2 className="sensors-page__title">Tất cả Cảm biến</h2>
          <div className="sensors-page__stats">
            <span className="sensors-stat sensors-stat--active">
              <span className="sensors-stat__dot" />
              {totalActive} hoạt động
            </span>
            <span className="sensors-stat sensors-stat--offline">
              <span className="sensors-stat__dot" />
              {totalOffline} ngoại tuyến
            </span>
            <span className="sensors-stat sensors-stat--disabled">
              <span className="sensors-stat__dot" />
              {totalDisabled} vô hiệu hóa
            </span>
          </div>
        </div>
        <button
          className="sensors-page__add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <IconPlus size={16} />
          Thêm Cảm biến Mới
        </button>
      </div>

      {/* ---- Filter bar ---- */}
      <SensorFiltersBar
        filters={filters}
        districts={MOCK_DISTRICTS}
        onChange={setFilters}
      />

      {/* ---- Table card ---- */}
      <div className="sensors-page__card">
        <SensorTable
          sensors={filteredSensors}
          onEdit={(id) => console.log('Edit', id)}
          onToggle={(id) => console.log('Toggle', id)}
        />
      </div>

      {/* ---- Placeholder modal ---- */}
      {showAddModal && (
        <div
          className="sensors-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="sensors-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Thêm Cảm biến Mới</h3>
            <p>Chức năng đang phát triển...</p>
            <button
              className="sensors-modal__close"
              onClick={() => setShowAddModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
