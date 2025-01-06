import React from "react";
import { Vector3 } from "three";
import { AxisTick } from "./axis-tick";

const tickCount = 5;

interface IAxisProps {
  endPoint: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
  tickDirection: "up" | "down";
}
export function SpaceAxis({ endPoint, maxValue, minValue, startPoint, tickDirection }: IAxisProps) {
  return (
    <group>
      {Array.from({ length: tickCount }, (_, _i) => {
        const i = _i + .5;
        const value = minValue + (maxValue - minValue) / tickCount * i;
        const tickX = startPoint.x + (endPoint.x - startPoint.x) / tickCount * i;
        const tickY = startPoint.y + (endPoint.y - startPoint.y) / tickCount * i;
        const tickZ = startPoint.z + (endPoint.z - startPoint.z) / tickCount * i;
        const pivotPosition = new Vector3(tickX, tickY, tickZ);
        return (
          <AxisTick
            direction={tickDirection}
            key={`space-axis-tick-${i}`}
            position={pivotPosition}
            text={`${value.toFixed(1)}°`}
          />
        );
      })}
    </group>
  );
}
