export const kPluginName = "Space-Time Cube";
export const kVersion = "0.0.1";
export const kInitialDimensions = {
  width: 1110,
  height: 880
};

export const kCollectionName = "Cases";

export const kGraphTabLabel = "3D Graph";
export const kAboutTabLabel = "About";

// These constants work for USA_location_map.svg.png
// export const kBackgroundHeight = 334;
// export const kBackgroundWidth = 640;
// export const kBackgroundLongMax = -66.5;
// export const kBackgroundLongMin = -125.5;
// const baseBackgroundLatMax = 49.8;
// const baseBackgroundLatMin = 24.2;

// These constants work for SpaceCubeMap.png (North America map)
// export const kBackgroundHeight = 3840;
// export const kBackgroundWidth = 3840;
// export const kBackgroundLongMax = -62;
// export const kBackgroundLongMin = -130;
// const baseBackgroundLatMin = 9.6;
// const baseBackgroundLatMax = 63.5;

// These constants work for a full world map with equirectangular projection
// The correct ratio for equirectangular projection is 2:1 (width:height)
// Our downloaded map is 2048x1024 pixels
export const kBackgroundWidth = 2048;  // Exact width of our downloaded map
export const kBackgroundHeight = 1024; // Exact height (should be exactly half the width)
export const kBackgroundLongMax = 180;  // East boundary (180° East)
export const kBackgroundLongMin = -180; // West boundary (180° West)
const baseBackgroundLatMin = -90;  // South boundary (90° South)
const baseBackgroundLatMax = 90;   // North boundary (90° North)

export const kBackgroundLongRange = kBackgroundLongMax - kBackgroundLongMin;
export const kBackgroundLongMid = kBackgroundLongMin + kBackgroundLongRange / 2;
const baseBackgroundLatRange = baseBackgroundLatMax - baseBackgroundLatMin;
export const kBackgroundLatMid = baseBackgroundLatMin + baseBackgroundLatRange / 2;
export const kBackgroundLatRange = baseBackgroundLatRange; // For equirectangular, this should match the actual ratio
export const kBackgroundLatMax = kBackgroundLatMid + kBackgroundLatRange / 2;
export const kBackgroundLatMin = kBackgroundLatMid - kBackgroundLatRange / 2;
// To keep the display area a square, always ensure that there are
// kLatScale degrees latitude for every one degree longitude.
export const kLatScale = kBackgroundLatRange / kBackgroundLongRange;

export const kHomeMaxLatitude = kBackgroundLatMax - kBackgroundLatRange * .05;
export const kHomeMinLatitude = kBackgroundLatMin + kBackgroundLatRange * .05;
export const kHomeMaxLongitude = kBackgroundLongMax - kBackgroundLongRange * .05;
export const kHomeMinLongitude = kBackgroundLongMin + kBackgroundLongRange * .05;

export const kUIPivotChange = Math.PI / 12;
export const kUIRotationChange = Math.PI / 12;
