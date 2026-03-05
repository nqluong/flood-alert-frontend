import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertContext, AlertType } from '../../context/AlertContext';

type IconConfig = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
};

const ICON_MAP: Record<AlertType, IconConfig> = {
  success: { name: 'checkmark-circle',    color: '#22c55e', bg: '#f0fdf4' },
  error:   { name: 'close-circle',        color: '#ef4444', bg: '#fef2f2' },
  warning: { name: 'warning',             color: '#f59e0b', bg: '#fffbeb' },
  info:    { name: 'information-circle',  color: '#3b82f6', bg: '#eff6ff' },
  confirm: { name: 'help-circle',         color: '#009688', bg: '#f0fdfa' },
};

export function AppAlert() {
  const { visible, config, hide } = useAlertContext();
  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 160,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!config) return null;

  const icon = ICON_MAP[config.type];

  function handlePress(onPress?: () => void) {
    hide();
    onPress?.();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={hide}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name} size={44} color={icon.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{config.title}</Text>

          {/* Message */}
          {config.message ? (
            <Text style={styles.message}>{config.message}</Text>
          ) : null}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Buttons */}
          <View
            style={[
              styles.buttonRow,
              config.buttons.length === 1 && styles.buttonRowSingle,
            ]}
          >
            {config.buttons.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.button,
                    isDestructive && styles.buttonDestructive,
                    isCancel      && styles.buttonCancel,
                    !isDestructive && !isCancel && styles.buttonDefault,
                  ]}
                  onPress={() => handlePress(btn.onPress)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel      && styles.buttonTextCancel,
                      !isDestructive && !isCancel && styles.buttonTextDefault,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 16,
  },

  // Icon
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  // Text
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 4,
  },

  // Divider
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f3f4f6',
    marginTop: 6,
    marginBottom: 2,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  buttonRowSingle: {
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDefault: {
    backgroundColor: '#009688',
  },
  buttonCancel: {
    backgroundColor: '#f3f4f6',
  },
  buttonDestructive: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  buttonTextDefault: {
    color: '#ffffff',
  },
  buttonTextCancel: {
    color: '#374151',
  },
  buttonTextDestructive: {
    color: '#ef4444',
  },
});
