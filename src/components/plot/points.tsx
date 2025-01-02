import { observer } from "mobx-react-lite";
import * as THREE from "three";
import React from "react";
import { dstCamera } from "../../models/camera";
import { items } from "../../models/item";
import { getCameraFormatFromPosition, getPositionFromCameraFormat } from "../../utilities/camera-utils";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";
import { halfPi } from "../../utilities/trig-utils";

export const Points = observer(function Points() {
  /* eslint-disable react/no-unknown-property */
  const rotation = new THREE.Euler(-dstCamera.pivot, -dstCamera.rotation - halfPi, 0, "YXZ");
  return (
    <group>
      {items.map((item, i) => {
        const convertedLat = convertLat(item.Latitude);
        const convertedDate = convertDate(item);
        const convertedLong = convertLong(item.Longitude);
        const position =
          new THREE.Vector3(...[convertedLat, convertedDate, convertedLong]);
        const { x, y, z } = dstCamera.position;
        const distance = Math.sqrt((x - convertedLat)**2 + (y - convertedDate)**2 + (z - convertedLong)**2);
        const offset = .001;
        const px = convertedLat + offset * ((x - convertedLat) / distance);
        const py = convertedDate + offset * ((y - convertedDate) / distance);
        const pz = convertedLong + offset * ((z - convertedLong) / distance);
        const outlineCameraFormat = getCameraFormatFromPosition(convertedLat, convertedDate, convertedLong);
        const borderPosition = getPositionFromCameraFormat(
          outlineCameraFormat.distance + .00005, outlineCameraFormat.pivot, outlineCameraFormat.rotation
        );
        // return (
        //   <group key={i}>
        //     <mesh position={position}>
        //       <sphereGeometry args={[0.1, 8, 8]} />
        //       <meshStandardMaterial color="#925987" />
        //     </mesh>
        //      <mesh
        //        position={position}
        //        rotation={rotation}
        //      >
        //        <circleGeometry args={[0.11, 16]} />
        //        <meshStandardMaterial color="#FFFFFF" />
        //      </mesh>
        //   </group>
        // );
        return (
          <group key={i}>
            <mesh
              position={position}
              rotation={rotation}
            >
              <circleGeometry args={[0.1, 16]} />
              <meshStandardMaterial color="#925987" />
            </mesh>
            <mesh
              position={new THREE.Vector3(...[borderPosition.x, borderPosition.y, borderPosition.z])}
              rotation={rotation}
            >
              <ringGeometry args={[0.085, 0.1, 16]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
  /* eslint-enable react/no-unknown-property */
});
