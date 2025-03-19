# Space-Time Cube Expansion Implementation TODO

## CSS Changes

### 1. Modify scatter-plot.scss
- [ ] Increase the container width from 470px to 700px (approximately 50% larger)
- [ ] Increase the container height from 354px to 530px (approximately 50% larger)
- [ ] Adjust inner scatter-plot width from 416px to 650px
- [ ] Adjust inner scatter-plot height from 354px to 530px
- [ ] Maintain left position at 62.5px to keep the same left margin
- [ ] Consider adjusting top position if needed for better vertical spacing

### 2. Verify/Adjust graph-tab.scss
- [ ] Check if max-height: 60% for the map-area is still appropriate
- [ ] Consider removing this constraint or increasing it to 70-75%
- [ ] Ensure the legend-area min-height: 320px is still appropriate

### 3. Adjust App.css if needed
- [ ] Verify that the overall plugin height accommodates the larger cube
- [ ] Ensure no overflow issues or scrollbars appear

## Testing

### 1. Visual Testing
- [ ] Verify the cube appears larger but maintains its proportions
- [ ] Check that all controls remain visible and properly positioned
- [ ] Ensure the cube doesn't overflow its container
- [ ] Verify that the legend remains properly positioned below the cube

### 2. Interaction Testing
- [ ] Test all controls to ensure they remain functional
- [ ] Verify camera navigation and zooming work correctly
- [ ] Test data point visibility and selection
- [ ] Test marquee selection functionality

### 3. CODAP Integration
- [ ] Verify the plugin window properly resizes within CODAP
- [ ] Check that the plugin doesn't overflow the CODAP workspace
- [ ] Test that all functionality works correctly within CODAP

## Potential Refinements

### 1. Fine-tuning Control Positions
- [ ] Consider adjusting control positions if they appear too close to the edges
- [ ] Ensure a consistent margin around controls

### 2. Coordinate Space Adjustments
- [ ] Consider if the internal coordinate space (-5 to 5) needs adjustment
- [ ] Test if scaling the coordinate space affects data visualization

## Final Verification

- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Test on various screen sizes and resolutions
- [ ] Verify all visual elements render correctly 