import { /*autorun,*/ reaction } from "mobx";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { dstCamera } from "../../models/camera";
import { ICase, codapCases } from "../../models/codap-data";
import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";

// let throttleScale = false;

export const EfficientPoints = function EfficientPoints() {
  const { scene } = useThree();
  const baseDotSize = 0.1;
  const points = useRef(new InstancedMesh2(
    new THREE.SphereGeometry(baseDotSize * dstCamera.scaleFactor, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#925987" })
  ));
  const idToIndexMap = useRef<Map<number, number>>(new Map());
  const indexToCaseMap = useRef<Map<number, ICase>>(new Map());
  const selectedPoints = useRef(new InstancedMesh2(
    new THREE.SphereGeometry(baseDotSize * dstCamera.scaleFactor, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#FF0000" })
  ));
  const selectedIdToIndexMap = useRef<Map<number, number>>(new Map());
  const selectedIndexToCaseMap = useRef<Map<number, ICase>>(new Map());

  useEffect(() => {
    points.current.computeBVH();
    // TODO any type
    scene.add(points.current);

    // Create points when cases change
    reaction(() => codapCases.cases.map(aCase => aCase.id).join(","),
      () => {
        // Clear old points
        points.current.clear();
        idToIndexMap.current.clear();
        indexToCaseMap.current.clear();
        selectedPoints.current.clear();
        selectedIdToIndexMap.current.clear();
        selectedIndexToCaseMap.current.clear();

        // Add unselected points
        let pointIndex = 0;
        points.current.addInstances(codapCases.cases.length - codapCases.selectedCaseIds.size, (instance, index) => {
          let aCase = codapCases.cases[pointIndex];
          while (codapCases.isSelected(aCase.id)) {
            pointIndex++;
            aCase = codapCases.cases[pointIndex];
          }
          idToIndexMap.current.set(aCase.id, index);
          indexToCaseMap.current.set(index, aCase);
          instance.position
            .setX(convertLat(aCase.Latitude))
            .setY(convertDate(aCase))
            .setZ(convertLong(aCase.Longitude));
          const scale = baseDotSize * dstCamera.scaleFactor;
          instance.scale.set(scale, scale, scale);
        });

        // Add selected points
        const selectedCaseIds = Array.from(codapCases.selectedCaseIds);
        selectedPoints.current.addInstances(selectedCaseIds.length, (instance, index) => {
          const aCase = codapCases.caseMap.get(selectedCaseIds[index]);
          if (aCase) {
            selectedIdToIndexMap.current.set(aCase.id, index);
            selectedIndexToCaseMap.current.set(index, aCase);
            instance.position
              .setX(convertLat(aCase.Latitude))
              .setY(convertDate(aCase))
              .setZ(convertLong(aCase.Longitude));
            const scale = baseDotSize * dstCamera.scaleFactor;
            instance.scale.set(scale, scale, scale);
          }
        });
      }, { fireImmediately: true}
    );

    const normalColor = new THREE.Color("#925987");
    const selectedColor = new THREE.Color("#FF0000");
    reaction(() => Array.from(codapCases.selectedCaseIds.entries()).join(","),
      () => {
        console.log(`--- recoloring`);
        points.current.updateInstances((instance, index) => {
          const id = indexToCaseMap.current.get(index)?.id;
          if (id == null) return;
          const color = codapCases.isSelected(id) ? selectedColor : normalColor;
          instance.color = color;
        });
        // codapCases.cases.forEach(aCase => {
        //   const color = codapCases.isSelected(aCase.id) ? selectedColor : normalColor;
        //   const index = idToIndexMap.current.get(aCase.id);
        //   if (index != null) points.current.setColorAt(index, color);
        // });
      }
    );

    // Scale points when camera zoom changes
    // reaction(
    //   () => dstCamera.scaleFactor,
    //   () => {
    //     if (!throttleScale) {
    //       throttleScale = true;
    //       setTimeout(() => throttleScale = false, 100);
    //       points.current.updateInstances((instance, index) => {
    //         const scale = baseDotSize * dstCamera.scaleFactor;
    //         console.log(`--- rescale`, index);
    //         // console.log(` -- instance`, instance);
    //         console.log(` -- scale`, instance.scale);
    //         instance.scale.set(scale, scale, scale);
    //         console.log(` -- post scale`, instance.scale);
    //       });
    //     }
    //   }
    // );
  }, [scene]);

  return null;
};
