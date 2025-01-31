import React from "react";
import { OrbitControls } from "@react-three/drei";
import { dstCamera } from "../models/camera";
import { ui } from "../models/ui";

interface IDSTOrbitControlsProps {
  cameraRef: React.MutableRefObject<any>;
  enabled?: boolean;
  name: string;
}
export function DSTOrbitControls({
  cameraRef, enabled = true, name
}: IDSTOrbitControlsProps) {

  const handleChange = () => {
    if (cameraRef.current && !dstCamera.animating && ui.activeControls === name) {
      const {x, y, z} = cameraRef.current.position;
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
