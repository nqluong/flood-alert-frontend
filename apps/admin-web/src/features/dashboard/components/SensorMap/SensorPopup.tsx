import './SensorPopup.css';
import { useMap } from 'react-leaflet';
import { Eye, Pencil, ToggleLeft, Trash2 } from 'lucide-react';
import { SENSOR_STATUS_LABEL, SENSOR_STATUS_STYLE } from './constants';
import type { ActionType } from './constants';

interface SensorActionPopupProps {
  sensorId:      string;
  name?:         string;
  status:        string;
  batteryLevel?: number;
  waterLevel?:   number;
  recordedAt?:   string | null;
  fetchingId:    string | null;
  onAction:      (id: string, action: ActionType) => void;
}

export default function SensorActionPopup({
  sensorId, name, status, batteryLevel, waterLevel, recordedAt,
  fetchingId, onAction,
}: SensorActionPopupProps) {
  const map = useMap();
  const loading = fetchingId === sensorId;
  const style = SENSOR_STATUS_STYLE[status] ?? { bg: '#f3f4f6', color: '#4b5563' };

  const handleAction = (action: ActionType) => {
    map.closePopup();
    onAction(sensorId, action);
  };

  return (
    <div className="smap-popup">
      {/* Header: tên + id */}
      <div className="smap-popup__head">
        <span className="smap-popup__name">{name || sensorId}</span>
        <code className="smap-popup__sid">{sensorId}</code>
      </div>

      {/* Badge trạng thái + chip pin / mực nước */}
      <div className="smap-popup__meta">
        <span className="smap-popup__badge" style={{ background: style.bg, color: style.color }}>
          {SENSOR_STATUS_LABEL[status] ?? status}
        </span>
        {batteryLevel != null && (
          <span className="smap-popup__chip">🔋 {batteryLevel}%</span>
        )}
        {waterLevel != null && (
          <span className="smap-popup__chip">💧 {waterLevel.toFixed(1)} cm</span>
        )}
      </div>

      {recordedAt && (
        <p className="smap-popup__time">
          {new Date(recordedAt).toLocaleTimeString('vi-VN')}
        </p>
      )}

      {/* Action buttons — hiện trực tiếp, không cần dropdown */}
      <div className="smap-popup__actions">
        <button className="smap-popup__action-btn" onClick={() => handleAction('view')} disabled={loading} title="Xem chi tiết">
          <Eye size={13} />
          <span>Xem</span>
        </button>
        <button className="smap-popup__action-btn" onClick={() => handleAction('edit')} disabled={loading} title="Chỉnh sửa">
          <Pencil size={13} />
          <span>Sửa</span>
        </button>
        <button className="smap-popup__action-btn" onClick={() => handleAction('status')} disabled={loading} title="Chuyển trạng thái">
          <ToggleLeft size={13} />
          <span>T.thái</span>
        </button>
        <button className="smap-popup__action-btn smap-popup__action-btn--danger" onClick={() => handleAction('delete')} disabled={loading} title="Xóa cảm biến">
          <Trash2 size={13} />
          <span>Xóa</span>
        </button>
      </div>

      {loading && <span className="smap-popup__spin" />}
    </div>
  );
}
