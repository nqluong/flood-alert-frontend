import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import type {
  SensorApiStatus,
  SensorSummaryResponse,
  ChangeStatusRequest,
  ChangeStatusResponse,
} from '../../../../types/sensor.types';
import { sensorService } from '../../../../services/sensor.service';
import './ChangeStatusModal.css';

// ---- Constants ----

const STATUS_LABEL: Record<SensorApiStatus, string> = {
  ACTIVE:      'Hoạt động',
  DISABLED:    'Vô hiệu hóa',
  MAINTENANCE: 'Bảo trì',
  OFFLINE:     'Ngoại tuyến',
};

const STATUS_CLASS: Record<SensorApiStatus, string> = {
  ACTIVE:      'csm-status--active',
  DISABLED:    'csm-status--disabled',
  MAINTENANCE: 'csm-status--maintenance',
  OFFLINE:     'csm-status--offline',
};

const STATUS_DESC: Record<SensorApiStatus, string> = {
  ACTIVE:      'Cảm biến đang ghi nhận và gửi dữ liệu bình thường',
  DISABLED:    'Tạm ngừng - hệ thống sẽ từ chối dữ liệu từ cảm biến này',
  MAINTENANCE: 'Đang bảo trì - hệ thống không nhận dữ liệu trong thời gian này',
  OFFLINE:     'Mất kết nối - hệ thống sẽ từ chối dữ liệu từ cảm biến này',
};

const ALLOWED_TRANSITIONS: Record<SensorApiStatus, SensorApiStatus[]> = {
  ACTIVE:      ['DISABLED', 'MAINTENANCE', 'OFFLINE'],
  DISABLED:    ['ACTIVE', 'MAINTENANCE'],
  MAINTENANCE: ['ACTIVE', 'DISABLED', 'OFFLINE'],
  OFFLINE:     ['ACTIVE', 'MAINTENANCE'],
};

// ---- Validation ----

interface FormErrors {
  newStatus?: string;
  reason?: string;
  comment?: string;
}

function validate(newStatus: SensorApiStatus | null, reason: string, comment: string): FormErrors {
  const errors: FormErrors = {};
  if (!newStatus) errors.newStatus = 'Vui lòng chọn trạng thái mới';
  if (!reason.trim()) errors.reason = 'Lý do không được để trống';
  else if (reason.trim().length < 5) errors.reason = 'Lý do ít nhất 5 ký tự';
  else if (reason.length > 500) errors.reason = 'Tối đa 500 ký tự';
  if (comment && comment.length > 500) errors.comment = 'Tối đa 500 ký tự';
  return errors;
}

function SuccessScreen({
  result,
  onDone,
}: {
  result: ChangeStatusResponse;
  onDone: () => void;
}) {
  return (
    <>
      <div className="csm-header csm-header--success">
        <div className="csm-header__title">
          <span className="csm-header__icon csm-header__icon--success">
            <CheckCircle size={20} />
          </span>
          <span>Chuyển trạng thái thành công</span>
        </div>
      </div>

      <div className="csm-body">
        <div className="csm-success-transition">
          <span className={`csm-status-badge ${STATUS_CLASS[result.previousStatus]}`}>
            {STATUS_LABEL[result.previousStatus] ?? result.previousStatus}
          </span>
          <ArrowRight size={18} className="csm-success-arrow" />
          <span className={`csm-status-badge ${STATUS_CLASS[result.currentStatus]}`}>
            {STATUS_LABEL[result.currentStatus] ?? result.currentStatus}
          </span>
        </div>

        <div className="csm-success-info">
          <div className="csm-success-row">
            <span className="csm-success-row__label">Mã cảm biến</span>
            <span className="csm-success-row__value csm-mono">{result.sensorId}</span>
          </div>
          <div className="csm-success-row">
            <span className="csm-success-row__label">Tên trạm</span>
            <span className="csm-success-row__value">{result.name}</span>
          </div>
          <div className="csm-success-row">
            <span className="csm-success-row__label">Thời điểm</span>
            <span className="csm-success-row__value">
              {new Date(result.changedAt).toLocaleString('vi-VN')}
            </span>
          </div>
          {result.addedToBlacklist && (
            <div className="csm-blacklist-warn">
              <AlertTriangle size={13} />
              Cảm biến đã bị đưa vào blacklist — hệ thống sẽ từ chối dữ liệu gửi lên.
            </div>
          )}
          {result.message && (
            <div className="csm-result-message">{result.message}</div>
          )}
        </div>

        <div className="csm-footer">
          <button className="csm-btn csm-btn--primary" onClick={onDone}>
            Hoàn thành
          </button>
        </div>
      </div>
    </>
  );
}

// ---- Main Modal ----

