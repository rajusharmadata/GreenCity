import api from '../utils/api';

export interface SubmitReportPayload {
  imageUri: string;
  lat: number;
  lng: number;
  address: string;
}

export interface SubmitReportResponse {
  report: unknown;
  pointsEarned: number;
  totalPoints?: number;
  ai: {
    category: string;
    severity: string;
    description?: string;
    suggestedAction?: string;
    isEnvironmentalIssue?: boolean;
    confidence?: number | null;
  };
}

export async function submitReport(payload: SubmitReportPayload): Promise<SubmitReportResponse> {
  const formData = new FormData();
  // @ts-ignore - React Native FormData accepts object with uri, type, name
  formData.append('image', {
    uri: payload.imageUri,
    type: 'image/jpeg',
    name: 'report.jpg',
  });
  formData.append('lat', String(payload.lat));
  formData.append('lng', String(payload.lng));
  formData.append('address', payload.address);

  const { data } = await api.post<SubmitReportResponse>('/reports/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchMyReports(): Promise<{ reports: unknown[] }> {
  const { data } = await api.get<{ reports: unknown[] }>('/reports/my-reports');
  return data;
}
