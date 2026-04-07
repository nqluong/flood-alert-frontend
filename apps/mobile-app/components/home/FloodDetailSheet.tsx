import React from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { FloodPointCard } from './FloodPointCard';
import type { FloodEvent } from '../../types/flood.types';

interface FloodDetailSheetProps {
  flood: FloodEvent | null;
  onClose: () => void;
}

function formatTimeAgo(updatedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60_000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  return `${Math.floor(diff / 60)} giờ trước`;
}

export function FloodDetailSheet({ flood, onClose }: FloodDetailSheetProps) {
  if (!flood) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handleBar} />
        <View style={styles.cardWrapper}>
          <FloodPointCard
            name={flood.location || `${flood.lat.toFixed(5)}, ${flood.lon.toFixed(5)}`}
            description={`Mực nước: ${flood.waterLevel} cm`}
            timeAgo={formatTimeAgo(flood.updatedAt)}
            severity={flood.severityLevel === 'DANGER' ? 'danger' : 'warning'}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginBottom: 12,
  },
  cardWrapper: {
    marginBottom: 0,
  },
});
