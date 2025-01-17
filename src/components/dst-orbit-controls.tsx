import React from "react";
import { OrbitControls } from "@react-three/drei";
import { dstCamera } from "../models/camera";
import { ui } from "../models/ui";

interface IDSTOrbitControlsProps {
  cameraRef: React.MutableRefObject<any>;
  enabled?: boolean;
  enableZoom?: boolean;
  maxZoom?: number;
  minZoom?: number;
  name: string;
}
export function DSTOrbitControls({
  cameraRef, enabled = true, enableZoom = true, maxZoom, minZoom, name
}: IDSTOrbitControlsProps) {

  const handleChange = () => {
    if (cameraRef.current && !dstCamera.animating && ui.activeControls === name) {
      const {x, y, z} = cameraRef.current.position;
      dstCamera.setPosition(x, y, z);
    }
  };

  return (
    <OrbitControls
      enabled={enabled}
      enableDamping={false}
      enableZoom={enableZoom}
      maxZoom={maxZoom}
      minZoom={minZoom}
      onChange={handleChange}
    />
  );
}
