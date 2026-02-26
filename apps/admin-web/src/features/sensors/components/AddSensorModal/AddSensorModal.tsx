import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Map, Cpu, AlertTriangle, CheckCircle, Copy, Check, KeyRound } from 'lucide-react';
import type { CreateSensorRequest, CreateSensorResponse } from '../../../../types/sensor.types';
import { sensorService } from '../../../../services/sensor.service';
import LocationPicker from './LocationPicker';
import './AddSensorModal.css';

// ---- Validation helpers ----

const SENSOR_ID_RE = /^[A-Z0-9-]+$/;

interface FormErrors {
  sensorId?: string;
  name?: string;
  locationName?: string;
  lat?: string;
  lon?: string;
  warningThreshold?: string;
  dangerThreshold?: string;
  hardwareModel?: string;
  firmwareVersion?: string;
}

function validate(f: Partial<CreateSensorRequest>): FormErrors {
  const errors: FormErrors = {};

  if (!f.sensorId?.trim())
    errors.sensorId = 'Mã cảm biến không được để trống';
  else if (f.sensorId.length > 50)
    errors.sensorId = 'Tối đa 50 ký tự';
  else if (!SENSOR_ID_RE.test(f.sensorId))
    errors.sensorId = 'Chỉ chứa chữ IN HOA, số và dấu gạch ngang (-)';

  if (!f.name?.trim())
    errors.name = 'Tên cảm biến không được để trống';
  else if (f.name.length > 255)
    errors.name = 'Tối đa 255 ký tự';

  if (f.locationName && f.locationName.length > 1000)
    errors.locationName = 'Tối đa 1000 ký tự';

  if (f.lat === undefined || f.lat === null || String(f.lat) === '')
    errors.lat = 'Vĩ độ không được để trống';
  else if (Number(f.lat) < -90 || Number(f.lat) > 90)
    errors.lat = 'Vĩ độ phải từ -90 đến 90';

  if (f.lon === undefined || f.lon === null || String(f.lon) === '')
    errors.lon = 'Kinh độ không được để trống';
  else if (Number(f.lon) < -180 || Number(f.lon) > 180)
    errors.lon = 'Kinh độ phải từ -180 đến 180';

  if (f.warningThreshold === undefined || String(f.warningThreshold) === '')
    errors.warningThreshold = 'Ngưỡng cảnh báo không được để trống';
  else if (Number(f.warningThreshold) < 0)
    errors.warningThreshold = 'Phải lớn hơn hoặc bằng 0';

  if (f.dangerThreshold === undefined || String(f.dangerThreshold) === '')
    errors.dangerThreshold = 'Ngưỡng nguy hiểm không được để trống';
  else if (Number(f.dangerThreshold) < 0)
    errors.dangerThreshold = 'Phải lớn hơn hoặc bằng 0';
  else if (
    f.warningThreshold !== undefined &&
    Number(f.dangerThreshold) <= Number(f.warningThreshold)
  )
    errors.dangerThreshold = 'Ngưỡng nguy hiểm phải lớn hơn ngưỡng cảnh báo';

  if (f.hardwareModel && f.hardwareModel.length > 100)
    errors.hardwareModel = 'Tối đa 100 ký tự';

  if (f.firmwareVersion && f.firmwareVersion.length > 50)
    errors.firmwareVersion = 'Tối đa 50 ký tự';

  return errors;
}

// ---- Types ----

interface AddSensorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FormState = {
  sensorId: string;
  name: string;
  locationName: string;
  lat: string;
  lon: string;
  warningThreshold: string;
  dangerThreshold: string;
  hardwareModel: string;
  firmwareVersion: string;
};

const EMPTY_FORM: FormState = {
  sensorId: '',
  name: '',
  locationName: '',
  lat: '',
  lon: '',
  warningThreshold: '',
  dangerThreshold: '',
  hardwareModel: '',
  firmwareVersion: '',
};

