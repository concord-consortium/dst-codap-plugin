import { makeAutoObservable } from "mobx";

import vars from "../../codap/components/vars.scss";
import { getStringBounds } from "../../codap/components/axis/axis-utils";
import { DataDisplayLayout } from "../../codap/components/data-display/models/data-display-layout";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";

export interface Key {
  size: number;
  index: number;
  canonicalValue: number;
  min: number;
  max: number;
}
interface Layout {
  fullWidth: number;
  numColumns: number;
  rowHeight: number;
}

export const padding = 5;
// Because the points start small, we can gain back some height by squeezing the 
// the points up into the axis label area.
export const labelHeight = getStringBounds("Wy", vars.labelFont).height - 5;

// TODO: try extending the CategoryLegendModel
// we have to understand what works and what doesn't work with MobX sub classing
export class NumericSizeLegendModel {
  dataDisplayLayout: DataDisplayLayout;
  dataConfiguration: IDstDataConfigurationModel | undefined;

  constructor(dataConfiguration: IDstDataConfigurationModel | undefined, dataDisplayLayout: DataDisplayLayout) {
    this.dataDisplayLayout = dataDisplayLayout;
    this.dataConfiguration = dataConfiguration;
    makeAutoObservable(this);
  }

  setDataConfiguration(dataConfiguration: IDstDataConfigurationModel | undefined) {
    this.dataConfiguration = dataConfiguration;
  }

  setDataDisplayLayout(dataDisplayLayout: DataDisplayLayout) {
    this.dataDisplayLayout = dataDisplayLayout;
  }

  get pointValues () {
    const quantizedScale = this.dataConfiguration?.numericSizeScale;
    if (!quantizedScale) {
      console.warn("pointsData: no scale found");
      return [];
    }

    return quantizedScale.range();
  }

  get ticks() {
    return this.dataConfiguration?.numericSizeTicks || [];
  }

  get pointsData(): Key[] {
    if (this.ticks.length < 2) return [];
    const halfStep = (this.ticks[1] - this.ticks[0]) / 2;

    return this.pointValues.map((size, index) => ({
      size,
      index,
      canonicalValue: this.ticks[index] + halfStep,
      min: index === 0 ? -Infinity : this.ticks[index],
      max: index === this.pointValues.length - 1 ? Infinity : this.ticks[index+1]
    }));
  }

  get circleMaxDiameter() {
    const { pointValues } = this;

    if (pointValues.length < 1) return 0;

    return pointValues[pointValues.length - 1];
  }

  get layoutData() {
    const fullWidth = this.dataDisplayLayout.tileWidth;
    const rowHeight = this.circleMaxDiameter + padding;
    const numColumns = this.pointValues.length || 1;

    const lod: Layout = {
      fullWidth,
      numColumns,
      rowHeight
    };

    return lod;
  }

}
