import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../../models/camera";
import { DSTOrbitControls } from "../../dst-orbit-controls";
import { NavigationCube } from "./navigation-cube";
import "./navigation-cube-container.scss";

export const NavigationCubeContainer = observer(function NavigationCubeContainer() {
  const cameraRef = useRef<any>(null);
  const position = new Vector3(dstCamera.position.x, dstCamera.position.y, dstCamera.position.z);

  /* eslint-disable react/no-unknown-property */
  return (
    <div className="navigation-cube-container">
      <Canvas>
        <OrthographicCamera
          makeDefault
          position={position}
          ref={cameraRef}
          zoom={1.2}
        />
        <DSTOrbitControls
          cameraRef={cameraRef}
          enableZoom={false}
        />
        <ambientLight intensity={4} />
        <NavigationCube />
      </Canvas>
    </div>
  );
  /* eslint-enable react/no-unknown-property */
});
