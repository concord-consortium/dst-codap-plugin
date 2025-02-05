import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../../models/camera";
import { ui } from "../../../models/ui";
import { DSTOrbitControls } from "../../dst-orbit-controls";
import { NavigationCube } from "./navigation-cube";
import "./navigation-cube-container.scss";

export const NavigationCubeContainer = observer(function NavigationCubeContainer() {
  const [cameraRef, setCameraRef] = useState<any>(null);
  const position = new Vector3(dstCamera.position.x, dstCamera.position.y, dstCamera.position.z);
  const controlName = "navigation-plot-controls";

  /* eslint-disable react/no-unknown-property */
  return (
    <div
      className="navigation-cube-container"
      onPointerDown={() => ui.setActiveControls(controlName)}
    >
      <Canvas>
        <OrthographicCamera
          makeDefault
          position={position}
          ref={ref => setCameraRef(ref)}
          zoom={1.2}
        />
        <DSTOrbitControls
          cameraRef={cameraRef}
          name={controlName}
        />
        <ambientLight intensity={4} />
        <NavigationCube />
      </Canvas>
    </div>
  );
  /* eslint-enable react/no-unknown-property */
});
