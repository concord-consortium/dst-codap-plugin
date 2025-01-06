import React from "react";
import { Vector3 } from "three";
import { formatDateString } from "../../utilities/date-utils";
import { Axis } from "./axis";

const tickCount = 9;

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
  return (
    <Axis
      displayFunction={renderTime}
      endPoint={endPoint}
      maxValue={maxValue}
      minValue={minValue}
      startPoint={startPoint}
      tickCount={tickCount}
      tickDirection="left"
    />
  );
}
