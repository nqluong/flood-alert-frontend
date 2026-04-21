import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AddressCard } from './AddressCard';
import type { UserAddressResponse } from '../../types/address.types';

interface AddressListProps {
  addresses: UserAddressResponse[];
  onEdit: (address: UserAddressResponse) => void;
  onDelete: (address: UserAddressResponse) => void;
  onSetPrimary: (address: UserAddressResponse) => void;
}

export function AddressList({ addresses, onEdit, onDelete, onSetPrimary }: AddressListProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{addresses.length} địa chỉ</Text>
      </View>

      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={() => onEdit(address)}
          onDelete={() => onDelete(address)}
          onSetPrimary={() => onSetPrimary(address)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
