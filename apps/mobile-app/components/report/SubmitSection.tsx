import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubmitSectionProps {
  onSubmit?: () => void;
  loading?: boolean;
  hint?: string;
}

export function SubmitSection({
  onSubmit,
  loading = false,
  hint = 'Báo cáo của bạn giúp cộng đồng di chuyển an toàn hơn',
}: SubmitSectionProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Ionicons name="send" size={16} color="#ffffff" style={styles.sendIcon} />
            <Text style={styles.buttonLabel}>Gửi báo cáo</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    backgroundColor: '#009688',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sendIcon: {
    marginRight: 2,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});
