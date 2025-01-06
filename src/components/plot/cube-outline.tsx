import { observer } from "mobx-react-lite";
import React from "react";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { PlotLine } from "./plot-line";
import { dataRanges } from "../../utilities/graph-utils";
import { halfPi } from "../../utilities/trig-utils";
import { TimeAxis } from "./time-axis";
import { SpaceAxis } from "./space-axis";

const xMax = 5;
const xMin = -5;
const yMax = 5;
const yMin = -5;
const zMax = 5;
const zMin = -5;

export const CubeOutline = observer(function CubeOutline() {
  const { pivot, rotation } = dstCamera;

  const AAA = new Vector3(xMax, yMax, zMax);
  const AAI = new Vector3(xMax, yMax, zMin);
  const AIA = new Vector3(xMax, yMin, zMax);
  const AII = new Vector3(xMax, yMin, zMin);
  const IAA = new Vector3(xMin, yMax, zMax);
  const IAI = new Vector3(xMin, yMax, zMin);
  const IIA = new Vector3(xMin, yMin, zMax);
  const III = new Vector3(xMin, yMin, zMin);

  const topSpaceAxis = pivot < 0;
  const spaceY = topSpaceAxis ? yMax : yMin;
  const tickDirection = topSpaceAxis ? "up" : "down";
  const xAxisZ = rotation > Math.PI ? zMax : zMin;

  const displayTimeAxis = pivot > -3/8 * Math.PI && pivot < 3/8 * Math.PI;
  const yAxisX = rotation >= Math.PI ? xMin : xMax;
  const yAxisZ = rotation > halfPi && rotation < 3 * halfPi ? zMax : zMin;

  const zAxisX = rotation < halfPi || rotation > 3 * halfPi ? xMin : xMax;

  return (
    <>
      <PlotLine points={[AAA, AAI, AII, AIA, AAA]} />
      <PlotLine points={[IAA, IAI, III, IIA, IAA]} />
      <PlotLine points={[AAA, IAA]} />
      <PlotLine points={[AAI, IAI]} />
      <PlotLine points={[AII, III]} />
      <PlotLine points={[AIA, IIA]} />
      <SpaceAxis
        startPoint={new Vector3(xMin, spaceY, xAxisZ)}
        endPoint={new Vector3(xMax, spaceY, xAxisZ)}
        minValue={dataRanges.latMin}
        maxValue={dataRanges.latMax}
        tickDirection={tickDirection}
      />
      {displayTimeAxis && (
        <TimeAxis
          startPoint={new Vector3(yAxisX, yMin, yAxisZ)}
          endPoint={new Vector3(yAxisX, yMax, yAxisZ)}
          minValue={dataRanges.dateMin}
          maxValue={dataRanges.dateMax}
        />
      )}
      <SpaceAxis
        startPoint={new Vector3(zAxisX, spaceY, zMin)}
        endPoint={new Vector3(zAxisX, spaceY, zMax)}
        minValue={dataRanges.longMin}
        maxValue={dataRanges.longMax}
        tickDirection={tickDirection}
      />
    </>
  );
});
