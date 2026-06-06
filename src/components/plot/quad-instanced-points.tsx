/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import { autorun, untracked } from "mobx";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { codapData } from "../../models/codap-data";
import { graph, graphMin, graphMax } from "../../models/graph";
import { ui } from "../../models/ui";
import { dstContainer } from "../../models/dst-container";
import { datasetConfig } from "../../models/dataset-config";
import { computeNumericThresholds, getCaseColor, DEFAULT_POINT_COLOR } from "../../utilities/point-color-utils";
import { writeInstanceFrame } from "../../utilities/instance-frame";
import { pickPointAt, ScreenPoints } from "../../utilities/point-picking";
import { createPointQuadMaterial } from "./point-quad-material";

const graphRange = graphMax - graphMin;

// At or above this many points, render billboarded quads (~2 tris/point) instead
// of spheres (~192 tris/point) so weak GPUs (Chromebooks) stay interactive.
// Below it, spheres render for the nicest close-up look (the quad path is
// visually matched, so this threshold is purely a perf/quality trade, tunable).
export const QUAD_LOD_THRESHOLD = 50000;

// Kept in sync with instanced-points.tsx (the sphere path); both feed the same
// writeInstanceFrame. See point.tsx for the source of these constants.
const PX_TO_WORLD = 0.0195;
const SELECTED_EXTRA = 0.02;
const OUTLINE_THICKNESS_UNSELECTED = 0.012;
const OUTLINE_THICKNESS_SELECTED = 0.03;

