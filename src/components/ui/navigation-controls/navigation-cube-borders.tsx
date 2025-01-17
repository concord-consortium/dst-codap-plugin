import React from "react";
import { Box } from "@react-three/drei";
import { Vector3 } from "three";
import { kBorderPosition, kBorderSize, kNavigationCubeSize } from "./navigation-cube-constants";

type DimensionType = [Maybe<number>, Maybe<number>, Maybe<number>];
const xDimensions = [kNavigationCubeSize, kBorderSize, kBorderSize] as DimensionType;
const yDimensions = [kBorderSize, kNavigationCubeSize, kBorderSize] as DimensionType;
const zDimensions = [kBorderSize, kBorderSize, kNavigationCubeSize] as DimensionType;

interface IBorderProps {
  dimensions: DimensionType;
  position: Vector3;
}
function Border({ dimensions, position }: IBorderProps) {
  /* eslint-disable react/no-unknown-property */
  return (
    <Box args={dimensions} position={position}>
      <meshStandardMaterial attach="material" color="#177991" />
    </Box>
  );
  /* eslint-enable react/no-unknown-property */
}

export function NavigationCubeBorders() {
  return (
    <>
      <Border dimensions={xDimensions} position={new Vector3(0, kBorderPosition, kBorderPosition)} />
      <Border dimensions={xDimensions} position={new Vector3(0, kBorderPosition, -kBorderPosition)} />
      <Border dimensions={xDimensions} position={new Vector3(0, -kBorderPosition, kBorderPosition)} />
      <Border dimensions={xDimensions} position={new Vector3(0, -kBorderPosition, -kBorderPosition)} />
      <Border dimensions={yDimensions} position={new Vector3(kBorderPosition, 0, kBorderPosition)} />
      <Border dimensions={yDimensions} position={new Vector3(kBorderPosition, 0, -kBorderPosition)} />
      <Border dimensions={yDimensions} position={new Vector3(-kBorderPosition, 0, kBorderPosition)} />
      <Border dimensions={yDimensions} position={new Vector3(-kBorderPosition, 0, -kBorderPosition)} />
      <Border dimensions={zDimensions} position={new Vector3(kBorderPosition, kBorderPosition, 0)} />
      <Border dimensions={zDimensions} position={new Vector3(kBorderPosition, -kBorderPosition, 0)} />
      <Border dimensions={zDimensions} position={new Vector3(-kBorderPosition, kBorderPosition, 0)} />
      <Border dimensions={zDimensions} position={new Vector3(-kBorderPosition, -kBorderPosition, 0)} />
    </>
  );
}
