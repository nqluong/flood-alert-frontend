/**
 * Notification Detail Screen
 * Hiển thị chi tiết thông báo với bản đồ vị trí ngập lụt
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MapView, Camera, ShapeSource, CircleLayer } from '@maplibre/maplibre-react-native';

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`;
const { width } = Dimensions.get('window');

export default function NotificationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Parse notification data từ params
  const notification = {
    id: params.id as string,
    title: params.title as string,
    body: params.body as string,
    eventId: params.eventId as string,
    lat: parseFloat(params.lat as string),
    lon: parseFloat(params.lon as string),
    severityLevel: params.severityLevel as string,
    waterLevel: params.waterLevel ? parseFloat(params.waterLevel as string) : undefined,
    affectedZones: params.affectedZones as string,
    location: params.location as string,
    staticDistance: params.staticDistance ? parseFloat(params.staticDistance as string) : undefined,
    timestamp: params.timestamp as string,
    notificationType: params.notificationType as string,
  };

  // GeoJSON cho marker vị trí ngập
  const floodMarkerGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'flood-location',
        geometry: {
          type: 'Point',
          coordinates: [notification.lon, notification.lat],
        },
        properties: {
          severityLevel: notification.severityLevel,
          waterLevel: notification.waterLevel,
        },
      },
    ],
  };

  // Màu sắc theo mức độ
  const getSeverityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'nguy hiểm':
        return '#e53935';
      case 'cảnh báo':
        return '#fb8c00';
      case 'theo dõi':
        return '#fdd835';
      default:
        return '#43a047';
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'nguy hiểm':
        return 'alert-circle';
      case 'cảnh báo':
        return 'warning';
      case 'theo dõi':
        return 'information-circle';
      default:
        return 'checkmark-circle';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cảnh báo</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            mapStyle={MAP_STYLE}
            logoEnabled={false}
            attributionEnabled={false}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Camera
              defaultSettings={{
                centerCoordinate: [notification.lon, notification.lat],
                zoomLevel: 15,
              }}
            />

            {/* Flood Marker */}
            <ShapeSource id="flood-marker-source" shape={floodMarkerGeoJSON}>
              {/* Outer pulse circle */}
              <CircleLayer
                id="flood-marker-pulse"
                style={{
                  circleRadius: 30,
                  circleColor: getSeverityColor(notification.severityLevel),
                  circleOpacity: 0.2,
                }}
              />
              {/* Inner circle */}
              <CircleLayer
                id="flood-marker-inner"
                style={{
                  circleRadius: 15,
                  circleColor: getSeverityColor(notification.severityLevel),
                  circleStrokeWidth: 3,
                  circleStrokeColor: '#FFFFFF',
                }}
              />
            </ShapeSource>
          </MapView>

          {/* Severity Badge on Map */}
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(notification.severityLevel) },
            ]}
          >
            <Ionicons
              name={getSeverityIcon(notification.severityLevel) as any}
              size={16}
              color="#ffffff"
            />
            <Text style={styles.severityBadgeText}>{notification.severityLevel}</Text>
          </View>
        </View>

        {/* Notification Info */}
        <View style={styles.infoContainer}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.title}>{notification.title}</Text>
          </View>

          {/* Body */}
          <View style={styles.section}>
            <Text style={styles.body}>{notification.body}</Text>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            {/* Event ID */}
            {notification.eventId && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#009688" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Mã sự kiện</Text>
                  <Text style={styles.detailValue}>{notification.eventId}</Text>
                </View>
              </View>
            )}

            {/* Water Level */}
            {notification.waterLevel !== undefined && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="water-outline" size={20} color="#009688" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Mực nước</Text>
                  <Text style={styles.detailValue}>{notification.waterLevel.toFixed(2)} cm</Text>
                </View>
              </View>
            )}

            {/* Affected Zones */}
            {notification.affectedZones && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={20} color="#009688" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Khu vực ảnh hưởng</Text>
                  <Text style={styles.detailValue}>{notification.affectedZones}</Text>
                </View>
              </View>
            )}

            {/* Distance */}
            {notification.staticDistance !== undefined && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="navigate-outline" size={20} color="#009688" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Khoảng cách</Text>
                  <Text style={styles.detailValue}>
                    {notification.staticDistance >= 1000
                      ? `${(notification.staticDistance / 1000).toFixed(1)} km`
                      : `${notification.staticDistance.toFixed(0)} m`}
                  </Text>
                </View>
              </View>
            )}

            {/* Timestamp */}
            {notification.timestamp && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time-outline" size={20} color="#009688" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Thời gian</Text>
                  <Text style={styles.detailValue}>{formatDate(notification.timestamp)}</Text>
                </View>
              </View>
            )}

            {/* Coordinates */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="pin-outline" size={20} color="#009688" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tọa độ</Text>
                <Text style={styles.detailValue}>
                  {notification.lat.toFixed(6)}, {notification.lon.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/home',
                params: {
                  focusLat: notification.lat,
                  focusLon: notification.lon,
                },
              });
            }}
          >
            <Ionicons name="map" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Xem trên bản đồ chính</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#009688',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  severityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  severityBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f7f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#009688',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
