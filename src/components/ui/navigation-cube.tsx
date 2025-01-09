import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";
import "./navigation-cube.scss";

export const NavigationCube = observer(function NavigationCube() {
  const cameraRef = useRef<any>(null);
  const position = new Vector3(dstCamera.position.x, dstCamera.position.y, dstCamera.position.z);

  /* eslint-disable react/no-unknown-property */
  return (
    <div className="navigation-cube-canvas">
      <Canvas>
        <OrthographicCamera
          makeDefault
          position={position}
          ref={cameraRef}
        />
        <OrbitControls
          enableDamping
          onChange={() => {
            if (cameraRef.current) {
              const {x, y, z} = cameraRef.current.position;
              dstCamera.setPosition(x, y, z);
            }
          }}
          enableZoom={false}
        />
        <ambientLight intensity={1.5} />
      </Canvas>
    </div>
  );
  /* eslint-enable react/no-unknown-property */
});
