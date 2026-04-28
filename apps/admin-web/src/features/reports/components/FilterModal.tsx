import { X } from 'lucide-react';
import { useState } from 'react';
import './FilterModal.css';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    severityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  onApply: (filters: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    severityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => void;
}

export default function FilterModal({ isOpen, onClose, currentFilters, onApply }: FilterModalProps) {
  const [status, setStatus] = useState<string>(currentFilters.status || '');
  const [severityLevel, setSeverityLevel] = useState<string>(currentFilters.severityLevel || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      status: status as any || undefined,
      severityLevel: severityLevel as any || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setStatus('');
    setSeverityLevel('');
    onApply({
      status: undefined,
      severityLevel: undefined,
    });
    onClose();
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal__header">
          <h3>Bộ lọc báo cáo</h3>
          <button className="filter-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="filter-modal__body">
          {/* Status Filter */}
          <div className="filter-modal__group">
            <label className="filter-modal__label">Trạng thái</label>
            <div className="filter-modal__options">
              <button
                className={`filter-modal__option ${status === '' ? 'active' : ''}`}
                onClick={() => setStatus('')}
              >
                Tất cả
              </button>
              <button
                className={`filter-modal__option ${status === 'PENDING' ? 'active' : ''}`}
                onClick={() => setStatus('PENDING')}
              >
                Chờ duyệt
              </button>
              <button
                className={`filter-modal__option ${status === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setStatus('APPROVED')}
              >
                Đã duyệt
              </button>
              <button
                className={`filter-modal__option ${status === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setStatus('REJECTED')}
              >
                Đã từ chối
              </button>
            </div>
          </div>

          {/* Severity Level Filter */}
          <div className="filter-modal__group">
            <label className="filter-modal__label">Mức độ nghiêm trọng</label>
            <div className="filter-modal__options">
              <button
                className={`filter-modal__option ${severityLevel === '' ? 'active' : ''}`}
                onClick={() => setSeverityLevel('')}
              >
                Tất cả
              </button>
              <button
                className={`filter-modal__option severity-low ${severityLevel === 'LOW' ? 'active' : ''}`}
                onClick={() => setSeverityLevel('LOW')}
              >
                Thấp
              </button>
              <button
                className={`filter-modal__option severity-medium ${severityLevel === 'MEDIUM' ? 'active' : ''}`}
                onClick={() => setSeverityLevel('MEDIUM')}
              >
                Trung bình
              </button>
              <button
                className={`filter-modal__option severity-high ${severityLevel === 'HIGH' ? 'active' : ''}`}
                onClick={() => setSeverityLevel('HIGH')}
              >
                Cao
              </button>
              <button
                className={`filter-modal__option severity-critical ${severityLevel === 'CRITICAL' ? 'active' : ''}`}
                onClick={() => setSeverityLevel('CRITICAL')}
              >
                Nghiêm trọng
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal__footer">
          <button className="filter-modal__btn filter-modal__btn--reset" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="filter-modal__btn filter-modal__btn--apply" onClick={handleApply}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
