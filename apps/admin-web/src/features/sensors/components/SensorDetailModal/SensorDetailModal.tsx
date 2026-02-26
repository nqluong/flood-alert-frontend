import { useCallback, useEffect, useState } from 'react';
import './SensorDetailModal.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    X, Cpu, MapPin, Battery, Wifi, Wrench,
    Calendar, AlertTriangle, RefreshCw, ScrollText, Info,
} from 'lucide-react';
import type { SensorDetailResponse, SensorLog, SensorSummaryResponse } from '../../../../types/sensor.types';
import { sensorService } from '../../../../services/sensor.service';
import SensorLogPanel from './SensorLogPanel';

function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        const id = setTimeout(() => map.invalidateSize(), 0);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

// ---- Constants ----

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Hoạt động',
    OFFLINE: 'Ngoại tuyến',
    DISABLED: 'Vô hiệu hóa',
    MAINTENANCE: 'Bảo trì',
    DELETED: 'Đã xóa',
};

const STATUS_CLASS: Record<string, string> = {
    ACTIVE: 'badge--active',
    OFFLINE: 'badge--offline',
    DISABLED: 'badge--disabled',
    MAINTENANCE: 'badge--maintenance',
    DELETED: 'badge--deleted',
};

const PIN_COLOR: Record<string, string> = {
    ACTIVE: '#22c55e',
    OFFLINE: '#6b7280',
    DISABLED: '#f59e0b',
    MAINTENANCE: '#3b82f6',
    DELETED: '#9d174d',
};

