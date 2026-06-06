import * as THREE from "three";
import { projectInstancesToScreen } from "../point-projection";
import { pickPointAt } from "../point-picking";

// Builds an instanceMatrix buffer (identity rotation, uniform scale) for the
// given [x,y,z,scale] rows — the exact layout writeInstanceFrame produces.
function buildMatrices(rows: Array<[number, number, number, number]>): Float32Array {
  const arr = new Float32Array(rows.length * 16);
  rows.forEach(([x, y, z, s], i) => {
    const b = i * 16;
    arr[b] = s; arr[b + 5] = s; arr[b + 10] = s; arr[b + 15] = 1;
    arr[b + 12] = x; arr[b + 13] = y; arr[b + 14] = z;
  });
  return arr;
}

function makeCamera() {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  return camera;
}

describe("projectInstancesToScreen + pickPointAt (integration)", () => {
  const W = 500, H = 500;
  const identity = new THREE.Matrix4();

  it("projects a centered instance to the screen center and picks it", () => {
    const m = buildMatrices([[0, 0, 0, 0.3]]);
    const camera = makeCamera();
    const sp = projectInstancesToScreen(m, 1, identity, camera, W, H);
    expect(sp.screenX[0]).toBeCloseTo(W / 2, 1);
    expect(sp.screenY[0]).toBeCloseTo(H / 2, 1);
    expect(sp.screenR[0]).toBeGreaterThan(0);
    // A click at the projected center hits it; far away misses.
    expect(pickPointAt(sp.screenX[0], sp.screenY[0], sp)).toBe(0);
    expect(pickPointAt(5, 5, sp)).toBe(-1);
  });

  it("picks the right instance among several, by projected position", () => {
    const m = buildMatrices([
      [0, 0, 0, 0.3],   // center
      [3, 0, 0, 0.3],   // right
      [-3, 0, 0, 0.3],  // left
    ]);
    const camera = makeCamera();
    const sp = projectInstancesToScreen(m, 3, identity, camera, W, H);
    expect(sp.screenX[1]).toBeGreaterThan(W / 2); // right of center
    expect(sp.screenX[2]).toBeLessThan(W / 2);    // left of center
    expect(pickPointAt(sp.screenX[1], sp.screenY[1], sp)).toBe(1);
    expect(pickPointAt(sp.screenX[2], sp.screenY[2], sp)).toBe(2);
    expect(pickPointAt(sp.screenX[0], sp.screenY[0], sp)).toBe(0);
  });

  it("marks scale-0 instances hidden (never projected/picked)", () => {
    const m = buildMatrices([[0, 0, 0, 0]]);
    const camera = makeCamera();
    const sp = projectInstancesToScreen(m, 1, identity, camera, W, H);
    expect(sp.hidden[0]).toBe(1);
    expect(pickPointAt(W / 2, H / 2, sp)).toBe(-1);
  });

  it("picks the nearer instance when two project to the same spot", () => {
    const m = buildMatrices([
      [0, 0, -2, 0.3], // farther from camera (camera at z=10)
      [0, 0, 2, 0.3],  // nearer — should win
    ]);
    const camera = makeCamera();
    const sp = projectInstancesToScreen(m, 2, identity, camera, W, H);
    expect(pickPointAt(W / 2, H / 2, sp)).toBe(1);
  });
});
