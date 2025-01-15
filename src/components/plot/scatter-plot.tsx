/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { zoomMax, zoomMin } from "../../models/camera";
import { uiState } from "../../models/ui";
import { modeType } from "../../types/ui-types";
import { DSTOrbitControls } from "../dst-orbit-controls";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { GridPlane } from "./grid-plane";
import { PlaneControls } from "./plane-controls";
import { FlatEfficientPoints } from "./flat-efficient-points";
// import { EfficientPoints } from "./efficient-points";
// import { Points } from "./points";
import "./scatter-plot.scss";

interface IScatterPlotProps {
  mode: modeType;
}
export const ScatterPlot = observer(function ScatterPlot({ mode }: IScatterPlotProps) {
  const cameraRef = useRef<any>(null);
  const [zPosition, setZPosition] = useState(-5);
  const controlName = "scatter-plot-controls";

  return (
    <div
      className="w-full h-full relative scatter-plot"
      onPointerDown={() => uiState.setActiveControls(controlName)}
    >
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
          name={controlName}
        />
        <ambientLight intensity={1.5} />
        <FlatEfficientPoints />
        {/* <Points /> */}
        <GridPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
