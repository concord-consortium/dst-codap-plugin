import React, { useRef, useState } from "react";
import { Box } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import { dstCamera } from "../../../models/camera";

interface clickPositionType {
  x: number;
  y: number;
}

interface INavigationCubeCornerProps {
  position: Vector3;
  size: [number, number, number];
  targetPivot: number;
  targetRotation: number;
}
export function NavigationCubeButton({ position, size, targetPivot, targetRotation }: INavigationCubeCornerProps) {
  const [hovering, setHovering] = useState(false);
  const clickPosition = useRef<clickPositionType|null>(null);
  const opacity = hovering ? 0.5 : 0;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    // Only rotate to the proper location if the user didn't drag the cube.
    if (clickPosition.current != null) {
      const { x, y } = clickPosition.current;
      const distanceSquared = (event.clientX - x) ** 2 + (event.clientY - y) ** 2;
      if (distanceSquared < 25) {
        dstCamera.animateTo({ pivot: targetPivot, rotation: targetRotation });
      }
    }

    clickPosition.current = null;
    setHovering(false);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clickPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovering(true);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovering(false);
  };

  /* eslint-disable react/no-unknown-property */
  return (
    <Box
      args={size}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      position={position}
    >
      <meshStandardMaterial attach="material" color="#177991" opacity={opacity} transparent={true} />
    </Box>
  );
  /* eslint-enable react/no-unknown-property */
}
