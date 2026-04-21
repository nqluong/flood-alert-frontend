import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppHeader } from '../components/AppHeader';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { ProfileFormField } from '../components/profile/ProfileFormField';
import { AddressNavigationCard } from '../components/profile/AddressNavigationCard';
import { ProfileInfoSection } from '../components/profile/ProfileInfoSection';
import { ProfileActionButtons } from '../components/profile/ProfileActionButtons';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAlert } from '../hooks/useAlert';
import type { UserProfileUpdateRequest } from '../types/user.types';

export default function ProfileScreen() {
  const { profile, loading, updateProfile } = useUserProfile();
  const { showError, showConfirm } = useAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UserProfileUpdateRequest>({
    fullName: '',
    phone: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.fullName?.trim()) {
      showError('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    showConfirm(
      'Xác nhận',
      'Bạn có chắc muốn cập nhật thông tin cá nhân?',
      async () => {
        try {
          setIsSaving(true);
          await updateProfile(formData);
          setIsEditing(false);
        } catch (err) {
          showError('Lỗi', err instanceof Error ? err.message : 'Không thể cập nhật thông tin');
        } finally {
          setIsSaving(false);
        }
      },
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Thông tin cá nhân" onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009688" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <AppHeader title="Thông tin cá nhân" onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef5350" />
          <Text style={styles.errorText}>Không thể tải thông tin cá nhân</Text>
        </View>
      </View>
    );
  }

  const infoItems = [
    {
      icon: 'calendar-outline',
      label: 'Ngày tạo:',
      value: formatDate(profile.createdAt),
    },
    {
      icon: 'time-outline',
      label: 'Cập nhật:',
      value: formatDate(profile.updatedAt),
    },
    ...(profile.lastLoginAt
      ? [
          {
            icon: 'log-in-outline',
            label: 'Đăng nhập:',
            value: formatDate(profile.lastLoginAt),
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Thông tin cá nhân" onBackPress={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileAvatar avatarUrl={profile.avatarUrl} status={profile.status} />

        <View style={styles.formSection}>
          <ProfileFormField
            label="Email"
            icon="mail-outline"
            value={profile.email}
            isEditing={false}
            editable={false}
          />

          <ProfileFormField
            label="Họ và tên"
            icon="person-outline"
            value={formData.fullName}
            isEditing={isEditing}
            placeholder="Nhập họ tên"
            inputProps={{ editable: !isSaving }}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />

          <ProfileFormField
            label="Số điện thoại"
            icon="call-outline"
            value={formData.phone}
            isEditing={isEditing}
            placeholder="Nhập số điện thoại"
            inputProps={{ keyboardType: 'phone-pad', editable: !isSaving }}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
        </View>

        <AddressNavigationCard onPress={() => router.push('/addresses')} />

        <ProfileInfoSection items={infoItems} />

        <ProfileActionButtons
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
});
