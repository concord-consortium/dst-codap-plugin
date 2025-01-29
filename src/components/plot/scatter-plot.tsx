/* eslint-disable react/no-unknown-property */
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, HueSaturation } from "@react-three/postprocessing";
import { graph } from "../../models/graph";
import { ui } from "../../models/ui";
import { DSTOrbitControls } from "../dst-orbit-controls";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { MapPlane } from "./map-plane";
import { MarqueeOverlay } from "./marquee-overlay";
import { Points } from "./points";
import "./scatter-plot.scss";

export const ScatterPlot = observer(function ScatterPlot() {
  const cameraRef = useRef<any>(null);
  const controlName = "scatter-plot-controls";
  const enableOrbitControls = ui.mode === "pointer";

  const handlePointerDown = () => {
    if (ui.mode === "pointer") {
      ui.setActiveControls(controlName);
    }
  };

  const plotClassName = clsx("w-full h-full relative scatter-plot", { "pointer-mode": enableOrbitControls });
  return (
    <div className="scatter-plot-container">
      <div className={plotClassName} onPointerDown={handlePointerDown}>
        <Canvas gl={{ localClippingEnabled: true }}>
          <CubeOutline />
          <DSTCamera
            cameraRef={cameraRef}
          />
          <DSTOrbitControls
            cameraRef={cameraRef}
            enabled={enableOrbitControls}
            name={controlName}
          />
          <ambientLight intensity={2.75} />
          <Points />
          <MapPlane zPosition={graph.mapPosition} />
          <EffectComposer>
            <HueSaturation saturation={0.05} />
          </EffectComposer>
        </Canvas>
        {ui.mode === "marquee" && <MarqueeOverlay cameraRef={cameraRef} />}
      </div>
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
