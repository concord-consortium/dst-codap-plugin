/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import { modeType } from "../../types/ui-types";
import { AxisLabels } from "./axis-labels";
import { CubeOutline } from "./cube-outline";
import { GridPlane } from "./grid-plane";
import { PlaneControls } from "./plane-controls";
import { Points } from "./points";
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
  const cameraPosition = new Vector3(position.x, position.y, position.z);

  return (
    <div className="w-full h-full relative scatter-plot" style={{backgroundColor: "#f9f9f9"}}>
      <Canvas>
        <CubeOutline />
        <OrthographicCamera
          makeDefault
          position={cameraPosition}
          ref={cameraRef}
          zoom={25}
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
        <ambientLight intensity={1.5} />
        {/* <directionalLight position={cameraPosition} intensity={1} /> */}
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
