# MapPornCircleJerk

Interactive map coloring tool for creating custom country maps. Select countries, apply colors, and export beautiful PNG images.

## Features

- **Country Selection**: Click countries directly on the map or search by name
- **Color Palette**: 12 preset colors optimized for map visualization
- **Real-time Search**: Find countries quickly with debounced search
- **PNG Export**: Export your colored map as a high-quality PNG image
- **State Persistence**: Your work is automatically saved to localStorage
- **Responsive Design**: Works on desktop and mobile devices

## 🎨 Technology Stack

- [Leaflet v1.9.4](http://leafletjs.com) - Interactive map magic ✨
- [TypeScript v5.1.6](https://www.typescriptlang.org) - Type-safe JavaScript 🛡️
- [Vite v4.5.3](https://vitejs.dev) - Blazingly fast build tool ⚡
- [leaflet.bigimage v1.0.1](https://github.com/pasichnykvasyl/Leaflet.BigImage) - Screenshot your masterpiece 📸
- [Natural Earth Data](https://www.naturalearthdata.com/) - Country boundaries 🌍

## Installation

Install dependencies:
```bash
npm install
```

## Development

Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## How to Use

1. **Select a Color**: Click on any color in the palette on the left sidebar
2. **Color Countries**: Click on countries on the map to apply the selected color
3. **Search**: Use the search box to quickly find and zoom to specific countries
4. **Export**: Click "Export as PNG" to download your map as an image
5. **Clear**: Use "Clear All Countries" to reset and start over

## Project Structure

```
mapporncirclejerk/
├── public/
│   └── data/
│       └── countries.geojson      # Natural Earth country boundaries
├── src/
│   ├── map/
│   │   └── MapManager.ts          # Leaflet map logic
│   ├── state/
│   │   └── AppState.ts            # Application state management
│   ├── types/
│   │   ├── index.ts                  # TypeScript type definitions
│   │   └── leaflet-bigimage.d.ts     # Type declaration for leaflet.bigimage
│   ├── ui/
│   │   ├── ColorPalette.ts           # Color selection component
│   │   ├── SearchBox.ts              # Country search component
│   │   └── Sidebar.ts                # Sidebar container
│   ├── utils/
│   │   └── geojson.ts             # GeoJSON loading utility
│   ├── main.ts                    # Application entry point
│   └── style.css                  # Global styles
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── vite.config.ts                 # Vite config
```

## Data Source

Country boundaries are from [Natural Earth](https://www.naturalearthdata.com/), a public domain map dataset. The 110m (1:110 million scale) resolution is used for optimal performance and file size.

## License

MIT

Original starter template: Copyright (c) 2018-2023 Yasunori Kirimoto
