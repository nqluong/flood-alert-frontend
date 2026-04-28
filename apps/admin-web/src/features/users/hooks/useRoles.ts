import { useEffect, useState } from 'react';
import type { RoleResponse, UserRoleResponse } from '../../../types/user.types';
import { roleService } from '../../../services/role.service';

export function useRoles() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
  };
}

export function useUserRoles(userId: string) {
  const [userRoles, setUserRoles] = useState<UserRoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getUserRoles(userId);
      
      // Debug log để kiểm tra API response
      console.log('User roles response:', data);
      
      setUserRoles(data);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải roles của người dùng');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (roleId: string) => {
    try {
      setError(null);
      await roleService.assignRole({ userId, roleId });
      await fetchUserRoles(); // Refresh data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gán role thất bại');
      return false;
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      setError(null);
      await roleService.removeRole(userId, roleId);
      await fetchUserRoles(); // Refresh data
      return true;
    } catch (err) {
      console.error('Error removing role:', err);
      setError(err instanceof Error ? err.message : 'Xóa role thất bại');
      return false;
    }
  };

  useEffect(() => {
    void fetchUserRoles();
  }, [userId]);

  return {
    userRoles,
    loading,
    error,
    assignRole,
    removeRole,
    refetch: fetchUserRoles,
  };
}
