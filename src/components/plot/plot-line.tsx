import React from "react";
import { Vector3 } from "three";
import { Line } from "@react-three/drei";

interface IPlotLineProps {
  points: Vector3[];
}
export function PlotLine({ points }: IPlotLineProps) {
  return (
    <Line
      points={points.map(v => ([v.x, v.y, v.z]))}
      color="black"
      lineWidth={2}
    />
  );
}
