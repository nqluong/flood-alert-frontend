import './SensorTable.css';
import type { Sensor, SensorStatus } from '../../../../types/sensor.types';
import {
  IconEdit,
  IconPower,
  IconMoreHorizontal,
} from '../../../../components/icons/Icons';

// ---- Status helpers ----

const STATUS_LABEL: Record<SensorStatus, string> = {
  active: 'Hoạt động',
  offline: 'Ngoại tuyến',
  disabled: 'Vô hiệu hóa',
};

const STATUS_CLASS: Record<SensorStatus, string> = {
  active: 'badge--active',
  offline: 'badge--offline',
  disabled: 'badge--disabled',
};

// ---- Sub-components ----

function StatusBadge({ status }: { status: SensorStatus }) {
  return (
    <span className={`badge ${STATUS_CLASS[status]}`}>
      <span className="badge__dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}

function ThresholdCell({ warning, danger }: { warning: number; danger: number }) {
  return (
    <div className="threshold-cell">
      <span className="threshold-cell__warning">CB: {warning}cm</span>
      <span className="threshold-cell__danger">NC: {danger}cm</span>
    </div>
  );
}

function ActionCell({ sensor, onEdit, onToggle }: {
  sensor: Sensor;
  onEdit: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="action-cell">
      <button
        className="action-btn action-btn--edit"
        title="Chỉnh sửa"
        onClick={() => onEdit(sensor.id)}
      >
        <IconEdit size={15} />
      </button>
      <button
        className="action-btn action-btn--power"
        title={sensor.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
        onClick={() => onToggle(sensor.id)}
      >
        <IconPower size={15} />
      </button>
      <button className="action-btn action-btn--more" title="Xem thêm">
        <IconMoreHorizontal size={15} />
      </button>
    </div>
  );
}

// ---- Main component ----

interface SensorTableProps {
  sensors: Sensor[];
  onEdit?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export default function SensorTable({
  sensors,
  onEdit = () => {},
  onToggle = () => {},
}: SensorTableProps) {
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
            <th>Đọc gần nhất</th>
            <th>Ngưỡng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor) => (
            <tr key={sensor.id}>
              {/* Mã Cảm biến */}
              <td>
                <span className="sensor-table__id">{sensor.id}</span>
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
                    <p className="sensor-table__district">{sensor.district}</p>
                  </div>
                </div>
              </td>

              {/* Trạng thái */}
              <td>
                <StatusBadge status={sensor.status} />
              </td>

              {/* Đọc gần nhất */}
              <td>
                <div className="sensor-table__reading">
                  <span className="sensor-table__reading-time">{sensor.lastReading.timestamp}</span>
                  <span className="sensor-table__reading-value">{sensor.lastReading.value}cm</span>
                </div>
              </td>

              {/* Ngưỡng */}
              <td>
                <ThresholdCell
                  warning={sensor.thresholds.warning}
                  danger={sensor.thresholds.danger}
                />
              </td>

              {/* Thao tác */}
              <td>
                <ActionCell sensor={sensor} onEdit={onEdit} onToggle={onToggle} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
