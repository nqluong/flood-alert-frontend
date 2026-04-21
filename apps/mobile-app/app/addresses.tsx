import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppHeader } from '../components/AppHeader';
import { AddressEmptyState } from '../components/address/AddressEmptyState';
import { AddressList } from '../components/address/AddressList';
import { AddAddressModal } from '../components/address/AddAddressModal';
import { useUserAddresses } from '../hooks/useUserAddresses';
import { useAlert } from '../hooks/useAlert';
import type { UserAddressRequest, UserAddressResponse } from '../types/address.types';

export default function AddressesScreen() {
  const { showConfirm, showError, showSuccess } = useAlert();
  const {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
  } = useUserAddresses();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddressResponse | null>(null);

  const handleAddAddress = async (data: UserAddressRequest) => {
    try {
      await createAddress(data);
      showSuccess('Thành công', 'Đã thêm địa chỉ mới');
    } catch (error) {
      showError('Lỗi', error instanceof Error ? error.message : 'Không thể thêm địa chỉ');
      throw error;
    }
  };

  const handleEditAddress = async (data: UserAddressRequest) => {
    if (!editingAddress) return;

    try {
      await updateAddress(editingAddress.id, data);
      showSuccess('Thành công', 'Đã cập nhật địa chỉ');
      setEditingAddress(null);
    } catch (error) {
      showError('Lỗi', error instanceof Error ? error.message : 'Không thể cập nhật địa chỉ');
      throw error;
    }
  };

  const handleDeleteAddress = (address: UserAddressResponse) => {
    showConfirm(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa địa chỉ "${address.addressText}"?`,
      async () => {
        try {
          await deleteAddress(address.id);
          showSuccess('Thành công', 'Đã xóa địa chỉ');
        } catch (error) {
          showError('Lỗi', error instanceof Error ? error.message : 'Không thể xóa địa chỉ');
        }
      },
      { destructive: true, confirmLabel: 'Xóa' },
    );
  };

  const handleSetPrimary = (address: UserAddressResponse) => {
    showConfirm(
      'Đặt làm địa chỉ chính',
      `Đặt "${address.addressText}" làm địa chỉ chính?`,
      async () => {
        try {
          await setPrimaryAddress(address.id);
          showSuccess('Thành công', 'Đã đặt địa chỉ chính');
        } catch (error) {
          showError(
            'Lỗi',
            error instanceof Error ? error.message : 'Không thể đặt địa chỉ chính',
          );
        }
      },
    );
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setModalVisible(true);
  };

  const openEditModal = (address: UserAddressResponse) => {
    setEditingAddress(address);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Địa chỉ của tôi" onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009688" />
          <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Địa chỉ của tôi"
        onBackPress={() => router.back()}
        rightSlot={
          <TouchableOpacity onPress={openAddModal} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color="#ffffff" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <AddressEmptyState onAddPress={openAddModal} />
        ) : (
          <AddressList
            addresses={addresses}
            onEdit={openEditModal}
            onDelete={handleDeleteAddress}
            onSetPrimary={handleSetPrimary}
          />
        )}
      </ScrollView>

      <AddAddressModal
        visible={modalVisible}
        onClose={closeModal}
        onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
        initialData={editingAddress || undefined}
        mode={editingAddress ? 'edit' : 'create'}
      />
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
    padding: 20,
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
});
