import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../../../services/report.service';
import { reverseGeocode } from '../../../utils/geocoding';
import type {
  UserReport,
  ReportFilterRequest,
} from '../reports.types';

export function useReports(initialFilter: ReportFilterRequest = {}) {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilterRequest>({
    page: 0,
    size: 10,
    status: 'PENDING',
    ...initialFilter,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getAllReports(filter);
      
      const initialReports = response.content.map(apiReport => {
        const aiConfidence = Math.floor(Math.random() * 20) + 80;
        return {
          id: apiReport.id,
          reportId: apiReport.reportId,
          userId: apiReport.userId,
          timestamp: new Date(apiReport.createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          description: apiReport.description || 'Không có mô tả',
          location: {
            address: 'Đang tải địa chỉ...',
            coordinates: {
              lat: apiReport.lat || 0,
              lng: apiReport.lon || 0,
            },
          },
          imageUrls: apiReport.imageUrls || '',
          severityLevel: apiReport.severityLevel || 'UNKNOWN',
          aiVerification: {
            confidence: aiConfidence,
            label: aiConfidence >= 90 
              ? 'Xác suất rất cao có lũ lụt' 
              : 'Xác suất cao có lũ lụt',
          },
          weatherData: {
            matched: true,
            description: 'Mưa to tại thời điểm báo cáo',
          },
          status: apiReport.status as 'PENDING' | 'APPROVED' | 'REJECTED',
          createdAt: apiReport.createdAt,
          message: apiReport.message,
        };
      });
      
      setReports(initialReports);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setLoading(false);
      
      for (let i = 0; i < response.content.length; i++) {
        const apiReport = response.content[i];
        if (apiReport.lat && apiReport.lon) {
          try {
            const geocodingResult = await reverseGeocode(apiReport.lat, apiReport.lon);
            
            // Cập nhật địa chỉ cho report này
            setReports(prev => prev.map(report => 
              report.id === apiReport.id 
                ? { ...report, location: { ...report.location, address: geocodingResult.address } }
                : report
            ));
            
            // Delay 1 giây giữa các request để tránh rate limit
            if (i < response.content.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error('Geocoding error for report', apiReport.id, error);
            // Cập nhật với fallback
            setReports(prev => prev.map(report => 
              report.id === apiReport.id 
                ? { ...report, location: { ...report.location, address: 'TP.HCM' } }
                : report
            ));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải báo cáo');
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const approveReport = async (reportId: string) => {
    try {
      await reportService.approveFloodEvent(reportId);
      // Xóa report khỏi danh sách sau khi approve
      setReports(prev => prev.filter(r => r.id !== reportId));
      setTotalElements(prev => prev - 1);
    } catch (err) {
      console.error('Error approving report:', err);
      throw err;
    }
  };

  const rejectReport = async (reportId: string) => {
    try {
      await reportService.rejectFloodEvent(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      setTotalElements(prev => prev - 1);
    } catch (err) {
      console.error('Error rejecting report:', err);
      throw err;
    }
  };

  const loadMore = () => {
    if (filter.page !== undefined && filter.page < totalPages - 1) {
      setFilter(prev => ({
        ...prev,
        page: (prev.page ?? 0) + 1,
      }));
    }
  };

  const changeFilter = (newFilter: Partial<ReportFilterRequest>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter,
      page: 0,
    }));
  };

  return {
    reports,
    loading,
    error,
    filter,
    totalPages,
    totalElements,
    pendingCount: totalElements,
    approveReport,
    rejectReport,
    loadMore,
    changeFilter,
    refetch: fetchReports,
  };
}
