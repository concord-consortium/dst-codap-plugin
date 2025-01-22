/* eslint-disable react/no-unknown-property */
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { zoomMax, zoomMin } from "../../models/camera";
import { ui } from "../../models/ui";
import { DSTOrbitControls } from "../dst-orbit-controls";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { MapPlane } from "./map-plane";
import { MarqueeOverlay } from "./marquee-overlay";
import { PlaneControls } from "./plane-controls";
import { Points } from "./points";
import "./scatter-plot.scss";

export const ScatterPlot = observer(function ScatterPlot() {
  const ref = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<any>(null);
  const [zPosition, setZPosition] = useState(-5);
  const controlName = "scatter-plot-controls";
  const enableOrbitControls = ui.mode === "pointer";

  const handlePointerDown = () => {
    if (ui.mode === "pointer") {
      ui.setActiveControls(controlName);
    }
  };

  return (
    <div
      className={clsx("w-full h-full relative scatter-plot", { "pointer-mode": enableOrbitControls })}
      onPointerDown={handlePointerDown}
      ref={ref}
    >
      <Canvas gl={{ localClippingEnabled: true }}>
        <CubeOutline />
        <DSTCamera
          cameraRef={cameraRef}
        />
        <DSTOrbitControls
          cameraRef={cameraRef}
          enabled={enableOrbitControls}
          maxZoom={zoomMax}
          minZoom={zoomMin}
          name={controlName}
        />
        <ambientLight intensity={1.5} />
        <Points />
        <MapPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
      {ui.mode === "marquee" && <MarqueeOverlay cameraRef={cameraRef} containerRef={ref} />}
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
