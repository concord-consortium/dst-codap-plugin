import * as THREE from "three";
import { ScreenPoints } from "./point-picking";

// Projects an InstancedMesh's per-instance centers to screen pixels so the quad
// path can pick on the CPU (its quads are billboarded in the shader and can't be
// raycast). The instance transform is identity-rotation translation + uniform
// scale (written by writeInstanceFrame), so the center is the matrix translation
// and the scale (column 0 length, stored at index 0) is the outline radius;
// scale 0 marks a culled instance. The projected disc radius is the screen
// distance from the center to a point offset one world-radius along camera-right.
export function projectInstancesToScreen(
  instanceMatrix: Float32Array,
  count: number,
  matrixWorld: THREE.Matrix4,
  camera: THREE.Camera,
  width: number,
  height: number,
  out?: ScreenPoints
): ScreenPoints {
  const sp: ScreenPoints = out ?? {
    count,
    screenX: new Float32Array(count),
    screenY: new Float32Array(count),
    screenR: new Float32Array(count),
    depth: new Float32Array(count),
    hidden: new Uint8Array(count),
  };
  const center = new THREE.Vector3();
  const edge = new THREE.Vector3();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
  for (let i = 0; i < count; i++) {
    const b = i * 16;
    const scale = instanceMatrix[b];
    if (scale <= 0) {
      sp.hidden[i] = 1;
      sp.screenR[i] = 0;
      continue;
    }
    sp.hidden[i] = 0;
    center.set(instanceMatrix[b + 12], instanceMatrix[b + 13], instanceMatrix[b + 14]).applyMatrix4(matrixWorld);
    edge.copy(center).addScaledVector(right, scale);
    center.project(camera);
    edge.project(camera);
    const cx = (center.x * 0.5 + 0.5) * width;
    const cy = (-center.y * 0.5 + 0.5) * height;
    const ex = (edge.x * 0.5 + 0.5) * width;
    const ey = (-edge.y * 0.5 + 0.5) * height;
    sp.screenX[i] = cx;
    sp.screenY[i] = cy;
    sp.screenR[i] = Math.hypot(ex - cx, ey - cy);
    sp.depth[i] = center.z;
  }
  return sp;
}
