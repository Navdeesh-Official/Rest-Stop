export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationSuggestion {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export interface Toilet {
  id: number | string;
  lat: number;
  lng: number;
  name?: string;
  access?: string; // 'yes', 'customers', 'private', 'permissive'
  fee?: string; // 'yes', 'no'
  wheelchair?: string; // 'yes', 'no', 'limited'
  opening_hours?: string;
  description?: string;
  distanceFromRoute?: number; // in meters
  isUserSubmitted?: boolean;
}

export interface RouteData {
  coordinates: Coordinates[];
  distance: number; // meters
  duration: number; // seconds
  bbox: [number, number, number, number]; // minLat, minLng, maxLat, maxLng
}

export interface AiAnalysis {
  advice: string;
  comfortRating: 'High' | 'Medium' | 'Low';
  longGaps: boolean;
}

export enum ViewState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  ROUTING = 'ROUTING',
  ANALYZING = 'ANALYZING',
  NAVIGATING = 'NAVIGATING',
}