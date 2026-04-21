import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserAddressResponse } from '../../types/address.types';
import { ADDRESS_TYPE_LABELS } from '../../types/address.types';

interface AddressCardProps {
  address: UserAddressResponse;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetPrimary }: AddressCardProps) {
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'HOME':
        return 'home';
      case 'WORK':
        return 'briefcase';
      default:
        return 'location';
    }
  };

  const getAddressTypeLabel = (type: string) => {
    return ADDRESS_TYPE_LABELS[type as keyof typeof ADDRESS_TYPE_LABELS] || type;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getAddressTypeIcon(address.addressType) as any}
              size={16}
              color="#009688"
            />
          </View>
          <Text style={styles.typeLabel}>{getAddressTypeLabel(address.addressType)}</Text>
        </View>
        {address.isPrimary && (
          <View style={styles.primaryBadge}>
            <Ionicons name="star" size={12} color="#ffa726" />
            <Text style={styles.primaryText}>Chính</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressText}>{address.addressText}</Text>

      <View style={styles.coordsContainer}>
        <Ionicons name="navigate" size={12} color="#9e9e9e" />
        <Text style={styles.coordsText}>
          {address.lat.toFixed(6)}, {address.lon.toFixed(6)}
        </Text>
      </View>

      <View style={styles.actions}>
        {!address.isPrimary && (
          <TouchableOpacity style={styles.actionButton} onPress={onSetPrimary} activeOpacity={0.7}>
            <Ionicons name="star-outline" size={18} color="#ffa726" />
            <Text style={[styles.actionText, { color: '#ffa726' }]}>Đặt làm chính</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={onEdit} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={18} color="#009688" />
          <Text style={[styles.actionText, { color: '#009688' }]}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color="#ef5350" />
          <Text style={[styles.actionText, { color: '#ef5350' }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,150,136,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,167,38,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffa726',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  coordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  coordsText: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
