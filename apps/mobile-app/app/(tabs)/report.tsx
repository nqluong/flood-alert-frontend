import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';

import { AppHeader } from '../../components/AppHeader';
import { CameraCapture } from '../../components/report/CameraCapture';
import { LocationCard } from '../../components/report/LocationCard';
import {
  FloodLevelGroup,
  FloodLevel,
} from '../../components/report/FloodLevelOption';
import { SubmitSection } from '../../components/report/SubmitSection';

// TODO: replace with GPS hook value
const MOCK_ADDRESS =
  'Đường Nguyễn Huệ, Phường Bến Nghé,\nQuận 1, TP. Hồ Chí Minh';

export default function ReportScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<FloodLevel | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCameraPress = () => {
    // TODO: open expo-image-picker or expo-camera
    Alert.alert('Camera', 'Tích hợp expo-camera hoặc expo-image-picker tại đây');
  };

  const handleSubmit = () => {
    if (!selectedLevel) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn mức độ ngập trước khi gửi.');
      return;
    }
    setLoading(true);
    // TODO: call report API
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi. Cảm ơn!');
      setSelectedLevel(null);
      setImageUri(null);
    }, 1500);
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
        <LocationCard address={MOCK_ADDRESS} accuracy="±8m" />

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
