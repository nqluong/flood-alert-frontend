import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../../../services/report.service';
import { userService } from '../../../services/user.service';
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
    ...initialFilter,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await reportService.getAllReports({ status: 'PENDING', page: 0, size: 1 });
      setPendingCount(response.totalElements);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

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
          description: apiReport.description || null,
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
          score: apiReport.score ?? null,
          aiScore: apiReport.aiScore ?? null,
          spatialScore: apiReport.spatialScore ?? null,
          reputationScore: apiReport.reputationScore ?? null,
          createdAt: apiReport.createdAt,
          message: apiReport.message,
        };
      });
      
      // page === 0 (lần đầu hoặc đổi filter) -> thay mới; page > 0 (loadMore) -> nối thêm
      const isAppend = (filter.page ?? 0) > 0;
      setReports(prev => (isAppend ? [...prev, ...initialReports] : initialReports));
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setLoading(false);
      
      for (let i = 0; i < response.content.length; i++) {
        const apiReport = response.content[i];
        if (apiReport.lat && apiReport.lon) {
          try {
            const geocodingResult = await reverseGeocode(apiReport.lat, apiReport.lon);

            setReports(prev => prev.map(report =>
              report.id === apiReport.id
                ? { ...report, location: { ...report.location, address: geocodingResult.address } }
                : report
            ));

            if (i < response.content.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error('Geocoding error for report', apiReport.id, error);
            setReports(prev => prev.map(report =>
              report.id === apiReport.id
                ? { ...report, location: { ...report.location, address: 'TP.HCM' } }
                : report
            ));
          }
        }
      }

      const uniqueUserIds = [...new Set(response.content.map(r => r.userId).filter(Boolean))];
      if (uniqueUserIds.length > 0) {
        try {
          const nameMap = await userService.getUserNamesByIds(uniqueUserIds);
          // Giữ nguyên userName đã có (trang trước) nếu trang mới không chứa userId đó
          setReports(prev => prev.map(report => ({
            ...report,
            userName: nameMap[report.userId] ?? report.userName,
          })));
        } catch {
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

  const syncStatusFromServer = (currentFilter: ReportFilterRequest) => {
    reportService.getAllReports(currentFilter)
      .then(response => {
        const statusMap = new Map(response.content.map(r => [r.id, r.status]));
        setReports(prev => prev.map(r => {
          const serverStatus = statusMap.get(r.id);
          return serverStatus
            ? { ...r, status: serverStatus as 'PENDING' | 'APPROVED' | 'REJECTED' }
            : r;
        }));
        fetchPendingCount();
      })
      .catch(() => {});
  };

  const approveReport = async (reportId: string) => {
    try {
      await reportService.approveFloodEvent(reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'APPROVED' as const } : r));
      setPendingCount(prev => Math.max(0, prev - 1));
      syncStatusFromServer(filter);
    } catch (err) {
      console.error('Error approving report:', err);
      throw err;
    }
  };

  const rejectReport = async (reportId: string) => {
    try {
      await reportService.rejectFloodEvent(reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'REJECTED' as const } : r));
      setPendingCount(prev => Math.max(0, prev - 1));
      syncStatusFromServer(filter);
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
    pendingCount,
    approveReport,
    rejectReport,
    loadMore,
    changeFilter,
    refetch: fetchReports,
  };
}
