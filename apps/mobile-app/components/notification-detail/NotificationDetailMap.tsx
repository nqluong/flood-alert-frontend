import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  FillLayer,
  LineLayer,
} from '@maplibre/maplibre-react-native';
import type { UserAddressResponse } from '../../types/address.types';
import { ADDRESS_TYPE_LABELS, type AddressType } from '../../types/address.types';
import {
  createRadiusCircle,
  findNearestAddress,
  getBounds,
  getSeverityColor,
  getSeverityIcon,
  getSeverityLabel,
  formatMeters,
} from './helpers';
import { styles } from './NotificationDetailMap.styles';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

interface NotificationDetailMapProps {
  floodLat: number;
  floodLon: number;
  severityLevel: string;
  addresses: UserAddressResponse[];
  alertRadiusMeters: number | null;
}

export function NotificationDetailMap({
  floodLat,
  floodLon,
  severityLevel,
  addresses,
  alertRadiusMeters,
}: NotificationDetailMapProps) {
  const severityColor = getSeverityColor(severityLevel);

  const triggerAddress = findNearestAddress(addresses, floodLat, floodLon);

  const floodMarkerGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'flood-location',
        geometry: { type: 'Point', coordinates: [floodLon, floodLat] },
        properties: { severityLevel },
      },
    ],
  };

  // Marker cho địa chỉ kích hoạt cảnh báo (nổi bật).
  const triggerMarkerGeoJSON: GeoJSON.FeatureCollection | null = triggerAddress
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'trigger-location',
            geometry: {
              type: 'Point',
              coordinates: [triggerAddress.lon, triggerAddress.lat],
            },
            properties: {},
          },
        ],
      }
    : null;

  // Marker cho các địa chỉ còn lại của user (mờ hơn).
  const otherMarkersGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: addresses
      .filter((addr) => addr.id !== triggerAddress?.id)
      .map((addr) => ({
        type: 'Feature',
        id: `address-${addr.id}`,
        geometry: { type: 'Point', coordinates: [addr.lon, addr.lat] },
        properties: {},
      })),
  };

  const radiusCircleGeoJSON: GeoJSON.FeatureCollection | null =
    triggerAddress && alertRadiusMeters
      ? {
          type: 'FeatureCollection',
          features: [
            createRadiusCircle(
              triggerAddress.lon,
              triggerAddress.lat,
              alertRadiusMeters,
            ),
          ],
        }
      : null;

  // Always use bounds (never defaultSettings) so Camera updates reactively
  // when addresses/alertRadiusMeters load after initial render.
  const FLOOD_PAD = 0.005; // ~500 m at equator
  const cameraBounds = triggerAddress
    ? getBounds(
        triggerAddress.lat,
        triggerAddress.lon,
        floodLat,
        floodLon,
        alertRadiusMeters ?? 500,
      )
    : {
        ne: [floodLon + FLOOD_PAD, floodLat + FLOOD_PAD] as [number, number],
        sw: [floodLon - FLOOD_PAD, floodLat - FLOOD_PAD] as [number, number],
        paddingTop: 60,
        paddingBottom: 60,
        paddingLeft: 40,
        paddingRight: 40,
      };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Camera
          bounds={cameraBounds}
          animationMode="flyTo"
          animationDuration={800}
        />

        {/* Alert radius circle */}
        {radiusCircleGeoJSON && (
          <ShapeSource id="radius-circle-source" shape={radiusCircleGeoJSON}>
            <FillLayer
              id="radius-fill"
              style={{ fillColor: '#009688', fillOpacity: 0.08 }}
            />
            <LineLayer
              id="radius-border"
              style={{
                lineColor: '#009688',
                lineWidth: 2,
                lineDasharray: [4, 3],
                lineOpacity: 0.7,
              }}
            />
          </ShapeSource>
        )}

        {/* Other user addresses (dimmed) */}
        {otherMarkersGeoJSON.features.length > 0 && (
          <ShapeSource id="other-markers-source" shape={otherMarkersGeoJSON}>
            <CircleLayer
              id="other-dot"
              style={{
                circleRadius: 6,
                circleColor: '#90a4ae',
                circleStrokeWidth: 2,
                circleStrokeColor: '#ffffff',
                circleOpacity: 0.85,
              }}
            />
          </ShapeSource>
        )}

        {/* Triggering address marker (highlighted) */}
        {triggerMarkerGeoJSON && (
          <ShapeSource id="trigger-marker-source" shape={triggerMarkerGeoJSON}>
            <CircleLayer
              id="trigger-halo"
              style={{ circleRadius: 18, circleColor: '#009688', circleOpacity: 0.2 }}
            />
            <CircleLayer
              id="trigger-dot"
              style={{
                circleRadius: 8,
                circleColor: '#009688',
                circleStrokeWidth: 3,
                circleStrokeColor: '#ffffff',
              }}
            />
          </ShapeSource>
        )}

        {/* Flood marker */}
        <ShapeSource id="flood-marker-source" shape={floodMarkerGeoJSON}>
          <CircleLayer
            id="flood-marker-pulse"
            style={{ circleRadius: 30, circleColor: severityColor, circleOpacity: 0.2 }}
          />
          <CircleLayer
            id="flood-marker-inner"
            style={{
              circleRadius: 15,
              circleColor: severityColor,
              circleStrokeWidth: 3,
              circleStrokeColor: '#FFFFFF',
            }}
          />
        </ShapeSource>
      </MapView>

      {/* Severity badge */}
      <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
        <Ionicons name={getSeverityIcon(severityLevel)} size={16} color="#ffffff" />
        <Text style={styles.severityBadgeText}>{getSeverityLabel(severityLevel)}</Text>
      </View>

      {/* Map legend */}
      {triggerAddress && (
        <View style={styles.mapLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#009688' }]} />
            <Text style={styles.legendText}>
              {triggerAddress.addressType
                ? `Vị trí cảnh báo (${
                    ADDRESS_TYPE_LABELS[triggerAddress.addressType as AddressType] ??
                    'Khác'
                  })`
                : 'Vị trí cảnh báo'}
            </Text>
          </View>
          {otherMarkersGeoJSON.features.length > 0 && (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#90a4ae' }]} />
              <Text style={styles.legendText}>Vị trí khác của bạn</Text>
            </View>
          )}
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: severityColor }]} />
            <Text style={styles.legendText}>Điểm ngập</Text>
          </View>
          {alertRadiusMeters && (
            <View style={styles.legendRow}>
              <View style={styles.legendDash} />
              <Text style={styles.legendText}>
                Bán kính {formatMeters(alertRadiusMeters)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
