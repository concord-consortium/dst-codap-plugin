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
  
  // TODO: these configs might be undefined
  const colorDataConfig = dstContainer.dataDisplayModel.colorDataConfiguration;
  const sizeDataConfig = dstContainer.dataDisplayModel.sizeDataConfiguration;
  
  // The default color from the spec is: "#e6805bd9" (RGBA)
  // Note: If there is no value for the attribute on this case getLegendColorForCase(id) 
  // will return "#888888". Showing this color for points that can't colored by the
  // legend is the same behavior as CODAP.
  const dotColor = colorDataConfig.getLegendColorForCase(id) || "#e6805b";
  const dotDiameterInPixels = sizeDataConfig.getLegendSizeForCase(id);
  // TODO: replace this hardcoded 0.026 with an actual calculation
  // It should be possible to compute it from the camera settings.
  // The basePointSize was originally 0.12
  // The pointSize is a radius so if we had a conversion from pixels to 
  // 3d units we also have to divide by 2.
  const basePointSize = dotDiameterInPixels * 0.026;
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
