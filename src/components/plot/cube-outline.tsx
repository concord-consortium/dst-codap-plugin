import React from "react";
import { Vector3 } from "three";
import { PlotLine } from "./plot-line";

const xMax = 5;
const xMin = -5;
const yMax = 5;
const yMin = -5;
const zMax = 5;
const zMin = -5;

export function CubeOutline() {
  const AAA = new Vector3(xMax, yMax, zMax);
  const AAI = new Vector3(xMax, yMax, zMin);
  const AIA = new Vector3(xMax, yMin, zMax);
  const AII = new Vector3(xMax, yMin, zMin);
  const IAA = new Vector3(xMin, yMax, zMax);
  const IAI = new Vector3(xMin, yMax, zMin);
  const IIA = new Vector3(xMin, yMin, zMax);
  const III = new Vector3(xMin, yMin, zMin);
  return (
    <>
      <PlotLine points={[AAA, AAI, AII, AIA, AAA]} />
      <PlotLine points={[IAA, IAI, III, IIA, IAA]} />
      <PlotLine points={[AAA, IAA]} />
      <PlotLine points={[AAI, IAI]} />
      <PlotLine points={[AII, III]} />
      <PlotLine points={[AIA, IIA]} />
    </>
  );
}
