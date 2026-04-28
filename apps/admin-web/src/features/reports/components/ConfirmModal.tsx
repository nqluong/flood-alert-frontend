import { AlertTriangle, CheckCircle } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  type: 'approve' | 'reject';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({ isOpen, type, onConfirm, onCancel, loading }: ConfirmModalProps) {
  if (!isOpen) return null;

  const isApprove = type === 'approve';

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-modal__icon ${isApprove ? 'approve' : 'reject'}`}>
          {isApprove ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
        </div>

        <h3 className="confirm-modal__title">
          {isApprove ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
        </h3>

        <p className="confirm-modal__message">
          {isApprove 
            ? 'Báo cáo này sẽ được phê duyệt và tạo thành một điểm ngập công khai. Bạn có chắc chắn muốn tiếp tục?'
            : 'Báo cáo này sẽ bị từ chối và không được hiển thị. Bạn có chắc chắn muốn tiếp tục?'
          }
        </p>

        <div className="confirm-modal__actions">
          <button 
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            className={`confirm-modal__btn confirm-modal__btn--confirm ${isApprove ? 'approve' : 'reject'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (isApprove ? 'Phê duyệt' : 'Từ chối')}
          </button>
        </div>
      </div>
    </div>
  );
}
