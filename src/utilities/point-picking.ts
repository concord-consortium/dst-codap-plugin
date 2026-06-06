// Pure CPU picking for the point renderer.
//
// The billboarded-quad path can't use three's raycaster: the quad is oriented
// in the vertex shader (GPU), so the CPU-side geometry the raycaster sees is the
// un-billboarded plane and would mis-hit. Instead we project instance centers to
// screen space (done by the caller, which has the camera) and pick here. This
// also unifies click and marquee selection on one exact, disc-aware path.
//
// All inputs are flat typed arrays indexed by instance. `hidden[i] === 1` marks
// instances the frame writer culled (scale 0); they never pick.

export interface ScreenPoints {
  count: number;
  screenX: Float32Array; // device/CSS px, instance center
  screenY: Float32Array;
  screenR: Float32Array; // projected disc radius in px (0 if behind camera)
  depth: Float32Array;   // normalized device depth or view distance; smaller = nearer
  hidden: Uint8Array;    // 1 = culled, never pickable
}

// Frontmost instance whose projected disc contains (px, py), or -1. "Frontmost"
// = smallest depth among discs that contain the point, so overlapping points
// resolve to the one actually on top — what a user expects from a click.
export function pickPointAt(px: number, py: number, p: ScreenPoints): number {
  let best = -1;
  let bestDepth = Infinity;
  for (let i = 0; i < p.count; i++) {
    if (p.hidden[i] === 1) continue;
    const r = p.screenR[i];
    if (r <= 0) continue;
    const dx = px - p.screenX[i];
    const dy = py - p.screenY[i];
    if (dx * dx + dy * dy <= r * r) {
      const d = p.depth[i];
      if (d < bestDepth) {
        bestDepth = d;
        best = i;
      }
    }
  }
  return best;
}

export interface ScreenRect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// Indices of all visible instances whose center falls inside the rect. Matches
// the marquee's "center-in-box" rule (a point is selected when its center is
// inside the marquee, independent of disc size).
export function pointsInRect(rect: ScreenRect, p: ScreenPoints): number[] {
  const out: number[] = [];
  const { minX, minY, maxX, maxY } = rect;
  for (let i = 0; i < p.count; i++) {
    if (p.hidden[i] === 1) continue;
    if (p.screenR[i] <= 0) continue; // behind camera
    const x = p.screenX[i];
    const y = p.screenY[i];
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      out.push(i);
    }
  }
  return out;
}
