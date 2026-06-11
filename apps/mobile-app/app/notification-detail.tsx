import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { addressService } from '../services/address.service';
import { notificationService } from '../services/notification.service';
import { NotificationDetailMap } from '../components/notification-detail/NotificationDetailMap';
import { NotificationDetailInfo } from '../components/notification-detail/NotificationDetailInfo';
import type { UserAddressResponse } from '../types/address.types';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

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

  const hasCoordinates = Number.isFinite(notification.lat) && Number.isFinite(notification.lon);

  const [homeAddress, setHomeAddress] = useState<UserAddressResponse | null>(null);
  const [alertRadiusMeters, setAlertRadiusMeters] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      addressService.getPrimaryAddress().catch(() => null),
      notificationService.getPreferences().catch(() => null),
    ]).then(([address, prefs]) => {
      setHomeAddress(address);
      if (prefs?.alertRadiusMeters) setAlertRadiusMeters(prefs.alertRadiusMeters);
    });
  }, []);

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
        {hasCoordinates && (
          <NotificationDetailMap
            floodLat={notification.lat}
            floodLon={notification.lon}
            severityLevel={notification.severityLevel}
            homeAddress={homeAddress}
            alertRadiusMeters={alertRadiusMeters}
          />
        )}

        <NotificationDetailInfo
          title={notification.title}
          body={notification.body}
          eventId={notification.eventId}
          waterLevel={notification.waterLevel}
          affectedZones={notification.affectedZones}
          staticDistance={notification.staticDistance}
          timestamp={notification.timestamp}
          lat={hasCoordinates ? notification.lat : undefined}
          lon={hasCoordinates ? notification.lon : undefined}
          alertRadiusMeters={alertRadiusMeters}
          onViewOnMap={() =>
            router.push({
              pathname: '/(tabs)/home',
              params: { focusLat: notification.lat, focusLon: notification.lon },
            })
          }
        />
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
});
