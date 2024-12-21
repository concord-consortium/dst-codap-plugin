/* eslint-disable react/no-unknown-property */
import React, { memo } from "react";
import * as THREE from "three";

export interface Point {
  position: [number, number, number];
  color: string;
}

interface PointsProps {
  points: Point[];
}

export const Points = memo(function Points({ points }: PointsProps) {
  return (
    <group>
      {points.map((point, i) => (
        <mesh key={i} position={new THREE.Vector3(...point.position)}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={point.color} />
        </mesh>
      ))}
    </group>
  );
});
/* eslint-enable react/no-unknown-property */
