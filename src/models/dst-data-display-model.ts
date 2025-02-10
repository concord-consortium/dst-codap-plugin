import { types } from "mobx-state-tree";
import { GraphPlace } from "../codap/components/axis-graph-shared";
import { IDataSet } from "../codap/models/data/data-set";
import { DstDataConfigurationModel } from "./dst-data-configuration-model";

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
