# Design Document: Deselect All Points on Empty Cube Click

**Feature:** Deselect all points when clicking on empty space in the cube, while preserving cube dragging behavior.

---

## 1. Overview

This feature will allow users to deselect all selected points in the 3D cube visualization by clicking on an area of the cube that does not correspond to a data point. This matches the interaction paradigm of other CODAP graphing tools and improves usability. The cube's existing drag-to-rotate behavior must remain unaffected.

---

## 2. Goals & Requirements

- **Deselect on Empty Click:**  
  When the user clicks within the cube but not on a point, all selected points are deselected.
- **Preserve Selection on Point Click:**  
  Clicking on a point should continue to select/deselect that point as per current logic.
- **Preserve Dragging:**  
  Dragging (mouse down + move) should continue to rotate the cube as it does now.
- **No Regression:**  
  No negative impact on current selection, deselection, or drag behaviors.
- **Left-Click Only:**  
  Deselect all points only on a left mouse button click.
- **No Modifiers:**  
  Deselect all points only if no keyboard modifiers (Shift, Ctrl, Alt, Meta) are pressed during the click.

---

## 3. User Experience

- **Single Click (No Drag):**
  - On a point: select/deselect as currently implemented.
  - On empty space: deselect all points (only on left-click, no modifiers).
- **Drag:**
  - Dragging anywhere in the cube (point or empty space) rotates the cube as currently implemented.
  - No selection/deselection occurs on drag.

---

## 4. Technical Approach

### 4.1. Event Handling

- **Mouse Down:**  
  - Record the initial mouse position and whether a point was under the cursor.
- **Mouse Up:**  
  - If the mouse has not moved significantly (i.e., not a drag), and the mouse up occurs on empty space, trigger deselection of all points, but only if:
    - The event is a left-click (`event.button === 0`).
    - No modifier keys are pressed (`!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey`).
  - If the mouse up occurs on a point, maintain current selection logic.
- **Mouse Move:**  
  - If the mouse moves beyond a drag threshold, treat as a drag (rotation), not a click.

### 4.2. Hit Testing

- Use the existing point hit-testing logic to determine if the mouse event is on a point or empty space.

### 4.3. Deselect Logic

- Add a function to clear all selected points in the selection state/store.

### 4.4. Testing

- Unit and integration tests for:
  - Clicking on empty space with left-click and no modifiers deselects all points.
  - Clicking on a point maintains selection logic.
  - Dragging does not trigger selection/deselection.
  - No regression in cube rotation or selection.
  - No deselection on right/middle click or when modifiers are pressed.

---

## 5. Risks & Mitigations

- **Risk:** Accidental deselection during drag.  
  **Mitigation:** Use a movement threshold to distinguish between click and drag.
- **Risk:** Overlapping event logic with point selection.  
  **Mitigation:** Centralize event handling and ensure clear separation of concerns.

---

## 6. Open Questions

- None at this time (requirements clarified).

---

## 7. Next Steps

1. Create a feature branch for implementation.
2. Write tests for the new behavior.
3. Implement the feature.
4. Validate with manual and automated tests.
5. Open a pull request for review. 