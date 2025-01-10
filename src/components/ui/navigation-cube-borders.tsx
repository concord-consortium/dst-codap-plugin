import React from "react";
import { Box } from "@react-three/drei";
import { Vector3 } from "three";
import { kNavigationCubeSize } from "../../utilities/constants";

const borderDimension = 2;
const borderOffset = 14.1;

type DimensionType = [Maybe<number>, Maybe<number>, Maybe<number>];
const xDimensions = [kNavigationCubeSize, borderDimension, borderDimension] as DimensionType;
const yDimensions = [borderDimension, kNavigationCubeSize, borderDimension] as DimensionType;
const zDimensions = [borderDimension, borderDimension, kNavigationCubeSize] as DimensionType;

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
      <Border dimensions={xDimensions} position={new Vector3(0, borderOffset, borderOffset)} />
      <Border dimensions={xDimensions} position={new Vector3(0, borderOffset, -borderOffset)} />
      <Border dimensions={xDimensions} position={new Vector3(0, -borderOffset, borderOffset)} />
      <Border dimensions={xDimensions} position={new Vector3(0, -borderOffset, -borderOffset)} />
      <Border dimensions={yDimensions} position={new Vector3(borderOffset, 0, borderOffset)} />
      <Border dimensions={yDimensions} position={new Vector3(borderOffset, 0, -borderOffset)} />
      <Border dimensions={yDimensions} position={new Vector3(-borderOffset, 0, borderOffset)} />
      <Border dimensions={yDimensions} position={new Vector3(-borderOffset, 0, -borderOffset)} />
      <Border dimensions={zDimensions} position={new Vector3(borderOffset, borderOffset, 0)} />
      <Border dimensions={zDimensions} position={new Vector3(borderOffset, -borderOffset, 0)} />
      <Border dimensions={zDimensions} position={new Vector3(-borderOffset, borderOffset, 0)} />
      <Border dimensions={zDimensions} position={new Vector3(-borderOffset, -borderOffset, 0)} />
    </>
  );
}
