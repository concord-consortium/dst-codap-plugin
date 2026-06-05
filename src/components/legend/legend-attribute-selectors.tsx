import React from "react";
import { observer } from "mobx-react-lite";
import { Flex, Select, Spinner, Text, VStack } from "@chakra-ui/react";
import { dstContainer } from "../../models/dst-container";
import { useLegendAttributes, LegendLabel } from "./use-legend-attributes";
import { LegendBinningMenu } from "./legend-binning-menu";
import "./legend-attribute-selectors.scss";

/**
 * Color and Size attribute pulldowns rendered as a floating overlay inside
 * the cube space (below the bottom-left button cluster). Mirrors the
 * configuration writes the bottom-pane legends already perform so the two
 * surfaces stay in sync.
 */
export const LegendAttributeSelectors = observer(function LegendAttributeSelectors() {
  const {
    availableAttributes,
    isLoading,
    handleAttributeChange,
  } = useLegendAttributes();

  const dataDisplayModel = dstContainer.dataDisplayModel;

  const renderRow = (label: LegendLabel, currentId: string) => {
    const dataConfiguration = label === "Color"
      ? dataDisplayModel.colorDataConfiguration
      : dataDisplayModel.sizeDataConfiguration;
    // The size legend only makes sense for numeric attributes, so don't offer
    // categorical ones in the Size dropdown (Color still offers all types).
    const options = label === "Size"
      ? availableAttributes.filter(attr => attr.type !== "categorical")
      : availableAttributes;
    return (
      <Flex align="center" gap={1} className="legend-selector-row">
        <Text fontSize="xs" fontWeight="bold" minW="36px">{label}:</Text>
        {isLoading ? (
          <Spinner size="xs" />
        ) : (
          <>
            <Select
              size="xs"
              value={currentId || ""}
              onChange={(e) => handleAttributeChange(label, e.target.value)}
              placeholder="Select attribute"
            >
              <option value="">None</option>
              {options.map(attr => (
                <option key={attr.id} value={attr.id}>{attr.name}</option>
              ))}
            </Select>
            <LegendBinningMenu label={label} dataConfiguration={dataConfiguration} />
          </>
        )}
      </Flex>
    );
  };

  const colorId = dataDisplayModel.colorDataConfiguration?.attributeID("legend") || "";
  const sizeId = dataDisplayModel.sizeDataConfiguration?.attributeID("legend") || "";

  return (
    <div className="legend-attribute-selectors">
      <VStack align="stretch" spacing={1}>
        {renderRow("Color", colorId)}
        {renderRow("Size", sizeId)}
      </VStack>
    </div>
  );
});
