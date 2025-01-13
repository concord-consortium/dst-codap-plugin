import React from "react";
import { Vector3 } from "three";
import { halfPi, quarterPi } from "../../../utilities/trig-utils";
import { NavigationCubeButton } from "./navigation-cube-button";
import { kButtonLargeSize, kButtonPosition, kButtonSmallSize } from "./navigation-cube-constants";

const cornerSize = [kButtonSmallSize, kButtonSmallSize, kButtonSmallSize] as [number, number, number];

export function NavigationCubeButtons() {
  return (
    <>
      {/* Top front left corner */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, kButtonPosition, -kButtonPosition)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={quarterPi}
      />
      {/* Top back left corner */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, kButtonPosition, -kButtonPosition)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={3 * quarterPi}
      />
      {/* Top back right corner */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, kButtonPosition, kButtonPosition)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={5 * quarterPi}
      />
      {/* Top front right corner */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, kButtonPosition, kButtonPosition)}
        size={cornerSize}
        targetPivot={quarterPi}
        targetRotation={7 * quarterPi}
      />

      {/* Bottom front left corner */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, -kButtonPosition, -kButtonPosition)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={quarterPi}
      />
      {/* Bottom back left corner */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, -kButtonPosition, -kButtonPosition)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={3 * quarterPi}
      />
      {/* Bottom back right corner */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, -kButtonPosition, kButtonPosition)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={5 * quarterPi}
      />
      {/* Bottom front right corner */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, -kButtonPosition, kButtonPosition)}
        size={cornerSize}
        targetPivot={-quarterPi}
        targetRotation={7 * quarterPi}
      />

      {/* Top front edge */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, kButtonPosition, 0)}
        size={[kButtonSmallSize, kButtonSmallSize, kButtonLargeSize]}
        targetPivot={quarterPi}
        targetRotation={0}
      />
      {/* Top back edge */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, kButtonPosition, 0)}
        size={[kButtonSmallSize, kButtonSmallSize, kButtonLargeSize]}
        targetPivot={quarterPi}
        targetRotation={Math.PI}
      />
      {/* Bottom back edge */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, -kButtonPosition, 0)}
        size={[kButtonSmallSize, kButtonSmallSize, kButtonLargeSize]}
        targetPivot={-quarterPi}
        targetRotation={Math.PI}
      />
      {/* Bottom front edge */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, -kButtonPosition, 0)}
        size={[kButtonSmallSize, kButtonSmallSize, kButtonLargeSize]}
        targetPivot={-quarterPi}
        targetRotation={0}
      />

      {/* Top left edge */}
      <NavigationCubeButton
        position={new Vector3(0, kButtonPosition, -kButtonPosition)}
        size={[kButtonLargeSize, kButtonSmallSize, kButtonSmallSize]}
        targetPivot={quarterPi}
        targetRotation={halfPi}
      />
      {/* Top right edge */}
      <NavigationCubeButton
        position={new Vector3(0, kButtonPosition, kButtonPosition)}
        size={[kButtonLargeSize, kButtonSmallSize, kButtonSmallSize]}
        targetPivot={quarterPi}
        targetRotation={3 * halfPi}
      />
      {/* Bottom right edge */}
      <NavigationCubeButton
        position={new Vector3(0, -kButtonPosition, kButtonPosition)}
        size={[kButtonLargeSize, kButtonSmallSize, kButtonSmallSize]}
        targetPivot={-quarterPi}
        targetRotation={3 * halfPi}
      />
      {/* Bottom left edge */}
      <NavigationCubeButton
        position={new Vector3(0, -kButtonPosition, -kButtonPosition)}
        size={[kButtonLargeSize, kButtonSmallSize, kButtonSmallSize]}
        targetPivot={-quarterPi}
        targetRotation={halfPi}
      />

      {/* Front left edge */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, 0, -kButtonPosition)}
        size={[kButtonSmallSize, kButtonLargeSize, kButtonSmallSize]}
        targetPivot={0}
        targetRotation={quarterPi}
      />
      {/* Back left edge */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, 0, -kButtonPosition)}
        size={[kButtonSmallSize, kButtonLargeSize, kButtonSmallSize]}
        targetPivot={0}
        targetRotation={3 * quarterPi}
      />
      {/* Back right edge */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, 0, kButtonPosition)}
        size={[kButtonSmallSize, kButtonLargeSize, kButtonSmallSize]}
        targetPivot={0}
        targetRotation={5 * quarterPi}
      />
      {/* Front right edge */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, 0, kButtonPosition)}
        size={[kButtonSmallSize, kButtonLargeSize, kButtonSmallSize]}
        targetPivot={0}
        targetRotation={7 * quarterPi}
      />

      {/* Front face */}
      <NavigationCubeButton
        position={new Vector3(-kButtonPosition, 0, 0)}
        size={[kButtonSmallSize, kButtonLargeSize, kButtonLargeSize]}
        targetPivot={0}
        targetRotation={0}
      />
      {/* Back face */}
      <NavigationCubeButton
        position={new Vector3(kButtonPosition, 0, 0)}
        size={[kButtonSmallSize, kButtonLargeSize, kButtonLargeSize]}
        targetPivot={0}
        targetRotation={Math.PI}
      />

      {/* Left face */}
      <NavigationCubeButton
        position={new Vector3(0, 0, -kButtonPosition)}
        size={[kButtonLargeSize, kButtonLargeSize, kButtonSmallSize]}
        targetPivot={0}
        targetRotation={halfPi}
      />
      {/* Right face */}
      <NavigationCubeButton
        position={new Vector3(0, 0, kButtonPosition)}
        size={[kButtonLargeSize, kButtonLargeSize, kButtonSmallSize]}
        targetPivot={0}
        targetRotation={3 * halfPi}
      />

      {/* Top face */}
      <NavigationCubeButton
        position={new Vector3(0, kButtonPosition, 0)}
        size={[kButtonLargeSize, kButtonSmallSize, kButtonLargeSize]}
        targetPivot={halfPi}
        targetRotation={0}
      />
      {/* Bottom face */}
      <NavigationCubeButton
        position={new Vector3(0, -kButtonPosition, 0)}
        size={[kButtonLargeSize, kButtonSmallSize, kButtonLargeSize]}
        targetPivot={-halfPi}
        targetRotation={0}
      />
    </>
  );
}
