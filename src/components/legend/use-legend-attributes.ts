import { useCallback, useEffect, useState } from "react";
import { datasetConfig } from "../../models/dataset-config";
import { dstContainer } from "../../models/dst-container";
import { getDatasetAttributes } from "../../utilities/codap-dataset-utils";

export interface SafeAttribute {
  id: string;
  name: string;
  isTemporary?: boolean;
  // Attribute type ("numeric" | "categorical" | "date" | ...). Undefined for
  // temporary (CODAP-only) attributes whose type we can't yet determine.
  type?: string;
}

export type LegendLabel = "Color" | "Size";

/**
 * Loads the available attributes for the current dataset (from the in-memory
 * MST DataSet plus any CODAP-only attributes seen via the DI bridge) and
 * exposes the currently selected Color / Size attributes alongside a single
 * setter used by both the cube-overlay pulldowns and the bottom legend pane.
 */
export function useLegendAttributes() {
  const dataDisplayModel = dstContainer.dataDisplayModel;
  const dataset = dataDisplayModel.layers[0].dataConfiguration.dataset;
  const metadata = dataDisplayModel.layers[0].dataConfiguration.metadata;
  // Reading the attribute count makes the (observer) caller reactive to the
  // dataset's attributes loading, so the list below refreshes once data arrives
  // instead of leaving every attribute as an unusable "temporary" entry.
  const attrCount = dataset?.attributes.length ?? 0;

  const [availableAttributes, setAvailableAttributes] = useState<SafeAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColorAttribute, setSelectedColorAttribute] = useState<SafeAttribute | null>(null);
  const [selectedSizeAttribute, setSelectedSizeAttribute] = useState<SafeAttribute | null>(null);

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => {
    const loadAttributes = async () => {
      if (!dataset) return;
      setIsLoading(true);
      try {
        const safeAttributes: SafeAttribute[] = dataset.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          isTemporary: false,
          type: attr.type
        }));
        if (datasetConfig.dataContextName) {
          try {
            const codapAttrNames = await getDatasetAttributes(datasetConfig.dataContextName);
            const existingAttrNames = new Set(safeAttributes.map(attr => attr.name));
            for (const attrName of codapAttrNames) {
              if (!existingAttrNames.has(attrName) && attrName) {
                safeAttributes.push({
                  id: `temp_${attrName.replace(/\s+/g, "_")}`,
                  name: attrName,
                  isTemporary: true
                });
              }
            }
          } catch (error) {
            console.error("Error loading CODAP attributes:", error);
          }
        }
        safeAttributes.sort((a, b) => a.name.localeCompare(b.name));
        setAvailableAttributes(safeAttributes);

        const resolveSelected = (
          configuredId: string | undefined,
          configuredName: string | undefined,
          configurationLabel: "color" | "size",
        ): SafeAttribute | null => {
          if (configuredId) {
            const byId = safeAttributes.find(a => a.id === configuredId);
            if (byId) return byId;
            if (configuredName) {
              const byName = safeAttributes.find(a => a.name === configuredName);
              if (byName) {
                const config = configurationLabel === "color"
                  ? dataDisplayModel.colorDataConfiguration
                  : dataDisplayModel.sizeDataConfiguration;
                config.setAttribute("legend", { attributeID: byName.id });
                return byName;
              }
            }
          }
          return null;
        };
        setSelectedColorAttribute(resolveSelected(
          dataDisplayModel.colorDataConfiguration.attributeID("legend"),
          datasetConfig.colorAttribute,
          "color",
        ));
        setSelectedSizeAttribute(resolveSelected(
          dataDisplayModel.sizeDataConfiguration.attributeID("legend"),
          datasetConfig.sizeAttribute,
          "size",
        ));
      } catch (error) {
        console.error("Error loading attributes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, attrCount, datasetConfig.dataContextName, datasetConfig.colorAttribute,
      datasetConfig.sizeAttribute, dataDisplayModel]);

  const handleAttributeChange = useCallback((label: LegendLabel, attributeId: string) => {
    if (!dataset || !availableAttributes.length) return;
    const config = label === "Color"
      ? dataDisplayModel.colorDataConfiguration
      : dataDisplayModel.sizeDataConfiguration;
    if (!config) return;

    if (attributeId) {
      let selected = availableAttributes.find(a => a.id === attributeId);
      if (!selected) return;
      // If a "temporary" attribute is actually loaded in the dataset now, resolve
      // it to the real attribute so the legend has real data to color/size by.
      if (selected.isTemporary) {
        const real = dataset.attributes.find(a => a.name === selected!.name);
        if (real) selected = { id: real.id, name: real.name, isTemporary: false, type: real.type };
      }
      const resolvedId = selected.id;
      if (label === "Color") setSelectedColorAttribute(selected);
      else setSelectedSizeAttribute(selected);
      config.setAttribute("legend", { attributeID: resolvedId });
      if (label === "Color") datasetConfig.setColorAttribute(selected.name);
      else datasetConfig.setSizeAttribute(selected.name);
      if (!selected.isTemporary && metadata) {
        metadata.setAttributeBinningType(resolvedId, "quantile");
      }
    } else {
      config.setAttribute("legend", undefined);
      if (label === "Color") {
        setSelectedColorAttribute(null);
        datasetConfig.setColorAttribute(undefined);
      } else {
        setSelectedSizeAttribute(null);
        datasetConfig.setSizeAttribute(undefined);
      }
    }
  }, [dataset, availableAttributes, dataDisplayModel, metadata]);

  return {
    availableAttributes,
    isLoading,
    selectedColorAttribute,
    selectedSizeAttribute,
    handleAttributeChange,
  };
}
