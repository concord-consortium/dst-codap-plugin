import React from "react";
import { Text } from "@react-three/drei";
import { Euler, Vector3 } from "three";
import { halfPi } from "../../../utilities/trig-utils";
import { kLabelPosition } from "./navigation-cube-constants";

interface INavigationCubeLabelProps {
  position: Vector3;
  rotation: Euler;
  text: string;
}
function NavigationCubeLabel({ position, rotation, text }: INavigationCubeLabelProps) {
  return (
    <Text
      anchorX="center"
      anchorY="middle"
      color="black"
      fontSize={6}
      position={position}
      rotation={rotation}
    >
      {text}
    </Text>
  );
}

export function NavigationCubeLabels() {
  return (
    <>
      <NavigationCubeLabel
        position={new Vector3(-kLabelPosition, 0, 0)}
        rotation={new Euler(0, 3 * halfPi, 0, "YXZ")}
        text="FRONT"
      />
      <NavigationCubeLabel
        position={new Vector3(kLabelPosition, 0, 0)}
        rotation={new Euler(0, halfPi, 0, "YXZ")}
        text="BACK"
      />
      <NavigationCubeLabel
        position={new Vector3(0, 0, -kLabelPosition)}
        rotation={new Euler(0, Math.PI, 0, "YXZ")}
        text="LEFT"
      />
      <NavigationCubeLabel
        position={new Vector3(0, 0, kLabelPosition)}
        rotation={new Euler(0, 0, 0, "YXZ")}
        text="RIGHT"
      />
      <NavigationCubeLabel
        position={new Vector3(0, kLabelPosition, 0)}
        rotation={new Euler(3 * halfPi, 3 * halfPi, 0, "YXZ")}
        text="TOP"
      />
      <NavigationCubeLabel
        position={new Vector3(0, -kLabelPosition, 0)}
        rotation={new Euler(halfPi, 3 * halfPi, 0, "YXZ")}
        text="BOTTOM"
      />
    </>
  );
}
