import { AppState } from '../state/AppState';
import { MapManager } from '../map/MapManager';
import { ColorPalette } from './ColorPalette';
import { FlagPalette } from './FlagPalette';
import { SearchBox } from './SearchBox';

export class Sidebar {
  private container: HTMLElement;
  private state: AppState;
  private mapManager: MapManager;
  private paletteContainer: HTMLElement | null = null;

  constructor(containerId: string, state: AppState, mapManager: MapManager) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = container;
    this.state = state;
    this.mapManager = mapManager;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'sidebar';

    // Title
    const header = document.createElement('div');
    header.className = 'sidebar-header';

    const title = document.createElement('h1');
    title.textContent = '🗺️ MapPornCircleJerk';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'subtitle';
    subtitle.textContent = '🎨 Paint the world your way (no rules!)';
    header.appendChild(subtitle);

    this.container.appendChild(header);

    // Search box
    const searchContainer = document.createElement('div');
    searchContainer.className = 'sidebar-section';
    new SearchBox(searchContainer, this.state, this.mapManager);
    this.container.appendChild(searchContainer);

    // Mode toggle
    const modeToggleContainer = document.createElement('div');
    modeToggleContainer.className = 'sidebar-section mode-toggle-section';
    this.createModeToggle(modeToggleContainer);
    this.container.appendChild(modeToggleContainer);

    // Palette container (will hold either ColorPalette or FlagPalette)
    this.paletteContainer = document.createElement('div');
    this.paletteContainer.className = 'sidebar-section';
    this.renderPalette();
    this.container.appendChild(this.paletteContainer);

    // Instructions
    const instructions = document.createElement('div');
    instructions.className = 'sidebar-section instructions';
    instructions.innerHTML = `
      <h3>🤓 How to Make Cursed Maps</h3>
      <ol>
        <li>🎨 Pick a color or flag (the weirder, the better!)</li>
        <li>🖱️ Click countries like your life depends on it</li>
        <li>🔍 Can't find a country? Search is your friend!</li>
        <li>📸 Hit the camera button to flex your creation</li>
      </ol>
      <p style="margin-top: 12px; font-size: 12px; color: #9ca3af; font-style: italic;">
        ⚠️ Warning: May cause heated debates in comment sections
      </p>
    `;
    this.container.appendChild(instructions);
  }

  private createModeToggle(container: HTMLElement): void {
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'mode-toggle';

    const label = document.createElement('label');
    label.className = 'mode-toggle-label';

    const colorBtn = document.createElement('button');
    colorBtn.className = 'mode-btn' + (this.state.getPaintMode() === 'color' ? ' active' : '');
    colorBtn.textContent = '🎨 Colors';
    colorBtn.addEventListener('click', () => {
      this.state.setPaintMode('color');
      this.updateModeToggle();
      this.renderPalette();
    });

    const flagBtn = document.createElement('button');
    flagBtn.className = 'mode-btn' + (this.state.getPaintMode() === 'flag' ? ' active' : '');
    flagBtn.textContent = '🏴 Flags';
    flagBtn.addEventListener('click', () => {
      this.state.setPaintMode('flag');
      this.updateModeToggle();
      this.renderPalette();
    });

    label.appendChild(colorBtn);
    label.appendChild(flagBtn);
    toggleWrapper.appendChild(label);
    container.appendChild(toggleWrapper);
  }

  private updateModeToggle(): void {
    const buttons = this.container.querySelectorAll('.mode-btn');
    buttons.forEach((btn, index) => {
      const isActive = (index === 0 && this.state.getPaintMode() === 'color') ||
                       (index === 1 && this.state.getPaintMode() === 'flag');
      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private renderPalette(): void {
    if (!this.paletteContainer) return;

    this.paletteContainer.innerHTML = '';

    if (this.state.getPaintMode() === 'color') {
      new ColorPalette(this.paletteContainer, this.state);
    } else {
      new FlagPalette(this.paletteContainer, this.state);
    }
  }
}
