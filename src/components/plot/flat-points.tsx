import { observer } from "mobx-react-lite";
import * as THREE from "three";
import React from "react";
import { dstCamera } from "../../models/camera";
import { graph } from "../../models/graph";
import { codapNumberValue, dstCases } from "../../utilities/codap-utils";
import { projectPoint } from "../../utilities/geometry-utils";

// This component displays flat points that are rotated towards the camera.
// Unfortunately, this requires them to be rerendered whenever the camera moves, which is expensive,
// resulting in poor performance. However, if we could improve the performance, this better resembles
// the spec than the spherical points we're using otherwise.

export const FlatPoints = observer(function FlatPoints() {
  /* eslint-disable react/no-unknown-property */
  const { facingRotation } = dstCamera;
  return (
    <group>
      {dstCases().map((aCase, i) => {
        const dotColor = "#925987";
        const dotSize = 0.1;
        const outlineColor = "#FFFFFF";
        const outlineWidth = 0.01;

        // Determine the position of the point in graph space.
        const convertedLat = graph.convertLat(codapNumberValue(aCase.Latitude));
        const convertedDate = graph.convertCaseDate(aCase);
        const convertedLong = graph.convertLong(codapNumberValue(aCase.Longitude));
        const position = new THREE.Vector3(convertedLat, convertedDate, convertedLong);

        // Project the point slightly towards the camera so it will appear in front of the outline.
        const { x, y, z } = dstCamera.position;
        const offset = .00005;
        const { x: px, y: py, z: pz } = projectPoint(convertedLat, convertedDate, convertedLong, x, y, z, offset);

        return (
          <group key={i}>
            {/* The outline, which is a slightly larger circle */}
            <mesh
              position={position}
              rotation={facingRotation}
            >
              <circleGeometry args={[dotSize + outlineWidth, 16]} />
              <meshStandardMaterial color={outlineColor} />
            </mesh>
            {/* The actual point */}
            <mesh
              position={new THREE.Vector3(px, py, pz)}
              rotation={facingRotation}
            >
              <circleGeometry args={[dotSize, 16]} />
              <meshStandardMaterial color={dotColor} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
  /* eslint-enable react/no-unknown-property */
});
