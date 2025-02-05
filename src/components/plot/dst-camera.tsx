import { observer } from "mobx-react-lite";
import React from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";

interface IDSTCameraProps {
  setCameraRef: (ref: any) => void;
}
export const DSTCamera = observer(function DSTCamera({ setCameraRef }: IDSTCameraProps) {
  useFrame((_state, delta) => dstCamera.animate(delta * 1000));
  const position = new Vector3(dstCamera.position.x, dstCamera.position.y, dstCamera.position.z);

  return (
    <OrthographicCamera
      makeDefault
      position={position}
      ref={ref => setCameraRef(ref)}
      zoom={dstCamera.zoom}
    />
  );
});
