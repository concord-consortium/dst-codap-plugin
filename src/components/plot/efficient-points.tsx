import { autorun, reaction } from "mobx";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { dstCamera } from "../../models/camera";
import { ICase, codapCases } from "../../models/codap-data";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";

export const EfficientPoints = function EfficientPoints() {
  const { scene } = useThree();
  const baseDotSize = 0.1;
  const points = useRef(new InstancedMesh2(
    new THREE.SphereGeometry(baseDotSize * dstCamera.scaleFactor, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#925987" })
  ));
  const idToIndexMap = useRef<Map<number, number>>(new Map());
  const indexToCaseMap = useRef<Map<number, ICase>>(new Map());

  useEffect(() => {
    points.current.computeBVH();
    // TODO any type
    scene.add(points.current as any);

    // Create points when cases change
    autorun(() => {
      points.current.clear();
      idToIndexMap.current.clear();
      indexToCaseMap.current.clear();
      points.current.addInstances(codapCases.cases.length, (instance, index) => {
        const aCase = codapCases.cases[index];
        idToIndexMap.current.set(aCase.id, index);
        indexToCaseMap.current.set(index, aCase);
        instance.position
          .setX(convertLat(aCase.Latitude))
          .setY(convertDate(aCase))
          .setZ(convertLong(aCase.Longitude));
      });
    });

    // Scale points when camera zoom changes
    reaction(
      () => dstCamera.scaleFactor,
      () => {
        points.current.updateInstances(instance => {
          const scale = baseDotSize * dstCamera.scaleFactor;
          instance.scale.set(scale, scale, scale);
        });
      }
    );
  }, [scene]);

  return null;
};
