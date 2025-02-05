import React from "react";
import { OrbitControls } from "@react-three/drei";
import { dstCamera } from "../models/camera";
import { ui } from "../models/ui";

interface IDSTOrbitControlsProps {
  cameraRef?: any;
  enabled?: boolean;
  name: string;
}
export function DSTOrbitControls({
  cameraRef, enabled = true, name
}: IDSTOrbitControlsProps) {

  const handleChange = () => {
    if (cameraRef?.position && !dstCamera.animating && ui.activeControls === name) {
      const {x, y, z} = cameraRef.position;
      dstCamera.setPosition(x, y, z);
    }
  };

  return (
    <OrbitControls
      enableDamping={false}
      enableRotate={enabled}
      enableZoom={false}
      onChange={handleChange}
    />
  );
}
