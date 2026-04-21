import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationPicker } from './LocationPicker';
import type { UserAddressRequest, AddressType } from '../../types/address.types';
import { ADDRESS_TYPE_LABELS } from '../../types/address.types';

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: UserAddressRequest) => Promise<void>;
  initialData?: UserAddressRequest & { id?: string };
  mode?: 'create' | 'edit';
}

export function AddAddressModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: AddAddressModalProps) {
  const [step, setStep] = useState<'form' | 'map'>('form');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UserAddressRequest>({
    addressText: initialData?.addressText || '',
    lat: initialData?.lat || null!,
    lon: initialData?.lon || null!,
    isPrimary: initialData?.isPrimary || false,
    addressType: initialData?.addressType || 'HOME',
  });

  const handleLocationChange = (lat: number, lon: number) => {
    setFormData((prev) => ({ ...prev, lat, lon }));
  };

  const handleSubmit = async () => {
    if (!formData.addressText.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return;
    }

    if (formData.lat === null || formData.lon === null) {
      alert('Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      addressText: '',
      lat: null!,
      lon: null!,
      isPrimary: false,
      addressType: 'HOME',
    });
    onClose();
  };

  const renderAddressTypeButton = (type: AddressType, icon: string) => {
    const isSelected = formData.addressType === type;
    return (
      <TouchableOpacity
        key={type}
        style={[styles.typeButton, isSelected && styles.typeButtonActive]}
        onPress={() => setFormData((prev) => ({ ...prev, addressType: type }))}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={isSelected ? '#009688' : '#6b7280'}
        />
        <Text style={[styles.typeButtonText, isSelected && styles.typeButtonTextActive]}>
          {ADDRESS_TYPE_LABELS[type]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={step === 'map' ? () => setStep('form') : handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'edit' ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </Text>
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        {step === 'form' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Address Type */}
            <View style={styles.section}>
              <Text style={styles.label}>Loại địa chỉ</Text>
              <View style={styles.typeButtons}>
                {renderAddressTypeButton('HOME', 'home')}
                {renderAddressTypeButton('WORK', 'briefcase')}
                {renderAddressTypeButton('OTHER', 'location')}
              </View>
            </View>

            {/* Address Text */}
            <View style={styles.section}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={styles.input}
                value={formData.addressText}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, addressText: text }))
                }
                placeholder="Nhập địa chỉ chi tiết"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.label}>Vị trí trên bản đồ</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setStep('map')}
                activeOpacity={0.7}
              >
                <Ionicons name="map" size={20} color="#009688" />
                <View style={styles.locationButtonContent}>
                  {formData.lat !== null && formData.lon !== null ? (
                    <>
                      <Text style={styles.locationButtonLabel}>Đã chọn vị trí</Text>
                      <Text style={styles.locationButtonCoords}>
                        {formData.lat.toFixed(6)}, {formData.lon.toFixed(6)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.locationButtonLabel}>Chọn vị trí trên bản đồ</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9e9e9e" />
              </TouchableOpacity>
            </View>

            {/* Primary Address */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, isPrimary: !prev.isPrimary }))
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.isPrimary && styles.checkboxActive,
                  ]}
                >
                  {formData.isPrimary && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <View style={styles.checkboxContent}>
                  <Text style={styles.checkboxLabel}>Đặt làm địa chỉ chính</Text>
                  <Text style={styles.checkboxDescription}>
                    Địa chỉ này sẽ được sử dụng làm mặc định
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <LocationPicker
            lat={formData.lat}
            lon={formData.lon}
            onChange={handleLocationChange}
          />
        )}

        {/* Footer */}
        {step === 'form' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'edit' ? 'Cập nhật' : 'Thêm'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'map' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { flex: 1 }]}
              onPress={() => setStep('form')}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Xác nhận vị trí</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0,150,136,0.1)',
    borderColor: '#009688',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#009688',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 80,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationButtonContent: {
    flex: 1,
  },
  locationButtonLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  locationButtonCoords: {
    fontSize: 13,
    color: '#009688',
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#009688',
    borderColor: '#009688',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  checkboxDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#009688',
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