function SuccessScreen({
  sensor,
  onDone,
}: {
  sensor: CreateSensorResponse;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyKey() {
    void navigator.clipboard.writeText(sensor.apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <>
      <div className="asm-header asm-header--success">
        <div className="asm-header__title">
          <span className="asm-header__icon asm-header__icon--success">
            <CheckCircle size={20} />
          </span>
          <span>Tạo cảm biến thành công</span>
        </div>
      </div>

      <div className="asm-form">
        {/* ---- Sensor summary ---- */}
        <div className="asm-success-info">
          <div className="asm-success-row">
            <span className="asm-success-row__label">Mã cảm biến</span>
            <span className="asm-success-row__value asm-mono">{sensor.sensorId}</span>
          </div>
          <div className="asm-success-row">
            <span className="asm-success-row__label">Tên trạm</span>
            <span className="asm-success-row__value">{sensor.name}</span>
          </div>
          {sensor.locationName && (
            <div className="asm-success-row">
              <span className="asm-success-row__label">Địa chỉ</span>
              <span className="asm-success-row__value">{sensor.locationName}</span>
            </div>
          )}
          <div className="asm-success-row">
            <span className="asm-success-row__label">Ngưỡng cảnh báo / nguy hiểm</span>
            <span className="asm-success-row__value">
              <span className="asm-badge asm-badge--warning">{sensor.warningThreshold} cm</span>
              &nbsp;/&nbsp;
              <span className="asm-badge asm-badge--danger">{sensor.dangerThreshold} cm</span>
            </span>
          </div>
        </div>

        {/* ---- API Key block ---- */}
        <div className="asm-apikey-block">
          <div className="asm-apikey-header">
            <KeyRound size={15} />
            <span>API Key thiết bị</span>
          </div>

          <div className="asm-apikey-warning">
            <AlertTriangle size={13} />
            Đây là lần duy nhất API Key được hiển thị. Vui lòng sao chép và lưu lại ngay trước khi đóng.
          </div>

          <div className="asm-apikey-row">
            <code className="asm-apikey-value">{sensor.apiKey}</code>
            <button
              className={`asm-apikey-copy ${copied ? 'asm-apikey-copy--copied' : ''}`}
              onClick={copyKey}
              title="Sao chép API Key"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="asm-footer">
          <button className="asm-btn asm-btn--primary" onClick={onDone}>
            Hoàn thành
          </button>
        </div>
      </div>
    </>
  );
}

export default function AddSensorModal({ onClose, onSuccess }: AddSensorModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdSensor, setCreatedSensor] = useState<CreateSensorResponse | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Escape — block closing while API key screen is shown
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !createdSensor) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, createdSensor]);

  // Reverse geocoding via Nominatim (OpenStreetMap)
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
      // Lỗi mạng — giữ nguyên địa chỉ hiện tại
    } finally {
      setGeocoding(false);
    }
  }

  function handleChange(field: keyof FormState, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      setErrors(validate(toPayload(next)));
    }
  }

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(toPayload(form)));
  }

  function toPayload(f: FormState): Partial<CreateSensorRequest> {
    return {
      sensorId: f.sensorId,
      name: f.name,
      locationName: f.locationName || undefined,
      lat: f.lat !== '' ? Number(f.lat) : undefined,
      lon: f.lon !== '' ? Number(f.lon) : undefined,
      warningThreshold: f.warningThreshold !== '' ? Number(f.warningThreshold) : undefined,
      dangerThreshold: f.dangerThreshold !== '' ? Number(f.dangerThreshold) : undefined,
      hardwareModel: f.hardwareModel || undefined,
      firmwareVersion: f.firmwareVersion || undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(EMPTY_FORM).map((k) => [k, true])
    ) as Record<keyof FormState, boolean>;
    setTouched(allTouched);

    const payload = toPayload(form);
    const errs = validate(payload);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const result = await sensorService.createSensor(payload as CreateSensorRequest);
      setCreatedSensor(result); // switch to success / API-key screen
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Tạo cảm biến thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="asm-overlay"
      onClick={() => { if (!createdSensor) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="asm-modal" onClick={(e) => e.stopPropagation()}>

        {createdSensor ? (
          <SuccessScreen sensor={createdSensor} onDone={onSuccess} />
        ) : (
        <>
        <div className="asm-header">
          <div className="asm-header__title">
            <span className="asm-header__icon"><Cpu size={20} /></span>
            <span>Thêm Cảm biến Mới</span>
          </div>
          <button className="asm-header__close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <form className="asm-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
          {/* ---- API error banner ---- */}
          {apiError && (
            <div className="asm-api-error">
              <AlertTriangle size={15} />
              {apiError}
            </div>
          )}

          {/* ---- Section: Thông tin cơ bản ---- */}
          <div className="asm-section">
            <p className="asm-section__label">Thông tin cơ bản</p>
            <div className="asm-grid asm-grid--2">
              {/* sensorId */}
              <div className={`asm-field ${errors.sensorId && touched.sensorId ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-sensorId">
                  Mã cảm biến <span className="asm-required">*</span>
                </label>
                <input
                  id="asm-sensorId"
                  ref={firstInputRef}
                  className="asm-input"
                  placeholder="VD: SENS-HAN-044"
                  value={form.sensorId}
                  onChange={(e) => handleChange('sensorId', e.target.value.toUpperCase())}
                  onBlur={() => handleBlur('sensorId')}
                  maxLength={50}
                />
                {errors.sensorId && touched.sensorId && (
                  <span className="asm-error-msg">{errors.sensorId}</span>
                )}
              </div>

              {/* name */}
              <div className={`asm-field ${errors.name && touched.name ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-name">
                  Tên trạm <span className="asm-required">*</span>
                </label>
                <input
                  id="asm-name"
                  className="asm-input"
                  placeholder="VD: Trạm Cầu Giấy"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  maxLength={255}
                />
                {errors.name && touched.name && (
                  <span className="asm-error-msg">{errors.name}</span>
                )}
              </div>
            </div>

            {/* locationName — full width */}
            <div className={`asm-field ${errors.locationName && touched.locationName ? 'asm-field--error' : ''}`}>
              <label className="asm-label" htmlFor="asm-location">
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                Địa chỉ
                {geocoding && <span className="asm-geocoding-badge">Đang tìm địa chỉ…</span>}
              </label>
              <div className="asm-input-wrap">
                <input
                  id="asm-location"
                  className={`asm-input ${geocoding ? 'asm-input--loading' : ''}`}
                  placeholder="VD: Số 400 Cầu Giấy, Hà Nội"
                  value={form.locationName}
                  onChange={(e) => handleChange('locationName', e.target.value)}
                  onBlur={() => handleBlur('locationName')}
                  maxLength={1000}
                  disabled={geocoding}
                />
                {geocoding && <span className="asm-input-spinner" />}
              </div>
              {errors.locationName && touched.locationName && (
                <span className="asm-error-msg">{errors.locationName}</span>
              )}
            </div>
          </div>

          {/* ---- Section: Tọa độ ---- */}
          <div className="asm-section">
            <p className="asm-section__label">Tọa độ GPS</p>
            <div className="asm-grid asm-grid--2">
              <div className={`asm-field ${errors.lat && touched.lat ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-lat">
                  Vĩ độ (lat) <span className="asm-required">*</span>
                </label>
                <input
                  id="asm-lat"
                  className="asm-input"
                  type="number"
                  placeholder="VD: 21.028576"
                  step="any"
                  value={form.lat}
                  onChange={(e) => handleChange('lat', e.target.value)}
                  onBlur={() => handleBlur('lat')}
                />
                {errors.lat && touched.lat && (
                  <span className="asm-error-msg">{errors.lat}</span>
                )}
              </div>

              <div className={`asm-field ${errors.lon && touched.lon ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-lon">
                  Kinh độ (lon) <span className="asm-required">*</span>
                </label>
                <input
                  id="asm-lon"
                  className="asm-input"
                  type="number"
                  placeholder="VD: 105.854256"
                  step="any"
                  value={form.lon}
                  onChange={(e) => handleChange('lon', e.target.value)}
                  onBlur={() => handleBlur('lon')}
                />
                {errors.lon && touched.lon && (
                  <span className="asm-error-msg">{errors.lon}</span>
                )}
              </div>
            </div>

            {/* Toggle map */}
            <button
              type="button"
              className={`asm-map-toggle ${showMap ? 'asm-map-toggle--active' : ''}`}
              onClick={() => setShowMap((v) => !v)}
            >
              <Map size={14} />
              {showMap ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
            </button>

            {/* Map picker */}
            {showMap && (
              <LocationPicker
                lat={form.lat !== '' ? Number(form.lat) : null}
                lon={form.lon !== '' ? Number(form.lon) : null}
                onChange={(lat, lon) => {
                  setForm((prev) => ({ ...prev, lat: String(lat), lon: String(lon) }));
                  setTouched((t) => ({ ...t, lat: true, lon: true }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.lat;
                    delete next.lon;
                    return next;
                  });
                  void reverseGeocode(lat, lon);
                }}
              />
            )}
          </div>

          {/* ---- Section: Ngưỡng cảnh báo ---- */}
          <div className="asm-section">
            <p className="asm-section__label">Ngưỡng mực nước (cm)</p>
            <div className="asm-grid asm-grid--2">
              <div className={`asm-field ${errors.warningThreshold && touched.warningThreshold ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-warn">
                  Ngưỡng cảnh báo <span className="asm-required">*</span>
                  <span className="asm-badge asm-badge--warning">WARNING</span>
                </label>
                <input
                  id="asm-warn"
                  className="asm-input"
                  type="number"
                  placeholder="VD: 20"
                  min={0}
                  step="0.01"
                  value={form.warningThreshold}
                  onChange={(e) => handleChange('warningThreshold', e.target.value)}
                  onBlur={() => handleBlur('warningThreshold')}
                />
                {errors.warningThreshold && touched.warningThreshold && (
                  <span className="asm-error-msg">{errors.warningThreshold}</span>
                )}
              </div>

              <div className={`asm-field ${errors.dangerThreshold && touched.dangerThreshold ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-danger">
                  Ngưỡng nguy hiểm <span className="asm-required">*</span>
                  <span className="asm-badge asm-badge--danger">DANGER</span>
                </label>
                <input
                  id="asm-danger"
                  className="asm-input"
                  type="number"
                  placeholder="VD: 50"
                  min={0}
                  step="0.01"
                  value={form.dangerThreshold}
                  onChange={(e) => handleChange('dangerThreshold', e.target.value)}
                  onBlur={() => handleBlur('dangerThreshold')}
                />
                {errors.dangerThreshold && touched.dangerThreshold && (
                  <span className="asm-error-msg">{errors.dangerThreshold}</span>
                )}
              </div>
            </div>
            <p className="asm-hint">
              Ngưỡng nguy hiểm phải lớn hơn ngưỡng cảnh báo
            </p>
          </div>

          {/* ---- Section: Phần cứng ---- */}
          <div className="asm-section">
            <p className="asm-section__label">Thông tin phần cứng <span className="asm-optional">(tùy chọn)</span></p>
            <div className="asm-grid asm-grid--2">
              <div className={`asm-field ${errors.hardwareModel && touched.hardwareModel ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-hw">Model phần cứng</label>
                <input
                  id="asm-hw"
                  className="asm-input"
                  placeholder="VD: ESP32-S3"
                  value={form.hardwareModel}
                  onChange={(e) => handleChange('hardwareModel', e.target.value)}
                  onBlur={() => handleBlur('hardwareModel')}
                  maxLength={100}
                />
                {errors.hardwareModel && touched.hardwareModel && (
                  <span className="asm-error-msg">{errors.hardwareModel}</span>
                )}
              </div>

              <div className={`asm-field ${errors.firmwareVersion && touched.firmwareVersion ? 'asm-field--error' : ''}`}>
                <label className="asm-label" htmlFor="asm-fw">Phiên bản firmware</label>
                <input
                  id="asm-fw"
                  className="asm-input"
                  placeholder="VD: v1.0.0"
                  value={form.firmwareVersion}
                  onChange={(e) => handleChange('firmwareVersion', e.target.value)}
                  onBlur={() => handleBlur('firmwareVersion')}
                  maxLength={50}
                />
                {errors.firmwareVersion && touched.firmwareVersion && (
                  <span className="asm-error-msg">{errors.firmwareVersion}</span>
                )}
              </div>
            </div>
          </div>

          {/* ---- Footer actions ---- */}
          <div className="asm-footer">
            <button
              type="button"
              className="asm-btn asm-btn--ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="asm-btn asm-btn--primary"
              disabled={submitting}
            >
              {submitting && <span className="asm-spinner" />}
              {submitting ? 'Đang tạo…' : 'Tạo cảm biến'}
            </button>
          </div>
        </form>
        </>)}
      </div>
    </div>
  );
}
