import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReputationCardProps {
  score: number;
}

interface ReputationLevel {
  label: string;
  description: string;
  color: string;
  bg: string;
}

function getReputationLevel(score: number): ReputationLevel {
  if (score >= 90) {
    return {
      label: 'Xuất sắc',
      description: 'Thành viên đóng góp xuất sắc cho cộng đồng',
      color: '#059669',
      bg: '#d1fae5',
    };
  }
  if (score >= 60) {
    return {
      label: 'Tốt',
      description: 'Thành viên tích cực, báo cáo đáng tin cậy',
      color: '#2563eb',
      bg: '#dbeafe',
    };
  }
  if (score >= 30) {
    return {
      label: 'Trung bình',
      description: 'Tiếp tục đóng góp để tăng điểm uy tín',
      color: '#d97706',
      bg: '#fef3c7',
    };
  }
  return {
    label: 'Thấp',
    description: 'Báo cáo chính xác để cải thiện điểm uy tín',
    color: '#dc2626',
    bg: '#fee2e2',
  };
}

export function ReputationCard({ score }: ReputationCardProps) {
  const level = getReputationLevel(score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#6b7280" />
        <Text style={styles.title}>Điểm uy tín</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.score, { color: level.color }]}>{score}</Text>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: level.bg }]}>
            <Text style={[styles.badgeText, { color: level.color }]}>{level.label}</Text>
          </View>
          <Text style={styles.description}>{level.description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  score: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    minWidth: 64,
    textAlign: 'center',
  },
  right: {
    flex: 1,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});
