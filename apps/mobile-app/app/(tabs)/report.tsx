import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

import { AppHeader } from '../../components/AppHeader';
import { CameraCapture } from '../../components/report/CameraCapture';
import { LocationCard } from '../../components/report/LocationCard';
import {
  FloodLevelGroup,
  FloodLevel,
} from '../../components/report/FloodLevelOption';
import { SubmitSection } from '../../components/report/SubmitSection';
import { showMediaPickerSheet } from '../../hooks/useMediaPicker';
import { useUserLocation } from '../../hooks/useUserLocation';
import { uploadReportImage } from '../../services/firebase';
import { floodService } from '../../services/flood.service';

export default function ReportScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<FloodLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>('Đang xác định vị trí...');

  const { coordinate } = useUserLocation();

  // Reverse geocode whenever GPS coordinate changes
  useEffect(() => {
    if (!coordinate) return;
    const [lon, lat] = coordinate;
    Location.reverseGeocodeAsync({ latitude: lat, longitude: lon })
      .then((results) => {
        if (results.length > 0) {
          const r = results[0];
          const parts = [r.street, r.district, r.city].filter(Boolean);
          setAddress(parts.join(', '));
        }
      })
      .catch(() => {
        // Giữ nguyên địa chỉ hiện tại nếu geocode thất bại
      });
  }, [coordinate]);

  const handleCameraPress = () => {
    showMediaPickerSheet((media) => {
      if (media) setImageUri(media.uri);
    });
  };

  const handleSubmit = async () => {
    if (!selectedLevel) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn mức độ ngập trước khi gửi.');
      return;
    }
    if (!coordinate) {
      Alert.alert('Chưa có vị trí', 'Vui lòng chờ ứng dụng xác định vị trí GPS.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (imageUri) {
        imageUrl = await uploadReportImage(imageUri);
      }

      const [lon, lat] = coordinate;
      await floodService.submitReport({ lat, lon, severityLevel: selectedLevel, imageUrl });

      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi. Cảm ơn!');
      setSelectedLevel(null);
      setImageUri(null);
    } catch (err) {
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể gửi báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Báo cáo điểm ngập" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Camera section – extra bottom padding for shutter button overflow */}
        <View style={styles.cameraSection}>
          <CameraCapture imageUri={imageUri} onCapturePress={handleCameraPress} />
        </View>

        {/* Location */}
        <LocationCard address={address} accuracy="±8m" />

        {/* Flood level selector */}
        <FloodLevelGroup selected={selectedLevel} onSelect={setSelectedLevel} />

        {/* Submit */}
        <SubmitSection onSubmit={handleSubmit} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  cameraSection: {
    // Extra bottom space so the shutter button (overflows by 32px) isn't clipped
    paddingBottom: 40,
  },
});
