export interface UserReport {
  id: string;
  reportId: string;
  userId: string;
  userName?: string;
  timestamp: string;
  description: string | null;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  imageUrls: string;
  severityLevel: string;
  aiVerification: {
    confidence: number;
    label: string;
  };
  weatherData: {
    matched: boolean;
    description: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  score?: number | null;
  aiScore?: number | null;
  spatialScore?: number | null;
  reputationScore?: number | null;
  createdAt: string;
  message?: string;
}

export interface UserReportApiResponse {
  id: string;
  reportId: string;
  userId: string;
  description: string;
  imageUrls: string;
  severityLevel: string;
  lat: number;
  lon: number;
  status: string;
  score?: number | null;
  aiScore?: number | null;
  spatialScore?: number | null;
  reputationScore?: number | null;
  createdAt: string;
  message?: string;
}

export interface ReportFilterRequest {
  page?: number;
  size?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  severityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}
