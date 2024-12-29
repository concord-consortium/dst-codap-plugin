/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { dstCamera } from "../../models/camera";
import { modeType } from "../../types/ui-types";
import { AxisLabels } from "./AxisLabels";
import { GridPlane } from "./GridPlane";
import { PlaneControls } from "./PlaneControls";
import { Points } from "./Points";
import "./scatter-plot.scss";

interface IScatterPlotProps {
  mode: modeType;
}
export const ScatterPlot = observer(function ScatterPlot({ mode }: IScatterPlotProps) {
  const cameraRef = useRef<any>(null);
  const gridSize = 10;
  const tickCount = 10;
  const [zPosition, setZPosition] = useState(-5);
  const { position } = dstCamera;

  return (
    <div className="w-full h-full relative scatter-plot" style={{backgroundColor: "#f9f9f9"}}>
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={[position.x, position.y, position.z]}
          ref={cameraRef}
        />
        {mode === "pointer" && (
          <OrbitControls enableDamping
            onChange={() => {
              if (cameraRef.current) {
                const {x, y, z} = cameraRef.current.position;
                dstCamera.setPosition(x, y, z);
              }
            }}
          />
        )}
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
});
/* eslint-enable react/no-unknown-property */
