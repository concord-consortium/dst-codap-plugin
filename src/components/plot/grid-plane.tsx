import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { Plane, Vector3 } from "three";
import map from "../../assets/USA_location_map.svg.png";
import { backgroundLongRange, kBackgroundHeight, kBackgroundWidth } from "../../utilities/constants";
import { dataRanges, graphMax, graphMin } from "../../utilities/graph-utils";
import { halfPi } from "../../utilities/trig-utils";

const mapBaseSize = graphMax - graphMin;

interface IMapPlaneProps {
  zPosition: number;
}
export const MapPlane = observer(function MapPlane({ zPosition }: IMapPlaneProps) {
  const texture = useTexture(map);
  const scale = backgroundLongRange / dataRanges.latRange;

  const clippingPlanes = useMemo(() => {
    return [
      new Plane(new Vector3(1, 0, 0), graphMax),
      new Plane(new Vector3(-1, 0, 0), graphMax),
      new Plane(new Vector3(0, 0, 1), graphMax),
      new Plane(new Vector3(0, 0, -1), graphMax)
    ];
  }, []);

  /* eslint-disable react/no-unknown-property */
  return (
    <mesh rotation={[-halfPi, 0, -halfPi]} position={[0, zPosition, 0]}>
      <planeGeometry args={[mapBaseSize * scale, mapBaseSize * scale * kBackgroundHeight / kBackgroundWidth]} />
      <meshStandardMaterial clippingPlanes={clippingPlanes} map={texture} />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
});
