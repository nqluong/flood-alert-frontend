import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  ActiveFloodEvent,
  FloodLifecycleEvent,
  ProcessedSensorData,
  SensorMapItem,
} from '../../../types/flood.types';
import { type ActivityItemData, eventToActivity } from '../dashboard.types';
import { floodService } from '../../../services/flood.service';

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'retrying' | 'error';

export interface FloodWebSocketState {
  activeFloods:     Record<string, ActiveFloodEvent>;
  sensors:          Record<string, ProcessedSensorData>;
  sensorMarkers:    SensorMapItem[];
  recentActivities: ActivityItemData[];
  wsStatus:         WsStatus;
  wsError:          string | null;
  /** Số lần đã thử kết nối lại thất bại */
  wsRetryCount:     number;
  /** Số giây còn lại trước lần thử tiếp theo (null nếu không đang chờ) */
  wsRetryIn:        number | null;
  loading:          boolean;
  apiError:         string | null;
  clearWsError:     () => void;
  /** Thử kết nối lại ngay lập tức (dùng khi đã đạt MAX_RETRIES) */
  reconnect:        () => void;
}

const WS_URL =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined) ??
  'http://localhost:8080/flood-alert/ws-admin';

const MAX_RECENT_EVENTS = 30;

// ---- Backoff config ----
const MAX_RETRIES     = 7;      // Sau 7 lần thất bại liên tiếp dừng tự động retry
const BASE_DELAY_MS   = 2_000;  // Delay đầu tiên: 2s
const MAX_DELAY_MS    = 60_000; // Delay tối đa: 60s

function getBackoffDelay(attempt: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
}


