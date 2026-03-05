import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  leftIcon: React.ReactNode;
  passwordToggle?: boolean;
  error?: string;
}

export function FormInput({
  leftIcon,
  passwordToggle = false,
  secureTextEntry,
  error,
  style,
  ...rest
}: FormInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View>
      <View style={[styles.container, !!error && styles.containerError]}>
        <View style={styles.leftIcon}>{leftIcon}</View>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#9ca3af"
          secureTextEntry={passwordToggle ? hidden : secureTextEntry}
          autoCapitalize="none"
          {...rest}
        />
        {passwordToggle && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setHidden((v) => !v)}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    height: 60,
  },
  containerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    letterSpacing: -0.3,
  },
  eyeButton: {
    marginLeft: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
});