// The billboarded-quad point renderer (Chromebook LOD path). Renders one
// InstancedMesh of camera-facing quads with a procedural SDF disc (~2 tris each)
// instead of two ~96-tri sphere meshes. It reuses the exact data pipeline and
// per-frame math of the sphere renderer (writeInstanceFrame); only the GPU
// representation and the picking differ. Marquee selection is handled
// geometry-independently by marquee-overlay, so only click picking changes here
// (shader-billboarded quads can't be raycast — we project + pick on the CPU).
export const QuadInstancedPoints = observer(function QuadInstancedPoints() {
  const caseIds = codapData.caseIds;
  const count = caseIds.length;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl, size } = useThree();
  // Holds the live mesh + index map for the click handler so it never captures a
  // stale closure across re-renders.
  const pickStateRef = useRef<{ mesh: THREE.InstancedMesh; count: number; idToIndex: Map<string, number> } | null>(null);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    return { geometry: geo, material: createPointQuadMaterial() };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;

    // One draw call spanning the whole cube; the unit-quad bounding sphere would
    // otherwise let three frustum-cull the entire mesh.
    mesh.frustumCulled = false;

    // Per-case source caches (rebuilt only when the data changes).
    const latArr = new Float64Array(count);
    const lonArr = new Float64Array(count);
    const dateArr = new Float64Array(count);
    const sizeArr = new Float32Array(count);
    const selectedFlags = new Uint8Array(count);
    const idToIndex = new Map<string, number>();
    const itemIdToIndex = new Map<string, number>();

    // Per-instance shader attributes.
    const ensureAttr = (name: string, itemSize: number) => {
      let attr = geometry.getAttribute(name) as THREE.InstancedBufferAttribute | undefined;
      if (!attr || attr.count !== count) {
        attr = new THREE.InstancedBufferAttribute(new Float32Array(count * itemSize), itemSize);
        attr.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute(name, attr);
      }
      return attr;
    };
    const aFillColor = ensureAttr("aFillColor", 3);
    const aOutlineColor = ensureAttr("aOutlineColor", 3);
    const aAlpha = ensureAttr("aAlpha", 1);
    const aFillRatio = ensureAttr("aFillRatio", 1);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // writeInstanceFrame writes both a fill and an outline matrix; the quad only
    // needs the outline transform (center + outline radius), so the fill matrix
    // is a reused scratch buffer. Likewise fillAlpha is scratch (alpha is shared).
    const scratchFillMatrix = new Float32Array(count * 16);
    const scratchFillAlpha = new Float32Array(count);
    const tmpColor = new THREE.Color();

    const rebuildSelection = () => untracked(() => {
      selectedFlags.fill(0);
      const marquee = codapData.marqueeSelection;
      if (marquee.size > 0) {
        marquee.forEach(caseId => {
          const idx = idToIndex.get(caseId);
          if (idx !== undefined) selectedFlags[idx] = 1;
        });
      } else {
        codapData.dataSet.selection.forEach(itemId => {
          const idx = itemIdToIndex.get(itemId);
          if (idx !== undefined) selectedFlags[idx] = 1;
        });
      }
    });

    const rebuildMatrices = () => untracked(() => {
      const maxDatePercent = graph.maxDatePercent;
      const minDatePercent = graph.minDatePercent;
      writeInstanceFrame({
        count, selectedFlags, latArr, lonArr, dateArr, sizeArr,
        minLat: graph.minLatitude,
        latRange: graph.latRange || 1,
        maxLat: graph.maxLatitude,
        minLon: graph.minLongitude,
        lonRange: graph.longRange || 1,
        maxLon: graph.maxLongitude,
        centerX: graph.centerX,
        centerZ: graph.centerZ,
        absMinDate: codapData.absoluteMinDate,
        absDateRange: codapData.absoluteDateRange || 1,
        minDatePercent,
        currentDatePercent: graph.currentDatePercent,
        datePercentSpan: (maxDatePercent - minDatePercent) || 1,
        graphMin, graphRange,
        showSelected: ui.showSelectedPoints,
        showUnselected: ui.showUnselectedPoints,
        seeThrough: ui.seeThroughMode,
        unselectedOpacity: ui.unselectedPointsOpacity,
        pxToWorld: PX_TO_WORLD,
        selectedExtra: SELECTED_EXTRA,
        outlineThicknessUnselected: OUTLINE_THICKNESS_UNSELECTED,
        outlineThicknessSelected: OUTLINE_THICKNESS_SELECTED,
        // Quad transform = outline matrix (center + outline radius).
        fillMatrix: scratchFillMatrix,
        outlineMatrix: mesh.instanceMatrix.array as Float32Array,
        fillAlpha: scratchFillAlpha,
        outlineAlpha: aAlpha.array as Float32Array,
        outlineColor: aOutlineColor.array as Float32Array,
        quadFillRatio: aFillRatio.array as Float32Array,
      });
      mesh.instanceMatrix.needsUpdate = true;
      aAlpha.needsUpdate = true;
      aOutlineColor.needsUpdate = true;
      aFillRatio.needsUpdate = true;
    });

    const rebuildData = () => {
      const latAttrName = datasetConfig.latitudeAttribute;
      const lonAttrName = datasetConfig.longitudeAttribute;
      void datasetConfig.dateAttribute;
      void datasetConfig.dateFormat;
      const colorConfig = dstContainer.dataDisplayModel.colorDataConfiguration;
      const sizeConfig = dstContainer.dataDisplayModel.sizeDataConfiguration;
      void colorConfig?.attributeID("legend");
      void colorConfig?.attributeType("legend");
      void sizeConfig?.attributeID("legend");
      void sizeConfig?.attributeType("legend");
      const ds = codapData.dataSet;
      const trackChange = (name?: string) => {
        const attr = name ? ds.getAttributeByName(name) : undefined;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        if (attr) attr.changeCount;
      };
      trackChange(latAttrName);
      trackChange(lonAttrName);
      const colorLegendAttr = colorConfig?.attributeID("legend");
      const sizeLegendAttr = sizeConfig?.attributeID("legend");
      const trackAttrId = (attrId?: string) => {
        const attr = attrId ? ds.getAttribute(attrId) : undefined;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        if (attr) attr.changeCount;
      };
      trackAttrId(colorLegendAttr);
      trackAttrId(sizeLegendAttr);

      untracked(() => {
        idToIndex.clear();
        itemIdToIndex.clear();
        let thresholds: number[] = [];
        try {
          thresholds = computeNumericThresholds(colorConfig);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[QuadInstancedPoints] computeNumericThresholds failed", e);
        }
        const fillColors = aFillColor.array as Float32Array;
        for (let i = 0; i < count; i++) {
          const id = caseIds[i];
          idToIndex.set(id, i);
          try {
            const childItemIds = ds.caseInfoMap?.get(id)?.childItemIds;
            if (childItemIds && childItemIds.length > 0) {
              for (const itemId of childItemIds) itemIdToIndex.set(itemId, i);
            } else {
              itemIdToIndex.set(id, i);
            }
          } catch {
            itemIdToIndex.set(id, i);
          }
          const lat = codapData.getLatitude(id);
          const lon = codapData.getLongitude(id);
          const dateMs = graph.convertCaseDate(id);
          latArr[i] = lat == null ? NaN : lat;
          lonArr[i] = lon == null ? NaN : lon;
          dateArr[i] = dateMs == null || !isFinite(dateMs) ? NaN : dateMs;
          try {
            sizeArr[i] = sizeConfig?.getLegendSizeForCase(id) ?? 10;
            tmpColor.set(getCaseColor(id, colorConfig, thresholds));
          } catch {
            sizeArr[i] = 10;
            tmpColor.set(DEFAULT_POINT_COLOR);
          }
          fillColors[i * 3] = tmpColor.r;
          fillColors[i * 3 + 1] = tmpColor.g;
          fillColors[i * 3 + 2] = tmpColor.b;
        }
        aFillColor.needsUpdate = true;
      });

      rebuildSelection();
      rebuildMatrices();
    };

    const disposeData = autorun(() => {
      try {
        rebuildData();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[QuadInstancedPoints] rebuildData failed (plot may be blank):", e);
      }
    });

    const disposeMatrices = autorun(() => {
      void graph.minLatitude; void graph.maxLatitude; void graph.minLongitude; void graph.maxLongitude;
      void graph.centerX; void graph.centerZ;
      void graph.minDatePercent; void graph.maxDatePercent; void graph.currentDatePercent;
      void codapData.absoluteMinDate; void codapData.absoluteDateRange;
      void ui.showSelectedPoints; void ui.showUnselectedPoints;
      void ui.seeThroughMode; void ui.unselectedPointsOpacity;
      rebuildMatrices();
    });

    const disposeSelection = autorun(() => {
      void codapData.dataSet.selectionChanges;
      void codapData.dataSet.selection.size;
      void codapData.marqueeSelection.size;
      rebuildSelection();
      rebuildMatrices();
    });

    // Click picking — project instance centers through the mesh's world matrix so
    // the screen positions match exactly what's rendered, then pick on the CPU.
    pickStateRef.current = { mesh, count, idToIndex };

    return () => {
      disposeData();
      disposeMatrices();
      disposeSelection();
      pickStateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, geometry, material]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (ui.mode !== "pointer") return;
    const state = pickStateRef.current;
    if (!state) return;
    const { mesh, count: n } = state;

    const rect = gl.domElement.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;

    const sp: ScreenPoints = {
      count: n,
      screenX: new Float32Array(n),
      screenY: new Float32Array(n),
      screenR: new Float32Array(n),
      depth: new Float32Array(n),
      hidden: new Uint8Array(n),
    };
    const m = mesh.instanceMatrix.array as Float32Array;
    const world = mesh.matrixWorld;
    const center = new THREE.Vector3();
    const edge = new THREE.Vector3();
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    for (let i = 0; i < n; i++) {
      const b = i * 16;
      const scale = m[b]; // uniform scale = outline radius; 0 when culled
      if (scale <= 0) { sp.hidden[i] = 1; continue; }
      center.set(m[b + 12], m[b + 13], m[b + 14]).applyMatrix4(world);
      edge.copy(center).addScaledVector(right, scale);
      center.project(camera);
      edge.project(camera);
      const cx = (center.x * 0.5 + 0.5) * size.width;
      const cy = (-center.y * 0.5 + 0.5) * size.height;
      const ex = (edge.x * 0.5 + 0.5) * size.width;
      const ey = (-edge.y * 0.5 + 0.5) * size.height;
      sp.screenX[i] = cx;
      sp.screenY[i] = cy;
      sp.screenR[i] = Math.hypot(ex - cx, ey - cy);
      sp.depth[i] = center.z;
    }

    const hit = pickPointAt(px, py, sp);
    if (hit < 0) return;
    const id = caseIds[hit];
    if (!id) return;
    event.stopPropagation();
    if (event.shiftKey) {
      if (codapData.isSelected(id)) codapData.dataSet.selectCases([id], false);
      else codapData.dataSet.selectCases([id]);
    } else {
      codapData.dataSet.setSelectedCases([id]);
    }
  };

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      onClick={handleClick}
    />
  );
});
/* eslint-enable react/no-unknown-property */
