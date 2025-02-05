import {drag, select} from "d3";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { CategoricalSizeLegendModel, labelHeight, Key } from "./categorical-size-model";
import { IBaseLegendProps } from "../../codap/components/data-display/components/legend/legend-common";
import { useDataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { mstReaction } from "../../codap/utilities/mst-reaction";
import { axisGap } from "../../codap/components/axis/axis-types";
import { mstAutorun } from "../../codap/utilities/mst-autorun";
import { IDstDataConfigurationModel } from "../../models/dst-data-display-model";

import "./size-legend.scss";

const movingTransitionDuration = 200;
const sizingTransitionDuration = 300;

// This is not an observing component because all of its real rendering happens in
// a mstAutorun.
export const CategoricalSizeLegend =
  function CategoricalSizeLegend({layerIndex, setDesiredExtent}: IBaseLegendProps) {

    const dataConfiguration = useDataConfigurationContext() as IDstDataConfigurationModel;
    const dataDisplayLayout = useDataDisplayLayout();
    const keysElt = useRef(null);

    // useState guarantees the model will only be created once
    // useMemo doesn't have that guarantee
    const [legendModel] = useState(
      () => new CategoricalSizeLegendModel(dataConfiguration, dataDisplayLayout)
    );

    // This is outside of the main autorun because it only needs to run when
    // the number of categories changes or the max width of a category changes.
    // Also the setDesiredExtent might cause extra re-renders, so it only
    // runs when the desiredExtent actually changes
    useEffect(function updateDesiredExtent() {
      return mstReaction(
        () => {
          if (dataConfiguration?.placeCanHaveZeroExtent("legend")) {
            return 0;
          }
          return legendModel.layoutData.numRows * legendModel.layoutData.rowHeight + labelHeight + axisGap;
        },
        (desiredExtent) => {
          setDesiredExtent(layerIndex, desiredExtent);
        },
        {name: "CategoricalSizeLegend updateDesiredExtent", fireImmediately: true},
        dataConfiguration
      );
    }, [dataConfiguration, setDesiredExtent, layerIndex, legendModel]);

    // These variables should not change, but theoretically it is possible
    useEffect(function updateContextVariables() {
      legendModel.setDataConfiguration(dataConfiguration);
      legendModel.setDataDisplayLayout(dataDisplayLayout);
    }, [dataConfiguration, dataDisplayLayout, legendModel]);

    useEffect(() => {
      return function cleanup() {
        setDesiredExtent(layerIndex, 0);
      };
    }, [layerIndex, setDesiredExtent]);

    const handleLegendKeyClick = useCallback((event: any, d: Key) => {
      const caseIds = dataConfiguration?.getCasesForLegendValue(d.category);
      if (caseIds) {
        // This is breaking the graph-legend cypress test
        // setOrExtendSelection(caseIds, dataConfiguration?.dataset, event.shiftKey)
        if (event.shiftKey) dataConfiguration?.dataset?.selectCases(caseIds);
        else dataConfiguration?.dataset?.setSelectedCases(caseIds);
      }
    }, [dataConfiguration]);

    // The dragBehavior is created first, so d3Render can add this to all new elements.
    const dragBehavior = useMemo(() => {
      const onDragStart = (event: { x: number; y: number }, d: Key) => {
        legendModel.onDragStart(event, d);
      };

      const onDrag = (event: { dx: number; dy: number }, d: Key) => {
        legendModel.onDrag(event, d);
      };

      const onDragEnd = (event: any, d: Key) => {
        legendModel.onDragEnd(dataConfiguration, d);
      };

      return drag<SVGGElement, Key>()
        .on("start", onDragStart)
        .on("drag", onDrag)
        .on("end", onDragEnd);
    }, [dataConfiguration, legendModel]);

    useEffect(() => { return mstAutorun(function d3Render() {
      if (!keysElt.current) return;

      const keySize = legendModel.categoryCircleMaxDiameter;

      const keysSelection = select(keysElt.current)
        .selectAll<SVGGElement, Key>("g")
        .data(legendModel.categoryData, d => d.category)
        .join(
          (enter) => {
            const group = enter.append("g")
              .attr("class", "legend-key")
              .attr("data-testid", "legend-key")
              .on("click", handleLegendKeyClick)
              .call(dragBehavior);

            group.append("circle")
              .attr("r", (d) => d.size/2)
              .attr("cx", keySize/2)
              .attr("cy", keySize/2);
            group.append("text")
              .text((d) => d.category)
              .attr("x", (d) => keySize/2 + d.size/2 + 4)
              .attr("dominant-baseline", "middle")
              .attr("y", keySize/2);

            return group;
          }
        );

      const dI = legendModel.dragInfo;

      keysSelection
        .transition().duration((d) => 
          dI.category === d.category ? 0 : movingTransitionDuration)
        .attr("transform", (d) => {
          const x = dI.category === d.category
            ? dI.currentDragPosition.x - dI.initialOffset.x
            : axisGap + (d.column || 0) * legendModel.layoutData.columnWidth;;
          const y = labelHeight + (dI.category === d.category
            ? dI.currentDragPosition.y - dI.initialOffset.y
            : (d.row || 0) * legendModel.layoutData.rowHeight);
          return `translate(${x} ${y})`;
        });

      keysSelection.select("circle")
        .classed("legend-key-selected", (d) => {
          return dataConfiguration?.allCasesForCategoryAreSelected(d.category) ??
              false;
        })
        .transition().duration(sizingTransitionDuration)
        .attr("r", (d) => d.size/2);

      keysSelection.select("text")
        .attr("x", (d) => keySize/2 + d.size/2 + 4);

    }, {name: "CategoricalSizeLegend d3 render"}, dataConfiguration); },
      [dataConfiguration, dragBehavior, handleLegendKeyClick, legendModel]
    );

    return (
      <g className="legend-size-categories" ref={keysElt} data-testid="legend-size-categories"></g>
    );
  };
