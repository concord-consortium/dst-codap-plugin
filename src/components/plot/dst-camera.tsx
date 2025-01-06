import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../models/camera";

interface IDSTCameraProps {
  position: Vector3;
  ref: React.MutableRefObject<any>
}
export function DSTCamera({ position, ref }: IDSTCameraProps) {
  useFrame((_state, delta) => dstCamera.animate(delta * 1000));

  return (
    <PerspectiveCamera
      makeDefault
      position={position}
      ref={ref}
    />
  );
}
