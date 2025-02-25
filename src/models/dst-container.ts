import { Instance, types } from "mobx-state-tree";
import { DstDataDisplayModel } from "./dst-data-display-model";
import { DataSet } from "../codap/models/data/data-set";
import { SharedCaseMetadata } from "../codap/models/shared/shared-case-metadata";
import { IHistoryServiceEnv } from "../codap/models/history/history-service";

export const DstContainer = types.model("DstContainer", {
  dataDisplayModel: DstDataDisplayModel,
  dataSet: DataSet,
  sharedCaseMetadata: SharedCaseMetadata,
});
export interface IDstContainer extends Instance<typeof DstContainer> {}

const historyServiceEnv: IHistoryServiceEnv = {
  historyService: {
    handleApplyModelChange(options) {
      // noop
    },
    withoutUndo(actionCall, options) {
      // noop
    }
  }
};

// The initial model here is mostly a place holder. However some parts of it are
// preserved when the real data is imported from CODAP.
// - the dataDisplayModel is preserved. Only _attributeDescripts.legend.attributeID is updated
//   when an attribute is configured in the legend.
// - the dataset id from this initial dataset will replace the imported dataset id, 
//   so this initial id is preserved.
// - the metadata id from this initial metadata will replace the imported metadata id,
//   so this initial id is preserved.
export const dstContainer = DstContainer.create({
  dataDisplayModel: {
    layers: [
      {
        "id": "LAYRLShNROjFjxSS",
        "layerIndex": 0,
        "dataConfiguration": {
          "id": "GDCONCfyNftDdK3cd",
          "_attributeDescriptions": {},
          "dataset": "DATA33637005901959",
          "metadata": "SHARQxjKerhUm8ts",
          "hiddenCases": [],
        }
      },
      {
        "id": "LAYRL123",
        "layerIndex": 1,
        "dataConfiguration": {
          "id": "GDCON123",
          "_attributeDescriptions": {},
          "legendRepresentation": "size",
          "dataset": "DATA33637005901959",
          "metadata": "SHARQxjKerhUm8ts",
          "hiddenCases": [],
        }
      }
    ]
  },
  dataSet: {
    "id": "DATA33637005901959",
    "name": "New Dataset",
    "collections": [
      {
        "id": "COLL475139530534220",
        "name": "Cases",
        "attributes": [
          "ATTR444185124424189",
          "ATTR859044866983853"
        ],
        "_groupKeyCaseIds": [
          [
            "ITEM720543340969707",
            "CASE246657054186208"
          ],
          [
            "ITEM139217082312718",
            "CASE428102889982743"
          ],
          [
            "ITEM614468301791110",
            "CASE602988398337539"
          ],
          [
            "ITEM112558960259864",
            "CASE574970957157937"
          ]
        ]
      }
    ],
    "attributesMap": {
      "ATTR444185124424189": {
        "id": "ATTR444185124424189",
        "name": "Brand",
        "clientKey": "",
        "deleteable": true,
        "editable": true,
        "values": [
          "A",
          "B",
          "C",
          "D"
        ]
      },
      "ATTR859044866983853": {
        "id": "ATTR859044866983853",
        "name": "newAttr",
        "clientKey": "",
        "deleteable": true,
        "editable": true,
        "values": [
          "10",
          "11",
          "2",
          "3"
        ]
      }
    },
    "_itemIds": [
      "ITEM720543340969707",
      "ITEM139217082312718",
      "ITEM614468301791110",
      "ITEM112558960259864"
    ],
    "snapSelection": [],
    "setAsideItemIds": []
  },
  sharedCaseMetadata: {
    "type": "SharedCaseMetadata",
    "id": "SHARQxjKerhUm8ts",
    "data": "DATA33637005901959",
    "collections": {},
    "categories": {},
    "hidden": {},
    "caseTableTileId": "TABL956576606772774",
    "lastShownTableOrCardTileId": "TABL956576606772774",
    "attributeColorRanges": {}
  }
},
{
  ... historyServiceEnv
});

(window as any).dstContainer = dstContainer;
