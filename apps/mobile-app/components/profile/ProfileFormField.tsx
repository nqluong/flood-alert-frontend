import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileFormFieldProps {
  label: string;
  icon: string;
  value: string;
  isEditing: boolean;
  placeholder?: string;
  editable?: boolean;
  inputProps?: Partial<TextInputProps>;
  onChangeText?: (text: string) => void;
}

export function ProfileFormField({
  label,
  icon,
  value,
  isEditing,
  placeholder,
  editable = true,
  inputProps,
  onChangeText,
}: ProfileFormFieldProps) {
  const isDisabled = !isEditing || !editable;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, isDisabled && styles.inputDisabled]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={isDisabled ? '#9e9e9e' : '#009688'}
        />
        {isEditing && editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            {...inputProps}
          />
        ) : (
          <Text style={styles.inputDisabledText}>{value || 'Chưa cập nhật'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
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
  inputDisabled: {
    backgroundColor: '#f5f5f6',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  inputDisabledText: {
    flex: 1,
    fontSize: 15,
    color: '#6b7280',
  },
});
