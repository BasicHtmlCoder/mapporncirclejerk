// Paint mode: color or flag
export type PaintMode = 'color' | 'flag';

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

// Flag palette for country selection (ISO_A2 codes)
export const FLAG_PALETTE = [
  'US', // United States
  'GB', // United Kingdom
  'FR', // France
  'DE', // Germany
  'IT', // Italy
  'ES', // Spain
  'RU', // Russia
  'CN', // China
  'JP', // Japan
  'BR', // Brazil
  'IN', // India
  'CA', // Canada
  'AU', // Australia
  'MX', // Mexico
  'KR', // South Korea
  'NL', // Netherlands
  'SE', // Sweden
  'NO', // Norway
  'TR', // Turkey
  'PL', // Poland
  'AR', // Argentina
  'ZA', // South Africa
  'EG', // Egypt
  'SA', // Saudi Arabia
  'UA', // Ukraine
  'ID', // Indonesia
  'TH', // Thailand
  'PH', // Philippines
  'VN', // Vietnam
  'CH', // Switzerland
  'AT', // Austria
  'BE', // Belgium
  'DK', // Denmark
  'FI', // Finland
  'GR', // Greece
  'PT', // Portugal
  'IE', // Ireland
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
  flag: string | null;  // ISO_A2 code for flag, or null
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
  mapZoom: 4,
  minZoom: 3,
  maxZoom: 5,
};
