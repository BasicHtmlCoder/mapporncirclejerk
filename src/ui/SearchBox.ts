import { AppState } from '../state/AppState';
import { MapManager } from '../map/MapManager';

export class SearchBox {
  private container: HTMLElement;
  private state: AppState;
  private mapManager: MapManager;
  private searchTimeout: number | null = null;

  constructor(container: HTMLElement, state: AppState, mapManager: MapManager) {
    this.container = container;
    this.state = state;
    this.mapManager = mapManager;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'search-box';

    const title = document.createElement('h3');
    title.textContent = '🔍 Find Your Target';
    this.container.appendChild(title);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Where in the world is... 🌍';
    input.className = 'search-input';

    const resultsList = document.createElement('div');
    resultsList.className = 'search-results';

    input.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value.toLowerCase().trim();

      // Debounce search
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = window.setTimeout(() => {
        this.performSearch(searchTerm, resultsList);
      }, 300);
    });

    this.container.appendChild(input);
    this.container.appendChild(resultsList);
  }

  private performSearch(searchTerm: string, resultsList: HTMLElement): void {
    resultsList.innerHTML = '';

    if (searchTerm.length < 2) {
      return;
    }

    const countries = this.state.getAllCountries();
    const matches = countries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm)
    );

    if (matches.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'search-result-item no-results';
      noResults.textContent = '🤷 Country not found (did you make that up?)';
      resultsList.appendChild(noResults);
      return;
    }

    // Limit to 10 results
    matches.slice(0, 10).forEach((country) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';

      // Show color indicator if country is colored
      if (country.color) {
        const colorIndicator = document.createElement('span');
        colorIndicator.className = 'color-indicator';
        colorIndicator.style.backgroundColor = country.color;
        resultItem.appendChild(colorIndicator);
      }

      const countryName = document.createElement('span');
      countryName.textContent = country.name;
      resultItem.appendChild(countryName);

      resultItem.addEventListener('click', () => {
        // Zoom to country
        this.mapManager.zoomToCountry(country.id);

        // Apply current color
        const selectedColor = this.state.getSelectedColor();
        this.state.setCountryColor(country.id, selectedColor);
        this.state.saveToLocalStorage();

        // Clear search
        const input = this.container.querySelector('.search-input') as HTMLInputElement;
        if (input) {
          input.value = '';
        }
        resultsList.innerHTML = '';
      });

      resultsList.appendChild(resultItem);
    });
  }
}
