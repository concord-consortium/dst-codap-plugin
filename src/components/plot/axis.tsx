import React from "react";
import { Euler, Vector3 } from "three";
import { Text } from "@react-three/drei";
import { dstCamera } from "../../models/camera";
import { tickDirectionType } from "../../types/graph-types";
import { AxisTick } from "./axis-tick";

interface IAxisProps {
  displayFunction: (value: number) => string;
  endPoint: Vector3;
  label?: string;
  labelOffset?: Vector3;
  labelRotation?: Euler;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
  tickBuffer?: boolean;
  tickCount: number;
  tickDirection: tickDirectionType;
}
export function Axis({
  displayFunction, endPoint, label, labelOffset, labelRotation, maxValue, minValue, startPoint, tickBuffer,
  tickCount, tickDirection
}: IAxisProps) {
  const tickSpaces = tickCount - (tickBuffer ? 0 : 1);
  const xRange = endPoint.x - startPoint.x;
  const yRange = endPoint.y - startPoint.y;
  const zRange = endPoint.z - startPoint.z;
  const labelPosition = new Vector3(
    startPoint.x + xRange / 2 + (labelOffset?.x ?? 0),
    startPoint.y + yRange / 2 + (labelOffset?.y ?? 0),
    startPoint.z + zRange / 2 + (labelOffset?.z ?? 0)
  );
  /* eslint-disable react/no-unknown-property */
  return (
    <group>
      {Array.from({ length: tickCount }, (_, i) => {
        const tickMultiplier = (i + (tickBuffer ? .5 : 0)) / tickSpaces;
        const position = new Vector3(
          startPoint.x + xRange * tickMultiplier,
          startPoint.y + yRange * tickMultiplier,
          startPoint.z + zRange * tickMultiplier
        );
        return (
          <AxisTick
            direction={tickDirection}
            key={`axis-tick-${i}`}
            position={position}
            text={displayFunction(minValue + (maxValue - minValue) * tickMultiplier)}
          />
        );
      })}
      {label && (
        <group rotation={dstCamera.facingRotation} position={labelPosition}>
          <Text
            anchorX="center"
            anchorY="top"
            color="black"
            fontSize={.7}
            fontWeight={600}
            rotation={labelRotation}
          >
            {label}
          </Text>
        </group>
      )}
    </group>
  );
  /* eslint-enable react/no-unknown-property */
}
