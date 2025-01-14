/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { dstCamera, zoomMax, zoomMin } from "../../models/camera";
import { modeType } from "../../types/ui-types";
import { CubeOutline } from "./cube-outline";
import { DSTCamera } from "./dst-camera";
import { GridPlane } from "./grid-plane";
import { PlaneControls } from "./plane-controls";
import { EfficientPoints } from "./efficient-points";
// import { Points } from "./points";
import "./scatter-plot.scss";

interface IScatterPlotProps {
  mode: modeType;
}
export const ScatterPlot = observer(function ScatterPlot({ mode }: IScatterPlotProps) {
  const cameraRef = useRef<any>(null);
  const [zPosition, setZPosition] = useState(-5);

  return (
    <div className="w-full h-full relative scatter-plot" style={{backgroundColor: "#f9f9f9"}}>
      <Canvas>
        <CubeOutline />
        <DSTCamera
          cameraRef={cameraRef}
        />
        {mode === "pointer" && (
          <OrbitControls
            enableDamping
            onChange={() => {
              if (cameraRef.current) {
                const {x, y, z} = cameraRef.current.position;
                dstCamera.setPosition(x, y, z);
                dstCamera.setZoom(cameraRef.current.zoom);
              }
            }}
            maxZoom={zoomMax}
            minZoom={zoomMin}
          />
        )}
        <ambientLight intensity={1.5} />
        <EfficientPoints />
        {/* <Points /> */}
        <GridPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
