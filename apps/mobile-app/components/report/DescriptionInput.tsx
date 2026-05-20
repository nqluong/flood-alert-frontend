import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MAX_LENGTH = 300;

interface DescriptionInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="create-outline" size={18} color="#009688" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.label}>Mô tả thêm</Text>
          <Text style={styles.optional}>Không bắt buộc</Text>
        </View>
        <Text style={styles.counter}>
          {value.length}/{MAX_LENGTH}
        </Text>
      </View>

      {/* Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Mô tả tình trạng ngập: phạm vi ảnh hưởng, nguyên nhân, lưu ý cho người đi đường..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,150,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: -0.5,
  },
  optional: {
    fontSize: 11,
    color: '#9ca3af',
    letterSpacing: -0.3,
  },
  counter: {
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: -0.3,
    alignSelf: 'flex-start',
  },
  input: {
    fontSize: 14,
    color: '#374151',
    letterSpacing: -0.3,
    lineHeight: 22,
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
});
