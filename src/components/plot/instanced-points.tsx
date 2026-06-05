/* eslint-disable react/no-unknown-property */
import { observer } from "mobx-react-lite";
import { autorun, untracked } from "mobx";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { codapData } from "../../models/codap-data";
import { graph, graphMin, graphMax } from "../../models/graph";
import { ui } from "../../models/ui";
import { dstContainer } from "../../models/dst-container";
import { datasetConfig } from "../../models/dataset-config";
import { computeNumericThresholds, getCaseColor, DEFAULT_POINT_COLOR } from "../../utilities/point-color-utils";
import { writeInstanceFrame } from "../../utilities/instance-frame";

const graphRange = graphMax - graphMin;

// World-space conversion of a point diameter (pixels). Mirrors point.tsx:
// basePointSize = diameter * 0.0195, used as the sphere radius. Our base sphere
// has radius 1, so the per-instance scale equals basePointSize.
const PX_TO_WORLD = 0.0195;
// Extra world-space radius added to selected points (matches point.tsx selectedExtra).
const SELECTED_EXTRA = 0.02;
// Outline ring thickness (world units) added on top of the fill radius.
const OUTLINE_THICKNESS_UNSELECTED = 0.012;
const OUTLINE_THICKNESS_SELECTED = 0.03;

// Low tessellation keeps the GPU triangle budget sane at 200K instances
// (8 segments ≈ 96 tris/sphere). Points render small on screen, so the facets
// are not perceptible; bump this only if large selected points look angular.
const SPHERE_SEGMENTS = 8;

// Patches a meshBasicMaterial so each instance can carry its own alpha via an
// `instanceAlpha` attribute. This is the small onBeforeCompile patch sanctioned
// by the plan (per-instance opacity is not expressible through instanceColor).
function patchInstanceAlpha(material: THREE.Material) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float instanceAlpha;\nvarying float vInstanceAlpha;"
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvInstanceAlpha = instanceAlpha;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vInstanceAlpha;"
      )
      .replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\ngl_FragColor.a *= vInstanceAlpha;"
      );
  };
}

