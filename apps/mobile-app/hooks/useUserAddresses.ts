import { useState, useEffect, useCallback } from 'react';
import { addressService } from '../services/address.service';
import type { UserAddressResponse, UserAddressRequest } from '../types/address.types';

export function useUserAddresses() {
  const [addresses, setAddresses] = useState<UserAddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(
    async (data: UserAddressRequest) => {
      try {
        setError(null);
        const newAddress = await addressService.createAddress(data);
        setAddresses((prev) => [...prev, newAddress]);
        return newAddress;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể thêm địa chỉ';
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const updateAddress = useCallback(
    async (addressId: string, data: UserAddressRequest) => {
      try {
        setError(null);
        const updated = await addressService.updateAddress(addressId, data);
        setAddresses((prev) => prev.map((addr) => (addr.id === addressId ? updated : addr)));
        return updated;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật địa chỉ';
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const deleteAddress = useCallback(async (addressId: string) => {
    try {
      setError(null);
      await addressService.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa địa chỉ';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const setPrimaryAddress = useCallback(async (addressId: string) => {
    try {
      setError(null);
      const updated = await addressService.setPrimaryAddress(addressId);
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isPrimary: addr.id === addressId,
        })),
      );
      return updated;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể đặt địa chỉ chính';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
  };
}
