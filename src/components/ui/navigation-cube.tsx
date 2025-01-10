import React from "react";
import { Box } from "@react-three/drei";
import { Vector3 } from "three";

export function NavigationCube() {
  const boxDimension = 30;
  const borderDimension = 2;
  const borderOffset = 14.1;
  /* eslint-disable react/no-unknown-property */
  return (
    <>
      <Box args={[boxDimension, boxDimension, boxDimension]}>
        <meshStandardMaterial attach="material" color="#FFFFFF" />
      </Box>
      <Box args={[borderDimension, borderDimension, boxDimension]} position={new Vector3(borderOffset, borderOffset, 0)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, borderDimension, boxDimension]} position={new Vector3(borderOffset, -borderOffset, 0)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, borderDimension, boxDimension]} position={new Vector3(-borderOffset, -borderOffset, 0)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, borderDimension, boxDimension]} position={new Vector3(-borderOffset, borderOffset, 0)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, boxDimension, borderDimension]} position={new Vector3(borderOffset, 0, borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, boxDimension, borderDimension]} position={new Vector3(borderOffset, 0, -borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, boxDimension, borderDimension]} position={new Vector3(-borderOffset, 0, -borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[borderDimension, boxDimension, borderDimension]} position={new Vector3(-borderOffset, 0, borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[boxDimension, borderDimension, borderDimension]} position={new Vector3(0, borderOffset, borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[boxDimension, borderDimension, borderDimension]} position={new Vector3(0, borderOffset, -borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[boxDimension, borderDimension, borderDimension]} position={new Vector3(0, -borderOffset, -borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
      <Box args={[boxDimension, borderDimension, borderDimension]} position={new Vector3(0, -borderOffset, borderOffset)}>
        <meshStandardMaterial attach="material" color="#177991" />
      </Box>
    </>
  );
}
/* eslint-enable react/no-unknown-property */
