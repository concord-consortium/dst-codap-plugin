# Potential Changes to graph-tab.scss

## Current Code

```scss
.chakra-tabs__tab-panel.css-a5mhaz {
  padding: 0;
  height: 100%;
}

.graph-tab {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent scrollbars */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden; /* Prevent scrollbars */
}

.map-area {
  flex: 1 0 400px; /* Set a fixed basis but allow growing */
  position: relative;
  overflow: hidden;
  max-height: 60%; /* Limit maximum height to ensure space for legend */
}

.legend-area {
  position: relative; /* Ensure proper stacking */
  flex: 0 0 auto; /* Don't grow or shrink */
  width: 100%;
  background-color: white;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  min-height: 320px; /* Set to match the desired height for two legends plus spacing */
  height: auto;
  overflow: visible; /* Allow legend content to be visible if needed */
}

/* Make sure portal content is visible */
.portal-parent {
  z-index: 1;
}
```

## Proposed Changes

```scss
.chakra-tabs__tab-panel.css-a5mhaz {
  padding: 0;
  height: 100%;
}

.graph-tab {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent scrollbars */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden; /* Prevent scrollbars */
}

.map-area {
  flex: 1 0 600px; /* Increased from 400px to accommodate larger cube */
  position: relative;
  overflow: hidden;
  max-height: 70%; /* Increased from 60% to provide more space for the cube */
}

.legend-area {
  position: relative; /* Ensure proper stacking */
  flex: 0 0 auto; /* Don't grow or shrink */
  width: 100%;
  background-color: white;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  min-height: 320px; /* Maintained to ensure adequate space for legends */
  height: auto;
  overflow: visible; /* Allow legend content to be visible if needed */
}

/* Make sure portal content is visible */
.portal-parent {
  z-index: 1;
}
```

## Reasoning

1. **Map Area Adjustments:**
   - Increased flex basis from 400px to 600px to accommodate the larger cube
   - Increased max-height from 60% to 70% to allow the map area to take up more vertical space

2. **Legend Area:**
   - Maintained min-height at 320px since we're not changing the legend size requirements

These changes will ensure that the larger space-time cube has adequate space within the layout, while still preserving sufficient space for the legend area. The increased max-height percentage will allow the map to utilize more of the available vertical space when the window is large enough. 