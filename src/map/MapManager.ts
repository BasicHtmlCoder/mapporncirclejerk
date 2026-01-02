import * as L from 'leaflet';
import 'leaflet.bigimage/dist/Leaflet.BigImage.min.js';
import 'leaflet.bigimage/dist/Leaflet.BigImage.min.css';
import { AppState } from '../state/AppState';
import { CountryProperties, CountryState, DEFAULT_CONFIG } from '../types';

export class MapManager {
  private map: L.Map;
  private state: AppState;
  private layerMap: Map<string, L.Layer> = new Map();
  private svgOverlay: SVGSVGElement | null = null;
  private flagPatterns: Map<string, string> = new Map();

  constructor(containerId: string, state: AppState) {
    this.state = state;

    // Initialize Leaflet map
    this.map = L.map(containerId, {
      center: DEFAULT_CONFIG.mapCenter,
      zoom: DEFAULT_CONFIG.mapZoom,
      minZoom: DEFAULT_CONFIG.minZoom,
      maxZoom: DEFAULT_CONFIG.maxZoom,
      zoomControl: true,
      worldCopyJump: false, // Prevent world wrapping
      maxBounds: [[-85, -180], [85, 180]], // Constrain to valid tile bounds
      maxBoundsViscosity: 1.0, // Make bounds hard limit
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      crossOrigin: 'anonymous',
      noWrap: true,
      bounds: [[-85, -180], [85, 180]], // Limit tile loading to valid range
      minZoom: DEFAULT_CONFIG.minZoom,
      maxZoom: DEFAULT_CONFIG.maxZoom,
    }).addTo(this.map);

    // Add scale control
    L.control
      .scale({
        imperial: false,
        maxWidth: 300,
      })
      .addTo(this.map);

    // Add BigImage export control
    const bigImageControl = (L as any).control.BigImage({
      position: 'topright',
      printControlLabel: '📸',
      printControlTitle: 'Screenshot your masterpiece!',
      maxScale: 5,
      minScale: 1,
      inputTitle: '🔥 How big? (1-5):',
      downloadTitle: '💾 Yoink!'
    }).addTo(this.map);

    // Fix BigImage library to properly handle MultiPolygon geometries
    // The original library only renders the first polygon, missing islands and territories
    bigImageControl._getPathLayer = function(layer: any, resolve: any) {
      const self = this;
      let correct = 0;
      const allParts: any[] = [];

      if (layer._mRadius || !layer._latlngs) {
        resolve();
        return;
      }

      // Helper function to process latlngs recursively for MultiPolygon support
      const processLatLngs = (latlngs: any, depth: number): void => {
        if (!latlngs || latlngs.length === 0) return;

        // Check if this is an array of coordinates or nested arrays
        const firstItem = latlngs[0];

        if (firstItem && typeof firstItem.lat !== 'undefined' && typeof firstItem.lng !== 'undefined') {
          // This is an array of LatLng objects - process them
          const parts: any[] = [];
          latlngs.forEach((latLng: any) => {
            const pixelPoint = self._map.project(latLng);
            const adjustedPoint = pixelPoint.subtract(new (L as any).Point(self.bounds.min.x, self.bounds.min.y));
            parts.push(adjustedPoint);
            if (adjustedPoint.x < self.canvas.width && adjustedPoint.y < self.canvas.height) {
              correct = 1;
            }
          });
          if (parts.length > 0) {
            allParts.push({
              parts: parts,
              closed: layer.options.fill
            });
          }
        } else if (Array.isArray(firstItem)) {
          // This is nested arrays - recurse into each
          latlngs.forEach((subLatLngs: any) => {
            processLatLngs(subLatLngs, depth + 1);
          });
        }
      };

      // Process all polygons in the layer
      processLatLngs(layer._latlngs, 0);

      // Store all parts for rendering
      if (correct && allParts.length > 0) {
        self.path[layer._leaflet_id] = {
          multiParts: allParts,
          options: layer.options
        };
      }
      resolve();
    };

    // Also patch the _drawPath method to handle multiple parts
    const originalDrawPath = bigImageControl._drawPath.bind(bigImageControl);
    bigImageControl._drawPath = function(value: any) {
      if (value.multiParts) {
        // Draw each part of the MultiPolygon
        value.multiParts.forEach((partData: any) => {
          this.ctx.beginPath();
          let count = 0;
          partData.parts.forEach((point: any) => {
            this.ctx[count++ ? 'lineTo' : 'moveTo'](point.x, point.y);
          });
          if (partData.closed) this.ctx.closePath();
          this._feelPath(value.options);
        });
      } else {
        // Use original method for simple polygons
        originalDrawPath(value);
      }
    };

    // Prepare map for export when export button is clicked
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target as HTMLElement;
      // Check if the click is on the export button
      if (target && (target.id === 'print-btn' || target.closest('#print-btn'))) {
        this.prepareForExport();
      }
    });

    // Initialize SVG overlay for flag patterns
    this.initializeSVGOverlay();

    // Listen for state changes
    this.state.addListener((countryId, _color) => {
      if (countryId === '*') {
        // All countries changed, update all layers
        this.updateAllCountryStyles();
      } else {
        this.updateCountryStyle(countryId);
      }
    });
  }

  private initializeSVGOverlay(): void {
    // Get the map's SVG overlay or create one
    // const mapContainer = this.map.getContainer();
    const panes = (this.map as any)._panes;

    // Look for existing SVG in overlay pane
    let svgElement = panes.overlayPane.querySelector('svg');

    if (!svgElement) {
      // If no SVG exists, we'll create patterns in the first GeoJSON layer's SVG
      // This will be done when layers are added
      return;
    }

    this.svgOverlay = svgElement;
    this.ensureSVGDefs();
  }

  private ensureSVGDefs(): void {
    if (!this.svgOverlay) return;

    let defs = this.svgOverlay.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.svgOverlay.insertBefore(defs, this.svgOverlay.firstChild);
    }
  }

  private createFlagPattern(flagCode: string): string {
    const patternId = `flag-pattern-${flagCode.toLowerCase()}`;

    // Check if pattern already exists
    if (this.flagPatterns.has(flagCode)) {
      return this.flagPatterns.get(flagCode)!;
    }

    // Find or create SVG element with defs
    const mapContainer = this.map.getContainer();
    const panes = (this.map as any)._panes;
    let svgElement = panes.overlayPane.querySelector('svg');

    if (!svgElement) {
      // Create a hidden SVG element for patterns
      svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.style.position = 'absolute';
      svgElement.style.width = '0';
      svgElement.style.height = '0';
      mapContainer.appendChild(svgElement);
    }

    this.svgOverlay = svgElement;
    this.ensureSVGDefs();

    const defs = this.svgOverlay!.querySelector('defs')!;

    // Check if pattern already exists in DOM
    if (defs.querySelector(`#${patternId}`)) {
      this.flagPatterns.set(flagCode, patternId);
      return patternId;
    }

    // Create pattern element with repeating tiles
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', patternId);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '60');  // Tile size in pixels
    pattern.setAttribute('height', '40'); // Tile size in pixels (3:2 flag ratio)
    pattern.setAttribute('patternTransform', 'scale(1)');

    // Create image element with flag
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', `https://flagcdn.com/w160/${flagCode.toLowerCase()}.png`);
    image.setAttribute('width', '60');
    image.setAttribute('height', '40');
    image.setAttribute('preserveAspectRatio', 'none'); // Stretch to fit tile

    pattern.appendChild(image);
    defs.appendChild(pattern);

    this.flagPatterns.set(flagCode, patternId);
    return patternId;
  }

  loadCountries(geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProperties>): void {
    // Filter out features with null geometries
    const validFeatures = geojson.features.filter(feature => {
      if (!feature.geometry) {
        console.warn(`Skipping feature with null geometry: ${feature.properties?.NAME}`);
        return false;
      }
      // Check if geometry has coordinates (handles all geometry types except GeometryCollection)
      const geom = feature.geometry as any;
      if (geom.type !== 'GeometryCollection' && (!geom.coordinates || geom.coordinates.length === 0)) {
        console.warn(`Skipping feature with empty coordinates: ${feature.properties?.NAME}`);
        return false;
      }
      return true;
    });

    // Add countries to state
    validFeatures.forEach((feature) => {
      const props = feature.properties;
      const countryId = this.getCountryId(props);

      // Log countries using fallback IDs
      if (props.ISO_A3 && (props.ISO_A3 === '-99' || props.ISO_A3 === '-1' || props.ISO_A3.startsWith('-'))) {
        console.log(`Using fallback ID for ${props.NAME}: ${countryId} (original ISO_A3: ${props.ISO_A3})`);
      }

      const countryState: CountryState = {
        id: countryId,
        name: props.NAME || props.NAME_LONG || props.ADMIN,
        color: null,
        flag: null,
        feature: feature,
      };
      this.state.addCountry(countryState);
    });

    // Create GeoJSON layer with filtered features
    const filteredGeojson = {
      ...geojson,
      features: validFeatures
    };

    L.geoJSON(filteredGeojson, {
      style: (feature) => this.getCountryStyle(feature),
      onEachFeature: (feature, layer) => this.onEachCountry(feature, layer),
    }).addTo(this.map);

    console.log(`Loaded ${this.state.getAllCountries().length} countries`);
  }

  private getCountryStyle(feature?: GeoJSON.Feature<GeoJSON.Geometry, CountryProperties>): L.PathOptions {
    if (!feature) {
      return this.getDefaultStyle();
    }

    const countryId = this.getCountryId(feature.properties);
    const color = this.state.getCountryColor(countryId);
    const flag = this.state.getCountryFlag(countryId);

    // If flag is set, use pattern fill
    if (flag) {
      const patternId = this.createFlagPattern(flag);
      return {
        fillColor: `url(#${patternId})`,
        fillOpacity: 0.9,
        color: '#ffffff',
        weight: 1,
        className: 'flag-filled',
      };
    }

    // Otherwise use color
    return {
      fillColor: color || '#d3d3d3',
      fillOpacity: 0.7,
      color: '#ffffff',
      weight: 1,
    };
  }

  private getDefaultStyle(): L.PathOptions {
    return {
      fillColor: '#d3d3d3',
      fillOpacity: 0.7,
      color: '#ffffff',
      weight: 1,
    };
  }

  // Helper method to generate consistent country IDs
  private getCountryId(props: CountryProperties): string {
    let countryId = props.ISO_A3;
    if (!countryId || countryId === '-99' || countryId === '-1' || countryId.startsWith('-')) {
      countryId = (props.NAME || props.NAME_LONG || props.ADMIN).replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    }
    return countryId;
  }

  private onEachCountry(feature: GeoJSON.Feature<GeoJSON.Geometry, CountryProperties>, layer: L.Layer): void {
    const countryId = this.getCountryId(feature.properties);
    const countryName = feature.properties.NAME || feature.properties.NAME_LONG || feature.properties.ADMIN;

    // Store layer reference
    this.layerMap.set(countryId, layer);

    // Bind tooltip once (don't open it yet)
    if (layer instanceof L.Path) {
      layer.bindTooltip(countryName, {
        permanent: false,
        sticky: true,
      });
    }

    // Add hover effects
    layer.on({
      mouseover: (e) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillOpacity: 0.9,
        });
        target.bringToFront();

        // Open tooltip on hover
        target.openTooltip();
      },
      mouseout: (e) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillOpacity: 0.7,
        });
        target.closeTooltip();
      },
      click: () => {
        // Apply color or flag based on paint mode
        if (this.state.getPaintMode() === 'color') {
          const selectedColor = this.state.getSelectedColor();
          this.state.setCountryColor(countryId, selectedColor);
          // Clear flag if switching to color
          this.state.clearCountryFlag(countryId);
        } else {
          const selectedFlag = this.state.getSelectedFlag();
          this.state.setCountryFlag(countryId, selectedFlag);
          // Clear color if switching to flag
          this.state.clearCountryColor(countryId);
        }

        // Save to localStorage after each change
        this.state.saveToLocalStorage();
      },
    });

    // Set cursor to pointer
    if (layer instanceof L.Path) {
      layer.on('mouseover', () => {
        const container = this.map.getContainer();
        container.style.cursor = 'pointer';
      });
      layer.on('mouseout', () => {
        const container = this.map.getContainer();
        container.style.cursor = '';
      });
    }
  }

  updateCountryStyle(countryId: string): void {
    const layer = this.layerMap.get(countryId);
    if (layer && layer instanceof L.Path) {
      const country = this.state.getCountry(countryId);
      if (country) {
        const style = this.getCountryStyle(country.feature);
        layer.setStyle(style);
      }
    }
  }

  updateAllCountryStyles(): void {
    this.state.getAllCountries().forEach((country) => {
      this.updateCountryStyle(country.id);
    });
  }

  zoomToCountry(countryId: string): void {
    const layer = this.layerMap.get(countryId);
    if (layer && 'getBounds' in layer) {
      const bounds = (layer as any).getBounds();
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 5,
      });
    }
  }

  closeAllTooltips(): void {
    this.layerMap.forEach((layer) => {
      if (layer instanceof L.Path) {
        layer.closeTooltip();
      }
    });
  }

  prepareForExport(): void {
    // Close all tooltips
    this.closeAllTooltips();

    // Refresh all layer styles to ensure they're captured correctly
    this.layerMap.forEach((layer, countryId) => {
      if (layer instanceof L.Path) {
        const country = this.state.getCountry(countryId);
        if (country) {
          const color = this.state.getCountryColor(countryId);
          const flag = this.state.getCountryFlag(countryId);

          let fillColor = color || '#d3d3d3';
          let fillOpacity = 0.7;

          // Use flag pattern if flag is set
          if (flag) {
            const patternId = this.createFlagPattern(flag);
            fillColor = `url(#${patternId})`;
            fillOpacity = 0.9;
          }

          const style = {
            fill: true,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            stroke: true,
            color: '#ffffff',
            weight: 1,
            opacity: 1,
          };
          layer.setStyle(style);
          // Ensure the options are also set
          layer.options = { ...layer.options, ...style };
        }
      }
    });
  }

  getMap(): L.Map {
    return this.map;
  }
}
