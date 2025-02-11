import { Instance, types } from "mobx-state-tree";
import { GraphPlace } from "../codap/components/axis-graph-shared";
import { IDataSet } from "../codap/models/data/data-set";
import { DstDataConfigurationModel } from "./dst-data-configuration-model";
import { IBaseDataDisplayModel } from "../codap/components/data-display/models/base-data-display-content-model";

export const DstLayerModel = types.model("DstLayerModel", {
  layerIndex: types.number,
  id: types.string,
  dataConfiguration: DstDataConfigurationModel
});

export const DstDataDisplayModel = types.model("DstDataDisplayModel", {
  layers: types.array(DstLayerModel)
})
.views(self => ({
  get colorDataConfiguration() {
    return self.layers[0].dataConfiguration;
  },
  get sizeDataConfiguration() {
    return self.layers[1].dataConfiguration;
  }
}))
.actions(self => ({
  placeCanAcceptAttributeIDDrop(place: GraphPlace,
    dataset: IDataSet | undefined,
    attributeID: string | undefined
  ) {
    return false;
  }
}));
export interface IDstDataDisplayModel extends Instance<typeof DstDataDisplayModel> {}

export function isDstDataDisplayModel(model: IBaseDataDisplayModel): model is IDstDataDisplayModel {
  // Currently just checking to make sure it has a colorDataConfiguration property is good enough
  return "colorDataConfiguration" in model;
}
