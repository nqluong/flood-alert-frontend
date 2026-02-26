import { useEffect, useState } from 'react';
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

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface FloodWebSocketState {
  activeFloods:     Record<string, ActiveFloodEvent>;
  sensors:          Record<string, ProcessedSensorData>;
  sensorMarkers:    SensorMapItem[];
  recentActivities: ActivityItemData[];
  wsStatus:         WsStatus;
  wsError:          string | null;
  loading:          boolean;
  apiError:         string | null;
  clearWsError:     () => void;
}

const WS_URL =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined) ??
  'http://localhost:8080/flood-alert/ws-admin';

const MAX_RECENT_EVENTS = 30;


export function useFloodWebSocket(): FloodWebSocketState {
  const [activeFloods,     setActiveFloods]     = useState<Record<string, ActiveFloodEvent>>({});
  const [sensors,          setSensors]          = useState<Record<string, ProcessedSensorData>>({});
  const [sensorMarkers,    setSensorMarkers]    = useState<SensorMapItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItemData[]>([]);
  const [wsStatus,         setWsStatus]         = useState<WsStatus>('connecting');
  const [wsError,          setWsError]          = useState<string | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [apiError,         setApiError]         = useState<string | null>(null);

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

  // Kết nối WebSocket STOMP qua SockJS 
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,

      onConnect: () => {
        setWsStatus('connected');
        setWsError(null);

        //  Kênh telemetry
        stompClient.subscribe('/topic/admin/map/telemetry', (msg) => {
          try {
            const data = JSON.parse(msg.body) as ProcessedSensorData;

            // Luôn cập nhật sensors (dùng cho sensor marker thường)
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

        //  Kênh alerts 
        stompClient.subscribe('/topic/admin/alerts', (msg) => {
          try {
            const event = JSON.parse(msg.body) as FloodLifecycleEvent;

            // Cập nhật activeFloods
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

            // Ghi vào feed hoạt động gần đây (convert 1 lần tại đây, ID ổn định)
            setRecentActivities((prev) => [eventToActivity(event), ...prev].slice(0, MAX_RECENT_EVENTS));
          } catch {
            console.warn('[WS] Lỗi parse flood alert');
          }
        });
      },

      onDisconnect: () => {
        setWsStatus('disconnected');
        setWsError('Mất kết nối WebSocket. Đang thử kết nối lại…');
      },

      onStompError: (frame) => {
        setWsStatus('error');
        const msg = frame.headers?.message ?? 'Lỗi không xác định từ server';
        setWsError(`Kết nối WebSocket thất bại: ${msg}`);
      },

      onWebSocketError: (evt) => {
        setWsStatus('error');
        const detail = (evt as ErrorEvent).message;
        setWsError(
          detail
            ? `Không thể kết nối WebSocket: ${detail}`
            : 'Không thể kết nối WebSocket. Kiểm tra lại máy chủ hoặc mạng.',
        );
      },
    });

    stompClient.activate();
    return () => { stompClient.deactivate(); };
  }, []);

  return {
    activeFloods,
    sensors,
    sensorMarkers,
    recentActivities,
    wsStatus,
    wsError,
    loading,
    apiError,
    clearWsError: () => setWsError(null),
  };
}
