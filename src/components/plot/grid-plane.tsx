import { observer } from "mobx-react-lite";
import React from "react";
import { useTexture } from "@react-three/drei";
import map from "../../assets/USA_location_map.svg.png";
import { backgroundLongRange, kBackgroundHeight, kBackgroundWidth } from "../../utilities/constants";
import { dataRanges } from "../../utilities/graph-utils";
import { halfPi } from "../../utilities/trig-utils";

interface GridPlaneProps {
  zPosition: number;
}

export const GridPlane = observer(function GridPlane({ zPosition }: GridPlaneProps) {
  const texture = useTexture(map);
  const scale = backgroundLongRange / dataRanges.latRange;

  /* eslint-disable react/no-unknown-property */
  return (
    <mesh rotation={[-halfPi, 0, -halfPi]} position={[0, zPosition, 0]}>
      <planeGeometry args={[10 * scale, 10 * scale * kBackgroundHeight / kBackgroundWidth]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
});
