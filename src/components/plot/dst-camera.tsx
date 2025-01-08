import { observer } from "mobx-react-lite";
import React from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";

interface IDSTCameraProps {
  cameraRef: React.MutableRefObject<any>;
}
export const DSTCamera = observer(function DSTCamera({ cameraRef }: IDSTCameraProps) {
  useFrame((_state, delta) => dstCamera.animate(delta * 1000));
  const position = new Vector3(dstCamera.position.x, dstCamera.position.y, dstCamera.position.z);

  return (
    <OrthographicCamera
      makeDefault
      position={position}
      ref={cameraRef}
      zoom={dstCamera.zoom}
    />
  );
});
