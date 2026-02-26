import { useEffect, useState } from 'react';
import { X, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import type { SensorSummaryResponse, DeleteSensorResponse } from '../../../../types/sensor.types';
import { sensorService } from '../../../../services/sensor.service';
import './RestoreConfirmModal.css';

interface RestoreConfirmModalProps {
  sensor: SensorSummaryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestoreConfirmModal({ sensor, onClose, onSuccess }: RestoreConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [result,     setResult]     = useState<DeleteSensorResponse | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !result) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, result]);

  async function handleConfirm() {
    setSubmitting(true);
    setApiError(null);
    try {
      const data = await sensorService.restoreSensor(sensor.id);
      setResult(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Khôi phục cảm biến thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="rcm-overlay"
      onClick={() => { if (!result) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="rcm-modal" onClick={(e) => e.stopPropagation()}>

        {result ? (
          /* ---- Success ---- */
          <>
            <div className="rcm-header rcm-header--success">
              <div className="rcm-header__title">
                <span className="rcm-header__icon rcm-header__icon--success">
                  <CheckCircle size={20} />
                </span>
                <span>Khôi phục thành công</span>
              </div>
            </div>
            <div className="rcm-body">
              <div className="rcm-success-info">
                <div className="rcm-row">
                  <span className="rcm-row__label">Mã cảm biến</span>
                  <span className="rcm-row__value rcm-mono">{result.sensorId}</span>
                </div>
                <div className="rcm-row">
                  <span className="rcm-row__label">Trạng thái mới</span>
                  <span className="rcm-row__value">{result.status}</span>
                </div>
                <div className="rcm-row">
                  <span className="rcm-row__label">Thời điểm</span>
                  <span className="rcm-row__value">
                    {new Date(result.deletedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                {result.message && (
                  <p className="rcm-result-message">{result.message}</p>
                )}
              </div>
              <div className="rcm-footer">
                <button className="rcm-btn rcm-btn--primary" onClick={onSuccess}>
                  Hoàn thành
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ---- Confirm ---- */
          <>
            <div className="rcm-header">
              <div className="rcm-header__title">
                <span className="rcm-header__icon">
                  <RotateCcw size={18} />
                </span>
                <span>Khôi phục cảm biến</span>
              </div>
              <button className="rcm-header__close" onClick={onClose} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
            <div className="rcm-body">
              <div className="rcm-sensor-info">
                <span className="rcm-sensor-info__name">{sensor.name}</span>
                <span className="rcm-sensor-info__id">#{sensor.sensorId}</span>
              </div>

              <p className="rcm-confirm-text">
                Cảm biến đang ở trạng thái <strong>Đã xóa (soft delete)</strong>. Xác nhận khôi phục sẽ đưa cảm biến trở lại hoạt động bình thường.
              </p>

              {apiError && (
                <div className="rcm-api-error">
                  <AlertTriangle size={14} />
                  {apiError}
                </div>
              )}

              <div className="rcm-footer">
                <button type="button" className="rcm-btn rcm-btn--secondary" onClick={onClose}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="rcm-btn rcm-btn--restore"
                  disabled={submitting}
                  onClick={() => void handleConfirm()}
                >
                  <RotateCcw size={14} />
                  {submitting ? 'Đang khôi phục…' : 'Xác nhận khôi phục'}
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
