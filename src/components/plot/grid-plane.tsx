/* eslint-disable react/no-unknown-property */
import React from "react";
import { useTexture } from "@react-three/drei";
import map from "../../assets/USA_location_map.svg.png";
import { kBackgroundHeight, kBackgroundWidth } from "../../utilities/constants";
import { halfPi } from "../../utilities/trig-utils";

interface GridPlaneProps {
  zPosition: number;
}

export function GridPlane({ zPosition }: GridPlaneProps) {
  const texture = useTexture(map);

  return (
    <mesh rotation={[-halfPi, 0, -halfPi]} position={[0, zPosition, 0]}>
      <planeGeometry args={[10, 10 * kBackgroundHeight / kBackgroundWidth]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
/* eslint-enable react/no-unknown-property */
