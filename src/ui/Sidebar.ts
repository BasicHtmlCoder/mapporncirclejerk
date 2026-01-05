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

    // Donation hint
    const donation = document.createElement('div');
    donation.className = 'sidebar-section donation';
    donation.innerHTML = `
      <h3>💝 Support This Project</h3>
      <p style="font-size: 13px; margin-bottom: 8px; ">
        Enjoying the chaos? Consider supporting development!
      </p>
      <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 12px; margin-top: 8px;">
        <p style="font-size: 11px; margin-bottom: 6px;">Solana Address:</p>
        <div style="display: flex; align-items: center; gap: 8px;">
          <code style="flex: 1; font-size: 11px; word-break: break-all; display: block; background: rgba(0, 0, 0, 0.5); padding: 8px; border-radius: 4px; color: #e0e7ff;">8SBBer4fSou5VSprW49qdRY7SV9CucPPot7dzeRawkwg</code>
          <button id="copy-solana-btn" style="padding: 8px 12px; background: rgba(99, 102, 241, 0.8); border: none; border-radius: 4px; cursor: pointer; font-size: 12px; color: white; white-space: nowrap; transition: background 0.2s;">Copy</button>
        </div>
      </div>
    `;
    this.container.appendChild(donation);

    // Add copy button functionality
    const copyBtn = document.getElementById('copy-solana-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('8SBBer4fSou5VSprW49qdRY7SV9CucPPot7dzeRawkwg').then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.style.background = 'rgba(34, 197, 94, 0.8)';
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'rgba(99, 102, 241, 0.8)';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      });
    }
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
