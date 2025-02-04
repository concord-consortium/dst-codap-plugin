import { observer } from "mobx-react-lite";
import React from "react";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { tickDirectionType } from "../../types/graph-types";
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

interface ICubeOutlineProps {
  cameraRef: React.MutableRefObject<any>;
}
export const CubeOutline = observer(function CubeOutline({ cameraRef }: ICubeOutlineProps) {
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
  let xDirection: tickDirectionType = "right";
  const xHorizontalOffset = (topSpaceAxis ? 3 : 1.75) + Math.abs(Math.cos(rotation) * .5);
  const xVerticalOffset = Math.abs(Math.sin(pivot)) * xHorizontalOffset;
  let xZOffset = 0;
  if (rotation < Math.PI / 8) {
    xDirection = "left";
    xZOffset = -xHorizontalOffset;
  } else if (rotation < Math.PI * 7 / 8) {
    xDirection = spaceTickDirection;
    xZOffset = -xVerticalOffset;
  } else if (rotation < Math.PI) {
    xDirection = "right";
    xZOffset = -xHorizontalOffset;
  } else if (rotation < Math.PI * 9 / 8) {
    xDirection = "left";
    xZOffset = xHorizontalOffset;
  } else if (rotation < Math.PI * 15 / 8) {
    xDirection = spaceTickDirection;
    xZOffset = xVerticalOffset;
  } else {
    xDirection = "right";
    xZOffset = xHorizontalOffset;
  }
  const displayXAxis = !horizontalView || xDirection === spaceTickDirection;
  const xYOffset = xDirection === spaceTickDirection ? Math.cos(pivot) * (topSpaceAxis ? 3 : -2) : 0;
  const xLabelOffset = new Vector3(0, xYOffset, xZOffset);

  // The y (time) axis
  const displayTimeAxis = pivot > -3/8 * Math.PI && pivot < 3/8 * Math.PI;
  const yAxisX = rotation >= Math.PI ? xMin : xMax;
  const yAxisZ = rotation > halfPi && rotation < 3 * halfPi ? zMax : zMin;

  // The z (longitude) axis
  const zAxisX = rotation < halfPi || rotation > 3 * halfPi ? xMin : xMax;
  let zDirection: tickDirectionType = "right";
  const zHorizontalOffset = (topSpaceAxis ? 3.5 : 1.8) + Math.abs(Math.sin(rotation) * .5);
  const zVerticalOffset = Math.abs(Math.sin(pivot)) * xHorizontalOffset;
  let zXOffset = 0;
  if (rotation < Math.PI * 3 / 8) {
    zDirection = spaceTickDirection;
    zXOffset = -zVerticalOffset;
  } else if (rotation < halfPi) {
    zDirection = "right";
    zXOffset = -zHorizontalOffset;
  } else if (rotation < Math.PI * 5 / 8) {
    zDirection = "left";
    zXOffset = zHorizontalOffset;
  } else if (rotation < Math.PI * 11 / 8) {
    zDirection = spaceTickDirection;
    zXOffset = zVerticalOffset;
  } else if (rotation < halfPi * 3) {
    zDirection = "right";
    zXOffset = zHorizontalOffset;
  } else if (rotation < Math.PI * 13 / 8) {
    zDirection = "left";
    zXOffset = -zHorizontalOffset;
  } else {
    zDirection = spaceTickDirection;
    zXOffset = -zVerticalOffset;
  }
  const displayZAxis = !horizontalView || zDirection === spaceTickDirection;
  const zYOffset = zDirection === spaceTickDirection ? Math.cos(pivot) * (topSpaceAxis ? 3 : -2) : 0;
  const zLabelOffset = new Vector3(zXOffset, zYOffset, 0);

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
          cameraRef={cameraRef}
          endPoint={new Vector3(xMax, spaceY, xAxisZ)}
          label="y: Latitude"
          labelOffset={xLabelOffset}
          minValue={graph.minLatitude}
          maxValue={graph.maxLatitude}
          startPoint={new Vector3(xMin, spaceY, xAxisZ)}
          tickDirection={xDirection}
        />
      )}
      {displayTimeAxis && (
        <TimeAxis
          endPoint={new Vector3(yAxisX, yMax, yAxisZ)}
          minValue={graph.minDate}
          startPoint={new Vector3(yAxisX, yMin, yAxisZ)}
          maxValue={graph.maxDate}
        />
      )}
      {displayZAxis && (
        <SpaceAxis
          cameraRef={cameraRef}
          endPoint={new Vector3(zAxisX, spaceY, zMax)}
          label="x: Longitude"
          labelOffset={zLabelOffset}
          minValue={graph.minLongitude}
          maxValue={graph.maxLongitude}
          startPoint={new Vector3(zAxisX, spaceY, zMin)}
          tickDirection={zDirection}
        />
      )}
    </>
  );
});
