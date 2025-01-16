import { autorun, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import { useEffect, useRef } from "react";
// import { Outlines } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { IItem, items } from "../../models/item";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";
import { dstCamera } from "../../models/camera";

export const Points = observer(function Points() {
  const { scene } = useThree();
  const points = useRef(new InstancedMesh2(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#925987" }),
  ));
  const itemMap = useRef<Map<number, IItem>>(new Map());

  useEffect(() => {
    points.current.computeBVH();
    scene.add(points.current);

    // Set up points
    const setupDisposer = autorun(() => {
      points.current.clear();
      itemMap.current.clear();
      items.forEach((item) => {
        points.current.addInstances(1, (instance, index) => {
          itemMap.current.set(index, item);
          instance.position
            .setX(convertLat(item.Latitude))
            .setY(convertDate(item))
            .setZ(convertLong(item.Longitude));
        });
      });
    });

    // Scale points on zoom
    const scaleDisposer = reaction(
      () => dstCamera.scaleFactor,
      () => {
        points.current.updateInstances((instance) => {
          console.log(`--- instance`, instance);
          // const scale = 0.1 * dstCamera.scaleFactor;
          // instance.scale.set(scale, scale, scale);
          // instance.updateMatrix();
        });
      }
    );

    return () => {
      setupDisposer();
      scaleDisposer();
    };
  }, [scene]);

  return null;

  // /* eslint-disable react/no-unknown-property */
  // return (
  //   <group>
  //     {items.map((item, i) => {
  //       const dotColor = "#925987";
  //       const dotSize = 0.1;
  //       const outlineColor = "#FFFFFF";
  //       const outlineWidth = 2;

  //       // Determine the position of the point in graph space.
  //       const position = new THREE.Vector3(convertLat(item.Latitude), convertDate(item), convertLong(item.Longitude));

  //       return (
  //         <mesh key={`point-${i}`} position={position}>
  //           <sphereGeometry args={[dotSize, 16, 16]} />
  //           <meshStandardMaterial color={dotColor} />
  //           <Outlines color={outlineColor} thickness={outlineWidth} />
  //         </mesh>
  //       );
  //     })}
  //   </group>
  // );
  // /* eslint-enable react/no-unknown-property */
});
