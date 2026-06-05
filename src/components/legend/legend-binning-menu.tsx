import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button, HStack, NumberDecrementStepper, NumberIncrementStepper, NumberInput,
  NumberInputField, NumberInputStepper, Popover, PopoverArrow, PopoverBody,
  PopoverContent, PopoverTrigger, Radio, RadioGroup, Text, VStack
} from "@chakra-ui/react";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { BinningMode } from "../../utilities/legend-binning";

interface ILegendBinningMenuProps {
  label: "Color" | "Size";
  dataConfiguration?: IDstDataConfigurationModel;
}

/**
 * Small caret button beside a legend attribute dropdown. Opens a menu to choose
 * the numeric binning mode (quantile / linear / logarithmic) and bin count for
 * that legend. The mode applies immediately; the count is committed when the menu
 * closes, which recalculates and refreshes the corresponding legend.
 */
export const LegendBinningMenu = observer(function LegendBinningMenu(
  { label, dataConfiguration }: ILegendBinningMenuProps
) {
  const [count, setCount] = useState(dataConfiguration?.numericBinCount ?? 5);

  // Binning only applies to a numeric legend attribute.
  if (!dataConfiguration || dataConfiguration.attributeType("legend") !== "numeric") {
    return null;
  }

  const mode = dataConfiguration.effectiveBinningMode;
  const isAuto = dataConfiguration.numericBinningMode == null;

  const commitCount = () => {
    if (count !== dataConfiguration.numericBinCount) {
      dataConfiguration.setNumericBinCount(count);
    }
  };

  return (
    <Popover placement="bottom-end" onOpen={() => setCount(dataConfiguration.numericBinCount)} onClose={commitCount}>
      <PopoverTrigger>
        <Button
          size="xs"
          variant="ghost"
          minW="18px"
          h="20px"
          px={1}
          aria-label={`${label} binning options`}
          title={`${label} binning options`}
        >
          ▾
        </Button>
      </PopoverTrigger>
      <PopoverContent width="190px" fontSize="xs">
        <PopoverArrow />
        <PopoverBody>
          <VStack align="stretch" spacing={2}>
            <Text fontWeight="bold">
              {label} bins{isAuto ? " (auto)" : ""}
            </Text>
            <RadioGroup
              value={mode}
              onChange={(v) => dataConfiguration.setNumericBinningMode(v as BinningMode)}
            >
              <VStack align="stretch" spacing={1}>
                <Radio value="quantile" size="sm">Quantile</Radio>
                <Radio value="linear" size="sm">Linear</Radio>
                <Radio value="logarithmic" size="sm">Logarithmic</Radio>
              </VStack>
            </RadioGroup>
            <HStack>
              <Text>Bins:</Text>
              <NumberInput
                size="xs"
                min={2}
                max={12}
                value={count}
                onChange={(_, valueAsNumber) => {
                  if (!Number.isNaN(valueAsNumber)) setCount(valueAsNumber);
                }}
                maxW="72px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});
