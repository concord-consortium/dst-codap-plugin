import React from "react";
import { Vector3 } from "three";
import { formatDateString } from "../../utilities/date-utils";
import { AxisTick } from "./axis-tick";

const tickCount = 9;
const count = tickCount - 1;

interface IAxisProps {
  endPoint: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
}
export function TimeAxis({ endPoint, maxValue, minValue, startPoint }: IAxisProps) {
  return (
    <group>
      {Array.from({ length: tickCount }, (_, i) => {
        const value = minValue + (maxValue - minValue) / count * i;
        const dateDisplay = formatDateString(new Date(value));
        const startPosition = new Vector3(
          startPoint.x + (endPoint.x - startPoint.x) / count * i,
          startPoint.y + (endPoint.y - startPoint.y) / count * i,
          startPoint.z + (endPoint.z - startPoint.z) / count * i,
        );
        return (
          <AxisTick
            direction="left"
            key={`time-axis-tick-${i}`}
            position={startPosition}
            text={dateDisplay}
          />
        );
      })}
    </group>
  );
}
