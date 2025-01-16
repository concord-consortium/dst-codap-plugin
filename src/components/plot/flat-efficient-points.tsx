// import { /*autorun,*/ reaction } from "mobx";
// import * as THREE from "three";
// import React, { useEffect, useMemo, useRef } from "react";
// import { extend, useFrame, useThree } from "@react-three/fiber";
// import { InstancedMesh2 } from "@three.ez/instanced-mesh";
// import { dstCamera } from "../../models/camera";
// import { ICase, codapCases } from "../../models/codap-data";
// import { convertDate, convertLat, convertLong } from "../../utilities/graph-utils";

// extend({ InstancedMesh2 });

// // let throttleScale = false;
// let throttleRotation = false;
// let rotationKey = "";

// export function FlatEfficientPoints() {
//   const { scene } = useThree();
//   const basePointSize = 0.12;
//   const points = useRef<InstancedMesh2>();
//   // const points = useRef(new InstancedMesh2(
//   //   new THREE.CircleGeometry(basePointSize, 16),
//   //   new THREE.MeshStandardMaterial({ color: "#925987" }),
//   //   { allowsEuler: true, createEntities: true }
//   // ));
//   const idToIndexMap = useRef<Map<number, number>>(new Map());
//   const indexToCaseMap = useRef<Map<number, ICase>>(new Map());
//   // const selectedPoints = useRef(new InstancedMesh2(
//   //   new THREE.SphereGeometry(baseDotSize * dstCamera.scaleFactor, 16, 16),
//   //   new THREE.MeshStandardMaterial({ color: "#FF0000" })
//   // ));
//   // const selectedIdToIndexMap = useRef<Map<number, number>>(new Map());
//   // const selectedIndexToCaseMap = useRef<Map<number, ICase>>(new Map());

//   const geometry = useMemo(() => new THREE.CircleGeometry(basePointSize, 16), [basePointSize]);
//   const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#925987" }), []);

//   useFrame(() => {
//     if (!points.current) return;

//     // Update point rotation based on camera position
//     if (!throttleRotation) {
//       const { position } = dstCamera;
//       const newRotationKey = `${position.x},${position.y},${position.z}`;
//       if (rotationKey !== newRotationKey) {
//         throttleRotation = true;
//         rotationKey = newRotationKey;
//         // const { x, y, z, order } = dstCamera.facingRotation;
//         points.current.updateInstances((instance, index) => {
//           // instance.rotation.set(x, y, z, order);
//           instance.updateMatrix();
//         });
//         // points.current.instances.forEach(instance => {
//         //   const { x, y, z, order } = dstCamera.facingRotation;
//         //   instance.rotation.set(x, y, z, order);
//         //   instance.updateMatrix();
//         // });
//         setTimeout(() => throttleRotation = false, 100);
//       }
//     }
//   });

//   useEffect(() => {
//     if (!points.current) return;

//     // scene.add(points.current);

//     // Create points when cases change
//     reaction(() => codapCases.cases.map(aCase => aCase.id).join(","),
//       () => {
//         if (!points.current) return;

//         // Clear old points
//         points.current.clear();
//         idToIndexMap.current.clear();
//         indexToCaseMap.current.clear();
//         // selectedPoints.current.clear();
//         // selectedIdToIndexMap.current.clear();
//         // selectedIndexToCaseMap.current.clear();

//         // Add unselected points
//         points.current.addInstances(codapCases.cases.length, (instance, index) => {
//           const aCase = codapCases.cases[index];
//           idToIndexMap.current.set(aCase.id, index);
//           indexToCaseMap.current.set(index, aCase);
//           instance.position
//             .setX(convertLat(aCase.Latitude))
//             .setY(convertDate(aCase))
//             .setZ(convertLong(aCase.Longitude));
//           // const selectedExtra = isSelected ? .02 : 0;
//           // const scale = baseDotSize * dstCamera.scaleFactor;
//           // instance.scale.set(scale, scale, scale);
//           const { x, y, z, order } = dstCamera.facingRotation;
//           instance.rotation.set(x, y, z, order);
//         });

//         // Add selected points
//         // const selectedCaseIds = Array.from(codapCases.selectedCaseIds);
//         // selectedPoints.current.addInstances(selectedCaseIds.length, (instance, index) => {
//         //   const aCase = codapCases.caseMap.get(selectedCaseIds[index]);
//         //   if (aCase) {
//         //     selectedIdToIndexMap.current.set(aCase.id, index);
//         //     selectedIndexToCaseMap.current.set(index, aCase);
//         //     instance.position
//         //       .setX(convertLat(aCase.Latitude))
//         //       .setY(convertDate(aCase))
//         //       .setZ(convertLong(aCase.Longitude));
//         //     const scale = baseDotSize * dstCamera.scaleFactor;
//         //     instance.scale.set(scale, scale, scale);
//         //   }
//         // });
//       }, { fireImmediately: true}
//     );

//     // Rotate points when camera moves
//     // reaction(
//     //   () => {
//     //     const { x, y, z } = dstCamera.position;
//     //     return `${x},${y},${z}`;
//     //   },
//     //   () => {
//     //     if (!throttleRotation) {
//     //       throttleRotation = true;
//     //       const { x, y, z, order } = dstCamera.facingRotation;
//     //       points.current.instances.forEach(instance => {
//     //         instance.rotation.set(x, y, z, order);
//     //         instance.updateMatrix();
//     //       });
//     //       setTimeout(() => throttleRotation = false, 100);
//     //     }
//     //   }
//     // );

//     // const normalColor = new THREE.Color("#925987");
//     // const selectedColor = new THREE.Color("#FF0000");
//     // reaction(() => Array.from(codapCases.selectedCaseIds.entries()).join(","),
//     //   () => {
//     //     console.log(`--- recoloring`);
//     //     points.current.updateInstances((instance, index) => {
//     //       const id = indexToCaseMap.current.get(index)?.id;
//     //       if (id == null) return;
//     //       const color = codapCases.isSelected(id) ? selectedColor : normalColor;
//     //       instance.color = color;
//     //     });
//     //     // codapCases.cases.forEach(aCase => {
//     //     //   const color = codapCases.isSelected(aCase.id) ? selectedColor : normalColor;
//     //     //   const index = idToIndexMap.current.get(aCase.id);
//     //     //   if (index != null) points.current.setColorAt(index, color);
//     //     // });
//     //   }
//     // );

//     // Scale points when camera zoom changes
//     // reaction(
//     //   () => dstCamera.scaleFactor,
//     //   () => {
//     //     if (!throttleScale) {
//     //       throttleScale = true;
//     //       setTimeout(() => throttleScale = false, 100);
//           // points.current.updateInstances((instance, index) => {
//           //   const scale = baseDotSize * dstCamera.scaleFactor;
//           //   console.log(`--- rescale`, index);
//           //   // console.log(` -- instance`, instance);
//           //   console.log(` -- scale`, instance.scale);
//           //   instance.scale.set(scale, scale, scale);
//           //   console.log(` -- post scale`, instance.scale);
//           // });
//     //     }
//     //   }
//     // );

//     points.current.computeBVH();
//   }, [scene]);

//   /* eslint-disable react/no-unknown-property */
//   return (
//     <instancedMesh2 args={[geometry, material]} ref={points} />
//   );
//   /* eslint-enable react/no-unknown-property */
//   // return null;
// };
