import { Search } from 'lucide-react';
import './UserFilters.css';
import type { UserFilters } from '../../../../types/user.types';
import Select from '../../../../components/Select/Select';

interface UserFiltersBarProps {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
}

export default function UserFiltersBar({ filters, onChange }: UserFiltersBarProps) {
  return (
    <div className="user-filters">
      {/* Search */}
      <div className="user-filters__search">
        <Search size={16} className="user-filters__search-icon" />
        <input
          type="text"
          className="user-filters__search-input"
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.role}
        onChange={(value) => onChange({ ...filters, role: value as UserFilters['role'] })}
        options={[
          { value: 'all', label: 'Tất cả vai trò' },
          { value: 'USER', label: 'Người dùng' },
          { value: 'ADMIN', label: 'Quản trị viên' },
        ]}
      />

      {/* Status Filter */}
      <Select
        value={filters.status}
        onChange={(value) => onChange({ ...filters, status: value as UserFilters['status'] })}
        options={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'ACTIVE', label: 'Hoạt động' },
          { value: 'DISABLED', label: 'Không hoạt động' },
          { value: 'BANNED', label: 'Bị ban' },
        ]}
      />

      {/* Auth Provider Filter */}
      <Select
        value={filters.authProvider ?? 'all'}
        onChange={(value) => onChange({ ...filters, authProvider: value as UserFilters['authProvider'] })}
        options={[
          { value: 'all', label: 'Tất cả nguồn' },
          { value: 'LOCAL', label: 'Đăng ký thường' },
          { value: 'GOOGLE', label: 'Google' },
          { value: 'FACEBOOK', label: 'Facebook' },
        ]}
      />
    </div>
  );
}
