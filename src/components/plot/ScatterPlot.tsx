/* eslint-disable react/no-unknown-property */
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Points, Point } from "./Points";
import { AxisLabels } from "./AxisLabels";
import { GridPlane } from "./GridPlane";
import { PlaneControls } from "./PlaneControls";

export function ScatterPlot() {
  const points = useRef(generatePoints(100));
  const gridSize = 10;
  const tickCount = 10;
  const [zPosition, setZPosition] = useState(-5);

  return (
    <div className="w-full h-full relative" style={{backgroundColor: "rgb(31 41 55)"}}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <OrbitControls enableDamping />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Points points={points.current} />
        <gridHelper args={[gridSize, tickCount]} />
        <axesHelper args={[gridSize / 2]} />
        <AxisLabels axis="x" length={gridSize} ticks={tickCount} />
        <AxisLabels axis="y" length={gridSize} ticks={tickCount} />
        <AxisLabels axis="z" length={gridSize} ticks={tickCount} />
        <GridPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
    </div>
  );
}

function generatePoints(count: number): Point[] {
  return Array.from({ length: count }, () => ({
    position: [
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
    ],
    color: `hsl(${Math.random() * 360}, 50%, 50%)`,
  }));
}
/* eslint-enable react/no-unknown-property */
