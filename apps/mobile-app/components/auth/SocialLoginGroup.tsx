import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

type SocialProvider = 'google' | 'facebook' | 'apple';

interface SocialConfig {
  label: string;
  icon: React.ReactNode;
}

const SOCIAL_CONFIG: Record<SocialProvider, SocialConfig> = {
  google: {
    label: 'Google',
    icon: (
      // Simple G icon using FontAwesome
      <FontAwesome name="google" size={22} color="#ea4335" />
    ),
  },
  facebook: {
    label: 'Facebook',
    icon: <FontAwesome name="facebook" size={22} color="#1877f2" />,
  },
  apple: {
    label: 'Apple',
    icon: <Ionicons name="logo-apple" size={22} color="#111827" />,
  },
};

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
}

export function SocialLoginButton({ provider, onPress }: SocialLoginButtonProps) {
  const config = SOCIAL_CONFIG[provider];
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      {config.icon}
    </TouchableOpacity>
  );
}

interface SocialLoginGroupProps {
  onGooglePress?: () => void;
  onFacebookPress?: () => void;
  onApplePress?: () => void;
}

export function SocialLoginGroup({
  onGooglePress,
  onFacebookPress,
  onApplePress,
}: SocialLoginGroupProps) {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
        <View style={styles.line} />
      </View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        <SocialLoginButton provider="google" onPress={onGooglePress} />
        <SocialLoginButton provider="facebook" onPress={onFacebookPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 13,
    color: '#6b7280',
    letterSpacing: -0.2,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
