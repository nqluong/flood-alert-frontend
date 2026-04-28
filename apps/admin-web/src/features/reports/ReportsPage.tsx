import { useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import './ReportsPage.css';
import ReportCard from './components/ReportCard';
import FilterModal from './components/FilterModal';
import ConfirmModal from './components/ConfirmModal';
import { useReports } from './hooks/useReports';

export default function ReportsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    reportId: string;
  }>({ isOpen: false, type: 'approve', reportId: '' });
  const [actionLoading, setActionLoading] = useState(false);
  
  const {
    reports,
    loading,
    error,
    pendingCount,
    totalPages,
    filter,
    approveReport,
    rejectReport,
    loadMore,
    changeFilter,
  } = useReports({ status: 'PENDING' });

  const handleApproveClick = (reportId: string) => {
    setConfirmModal({ isOpen: true, type: 'approve', reportId });
  };

  const handleRejectClick = (reportId: string) => {
    setConfirmModal({ isOpen: true, type: 'reject', reportId });
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (confirmModal.type === 'approve') {
        await approveReport(confirmModal.reportId);
        console.log('Report approved:', confirmModal.reportId);
      } else {
        await rejectReport(confirmModal.reportId);
        console.log('Report rejected:', confirmModal.reportId);
      }
      setConfirmModal({ isOpen: false, type: 'approve', reportId: '' });
    } catch (err) {
      console.error('Failed to process report:', err);
      alert(
        confirmModal.type === 'approve'
          ? 'Không thể phê duyệt báo cáo. Vui lòng thử lại.'
          : 'Không thể từ chối báo cáo. Vui lòng thử lại.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAction = () => {
    setConfirmModal({ isOpen: false, type: 'approve', reportId: '' });
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const handleApplyFilter = (filters: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    severityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => {
    changeFilter(filters);
  };

  const hasMorePages = filter.page !== undefined && filter.page < totalPages - 1;

  // Đếm số filter đang active
  const activeFilterCount = [filter.status, filter.severityLevel].filter(Boolean).length;

  if (loading && reports.length === 0) {
    return (
      <div className="reports-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: '#6b7280',
        }}>
          Đang tải báo cáo...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: '#dc2626',
          gap: '12px',
        }}>
          <span>⚠️ {error}</span>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header Actions */}
      <div className="reports-page__header">
        <div className="reports-page__actions">
          <button 
            className="reports-page__filter-btn"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter size={16} />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="reports-page__filter-badge">{activeFilterCount}</span>
            )}
          </button>
          <div className="reports-page__pending-badge">
            {pendingCount} báo cáo chờ duyệt
          </div>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: '#6b7280',
          fontSize: '16px',
        }}>
          Không có báo cáo nào
        </div>
      ) : (
        <>
          <div className="reports-page__list">
            {reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMorePages && (
            <div className="reports-page__load-more">
              <button 
                className="reports-page__load-more-btn" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                <Plus size={16} />
                {loading ? 'Đang tải...' : 'Tải thêm báo cáo'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={{
          status: filter.status,
          severityLevel: filter.severityLevel,
        }}
        onApply={handleApplyFilter}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        loading={actionLoading}
      />
    </div>
  );
}
