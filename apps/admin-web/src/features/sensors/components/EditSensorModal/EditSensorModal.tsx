import { useEffect, useRef, useState } from 'react';
import {
  X, MapPin, Map, Cpu, AlertTriangle, CheckCircle, Pencil,
} from 'lucide-react';
import type {
  SensorSummaryResponse,
  UpdateSensorRequest,
  UpdateSensorResponse,
} from '../../../../types/sensor.types';
import { sensorService } from '../../../../services/sensor.service';
import LocationPicker from '../AddSensorModal/LocationPicker';
import './EditSensorModal.css';

// ---- Validation ----

interface FormErrors {
  name?: string;
  locationName?: string;
  lat?: string;
  lon?: string;
  warningThreshold?: string;
  dangerThreshold?: string;
  hardwareModel?: string;
  firmwareVersion?: string;
  comment?: string;
}

type FormState = {
  name: string;
  locationName: string;
  lat: string;
  lon: string;
  warningThreshold: string;
  dangerThreshold: string;
  hardwareModel: string;
  firmwareVersion: string;
  comment: string;
};

function validate(f: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!f.name.trim())
    errors.name = 'Tên cảm biến không được để trống';
  else if (f.name.length > 255)
    errors.name = 'Tối đa 255 ký tự';

  if (f.locationName && f.locationName.length > 1000)
    errors.locationName = 'Tối đa 1000 ký tự';

  if (f.lat === '')
    errors.lat = 'Vĩ độ không được để trống';
  else if (Number(f.lat) < -90 || Number(f.lat) > 90)
    errors.lat = 'Vĩ độ phải từ -90 đến 90';

  if (f.lon === '')
    errors.lon = 'Kinh độ không được để trống';
  else if (Number(f.lon) < -180 || Number(f.lon) > 180)
    errors.lon = 'Kinh độ phải từ -180 đến 180';

  if (f.warningThreshold === '')
    errors.warningThreshold = 'Ngưỡng cảnh báo không được để trống';
  else if (Number(f.warningThreshold) < 0)
    errors.warningThreshold = 'Phải lớn hơn hoặc bằng 0';

  if (f.dangerThreshold === '')
    errors.dangerThreshold = 'Ngưỡng nguy hiểm không được để trống';
  else if (Number(f.dangerThreshold) < 0)
    errors.dangerThreshold = 'Phải lớn hơn hoặc bằng 0';
  else if (
    f.warningThreshold !== '' &&
    Number(f.dangerThreshold) <= Number(f.warningThreshold)
  )
    errors.dangerThreshold = 'Ngưỡng nguy hiểm phải lớn hơn ngưỡng cảnh báo';

  if (f.hardwareModel && f.hardwareModel.length > 100)
    errors.hardwareModel = 'Tối đa 100 ký tự';

  if (f.firmwareVersion && f.firmwareVersion.length > 50)
    errors.firmwareVersion = 'Tối đa 50 ký tự';

  if (f.comment && f.comment.length > 500)
    errors.comment = 'Ghi chú tối đa 500 ký tự';

  return errors;
}

// ---- Helpers ----

const CHANGED_FIELD_LABEL: Record<string, string> = {
  name: 'Tên trạm',
  locationName: 'Địa chỉ',
  lat: 'Vĩ độ',
  lon: 'Kinh độ',
  warningThreshold: 'Ngưỡng cảnh báo',
  dangerThreshold: 'Ngưỡng nguy hiểm',
  hardwareModel: 'Model phần cứng',
  firmwareVersion: 'Phiên bản firmware',
};

// ---- Success Screen ----

