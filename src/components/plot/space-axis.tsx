import React from "react";
import { Euler, Vector3 } from "three";
import { tickDirectionType } from "../../types/graph-types";
import { halfPi } from "../../utilities/trig-utils";
import { Axis } from "./axis";

const tickCount = 5;

function renderDegrees(value: number) {
  return `${value.toFixed(1)}°`;
}

interface IAxisProps {
  cameraRef?: any;
  endPoint: Vector3;
  label?: string;
  labelOffset?: Vector3;
  maxValue: number;
  minValue: number;
  startPoint: Vector3;
  tickDirection: tickDirectionType;
}
export function SpaceAxis({
  cameraRef, endPoint, label, labelOffset, maxValue, minValue, startPoint, tickDirection
}: IAxisProps) {
  let labelRotation = new Euler(0, 0, 0);
  if (cameraRef) {
    const ndcStartPoint = new Vector3(startPoint.x, startPoint.y, startPoint.z).project(cameraRef);
    const ndcEndPoint = new Vector3(endPoint.x, endPoint.y, endPoint.z).project(cameraRef);
    const leftPoint = ndcStartPoint.x < ndcEndPoint.x ? ndcStartPoint : ndcEndPoint;
    const rightPoint = ndcStartPoint.x < ndcEndPoint.x ? ndcEndPoint : ndcStartPoint;
    // When the axis is close to vertical, using atan can cause the label be flipped the wrong way
    const labelAngle = Math.abs(leftPoint.x - rightPoint.x) < .01
      ? tickDirection === "right" ? halfPi : -halfPi
      : Math.atan((rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x));
    labelRotation = new Euler(0, 0, labelAngle);
  }
  return (
    <Axis
      displayFunction={renderDegrees}
      endPoint={endPoint}
      label={label}
      labelOffset={labelOffset}
      labelRotation={labelRotation}
      maxValue={maxValue}
      minValue={minValue}
      startPoint={startPoint}
      tickBuffer={true}
      tickCount={tickCount}
      tickDirection={tickDirection}
    />
  );
}
