import { CountryState, COLOR_PALETTE } from '../types';

export class AppState {
  private countries: Map<string, CountryState> = new Map();
  private selectedColor: string | null = COLOR_PALETTE[0];
  private listeners: Set<(countryId: string, color: string | null) => void> = new Set();

  constructor() {
    // Initialize with first color from palette
    this.selectedColor = COLOR_PALETTE[0];
  }

  // Country management
  addCountry(country: CountryState): void {
    this.countries.set(country.id, country);
  }

  getCountry(countryId: string): CountryState | undefined {
    return this.countries.get(countryId);
  }

  getAllCountries(): CountryState[] {
    return Array.from(this.countries.values());
  }

  // Color management
  setCountryColor(countryId: string, color: string | null): void {
    const country = this.countries.get(countryId);
    if (country) {
      country.color = color;
      this.notifyListeners(countryId, color);
    }
  }

  getCountryColor(countryId: string): string | null {
    const country = this.countries.get(countryId);
    return country?.color || null;
  }

  clearCountryColor(countryId: string): void {
    this.setCountryColor(countryId, null);
  }

  clearAllColors(): void {
    this.countries.forEach((country) => {
      country.color = null;
    });
    this.notifyListeners('*', null); // Notify all countries changed
  }

  getAllColoredCountries(): CountryState[] {
    return Array.from(this.countries.values()).filter(
      (country) => country.color !== null
    );
  }

  // Selected color (from palette)
  setSelectedColor(color: string | null): void {
    this.selectedColor = color;
  }

  getSelectedColor(): string | null {
    return this.selectedColor;
  }

  // Event listeners for state changes
  addListener(listener: (countryId: string, color: string | null) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (countryId: string, color: string | null) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(countryId: string, color: string | null): void {
    this.listeners.forEach((listener) => listener(countryId, color));
  }

  // State persistence (localStorage)
  saveToLocalStorage(): void {
    const coloredCountries = this.getAllColoredCountries().map((country) => ({
      id: country.id,
      color: country.color,
    }));
    localStorage.setItem('mapporncirclejerk-state', JSON.stringify(coloredCountries));
  }

  loadFromLocalStorage(): void {
    const saved = localStorage.getItem('mapporncirclejerk-state');
    if (saved) {
      try {
        const coloredCountries = JSON.parse(saved) as Array<{
          id: string;
          color: string | null;
        }>;
        coloredCountries.forEach((item) => {
          this.setCountryColor(item.id, item.color);
        });
      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
      }
    }
  }

  // Export state as JSON
  exportState(): string {
    const coloredCountries = this.getAllColoredCountries().map((country) => ({
      id: country.id,
      name: country.name,
      color: country.color,
    }));
    return JSON.stringify(coloredCountries, null, 2);
  }

  // Import state from JSON
  importState(json: string): void {
    try {
      const coloredCountries = JSON.parse(json) as Array<{
        id: string;
        color: string | null;
      }>;
      this.clearAllColors();
      coloredCountries.forEach((item) => {
        this.setCountryColor(item.id, item.color);
      });
    } catch (error) {
      console.error('Failed to import state:', error);
      throw new Error('Invalid state JSON');
    }
  }
}
