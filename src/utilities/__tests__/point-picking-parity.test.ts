import * as THREE from "three";
import { projectInstancesToScreen } from "../point-projection";
import { pickPointAt } from "../point-picking";

// "Pick the same cases as today": the sphere renderer picks via three's
// raycaster (event.instanceId); the quad renderer picks on the CPU. This test
// asserts they agree — for a given camera and instance set, raycasting the
// sphere InstancedMesh and CPU-picking the equivalent quad data return the same
// instance. three's raycaster is pure geometry math, so this runs headlessly.

const W = 600, H = 600;

function makeCamera() {
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.set(0, 0, 12);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  return camera;
}

// Spheres: an InstancedMesh of unit spheres scaled per instance (radius = scale),
// exactly how the sphere renderer positions points.
function makeSphereMesh(rows: Array<[number, number, number, number]>) {
  const geo = new THREE.SphereGeometry(1, 16, 16);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial(), rows.length);
  const m = new THREE.Matrix4();
  rows.forEach(([x, y, z, s], i) => {
    m.makeScale(s, s, s);
    m.setPosition(x, y, z);
    mesh.setMatrixAt(i, m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.updateMatrixWorld(true);
  return mesh;
}

// Quad data: the same instances packed as writeInstanceFrame would (identity
// rotation, uniform scale, translation).
function makeQuadMatrices(rows: Array<[number, number, number, number]>) {
  const arr = new Float32Array(rows.length * 16);
  rows.forEach(([x, y, z, s], i) => {
    const b = i * 16;
    arr[b] = s; arr[b + 5] = s; arr[b + 10] = s; arr[b + 15] = 1;
    arr[b + 12] = x; arr[b + 13] = y; arr[b + 14] = z;
  });
  return arr;
}

function raycastSphere(mesh: THREE.InstancedMesh, camera: THREE.Camera, px: number, py: number): number {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2((px / W) * 2 - 1, -(py / H) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObject(mesh, false);
  // Nearest hit = frontmost, matching r3f's event.instanceId.
  return hits.length > 0 && hits[0].instanceId != null ? hits[0].instanceId : -1;
}

describe("quad CPU pick == sphere raycast (pick the same cases as today)", () => {
  const rows: Array<[number, number, number, number]> = [
    [0, 0, 0, 0.35],
    [3, 1.5, 0, 0.35],
    [-3, -1.5, 1, 0.35],
    [2, -2.5, -1, 0.35],
    [-2.5, 2, 0.5, 0.35],
  ];

  it("agrees at every instance's projected center", () => {
    const camera = makeCamera();
    const mesh = makeSphereMesh(rows);
    const quad = makeQuadMatrices(rows);
    const sp = projectInstancesToScreen(quad, rows.length, mesh.matrixWorld, camera, W, H);

    for (let i = 0; i < rows.length; i++) {
      const px = sp.screenX[i], py = sp.screenY[i];
      const cpu = pickPointAt(px, py, sp);
      const ray = raycastSphere(mesh, camera, px, py);
      expect(cpu).toBe(i);   // CPU picks this instance
      expect(ray).toBe(cpu); // ...and so does the raycaster
    }
  });

  it("both miss in empty space", () => {
    const camera = makeCamera();
    const mesh = makeSphereMesh(rows);
    const quad = makeQuadMatrices(rows);
    const sp = projectInstancesToScreen(quad, rows.length, mesh.matrixWorld, camera, W, H);
    // A corner clear of every disc.
    expect(pickPointAt(5, 5, sp)).toBe(-1);
    expect(raycastSphere(mesh, camera, 5, 5)).toBe(-1);
  });

  it("agrees on the frontmost when two instances overlap on screen", () => {
    const overlap: Array<[number, number, number, number]> = [
      [0, 0, -3, 0.4], // farther
      [0, 0, 3, 0.4],  // nearer — both renderers must pick this
    ];
    const camera = makeCamera();
    const mesh = makeSphereMesh(overlap);
    const quad = makeQuadMatrices(overlap);
    const sp = projectInstancesToScreen(quad, overlap.length, mesh.matrixWorld, camera, W, H);
    const cpu = pickPointAt(W / 2, H / 2, sp);
    const ray = raycastSphere(mesh, camera, W / 2, H / 2);
    expect(cpu).toBe(1);
    expect(ray).toBe(1);
  });
});
