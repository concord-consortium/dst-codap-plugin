import { extent, scalePoint } from "d3";
import { types, Instance } from "mobx-state-tree";
import { DataConfigurationModel } from "../codap/components/data-display/models/data-configuration-model";
import { CaseData } from "../codap/components/data-display/d3-types";
import { dataDisplayGetNumericValue } from "../codap/components/data-display/data-display-value-utils";
import { interpolateColors } from "../codap/utilities/color-utils";
import {
  autoBinningMode, BinningMode, computeThresholds, kDefaultBinCount, makeBinScale
} from "../utilities/legend-binning";

// These are diameters
const minDiameter = 2.25;
const maxDiameter = 15.75;

// The spec has this at 12, but it is little big with our default data
export const defaultPointDiameter = 6;

// Compressed diameter range so the largest dots don't obscure the smaller ones:
// the smallest is 20% larger than minDiameter, and the largest is midway between
// the old second- and third-largest of the full [minDiameter, maxDiameter] spread.
const kSizeMinDiameter = minDiameter * 1.2;
const kSizeMaxDiameter = minDiameter + (maxDiameter - minDiameter) * 0.625;

// `count` evenly-spaced diameters across the compressed size range.
function sizeDiametersForCount(count: number): number[] {
  if (count < 2) return [kSizeMinDiameter];
  return Array.from({ length: count }, (_, i) =>
    kSizeMinDiameter + (kSizeMaxDiameter - kSizeMinDiameter) * (i / (count - 1)));
}

// `count` colors interpolated between the configured low/high (mirrors
// getCholorplethColors but for an arbitrary bin count).
function colorsForCount(base: string[], count: number): string[] {
  const low = base[0] ?? "#eff3ff";
  const high = base[base.length - 1] ?? "#08519c";
  if (count < 2) return [low];
  if (count === base.length) return base;
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? low : i === count - 1 ? high : interpolateColors(low, high, i / (count - 1)));
}

export const DstDataConfigurationModel = DataConfigurationModel.named("DstDataConfiguration")
  .props({
    legendRepresentation: types.maybe(types.enumeration(["color", "size"])),
    // How to bin the numeric legend attribute. Undefined = auto (see
    // effectiveBinningMode). numericBinCount is the number of bins (quintiles = 5).
    numericBinningMode: types.maybe(types.enumeration(["quantile", "linear", "logarithmic"])),
    numericBinCount: types.optional(types.number, kDefaultBinCount)
  })
  .actions(self => ({
    setNumericBinningMode(mode?: BinningMode) {
      self.numericBinningMode = mode;
    },
    setNumericBinCount(count: number) {
      self.numericBinCount = Math.max(2, Math.min(12, Math.round(count)));
    }
  }))
  .views(self => ({
    // The numeric values driving the legend bins. Same source the color legend
    // and legend-bin selection use, so thresholds and selection stay consistent.
    get numericLegendValues(): number[] {
      return (self.numericValuesForAttrRole("legend") ?? []) as number[];
    }
  }))
  .views(self => ({
    // The binning mode actually used: the user's explicit choice, or an auto pick
    // that prefers quantile, then linear, then logarithmic by point evenness.
    get effectiveBinningMode(): BinningMode {
      return (self.numericBinningMode as BinningMode | undefined)
        ?? autoBinningMode(self.numericLegendValues, self.numericBinCount);
    }
  }))
  .views(self => ({
    get numericBinThresholds(): number[] {
      return computeThresholds(self.numericLegendValues, self.effectiveBinningMode, self.numericBinCount);
    },
    get sizeDiameters(): number[] {
      return sizeDiametersForCount(self.numericBinCount);
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

    // Maps a numeric legend value to one of numericBinCount diameters using the
    // effective binning mode.
    get numericSizeScale() {
      const [min, max] = extent(self.numericLegendValues);
      const domain = (min != null && max != null) ? [min, max] : [0, 1];
      return makeBinScale(self.numericBinThresholds, self.sizeDiameters, domain);
    },

    // Bin edges for the numeric size legend: [min, ...thresholds, max].
    get numericSizeTicks(): number[] {
      const [min, max] = extent(self.numericLegendValues);
      if (min == null || max == null) return [];
      return [min, ...self.numericBinThresholds, max];
    },

    // Override the vendored color scale so the choropleth color legend honors the
    // same binning mode/count. The returned object quacks like a d3 quantize scale
    // (callable + thresholds()/range()/domain()), which is all the choropleth uses.
    get legendNumericColorScale() {
      const values = self.numericLegendValues;
      const [min, max] = extent(values);
      const colors = colorsForCount(self.choroplethColors, self.numericBinCount);
      if (min == null || max == null) return makeBinScale<string>([], colors, []);
      return makeBinScale<string>(self.numericBinThresholds, colors, [min, max]);
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
