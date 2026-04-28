import { Check, X, MapPin} from 'lucide-react';
import type { UserReport } from '../reports.types';

interface ReportCardProps {
  report: UserReport;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string) => void;
}

export default function ReportCard({ report, onApprove, onReject }: ReportCardProps) {
  const firstImage = report.imageUrls
    ? report.imageUrls.split(',')[0].trim() 
    : 'https://via.placeholder.com/527x256?text=No+Image';
  
  // Map severity level sang tiếng Việt và màu sắc
  const getSeverityInfo = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return { label: 'Thấp', color: '#10b981', bgColor: '#d1fae5', borderColor: '#6ee7b7' };
      case 'MEDIUM':
        return { label: 'Trung bình', color: '#f59e0b', bgColor: '#fef3c7', borderColor: '#fcd34d' };
      case 'HIGH':
        return { label: 'Cao', color: '#ef4444', bgColor: '#fee2e2', borderColor: '#fca5a5' };
      case 'CRITICAL':
        return { label: 'Nghiêm trọng', color: '#dc2626', bgColor: '#fecaca', borderColor: '#f87171' };
      default:
        return { label: 'Chưa xác định', color: '#6b7280', bgColor: '#f3f4f6', borderColor: '#d1d5db' };
    }
  };

  const severityInfo = getSeverityInfo(report.severityLevel);
  
  return (
    <div className="report-card">
      <div className="report-card__content">
        {/* Evidence Section */}
        <div className="report-card__evidence">
          <h3 className="report-card__section-title">Bằng chứng</h3>
          
          <div className="report-card__image">
            <img src={firstImage} alt="Bằng chứng lũ lụt" />
          </div>

          <div className="report-card__location">
            <div className="report-card__location-icon">
              <MapPin size={24} />
            </div>
            <p className="report-card__location-address">
              {report.location.address === 'Đang tải địa chỉ...' ? (
                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                  {report.location.address}
                </span>
              ) : (
                report.location.address
              )}
            </p>
            <p className="report-card__location-coords">
              {report.location.coordinates.lat.toFixed(4)}, {report.location.coordinates.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="report-card__analysis">
          <h3 className="report-card__section-title">Phân tích & Hành động</h3>

          {/* Info Box */}
          <div className="report-card__info-box">
            <div className="report-card__info-row">
              <span className="report-card__info-label">ID người dùng:</span>
              <span className="report-card__info-value">{report.userId}</span>
            </div>
            <div className="report-card__info-row">
              <span className="report-card__info-label">Thời gian:</span>
              <span className="report-card__info-value">{report.timestamp}</span>
            </div>
            <div className="report-card__info-row">
              <span className="report-card__info-label">Mức độ nghiêm trọng:</span>
              <span 
                className="report-card__info-value"
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: severityInfo.color,
                  backgroundColor: severityInfo.bgColor,
                  border: `1px solid ${severityInfo.borderColor}`,
                }}
              >
                {severityInfo.label}
              </span>
            </div>
            <div className="report-card__info-row report-card__info-description">
              <span className="report-card__info-label">Mô tả:</span>
              <span className="report-card__info-value">"{report.description}"</span>
            </div>
          </div>

          {/* AI Verification Box - Tạm thời ẩn */}
          {/* <div className="report-card__ai-box">
            <div className="report-card__ai-header">
              <div className="report-card__ai-icon">
                <Sparkles size={20} />
              </div>
              <h4 className="report-card__ai-title">Xác minh AI</h4>
            </div>
            <div className="report-card__ai-content">
              <div className="report-card__ai-row">
                <span className="report-card__ai-label">Độ tin cậy AI</span>
                <span className="report-card__ai-percentage">{report.aiVerification.confidence}%</span>
              </div>
              <div className="report-card__ai-progress">
                <div 
                  className="report-card__ai-progress-bar" 
                  style={{ width: `${report.aiVerification.confidence}%` }}
                />
              </div>
              <p className="report-card__ai-description">{report.aiVerification.label}</p>
            </div>
          </div> */}

          {/* Weather Box - Tạm thời ẩn */}
          {/* <div className="report-card__weather-box">
            <div className="report-card__weather-content">
              <div className="report-card__weather-icon">
                <CloudRain size={18} />
              </div>
              <div className="report-card__weather-text">
                <h4>Dữ liệu thời tiết: {report.weatherData.matched ? 'Khớp' : 'Không khớp'}</h4>
                <p>{report.weatherData.description}</p>
              </div>
            </div>
          </div> */}

          {/* Actions */}
          <div className="report-card__actions" style={{ marginTop: '24px' }}>
            <button 
              className="report-card__action-btn report-card__action-btn--approve"
              onClick={() => onApprove(report.id)}
            >
              <Check size={16} />
              Phê duyệt & Xuất bản
            </button>
            <button 
              className="report-card__action-btn report-card__action-btn--reject"
              onClick={() => onReject(report.id)}
            >
              <X size={16} />
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
