import * as THREE from "three";

// Custom material for the billboarded-quad point renderer (the Chromebook path).
//
// Each point is a single camera-facing quad (2 triangles) instead of a ~96-tri
// sphere. The vertex shader billboards the quad in view space and sizes it by
// the per-instance scale baked into instanceMatrix (the outline radius). The
// fragment shader draws a procedural SDF disc: a filled core out to vFillRatio,
// an outline ring from there to the edge, antialiased with fwidth. This folds
// the formerly separate outline mesh into the shader.
//
// Per-instance inputs:
//   instanceMatrix : translation = world center, uniform scale = outline radius
//   aFillColor     : legend fill color (vec3, linear/sRGB-equal for the palette)
//   aOutlineColor  : ring color (white unselected / red selected)
//   aAlpha         : per-instance opacity (see-through / show-unselected)
//   aFillRatio     : fillRadius / outlineRadius — where the ring begins (0..1)

const vertexShader = /* glsl */ `
attribute vec3 aFillColor;
attribute vec3 aOutlineColor;
attribute float aAlpha;
attribute float aFillRatio;

varying vec2 vUv;
varying vec3 vFillColor;
varying vec3 vOutlineColor;
varying float vAlpha;
varying float vFillRatio;

void main() {
  // PlaneGeometry corners are in [-0.5, 0.5]; map to [-1, 1] for the SDF.
  vUv = position.xy * 2.0;
  vFillColor = aFillColor;
  vOutlineColor = aOutlineColor;
  vAlpha = aAlpha;
  vFillRatio = aFillRatio;

  // Billboard: place the instance center in view space, then offset by the quad
  // corner (screen-aligned) scaled by the instance's uniform scale. Ignoring the
  // instance rotation (identity here) keeps every quad facing the camera.
  vec4 centerView = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float scale = length(instanceMatrix[0].xyz);
  vec4 viewPos = centerView + vec4(vUv * scale, 0.0, 0.0);
  gl_Position = projectionMatrix * viewPos;
}
`;

const fragmentShader = /* glsl */ `
precision mediump float;

varying vec2 vUv;
varying vec3 vFillColor;
varying vec3 vOutlineColor;
varying float vAlpha;
varying float vFillRatio;

void main() {
  float d = length(vUv);
  float aa = fwidth(d);

  // Outer edge: antialiased disc cutout.
  float coverage = 1.0 - smoothstep(1.0 - aa, 1.0, d);
  if (coverage <= 0.0) discard;

  // Ring boundary: blend from fill to outline color at vFillRatio.
  float ring = smoothstep(vFillRatio - aa, vFillRatio + aa, d);
  vec3 color = mix(vFillColor, vOutlineColor, ring);

  gl_FragColor = vec4(color, vAlpha * coverage);
}
`;

export function createPointQuadMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    // Match the sphere material: blended but still depth-writing, which is what
    // makes the current see-through mode occlude correctly.
    transparent: true,
    depthTest: true,
    depthWrite: true,
  });
}
