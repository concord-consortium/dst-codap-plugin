import type { IDstDataConfigurationModel } from "../models/dst-data-configuration-model";

// Colors from the choropleth scale (mirrors point.tsx).
export const choroplethColors = ["#eff3ff", "#b5cbe6", "#7ca2ce", "#427ab5", "#08519c"];
export const DEFAULT_POINT_COLOR = "#e6805b";
const MISSING_COLOR = "#888888";

// A color configuration is the colorDataConfiguration from the data display model.
type ColorConfig = IDstDataConfigurationModel | undefined;

/**
 * Compute the quantile thresholds for the numeric "legend" attribute.
 * This mirrors the `thresholds` useMemo in point.tsx so the choropleth fallback
 * produces identical colors. Computed once per buffer rebuild rather than per case.
 */
export function computeNumericThresholds(colorDataConfig: ColorConfig): number[] {
  if (!colorDataConfig?.dataset) return [];
  const colorLegendId = colorDataConfig.attributeID("legend");
  const legendType = colorDataConfig.attributeType("legend");
  if (!colorLegendId || legendType !== "numeric") return [];

  const numericValues = Array.from(colorDataConfig.numericValuesForAttrRole("legend") || []);
  if (numericValues.length === 0) return [];

  const sortedValues = [...numericValues].sort((a, b) => a - b);
  const valueCount = sortedValues.length;
  const step = Math.max(1, Math.floor(valueCount / choroplethColors.length));
  const result: number[] = [];
  for (let i = 1; i < choroplethColors.length; i++) {
    const thresholdIndex = Math.min(i * step, valueCount - 1);
    result.push(sortedValues[thresholdIndex]);
  }
  return result;
}

/**
 * Resolve the fill color for a single case, replicating point.tsx exactly so the
 * instanced renderer matches the per-case implementation pixel-close.
 *
 * @param id case id
 * @param colorDataConfig the colorDataConfiguration
 * @param thresholds precomputed via computeNumericThresholds (numeric fallback path)
 */
export function getCaseColor(id: string, colorDataConfig: ColorConfig, thresholds: number[]): string {
  if (!colorDataConfig) return DEFAULT_POINT_COLOR;

  const colorLegendId = colorDataConfig.attributeID("legend");
  const legendValue = colorDataConfig.dataset?.getStrValue(id, colorLegendId || "");
  const legendType = colorDataConfig.attributeType("legend");

  // Default color (matches point.tsx: `getLegendColorForCase(id) || DEFAULT_COLOR`).
  let dotColor = colorDataConfig.getLegendColorForCase(id) || DEFAULT_POINT_COLOR;

  if (colorLegendId && legendValue) {
    const standardColor = colorDataConfig.getLegendColorForCase(id);

    if (standardColor && standardColor !== MISSING_COLOR) {
      dotColor = standardColor;
    } else if (legendType === "numeric") {
      const numericValue = colorDataConfig.dataset?.getNumeric(id, colorLegendId);
      if (numericValue !== undefined && numericValue !== null) {
        if (thresholds.length > 0) {
          let colorIndex = 0;
          for (let i = 0; i < thresholds.length; i++) {
            if (numericValue >= thresholds[i]) {
              colorIndex = i + 1;
            }
          }
          dotColor = choroplethColors[colorIndex];
        } else {
          // Linear fallback over the attribute's min/max.
          const allValues = Array.from(colorDataConfig.numericValuesForAttrRole("legend") || []);
          if (allValues.length > 0) {
            const min = Math.min(...allValues);
            const max = Math.max(...allValues);
            const range = max - min;
            if (range > 0) {
              const normalizedValue = Math.max(0, Math.min(1, (numericValue - min) / range));
              const colorIndex = Math.min(choroplethColors.length - 1,
                Math.floor(normalizedValue * choroplethColors.length));
              dotColor = choroplethColors[colorIndex];
            } else {
              dotColor = choroplethColors[Math.floor(choroplethColors.length / 2)];
            }
          } else {
            dotColor = DEFAULT_POINT_COLOR;
          }
        }
      } else {
        dotColor = DEFAULT_POINT_COLOR;
      }
    } else if (legendType === "categorical") {
      const categoryColor = colorDataConfig.getLegendColorForCase(id);
      if (categoryColor && categoryColor !== MISSING_COLOR && categoryColor.startsWith("#")) {
        dotColor = categoryColor;
      }
    }
  }

  return dotColor;
}
