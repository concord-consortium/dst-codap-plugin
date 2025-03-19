import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
import map from "../../assets/WorldMapEquirectangular.png";
import { graph, graphMax, graphMin } from "../../models/graph";
import {
  kBackgroundHeight, kBackgroundWidth
} from "../../utilities/constants";
import { halfPi } from "../../utilities/trig-utils";

const mapBaseSize = graphMax - graphMin;

export const MapPlane = observer(function MapPlane() {
  useFrame((_state, delta) => graph.animate(delta * 1000));

  const texture = useTexture(map);
  
  // Calculate the midpoints and ranges for proper positioning
  // Use absolute bounds for consistent positioning
  const longRange = graph.absoluteMaxLongitude - graph.absoluteMinLongitude;
  const latRange = graph.absoluteMaxLatitude - graph.absoluteMinLatitude;
  const latMid = (graph.absoluteMaxLatitude + graph.absoluteMinLatitude) / 2;
  const longMid = (graph.absoluteMaxLongitude + graph.absoluteMinLongitude) / 2;
  
  // Scale factor to fit the map correctly in the 3D space
  const scale = longRange / graph.longRange;
  
  // Calculate position in graph space
  const x = graph.latitudeInGraphSpace(latMid);
  const z = graph.longitudeInGraphSpace(longMid);
  
  // Adjust aspect ratio to match the equirectangular world map
  // Standard equirectangular maps have a 2:1 width to height ratio (360° longitude : 180° latitude)
  const aspectRatio = kBackgroundWidth / kBackgroundHeight;
  const mapWidth = mapBaseSize * scale;
  const mapHeight = mapWidth * (latRange / longRange) * aspectRatio;

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
    <mesh rotation={[-halfPi, 0, -halfPi]} position={[x, graph.mapPosition, z]}>
      <planeGeometry args={[mapWidth, mapHeight]} />
      <meshStandardMaterial 
        clippingPlanes={clippingPlanes} 
        map={texture} 
      />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
});
