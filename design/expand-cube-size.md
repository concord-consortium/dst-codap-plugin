# Space-Time Cube Size Expansion

## Problem Statement
The current space-time cube visualization is constrained in size, limiting its usability and visibility. We need to expand the cube size while keeping the controls at their current size and ensuring proper layout with adequate margins between elements.

## Current Implementation Analysis

### Cube Size and Positioning
From our code investigation, we found that the space-time cube size and positioning is primarily controlled by:

1. `scatter-plot.scss` - Defines the container dimensions:
   - Current size: 470px width × 354px height
   - Positioned at left: 62.5px, top: 10px

2. `cube-outline.tsx` - Defines the 3D cube dimensions:
   - Uses fixed constants: xMin/xMax, yMin/yMax, zMin/zMax (all -5 to 5)
   - These values define the coordinate space for the three-dimensional cube

### Control Positioning
Controls are positioned absolutely relative to the scatter plot container:

1. `graph-ui.scss` - Contains absolute positioning for all controls:
   - Home button: left: 47px, top: 141px
   - Map zoom: left: 47px, top: 203px
   - Map reset: left: 47px, top: 348px
   - Legend toggle: left: 109px, top: 348px
   - Mode selection: left: 151px, top: 348px

2. `navigation-controls` component - likely controls camera positioning

### Parent Container Layout
The overall layout is managed through:

1. `graph-tab.scss` - Controls the flexbox layout:
   - Map area has flex: 1 0 400px and max-height: 60%
   - Legend area has min-height: 320px

2. `App.css` - Controls overall plugin dimensions and tab panels

## Proposed Changes

We'll need to modify several aspects of the CSS to achieve our goal:

1. **Increase the scatter plot container size:**
   - Modify `scatter-plot.scss` to increase width and height
   - Keep current margins and positioning relative to parent container

2. **Maintain control positioning:**
   - No changes needed to `graph-ui.scss` if we preserve the current control positions
   - Controls will remain in their current absolute positions relative to the scatter plot container

3. **Ensure proper plugin window size:**
   - Adjust `graph-tab.scss` to allow sufficient space for the larger cube and legend
   - Consider adjusting the max-height constraint for the map area

4. **Optional: Increase the coordinate space:**
   - If desired, we could modify the constants in `cube-outline.tsx` to expand the internal coordinate space

## Implementation Plan

1. Create a new branch (already done: `feature/expand-cube-size`)
2. First, modify `scatter-plot.scss` to increase the container dimensions
3. Test that the controls remain in the correct positions
4. Adjust the overall plugin window dimensions if needed
5. Test the changes to ensure everything is properly displayed
6. Create a pull request for review

## Risks and Considerations

1. **Control accessibility:** Ensure controls remain within reasonable reach and visible
2. **Performance:** Larger 3D canvas may impact performance, especially on lower-end devices
3. **Layout stability:** Ensure changes don't cause layout shifts or overlaps with other UI elements
4. **CODAP integration:** Verify the plugin window properly resizes within the CODAP environment

## Next Steps

After this design document is reviewed, we'll proceed with implementing the changes according to the approved plan. 