import React from "react";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { formatDateString } from "../../utilities/date-utils";
import { projectPoint } from "../../utilities/graph-utils";
import { halfPi } from "../../utilities/trig-utils";
import { PlotLine } from "./plot-line";

const tickCount = 9;
const tickLength = .5;
const labelBuffer = .25;

interface IAxisProps {
  endPoint: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
}
export function TimeAxis({ endPoint, maxValue, minValue, startPoint }: IAxisProps) {
  const cameraAngle = Math.atan((dstCamera.position.z - startPoint.z) / (dstCamera.position.x - startPoint.x));
  const multiplier = dstCamera.position.x - startPoint.x >= 0 ? 1 : -1;
  const tickAngle = cameraAngle + halfPi;
  const endTickX = startPoint.x + tickLength * multiplier * Math.cos(tickAngle);
  const endTickZ = startPoint.z + tickLength * multiplier * Math.sin(tickAngle);
  const endTickYOffset = Math.tan(dstCamera.pivot) / 8;
  return (
    <group>
      {Array.from({ length: tickCount + 1 }, (_, i) => {
        const value = minValue + (maxValue - minValue) / tickCount * i;
        const dateDisplay = formatDateString(new Date(value));
        const tickY = startPoint.y + (endPoint.y - startPoint.y) / tickCount * i;
        const startPosition = new Vector3(
          startPoint.x + (endPoint.x - startPoint.x) / tickCount * i,
          tickY,
          startPoint.z + (endPoint.z - startPoint.z) / tickCount * i,
        );
        const endPosition = new Vector3(endTickX, tickY + endTickYOffset, endTickZ);
        const textPosition = projectPoint(
          startPosition.x, startPosition.y, startPosition.z,
          endPosition.x, endPosition.y, endPosition.z, tickLength + labelBuffer
        );
        return (
          <group key={`time-axis-tick-${i}`}>
            <PlotLine points={[startPosition, endPosition]} />
            <Text
              position={new Vector3(textPosition.x, textPosition.y, textPosition.z)}
              fontSize={.5}
              color="black"
              anchorX="right"
              anchorY="middle"
              rotation={dstCamera.facingRotation}
            >
              {dateDisplay}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
