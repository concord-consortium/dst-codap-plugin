import { types } from "mobx-state-tree";
import { DataConfigurationModel } from "../codap/components/data-display/models/data-configuration-model";
import { GraphPlace } from "../codap/components/axis-graph-shared";
import { IDataSet } from "../codap/models/data/data-set";

export const DstLayerModel = types.model("DstLayerModel", {
  layerIndex: types.number,
  id: types.string,
  dataConfiguration: DataConfigurationModel
});

export const DstDataDisplayModel = types.model("DstDataDisplayModel", {
  layers: types.array(DstLayerModel)
})
.actions(self => ({
  placeCanAcceptAttributeIDDrop(place: GraphPlace,
    dataset: IDataSet | undefined,
    attributeID: string | undefined
  ) {
    return false;
  }
}));