export const InstancedPoints = observer(function InstancedPoints() {
  // Reading caseIds makes the component re-render (and the instanced meshes
  // remount) only when the list of cases changes. Selection, camera, graph
  // bounds and legend changes are handled reactively in the effect below, so
  // they never trigger a React re-render.
  const caseIds = codapData.caseIds;
  const count = caseIds.length;

  const fillRef = useRef<THREE.InstancedMesh>(null);
  const outlineRef = useRef<THREE.InstancedMesh>(null);

  // Geometry + materials are created once and reused across remounts.
  const { fillGeometry, outlineGeometry, fillMaterial, outlineMaterial } = useMemo(() => {
    const fGeo = new THREE.SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const oGeo = new THREE.SphereGeometry(1, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const fMat = new THREE.MeshBasicMaterial({ transparent: true });
    const oMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.BackSide });
    patchInstanceAlpha(fMat);
    patchInstanceAlpha(oMat);
    return { fillGeometry: fGeo, outlineGeometry: oGeo, fillMaterial: fMat, outlineMaterial: oMat };
  }, []);

  // Dispose GPU resources on unmount.
  useEffect(() => {
    return () => {
      fillGeometry.dispose();
      outlineGeometry.dispose();
      fillMaterial.dispose();
      outlineMaterial.dispose();
    };
  }, [fillGeometry, outlineGeometry, fillMaterial, outlineMaterial]);

  useEffect(() => {
    const fillMesh = fillRef.current;
    const outlineMesh = outlineRef.current;
    if (!fillMesh || !outlineMesh || count === 0) return;

    // A single InstancedMesh has only the base geometry's bounding sphere (a unit
    // sphere at the origin), so three can frustum-cull the entire mesh even though
    // the instances span the whole cube. Disable culling — the draw is one call.
    fillMesh.frustumCulled = false;
    outlineMesh.frustumCulled = false;

    // Per-case source caches, rebuilt only when the underlying data changes.
    const latArr = new Float64Array(count);
    const lonArr = new Float64Array(count);
    const dateArr = new Float64Array(count); // ms epoch; NaN if missing
    const sizeArr = new Float32Array(count); // diameter in px

    // Selection state as a typed array (1 = selected), rebuilt only when the
    // selection changes — keeps the per-frame scrub loop free of string hashing.
    const selectedFlags = new Uint8Array(count);
    // caseId -> instance index, used for the marquee set (which stores case ids).
    const idToIndex = new Map<string, number>();
    // itemId -> instance index. dataSet.selection stores *item* ids (setSelectedCases
    // expands each case to its childItemIds), so CODAP-driven selection must be
    // mapped through this, not idToIndex. Mirrors dataSet.isCaseSelected.
    const itemIdToIndex = new Map<string, number>();

    // Ensure the custom instanceAlpha attribute exists on both geometries.
    const ensureAlpha = (geometry: THREE.BufferGeometry) => {
      let attr = geometry.getAttribute("instanceAlpha") as THREE.InstancedBufferAttribute | undefined;
      if (!attr || attr.count !== count) {
        attr = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
        attr.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute("instanceAlpha", attr);
      }
      return attr;
    };
    const fillAlpha = ensureAlpha(fillGeometry);
    const outlineAlpha = ensureAlpha(outlineGeometry);

    fillMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    outlineMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // The outline color buffer is written every frame by writeInstanceFrame, so
    // allocate it up front (fill colors are set via setColorAt in rebuildData).
    if (!outlineMesh.instanceColor || outlineMesh.instanceColor.count !== count) {
      outlineMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    }
    outlineMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

    const tmpColor = new THREE.Color();

    // Recomputes positions, sizes, alphas and outline colors from the source
    // caches and the current graph/selection/ui state. Pure arithmetic; no
    // model method calls in the hot loop. Run untracked so it never registers
    // per-case MobX dependencies.
    // Refills selectedFlags from the active selection (marquee overrides the CODAP
    // selection, matching codapData.isSelected). O(selected), run only when the
    // selection changes — never during a scrub or animation frame. The marquee set
    // holds case ids; dataSet.selection holds item ids — different key spaces.
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
        fillMatrix: fillMesh.instanceMatrix.array as Float32Array,
        outlineMatrix: outlineMesh.instanceMatrix.array as Float32Array,
        fillAlpha: fillAlpha.array as Float32Array,
        outlineAlpha: outlineAlpha.array as Float32Array,
        outlineColor: outlineMesh.instanceColor!.array as Float32Array,
      });

      fillMesh.instanceMatrix.needsUpdate = true;
      outlineMesh.instanceMatrix.needsUpdate = true;
      outlineMesh.instanceColor!.needsUpdate = true;
      fillAlpha.needsUpdate = true;
      outlineAlpha.needsUpdate = true;
    });

    // Rebuilds the per-case source caches and fill colors. Reads only coarse
    // observables (attribute names, legend config, attribute changeCounts) so it
    // re-runs when data or the legend changes, not on every value access.
    const rebuildData = () => {
      // Coarse, tracked reads.
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
      // changeCounts on the relevant attributes make this responsive to value edits.
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
        const thresholds = computeNumericThresholds(colorConfig);
        for (let i = 0; i < count; i++) {
          const id = caseIds[i];
          idToIndex.set(id, i);
          // Map this case's item id(s) -> index so CODAP-driven selection (which
          // stores item ids) highlights correctly. Fall back to the case id, which
          // matches dataSet.isCaseSelected's `selection.has(caseId)` branch. Guarded
          // so an unexpected caseInfoMap shape can never abort buffer population.
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
          // Size/color come from the MST legend configs; guard so one bad case
          // (or a transient legend-scale error) can't abort buffer population and
          // leave the whole plot blank.
          try {
            sizeArr[i] = sizeConfig?.getLegendSizeForCase(id) ?? 10;
            tmpColor.set(getCaseColor(id, colorConfig, thresholds));
          } catch {
            sizeArr[i] = 10;
            tmpColor.set(DEFAULT_POINT_COLOR);
          }
          fillMesh.setColorAt(i, tmpColor);
        }
        if (fillMesh.instanceColor) fillMesh.instanceColor.needsUpdate = true;
      });

      // Data (hence id→index) changed, so the selection flags must be rebuilt.
      rebuildSelection();
      rebuildMatrices();
    };

    const disposeData = autorun(() => rebuildData());

    // Geometry autorun: graph transform + ui. Fires on pan/zoom/date-scrub and
    // visibility toggles, but NOT on selection (handled separately) or camera
    // orbit (changes no observable here). Does not rebuild selection flags.
    const disposeMatrices = autorun(() => {
      void graph.minLatitude; void graph.maxLatitude; void graph.minLongitude; void graph.maxLongitude;
      void graph.centerX; void graph.centerZ;
      void graph.minDatePercent; void graph.maxDatePercent; void graph.currentDatePercent;
      void codapData.absoluteMinDate; void codapData.absoluteDateRange;
      void ui.showSelectedPoints; void ui.showUnselectedPoints;
      void ui.seeThroughMode; void ui.unselectedPointsOpacity;
      rebuildMatrices();
    });

    // Selection autorun: re-derive the flags, then repaint. dataSet.selectionChanges
    // is bumped on every selection mutation (the canonical signal, robust to
    // same-count replacements); the marquee size covers the in-progress marquee.
    // This fires on selection from any source — CODAP table/graph, cube click, or
    // marquee — so highlighting stays in sync bidirectionally.
    const disposeSelection = autorun(() => {
      void codapData.dataSet.selectionChanges;
      void codapData.dataSet.selection.size;
      void codapData.marqueeSelection.size;
      rebuildSelection();
      rebuildMatrices();
    });

    return () => {
      disposeData();
      disposeMatrices();
      disposeSelection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, fillGeometry, outlineGeometry]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (ui.mode !== "pointer") return;
    const instanceId = event.instanceId;
    if (instanceId == null) return;
    const id = caseIds[instanceId];
    if (!id) return;
    event.stopPropagation();
    if (event.shiftKey) {
      if (codapData.isSelected(id)) {
        codapData.dataSet.selectCases([id], false);
      } else {
        codapData.dataSet.selectCases([id]);
      }
    } else {
      codapData.dataSet.setSelectedCases([id]);
    }
  };

  if (count === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={outlineRef}
        args={[outlineGeometry, outlineMaterial, count]}
        renderOrder={0}
      />
      <instancedMesh
        ref={fillRef}
        args={[fillGeometry, fillMaterial, count]}
        renderOrder={1}
        onClick={handleClick}
      />
    </group>
  );
});
/* eslint-enable react/no-unknown-property */
