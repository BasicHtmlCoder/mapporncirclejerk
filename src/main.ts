import './style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AppState } from './state/AppState';
import { MapManager } from './map/MapManager';
import { Sidebar } from './ui/Sidebar';
import { loadCountriesGeoJSON } from './utils/geojson';

// Set Leaflet icon path
L.Icon.Default.imagePath = 'img/icon/';

// Application initialization
async function initApp() {
  try {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = '🌍 Loading countries';
    document.body.appendChild(loadingDiv);

    // Initialize state
    const state = new AppState();

    // Initialize map
    const mapManager = new MapManager('map', state);

    // Load GeoJSON data
    const geojson = await loadCountriesGeoJSON();
    mapManager.loadCountries(geojson);

    // Load saved state from localStorage
    state.loadFromLocalStorage();

    // Initialize UI
    new Sidebar('sidebar', state, mapManager);

    // Remove loading indicator
    document.body.removeChild(loadingDiv);

    console.log('🗺️ MapPornCircleJerk initialized successfully! Time to create some chaos! 🎨');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    alert('😱 Oops! Something went wrong. Try refreshing the page!');
  }
}

// Start the app
initApp();
