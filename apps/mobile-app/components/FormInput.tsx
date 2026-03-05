import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  leftIcon: React.ReactNode;
  /** Show password eye toggle (use together with secureTextEntry) */
  passwordToggle?: boolean;
}

export function FormInput({
  leftIcon,
  passwordToggle = false,
  secureTextEntry,
  style,
  ...rest
}: FormInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.container}>
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
});
