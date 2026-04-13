import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppHeader } from '../../components/AppHeader';
import { SettingsSectionHeader } from '../../components/settings/SettingsSectionHeader';
import { SettingsToggleRow } from '../../components/settings/SettingsToggleRow';
import { SettingsNavRow } from '../../components/settings/SettingsNavRow';
import { SettingsSliderRow } from '../../components/settings/SettingsSliderRow';
import { SettingsInfoBox } from '../../components/settings/SettingsInfoBox';
import { authService } from '../../services/auth.service';
import { useAlert } from '../../hooks/useAlert';
import { LocationTrackingToggle } from '../../components/LocationTrackingToggle';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [severeOnly, setSevereOnly] = useState(false);
  const [radius, setRadius] = useState(5);
  const { showConfirm } = useAlert();

  const handleLogout = () => {
    showConfirm(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      async () => {
        await authService.logout();
        router.replace('/login');
      },
      { destructive: true, confirmLabel: 'Đăng xuất' },
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Cài đặt" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Thông báo ─────────────────────────── */}
        <SettingsSectionHeader title="Thông báo" />
        <View style={styles.card}>
          <SettingsToggleRow
            icon={<Ionicons name="notifications" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Nhận thông báo Push"
            description="Nhận cảnh báo ngập lụt ngay lập tức"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <SettingsToggleRow
            icon={<Ionicons name="warning" size={18} color="#e53935" />}
            iconBg="rgba(229,57,53,0.1)"
            label="Chỉ báo động ngập sâu"
            description="Chỉ nhận cảnh báo mức độ nguy hiểm"
            value={severeOnly}
            onValueChange={setSevereOnly}
            last
          />
        </View>

        {/* ── Vùng cảnh báo ─────────────────────── */}
        <SettingsSectionHeader title="Vùng cảnh báo" />
        <View style={styles.card}>
          <SettingsSliderRow
            icon={<Ionicons name="location-sharp" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Bán kính nhận cảnh báo"
            value={radius}
            min={1}
            max={10}
            step={1}
            unit="km"
            onValueChange={setRadius}
          />
        </View>
        <SettingsInfoBox message="Bạn sẽ nhận được cảnh báo về các điểm ngập lụt trong phạm vi này xung quanh vị trí của bạn." />

        {/* ── Theo dõi vị trí ─────────────────────── */}
        <SettingsSectionHeader title="Theo dõi vị trí" />
        <LocationTrackingToggle autoStart={true} />
        <SettingsInfoBox message="Bật để nhận cảnh báo ngập lụt theo vị trí của bạn ngay cả khi không mở ứng dụng." />

        {/* ── Tài khoản ─────────────────────────── */}
        <SettingsSectionHeader title="Tài khoản" />
        <View style={styles.card}>
          <SettingsNavRow
            icon={<Ionicons name="person" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Thông tin cá nhân"
            onPress={() => {}}
          />
          <SettingsNavRow
            icon={<Ionicons name="shield-checkmark" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Quyền riêng tư"
            onPress={() => {}}
            last
          />
        </View>

        <SettingsSectionHeader title="Về ứng dụng" />
        <View style={styles.card}>
          <SettingsNavRow
            icon={<Ionicons name="help-circle" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Trợ giúp & Hỗ trợ"
            onPress={() => {}}
          />
          <SettingsNavRow
            icon={<Ionicons name="document-text" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Điều khoản sử dụng"
            onPress={() => {}}
          />
          <SettingsNavRow
            icon={<Ionicons name="phone-portrait-outline" size={18} color="#009688" />}
            iconBg="rgba(0,150,136,0.1)"
            label="Phiên bản"
            value="1.0.5"
            last
          />
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
            <Text style={styles.logoutLabel}>Đăng xuất</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ef5350',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#ef5350',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
});
