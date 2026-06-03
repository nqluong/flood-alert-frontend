import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatMeters } from './helpers';
import { styles } from './NotificationDetailInfo.styles';

interface DetailRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  subValue?: string;
}

function DetailRow({ icon, label, value, subValue }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={20} color="#009688" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
        {subValue && <Text style={styles.detailSubValue}>{subValue}</Text>}
      </View>
    </View>
  );
}

interface NotificationDetailInfoProps {
  title: string;
  body: string;
  eventId?: string;
  waterLevel?: number;
  affectedZones?: string;
  staticDistance?: number;
  timestamp?: string;
  lat: number;
  lon: number;
  alertRadiusMeters: number | null;
  onViewOnMap: () => void;
}

export function NotificationDetailInfo({
  title,
  body,
  eventId,
  waterLevel,
  affectedZones,
  staticDistance,
  timestamp,
  lat,
  lon,
  alertRadiusMeters,
  onViewOnMap,
}: NotificationDetailInfoProps) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Body */}
      <View style={styles.card}>
        <Text style={styles.body}>{body}</Text>
      </View>

      {/* Details */}
      <View style={styles.detailsCard}>
        {eventId && (
          <DetailRow
            icon="document-text-outline"
            label="Mã sự kiện"
            value={eventId}
          />
        )}

        {waterLevel !== undefined && (
          <DetailRow
            icon="water-outline"
            label="Mực nước"
            value={`${waterLevel.toFixed(2)} cm`}
          />
        )}

        {affectedZones && (
          <DetailRow
            icon="location-outline"
            label="Khu vực ảnh hưởng"
            value={affectedZones}
          />
        )}

        {staticDistance !== undefined && (
          <DetailRow
            icon="navigate-outline"
            label="Khoảng cách (đường thẳng)"
            value={formatMeters(staticDistance)}
            subValue={
              alertRadiusMeters
                ? `Trong bán kính cảnh báo ${formatMeters(alertRadiusMeters)} của bạn`
                : undefined
            }
          />
        )}

        {timestamp && (
          <DetailRow
            icon="time-outline"
            label="Thời gian"
            value={formatDate(timestamp)}
          />
        )}

        <DetailRow
          icon="pin-outline"
          label="Tọa độ"
          value={`${lat.toFixed(6)}, ${lon.toFixed(6)}`}
        />
      </View>

      {/* Action */}
      <TouchableOpacity style={styles.actionButton} onPress={onViewOnMap}>
        <Ionicons name="map" size={20} color="#ffffff" />
        <Text style={styles.actionButtonText}>Xem trên bản đồ chính</Text>
      </TouchableOpacity>
    </View>
  );
}
