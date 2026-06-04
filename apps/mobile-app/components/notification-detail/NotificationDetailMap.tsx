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
import {
  createRadiusCircle,
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
  homeAddress: UserAddressResponse | null;
  alertRadiusMeters: number | null;
}

export function NotificationDetailMap({
  floodLat,
  floodLon,
  severityLevel,
  homeAddress,
  alertRadiusMeters,
}: NotificationDetailMapProps) {
  const severityColor = getSeverityColor(severityLevel);

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

  const homeMarkerGeoJSON: GeoJSON.FeatureCollection | null = homeAddress
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'home-location',
            geometry: {
              type: 'Point',
              coordinates: [homeAddress.lon, homeAddress.lat],
            },
            properties: {},
          },
        ],
      }
    : null;

  const radiusCircleGeoJSON: GeoJSON.FeatureCollection | null =
    homeAddress && alertRadiusMeters
      ? {
          type: 'FeatureCollection',
          features: [
            createRadiusCircle(homeAddress.lon, homeAddress.lat, alertRadiusMeters),
          ],
        }
      : null;

  // Always use bounds (never defaultSettings) so Camera updates reactively
  // when homeAddress/alertRadiusMeters load after initial render.
  const FLOOD_PAD = 0.005; // ~500 m at equator
  const cameraBounds = homeAddress
    ? getBounds(
        homeAddress.lat,
        homeAddress.lon,
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

        {/* User home marker */}
        {homeMarkerGeoJSON && (
          <ShapeSource id="home-marker-source" shape={homeMarkerGeoJSON}>
            <CircleLayer
              id="home-halo"
              style={{ circleRadius: 18, circleColor: '#009688', circleOpacity: 0.2 }}
            />
            <CircleLayer
              id="home-dot"
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
      {homeAddress && (
        <View style={styles.mapLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#009688' }]} />
            <Text style={styles.legendText}>Vị trí của bạn</Text>
          </View>
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
