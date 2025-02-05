import React from "react";
import { Euler, Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { formatDateString } from "../../utilities/date-utils";
import { halfPi } from "../../utilities/trig-utils";
import { Axis } from "./axis";

const tickCount = 9;
const baseLabelOffset = 3.5;

function renderTime(value: number) {
  return formatDateString(new Date(value));
}

interface IAxisProps {
  endPoint: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
}
export function TimeAxis({ endPoint, maxValue, minValue, startPoint }: IAxisProps) {
  const labelOffset = new Vector3(
    baseLabelOffset * Math.sin(dstCamera.rotation),
    0,
    -baseLabelOffset * Math.cos(dstCamera.rotation)
  );
  return (
    <Axis
      displayFunction={renderTime}
      endPoint={endPoint}
      label="z: Time"
      labelOffset={labelOffset}
      labelRotation={new Euler(0, 0, -halfPi, "YXZ")}
      maxValue={maxValue}
      minValue={minValue}
      startPoint={startPoint}
      tickCount={tickCount}
      tickDirection="left"
    />
  );
}
