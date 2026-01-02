import { AppState } from '../state/AppState';
import { FLAG_PALETTE } from '../types';

export class FlagPalette {
  private container: HTMLElement;
  private state: AppState;

  constructor(container: HTMLElement, state: AppState) {
    this.container = container;
    this.state = state;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'flag-palette';

    const title = document.createElement('h3');
    title.textContent = '🏴 Choose Your Flag';
    this.container.appendChild(title);

    const paletteGrid = document.createElement('div');
    paletteGrid.className = 'palette-grid';

    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'flag-swatch clear-swatch';
    clearButton.textContent = '🧹 Erase';
    clearButton.title = 'Eraser mode (click countries to yeet their flag)';
    clearButton.dataset.flag = 'clear';

    // Mark as selected if current mode is clear
    if (this.state.getSelectedFlag() === null) {
      clearButton.classList.add('selected');
    }

    clearButton.addEventListener('click', () => {
      this.selectFlag(null);
    });
    paletteGrid.appendChild(clearButton);

    // Add flag swatches
    FLAG_PALETTE.forEach((flagCode) => {
      const swatch = document.createElement('button');
      swatch.className = 'flag-swatch';
      swatch.title = flagCode;
      swatch.dataset.flag = flagCode;

      // Create flag image using flagcdn.com
      const flagImg = document.createElement('img');
      flagImg.src = `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
      flagImg.alt = flagCode;
      flagImg.loading = 'lazy';
      swatch.appendChild(flagImg);

      // Mark as selected if it matches current flag
      if (flagCode === this.state.getSelectedFlag()) {
        swatch.classList.add('selected');
      }

      swatch.addEventListener('click', () => {
        this.selectFlag(flagCode);
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
        this.state.clearAllFlags();
        this.state.saveToLocalStorage();
      }
    });

    clearAllContainer.appendChild(clearAllButton);
    this.container.appendChild(clearAllContainer);
  }

  private selectFlag(flag: string | null): void {
    this.state.setSelectedFlag(flag);

    // Update UI to show selected flag
    const swatches = this.container.querySelectorAll('.flag-swatch');
    swatches.forEach((swatch) => {
      swatch.classList.remove('selected');
      const swatchFlag = (swatch as HTMLElement).dataset.flag;

      if (flag === null && swatchFlag === 'clear') {
        swatch.classList.add('selected');
      } else if (flag !== null && swatchFlag === flag) {
        swatch.classList.add('selected');
      }
    });
  }
}
