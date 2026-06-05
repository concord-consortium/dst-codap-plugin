import { extent, scalePoint, scaleQuantize, scaleQuantile } from "d3";
import { types, Instance } from "mobx-state-tree";
import { DataConfigurationModel } from "../codap/components/data-display/models/data-configuration-model";
import { CaseData } from "../codap/components/data-display/d3-types";
import { dataDisplayGetNumericValue } from "../codap/components/data-display/data-display-value-utils";

// These are diameters
const minDiameter = 2.25;
const maxDiameter = 15.75;

// The spec has this at 12, but it is little big with our default data
export const defaultPointDiameter = 6;

// Number of numeric size bins. Matches the 5-color choropleth so the size legend
// reflects quintiles just like the color legend.
const kSizeBinCount = 5;
// Compressed diameter range so the largest dots don't obscure the smaller ones:
// the smallest is 20% larger than minDiameter, and the largest is midway between
// the old second- and third-largest of the full [minDiameter, maxDiameter] spread
// (i.e. the 0.75 and 0.5 points -> 0.625).
const kSizeMinDiameter = minDiameter * 1.2;
const kSizeMaxDiameter = minDiameter + (maxDiameter - minDiameter) * 0.625;
// Evenly-spaced diameters across the compressed range, one per bin.
const sizeDiameters = Array.from({ length: kSizeBinCount }, (_, i) =>
  kSizeMinDiameter + (kSizeMaxDiameter - kSizeMinDiameter) * (i / (kSizeBinCount - 1)));

export const DstDataConfigurationModel = DataConfigurationModel.named("DstDataConfiguration")
  .props({
    legendRepresentation: types.maybe(types.enumeration(["color", "size"]))
  })
  .views(self => ({
    // Numeric values for the size legend attribute, taken from the full attribute
    // (like the color legend's distribution) so quantile bins reflect the real
    // data spread regardless of this layer's visible-case wiring.
    get numericSizeValues(): number[] {
      const attrID = self.attributeID("legend");
      const dataset = self.dataset;
      const attr = attrID && dataset ? dataset.getAttribute(attrID) : undefined;
      if (!attr) return [];
      // Read changeCount so this is reactive to value edits.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      attr.changeCount;
      return attr.numValues.filter((v: number) => Number.isFinite(v));
    }
  }))
  .views(self => ({
    get categoricalSizeScale() {
      // This will return an array of [kMain] if there is no legend
      const categories = self.categoryArrayForAttrRole("legend");

      return scalePoint(categories, [minDiameter, maxDiameter])
        // Make single categories have the default point size
        // Note: If we added padding to the scale this alignment would
        // affect other sizes too, but without padding the alignment
        // only applies when there is a single point.
        // TODO: perhaps when there are 2 categories we don't want default to be the
        // min and max diameters? That will require a more complex scale
        .align((defaultPointDiameter-minDiameter)/(maxDiameter-minDiameter));
    },

    // Maps a numeric legend value to one of kSizeBinCount diameters. Mirrors the
    // color legend's binning: scaleQuantile (equal-count quintiles) by default,
    // scaleQuantize (equal-width) when the attribute's binningType is "quantize".
    get numericSizeScale() {
      const values = self.numericSizeValues;
      const attrID = self.attributeID("legend");
      const binningType = attrID ? self.metadata?.getAttributeBinningType(attrID) : undefined;

      if (binningType === "quantize") {
        const [min, max] = extent(values);
        if (min == null || max == null) return scaleQuantize([0, 1], sizeDiameters);
        return scaleQuantize([min, max], sizeDiameters);
      }

      return scaleQuantile(values, sizeDiameters);
    }
  }))
  .views(self => ({
    // Bin edges for the numeric size legend: [min, ...internal thresholds, max]
    // (kSizeBinCount + 1 values). Mirrors the color legend — quantile (quintiles)
    // by default, equal-width when the attribute's binningType is "quantize".
    get numericSizeTicks(): number[] {
      const values = self.numericSizeValues;
      if (values.length === 0) return [];
      const [min, max] = extent(values);
      if (min == null || max == null) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scale = self.numericSizeScale as any;
      const attrID = self.attributeID("legend");
      const binningType = attrID ? self.metadata?.getAttributeBinningType(attrID) : undefined;
      const internal: number[] = binningType === "quantize"
        ? (scale.thresholds?.() ?? [])
        : (scale.quantiles?.() ?? []);
      return [min, ...internal, max];
    }
  }))
  .views(self => ({
    getLegendSizeForCategory(category: string) {
      return self.categoricalSizeScale(category) ?? defaultPointDiameter;
    },
    getLegendSizeForNumericValue(value: number) {
      return self.numericSizeScale(value) ?? defaultPointDiameter;
    },
    // This is a generic function which could be also be used by 
    // getCasesForLegendQuantile.
    getCasesForLegendRange(min: number, max: number) {
      const dataset = self.dataset,
        legendID = self.attributeID("legend");
      return legendID
        ? self.getCaseDataArray(0).filter((aCaseData: CaseData) => {
          const value = dataDisplayGetNumericValue(dataset, aCaseData.caseID, legendID);
          return value !== undefined && value >= min && value < max;
        }).map((aCaseData: CaseData) => aCaseData.caseID)
        : [];
    }
  }))
  .views(self => ({
    casesInRangeAreSelected(min: number, max: number): boolean {
      const casesInRange = self.getCasesForLegendRange(min, max);
      return !!(casesInRange.length > 0 && casesInRange?.every((anID: string) => self.dataset?.isCaseSelected(anID)));
    },
    getLegendSizeForCase(id: string) {
      const legendID = self.attributeID("legend");
      const legendAttribute = self.dataset?.getAttribute(legendID);
      if (!id || !legendID || !legendAttribute) {
        return defaultPointDiameter;
      }

      const legendType = self.attributeType("legend");
      switch (legendType) {
        case "categorical": {
          const legendValue = self.dataset?.getStrValue(id, legendID);
          if (!legendValue) return defaultPointDiameter;
          return self.getLegendSizeForCategory(legendValue);
        }
        case "numeric": {
          const legendValue = self.dataset?.getNumeric(id, legendID);
          if (legendValue == null) return defaultPointDiameter;
          return self.getLegendSizeForNumericValue(legendValue);
        }
        case "date":
        case "color":
        default:
          return defaultPointDiameter;
      }
    },
    getLegendColorForCase(id: string) {
      const legendID = self.attributeID("legend");
      const legendAttribute = self.dataset?.getAttribute(legendID);
      
      if (!id || !legendID || !legendAttribute) {
        return "#888888";
      }

      const legendType = self.attributeType("legend");
      
      if (legendType === "categorical") {
        const value = self.dataset?.getStrValue(id, legendID);
        if (!value) {
          return "#888888";
        }
        const color = self.getLegendColorForCategory(value);
        return color;
      } else if (legendType === "numeric") {
        const value = self.dataset?.getNumeric(id, legendID);
        if (value == null) {
          return "#888888";
        }
        const color = self.getLegendColorForNumericValue(value);
        return color;
      }
      
      return "#888888";
    }
  }));

export interface IDstDataConfigurationModel extends Instance<typeof DstDataConfigurationModel> { }
