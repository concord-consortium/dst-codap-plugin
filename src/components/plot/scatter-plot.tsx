/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { zoomMax, zoomMin } from "../../models/camera";
import { modeType } from "../../types/ui-types";
import { DSTOrbitControls } from "../dst-orbit-controls";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { GridPlane } from "./grid-plane";
import { PlaneControls } from "./plane-controls";
import { Points } from "./points";
import "./scatter-plot.scss";

interface IScatterPlotProps {
  mode: modeType;
}
export const ScatterPlot = observer(function ScatterPlot({ mode }: IScatterPlotProps) {
  const cameraRef = useRef<any>(null);
  const [zPosition, setZPosition] = useState(-5);

  return (
    <div className="w-full h-full relative scatter-plot">
      <Canvas>
        <CubeOutline />
        <DSTCamera
          cameraRef={cameraRef}
        />
        <DSTOrbitControls
          cameraRef={cameraRef}
          enabled={mode === "pointer"}
          maxZoom={zoomMax}
          minZoom={zoomMin}
        />
        <ambientLight intensity={1.5} />
        <Points />
        <GridPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
