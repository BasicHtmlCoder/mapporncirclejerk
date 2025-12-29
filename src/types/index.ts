// Color palette for country selection
export const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E76F51', // Terracotta
  '#A8DADC', // Powder Blue
];

// GeoJSON properties from Natural Earth data
export interface CountryProperties {
  NAME: string;
  NAME_LONG: string;
  ABBREV: string;
  ISO_A3: string;
  ISO_A2: string;
  ADMIN: string;
  [key: string]: any;
}

// State for each country
export interface CountryState {
  id: string;           // ISO_A3 code
  name: string;         // Country name
  color: string | null; // Hex color or null if uncolored
  feature: GeoJSON.Feature<GeoJSON.Geometry, CountryProperties>;
}

// Event types for state changes
export type StateChangeEvent = CustomEvent<{
  countryId: string;
  color: string | null;
}>;

// Configuration for the application
export interface AppConfig {
  mapCenter: [number, number];
  mapZoom: number;
  minZoom: number;
  maxZoom: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  mapCenter: [20, 0],
  mapZoom: 2,
  minZoom: 1,
  maxZoom: 6,
};
