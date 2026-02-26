import './MapControls.css';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import type { SeverityLevel } from '../../../../types/flood.types';
  import type { WsStatus } from '../../hooks/useFloodWebSocket';
import { SEVERITY_COLOR, SEVERITY_LABEL } from './constants';

// ---- Fullscreen button ----

export function FullscreenControl({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      setTimeout(() => map.invalidateSize(), 200);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [map]);

  const toggle = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => null);
    else document.exitFullscreen().catch(() => null);
  };

  return (
    <button
      className="sensor-map__fullscreen-btn"
      title={isFullscreen ? 'Thu nhỏ' : 'Phóng to bản đồ'}
      onClick={toggle}
    >
      {isFullscreen ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
          <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>
          <path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
        </svg>
      )}
    </button>
  );
}

// ---- Legend item ----

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="sensor-map__legend-item">
      <span className="sensor-map__legend-dot" style={{ background: color }} />
      {label}
    </div>
  );
}

// ---- Map header badges + legend ----

interface MapHeaderProps {
  loading:           boolean;
  wsStatus:          WsStatus;
  apiError:          string | null;
  floodCount:        number;
  totalSensorCount:  number;
  counts:            Record<SeverityLevel, number>;
}

export function MapHeader({
  loading, wsStatus, apiError, floodCount, totalSensorCount, counts,
}: MapHeaderProps) {
  return (
    <div className="sensor-map__header">
      <div className="sensor-map__header-left">
        <h2 className="sensor-map__title">Bản đồ giám sát lũ lụt thời gian thực</h2>

        {loading && (
          <span className="sensor-map__badge sensor-map__badge--loading">Đang tải…</span>
        )}

        {!loading && (
          <span className={`sensor-map__badge ${
            wsStatus === 'connected'  ? 'sensor-map__badge--ws-on'   :
            wsStatus === 'connecting' ? 'sensor-map__badge--loading' :
                                        'sensor-map__badge--ws-off'
          }`}>
            {wsStatus === 'connected'  ? '● Live' :
             wsStatus === 'connecting' ? '◌ Đang kết nối…' : '○ Offline'}
          </span>
        )}

        {!loading && !apiError && (
          <span className="sensor-map__badge sensor-map__badge--count">{floodCount} điểm ngập</span>
        )}

        {totalSensorCount > 0 && (
          <span className="sensor-map__badge sensor-map__badge--sensor">{totalSensorCount} cảm biến</span>
        )}
      </div>

      <div className="sensor-map__legend">
        {(Object.keys(counts) as SeverityLevel[]).map(sev =>
          counts[sev] > 0 && (
            <LegendItem
              key={sev}
              color={SEVERITY_COLOR[sev]}
              label={`${SEVERITY_LABEL[sev]} (${counts[sev]})`}
            />
          )
        )}
      </div>
    </div>
  );
}
