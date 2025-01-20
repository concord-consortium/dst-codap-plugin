/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { zoomMax, zoomMin } from "../../models/camera";
import { ui } from "../../models/ui";
import { DSTOrbitControls } from "../dst-orbit-controls";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { MapPlane } from "./map-plane";
import { PlaneControls } from "./plane-controls";
import { Points } from "./points";
import "./scatter-plot.scss";

export const ScatterPlot = observer(function ScatterPlot() {
  const cameraRef = useRef<any>(null);
  const [zPosition, setZPosition] = useState(-5);
  const controlName = "scatter-plot-controls";

  return (
    <div
      className="w-full h-full relative scatter-plot"
      onPointerDown={() => ui.setActiveControls(controlName)}
    >
      <Canvas gl={{ localClippingEnabled: true }}>
        <CubeOutline />
        <DSTCamera
          cameraRef={cameraRef}
        />
        <DSTOrbitControls
          cameraRef={cameraRef}
          enabled={ui.mode === "pointer"}
          maxZoom={zoomMax}
          minZoom={zoomMin}
          name={controlName}
        />
        <ambientLight intensity={1.5} />
        <Points />
        <MapPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