function SuccessScreen({
  result,
  onDone,
}: {
  result: UpdateSensorResponse;
  onDone: () => void;
}) {
  return (
    <>
      <div className="esm-header esm-header--success">
        <div className="esm-header__title">
          <span className="esm-header__icon esm-header__icon--success">
            <CheckCircle size={20} />
          </span>
          <span>Cập nhật cảm biến thành công</span>
        </div>
      </div>

      <div className="esm-form">
        <div className="esm-success-info">
          <div className="esm-success-row">
            <span className="esm-success-row__label">Mã cảm biến</span>
            <span className="esm-success-row__value esm-mono">{result.sensorId}</span>
          </div>
          <div className="esm-success-row">
            <span className="esm-success-row__label">Tên trạm</span>
            <span className="esm-success-row__value">{result.name}</span>
          </div>
          <div className="esm-success-row">
            <span className="esm-success-row__label">Ngưỡng cảnh báo / nguy hiểm</span>
            <span className="esm-success-row__value">
              <span className="esm-badge esm-badge--warning">{result.warningThreshold} cm</span>
              &nbsp;/&nbsp;
              <span className="esm-badge esm-badge--danger">{result.dangerThreshold} cm</span>
            </span>
          </div>

          {result.changedFields.length > 0 && (
            <div className="esm-changed-fields">
              <p className="esm-changed-fields__label">Trường đã cập nhật:</p>
              <ul className="esm-changed-fields__list">
                {result.changedFields.map((f) => (
                  <li key={f}>{CHANGED_FIELD_LABEL[f] ?? f}</li>
                ))}
              </ul>
            </div>
          )}

          {result.message && (
            <div className="esm-result-message">{result.message}</div>
          )}
        </div>

        <div className="esm-footer">
          <button className="esm-btn esm-btn--primary" onClick={onDone}>
            Hoàn thành
          </button>
        </div>
      </div>
    </>
  );
}

// ---- Main Modal ----

