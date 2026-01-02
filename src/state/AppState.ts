import { CountryState, COLOR_PALETTE, FLAG_PALETTE, PaintMode } from '../types';

export class AppState {
  private countries: Map<string, CountryState> = new Map();
  private selectedColor: string | null = COLOR_PALETTE[0];
  private selectedFlag: string | null = FLAG_PALETTE[0];
  private paintMode: PaintMode = 'color';
  private listeners: Set<(countryId: string, color: string | null) => void> = new Set();

  constructor() {
    // Initialize with first color and flag from palettes
    this.selectedColor = COLOR_PALETTE[0];
    this.selectedFlag = FLAG_PALETTE[0];
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

  // Flag management
  setCountryFlag(countryId: string, flag: string | null): void {
    const country = this.countries.get(countryId);
    if (country) {
      country.flag = flag;
      this.notifyListeners(countryId, flag);
    }
  }

  getCountryFlag(countryId: string): string | null {
    const country = this.countries.get(countryId);
    return country?.flag || null;
  }

  clearCountryFlag(countryId: string): void {
    this.setCountryFlag(countryId, null);
  }

  clearAllFlags(): void {
    this.countries.forEach((country) => {
      country.flag = null;
    });
    this.notifyListeners('*', null);
  }

  getAllFlaggedCountries(): CountryState[] {
    return Array.from(this.countries.values()).filter(
      (country) => country.flag !== null
    );
  }

  // Selected flag (from palette)
  setSelectedFlag(flag: string | null): void {
    this.selectedFlag = flag;
  }

  getSelectedFlag(): string | null {
    return this.selectedFlag;
  }

  // Paint mode (color or flag)
  setPaintMode(mode: PaintMode): void {
    this.paintMode = mode;
  }

  getPaintMode(): PaintMode {
    return this.paintMode;
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
    const paintedCountries = Array.from(this.countries.values())
      .filter((country) => country.color !== null || country.flag !== null)
      .map((country) => ({
        id: country.id,
        color: country.color,
        flag: country.flag,
      }));

    const state = {
      countries: paintedCountries,
      paintMode: this.paintMode,
    };

    localStorage.setItem('mapporncirclejerk-state', JSON.stringify(state));
  }

  loadFromLocalStorage(): void {
    const saved = localStorage.getItem('mapporncirclejerk-state');
    if (saved) {
      try {
        const data = JSON.parse(saved);

        // Support legacy format (array of colored countries)
        if (Array.isArray(data)) {
          data.forEach((item: { id: string; color: string | null }) => {
            this.setCountryColor(item.id, item.color);
          });
        } else {
          // New format with paint mode
          if (data.paintMode) {
            this.paintMode = data.paintMode;
          }
          if (data.countries) {
            data.countries.forEach((item: { id: string; color: string | null; flag: string | null }) => {
              if (item.color) {
                this.setCountryColor(item.id, item.color);
              }
              if (item.flag) {
                this.setCountryFlag(item.id, item.flag);
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
      }
    }
  }

  // Export state as JSON
  exportState(): string {
    const paintedCountries = Array.from(this.countries.values())
      .filter((country) => country.color !== null || country.flag !== null)
      .map((country) => ({
        id: country.id,
        name: country.name,
        color: country.color,
        flag: country.flag,
      }));

    return JSON.stringify({
      paintMode: this.paintMode,
      countries: paintedCountries,
    }, null, 2);
  }

  // Import state from JSON
  importState(json: string): void {
    try {
      const data = JSON.parse(json);

      this.clearAllColors();
      this.clearAllFlags();

      // Support legacy format
      if (Array.isArray(data)) {
        data.forEach((item: { id: string; color: string | null }) => {
          this.setCountryColor(item.id, item.color);
        });
      } else {
        if (data.paintMode) {
          this.paintMode = data.paintMode;
        }
        if (data.countries) {
          data.countries.forEach((item: { id: string; color: string | null; flag: string | null }) => {
            if (item.color) {
              this.setCountryColor(item.id, item.color);
            }
            if (item.flag) {
              this.setCountryFlag(item.id, item.flag);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to import state:', error);
      throw new Error('Invalid state JSON');
    }
  }
}
