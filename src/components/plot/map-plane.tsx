import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
// import map from "../../assets/USA_location_map.svg.png";
import map from "../../assets/maptest_3840.png";
import { graph, graphMax, graphMin } from "../../models/graph";
import {
  kBackgroundLongRange, kBackgroundHeight, kBackgroundLatMid, kBackgroundLongMid, kBackgroundWidth
} from "../../utilities/constants";
import { halfPi } from "../../utilities/trig-utils";

const mapBaseSize = graphMax - graphMin;

interface IMapPlaneProps {
  zPosition: number;
}
export const MapPlane = observer(function MapPlane({ zPosition }: IMapPlaneProps) {
  useFrame((_state, delta) => graph.animate(delta * 1000));

  const texture = useTexture(map);
  const scale = kBackgroundLongRange / graph.longRange;
  const x = graph.latitudeInGraphSpace(kBackgroundLatMid);
  const z = graph.longitudeInGraphSpace(kBackgroundLongMid);

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
    <mesh rotation={[-halfPi, 0, -halfPi]} position={[x, zPosition, z]}>
      <planeGeometry args={[mapBaseSize * scale, mapBaseSize * scale * kBackgroundHeight / kBackgroundWidth]} />
      <meshStandardMaterial clippingPlanes={clippingPlanes} map={texture} />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
});
