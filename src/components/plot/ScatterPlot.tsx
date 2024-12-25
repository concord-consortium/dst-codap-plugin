/* eslint-disable react/no-unknown-property */
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { AxisLabels } from "./AxisLabels";
import { GridPlane } from "./GridPlane";
import { PlaneControls } from "./PlaneControls";
import { Points } from "./Points";
import "./scatter-plot.scss";

export function ScatterPlot() {
  const gridSize = 10;
  const tickCount = 10;
  const [zPosition, setZPosition] = useState(-5);

  return (
    <div className="w-full h-full relative scatter-plot" style={{backgroundColor: "#f9f9f9"}}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[-10, 14, 0]} />
        <OrbitControls enableDamping />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Points />
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
/* eslint-enable react/no-unknown-property */
