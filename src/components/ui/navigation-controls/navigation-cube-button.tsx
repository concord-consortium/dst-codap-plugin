import React, { useState } from "react";
import { Box } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../../models/camera";

interface INavigationCubeCornerProps {
  position: Vector3;
  size: [number, number, number];
  targetPivot: number;
  targetRotation: number;
}
export function NavigationCubeButton({ position, size, targetPivot, targetRotation }: INavigationCubeCornerProps) {
  const [hovering, setHovering] = useState(false);
  const opacity = hovering ? 0.5 : 0.2;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    dstCamera.animateTo(dstCamera.targetZoom ?? dstCamera.zoom, targetPivot, targetRotation);
    setHovering(false);
  };

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovering(true);
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovering(false);
  };

  /* eslint-disable react/no-unknown-property */
  return (
    <Box
      args={size}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      position={position}
    >
      <meshStandardMaterial attach="material" color="#177991" opacity={opacity} transparent={true} />
    </Box>
  );
  /* eslint-enable react/no-unknown-property */
}
