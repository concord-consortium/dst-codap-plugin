import { autorun, /*reaction*/ } from "mobx";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { ICase, codapCases } from "../../models/codap-data";
import { convertDate, convertLat, convertLong/*, dataRanges*/ } from "../../utilities/graph-utils";

export const EfficientPoints = observer(function EfficientPoints() {
  const { scene } = useThree();
  const points = useRef(new InstancedMesh2(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#925987" }),
  ));
  const idToIndexMap = useRef<Map<number, number>>(new Map());
  const indexToCaseMap = useRef<Map<number, ICase>>(new Map());

  useEffect(() => {
    points.current.computeBVH();
    // TODO any type
    scene.add(points.current as any);

    // Create points when cases change
    autorun(() => {
      console.log(`--- cases`, codapCases.caseMap.size);
      points.current.clear();
      idToIndexMap.current.clear();
      indexToCaseMap.current.clear();
      codapCases.caseMap.forEach((aCase) => {
        points.current.addInstances(1, (instance, index) => {
          idToIndexMap.current.set(aCase.id, index);
          indexToCaseMap.current.set(index, aCase);
          instance.position
            .setX(convertLat(aCase.Latitude))
            .setY(convertDate(aCase))
            .setZ(convertLong(aCase.Longitude));
        });
      });
    });
  }, [scene]);

  return null;
});
