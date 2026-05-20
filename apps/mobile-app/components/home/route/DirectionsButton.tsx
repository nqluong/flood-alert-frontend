import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { VehicleType } from '../../../types/route.types';

interface DirectionsButtonProps {
  visible: boolean;
  destinationName: string;
  destinationCoordinate: [number, number];
  onDirections: (vehicleType: VehicleType) => void;
  onClose: () => void;
}

/**
 * Bottom sheet hiển thị thông tin địa điểm và nút chỉ đường
 */
export function DirectionsButton({
  visible,
  destinationName,
  destinationCoordinate,
  onDirections,
  onClose,
}: DirectionsButtonProps) {
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);

  if (!visible) {
    return null;
  }

  const handleDirectionsPress = () => {
    setShowVehicleOptions(true);
  };

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    setShowVehicleOptions(false);
    onDirections(vehicleType);
  };

  const handleClose = () => {
    setShowVehicleOptions(false);
    onClose();
  };

  return (
    <>
      {/* Main Bottom Sheet */}
      <View style={styles.container}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="location" size={24} color="#009688" />
              <View style={styles.headerText}>
                <Text style={styles.locationName} numberOfLines={1}>
                  {destinationName}
                </Text>
                <Text style={styles.coordinates}>
                  {destinationCoordinate[1].toFixed(6)}, {destinationCoordinate[0].toFixed(6)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Directions Button */}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleDirectionsPress}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color="#ffffff" />
            <Text style={styles.directionsButtonText}>Chỉ đường</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehicleOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVehicleOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVehicleOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn phương tiện</Text>
            
            <TouchableOpacity
              style={styles.vehicleOption}
              onPress={() => handleVehicleSelect('MOTORBIKE')}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleIconContainer}>
                <Ionicons name="bicycle" size={28} color="#009688" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>Xe máy</Text>
                <Text style={styles.vehicleDesc}>Tối ưu cho xe máy và xe đạp</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.vehicleOption}
              onPress={() => handleVehicleSelect('CAR')}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleIconContainer}>
                <Ionicons name="car" size={28} color="#009688" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>Ô tô</Text>
                <Text style={styles.vehicleDesc}>Tối ưu cho ô tô và xe tải</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  coordinates: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#009688',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f7f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  vehicleDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
