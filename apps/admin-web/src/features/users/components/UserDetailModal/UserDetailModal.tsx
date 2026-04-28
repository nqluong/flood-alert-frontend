import { X, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import './UserDetailModal.css';
import type { UserSummaryResponse } from '../../../../types/user.types';

interface UserDetailModalProps {
  user: UserSummaryResponse;
  onClose: () => void;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=';

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: { bg: '#d1fae5', text: '#065f46' },
      LOCKED: { bg: '#fee2e2', text: '#991b1b' },
      PENDING: { bg: '#fef3c7', text: '#92400e' },
    };
    return colors[status as keyof typeof colors] || { bg: '#f3f4f6', text: '#374151' };
  };

  const statusColor = getStatusColor(user.status);

  return (
    <div className="user-detail-modal-overlay" onClick={onClose}>
      <div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="user-detail-modal__header">
          <h3>Chi tiết người dùng</h3>
          <button className="user-detail-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="user-detail-modal__body">
          {/* User Profile */}
          <div className="user-detail-modal__profile">
            <img
              src={user.avatarUrl ?? `${DEFAULT_AVATAR}${encodeURIComponent(user.fullName)}`}
              alt={user.fullName}
              className="user-detail-modal__avatar"
            />
            <div className="user-detail-modal__profile-info">
              <h4>{user.fullName}</h4>
              <p className="user-detail-modal__user-id">ID: {user.userId}</p>
              <div className="user-detail-modal__badges">
                <span
                  className="user-detail-modal__badge"
                  style={{ background: statusColor.bg, color: statusColor.text }}
                >
                  {user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'LOCKED' ? 'Bị khóa' : 'Chờ xác thực'}
                </span>
                <span
                  className="user-detail-modal__badge"
                  style={{
                    background: user.roles === 'ADMIN' ? '#dbeafe' : '#f3f4f6',
                    color: user.roles === 'ADMIN' ? '#1e40af' : '#374151',
                  }}
                >
                  <Shield size={12} />
                  {user.roles === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="user-detail-modal__info-grid">
            <div className="user-detail-modal__info-item">
              <div className="user-detail-modal__info-icon">
                <Mail size={16} />
              </div>
              <div>
                <p className="user-detail-modal__info-label">Email</p>
                <p className="user-detail-modal__info-value">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="user-detail-modal__info-item">
                <div className="user-detail-modal__info-icon">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="user-detail-modal__info-label">Số điện thoại</p>
                  <p className="user-detail-modal__info-value">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="user-detail-modal__info-item">
              <div className="user-detail-modal__info-icon">
                <Calendar size={16} />
              </div>
              <div>
                <p className="user-detail-modal__info-label">Ngày tạo</p>
                <p className="user-detail-modal__info-value">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {user.lastLoginAt && (
              <div className="user-detail-modal__info-item">
                <div className="user-detail-modal__info-icon">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="user-detail-modal__info-label">Đăng nhập cuối</p>
                  <p className="user-detail-modal__info-value">{formatDate(user.lastLoginAt)}</p>
                </div>
              </div>
            )}

            {user.reportCount !== undefined && (
              <div className="user-detail-modal__info-item">
                <div className="user-detail-modal__info-icon">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="user-detail-modal__info-label">Số báo cáo</p>
                  <p className="user-detail-modal__info-value">{user.reportCount} báo cáo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="user-detail-modal__footer">
          <button className="user-detail-modal__btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
