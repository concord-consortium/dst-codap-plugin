import { Instance, types } from "mobx-state-tree";
import { AttributeDescription, DataConfigurationModel } from "../codap/components/data-display/models/data-configuration-model";
import { GraphPlace } from "../codap/components/axis-graph-shared";
import { IDataSet } from "../codap/models/data/data-set";
import { scalePoint } from "d3";
import { attributeTypes } from "../codap/models/data/attribute-types";

export const DstAttributeDescription = AttributeDescription.named("DstAttributeDescription")
.props({  
  type: types.maybe(types.enumeration([...attributeTypes, "categoricalSize"] as const))
});

// These are diameters
const minDiameter = 3;
const maxDiameter = 21;
export const defaultPointDiameter = 12;

export const DstDataConfigurationModel = DataConfigurationModel.named("DstDataConfiguration")
.props({
  _attributeDescriptions: types.map(DstAttributeDescription)
})
.views(self => ({
  get categoricalSizeScale() {
    const categorySet = self.categorySetForAttrRole("legend");

    // Just use the default size
    if (!categorySet) return (value: string) => undefined;
    // I think there's a helper function for this in dataConfiguration
    const categories = categorySet.values;

    return scalePoint(categories, [minDiameter, maxDiameter]);
  }
}))
.views(self => ({
  getLegendSizeForCategory(category: string) {
    return self.categoricalSizeScale(category) ?? defaultPointDiameter;
  }
}))
.views(self => ({
  getLegendSizeForCase(id: string) {
    const legendID = self.attributeID("legend");
    // todo: When user deletes we are not currently deleting the legend attribute ID. But we should.
    const legendAttribute = self.dataset?.getAttribute(legendID);
    if (!id || !legendID || !legendAttribute) {
      return defaultPointDiameter;
    }
    // Assume it is categorical for now
    // const legendType = self.attributeType("legend")
    const legendValue = self.dataset?.getStrValue(id, legendID);
    if (!legendValue) return defaultPointDiameter;

    return self.getLegendSizeForCategory(legendValue);
  }
}));

export interface IDstDataConfigurationModel extends Instance<typeof DstDataConfigurationModel> {}


export const DstLayerModel = types.model("DstLayerModel", {
  layerIndex: types.number,
  id: types.string,
  dataConfiguration: DstDataConfigurationModel
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
