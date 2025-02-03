import React, {useRef} from "react"
import {IDataSet} from "../../../../models/data/data-set"
import {GraphPlace} from "../../../axis-graph-shared"
import {useDataConfigurationContext} from "../../hooks/use-data-configuration-context"
import { IDataConfigurationModel } from "../../models/data-configuration-model"
import {LegendAttributeLabel} from "./legend-attribute-label"
import {CategoricalLegend} from "./categorical-legend"
import { ColorLegend } from "./color-legend"
import { IBaseLegendProps } from "./legend-common"
import {NumericLegend} from "./numeric-legend"

// This is exported so other users of CODAP can modify its behavior
export const legendComponentManager = {
  legendComponentMap: {
    categorical: CategoricalLegend,
    color: ColorLegend,
    date: NumericLegend,
    numeric: NumericLegend
  } as Partial<Record<string, React.ComponentType<IBaseLegendProps>>>,

  getLegendComponent(dataConfig: IDataConfigurationModel) {
    const type = dataConfig.attributeType("legend")
    return type && this.legendComponentMap[type]
  }
}

interface ILegendProps {
  layerIndex: number
  setDesiredExtent: (layerIndex:number, extent: number) => void
  onDropAttribute: (place: GraphPlace, dataSet: IDataSet, attrId: string) => void
}

export const Legend = function Legend({
                                        layerIndex, setDesiredExtent, onDropAttribute
                                      }: ILegendProps) {
  const dataConfiguration = useDataConfigurationContext(),
    // This change fixes the issue with the legend not updating
    // when the user changes the type
    attrType = dataConfiguration?.attributeType('legend'),
    LegendComponent = dataConfiguration && legendComponentManager.getLegendComponent(dataConfiguration),
    legendRef = useRef() as React.RefObject<SVGSVGElement>

  return attrType ? (
    <>
      <svg ref={legendRef} className='legend-component' data-testid='legend-component'>
        <LegendAttributeLabel
          onChangeAttribute={onDropAttribute}
        />
        {LegendComponent && <LegendComponent layerIndex={layerIndex} setDesiredExtent={setDesiredExtent} />}
      </svg>
    </>
  ) : null
}
Legend.displayName = "Legend"
