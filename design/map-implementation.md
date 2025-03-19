# Map Implementation Documentation

## Overview

This document details the implementation of the world map visualization in the DST-CODAP plugin. The map has been updated to use a global equirectangular projection to properly display data points from anywhere on Earth.

## Equirectangular Projection

The map visualization now uses an equirectangular projection (also known as a plate carrée projection) which represents the Earth as a rectangle where:

- Longitude ranges from -180° (West) to +180° (East)
- Latitude ranges from -90° (South) to +90° (North)

This projection has a standard 2:1 width-to-height ratio, reflecting the fact that the Earth's longitude spans 360° while latitude spans 180°.

## Map Image

The map uses a world map image with the following properties:

- File: `WorldMapEquirectangular.png`
- Dimensions: 2048 x 1024 pixels (2:1 ratio)
- Format: PNG
- Projection: Equirectangular (plate carrée)
- Coordinate Range: -180° to 180° longitude, -90° to 90° latitude

## Key Changes

### 1. Constants and Configuration

The map's constants have been updated in `src/utilities/constants.ts`:

```typescript
// Constants for equirectangular world map
export const kBackgroundWidth = 2048;  // Width of map image
export const kBackgroundHeight = 1024; // Height (exactly half the width)
export const kBackgroundLongMax = 180;  // East boundary (180° East)
export const kBackgroundLongMin = -180; // West boundary (180° West)
const baseBackgroundLatMin = -90;  // South boundary (90° South)
const baseBackgroundLatMax = 90;   // North boundary (90° North)

// Derived constants for map positioning and scaling
export const kBackgroundLongRange = kBackgroundLongMax - kBackgroundLongMin;
export const kBackgroundLongMid = kBackgroundLongMin + kBackgroundLongRange / 2;
const baseBackgroundLatRange = baseBackgroundLatMax - baseBackgroundLatMin;
export const kBackgroundLatMid = baseBackgroundLatMin + baseBackgroundLatRange / 2;
export const kBackgroundLatRange = baseBackgroundLatRange; // For equirectangular, matches actual ratio
```

### 2. Map Rendering

The `MapPlane` component has been updated to properly handle the equirectangular projection:

```typescript
// Calculate the midpoints and ranges for proper positioning
const longRange = graph.absoluteMaxLongitude - graph.absoluteMinLongitude;
const latRange = graph.absoluteMaxLatitude - graph.absoluteMinLatitude;
const latMid = (graph.absoluteMaxLatitude + graph.absoluteMinLatitude) / 2;
const longMid = (graph.absoluteMaxLongitude + graph.absoluteMinLongitude) / 2;

// Scale factor to fit the map correctly in the 3D space
const scale = longRange / graph.longRange;

// Calculate position in graph space
const x = graph.latitudeInGraphSpace(latMid);
const z = graph.longitudeInGraphSpace(longMid);

// Adjust aspect ratio to match the equirectangular world map
const aspectRatio = kBackgroundWidth / kBackgroundHeight;
const mapWidth = mapBaseSize * scale;
const mapHeight = mapWidth * (latRange / longRange) * aspectRatio;
```

### 3. Data-Centric View

The map now initially displays the entire world and then zooms to focus on the actual data points:

```typescript
// Set absolute bounds to full world coordinates
graph.absoluteMinLatitude = -90;
graph.absoluteMaxLatitude = 90;
graph.absoluteMinLongitude = -180;
graph.absoluteMaxLongitude = 180;

// Calculate data center and span
const dataCenterLat = (maxLat + minLat) / 2;
const dataCenterLong = (maxLong + minLong) / 2;
const dataLatSpan = (maxLat - minLat) * 1.5; // 50% margin
const dataLongSpan = (maxLong - minLong) * 1.5; // 50% margin

// Animate to data-focused view
setTimeout(() => {
  graph.animateTo({
    minLatitude: dataMinLat,
    maxLatitude: dataMaxLat,
    minLongitude: dataMinLong,
    maxLongitude: dataMaxLong
  });
}, 1000);
```

## Benefits of the New Implementation

1. **Global Data Support**: The map now correctly handles data points from anywhere on Earth.
2. **Proper Geographic Alignment**: Data points align precisely with their geographic coordinates.
3. **Dynamic Focusing**: The view automatically focuses on the data points while allowing panning to any part of the world.
4. **Consistent Aspect Ratio**: The 2:1 ratio ensures proper representation of the equirectangular projection.

## Future Improvements

- Add tests to verify correct coordinate handling and map rendering
- Implement additional map projections (e.g., Mercator, Robinson) as options
- Add map style options (satellite, political, terrain)
- Optimize rendering for large datasets with points distributed across the globe 