import { IAnyStateTreeNode } from "mobx-state-tree"
import { IDataSet } from "../../../models/data/data-set"
import { GraphPlace } from "../../axis-graph-shared"
import { IDataConfigurationModel } from "./data-configuration-model"

// This is used when parts of the CODAP source is used outside of CODAP
export interface IBaseLayerModel {
  layerIndex: number,
  id: string,
  dataConfiguration: IDataConfigurationModel
};

export interface IBaseDataDisplayModel extends IAnyStateTreeNode {
  placeCanAcceptAttributeIDDrop: (place: GraphPlace,
    dataset: IDataSet | undefined,
    attributeID: string | undefined) => boolean,
  layers: IBaseLayerModel[]
}
