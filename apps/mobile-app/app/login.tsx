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
import { SocialLoginGroup } from '../components/auth/SocialLoginGroup';
import { authService } from '../services/auth.service';
import { useAlert } from '../hooks/useAlert';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { showError } = useAlert();

  function validate(): boolean {
    let valid = true;
    if (!identifier.trim()) {
      setIdentifierError('Vui lòng nhập email hoặc số điện thoại.');
      valid = false;
    } else {
      setIdentifierError('');
    }
    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.login(identifier, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sai tài khoản hoặc mật khẩu.';
      showError('Đăng nhập thất bại', message);
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
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <AppLogo size="lg" />
          </View>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục sử dụng FloodGuard
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <FormInput
              value={identifier}
              onChangeText={(t) => { setIdentifier(t); if (identifierError) setIdentifierError(''); }}
              placeholder="Email hoặc số điện thoại"
              keyboardType="email-address"
              returnKeyType="next"
              error={identifierError}
              leftIcon={
                <Ionicons name="person-outline" size={20} color={identifierError ? '#ef4444' : '#9ca3af'} />
              }
            />

            <FormInput
              value={password}
              onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(''); }}
              placeholder="Mật khẩu"
              passwordToggle
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={passwordError}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={passwordError ? '#ef4444' : '#9ca3af'} />
              }
            />

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotWrapper}
              onPress={() => {/* TODO: navigate to forgot-password */}}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Social login */}
          <SocialLoginGroup />

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerGray}>Chưa có tài khoản?</Text>
            <TouchableOpacity
              onPress={() => router.push('/register')}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={styles.footerLink}> Đăng ký ngay</Text>
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
    paddingTop: 32,
    paddingBottom: 40,
    gap: 28,
  },

  // Logo
  logoWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },

  // Heading
  heading: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
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

  // Form
  form: {
    gap: 14,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotText: {
    fontSize: 14,
    color: '#009688',
    fontWeight: '600',
  },

  // Login button
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },

  // Footer
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
