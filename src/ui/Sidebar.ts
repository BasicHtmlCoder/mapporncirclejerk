import { AppState } from '../state/AppState';
import { MapManager } from '../map/MapManager';
import { ColorPalette } from './ColorPalette';
import { SearchBox } from './SearchBox';

export class Sidebar {
  private container: HTMLElement;
  private state: AppState;
  private mapManager: MapManager;

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

    // Color palette
    const paletteContainer = document.createElement('div');
    paletteContainer.className = 'sidebar-section';
    new ColorPalette(paletteContainer, this.state);
    this.container.appendChild(paletteContainer);

    // Instructions
    const instructions = document.createElement('div');
    instructions.className = 'sidebar-section instructions';
    instructions.innerHTML = `
      <h3>🤓 How to Make Cursed Maps</h3>
      <ol>
        <li>🎨 Pick a color (the weirder, the better!)</li>
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
}
