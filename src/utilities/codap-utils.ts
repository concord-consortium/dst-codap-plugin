import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getDataContext,
  getSelectionList, initializePlugin, selectCases
} from "@concord-consortium/codap-plugin-api";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

import { DIDataContext, DIGetCaseResult } from "../codap/data-interactive/data-interactive-data-set-types";
import { IAttribute } from "../codap/models/data/attribute";
import { CodapV2DataSetImporter } from "../codap/v2/codap-v2-data-set-importer";
import { toV3CaseId } from "../codap/utilities/codap-utils";
import { ICaseCreation } from "../codap/models/data/data-set-types";

import { codapData } from "../models/codap-data";
import { DstContainer, dstContainer } from "../models/dst-container";
import { ui } from "../models/ui";
import { kCollectionName, kDataContextName, kInitialDimensions, kPluginName, kVersion } from "./constants";

import dataURL from "../data/Tornado_Tracks_2020-2022.csv";

export async function initializeDST() {
  initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions})
    .catch(reason => {
      // This will happen if not embedded in CODAP
      console.warn("Not embedded in CODAP");
    });

  getData();
  updateSelection();

  addDataContextChangeListener(kDataContextName, notification => {
    const { operation } = notification.values;

    if (operation === "selectCases") {
      updateSelection();
    }
  });
}

export async function getData() {
  try {
    let dataContextResult = await getDataContext(kDataContextName);

    if (!dataContextResult.success) {
      const createContextResult = await createDataContextFromURL(dataURL);
      if (!createContextResult.success) {
        console.error("Couldn't load dataset");
        return;
      }
      dataContextResult = await getDataContext(kDataContextName);
    }

    updateDataSetAttributes(dataContextResult.values);

    const casesResult = await getCaseByFormulaSearch(kDataContextName, kCollectionName, "true");

    if (!casesResult.success) {
      console.error("Couldn't load cases from dataset");
      return;
    }

    const casesValues = casesResult.values as DIGetCaseResult["case"][];
    // The id should never be undefined but it is typed that way
    const cases: ICaseCreation[] = casesValues.map(aCase => ({ __id__: toV3CaseId(aCase.id!), ...aCase.values }));

    setDSTCases(cases);

    // Update date range
    const dates = codapData.caseIds.map(caseId => codapData.getCaseDate(caseId));
    codapData.setAbsoluteDateRange(Math.min(...dates), Math.max(...dates));
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export async function updateSelection() {
  // If the user is selecting using a marquee, ignore updates from codap.
  if (ui.activeMarquee) return;

  try {
    const selectionListResult = await getSelectionList(kDataContextName);
    if (selectionListResult.success) {
      codapData.dataSet.setSelectedCases(selectionListResult.values.map((aCase: any) => toV3CaseId(aCase.caseID)));
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export async function dstSelectCases(caseIds: string[]) {
  codapData.dataSet.setSelectedCases(caseIds);
  return await selectCases(kDataContextName, caseIds);
}

export async function dstAddCaseToSelection(caseId: string) {
  codapData.dataSet.selectCases([caseId]);
  return await selectCases(kDataContextName, Array.from(codapData.dataSet.selection));
}

export async function dstRemoveCaseFromSelection(caseId: string) {
  codapData.dataSet.selectCases([caseId], false);
  return await selectCases(kDataContextName, Array.from(codapData.dataSet.selection));
}

export function updateDataSetAttributes(dataContext: DIDataContext) {
  const guidMap = new Map<number, { type: string, object: any }>;
  const v3AttrMap = new Map<number, IAttribute>;

  const { name, title, collections, setAsideItems } = dataContext;

  if (!collections?.length) {
    // There is nothing to update    
    return;
  }

  const dstDataset = dstContainer.dataSet;
  const dstCaseMetadata = dstContainer.sharedCaseMetadata;

  const importer = new CodapV2DataSetImporter(guidMap, v3AttrMap);

  // The id of our internal dataset can't be changed so we ignore the id of the 
  // incoming data context
  const importContainer = DstContainer.create({
    dataSet: {
      id: dstDataset.id,
      name,
      _title: title  
    },
    sharedCaseMetadata: {
      id: dstCaseMetadata.id,
      data: dstDataset.id  
    },
    dataDisplayModel: {}
  });
  const { dataSet, sharedCaseMetadata} = importContainer;

  importer.importContext({collections, setAsideItems}, dataSet, sharedCaseMetadata);

  const dataSetSnapshot = getSnapshot(dataSet);
  applySnapshot(dstDataset, dataSetSnapshot);

  const metadataSnapshot = getSnapshot(sharedCaseMetadata);
  applySnapshot(dstCaseMetadata, metadataSnapshot);

  const colorAttribute = dstDataset.getAttributeByName("Magnitude (0-5)");
  const latAttribute = dstDataset.getAttributeByName("Latitude");
  const longAttribute = dstDataset.getAttributeByName("Longitude");
  
  if (!colorAttribute || !latAttribute || !longAttribute) return;

  const configuration = dstContainer.dataDisplayModel.layers[0].dataConfiguration;
  configuration.setAttribute("legend", {attributeID: colorAttribute.id});
  configuration.setAttribute("x", {attributeID: longAttribute.id});
  configuration.setAttribute("y", {attributeID: latAttribute.id});
}

export function setDSTCases(cases: ICaseCreation[]) {
  // When the updateDataSetAttributes was called above all of cases were cleared out,
  // so we can just add them back in here
  const dstDataset = dstContainer.dataSet;
  dstDataset.addCases(cases, {canonicalize: true});
  const configuration = dstContainer.dataDisplayModel.layers[0].dataConfiguration;
  
  // For the configuration to refresh, the following functions have to be called.
  // This might show up as a problem with undo/redo as well.
  configuration._clearFilteredCases(configuration.dataset);
  configuration.clearCasesCache();
}
