/**
 * Location Types
 */

export interface LocationCoordinates {
  lat: number;
  lon: number;
}

export interface LocationUpdatePayload extends LocationCoordinates {
  timestamp?: string;
}

export interface LocationApiResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    location: LocationCoordinates;
    updatedAt: string;
  };
}
