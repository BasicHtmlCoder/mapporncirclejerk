import { AppState } from '../state/AppState';
import { COLOR_PALETTE } from '../types';

export class ColorPalette {
  private container: HTMLElement;
  private state: AppState;

  constructor(container: HTMLElement, state: AppState) {
    this.container = container;
    this.state = state;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'color-palette';

    const title = document.createElement('h3');
    title.textContent = '🎨 Choose Your Weapon';
    this.container.appendChild(title);

    const paletteGrid = document.createElement('div');
    paletteGrid.className = 'palette-grid';

    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'color-swatch clear-swatch';
    clearButton.textContent = '🧹 Erase';
    clearButton.title = 'Eraser mode (click countries to yeet their color)';
    clearButton.dataset.color = 'clear';

    // Mark as selected if current mode is clear
    if (this.state.getSelectedColor() === null) {
      clearButton.classList.add('selected');
    }

    clearButton.addEventListener('click', () => {
      this.selectColor(null);
    });
    paletteGrid.appendChild(clearButton);

    // Add color swatches
    COLOR_PALETTE.forEach((color) => {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.title = color;
      swatch.dataset.color = color; // Store color as data attribute for comparison

      // Mark as selected if it matches current color
      if (color === this.state.getSelectedColor()) {
        swatch.classList.add('selected');
      }

      swatch.addEventListener('click', () => {
        this.selectColor(color);
      });

      paletteGrid.appendChild(swatch);
    });

    this.container.appendChild(paletteGrid);

    // Add clear all button
    const clearAllContainer = document.createElement('div');
    clearAllContainer.className = 'clear-all-container';

    const clearAllButton = document.createElement('button');
    clearAllButton.className = 'btn-clear-all';
    clearAllButton.textContent = '🗑️ Nuke Everything';
    clearAllButton.addEventListener('click', () => {
      if (confirm('🚨 About to delete your masterpiece. Ready to start fresh?')) {
        this.state.clearAllColors();
        this.state.saveToLocalStorage();
      }
    });

    clearAllContainer.appendChild(clearAllButton);
    this.container.appendChild(clearAllContainer);
  }

  private selectColor(color: string | null): void {
    this.state.setSelectedColor(color);

    // Update UI to show selected color
    const swatches = this.container.querySelectorAll('.color-swatch');
    swatches.forEach((swatch) => {
      swatch.classList.remove('selected');
      const swatchColor = (swatch as HTMLElement).dataset.color;

      if (color === null && swatchColor === 'clear') {
        swatch.classList.add('selected');
      } else if (color !== null && swatchColor === color) {
        swatch.classList.add('selected');
      }
    });
  }
}