export function useFloodWebSocket(): FloodWebSocketState {
  const [activeFloods,     setActiveFloods]     = useState<Record<string, ActiveFloodEvent>>({});
  const [sensors,          setSensors]          = useState<Record<string, ProcessedSensorData>>({});
  const [sensorMarkers,    setSensorMarkers]    = useState<SensorMapItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItemData[]>([]);
  const [wsStatus,         setWsStatus]         = useState<WsStatus>('connecting');
  const [wsError,          setWsError]          = useState<string | null>(null);
  const [wsRetryCount,     setWsRetryCount]     = useState(0);
  const [wsRetryIn,        setWsRetryIn]        = useState<number | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [apiError,         setApiError]         = useState<string | null>(null);

  // Refs không gây re-render
  const retryCountRef    = useRef(0);
  const retryTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const stompClientRef   = useRef<Client | null>(null);
  const destroyedRef     = useRef(false);

  // ---- Dọn dẹp timer ----
  const clearTimers = useCallback(() => {
    if (retryTimerRef.current)  { clearTimeout(retryTimerRef.current);   retryTimerRef.current  = null; }
    if (countdownRef.current)   { clearInterval(countdownRef.current);   countdownRef.current   = null; }
    setWsRetryIn(null);
  }, []);

  // ---- Tạo và kích hoạt STOMP client ----
  const connect = useCallback(() => {
    if (destroyedRef.current) return;

    // Deactivate client cũ nếu còn
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    setWsStatus('connecting');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 0, // Tắt auto-reconnect, tự quản lý bên dưới

      onConnect: () => {
        if (destroyedRef.current) return;
        retryCountRef.current = 0;
        setWsRetryCount(0);
        setWsStatus('connected');
        setWsError(null);
        clearTimers();

        // Kênh telemetry
        client.subscribe('/topic/admin/map/telemetry', (msg) => {
          try {
            const data = JSON.parse(msg.body) as ProcessedSensorData;
            setSensors((prev) => ({ ...prev, [data.sensorId]: data }));
            setActiveFloods((prev) => {
              const entry = Object.entries(prev).find(
                ([, f]) => f.lat === data.lat && f.lon === data.lon,
              );
              if (!entry) return prev;
              const [eventId, flood] = entry;
              return {
                ...prev,
                [eventId]: {
                  ...flood,
                  waterLevel: data.waterLevel,
                  updatedAt:  data.recordedAt ?? new Date().toISOString(),
                },
              };
            });
          } catch {
            console.warn('[WS] Lỗi parse telemetry');
          }
        });

        // Kênh alerts
        client.subscribe('/topic/admin/alerts', (msg) => {
          try {
            const event = JSON.parse(msg.body) as FloodLifecycleEvent;
            if (event.type === 'RESOLVED') {
              setActiveFloods((prev) => {
                const next = { ...prev };
                delete next[event.eventId];
                return next;
              });
            } else {
              setActiveFloods((prev) => ({
                ...prev,
                [event.eventId]: {
                  eventId:       event.eventId,
                  lat:           event.lat,
                  lon:           event.lon,
                  location:      event.location,
                  waterLevel:    event.waterLevel,
                  severityLevel: event.severityLevel,
                  status:        'CONFIRMED',
                  updatedAt:     new Date().toISOString(),
                },
              }));
            }
            setRecentActivities((prev) =>
              [eventToActivity(event), ...prev].slice(0, MAX_RECENT_EVENTS),
            );
          } catch {
            console.warn('[WS] Lỗi parse flood alert');
          }
        });
      },

      onDisconnect: () => {
        if (destroyedRef.current) return;
        scheduleRetry('Mất kết nối WebSocket.');
      },

      onStompError: (frame) => {
        if (destroyedRef.current) return;
        const msg = frame.headers?.message ?? 'Lỗi không xác định từ server';
        scheduleRetry(`Kết nối WebSocket thất bại: ${msg}`);
      },

      onWebSocketError: (evt) => {
        if (destroyedRef.current) return;
        const detail = (evt as ErrorEvent).message;
        scheduleRetry(
          detail
            ? `Không thể kết nối WebSocket: ${detail}`
            : 'Không thể kết nối WebSocket. Kiểm tra lại máy chủ hoặc mạng.',
        );
      },
    });

    stompClientRef.current = client;
    client.activate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers]);

  // ---- Lên lịch retry với exponential backoff ----
  // Dùng ref wrapper để tránh dependency cycle
  const scheduleRetryRef = useRef<(errorMsg: string) => void>(() => {});

  scheduleRetryRef.current = (errorMsg: string) => {
    clearTimers();

    const attempt = retryCountRef.current;

    if (attempt >= MAX_RETRIES) {
      // Đã thử quá nhiều lần → dừng, chờ người dùng bấm retry
      setWsStatus('error');
      setWsError(`${errorMsg} Đã thử ${MAX_RETRIES} lần thất bại. Vui lòng thử lại thủ công.`);
      setWsRetryCount(attempt);
      return;
    }

    const delayMs      = getBackoffDelay(attempt);
    const delaySec     = Math.ceil(delayMs / 1000);
    const nextAttempt  = attempt + 1;

    retryCountRef.current = nextAttempt;
    setWsRetryCount(nextAttempt);
    setWsStatus('retrying');
    setWsError(`${errorMsg} Thử lại lần ${nextAttempt}/${MAX_RETRIES} sau ${delaySec}s…`);
    setWsRetryIn(delaySec);

    // Countdown hiển thị
    let remaining = delaySec;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setWsRetryIn(remaining > 0 ? remaining : null);
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
      }
    }, 1000);

    // Thực sự reconnect sau delayMs
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      connect();
    }, delayMs);
  };

  const scheduleRetry = useCallback((errorMsg: string) => {
    scheduleRetryRef.current(errorMsg);
  }, []);

  // ---- Retry thủ công (reset counter) ----
  const reconnect = useCallback(() => {
    clearTimers();
    retryCountRef.current = 0;
    setWsRetryCount(0);
    connect();
  }, [clearTimers, connect]);

  // ---- Mount: load dữ liệu ban đầu ----
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      floodService.getActiveFloods(),
      floodService.getSensorsMap(),
    ])
      .then(([floods, mapSensors]) => {
        if (cancelled) return;
        const dict: Record<string, ActiveFloodEvent> = {};
        for (const item of floods) dict[item.eventId] = item;
        setActiveFloods(dict);
        setSensorMarkers(mapSensors);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setApiError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu ban đầu');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ---- Mount: kết nối WebSocket lần đầu ----
  useEffect(() => {
    destroyedRef.current = false;
    connect();

    return () => {
      destroyedRef.current = true;
      clearTimers();
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    activeFloods,
    sensors,
    sensorMarkers,
    recentActivities,
    wsStatus,
    wsError,
    wsRetryCount,
    wsRetryIn,
    loading,
    apiError,
    clearWsError: () => setWsError(null),
    reconnect,
  };
}