function createSensorPin(status: string): L.DivIcon {
    const color = PIN_COLOR[status] ?? '#6b7280';
    return L.divIcon({
        className: '',
        html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

// ---- Helpers ----

const fmt = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleString('vi-VN') : '--';
const fmtDate = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleDateString('vi-VN') : '--';

// ---- Sub-components ----

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="sdm-row">
            <span className="sdm-row__label">{label}</span>
            <span className="sdm-row__value">{children}</span>
        </div>
    );
}

// ---- Main component ----

interface SensorDetailModalProps {
    sensor: SensorSummaryResponse;
    onClose: () => void;
    hideMap?: boolean;
}

type Tab = 'info' | 'logs';

export default function SensorDetailModal({ sensor, onClose, hideMap = false }: SensorDetailModalProps) {
    const [detail, setDetail] = useState<SensorDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('info');
    const [logs, setLogs] = useState<SensorLog[] | null>(null);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await sensorService.getSensorById(sensor.id);
            setDetail(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Đã xảy ra lỗi khi tải chi tiết.');
        } finally {
            setLoading(false);
        }
    }, [sensor.id]);

    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        setLogsError(null);
        try {
            const data = await sensorService.getSensorById(sensor.id, { includeLogs: true });
            setLogs(data.logs ?? []);
        } catch (e) {
            setLogsError(e instanceof Error ? e.message : 'Đã xảy ra lỗi khi tải nhật ký.');
        } finally {
            setLogsLoading(false);
        }
    }, [sensor.id]);

    useEffect(() => { void fetchDetail(); }, [fetchDetail]);

    // Lazy-load logs when tab becomes 'logs' for the first time
    useEffect(() => {
        if (tab === 'logs' && logs === null && !logsLoading) {
            void fetchLogs();
        }
    }, [tab, logs, logsLoading, fetchLogs]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const d = detail;

    return (
        <div
            className="sdm-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="sdm-modal">

                {/* ---- Header ---- */}
                <div className="sdm-header">
                    <div className="sdm-header__left">
                        <span className="sdm-header__icon"><Cpu size={17} /></span>
                        <div className="sdm-header__titles">
                            <span className="sdm-header__name">{sensor.name}</span>
                            <span className="sdm-header__sensorid">{sensor.sensorId}</span>
                        </div>
                        <span className={`badge ${STATUS_CLASS[sensor.status] ?? 'badge--offline'}`}>
                            <span className="badge__dot" />
                            {STATUS_LABEL[sensor.status] ?? sensor.status}
                        </span>
                    </div>
                    <div className="sdm-header__right">
                        {tab === 'info' && !loading && (
                            <button className="sdm-header__refresh" title="Làm mới" onClick={() => void fetchDetail()}>
                                <RefreshCw size={15} />
                            </button>
                        )}
                        {tab === 'logs' && !logsLoading && (
                            <button className="sdm-header__refresh" title="Làm mới nhật ký" onClick={() => { setLogs(null); void fetchLogs(); }}>
                                <RefreshCw size={15} />
                            </button>
                        )}
                        <button className="sdm-header__close" onClick={onClose}><X size={17} /></button>
                    </div>
                </div>

                {/* ---- Tabs ---- */}
                <div className="sdm-tabs">
                    <button
                        className={`sdm-tab ${tab === 'info' ? 'sdm-tab--active' : ''}`}
                        onClick={() => setTab('info')}
                    >
                        <Info size={13} /> Thông tin
                    </button>
                    <button
                        className={`sdm-tab ${tab === 'logs' ? 'sdm-tab--active' : ''}`}
                        onClick={() => setTab('logs')}
                    >
                        <ScrollText size={13} /> Nhật ký hoạt động
                        {logs !== null && logs.length > 0 && (
                            <span className="sdm-tab__badge">{logs.length}</span>
                        )}
                    </button>
                </div>

                {/* ---- Body ---- */}
                <div className="sdm-body">

                    {/* ======== INFO TAB ======== */}
                    {tab === 'info' && <>
                        {/* Map panel — ẩn nếu hideMap=true */}
                        {!hideMap && <div className="sdm-map-panel">
                            <MapContainer
                                center={[sensor.lat, sensor.lon]}
                                zoom={15}
                                className="sdm-map"
                                zoomControl
                                scrollWheelZoom
                            >
                                <InvalidateSize />
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <Marker
                                    position={[sensor.lat, sensor.lon]}
                                    icon={createSensorPin(sensor.status)}
                                >
                                    <Tooltip permanent direction="top" offset={[0, -16]}>
                                        <strong>{sensor.sensorId}</strong>
                                        <br />
                                        {sensor.name}
                                    </Tooltip>
                                </Marker>
                            </MapContainer>

                            <div className="sdm-coords">
                                <MapPin size={12} />
                                <span>{sensor.lat.toFixed(6)},&nbsp;{sensor.lon.toFixed(6)}</span>
                                {sensor.locationName && (
                                    <span className="sdm-coords__location"> — {sensor.locationName}</span>
                                )}
                            </div>
                        </div>}

                        {/* Info panel */}
                        <div className={`sdm-info-panel${hideMap ? ' sdm-info-panel--full' : ''}`}>
                            {loading && (
                                <div className="sdm-loading">
                                    <span className="sdm-loading__spinner" />
                                    Đang tải chi tiết…
                                </div>
                            )}

                            {error && (
                                <div className="sdm-error">
                                    <AlertTriangle size={14} />
                                    {error}
                                    <button className="sdm-error__retry" onClick={() => void fetchDetail()}>
                                        Thử lại
                                    </button>
                                </div>
                            )}

                            {d && <>
                                {/* Định danh */}
                                <section className="sdm-section">
                                    <h4 className="sdm-section__title">
                                        <Cpu size={12} /> Định danh
                                    </h4>
                                    <InfoRow label="Mã cảm biến">
                                        <code className="sdm-code">{d.sensorId}</code>
                                    </InfoRow>
                                    <InfoRow label="UUID">
                                        <code className="sdm-code sdm-code--muted">{d.id}</code>
                                    </InfoRow>
                                    <InfoRow label="Tên">{d.name}</InfoRow>
                                    <InfoRow label="Vị trí">
                                        {d.locationName ?? `${d.lat.toFixed(5)}, ${d.lon.toFixed(5)}`}
                                    </InfoRow>
                                </section>

                                {/* Ngưỡng */}
                                <section className="sdm-section">
                                    <h4 className="sdm-section__title">
                                        <AlertTriangle size={12} /> Ngưỡng cảnh báo
                                    </h4>
                                    <InfoRow label="Cảnh báo">
                                        <span className="sdm-threshold sdm-threshold--warn">
                                            {d.warningThreshold !== null ? `${d.warningThreshold} cm` : '--'}
                                        </span>
                                    </InfoRow>
                                    <InfoRow label="Nguy hiểm">
                                        <span className="sdm-threshold sdm-threshold--danger">
                                            {d.dangerThreshold !== null ? `${d.dangerThreshold} cm` : '--'}
                                        </span>
                                    </InfoRow>
                                </section>

                                {/* Phần cứng */}
                                <section className="sdm-section">
                                    <h4 className="sdm-section__title">
                                        <Wrench size={12} /> Phần cứng
                                    </h4>
                                    <InfoRow label="Model">{d.hardwareModel ?? '--'}</InfoRow>
                                    <InfoRow label="Firmware">
                                        <code className="sdm-code">{d.firmwareVersion ?? '--'}</code>
                                    </InfoRow>
                                    <InfoRow label="Pin">
                                        {d.batteryLevel !== null
                                            ? (
                                                <span className={`sdm-pill ${d.batteryLevel < 20 ? 'sdm-pill--warn' : 'sdm-pill--ok'}`}>
                                                    <Battery size={11} />{d.batteryLevel}%
                                                </span>
                                            )
                                            : '--'
                                        }
                                    </InfoRow>
                                    <InfoRow label="Tín hiệu">
                                        {d.signalStrength !== null
                                            ? (
                                                <span className={`sdm-pill ${d.signalStrength < -90 ? 'sdm-pill--warn' : 'sdm-pill--ok'}`}>
                                                    <Wifi size={11} />{d.signalStrength} dBm
                                                </span>
                                            )
                                            : '--'
                                        }
                                    </InfoRow>
                                </section>

                                {/* Thời gian */}
                                <section className="sdm-section sdm-section--last">
                                    <h4 className="sdm-section__title">
                                        <Calendar size={12} /> Thời gian
                                    </h4>
                                    <InfoRow label="Lắp đặt">{fmtDate(d.installedAt)}</InfoRow>
                                    <InfoRow label="Heartbeat cuối">{fmt(d.lastHeartbeat)}</InfoRow>
                                    <InfoRow label="Đọc số cuối">{fmt(d.lastReadingAt)}</InfoRow>
                                    <InfoRow label="Tạo lúc">{fmt(d.createdAt)}</InfoRow>
                                    <InfoRow label="Cập nhật">{fmt(d.updatedAt)}</InfoRow>
                                    {d.createdBy && <InfoRow label="Tạo bởi">{d.createdBy}</InfoRow>}
                                </section>
                            </>}
                        </div>
                    </>}

                    {/* ======== LOGS TAB ======== */}
                    {tab === 'logs' && (
                        <SensorLogPanel
                            logs={logs}
                            logsLoading={logsLoading}
                            logsError={logsError}
                            onRetry={() => { setLogs(null); void fetchLogs(); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
