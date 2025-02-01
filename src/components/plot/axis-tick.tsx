import React from "react";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { tickDirectionType } from "../../types/graph-types";
import { PlotLine } from "./plot-line";

const tickLength = .5;
const labelBuffer = .25;

interface IAxisTickProps {
  direction: tickDirectionType;
  position: Vector3;
  text: string;
}
export function AxisTick({ direction, position, text }: IAxisTickProps) {
  const startPosition = new Vector3(0, 0, 0);
  const endPosition = new Vector3(
    direction === "left" ? -tickLength : direction === "right" ? tickLength : 0,
    direction === "down" ? -tickLength : direction === "up" ? tickLength : 0,
    0
  );
  const textPosition = new Vector3(
    endPosition.x + (direction === "left" ? -labelBuffer : direction === "right" ? labelBuffer : 0),
    endPosition.y + (direction === "down" ? -labelBuffer : direction === "up" ? labelBuffer : 0),
    0
  );
  const anchorX = direction === "left" ? "right" : direction === "right" ? "left" : "center";
  const anchorY = direction === "down" ? "top" : direction === "up" ? "bottom" : "middle";
  /* eslint-disable react/no-unknown-property */
  return (
    <group rotation={dstCamera.facingRotation} position={position}>
      <PlotLine points={[startPosition, endPosition]} />
      <Text
        position={textPosition}
        fontSize={.55}
        color="black"
        anchorX={anchorX}
        anchorY={anchorY}
      >
        {text}
      </Text>
    </group>
  );
  /* eslint-enable react/no-unknown-property */
}
