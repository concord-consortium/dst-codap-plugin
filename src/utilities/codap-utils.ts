import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getDataContext,
  getSelectionList, initializePlugin, selectCases
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
import { getAvailableDatasets, loadInteractiveState } from "./codap-interface-helpers";
import { datasetConfig } from "../models/dataset-config";

// This alternative dataset is easier to debug because it only has 2 cases
// import dataURL from "../data/Tornado_Tracks_2.csv";
// const dataContextName = "Tornado_Tracks_2";
import dataURL from "../data/Tornado_Tracks_2020-2022.csv";
const dataContextName = "Tornado_Tracks_2020-2022";

export async function initializeDST() {
  console.log("Initializing DST plugin...");
  
  try {
    // Try to initialize the plugin
    await initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
    console.log("Successfully initialized plugin in CODAP");
  } catch (reason) {
    // This will happen if not embedded in CODAP
    console.warn("Warning: Not embedded in CODAP", reason);
  }
    
  // Test CODAP API communication
  try {
    // Get available datasets directly from the helpers
    const datasets = await getAvailableDatasets();
    console.log("Available datasets detected at initialization:", datasets);
    
    if (datasets.length === 0) {
      console.warn("No datasets available in CODAP. The user may need to create one.");
    }
  } catch (error) {
    console.error("Error testing CODAP API at initialization:", error);
  }

  // Check for existing configuration
  try {
    const state = await loadInteractiveState();
    
    if (state?.datasetConfig) {
      // Apply saved configuration
      Object.assign(datasetConfig, state.datasetConfig);
      
      if (datasetConfig.isConfigured && datasetConfig.dataContextName) {
        // Load the configured dataset
        await getData(datasetConfig.dataContextName);
        setupSelectionSynchronization(datasetConfig.dataContextName);
      } else {
        // Don't automatically show config panel - let user click the button instead
        console.log("Dataset not configured, but waiting for user to click 'Configure Dataset' button");
      }
    } else {
      // No previous configuration, check if default dataset exists
      const dataContextResult = await getDataContext(dataContextName);
      
      if (dataContextResult.success) {
        // Default dataset exists, use it
        await getData();
        setupSelectionSynchronization(dataContextName);
      } else {
        // Don't automatically show config panel - let user click the button instead
        console.log("No default dataset, but waiting for user to click 'Configure Dataset' button");
      }
    }
  } catch (error) {
    console.warn("Error initializing plugin:", error);
    // Don't automatically show config panel on error - let user click the button instead
    console.log("Error during initialization, but waiting for user to click 'Configure Dataset' button");
  }
}

/**
 * Load data from CODAP and set up visualization
 * @param contextName Optional context name to load, defaults to hardcoded dataContextName
 */
export async function getData(contextName: string = dataContextName) {
  try {
    let dataContextResult = await getDataContext(contextName);

    if (!dataContextResult.success) {
      // If specified dataset doesn't exist and it's the default dataset, try to create it
      if (contextName === dataContextName) {
        const createContextResult = await createDataContextFromURL(dataURL);
        if (!createContextResult.success) {
          console.error("Couldn't load dataset");
          return;
        }
        dataContextResult = await getDataContext(contextName);
      } else {
        console.error(`Dataset ${contextName} not found`);
        return;
      }
    }

    updateDataSetAttributes(dataContextResult.values);

    const casesResult = await getCaseByFormulaSearch(contextName, kCollectionName, "true");

    if (!casesResult.success) {
      console.error("Couldn't load cases from dataset");
      return;
    }

    const casesValues = casesResult.values as DIGetCaseResult["case"][];
    // The id should never be undefined but it is typed that way
    const cases: ICaseCreation[] = casesValues.map(aCase => ({ __id__: toV3CaseId(aCase.id!), ...aCase.values }));

    setDSTCases(cases);

    // Update date range
    const dates = codapData.caseIds
      .map(caseId => codapData.getCaseDate(caseId))
      .filter((date): date is number => date !== undefined && isFinite(date));
    
    if (dates.length > 0) {
      codapData.setAbsoluteDateRange(Math.min(...dates), Math.max(...dates));
    } else {
      console.warn("No valid dates found in the dataset");
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

/**
 * Set up selection synchronization between CODAP and the plugin
 * @param contextName The name of the dataset context to synchronize with
 */
export function setupSelectionSynchronization(contextName: string) {
  addDataContextChangeListener(contextName, notification => {
    const { operation } = notification.values;

    if (operation === "selectCases") {
      updateSelection(contextName);
    }
  });

  // When the selection changes in the plugin, pass those changes to Codap.
  reaction(
    () => Array.from(codapData.dataSet.selection),
    selection => selectCases(contextName, Array.from(codapData.dataSet.selection)),
    { equals: comparer.structural}
  );
}

/**
 * Update the selection from CODAP to the plugin
 * @param contextName The name of the dataset context to get selection from
 */
export async function updateSelection(contextName: string = dataContextName) {
  // If the user is selecting using a marquee, ignore updates from codap.
  if (ui.activeMarquee) return;

  try {
    const selectionListResult = await getSelectionList(contextName);
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
