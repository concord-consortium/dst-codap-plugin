import React from "react";
import { OrbitControls } from "@react-three/drei";
import { dstCamera } from "../models/camera";

interface IDSTOrbitControlsProps {
  cameraRef: React.MutableRefObject<any>;
  enabled?: boolean;
  enableZoom?: boolean;
  maxZoom?: number;
  minZoom?: number;
}
export function DSTOrbitControls({
  cameraRef, enabled = true, enableZoom = true, maxZoom, minZoom
}: IDSTOrbitControlsProps) {

  const handleChange = () => {
    if (cameraRef.current) {
      const {x, y, z} = cameraRef.current.position;
      dstCamera.setPosition(x, y, z);
    }
  };

  return (
    <OrbitControls
      enabled={enabled}
      enableZoom={enableZoom}
      maxZoom={maxZoom}
      minZoom={minZoom}
      onChange={handleChange}
    />
  );
}
