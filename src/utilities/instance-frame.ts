// Pure, allocation-free per-frame writer for the instanced point renderer.
//
// This is the hot loop that runs whenever the graph transform, selection, or ui
// state changes. It is extracted from instanced-points.tsx so it can be unit
// tested for projection parity against the graph model and benchmarked at 200K
// rows headlessly. The component imports this function directly — there is no
// duplicated math to drift.
//
// Positions use the same formulas as graph.latitudeInGraphSpace /
// convertCaseDateToGraph / longitudeInGraphSpace, inlined. Each instance matrix
// is a translation + uniform scale with identity rotation, so we write the 16
// column-major floats directly rather than composing a THREE.Matrix4.

export interface InstanceFrameParams {
  count: number;
  // Per-instance selection flags (1 = selected). A typed array rather than a
  // Set<string> so the hot loop does no string hashing — this is what keeps a
  // 200K-row date scrub inside the frame budget. Rebuilt only when the
  // selection changes, not on every scrub/animation frame.
  selectedFlags: Uint8Array;
  // Per-case source caches (NaN lat/lon/date marks a missing/hidden case).
  latArr: Float64Array;
  lonArr: Float64Array;
  dateArr: Float64Array;
  sizeArr: Float32Array; // diameter in px

  // Graph transform scalars.
  minLat: number;
  latRange: number;
  maxLat: number;
  minLon: number;
  lonRange: number;
  maxLon: number;
  centerX: number;
  centerZ: number;
  absMinDate: number;
  absDateRange: number;
  // Visibility bounds: a point shows when its date percent is in
  // [minDatePercent, currentDatePercent] (the slice, up to the scrub/handle).
  minDatePercent: number;
  currentDatePercent: number;
  // Projection basis for the cube z-axis, decoupled from the visibility bounds so
  // a locked slice can be shown small within the full-dataset axis while still
  // filtering to the slice. Unlocked these equal minDatePercent / slice span.
  projMinDatePercent: number;
  projDatePercentSpan: number;
  graphMin: number;
  graphRange: number;

  // ui / selection state.
  showSelected: boolean;
  showUnselected: boolean;
  seeThrough: boolean;
  unselectedOpacity: number;

  // Sizing constants.
  pxToWorld: number;
  selectedExtra: number;
  outlineThicknessUnselected: number;
  outlineThicknessSelected: number;

  // Output buffers (written in place).
  fillMatrix: Float32Array;    // 16 * count
  outlineMatrix: Float32Array; // 16 * count
  fillAlpha: Float32Array;     // count
  outlineAlpha: Float32Array;  // count
  outlineColor: Float32Array;  // 3 * count
  // Optional output for the billboarded-quad renderer: fillRadius / outlineRadius
  // per instance, i.e. where the SDF ring begins. The quad path uses the outline
  // matrix as its transform (center + outline radius) and this ratio to place the
  // fill/ring boundary, so it needs no separate fill geometry.
  quadFillRatio?: Float32Array; // count
}

// Writes an identity-rotation translation+uniform-scale matrix into a 16-float
// column-major slot.
function writeMatrix(arr: Float32Array, base: number, x: number, y: number, z: number, s: number) {
  arr[base] = s; arr[base + 1] = 0; arr[base + 2] = 0; arr[base + 3] = 0;
  arr[base + 4] = 0; arr[base + 5] = s; arr[base + 6] = 0; arr[base + 7] = 0;
  arr[base + 8] = 0; arr[base + 9] = 0; arr[base + 10] = s; arr[base + 11] = 0;
  arr[base + 12] = x; arr[base + 13] = y; arr[base + 14] = z; arr[base + 15] = 1;
}

export function writeInstanceFrame(p: InstanceFrameParams): void {
  const {
    count, selectedFlags, latArr, lonArr, dateArr, sizeArr,
    minLat, latRange, maxLat, minLon, lonRange, maxLon, centerX, centerZ,
    absMinDate, absDateRange, minDatePercent, currentDatePercent,
    projMinDatePercent, projDatePercentSpan,
    graphMin, graphRange,
    showSelected, showUnselected, seeThrough, unselectedOpacity,
    pxToWorld, selectedExtra, outlineThicknessUnselected, outlineThicknessSelected,
    fillMatrix, outlineMatrix, fillAlpha, outlineAlpha, outlineColor, quadFillRatio,
  } = p;

  for (let i = 0; i < count; i++) {
    const mBase = i * 16;
    const cBase = i * 3;
    const lat = latArr[i];
    const lon = lonArr[i];
    const dateMs = dateArr[i];
    const isSelected = selectedFlags[i] === 1;

    // Visibility — exact AND of graph.caseIsVisible and point.tsx pointVisible.
    let hidden = false;
    if (isSelected && !showSelected) hidden = true;
    else if (!isSelected && !showUnselected) hidden = true;
    else if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(dateMs)) hidden = true;

    const datePercent = (dateMs - absMinDate) / absDateRange;
    if (!hidden) {
      const inBounds = lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon &&
        datePercent >= minDatePercent && datePercent <= currentDatePercent;
      if (!inBounds) hidden = true;
      else if (!isSelected && seeThrough && unselectedOpacity <= 0) hidden = true;
    }

    if (hidden) {
      writeMatrix(fillMatrix, mBase, 0, 0, 0, 0);
      writeMatrix(outlineMatrix, mBase, 0, 0, 0, 0);
      fillAlpha[i] = 0;
      outlineAlpha[i] = 0;
      if (quadFillRatio) quadFillRatio[i] = 0;
      continue;
    }

    const x = ((lat - minLat) / latRange) * graphRange + graphMin - centerX;
    const z = ((lon - minLon) / lonRange) * graphRange + graphMin - centerZ;
    const y = ((datePercent - projMinDatePercent) / projDatePercentSpan) * graphRange + graphMin;

    const fillRadius = sizeArr[i] * pxToWorld + (isSelected ? selectedExtra : 0);
    const opacity = isSelected ? 1 : (seeThrough ? unselectedOpacity : (showUnselected ? 1 : 0));
    const outlineRadius = fillRadius + (isSelected ? outlineThicknessSelected : outlineThicknessUnselected);

    writeMatrix(fillMatrix, mBase, x, y, z, fillRadius);
    writeMatrix(outlineMatrix, mBase, x, y, z, outlineRadius);
    fillAlpha[i] = opacity;
    outlineAlpha[i] = opacity;
    if (quadFillRatio) quadFillRatio[i] = outlineRadius > 0 ? fillRadius / outlineRadius : 0;

    // Pure red / white are identical in sRGB and linear space, so writing the
    // raw components matches THREE.Color("#FF0000")/("#FFFFFF") + setColorAt.
    if (isSelected) {
      outlineColor[cBase] = 1; outlineColor[cBase + 1] = 0; outlineColor[cBase + 2] = 0;
    } else {
      outlineColor[cBase] = 1; outlineColor[cBase + 1] = 1; outlineColor[cBase + 2] = 1;
    }
  }
}
