import { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import type {
  SensorSummaryResponse,
  DeleteSensorRequest,
  DeleteSensorResponse,
} from '../../../../types/sensor.types';
import { sensorService } from '../../../../services/sensor.service';
import './DeleteSensorModal.css';

// ---- Types ----

type DeleteMode = 'soft' | 'hard';

interface FormErrors {
  reason?: string;
  confirm?: string;
}

function validate(
  mode: DeleteMode,
  reason: string,
  confirmText: string,
  sensorId: string,
): FormErrors {
  const errors: FormErrors = {};
  if (!reason.trim()) errors.reason = 'Lý do không được để trống';
  else if (reason.trim().length < 10) errors.reason = 'Lý do ít nhất 10 ký tự';
  else if (reason.length > 500) errors.reason = 'Tối đa 500 ký tự';
  if (mode === 'hard' && confirmText !== sensorId)
    errors.confirm = `Nhập đúng mã cảm biến "${sensorId}" để xác nhận`;
  return errors;
}

// ---- Success Screen ----

function SuccessScreen({
  result,
  onDone,
}: {
  result: DeleteSensorResponse;
  onDone: () => void;
}) {
  const isHard = result.deleteType === 'HARD';
  return (
    <>
      <div className={`dsm-header ${isHard ? 'dsm-header--hard' : 'dsm-header--success'}`}>
        <div className="dsm-header__title">
          <span className={`dsm-header__icon ${isHard ? 'dsm-header__icon--hard' : 'dsm-header__icon--success'}`}>
            <CheckCircle size={20} />
          </span>
          <span>{isHard ? 'Đã xóa vĩnh viễn cảm biến' : 'Đã xóa cảm biến'}</span>
        </div>
      </div>

      <div className="dsm-body">
        <div className="dsm-success-info">
          <div className="dsm-success-row">
            <span className="dsm-success-row__label">Mã cảm biến</span>
            <span className="dsm-success-row__value dsm-mono">{result.sensorId}</span>
          </div>
          <div className="dsm-success-row">
            <span className="dsm-success-row__label">Loại xóa</span>
            <span className="dsm-success-row__value">
              <span className={`dsm-type-badge ${isHard ? 'dsm-type-badge--hard' : 'dsm-type-badge--soft'}`}>
                {isHard ? 'Xóa vĩnh viễn' : 'Xóa mềm'}
              </span>
            </span>
          </div>
          <div className="dsm-success-row">
            <span className="dsm-success-row__label">Thời điểm</span>
            <span className="dsm-success-row__value">
              {new Date(result.deletedAt).toLocaleString('vi-VN')}
            </span>
          </div>
          {result.message && (
            <div className="dsm-result-message">{result.message}</div>
          )}
        </div>

        <div className="dsm-footer">
          <button className="dsm-btn dsm-btn--primary" onClick={onDone}>
            Hoàn thành
          </button>
        </div>
      </div>
    </>
  );
}

// ---- Main Modal ----

interface DeleteSensorModalProps {
  sensor: SensorSummaryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteSensorModal({ sensor, onClose, onSuccess }: DeleteSensorModalProps) {
  const [mode,         setMode]         = useState<DeleteMode>('soft');
  const [reason,       setReason]       = useState('');
  const [removeFromMap, setRemoveFromMap] = useState(true);
  const [confirmText,  setConfirmText]  = useState('');
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [touched,      setTouched]      = useState({ reason: false, confirm: false });
  const [submitting,   setSubmitting]   = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);
  const [result,       setResult]       = useState<DeleteSensorResponse | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !result) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, result]);

  function handleModeChange(m: DeleteMode) {
    setMode(m);
    setErrors({});
    setConfirmText('');
    setTouched({ reason: false, confirm: false });
    setApiError(null);
  }

  function handleReasonChange(v: string) {
    setReason(v);
    if (touched.reason) setErrors(validate(mode, v, confirmText, sensor.sensorId));
  }

  function handleConfirmChange(v: string) {
    setConfirmText(v);
    if (touched.confirm) setErrors(validate(mode, reason, v, sensor.sensorId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ reason: true, confirm: true });
    const errs = validate(mode, reason, confirmText, sensor.sensorId);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: DeleteSensorRequest = {
      reason: reason.trim(),
      removeFromMap,
    };

    setSubmitting(true);
    setApiError(null);
    try {
      const data = mode === 'hard'
        ? await sensorService.hardDeleteSensor(sensor.id, payload)
        : await sensorService.softDeleteSensor(sensor.id, payload);
      setResult(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Xóa cảm biến thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="dsm-overlay"
      onClick={() => { if (!result) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="dsm-modal" onClick={(e) => e.stopPropagation()}>

        {result ? (
          <SuccessScreen result={result} onDone={onSuccess} />
        ) : (
          <>
            <div className="dsm-header">
              <div className="dsm-header__title">
                <span className="dsm-header__icon dsm-header__icon--danger">
                  <Trash2 size={18} />
                </span>
                <span>Xóa cảm biến</span>
              </div>
              <button className="dsm-header__close" onClick={onClose} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>

            <form className="dsm-body" onSubmit={(e) => void handleSubmit(e)} noValidate>
              {/* ---- Sensor info ---- */}
              <div className="dsm-sensor-info">
                <div className="dsm-sensor-info__text">
                  <span className="dsm-sensor-info__name">{sensor.name}</span>
                  <span className="dsm-sensor-info__id">#{sensor.sensorId}</span>
                </div>
              </div>

              {/* ---- Mode tabs ---- */}
              <div className="dsm-mode-tabs">
                <button
                  type="button"
                  className={`dsm-mode-tab ${mode === 'soft' ? 'dsm-mode-tab--active' : ''}`}
                  onClick={() => handleModeChange('soft')}
                >
                  <Trash2 size={14} />
                  Xóa mềm
                </button>
                <button
                  type="button"
                  className={`dsm-mode-tab dsm-mode-tab--hard ${mode === 'hard' ? 'dsm-mode-tab--hard-active' : ''}`}
                  onClick={() => handleModeChange('hard')}
                >
                  <ShieldAlert size={14} />
                  Xóa vĩnh viễn
                </button>
              </div>

              {/* ---- Mode description ---- */}
              {mode === 'soft' ? (
                <div className="dsm-mode-desc dsm-mode-desc--soft">
                  <strong>Xóa mềm</strong> — Cảm biến bị vô hiệu hóa và ẩn khỏi hệ thống nhưng dữ liệu lịch sử vẫn được giữ lại. Có thể khôi phục lại sau.
                </div>
              ) : (
                <div className="dsm-mode-desc dsm-mode-desc--hard">
                  <AlertTriangle size={14} />
                  <div>
                    <strong>Xóa vĩnh viễn</strong> — Toàn bộ dữ liệu cảm biến sẽ bị xóa không thể khôi phục. Hành động này <strong>không thể hoàn tác</strong>.
                  </div>
                </div>
              )}

              {/* ---- API error ---- */}
              {apiError && (
                <div className="dsm-api-error">
                  <AlertTriangle size={15} />
                  {apiError}
                </div>
              )}

              {/* ---- Reason ---- */}
              <div className="dsm-section">
                <label className="dsm-label" htmlFor="dsm-reason">
                  Lý do xóa <span className="dsm-required">*</span>
                </label>
                <div className={`dsm-field ${errors.reason && touched.reason ? 'dsm-field--error' : ''}`}>
                  <textarea
                    id="dsm-reason"
                    className="dsm-textarea"
                    placeholder="Mô tả lý do xóa cảm biến (ít nhất 10 ký tự)…"
                    value={reason}
                    onChange={(e) => handleReasonChange(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, reason: true }))}
                    maxLength={500}
                    rows={3}
                    autoFocus
                  />
                  <div className="dsm-field-meta">
                    {errors.reason && touched.reason
                      ? <span className="dsm-error-msg">{errors.reason}</span>
                      : <span />}
                    <span className="dsm-char-count">{reason.length}/500</span>
                  </div>
                </div>
              </div>

              {/* ---- Remove from map toggle ---- */}
              <div className="dsm-section dsm-section--inline">
                <label className="dsm-toggle-label" htmlFor="dsm-remove-from-map">
                  <div>
                    <p className="dsm-toggle-label__title">Xóa khỏi bản đồ</p>
                    <p className="dsm-toggle-label__desc">
                      Xóa khỏi Redis Geo — cảm biến sẽ không hiển thị trên bản đồ
                    </p>
                  </div>
                  <button
                    id="dsm-remove-from-map"
                    type="button"
                    role="switch"
                    aria-checked={removeFromMap}
                    className={`dsm-toggle ${removeFromMap ? 'dsm-toggle--on' : ''}`}
                    onClick={() => setRemoveFromMap((v) => !v)}
                  >
                    <span className="dsm-toggle__thumb" />
                  </button>
                </label>
              </div>

              {/* ---- Hard delete confirmation ---- */}
              {mode === 'hard' && (
                <div className="dsm-section">
                  <label className="dsm-label" htmlFor="dsm-confirm">
                    Xác nhận bằng cách nhập mã cảm biến{' '}
                    <span className="dsm-mono dsm-confirm-id">{sensor.sensorId}</span>
                  </label>
                  <div className={`dsm-field ${errors.confirm && touched.confirm ? 'dsm-field--error' : ''}`}>
                    <input
                      id="dsm-confirm"
                      className="dsm-input dsm-input--danger"
                      placeholder={`Nhập: ${sensor.sensorId}`}
                      value={confirmText}
                      onChange={(e) => handleConfirmChange(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                      autoComplete="off"
                    />
                    {errors.confirm && touched.confirm && (
                      <span className="dsm-error-msg">{errors.confirm}</span>
                    )}
                  </div>
                </div>
              )}

              {/* ---- Footer ---- */}
              <div className="dsm-footer">
                <button type="button" className="dsm-btn dsm-btn--secondary" onClick={onClose}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`dsm-btn ${mode === 'hard' ? 'dsm-btn--hard' : 'dsm-btn--danger'}`}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Đang xử lý…'
                    : mode === 'hard' ? 'Xóa vĩnh viễn' : 'Xóa cảm biến'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
