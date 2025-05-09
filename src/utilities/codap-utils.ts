import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getDataContext,
  getSelectionList, initializePlugin, selectCases, sendMessage
} from "@concord-consortium/codap-plugin-api";
import { comparer, reaction } from "mobx";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

import { DIDataContext, DIGetCaseResult } from "../codap/data-interactive/data-interactive-data-set-types";
import { IAttribute } from "../codap/models/data/attribute";
import { CodapV2DataSetImporter } from "../codap/v2/codap-v2-data-set-importer";
import { toV3CaseId } from "../codap/utilities/codap-utils";
import { ICaseCreation } from "../codap/models/data/data-set-types";

import { codapData } from "../models/codap-data";
import { DstContainer, dstContainer } from "../models/dst-container";
import { IDstDataConfigurationModel } from "../models/dst-data-configuration-model";
import { ui } from "../models/ui";
import { kCollectionName, kInitialDimensions, kPluginName, kVersion } from "./constants";

// This alternative dataset is easier to debug because it only has 2 cases
import testDataURL from "../data/Tornado_Tracks_2.csv";
const testDataContextName = "Tornado_Tracks_2";
import realDataURL from "../data/Tornado_Tracks_2020-2022.csv";
const realDataContextName = "Tornado_Tracks_2020-2022";

const urlParams = new URLSearchParams(window.location.search);
const testing = urlParams.has("testing");
const dataURL = testing ? testDataURL : realDataURL;
const dataContextName = testing ? testDataContextName : realDataContextName;

export async function initializeDST() {
  // Check for noEmbed parameter
  if (urlParams.has("noEmbed")) {
    return; // Skip initialization if noEmbed parameter exists
  }

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

  // When the selection changes in the plugin, pass those changes to Codap.
  reaction(
    () => Array.from(codapData.dataSet.selection),
    selection => selectCases(dataContextName, Array.from(codapData.dataSet.selection)),
    { equals: comparer.structural}
  );
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

    const casesResult = await getCaseByFormulaSearch(dataContextName, kCollectionName, "true");

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
    const selectionListResult = await getSelectionList(dataContextName);
    if (selectionListResult.success) {
      codapData.dataSet.setSelectedCases(selectionListResult.values.map((aCase: any) => toV3CaseId(aCase.caseID)));
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

export async function dstAddCaseToSelection(caseId: string) {
  codapData.dataSet.selectCases([caseId]);
}

export async function dstRemoveCaseFromSelection(caseId: string) {
  codapData.dataSet.selectCases([caseId], false);
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

  const latAttribute = dstDataset.getAttributeByName("Latitude");
  const longAttribute = dstDataset.getAttributeByName("Longitude");

  // The x and y attributes have to be set for the two configurations.
  // This is necessary so legend code which can identify what the childmost collection is
  if (!latAttribute || !longAttribute) return;
  
  const colorConfiguration = dstContainer.dataDisplayModel.colorDataConfiguration;
  colorConfiguration.setAttribute("x", {attributeID: longAttribute.id});
  colorConfiguration.setAttribute("y", {attributeID: latAttribute.id});

  const sizeConfiguration = dstContainer.dataDisplayModel.sizeDataConfiguration;
  sizeConfiguration.setAttribute("x", {attributeID: longAttribute.id});
  sizeConfiguration.setAttribute("y", {attributeID: latAttribute.id});
}

function updateConfiguration(configuration?: IDstDataConfigurationModel) {
  if (!configuration) return;

  // For the configuration to refresh, the following functions have to be called.
  // This might show up as a problem with undo/redo as well.
  configuration._clearFilteredCases(configuration.dataset);
  configuration.clearCasesCache();
}

export function setDSTCases(cases: ICaseCreation[]) {
  const dstDataset = dstContainer.dataSet;
  dstDataset.removeCases(dstDataset.itemIds);
  dstDataset.addCases(cases, {canonicalize: true});
  const {dataDisplayModel} = dstContainer;
  updateConfiguration(dataDisplayModel.colorDataConfiguration);
  updateConfiguration(dataDisplayModel.sizeDataConfiguration);
}

export function resizePlugin(height: number, width: number) {
  sendMessage("update", "interactiveFrame", { dimensions: { height, width } });
}
