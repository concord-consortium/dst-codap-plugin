/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Vector3 } from "three";
import { dstCamera, zoomMax, zoomMin } from "../../models/camera";
import { modeType } from "../../types/ui-types";
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
  const [zPosition, setZPosition] = useState(-5);
  const { position, zoom } = dstCamera;
  const cameraPosition = new Vector3(position.x, position.y, position.z);

  return (
    <div className="w-full h-full relative scatter-plot" style={{backgroundColor: "#f9f9f9"}}>
      <Canvas>
        <CubeOutline />
        <OrthographicCamera
          makeDefault
          position={cameraPosition}
          ref={cameraRef}
          zoom={zoom}
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
        {/* <directionalLight position={cameraPosition} intensity={1} /> */}
        <Points />
        <GridPlane zPosition={zPosition} />
      </Canvas>
      <PlaneControls zPosition={zPosition} onZPositionChange={setZPosition} />
    </div>
  );
});
/* eslint-enable react/no-unknown-property */
