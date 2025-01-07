import { IAnyStateTreeNode } from "mobx-state-tree"
import { IDataConfigurationModel } from "./data-configuration-model"
import { GraphPlace } from "../../axis-graph-shared"
import { IDataSet } from "../../../models/data/data-set"

interface BaseLayerModel {
  layerIndex: number,
  id: string,
  dataConfiguration: IDataConfigurationModel
};

export interface BaseDataDisplayModel extends IAnyStateTreeNode {
  placeCanAcceptAttributeIDDrop: (place: GraphPlace,
    dataset: IDataSet | undefined,
    attributeID: string | undefined) => boolean,
  layers: BaseLayerModel[]
}
