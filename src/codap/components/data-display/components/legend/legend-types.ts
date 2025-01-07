import { IDataSet } from "../../../../models/data/data-set"
import { GraphPlace } from "../../../axis-graph-shared"
import { IDataConfigurationModel } from "../../models/data-configuration-model"

interface LegendLayerModel {
  layerIndex: number,
  id: string,
  dataConfiguration: IDataConfigurationModel
};

export interface LegendDataDisplayModel {
  placeCanAcceptAttributeIDDrop: (place: GraphPlace,
    dataset: IDataSet | undefined,
    attributeID: string | undefined) => boolean,
  layers: LegendLayerModel[]
}
