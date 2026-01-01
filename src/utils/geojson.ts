import { CountryProperties } from '../types';

export async function loadCountriesGeoJSON(): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProperties>> {
  try {
    const response = await fetch('/data/countries.geojson');
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
    }
    const data = await response.json();
    return data as GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProperties>;
  } catch (error) {
    console.error('Error loading countries GeoJSON:', error);
    throw error;
  }
}
