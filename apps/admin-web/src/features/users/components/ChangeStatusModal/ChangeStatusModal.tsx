import { useState } from 'react';
import { Lock, Unlock, X } from 'lucide-react';
import './ChangeStatusModal.css';
import type { UserSummaryResponse } from '../../../../types/user.types';
import { userService } from '../../../../services/user.service';

interface ChangeStatusModalProps {
  user: UserSummaryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeStatusModal({ user, onClose, onSuccess }: ChangeStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const isLocking = user.status === 'ACTIVE';
  const newStatus = isLocking ? 'LOCKED' : 'ACTIVE';

  const handleSubmit = async () => {
    if (isLocking && !reason.trim()) {
      alert('Vui lòng nhập lý do khóa tài khoản');
      return;
    }

    setLoading(true);
    try {
      await userService.changeUserStatus(user.id, {
        status: newStatus,
        reason: reason.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to change user status:', err);
      alert(
        err instanceof Error
          ? err.message
          : `Không thể ${isLocking ? 'khóa' : 'mở khóa'} tài khoản. Vui lòng thử lại.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-status-modal-overlay" onClick={onClose}>
      <div className="change-status-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="change-status-modal__header">
          <div className={`change-status-modal__icon ${isLocking ? 'lock' : 'unlock'}`}>
            {isLocking ? <Lock size={24} /> : <Unlock size={24} />}
          </div>
          <button className="change-status-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="change-status-modal__body">
          <h3 className="change-status-modal__title">
            {isLocking ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          </h3>
          <p className="change-status-modal__message">
            {isLocking
              ? `Bạn có chắc chắn muốn khóa tài khoản của "${user.name}"? Người dùng sẽ không thể đăng nhập sau khi bị khóa.`
              : `Bạn có chắc chắn muốn mở khóa tài khoản của "${user.name}"? Người dùng sẽ có thể đăng nhập trở lại.`}
          </p>

          {/* User Info */}
          <div className="change-status-modal__user-info">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.phoneNumber && (
              <p>
                <strong>Số điện thoại:</strong> {user.phoneNumber}
              </p>
            )}
          </div>

          {/* Reason (only for locking) */}
          {isLocking && (
            <div className="change-status-modal__reason">
              <label htmlFor="reason">Lý do khóa tài khoản *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản (bắt buộc)..."
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="change-status-modal__footer">
          <button
            className="change-status-modal__btn change-status-modal__btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className={`change-status-modal__btn change-status-modal__btn--confirm ${
              isLocking ? 'lock' : 'unlock'
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : isLocking ? 'Khóa tài khoản' : 'Mở khóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
