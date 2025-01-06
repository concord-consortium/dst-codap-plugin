import React from "react";
import { Vector3 } from "three";
import { tickDirectionType } from "../../types/graph-types";
import { Axis } from "./axis";

const tickCount = 5;

function renderDegrees(value: number) {
  return `${value.toFixed(1)}°`;
}

interface IAxisProps {
  endPoint: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
  tickDirection: tickDirectionType;
}
export function SpaceAxis({ endPoint, maxValue, minValue, startPoint, tickDirection }: IAxisProps) {
  return (
    <Axis
      displayFunction={renderDegrees}
      endPoint={endPoint}
      maxValue={maxValue}
      minValue={minValue}
      startPoint={startPoint}
      tickBuffer={true}
      tickCount={tickCount}
      tickDirection={tickDirection}
    />
  );
}
