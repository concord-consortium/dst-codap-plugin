import React from "react";
import { Vector3 } from "three";
import { NavigationCubeCorner } from "./navigation-cube-corner";
import { quarterPi } from "../../../utilities/trig-utils";

const borderOffset = 12.5;

export function NavigationCubeButtons() {
  return (
    <>
      {/* Top front left going around clockwise */}
      <NavigationCubeCorner
        position={new Vector3(-borderOffset, borderOffset, -borderOffset)}
        targetPivot={quarterPi}
        targetRotation={quarterPi}
      />
      <NavigationCubeCorner
        position={new Vector3(borderOffset, borderOffset, -borderOffset)}
        targetPivot={quarterPi}
        targetRotation={3 * quarterPi}
      />
      <NavigationCubeCorner
        position={new Vector3(borderOffset, borderOffset, borderOffset)}
        targetPivot={quarterPi}
        targetRotation={5 * quarterPi}
      />
      <NavigationCubeCorner
        position={new Vector3(-borderOffset, borderOffset, borderOffset)}
        targetPivot={quarterPi}
        targetRotation={7 * quarterPi}
      />
      {/* Top front left going around clockwise */}
      <NavigationCubeCorner
        position={new Vector3(-borderOffset, -borderOffset, -borderOffset)}
        targetPivot={-quarterPi}
        targetRotation={quarterPi}
      />
      <NavigationCubeCorner
        position={new Vector3(borderOffset, -borderOffset, -borderOffset)}
        targetPivot={-quarterPi}
        targetRotation={3 * quarterPi}
      />
      <NavigationCubeCorner
        position={new Vector3(borderOffset, -borderOffset, borderOffset)}
        targetPivot={-quarterPi}
        targetRotation={5 * quarterPi}
      />
      <NavigationCubeCorner
        position={new Vector3(-borderOffset, -borderOffset, borderOffset)}
        targetPivot={-quarterPi}
        targetRotation={7 * quarterPi}
      />
    </>
  );
}
