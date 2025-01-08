import React from "react";
import { Vector3 } from "three";
import { tickDirectionType } from "../../types/graph-types";
import { AxisTick } from "./axis-tick";

interface IAxisProps {
  displayFunction: (value: number) => string;
  endPoint: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
  tickBuffer?: boolean;
  tickCount: number;
  tickDirection: tickDirectionType;
}
export function Axis({
  displayFunction, endPoint, maxValue, minValue, startPoint, tickBuffer, tickCount, tickDirection
}: IAxisProps) {
  const tickSpaces = tickCount - (tickBuffer ? 0 : 1);
  return (
    <group>
      {Array.from({ length: tickCount }, (_, i) => {
        const tickMultiplier = (i + (tickBuffer ? .5 : 0)) / tickSpaces;
        const position = new Vector3(
          startPoint.x + (endPoint.x - startPoint.x) * tickMultiplier,
          startPoint.y + (endPoint.y - startPoint.y) * tickMultiplier,
          startPoint.z + (endPoint.z - startPoint.z) * tickMultiplier
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
    </group>
  );
}
