import React from "react";
import { Box } from "@react-three/drei";
import { kNavigationCubeSize } from "../../../utilities/constants";
import { NavigationCubeBorders } from "./navigation-cube-borders";
import { NavigationCubeLabels } from "./navigation-cube-labels";

export function NavigationCube() {
  /* eslint-disable react/no-unknown-property */
  return (
    <>
      <Box args={[kNavigationCubeSize, kNavigationCubeSize, kNavigationCubeSize]}>
        <meshStandardMaterial attach="material" color="#FFFFFF" />
      </Box>
      <NavigationCubeBorders />
      <NavigationCubeLabels />
    </>
  );
}
/* eslint-enable react/no-unknown-property */
