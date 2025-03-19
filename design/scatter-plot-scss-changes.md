# Proposed Changes to scatter-plot.scss

## Current Code

```scss
.scatter-plot-container {
  background-color: #f9f9f9;
  border: 1px solid #e3e3e3;
  display: flex;
  height: 354px;
  justify-content: flex-end;
  left: 62.5px;
  position: absolute;
  top: 10px;
  width: 470px;

  .scatter-plot {
    height: 354px;
    margin-right: -20px;
    position: relative;
    width: 416px;

    &.pointer-mode {
      cursor: pointer;

      &:active {
        cursor: grabbing;
      }
    }
  }
}
```

## Proposed Changes

```scss
.scatter-plot-container {
  background-color: #f9f9f9;
  border: 1px solid #e3e3e3;
  display: flex;
  height: 530px;         /* Increased from 354px */
  justify-content: flex-end;
  left: 62.5px;          /* Maintained to keep same left margin */
  position: absolute;
  top: 10px;
  width: 700px;          /* Increased from 470px */

  .scatter-plot {
    height: 530px;       /* Increased from 354px */
    margin-right: -20px;
    position: relative;
    width: 650px;        /* Increased from 416px */

    &.pointer-mode {
      cursor: pointer;

      &:active {
        cursor: grabbing;
      }
    }
  }
}
```

## Reasoning

1. **Container Dimensions:**
   - Width: Increased from 470px to 700px (approximately 50% larger)
   - Height: Increased from 354px to 530px (approximately 50% larger)

2. **Scatter Plot Dimensions:**
   - Width: Increased from 416px to 650px
   - Height: Increased from 354px to 530px

3. **Positioning:**
   - Left position maintained at 62.5px to keep the same left margin
   - Top position maintained at 10px to keep the same top margin

This change preserves the relative positioning and margins while significantly increasing the size of the space-time cube. The controls, which are positioned absolutely relative to this container, will maintain their current positions. 