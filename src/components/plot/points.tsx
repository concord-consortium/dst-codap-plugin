import { observer } from "mobx-react-lite";
import * as THREE from "three";
import React from "react";
import { Outlines } from "@react-three/drei";
import { codapCases } from "../../models/codap-data";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";

export const Points = observer(function Points() {
  /* eslint-disable react/no-unknown-property */
  return (
    <group>
      {codapCases.cases.map((aCase, i) => {
        const { id, Latitude, Longitude } = aCase;
        const isSelected = codapCases.isSelected(id);
        const dotColor = "#925987";
        const dotSize = 0.1;
        const outlineColor = isSelected ? "#FF0000" : "#FFFFFF";
        const outlineWidth = 2;

        // Determine the position of the point in graph space.
        const position = new THREE.Vector3(convertLat(Latitude), convertDate(aCase), convertLong(Longitude));

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
