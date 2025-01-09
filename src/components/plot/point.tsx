import React, { useState } from "react";
import { Outlines } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
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
  const [isPointerOver, setPointerOver] = useState(false);
  const dotColor = "#925987";
  const basePointSize = 0.12;
  const selectedExtra = isSelected ? .02 : 0;
  const hoverMultiplier = isPointerOver ? 1.5 : 1;
  const targetPointSize = (basePointSize + selectedExtra) * hoverMultiplier;
  const pointSizeSpeed = 0.5;
  const [pointSize, setPointSize] = useState(targetPointSize);
  const outlineColor = isSelected ? "#FF0000" : "#FFFFFF";
  const outlineWidth = isSelected ? 3 : 1.5;

  useFrame((_state, delta) => {
    if (pointSize < targetPointSize) {
      setPointSize(Math.min(pointSize + delta * pointSizeSpeed, targetPointSize));
    } else if (pointSize > targetPointSize) {
      setPointSize(Math.max(pointSize - delta * pointSizeSpeed, targetPointSize));
    }
  });

  // Determine the position of the point in graph space.
  const position = new Vector3(convertLat(Latitude), y, convertLong(Longitude));

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    dstSelectCases([id]);
  };

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setPointerOver(true);
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setPointerOver(false);
  };

  /* eslint-disable react/no-unknown-property */
  return (
    <mesh
      position={position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <sphereGeometry args={[pointSize, 16, 16]} />
      <meshStandardMaterial color={dotColor} />
      <Outlines color={outlineColor} thickness={outlineWidth} />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
}
