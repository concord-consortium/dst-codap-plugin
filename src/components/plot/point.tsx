import React from "react";
import { Outlines } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import { convertLat, convertLong } from "../../utilities/graph-utils";
import { _selectCases as dstSelectCases } from "../../utilities/codap-utils";

interface IPointProps {
  id: number;
  isSelected: boolean;
  Latitude: number;
  Longitude: number;
  y: number;
}
export function Point({ id, isSelected, Latitude, Longitude, y }: IPointProps) {
  const dotColor = "#925987";
  const basePointSize = 0.1;
  const selectedMultiplier = isSelected ? 1.5 : 1;
  const pointSize = basePointSize * selectedMultiplier;
  const outlineColor = isSelected ? "#FF0000" : "#FFFFFF";
  const outlineWidth = isSelected ? 2 : 1;

  // Determine the position of the point in graph space.
  const position = new Vector3(convertLat(Latitude), y, convertLong(Longitude));

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    dstSelectCases([id]);
  };

  /* eslint-disable react/no-unknown-property */
  return (
    <mesh key={`point-${id}`} position={position} onClick={handleClick}>
      <sphereGeometry args={[pointSize, 16, 16]} />
      <meshStandardMaterial color={dotColor} />
      <Outlines color={outlineColor} thickness={outlineWidth} />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
}
