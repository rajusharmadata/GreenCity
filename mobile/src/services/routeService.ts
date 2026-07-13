import api from '../utils/api';

export interface FindRoutesParams {
  fromLat: number;
  fromLng: number;
  toAddress: string;
}

export interface RouteOption {
  id: string;
  mode: string;
  distanceKm: number;
  durationMin: number;
  ecoScore: number;
  co2SavedKg: number;
  geometry?: { coordinates?: [number, number][] };
  polyline?: { latitude: number; longitude: number }[];
}

export interface FindRoutesResponse {
  options: RouteOption[];
  destinationCoords: { latitude: number; longitude: number };
  destinationLabel: string;
}

export async function findRoutes(params: FindRoutesParams): Promise<FindRoutesResponse> {
  const { data } = await api.post<FindRoutesResponse>('/routes/find', params);
  return data;
}

export interface CompleteRouteParams {
  mode: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  distanceKm: number;
  durationMin: number;
}

export interface CompleteRouteResponse {
  message: string;
  pointsEarned: number;
  totalPoints?: number;
  history: unknown;
}

export async function completeRoute(params: CompleteRouteParams): Promise<CompleteRouteResponse> {
  const { data } = await api.post<CompleteRouteResponse>('/routes/complete', params);
  return data;
}
