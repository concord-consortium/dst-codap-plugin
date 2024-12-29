import React from "react";
import { Text } from "@react-three/drei";
// import * as THREE from "three";

interface AxisLabelsProps {
  axis: "x" | "y" | "z";
  length: number;
  ticks: number;
}

export function AxisLabels({ axis, length, ticks }: AxisLabelsProps) {
  const positions = Array.from({ length: ticks + 1 }, (_, i) => {
    const value = -length / 2 + (length / ticks) * i;
    return value;
  });

  const getPosition = (value: number): [number, number, number] => {
    switch (axis) {
      case "x":
        return [value, -0.5, 0];
      case "y":
        return [-0.5, value, 0];
      case "z":
        return [0, -0.5, value];
    }
  };

  return (
    <group>
      {positions.map((value, i) => (
        <Text
          key={i}
          position={getPosition(value)}
          fontSize={0.3}
          color="white"
          anchorX={axis === "y" ? "right" : "center"}
          anchorY="top"
        >
          {value.toFixed(1)}
        </Text>
      ))}
    </group>
  );
}
