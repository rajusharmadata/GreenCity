import { create } from 'zustand';

export interface ActiveEcoJourney {
  route: { mode: string; distanceKm: number; durationMin: number };
  destinationAddress: string;
  toLat: number;
  toLng: number;
  fromLat: number;
  fromLng: number;
  polylineCoords: { latitude: number; longitude: number }[];
}

interface EcoRouteStore {
  activeJourney: ActiveEcoJourney | null;
  setActiveJourney: (j: ActiveEcoJourney | null) => void;
}

export const useEcoRouteStore = create<EcoRouteStore>((set) => ({
  activeJourney: null,
  setActiveJourney: (activeJourney) => set({ activeJourney }),
}));
