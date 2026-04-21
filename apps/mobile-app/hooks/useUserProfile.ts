import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import type { UserProfileResponse, UserProfileUpdateRequest } from '../types/user.types';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UserProfileUpdateRequest) => {
    try {
      setError(null);
      const updated = await userService.updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật thông tin';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
