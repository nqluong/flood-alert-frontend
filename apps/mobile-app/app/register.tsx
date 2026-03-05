import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppLogo } from '../components/AppLogo';
import { FormInput } from '../components/FormInput';
import { authService } from '../services/auth.service';
import { useAlert } from '../hooks/useAlert';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+84|0)[0-9]{9,10}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const { showSuccess, showError } = useAlert();

  function clearError(field: keyof typeof errors) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate(): boolean {
    const next = { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' };
    let valid = true;

    if (!fullName.trim()) {
      next.fullName = 'Vui lòng nhập họ và tên.';
      valid = false;
    } else if (fullName.trim().length < 2) {
      next.fullName = 'Họ và tên phải ít nhất 2 ký tự.';
      valid = false;
    }

    if (!email.trim()) {
      next.email = 'Vui lòng nhập email.';
      valid = false;
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = 'Email không đúng định dạng.';
      valid = false;
    }

    if (phoneNumber.trim() && !PHONE_RE.test(phoneNumber.trim())) {
      next.phoneNumber = 'Số điện thoại không đúng định dạng (VD: 0912345678).';
      valid = false;
    }

    if (!password) {
      next.password = 'Vui lòng nhập mật khẩu.';
      valid = false;
    } else if (!PASSWORD_RE.test(password)) {
      next.password = 'Mật khẩu ≥ 8 ký tự, gồm chữ hoa, chữ thường và số.';
      valid = false;
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
      valid = false;
    } else if (password !== confirmPassword) {
      next.confirmPassword = 'Mật khẩu xác nhận không khớp.';
      valid = false;
    }

    setErrors(next);
    return valid;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      showSuccess('Đăng ký thành công', 'Tài khoản đã được tạo. Vui lòng đăng nhập.', () => {
        router.replace('/login');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      showError('Đăng ký thất bại', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrapper}>
            <AppLogo size="md" />
          </View>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Đăng ký để sử dụng FloodGuard
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Họ và tên */}
            <FormInput
              value={fullName}
              onChangeText={(t) => { setFullName(t); clearError('fullName'); }}
              placeholder="Họ và tên *"
              returnKeyType="next"
              error={errors.fullName}
              leftIcon={
                <Ionicons name="person-outline" size={20} color={errors.fullName ? '#ef4444' : '#9ca3af'} />
              }
            />

            {/* Email */}
            <FormInput
              value={email}
              onChangeText={(t) => { setEmail(t); clearError('email'); }}
              placeholder="Email *"
              keyboardType="email-address"
              returnKeyType="next"
              error={errors.email}
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={errors.email ? '#ef4444' : '#9ca3af'} />
              }
            />

            {/* Số điện thoại (tuỳ chọn) */}
            <FormInput
              value={phoneNumber}
              onChangeText={(t) => { setPhoneNumber(t); clearError('phoneNumber'); }}
              placeholder="Số điện thoại (tuỳ chọn)"
              keyboardType="phone-pad"
              returnKeyType="next"
              error={errors.phoneNumber}
              leftIcon={
                <Ionicons name="call-outline" size={20} color={errors.phoneNumber ? '#ef4444' : '#9ca3af'} />
              }
            />

            {/* Mật khẩu */}
            <FormInput
              value={password}
              onChangeText={(t) => { setPassword(t); clearError('password'); }}
              placeholder="Mật khẩu *"
              passwordToggle
              secureTextEntry
              returnKeyType="next"
              error={errors.password}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={errors.password ? '#ef4444' : '#9ca3af'} />
              }
            />

            {/* Xác nhận mật khẩu */}
            <FormInput
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
              placeholder="Xác nhận mật khẩu *"
              passwordToggle
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={errors.confirmPassword}
              leftIcon={
                <Ionicons name="shield-checkmark-outline" size={20} color={errors.confirmPassword ? '#ef4444' : '#9ca3af'} />
              }
            />
          </View>

          {/* Hint */}
          <Text style={styles.hint}>
            * Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.
          </Text>

          {/* Register button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={styles.footerGray}>Đã có tài khoản?</Text>
            <TouchableOpacity
              onPress={() => router.replace('/login')}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={styles.footerLink}> Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  logoWrapper: {
    alignItems: 'center',
    marginTop: 4,
  },

  heading: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.2,
  },

  form: {
    gap: 12,
  },

  hint: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
    marginTop: -4,
  },

  registerButton: {
    backgroundColor: '#009688',
    borderRadius: 30,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerGray: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#009688',
  },
});
