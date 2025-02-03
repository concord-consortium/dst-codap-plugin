import React, { useState } from "react";
import { Outlines } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { observer } from "mobx-react-lite";
import { codapData } from "../../models/codap-data";
import { dstContainer } from "../../models/dst-container";
import { ui } from "../../models/ui";

interface IPointProps {
  id: string;
  visible?: boolean;
  x: number;
  y: number;
  z: number;
}
export const Point = observer(function Point({ id, visible, x, y, z }: IPointProps) {
  const [isPointerOver, setPointerOver] = useState(false);
  const dataConfig = dstContainer.dataDisplayModel.layers[0].dataConfiguration;
  const dotColor = dataConfig.getLegendColorForCase(id);
  const basePointSize = 0.12;
  const isSelected = codapData.isSelected(id);
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
  const position = new Vector3(x, y, z);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (ui.mode === "pointer") {
      event.stopPropagation();
      if (event.shiftKey) {
        if (isSelected) {
          codapData.dataSet.selectCases([id], false);
        } else {
          codapData.dataSet.selectCases([id]);
        }
      } else {
        codapData.dataSet.setSelectedCases([id]);
      }
    }
  };

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    if (ui.mode === "pointer") {
      event.stopPropagation();
      setPointerOver(true);
    }
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    if (ui.mode === "pointer") {
      event.stopPropagation();
      setPointerOver(false);
    }
  };

  /* eslint-disable react/no-unknown-property */
  return (
    <mesh
      position={position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      visible={visible}
    >
      <sphereGeometry args={[pointSize, 16, 16]} />
      <meshStandardMaterial color={dotColor} />
      <Outlines color={outlineColor} thickness={outlineWidth} />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
});
