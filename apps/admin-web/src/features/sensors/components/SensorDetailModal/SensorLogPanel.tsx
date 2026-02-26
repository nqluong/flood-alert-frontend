import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { SensorLog } from '../../../../types/sensor.types';
import './SensorLogPanel.css';

// ---- Constants ----

const ACTION_LABEL: Record<string, string> = {
    CREATED:        'Tạo mới',
    STATUS_CHANGED: 'Thay đổi trạng thái',
    UPDATED:        'Cập nhật thông tin',
    DELETED:        'Xóa cảm biến',
    RESTORED:       'Khôi phục',
};

const ACTION_COLOR: Record<string, string> = {
    CREATED:        '#22c55e',
    STATUS_CHANGED: '#3b82f6',
    UPDATED:        '#f59e0b',
    DELETED:        '#ef4444',
    RESTORED:       '#8b5cf6',
};

const FIELD_LABEL: Record<string, string> = {
    sensorId:         'Mã cảm biến',
    name:             'Tên cảm biến',
    status:           'Trạng thái',
    lat:              'Vĩ độ',
    lon:              'Kinh độ',
    locationName:     'Vị trí',
    warningThreshold: 'Ngưỡng cảnh báo (cm)',
    dangerThreshold:  'Ngưỡng nguy hiểm (cm)',
    hardwareModel:    'Model phần cứng',
    firmwareVersion:  'Phiên bản firmware',
    batteryLevel:     'Pin (%)',
    signalStrength:   'Tín hiệu (dBm)',
    installedAt:      'Ngày lắp đặt',
};

const STATUS_DISPLAY: Record<string, string> = {
    ACTIVE:      'Hoạt động',
    OFFLINE:     'Ngoại tuyến',
    DISABLED:    'Vô hiệu hóa',
    MAINTENANCE: 'Bảo trì',
    DELETED:     'Đã xóa',
};

// ---- Helpers ----

function displayValue(key: string, val: unknown): string {
    if (val === null || val === undefined) return '--';
    if (key === 'status' && typeof val === 'string') return STATUS_DISPLAY[val] ?? val;
    return String(val);
}

// ---- Diff ----

interface DiffRow { field: string; label: string; oldVal: string; newVal: string; }

function computeDiff(
    oldObj: Record<string, unknown> | null,
    newObj: Record<string, unknown> | null,
): DiffRow[] {
    const allKeys = new Set([
        ...Object.keys(oldObj ?? {}),
        ...Object.keys(newObj ?? {}),
    ]);

    const rows: DiffRow[] = [];
    for (const key of allKeys) {
        if (key === 'id') continue;
        const oldVal = displayValue(key, oldObj?.[key]);
        const newVal = displayValue(key, newObj?.[key]);
        if (oldVal === newVal) continue;
        rows.push({ field: key, label: FIELD_LABEL[key] ?? key, oldVal, newVal });
    }
    return rows;
}

function LogDiff({
    oldValue,
    newValue,
    action,
}: {
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    action: string;
}) {
    if (action === 'CREATED' && newValue) {
        const createdRows = Object.entries(newValue)
            .filter(([k]) => k !== 'id')
            .map(([k, v]) => ({ field: k, label: FIELD_LABEL[k] ?? k, val: displayValue(k, v) }))
            .filter(r => r.val !== '--');

        return (
            <div className="sdm-diff-table-wrapper">
                <table className="sdm-diff-table sdm-diff-table--created">
                    <thead>
                        <tr>
                            <th>Trường</th>
                            <th>Giá trị khởi tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {createdRows.map(r => (
                            <tr key={r.field}>
                                <td className="sdm-diff-field">{r.label}</td>
                                <td className="sdm-diff-new">{r.val}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    const rows = computeDiff(oldValue, newValue);

    if (rows.length === 0) {
        return <p className="sdm-diff-empty">Không có trường nào thay đổi.</p>;
    }

    return (
        <div className="sdm-diff-table-wrapper">
            <table className="sdm-diff-table">
                <thead>
                    <tr>
                        <th>Trường</th>
                        <th>Trước</th>
                        <th>Sau</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.field}>
                            <td className="sdm-diff-field">{r.label}</td>
                            <td className="sdm-diff-old">{r.oldVal}</td>
                            <td className="sdm-diff-new">{r.newVal}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---- LogEntry ----

function LogEntry({ log, isLast }: { log: SensorLog; isLast: boolean }) {
    const color = ACTION_COLOR[log.action] ?? '#6b7280';
    const label = ACTION_LABEL[log.action] ?? log.action;
    const [open, setOpen] = useState(false);
    const hasValues = log.oldValue !== null || log.newValue !== null;

    return (
        <div className={`sdm-log-entry ${isLast ? '' : 'sdm-log-entry--line'}`}>
            <span className="sdm-log-dot" style={{ background: color, borderColor: color }} />

            <div className="sdm-log-content">
                <div className="sdm-log-header">
                    <span className="sdm-log-action" style={{ color }}>{label}</span>
                    <span className="sdm-log-time">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </span>
                </div>

                {log.comment && (
                    <p className="sdm-log-comment">{log.comment}</p>
                )}

                {hasValues && (
                    <button className="sdm-log-toggle" onClick={() => setOpen(v => !v)}>
                        {open
                            ? <ChevronDown className="sdm-log-toggle__icon" />
                            : <ChevronUp className="sdm-log-toggle__icon" />}
                        <span className="sdm-log-toggle__label">
                            {open ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                        </span>
                    </button>
                )}

                {open && hasValues && (
                    <LogDiff
                        oldValue={log.oldValue}
                        newValue={log.newValue}
                        action={log.action}
                    />
                )}
            </div>
        </div>
    );
}

// ---- SensorLogPanel ----

interface SensorLogPanelProps {
    logs: SensorLog[] | null;
    logsLoading: boolean;
    logsError: string | null;
    onRetry: () => void;
}

export default function SensorLogPanel({ logs, logsLoading, logsError, onRetry }: SensorLogPanelProps) {
    return (
        <div className="sdm-logs-panel">
            {logsLoading && (
                <div className="sdm-loading">
                    <span className="sdm-loading__spinner" />
                    Đang tải nhật ký…
                </div>
            )}

            {logsError && (
                <div className="sdm-error">
                    <AlertTriangle size={14} />
                    {logsError}
                    <button className="sdm-error__retry" onClick={onRetry}>
                        Thử lại
                    </button>
                </div>
            )}

            {logs !== null && logs.length === 0 && (
                <div className="sdm-logs-empty">
                    Chưa có nhật ký hoạt động nào.
                </div>
            )}

            {logs && logs.length > 0 && (
                <div className="sdm-log-timeline">
                    {logs.map((log, i) => (
                        <LogEntry key={log.id} log={log} isLast={i === logs.length - 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
