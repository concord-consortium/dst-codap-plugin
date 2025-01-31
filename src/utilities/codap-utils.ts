import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getDataContext,
  getSelectionList, initializePlugin, selectCases
} from "@concord-consortium/codap-plugin-api";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

import { DIDataContext, DIGetCaseResult } from "../codap/data-interactive/data-interactive-data-set-types";
import { IAttribute } from "../codap/models/data/attribute";
import { CodapV2DataSetImporter } from "../codap/v2/codap-v2-data-set-importer";
import { toV3CaseId } from "../codap/utilities/codap-utils";
import { IValueType } from "../codap/models/data/attribute-types";
import { ICaseCreation } from "../codap/models/data/data-set-types";

import { codapData, getDate, ICase } from "../models/codap-data";
import { graph } from "../models/graph";
import { ui } from "../models/ui";
import { kInitialDimensions, kPluginName, kVersion } from "./constants";
import { DstContainer, dstContainer } from "../models/dst-container";

import dataURL from "../data/Tornado_Tracks_2020-2022.csv";

const dataContextName = "Tornado_Tracks_2020-2022";
const collectionName = "Cases";

export async function initializeDST() {
  initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions})
    .catch(reason => {
      // This will happen if not embedded in CODAP
      console.warn("Not embedded in CODAP");
    });

  getData();
  updateSelection();

  addDataContextChangeListener(dataContextName, notification => {
    const { operation } = notification.values;

    if (operation === "selectCases") {
      updateSelection();
    }
  });
}

export async function getData() {
  try {
    let dataContextResult = await getDataContext(dataContextName);

    if (!dataContextResult.success) {
      const createContextResult = await createDataContextFromURL(dataURL);
      if (!createContextResult.success) {
        console.error("Couldn't load dataset");
        return;
      }
      dataContextResult = await getDataContext(dataContextName);
    }

    updateDataSetAttributes(dataContextResult.values);

    const casesResult = await getCaseByFormulaSearch(dataContextName, collectionName, "true");

    if (!casesResult.success) {
      console.error("Couldn't load cases from dataset");
      return;
    }

    const casesValues = casesResult.values as DIGetCaseResult["case"][];
    // The id should never be undefined but it is typed that way
    const cases: ICase[] = casesValues.map(aCase => ({ __id__: toV3CaseId(aCase.id!), ...aCase.values }));

    // Update date range
    const dates = cases.map(aCase => getDate(aCase)).filter((time: number) => isFinite(time));
    graph.setAbsoluteDateRange(Math.min(...dates), Math.max(...dates));

    codapData.replaceCases(cases);

    // When the updateDataSetAttributes was called above all of cases were cleared out,
    // so we can just add them back in here
    const dstDataset = dstContainer.dataSet;
    dstDataset.addCases(cases as ICaseCreation[], {canonicalize: true});
    const configuration = dstContainer.dataDisplayModel.layers[0].dataConfiguration;
    
    // For the configuration to refresh, the following functions have to be called.
    // This might show up as a problem with undo/redo as well.
    configuration._clearFilteredCases(configuration.dataset);
    configuration.clearCasesCache();
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export async function updateSelection() {
  // If the user is selecting using a marquee, ignore updates from codap.
  if (ui.activeMarquee) return;

  try {
    const selectionListResult = await getSelectionList(dataContextName);
    if (selectionListResult.success) {
      dstDataSet().setSelectedCases(selectionListResult.values.map((aCase: any) => toV3CaseId(aCase.caseID)));
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export function dstDataSet() {
  return dstContainer.dataSet;
}

export function dstCaseIds() {
  return dstDataSet().getCollectionByName(collectionName)?.caseIds ?? [];
}

export function dstAttributeValue(attributeName: string, caseId: string) {
  const attributeId = dstDataSet().getAttributeByName(attributeName)?.id;
  return attributeId && dstDataSet().getValue(caseId, attributeId);
}

export function dstAttributeNumericValue(attributeName: string, caseId: string) {
  return codapNumberValue(dstAttributeValue(attributeName, caseId));
}

export function caseDate(caseId: string) {
  // We need at least a year. To make things simple we just use 2000 for now
  const year = dstAttributeNumericValue("Year", caseId) || 2000;
  const month = (dstAttributeNumericValue("Month", caseId) || 1) - 1;
  const day = dstAttributeNumericValue("Day", caseId) || 1;
  return Date.UTC(year, month, day);
}

export function codapNumberValue(value: IValueType) {
  return value ? +value : undefined;
}

export async function dstSelectCases(caseIds: string[]) {
  dstDataSet().setSelectedCases(caseIds);
  return await selectCases(dataContextName, caseIds);
}

export async function dstAddCaseToSelection(caseId: string) {
  dstDataSet().selectCases([caseId]);
  return await selectCases(dataContextName, Array.from(dstDataSet().selection));
}

export async function dstRemoveCaseFromSelection(caseId: string) {
  dstDataSet().selectCases([caseId], false);
  return await selectCases(dataContextName, Array.from(dstDataSet().selection));
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
