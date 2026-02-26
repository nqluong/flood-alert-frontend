import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import './SensorsPage.css';
import type {
  SensorFilters,
  SensorSummaryResponse,
  PageResponse,
} from '../../types/sensor.types';
import { sensorService } from '../../services/sensor.service';
import SensorTable from './components/SensorTable/SensorTable';
import SensorFiltersBar from './components/SensorFilters/SensorFilters';
import AddSensorModal from './components/AddSensorModal/AddSensorModal';
import EditSensorModal from './components/EditSensorModal/EditSensorModal';
import ChangeStatusModal from './components/ChangeStatusModal/ChangeStatusModal';
import DeleteSensorModal from './components/DeleteSensorModal/DeleteSensorModal';
import RestoreConfirmModal from './components/RestoreConfirmModal/RestoreConfirmModal';
const SensorDetailModal = lazy(
  () => import('./components/SensorDetailModal/SensorDetailModal'),
);
import { Plus } from 'lucide-react';

const DEFAULT_FILTERS: SensorFilters = {
  search: '',
  status: 'all',
  region: '',
};

const PAGE_SIZE = 20;

export default function SensorsPage() {
  const [filters,     setFilters]     = useState<SensorFilters>(DEFAULT_FILTERS);
  const [page,        setPage]        = useState(0);
  const [pageData,    setPageData]    = useState<PageResponse<SensorSummaryResponse> | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editingSensor,  setEditingSensor]  = useState<SensorSummaryResponse | null>(null);
  const [toggleSensor,   setToggleSensor]   = useState<SensorSummaryResponse | null>(null);
  const [deletingSensor, setDeletingSensor] = useState<SensorSummaryResponse | null>(null);
  const [restoringSensor, setRestoringSensor] = useState<SensorSummaryResponse | null>(null);
  const [viewingSensor,   setViewingSensor]   = useState<SensorSummaryResponse | null>(null);

  // Debounce search — chờ 400ms sau khi ngừng gõ mới gọi API
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [filters.search]);

  // Reset về trang 0 khi filter thay đổi
  useEffect(() => { setPage(0); }, [filters.status, filters.region, debouncedSearch]);

  // Fetch dữ liệu
  const fetchSensors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sensorService.getSensors({
        page,
        size: PAGE_SIZE,
        status:   filters.status !== 'all' ? filters.status : undefined,
        search:   debouncedSearch || undefined,
        region:   filters.region  || undefined,
        sortBy:   'createdAt',
        sortDirection: 'DESC',
      });
      setPageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách cảm biến');
    } finally {
      setLoading(false);
    }
  }, [page, filters.status, filters.region, debouncedSearch]);

  useEffect(() => { void fetchSensors(); }, [fetchSensors]);

  // Stats từ trang hiện tại
  const sensors = pageData?.content ?? [];
  const totalActive      = sensors.filter((s) => s.status === 'ACTIVE').length;
  const totalOffline     = sensors.filter((s) => s.status === 'OFFLINE').length;
  const totalDisabled    = sensors.filter((s) => s.status === 'DISABLED').length;
  const totalMaintenance = sensors.filter((s) => s.status === 'MAINTENANCE').length;

  return (
    <div className="sensors-page">
      {/* ---- Top bar ---- */}
      <div className="sensors-page__top">
        <div>
          <h2 className="sensors-page__title">
            Tất cả Cảm biến
            {pageData && (
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                ({pageData.totalElements} tổng)
              </span>
            )}
          </h2>
          <div className="sensors-page__stats">
            {totalActive > 0 && (
              <span className="sensors-stat sensors-stat--active">
                <span className="sensors-stat__dot" />{totalActive} hoạt động
              </span>
            )}
            {totalOffline > 0 && (
              <span className="sensors-stat sensors-stat--offline">
                <span className="sensors-stat__dot" />{totalOffline} ngoại tuyến
              </span>
            )}
            {totalDisabled > 0 && (
              <span className="sensors-stat sensors-stat--disabled">
                <span className="sensors-stat__dot" />{totalDisabled} vô hiệu hóa
              </span>
            )}
            {totalMaintenance > 0 && (
              <span className="sensors-stat sensors-stat--disabled">
                <span className="sensors-stat__dot" />{totalMaintenance} bảo trì
              </span>
            )}
          </div>
        </div>
        <button
          className="sensors-page__add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Thêm Cảm biến Mới
        </button>
      </div>

      {/* ---- Filter bar ---- */}
      <SensorFiltersBar filters={filters} onChange={setFilters} />

      {/* ---- Error banner ---- */}
      {error && (
        <div style={{
          padding: '10px 14px', background: 'var(--color-danger-bg, #fef2f2)',
          color: 'var(--color-danger, #ef4444)', borderRadius: 8,
          fontSize: 13, marginBottom: 12,
        }}>
          ⚠ {error}
          <button onClick={() => void fetchSensors()} style={{ marginLeft: 10, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            Thử lại
          </button>
        </div>
      )}

      {/* ---- Table card ---- */}
      <div className="sensors-page__card">
        <SensorTable
          sensors={sensors}
          loading={loading}
          onEdit={(sensor) => setEditingSensor(sensor)}
          onToggle={(sensor) => setToggleSensor(sensor)}
          onDelete={(sensor) => setDeletingSensor(sensor)}
          onRestore={(sensor) => setRestoringSensor(sensor)}
          onView={(sensor) => setViewingSensor(sensor)}
        />

        {/* ---- Pagination ---- */}
        {pageData && pageData.totalPages > 1 && (
          <div className="sensors-page__pagination">
            <button
              className="sensors-page__page-btn"
              disabled={pageData.first}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>

            {Array.from({ length: pageData.totalPages }, (_, i) => i).map((i) => (
              <button
                key={i}
                className={`sensors-page__page-btn ${i === page ? 'sensors-page__page-btn--active' : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="sensors-page__page-btn"
              disabled={pageData.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Tiếp
            </button>

            <span className="sensors-page__page-info">
              Trang {page + 1} / {pageData.totalPages} &nbsp;·&nbsp; {pageData.totalElements} cảm biến
            </span>
          </div>
        )}
      </div>

      {/* ---- Sensor Detail Modal ---- */}
      {viewingSensor && (
        <Suspense fallback={null}>
          <SensorDetailModal
            sensor={viewingSensor}
            onClose={() => setViewingSensor(null)}
          />
        </Suspense>
      )}

      {/* ---- Add Sensor Modal ---- */}
      {showAddModal && (
        <AddSensorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            void fetchSensors();
          }}
        />
      )}

      {/* ---- Edit Sensor Modal ---- */}
      {editingSensor && (
        <EditSensorModal
          sensor={editingSensor}
          onClose={() => setEditingSensor(null)}
          onSuccess={() => {
            setEditingSensor(null);
            void fetchSensors();
          }}
        />
      )}

      {/* ---- Change Status Modal ---- */}
      {toggleSensor && (
        <ChangeStatusModal
          sensor={toggleSensor}
          onClose={() => setToggleSensor(null)}
          onSuccess={() => {
            setToggleSensor(null);
            void fetchSensors();
          }}
        />
      )}

      {/* ---- Delete Sensor Modal ---- */}
      {deletingSensor && (
        <DeleteSensorModal
          sensor={deletingSensor}
          onClose={() => setDeletingSensor(null)}
          onSuccess={() => {
            setDeletingSensor(null);
            void fetchSensors();
          }}
        />
      )}

      {/* ---- Restore Sensor Modal ---- */}
      {restoringSensor && (
        <RestoreConfirmModal
          sensor={restoringSensor}
          onClose={() => setRestoringSensor(null)}
          onSuccess={() => {
            setRestoringSensor(null);
            void fetchSensors();
          }}
        />
      )}
    </div>
  );
}
