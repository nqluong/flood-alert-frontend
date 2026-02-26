import './SensorTable.css';
import type { SensorApiStatus, SensorSummaryResponse } from '../../../../types/sensor.types';
import { Pencil, Power, Trash2, Cpu, RotateCcw } from 'lucide-react';


const STATUS_LABEL: Record<SensorApiStatus, string> = {
  ACTIVE:      'Hoạt động',
  OFFLINE:     'Ngoại tuyến',
  DISABLED:    'Vô hiệu hóa',
  MAINTENANCE: 'Bảo trì'
};

const STATUS_CLASS: Record<SensorApiStatus, string> = {
  ACTIVE:      'badge--active',
  OFFLINE:     'badge--offline',
  DISABLED:    'badge--disabled',
  MAINTENANCE: 'badge--maintenance'
};

function StatusBadge({ status }: { status: SensorApiStatus }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] ?? 'badge--offline'}`}>
      <span className="badge__dot" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function BatteryCell({ battery, signal }: { battery: number | null; signal: number | null }) {
  return (
    <div className="threshold-cell">
      {battery !== null
        ? <span className="threshold-cell__warning">Pin: {battery}%</span>
        : <span className="threshold-cell__warning" style={{ color: 'var(--color-text-muted)' }}>Pin: --</span>}
      {signal !== null
        ? <span className="threshold-cell__danger">Tín hiệu: {signal} dBm</span>
        : <span className="threshold-cell__danger" style={{ color: 'var(--color-text-muted)' }}>Tín hiệu: --</span>}
    </div>
  );
}

function ActionCell({ sensor, onEdit, onToggle, onDelete, onRestore }: {
  sensor: SensorSummaryResponse;
  onEdit: (sensor: SensorSummaryResponse) => void;
  onToggle: (sensor: SensorSummaryResponse) => void;
  onDelete: (sensor: SensorSummaryResponse) => void;
  onRestore: (sensor: SensorSummaryResponse) => void;
}) {

  return (
    <div className="action-cell">
      <button
        className="action-btn action-btn--edit"
        title="Chỉnh sửa"
        onClick={() => onEdit(sensor)}
      >
        <Pencil size={15} />
      </button>
      <button
        className="action-btn action-btn--power"
        title="Chuyển trạng thái"
        onClick={() => onToggle(sensor)}
      >
        <Power size={15} />
      </button>
      <button
        className="action-btn action-btn--more"
        title="Xóa cảm biến"
        onClick={() => onDelete(sensor)}
      >
        <Trash2 size={15} />
      </button>
      {sensor.status === 'DISABLED' && (
        <button
          className="action-btn action-btn--restore"
          title="Khôi phục cảm biến"
          onClick={() => onRestore(sensor)}
        >
          <RotateCcw size={15} />
        </button>
      )}
    </div>
  );
}


interface SensorTableProps {
  sensors: SensorSummaryResponse[];
  loading?: boolean;
  onEdit?: (sensor: SensorSummaryResponse) => void;
  onToggle?: (sensor: SensorSummaryResponse) => void;
  onDelete?: (sensor: SensorSummaryResponse) => void;
  onRestore?: (sensor: SensorSummaryResponse) => void;
}

export default function SensorTable({
  sensors,
  loading = false,
  onEdit = () => {},
  onToggle = () => {},
  onDelete = () => {},
  onRestore = () => {},
}: SensorTableProps) {
  if (loading) {
    return (
      <div className="sensor-table__empty">
        Đang tải dữ liệu…
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="sensor-table__empty">
        Không tìm thấy cảm biến nào.
      </div>
    );
  }

  return (
    <div className="sensor-table__wrapper">
      <table className="sensor-table">
        <thead>
          <tr>
            <th>Mã Cảm biến</th>
            <th>Tên / Vị trí</th>
            <th>Trạng thái</th>
            <th>Kết nối gần nhất</th>
            <th>Pin / Tin hiệu</th>
            <th>Cấu hình</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor) => (
            <tr key={sensor.id}>
              {/* Mã Cảm biến */}
              <td>
                <span className="sensor-table__id"><Cpu size={16} /> {sensor.sensorId}</span>
              </td>

              {/* Tên / Vị trí */}
              <td>
                <div className="sensor-table__location">
                  <div className="sensor-table__location-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <div>
                    <p className="sensor-table__name">{sensor.name}</p>
                    <p className="sensor-table__district">
                      {sensor.locationName ?? `${sensor.lat.toFixed(5)}, ${sensor.lon.toFixed(5)}`}
                    </p>
                  </div>
                </div>
              </td>

              {/* Trạng thái */}
              <td>
                <StatusBadge status={sensor.status} />
              </td>

              {/* Kết nối gần nhất */}
              <td>
                <div className="sensor-table__reading">
                  {sensor.lastHeartbeat ? (
                    <>
                      <span className="sensor-table__reading-time">
                        {new Date(sensor.lastHeartbeat).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="sensor-table__reading-value">
                        {new Date(sensor.lastHeartbeat).toLocaleTimeString('vi-VN')}
                      </span>
                    </>
                  ) : (
                    <span className="sensor-table__reading-time" style={{ color: 'var(--color-text-muted)' }}>Chưa có dữ liệu</span>
                  )}
                </div>
              </td>

              {/* Pin / Tin hiệu */}
              <td>
                <BatteryCell battery={sensor.batteryLevel} signal={sensor.signalStrength} />
              </td>

              {/* Phiên bản phần cứng */}
              <td>
                <div className="sensor-table__reading">
                  <span className="sensor-table__reading-time">{sensor.hardwareModel ?? '--'}</span>
                  <span className="sensor-table__reading-value">{sensor.firmwareVersion ?? '--'}</span>
                </div>
              </td>

              {/* Thao tác */}
              <td>
                <ActionCell sensor={sensor} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} onRestore={onRestore} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