interface ChangeStatusModalProps {
  sensor: SensorSummaryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeStatusModal({ sensor, onClose, onSuccess }: ChangeStatusModalProps) {
  const allowedStatuses = ALLOWED_TRANSITIONS[sensor.status] ?? [];
  const [selected, setSelected] = useState<SensorApiStatus | null>(
    allowedStatuses.length === 1 ? allowedStatuses[0] : null,
  );
  const [reason,  setReason]  = useState('');
  const [comment, setComment] = useState('');
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [touched, setTouched] = useState({ newStatus: false, reason: false, comment: false });
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [result,     setResult]     = useState<ChangeStatusResponse | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    reasonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !result) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, result]);

  function handleSelect(status: SensorApiStatus) {
    setSelected(status);
    if (touched.newStatus) setErrors(validate(status, reason, comment));
  }

  function handleReasonChange(v: string) {
    setReason(v);
    if (touched.reason) setErrors(validate(selected, v, comment));
  }

  function handleCommentChange(v: string) {
    setComment(v);
    if (touched.comment) setErrors(validate(selected, reason, v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ newStatus: true, reason: true, comment: true });
    const errs = validate(selected, reason, comment);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: ChangeStatusRequest = {
      newStatus: selected!,
      reason: reason.trim(),
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    };

    setSubmitting(true);
    setApiError(null);
    try {
      const data = await sensorService.changeSensorStatus(sensor.id, payload);
      setResult(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Chuyển trạng thái thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="csm-overlay"
      onClick={() => { if (!result) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="csm-modal" onClick={(e) => e.stopPropagation()}>

        {result ? (
          <SuccessScreen result={result} onDone={onSuccess} />
        ) : (
          <>
            <div className="csm-header">
              <div className="csm-header__title">
                <span className="csm-header__icon">
                  <RefreshCw size={18} />
                </span>
                <span>Chuyển trạng thái cảm biến</span>
              </div>
              <button className="csm-header__close" onClick={onClose} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>

            <form className="csm-body" onSubmit={(e) => void handleSubmit(e)} noValidate>
              {/* ---- Current status info ---- */}
              <div className="csm-current">
                <div className="csm-current__info">
                  <span className="csm-current__name">{sensor.name}</span>
                  <span className="csm-current__id">#{sensor.sensorId}</span>
                </div>
                <span className={`csm-status-badge ${STATUS_CLASS[sensor.status]}`}>
                  {STATUS_LABEL[sensor.status] ?? sensor.status}
                </span>
              </div>

              {/* ---- API error ---- */}
              {apiError && (
                <div className="csm-api-error">
                  <AlertTriangle size={15} />
                  {apiError}
                </div>
              )}

              {/* ---- Status cards ---- */}
              <div className="csm-section">
                <p className="csm-section__label">Chuyển sang trạng thái</p>
                {allowedStatuses.length === 0 ? (
                  <div className="csm-no-transitions">
                    Không có trạng thái nào có thể chuyển từ <strong>{STATUS_LABEL[sensor.status]}</strong>.
                  </div>
                ) : (
                  <div className="csm-status-cards">
                    {allowedStatuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`csm-status-card ${selected === s ? 'csm-status-card--selected' : ''} csm-status-card--${s.toLowerCase()}`}
                        onClick={() => handleSelect(s)}
                      >
                        <span className={`csm-status-badge csm-status-badge--sm ${STATUS_CLASS[s]}`}>
                          {STATUS_LABEL[s]}
                        </span>
                        <span className="csm-status-card__desc">{STATUS_DESC[s]}</span>
                      </button>
                    ))}
                  </div>
                )}
                {errors.newStatus && touched.newStatus && (
                  <span className="csm-error-msg">{errors.newStatus}</span>
                )}
              </div>

              {/* ---- Reason ---- */}
              <div className="csm-section">
                <p className="csm-section__label">Lý do chuyển trạng thái <span className="csm-required">*</span></p>
                <div className={`csm-field ${errors.reason && touched.reason ? 'csm-field--error' : ''}`}>
                  <textarea
                    ref={reasonRef}
                    className="csm-textarea"
                    placeholder="VD: Bảo trì định kỳ tháng 2, dự kiến hoàn thành sau 2 giờ…"
                    value={reason}
                    onChange={(e) => handleReasonChange(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, reason: true }))}
                    maxLength={500}
                    rows={3}
                  />
                  <div className="csm-field-meta">
                    {errors.reason && touched.reason
                      ? <span className="csm-error-msg">{errors.reason}</span>
                      : <span />}
                    <span className="csm-char-count">{reason.length}/500</span>
                  </div>
                </div>
              </div>

              {/* ---- Comment (optional) ---- */}
              <div className="csm-section">
                <p className="csm-section__label">Ghi chú thêm <span className="csm-optional">(không bắt buộc)</span></p>
                <div className={`csm-field ${errors.comment && touched.comment ? 'csm-field--error' : ''}`}>
                  <textarea
                    className="csm-textarea"
                    placeholder="Thông tin bổ sung, tên kỹ thuật viên, liên hệ, v.v."
                    value={comment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, comment: true }))}
                    maxLength={500}
                    rows={2}
                  />
                  <div className="csm-field-meta">
                    {errors.comment && touched.comment
                      ? <span className="csm-error-msg">{errors.comment}</span>
                      : <span />}
                    <span className="csm-char-count">{comment.length}/500</span>
                  </div>
                </div>
              </div>

              {/* ---- Footer ---- */}
              <div className="csm-footer">
                <button type="button" className="csm-btn csm-btn--secondary" onClick={onClose}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="csm-btn csm-btn--primary"
                  disabled={submitting || allowedStatuses.length === 0}
                >
                  {submitting ? 'Đang xử lý…' : 'Xác nhận chuyển trạng thái'}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
