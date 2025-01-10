import React from "react";
import { Box } from "@react-three/drei";
import { kNavigationCubeSize } from "../../utilities/constants";
import { NavigationCubeBorders } from "./navigation-cube-borders";

export function NavigationCube() {
  /* eslint-disable react/no-unknown-property */
  return (
    <>
      <Box args={[kNavigationCubeSize, kNavigationCubeSize, kNavigationCubeSize]}>
        <meshStandardMaterial attach="material" color="#FFFFFF" />
      </Box>
      <NavigationCubeBorders />
      {/* <Text
        position={textPosition}
        fontSize={.5}
        color="black"
        anchorX={anchorX}
        anchorY={anchorY}
      >
        {text}
      </Text> */}
    </>
  );
}
/* eslint-enable react/no-unknown-property */
