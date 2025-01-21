import { observer } from "mobx-react-lite";
import React from "react";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { halfPi } from "../../utilities/trig-utils";
import { PlotLine } from "./plot-line";
import { SpaceAxis } from "./space-axis";
import { TimeAxis } from "./time-axis";

const xMax = 5;
const xMin = -5;
const yMax = 5;
const yMin = -5;
const zMax = 5;
const zMin = -5;

export const CubeOutline = observer(function CubeOutline() {
  const { pivot, rotation } = dstCamera;

  // The corners of the cube
  const AAA = new Vector3(xMax, yMax, zMax);
  const AAI = new Vector3(xMax, yMax, zMin);
  const AIA = new Vector3(xMax, yMin, zMax);
  const AII = new Vector3(xMax, yMin, zMin);
  const IAA = new Vector3(xMin, yMax, zMax);
  const IAI = new Vector3(xMin, yMax, zMin);
  const IIA = new Vector3(xMin, yMin, zMax);
  const III = new Vector3(xMin, yMin, zMin);

  // Information relevant to both space axes
  const topSpaceAxis = pivot < 0;
  const spaceY = topSpaceAxis ? yMax : yMin;
  const spaceTickDirection = topSpaceAxis ? "up" : "down";
  const horizontalView = Math.abs(pivot) < Math.PI / 10;

  // The x (latitude) axis
  const xAxisZ = rotation > Math.PI ? zMax : zMin;
  const xDirection = rotation < Math.PI / 8 ? "left"
    : rotation < Math.PI * 7 / 8 ? spaceTickDirection
    : rotation < Math.PI ? "right"
    : rotation < Math.PI * 9 / 8 ? "left"
    : rotation < Math.PI * 15 / 8 ? spaceTickDirection
    : "right";
  const displayXAxis = !horizontalView || xDirection === spaceTickDirection;

  // The y (time) axis
  const displayTimeAxis = pivot > -3/8 * Math.PI && pivot < 3/8 * Math.PI;
  const yAxisX = rotation >= Math.PI ? xMin : xMax;
  const yAxisZ = rotation > halfPi && rotation < 3 * halfPi ? zMax : zMin;

  // The z (longitude) axis
  const zAxisX = rotation < halfPi || rotation > 3 * halfPi ? xMin : xMax;
  const zDirection = rotation < Math.PI * 3 / 8 ? spaceTickDirection
    : rotation < halfPi ? "right"
    : rotation < Math.PI * 5 / 8 ? "left"
    : rotation < Math.PI * 11 / 8 ? spaceTickDirection
    : rotation < halfPi * 3 ? "right"
    : rotation < Math.PI * 13 / 8 ? "left"
    : spaceTickDirection;
  const displayZAxis = !horizontalView || zDirection === spaceTickDirection;

  return (
    <>
      <PlotLine points={[AAA, AAI, AII, AIA, AAA]} />
      <PlotLine points={[IAA, IAI, III, IIA, IAA]} />
      <PlotLine points={[AAA, IAA]} />
      <PlotLine points={[AAI, IAI]} />
      <PlotLine points={[AII, III]} />
      <PlotLine points={[AIA, IIA]} />
      {displayXAxis && (
        <SpaceAxis
          startPoint={new Vector3(xMin, spaceY, xAxisZ)}
          endPoint={new Vector3(xMax, spaceY, xAxisZ)}
          minValue={graph.minLatitude}
          maxValue={graph.maxLatitude}
          tickDirection={xDirection}
        />
      )}
      {displayTimeAxis && (
        <TimeAxis
          startPoint={new Vector3(yAxisX, yMin, yAxisZ)}
          endPoint={new Vector3(yAxisX, yMax, yAxisZ)}
          minValue={graph.dateMin}
          maxValue={graph.dateMax}
        />
      )}
      {displayZAxis && (
        <SpaceAxis
          startPoint={new Vector3(zAxisX, spaceY, zMin)}
          endPoint={new Vector3(zAxisX, spaceY, zMax)}
          minValue={graph.minLongitude}
          maxValue={graph.maxLongitude}
          tickDirection={zDirection}
        />
      )}
    </>
  );
});
