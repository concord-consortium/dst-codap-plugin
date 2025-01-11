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

      {/* Cube faces: front and back */}
      <NavigationCubeButton
        position={new Vector3(-borderOffset, 0, 0)}
        size={[shortDimension, longDimension, longDimension]}
        targetPivot={0}
        targetRotation={0}
      />
      <NavigationCubeButton
        position={new Vector3(borderOffset, 0, 0)}
        size={[shortDimension, longDimension, longDimension]}
        targetPivot={0}
        targetRotation={Math.PI}
      />

      {/* Cube faces: left and right */}
      <NavigationCubeButton
        position={new Vector3(0, 0, -borderOffset)}
        size={[longDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={halfPi}
      />
      <NavigationCubeButton
        position={new Vector3(0, 0, borderOffset)}
        size={[longDimension, longDimension, shortDimension]}
        targetPivot={0}
        targetRotation={3 * halfPi}
      />

      {/* Cube faces: top and bottom */}
      <NavigationCubeButton
        position={new Vector3(0, borderOffset, 0)}
        size={[longDimension, shortDimension, longDimension]}
        targetPivot={halfPi}
        targetRotation={0}
      />
      <NavigationCubeButton
        position={new Vector3(0, -borderOffset, 0)}
        size={[longDimension, shortDimension, longDimension]}
        targetPivot={-halfPi}
        targetRotation={0}
      />
    </>
  );
}
