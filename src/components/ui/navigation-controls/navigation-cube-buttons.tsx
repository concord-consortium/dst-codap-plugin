import React from "react";
import { Vector3 } from "three";
import { halfPi, quarterPi } from "../../../utilities/trig-utils";
import { NavigationCubeButton } from "./navigation-cube-button";

const borderOffset = 11.5;
const shortDimension = 8;
const longDimension = 16;
const cornerSize = [shortDimension, shortDimension, shortDimension] as [number, number, number];

export function NavigationCubeButtons() {
  return (
    <>
      {/* Top front left corner */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, borderOffset, -borderOffset)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={quarterPi}
      />
      {/* Top back left corner */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, borderOffset, -borderOffset)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={3 * quarterPi}
      />
      {/* Top back right corner */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, borderOffset, borderOffset)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={5 * quarterPi}
      />
      {/* Top front right corner */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, borderOffset, borderOffset)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={7 * quarterPi}
      />

      {/* Bottom front left corner */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, -borderOffset, -borderOffset)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={quarterPi}
      />
      {/* Bottom back left corner */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, -borderOffset, -borderOffset)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={3 * quarterPi}
      />
      {/* Bottom back right corner */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, -borderOffset, borderOffset)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={5 * quarterPi}
      />
      {/* Bottom front right corner */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, -borderOffset, borderOffset)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={7 * quarterPi}
      />

      {/* Top front edge */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, borderOffset, 0)}
        size={[shortDimension, shortDimension, longDimension]}
        targetPivot={quarterPi}
        targetRotation={0}
      />
      {/* Top back edge */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, borderOffset, 0)}
        size={[shortDimension, shortDimension, longDimension]}
        targetPivot={quarterPi}
        targetRotation={Math.PI}
      />
      {/* Bottom back edge */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, -borderOffset, 0)}
        size={[shortDimension, shortDimension, longDimension]}
        targetPivot={-quarterPi}
        targetRotation={Math.PI}
      />
      {/* Bottom front edge */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, -borderOffset, 0)}
        size={[shortDimension, shortDimension, longDimension]}
        targetPivot={-quarterPi}
        targetRotation={0}
      />

      {/* Top left edge */}
      <NavigationCubeButton
        position={new Vector3(0, borderOffset, -borderOffset)}
        size={[longDimension, shortDimension, shortDimension]}
        targetPivot={quarterPi}
        targetRotation={halfPi}
      />
      {/* Top right edge */}
      <NavigationCubeButton
        position={new Vector3(0, borderOffset, borderOffset)}
        size={[longDimension, shortDimension, shortDimension]}
        targetPivot={quarterPi}
        targetRotation={3 * halfPi}
      />
      {/* Bottom right edge */}
      <NavigationCubeButton
        position={new Vector3(0, -borderOffset, borderOffset)}
        size={[longDimension, shortDimension, shortDimension]}
        targetPivot={-quarterPi}
        targetRotation={3 * halfPi}
      />
      {/* Bottom left edge */}
      <NavigationCubeButton
        position={new Vector3(0, -borderOffset, -borderOffset)}
        size={[longDimension, shortDimension, shortDimension]}
        targetPivot={-quarterPi}
        targetRotation={halfPi}
      />

      {/* Front left edge */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, 0, -borderOffset)}
        size={[shortDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={quarterPi}
      />
      {/* Back left edge */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, 0, -borderOffset)}
        size={[shortDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={3 * quarterPi}
      />
      {/* Back right edge */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, 0, borderOffset)}
        size={[shortDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={5 * quarterPi}
      />
      {/* Front right edge */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, 0, borderOffset)}
        size={[shortDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={7 * quarterPi}
      />

      {/* Front face */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, 0, 0)}
        size={[shortDimension, longDimension, longDimension]}
        targetPivot={0}
        targetRotation={0}
      />
      {/* Back face */}
      <NavigationCubeButton
        position={new Vector3(borderOffset, 0, 0)}
        size={[shortDimension, longDimension, longDimension]}
        targetPivot={0}
        targetRotation={Math.PI}
      />

      {/* Left face */}
      <NavigationCubeButton
        position={new Vector3(0, 0, -borderOffset)}
        size={[longDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={halfPi}
      />
      {/* Right face */}
      <NavigationCubeButton
        position={new Vector3(0, 0, borderOffset)}
        size={[longDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={3 * halfPi}
      />

      {/* Top face */}
      <NavigationCubeButton
        position={new Vector3(0, borderOffset, 0)}
        size={[longDimension, shortDimension, longDimension]}
        targetPivot={halfPi}
        targetRotation={0}
      />
      {/* Bottom face */}
      <NavigationCubeButton
        position={new Vector3(0, -borderOffset, 0)}
        size={[longDimension, shortDimension, longDimension]}
        targetPivot={-halfPi}
        targetRotation={0}
      />
    </>
  );
}
