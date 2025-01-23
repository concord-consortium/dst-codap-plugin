import { types } from "mobx-state-tree";
import { DstDataDisplayModel } from "./data-display-model";
import { DataSet } from "../codap/models/data/data-set";
import { SharedCaseMetadata } from "../codap/models/shared/shared-case-metadata";
import { IHistoryServiceEnv } from "../codap/models/history/history-service";

export const DstContainer = types.model("DstContainer", {
  dataDisplayModel: DstDataDisplayModel,
  dataSet: DataSet,
  sharedCaseMetadata: SharedCaseMetadata,
});

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

export const dstContainer = DstContainer.create({
  dataDisplayModel: {
    layers: [
      {
        "id": "LAYRLShNROjFjxSS",
        "layerIndex": 0,
        "dataConfiguration": {
          "id": "GDCONCfyNftDdK3cd",
          "type": "graphDataConfigurationType",
          "_attributeDescriptions": {
            "legend": {
              "attributeID": "ATTR444185124424189"
            }
          },
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
          "Toyota",
          "Volkswagen",
          "Ford",
          "Chevy"
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
