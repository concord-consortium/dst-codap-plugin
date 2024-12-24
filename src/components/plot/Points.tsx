/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import React from "react";
import { items } from "../../models/item";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";

const hue = Math.random() * 360;

export const Points = observer(function Points() {
  return (
    <group>
      {items.map((item, i) => {
        const position = [convertLat(item.Latitude), convertDate(item.date), convertLong(item.Longitude)];
        return (
          <mesh key={i} position={new THREE.Vector3(...position)}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={`hsl(${hue}, 60%, 80%)`} />
          </mesh>
        );
      })}
    </group>
  );
});
/* eslint-enable react/no-unknown-property */