interface EditSensorModalProps {
  sensor: SensorSummaryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSensorModal({ sensor, onClose, onSuccess }: EditSensorModalProps) {
  const initForm = (): FormState => ({
    name: sensor.name,
    locationName: sensor.locationName ?? '',
    lat: String(sensor.lat),
    lon: String(sensor.lon),
    warningThreshold: String(sensor.warningThreshold ?? ''),
    dangerThreshold: String(sensor.dangerThreshold ?? ''),
    hardwareModel: sensor.hardwareModel ?? '',
    firmwareVersion: sensor.firmwareVersion ?? '',
    comment: '',
  });

  const [form, setForm] = useState<FormState>(initForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [updatedSensor, setUpdatedSensor] = useState<UpdateSensorResponse | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !updatedSensor) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, updatedSensor]);

  // Reverse geocoding via Nominatim
  async function reverseGeocode(lat: number, lon: number) {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`,
        { headers: { 'Accept-Language': 'vi' } },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { display_name?: string };
      if (data.display_name) {
        setForm((prev) => ({ ...prev, locationName: data.display_name! }));
      }
    } catch {
      // lỗi mạng — giữ nguyên
    } finally {
      setGeocoding(false);
    }
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) setErrors(validate(next));
      return next;
    });
  }

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  }

  function toPayload(f: FormState): UpdateSensorRequest {
    const payload: UpdateSensorRequest = {};
    if (f.name.trim()) payload.name = f.name.trim();
    if (f.locationName.trim()) payload.locationName = f.locationName.trim();
    if (f.lat !== '') payload.lat = Number(f.lat);
    if (f.lon !== '') payload.lon = Number(f.lon);
    if (f.warningThreshold !== '') payload.warningThreshold = Number(f.warningThreshold);
    if (f.dangerThreshold !== '') payload.dangerThreshold = Number(f.dangerThreshold);
    if (f.hardwareModel.trim()) payload.hardwareModel = f.hardwareModel.trim();
    if (f.firmwareVersion.trim()) payload.firmwareVersion = f.firmwareVersion.trim();
    if (f.comment.trim()) payload.comment = f.comment.trim();
    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(form).map((k) => [k, true])
    ) as Record<keyof FormState, boolean>;
    setTouched(allTouched);

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const result = await sensorService.updateSensor(sensor.id, toPayload(form));
      setUpdatedSensor(result);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Cập nhật cảm biến thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="esm-overlay"
      onClick={() => { if (!updatedSensor) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="esm-modal" onClick={(e) => e.stopPropagation()}>

        {updatedSensor ? (
          <SuccessScreen result={updatedSensor} onDone={onSuccess} />
        ) : (
          <>
            <div className="esm-header">
              <div className="esm-header__title">
                <span className="esm-header__icon"><Pencil size={18} /></span>
                <span>Chỉnh sửa Cảm biến</span>
                <span className="esm-header__subtitle">#{sensor.sensorId}</span>
              </div>
              <button className="esm-header__close" onClick={onClose} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>

            <form className="esm-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
              {/* ---- API error ---- */}
              {apiError && (
                <div className="esm-api-error">
                  <AlertTriangle size={15} />
                  {apiError}
                </div>
              )}

              {/* ---- Section: Thông tin cơ bản ---- */}
              <div className="esm-section">
                <p className="esm-section__label">Thông tin cơ bản</p>

                {/* name */}
                <div className={`esm-field ${errors.name && touched.name ? 'esm-field--error' : ''}`}>
                  <label className="esm-label" htmlFor="esm-name">
                    Tên trạm <span className="esm-required">*</span>
                  </label>
                  <input
                    id="esm-name"
                    ref={firstInputRef}
                    className="esm-input"
                    placeholder="VD: Trạm Cầu Giấy"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    maxLength={255}
                  />
                  {errors.name && touched.name && (
                    <span className="esm-error-msg">{errors.name}</span>
                  )}
                </div>

                {/* locationName */}
                <div className={`esm-field ${errors.locationName && touched.locationName ? 'esm-field--error' : ''}`}>
                  <label className="esm-label" htmlFor="esm-location">
                    <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Địa chỉ
                    {geocoding && <span className="esm-geocoding-badge">Đang tìm địa chỉ…</span>}
                  </label>
                  <div className="esm-input-wrap">
                    <input
                      id="esm-location"
                      className={`esm-input ${geocoding ? 'esm-input--loading' : ''}`}
                      placeholder="VD: Số 400 Cầu Giấy, Hà Nội"
                      value={form.locationName}
                      onChange={(e) => handleChange('locationName', e.target.value)}
                      onBlur={() => handleBlur('locationName')}
                      maxLength={1000}
                      disabled={geocoding}
                    />
                    {geocoding && <span className="esm-input-spinner" />}
                  </div>
                  {errors.locationName && touched.locationName && (
                    <span className="esm-error-msg">{errors.locationName}</span>
                  )}
                </div>
              </div>

              {/* ---- Section: Tọa độ GPS ---- */}
              <div className="esm-section">
                <p className="esm-section__label">Tọa độ GPS</p>
                <div className="esm-grid esm-grid--2">
                  <div className={`esm-field ${errors.lat && touched.lat ? 'esm-field--error' : ''}`}>
                    <label className="esm-label" htmlFor="esm-lat">
                      Vĩ độ (lat) <span className="esm-required">*</span>
                    </label>
                    <input
                      id="esm-lat"
                      className="esm-input"
                      type="number"
                      step="any"
                      placeholder="VD: 21.0285"
                      value={form.lat}
                      onChange={(e) => handleChange('lat', e.target.value)}
                      onBlur={() => handleBlur('lat')}
                    />
                    {errors.lat && touched.lat && (
                      <span className="esm-error-msg">{errors.lat}</span>
                    )}
                  </div>

                  <div className={`esm-field ${errors.lon && touched.lon ? 'esm-field--error' : ''}`}>
                    <label className="esm-label" htmlFor="esm-lon">
                      Kinh độ (lon) <span className="esm-required">*</span>
                    </label>
                    <input
                      id="esm-lon"
                      className="esm-input"
                      type="number"
                      step="any"
                      placeholder="VD: 105.8542"
                      value={form.lon}
                      onChange={(e) => handleChange('lon', e.target.value)}
                      onBlur={() => handleBlur('lon')}
                    />
                    {errors.lon && touched.lon && (
                      <span className="esm-error-msg">{errors.lon}</span>
                    )}
                  </div>
                </div>

                {/* Map toggle */}
                <button
                  type="button"
                  className={`esm-map-toggle ${showMap ? 'esm-map-toggle--active' : ''}`}
                  onClick={() => setShowMap((v) => !v)}
                >
                  <Map size={14} />
                  {showMap ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
                </button>

                {showMap && (
                  <div className="esm-map-wrap">
                    <LocationPicker
                      lat={form.lat !== '' ? Number(form.lat) : null}
                      lon={form.lon !== '' ? Number(form.lon) : null}
                      onChange={(lat, lon) => {
                        setForm((prev) => ({ ...prev, lat: String(lat), lon: String(lon) }));
                        setTouched((t) => ({ ...t, lat: true, lon: true }));
                        void reverseGeocode(lat, lon);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ---- Section: Ngưỡng cảnh báo ---- */}
              <div className="esm-section">
                <p className="esm-section__label">Ngưỡng cảnh báo</p>
                <div className="esm-grid esm-grid--2">
                  <div className={`esm-field ${errors.warningThreshold && touched.warningThreshold ? 'esm-field--error' : ''}`}>
                    <label className="esm-label" htmlFor="esm-warning">
                      Ngưỡng cảnh báo (cm) <span className="esm-required">*</span>
                    </label>
                    <input
                      id="esm-warning"
                      className="esm-input"
                      type="number"
                      min={0}
                      step="any"
                      placeholder="VD: 150"
                      value={form.warningThreshold}
                      onChange={(e) => handleChange('warningThreshold', e.target.value)}
                      onBlur={() => handleBlur('warningThreshold')}
                    />
                    {errors.warningThreshold && touched.warningThreshold && (
                      <span className="esm-error-msg">{errors.warningThreshold}</span>
                    )}
                  </div>

                  <div className={`esm-field ${errors.dangerThreshold && touched.dangerThreshold ? 'esm-field--error' : ''}`}>
                    <label className="esm-label" htmlFor="esm-danger">
                      Ngưỡng nguy hiểm (cm) <span className="esm-required">*</span>
                    </label>
                    <input
                      id="esm-danger"
                      className="esm-input"
                      type="number"
                      min={0}
                      step="any"
                      placeholder="VD: 200"
                      value={form.dangerThreshold}
                      onChange={(e) => handleChange('dangerThreshold', e.target.value)}
                      onBlur={() => handleBlur('dangerThreshold')}
                    />
                    {errors.dangerThreshold && touched.dangerThreshold && (
                      <span className="esm-error-msg">{errors.dangerThreshold}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ---- Section: Phần cứng ---- */}
              <div className="esm-section">
                <p className="esm-section__label">
                  <Cpu size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Thông tin phần cứng
                </p>
                <div className="esm-grid esm-grid--2">
                  <div className={`esm-field ${errors.hardwareModel && touched.hardwareModel ? 'esm-field--error' : ''}`}>
                    <label className="esm-label" htmlFor="esm-hw">Model phần cứng</label>
                    <input
                      id="esm-hw"
                      className="esm-input"
                      placeholder="VD: FloodSens-v2"
                      value={form.hardwareModel}
                      onChange={(e) => handleChange('hardwareModel', e.target.value)}
                      onBlur={() => handleBlur('hardwareModel')}
                      maxLength={100}
                    />
                    {errors.hardwareModel && touched.hardwareModel && (
                      <span className="esm-error-msg">{errors.hardwareModel}</span>
                    )}
                  </div>

                  <div className={`esm-field ${errors.firmwareVersion && touched.firmwareVersion ? 'esm-field--error' : ''}`}>
                    <label className="esm-label" htmlFor="esm-fw">Phiên bản firmware</label>
                    <input
                      id="esm-fw"
                      className="esm-input"
                      placeholder="VD: 2.1.0"
                      value={form.firmwareVersion}
                      onChange={(e) => handleChange('firmwareVersion', e.target.value)}
                      onBlur={() => handleBlur('firmwareVersion')}
                      maxLength={50}
                    />
                    {errors.firmwareVersion && touched.firmwareVersion && (
                      <span className="esm-error-msg">{errors.firmwareVersion}</span>
                    )}
                  </div>
                </div>

                {/* comment */}
                <div className={`esm-field ${errors.comment && touched.comment ? 'esm-field--error' : ''}`}>
                  <label className="esm-label" htmlFor="esm-comment">
                    Ghi chú thay đổi
                    <span className="esm-char-count">{form.comment.length}/500</span>
                  </label>
                  <textarea
                    id="esm-comment"
                    className="esm-textarea"
                    placeholder="Lý do cập nhật hoặc ghi chú kỹ thuật (không bắt buộc)"
                    value={form.comment}
                    onChange={(e) => handleChange('comment', e.target.value)}
                    onBlur={() => handleBlur('comment')}
                    maxLength={500}
                    rows={3}
                  />
                  {errors.comment && touched.comment && (
                    <span className="esm-error-msg">{errors.comment}</span>
                  )}
                </div>
              </div>

              {/* ---- Footer ---- */}
              <div className="esm-footer">
                <button type="button" className="esm-btn esm-btn--secondary" onClick={onClose}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="esm-btn esm-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
