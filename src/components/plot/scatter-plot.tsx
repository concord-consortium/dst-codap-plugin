/* eslint-disable react/no-unknown-property */
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, HueSaturation } from "@react-three/postprocessing";
import { ui } from "../../models/ui";
import { DSTOrbitControls } from "../dst-orbit-controls";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { MapPlane } from "./map-plane";
import { MarqueeOverlay } from "./marquee-overlay";
import { InstancedPoints } from "./instanced-points";
import { QuadInstancedPoints, QUAD_LOD_THRESHOLD } from "./quad-instanced-points";
import "./scatter-plot.scss";
import { codapData } from "../../models/codap-data";

export const ScatterPlot = observer(function ScatterPlot() {
  const [cameraRef, setCameraRef] = useState<Maybe<any>>();
  const controlName = "scatter-plot-controls";
  const enableOrbitControls = ui.mode === "pointer";

  // Deselect-on-empty-cube-click state
  const dragThreshold = 5; // pixels
  const pointerState = React.useRef({
    down: false,
    startX: 0,
    startY: 0,
    moved: false,
    button: 0,
    onPoint: false,
    modifiers: { shift: false, ctrl: false, alt: false, meta: false }
  });

  // Helper to check if event is on a point (using event.target)
  const isEventOnPoint = (event: React.PointerEvent | PointerEvent) => {
    if (!event.target) return false;
    return (event.target as HTMLElement).nodeName !== "CANVAS";
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (ui.mode === "pointer") {
      ui.setActiveControls(controlName);
    }
    pointerState.current.down = true;
    pointerState.current.startX = event.clientX;
    pointerState.current.startY = event.clientY;
    pointerState.current.moved = false;
    pointerState.current.button = event.button;
    pointerState.current.onPoint = isEventOnPoint(event);
    pointerState.current.modifiers = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!pointerState.current.down) return;
    const dx = event.clientX - pointerState.current.startX;
    const dy = event.clientY - pointerState.current.startY;
    if (Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
      pointerState.current.moved = true;
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (!pointerState.current.down) return;
    pointerState.current.down = false;
    // Only act if not a drag, not on a point, left button, no modifiers
    const isClick = !pointerState.current.moved;
    const isLeftButton = pointerState.current.button === 0;
    const noModifiers = !pointerState.current.modifiers.shift && !pointerState.current.modifiers.ctrl && !pointerState.current.modifiers.alt && !pointerState.current.modifiers.meta;
    const onPoint = Boolean(isEventOnPoint(event));
    if (isClick && isLeftButton && noModifiers && !onPoint) {
      codapData.dataSet.setSelectedCases([]);
    }
  };

  const plotClassName = clsx("w-full h-full relative scatter-plot", { "pointer-mode": enableOrbitControls });
  return (
    <div className="scatter-plot-container">
      <div
        className={plotClassName}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Canvas gl={{ localClippingEnabled: true }}>
          <CubeOutline cameraRef={cameraRef} />
          <DSTCamera setCameraRef={setCameraRef} />
          <DSTOrbitControls
            cameraRef={cameraRef}
            enabled={enableOrbitControls}
            name={controlName}
          />
          <ambientLight intensity={2.75} />
          {/* LOD: spheres for small datasets, billboarded quads for large ones
              so weak GPUs stay interactive. Switch is purely point-count based. */}
          {codapData.caseIds.length >= QUAD_LOD_THRESHOLD ? <QuadInstancedPoints /> : <InstancedPoints />}
          <MapPlane />
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
