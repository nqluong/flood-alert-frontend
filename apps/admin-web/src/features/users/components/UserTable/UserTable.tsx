import { Eye, Lock, Unlock, UserCheck } from 'lucide-react';
import './UserTable.css';
import type { UserSummaryResponse } from '../../../../types/user.types';

interface UserTableProps {
  users: UserSummaryResponse[];
  loading: boolean;
  onView: (user: UserSummaryResponse) => void;
  onToggleStatus: (user: UserSummaryResponse) => void;
  onManageRoles: (user: UserSummaryResponse) => void;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=';

export default function UserTable({ users, loading, onView, onToggleStatus, onManageRoles }: UserTableProps) {
  if (loading) {
    return (
      <div className="user-table__loading">
        <div className="user-table__spinner" />
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="user-table__empty">
        <p>Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { label: 'Hoạt động', className: 'user-table__badge--active' },
      LOCKED: { label: 'Bị khóa', className: 'user-table__badge--locked' },
      PENDING: { label: 'Chờ xác thực', className: 'user-table__badge--pending' },
    };
    return badges[status as keyof typeof badges] || { label: status, className: '' };
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: { label: 'Quản trị viên', className: 'user-table__badge--admin' },
      USER: { label: 'Người dùng', className: 'user-table__badge--user' },
    };
    return badges[role as keyof typeof badges] || { label: role, className: '' };
  };

  const normalizeRoles = (roles: UserSummaryResponse['roles']) =>
    Array.isArray(roles) ? roles : [roles];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="user-table">
      <table className="user-table__table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Liên hệ</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Đăng nhập cuối</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const statusBadge = getStatusBadge(user.status);
            const roleList = normalizeRoles(user.roles);

            return (
              <tr key={user.userId}>
                {/* User Info */}
                <td>
                  <div className="user-table__user">
                    <img
                      src={user.avatarUrl ?? `${DEFAULT_AVATAR}${encodeURIComponent(user.fullName)}`}
                      alt={user.fullName}
                      className="user-table__avatar"
                    />
                    <div className="user-table__user-info">
                      <p className="user-table__user-name">{user.fullName}</p>
                      <p className="user-table__user-id">ID: {user.userId}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td>
                  <div className="user-table__contact">
                    <p>{user.email}</p>
                    {user.phone && <p className="user-table__phone">{user.phone}</p>}
                  </div>
                </td>

                {/* Role */}
                <td>
                  <div className="user-table__roles">
                    {roleList.map((role) => {
                      const roleBadge = getRoleBadge(role);
                      return (
                        <span
                          key={`${user.userId}-${role}`}
                          className={`user-table__badge ${roleBadge.className}`}
                        >
                          {roleBadge.label}
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span className={`user-table__badge ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </td>

                {/* Created At */}
                <td className="user-table__date">{formatDate(user.createdAt)}</td>

                {/* Last Login */}
                <td className="user-table__date">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}
                </td>

                {/* Actions */}
                <td>
                  <div className="user-table__actions">
                    <button
                      className="user-table__action-btn user-table__action-btn--view"
                      onClick={() => onView(user)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="user-table__action-btn user-table__action-btn--role"
                      onClick={() => onManageRoles(user)}
                      title="Quản lý Role"
                    >
                      <UserCheck size={16} />
                    </button>
                    <button
                      className={`user-table__action-btn ${
                        user.status === 'ACTIVE'
                          ? 'user-table__action-btn--lock'
                          : 'user-table__action-btn--unlock'
                      }`}
                      onClick={() => onToggleStatus(user)}
                      title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {user.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
