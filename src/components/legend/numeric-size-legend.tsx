import {axisBottom, format, range as d3Range, scaleLinear, select} from "d3";
import React, {useCallback, useEffect, useRef, useState} from "react";
import { IBaseLegendProps } from "../../codap/components/data-display/components/legend/legend-common";
import { useDataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { mstReaction } from "../../codap/utilities/mst-reaction";
import { mstAutorun } from "../../codap/utilities/mst-autorun";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { NumericSizeLegendModel, labelHeight, NumericSizeLegendKey } from "./numeric-size-legend-model";

import "./size-legend.scss";

const margin = 30;

// This is not an observing component because all of its real rendering happens in
// a mstAutorun.
export const NumericSizeLegend =
  function NumericSizeLegend({layerIndex, setDesiredExtent}: IBaseLegendProps) {

    const dataConfiguration = useDataConfigurationContext() as IDstDataConfigurationModel;
    const dataDisplayLayout = useDataDisplayLayout();
    const keysElt = useRef(null);

    // useState guarantees the model will only be created once
    // useMemo doesn't have that guarantee
    const [legendModel] = useState(
      () => new NumericSizeLegendModel(dataConfiguration, dataDisplayLayout)
    );

    // This is outside of the main autorun because setDesiredExtent might 
    // cause extra re-renders, so it only
    // runs when the desiredExtent actually changes
    useEffect(function updateDesiredExtent() {
      return mstReaction(
        () => {
          if (dataConfiguration?.placeCanHaveZeroExtent("legend")) {
            return 0;
          }
          // There is just one row so this is a basic calculation
          // We are just hacking the height of the axis for now
          const axisHeight = 20;
          return labelHeight + legendModel.layoutData.rowHeight + axisHeight;
        },
        (desiredExtent) => {
          setDesiredExtent(layerIndex, desiredExtent);
        },
        {name: "NumericSizeLegend updateDesiredExtent", fireImmediately: true},
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

    const handleLegendKeyClick = useCallback((event: any, d: NumericSizeLegendKey) => {
      const caseIds = dataConfiguration?.getCasesForLegendRange(d.min, d.max);
      if (caseIds) {
        if (event.shiftKey) dataConfiguration?.dataset?.selectCases(caseIds);
        else dataConfiguration?.dataset?.setSelectedCases(caseIds);
      }
    }, [dataConfiguration]);

    useEffect(() => { return mstAutorun(function d3Render() {
      if (!keysElt.current) return;
      const root = select(keysElt.current);

      const keySize = legendModel.circleMaxDiameter;
      const pointsData = legendModel.pointsData;
      const ticks = legendModel.ticks;
      const n = pointsData.length;

      if (n === 0 || ticks.length < 2) {
        root.select(".legend-size-numeric-bins").selectAll("*").remove();
        root.select(".legend-size-numeric-points").selectAll("*").remove();
        root.select(".legend-size-numeric-axis").selectAll("*").remove();
        return;
      }

      const fullWidth = legendModel.layoutData.fullWidth;
      // Equal-width bins indexed by position, mirroring the choropleth color legend:
      // binScale maps a bin index to its right edge; bin i spans [binScale(i-1), binScale(i)].
      const binScale = scaleLinear().domain([-1, n - 1]).range([margin, fullWidth - margin * 2]);
      const binLeft = (i: number) => binScale(i - 1);
      const binRight = (i: number) => binScale(i);
      const binCenter = (i: number) => (binLeft(i) + binRight(i)) / 2;

      // Bin rectangles.
      root.select(".legend-size-numeric-bins")
        .selectAll<SVGRectElement, NumericSizeLegendKey>("rect")
        .data(pointsData)
        .join(enter => enter.append("rect")
          .attr("class", "legend-size-bin")
          .attr("data-testid", "legend-size-bin")
          .on("click", handleLegendKeyClick))
        .attr("x", d => binLeft(d.index))
        .attr("y", labelHeight)
        .attr("width", d => binRight(d.index) - binLeft(d.index))
        .attr("height", keySize)
        .classed("legend-rect-selected", d => dataConfiguration?.casesInRangeAreSelected(d.min, d.max) ?? false);

      // A dot centered in each bin rectangle, sized for that bin.
      root.select(".legend-size-numeric-points")
        .selectAll<SVGCircleElement, NumericSizeLegendKey>("circle")
        .data(pointsData)
        .join(enter => enter.append("circle")
          .attr("class", "legend-key")
          .attr("data-testid", "legend-key")
          .on("click", handleLegendKeyClick))
        .attr("r", d => d.size / 2)
        .attr("cx", d => binCenter(d.index))
        .attr("cy", labelHeight + keySize / 2)
        .classed("legend-key-selected", d => dataConfiguration?.casesInRangeAreSelected(d.min, d.max) ?? false);

      // Axis labels the internal bin-boundary thresholds at the bin edges, like the
      // color legend (ticks = [min, ...thresholds, max]).
      const thresholds = ticks.slice(1, -1);
      const fmt = format(".2r");
      const axis = axisBottom(binScale)
        .tickValues(d3Range(thresholds.length))
        .tickFormat(i => fmt(thresholds[Number(i)]))
        .tickSize(4);

      root.selectAll<SVGGElement, any>(".legend-size-numeric-axis")
        .call(axis)
        .attr("transform", `translate(0 ${labelHeight + legendModel.layoutData.rowHeight})`);

    }, {name: "NumericSizeLegend d3 render"}, dataConfiguration); },
      [dataConfiguration, handleLegendKeyClick, legendModel]
    );

    return (
      <g ref={keysElt} className="legend-size-numeric" data-testid="legend-size-numeric">
        <g className="legend-size-numeric-bins"></g>
        <g className="legend-size-numeric-points"></g>
        <g className="legend-size-numeric-axis"></g>
      </g>
    );
  };
