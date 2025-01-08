import { observer } from "mobx-react-lite";
import * as THREE from "three";
import React from "react";
import { Outlines } from "@react-three/drei";
import { items } from "../../models/item";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";

export const Points = observer(function Points() {
  /* eslint-disable react/no-unknown-property */
  return (
    <group>
      {items.values.map((item, i) => {
        const dotColor = "#925987";
        const dotSize = 0.1;
        const outlineColor = "#FFFFFF";
        const outlineWidth = 2;

        // Determine the position of the point in graph space.
        const position = new THREE.Vector3(convertLat(item.Latitude), convertDate(item), convertLong(item.Longitude));

        return (
          <mesh key={`point-${i}`} position={position}>
            <sphereGeometry args={[dotSize, 16, 16]} />
            <meshStandardMaterial color={dotColor} />
            <Outlines color={outlineColor} thickness={outlineWidth} />
          </mesh>
        );
      })}
    </group>
  );
  /* eslint-enable react/no-unknown-property */
});
