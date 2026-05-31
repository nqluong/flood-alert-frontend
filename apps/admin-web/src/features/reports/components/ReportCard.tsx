import { Check, X, MapPin, Activity } from 'lucide-react';
import type { UserReport } from '../reports.types';
import './ReportCard.css';

function getScoreVariant(value: number): 'high' | 'medium' | 'low' {
  return value >= 0.8 ? 'high' : value >= 0.5 ? 'medium' : 'low';
}

function getSeverityLabel(level: string): string {
  const map: Record<string, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    CRITICAL: 'Nghiêm trọng',
  };
  return map[level.toUpperCase()] ?? 'Chưa xác định';
}

function getSeverityVariant(level: string): string {
  const valid = ['low', 'medium', 'high', 'critical'];
  const l = level.toLowerCase();
  return valid.includes(l) ? l : 'unknown';
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const variant = getScoreVariant(value);
  return (
    <div className="score-bar">
      <span className="score-bar__label">{label}</span>
      <div className="score-bar__track">
        <div
          className={`score-bar__fill score-bar__fill--${variant}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`score-bar__value score-bar__value--${variant}`}>
        {pct}%
      </span>
    </div>
  );
}

interface ReportCardProps {
  report: UserReport;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string) => void;
}

export default function ReportCard({ report, onApprove, onReject }: ReportCardProps) {
  const firstImage = report.imageUrls
    ? report.imageUrls.split(',')[0].trim()
    : 'https://via.placeholder.com/527x256?text=No+Image';

  const severityVariant = getSeverityVariant(report.severityLevel);
  const severityLabel = getSeverityLabel(report.severityLevel);

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
                <span className="report-card__location-address--loading">
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
              <span className="report-card__info-label">Người dùng:</span>
              <span className="report-card__info-value">
                {report.userName ?? (
                  <span className="report-card__user-id">
                    {report.userId.slice(0, 8)}…
                  </span>
                )}
              </span>
            </div>
            <div className="report-card__info-row">
              <span className="report-card__info-label">Thời gian:</span>
              <span className="report-card__info-value">{report.timestamp}</span>
            </div>
            <div className="report-card__info-row">
              <span className="report-card__info-label">Mức độ nghiêm trọng:</span>
              <span className={`report-card__severity-badge report-card__severity-badge--${severityVariant}`}>
                {severityLabel}
              </span>
            </div>
            <div className="report-card__info-row report-card__info-description">
              <span className="report-card__info-label">Mô tả:</span>
              {report.description ? (
                <span className="report-card__info-value">{report.description}</span>
              ) : (
                <span className="report-card__info-value report-card__info-value--empty">
                  Không có mô tả
                </span>
              )}
            </div>
          </div>

          {/* Score Box */}
          {report.score != null && (
            <div className="report-card__info-box report-card__score-box">
              <div className="report-card__info-row">
                <span className="report-card__info-label report-card__score-label">
                  <Activity size={14} />
                  Điểm tin cậy tổng:
                </span>
                <span className="report-card__info-value">
                  <span className={`report-card__score-badge report-card__score-badge--${getScoreVariant(report.score)}`}>
                    {(report.score * 100).toFixed(1)}%
                  </span>
                </span>
              </div>

              {(report.aiScore != null || report.spatialScore != null || report.reputationScore != null) && (
                <div className="report-card__score-breakdown">
                  {report.aiScore != null && (
                    <ScoreBar label="AI Vision" value={report.aiScore} />
                  )}
                  {report.spatialScore != null && (
                    <ScoreBar label="Không gian" value={report.spatialScore} />
                  )}
                  {report.reputationScore != null && (
                    <ScoreBar label="Uy tín" value={report.reputationScore} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions — chỉ hiển thị khi báo cáo đang chờ duyệt */}
          {report.status === 'PENDING' && (
            <div className="report-card__actions">
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
          )}
        </div>
      </div>
    </div>
  );
}
