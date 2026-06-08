import {
  addDataContextChangeListener, createDataContextFromURL, getCaseByFormulaSearch, getCollectionList,
  getDataContext, getSelectionList, initializePlugin, selectCases
} from "@concord-consortium/codap-plugin-api";
import { comparer, reaction } from "mobx";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

import { DIDataContext, DIGetCaseResult } from "../codap/data-interactive/data-interactive-data-set-types";
import { IAttribute } from "../codap/models/data/attribute";
import { CodapV2DataSetImporter } from "../codap/v2/codap-v2-data-set-importer";
import { toV3CaseId } from "../codap/utilities/codap-utils";
import { ICaseCreation } from "../codap/models/data/data-set-types";

import { minMax } from "./array-utils";
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
 * Ask CODAP for the case IDs currently visible in the table and update
 * codapData.hiddenCaseIds so anything in our local caseIds but not in CODAP's
 * visible set is treated as hidden. Useful when a notification arrives without
 * per-case IDs in its payload.
 */
/**
 * Re-fetch the currently visible cases from CODAP and rebuild the plugin's
 * in-memory dataset to match. Set-aside cases are excluded automatically
 * because CODAP's getCaseByFormulaSearch respects table visibility.
 *
 * Preserves the current view (camera, bounds, date range) — only the case
 * set changes.
 */
/**
 * Fetch all visible cases for a collection, retrying on timeout/failure. CODAP's
 * single all-cases request can exceed the iframe-phone request timeout on large
 * datasets; the timeout is intermittent, so a few retries with backoff usually
 * succeed. Returns the successful result, or a failed result after all attempts.
 */
async function fetchAllVisibleCases(contextName: string, collectionName: string, attempts = 4) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const result = await getCaseByFormulaSearch(contextName, collectionName, "true");
      if (result?.success && Array.isArray(result.values)) return result;
      console.warn(`Case fetch attempt ${i}/${attempts} unsuccessful`, result);
    } catch (e) {
      console.warn(`Case fetch attempt ${i}/${attempts} failed (likely timeout):`, e);
    }
    if (i < attempts) await new Promise(resolve => setTimeout(resolve, 600 * i));
  }
  return { success: false, values: [] as DIGetCaseResult["case"][] };
}

// getDataContext, with retry + backoff on *timeouts*. The bare call rejects with
// "CODAP request timed out" while CODAP is busy holding/importing a large (100K+)
// dataset, which aborted the whole load and left the plot blank. Retrying rides
// out the transient busy window. A resolved { success: false } is a definitive
// answer (the context doesn't exist) — return it immediately, no retry. If every
// attempt throws (e.g. not embedded in CODAP), re-throw so getData's caller bails
// the same way it did before.
async function getDataContextWithRetry(contextName: string, attempts = 4) {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await getDataContext(contextName);
    } catch (e) {
      lastError = e;
      console.warn(`getDataContext attempt ${i}/${attempts} failed (likely timeout):`, e);
      if (i < attempts) await new Promise(resolve => setTimeout(resolve, 600 * i));
    }
  }
  throw lastError;
}

export async function resyncHiddenCasesFromCodap(contextName: string) {
  try {
    const dataContextResult = await getDataContext(contextName);
    if (!dataContextResult?.success) {
      console.warn("Reload Table: data context not available");
      return;
    }
    const collectionName = await resolveLeafCollectionName(contextName, dataContextResult.values);
    const casesResult = await fetchAllVisibleCases(contextName, collectionName);
    if (!casesResult.success || !Array.isArray(casesResult.values)) {
      console.warn("Reload Table: case fetch failed", casesResult);
      return;
    }
    const casesValues = casesResult.values as DIGetCaseResult["case"][];
    const cases: ICaseCreation[] = casesValues.map(aCase => ({
      __id__: toV3CaseId(aCase.id!),
      ...aCase.values
    }));
    setDSTCases(cases);
  } catch (e) {
    console.warn("resyncHiddenCasesFromCodap failed:", e);
  }
}

/**
 * Resolve the leaf collection name for a CODAP data context. Prefers the
 * deepest (last) collection from the context payload; falls back to
 * getCollectionList; falls back to kCollectionName as a last resort.
 */
async function resolveLeafCollectionName(contextName: string, context: any): Promise<string> {
  const fromContext = Array.isArray(context?.collections) ? context.collections : [];
  if (fromContext.length > 0) {
    const last = fromContext[fromContext.length - 1];
    if (last?.name) return last.name;
  }
  try {
    const list = await getCollectionList(contextName);
    if (list?.success && Array.isArray(list.values) && list.values.length > 0) {
      const last = list.values[list.values.length - 1];
      if (last?.name) return last.name;
    }
  } catch (e) {
    console.warn("getCollectionList failed:", e);
  }
  return kCollectionName;
}

/**
 * Load data from CODAP and set up visualization
 * @param contextName Optional context name to load, defaults to hardcoded dataContextName
 */
export async function getData(contextName: string = dataContextName) {
  try {
    let dataContextResult = await getDataContextWithRetry(contextName);

    if (!dataContextResult.success) {
      // If specified dataset doesn't exist and it's the default dataset, try to create it
      if (contextName === dataContextName) {
        const createContextResult = await createDataContextFromURL(dataURL);
        if (!createContextResult.success) {
          console.error("Couldn't load dataset");
          return;
        }
        dataContextResult = await getDataContextWithRetry(contextName);
      } else {
        console.error(`Dataset ${contextName} not found`);
        return;
      }
    }

    updateDataSetAttributes(dataContextResult.values);

    // Determine the actual leaf collection name for this dataset — the legacy
    // hardcoded "Cases" only matches the bundled tornado sample.
    const collectionName = await resolveLeafCollectionName(contextName, dataContextResult.values);

    const casesResult = await fetchAllVisibleCases(contextName, collectionName);

    if (!casesResult.success) {
      console.error(`Couldn't load cases from dataset (collection "${collectionName}") after retries — ` +
        `CODAP did not return the cases in time (dataset may be too large for a single request).`);
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
      // minMax, not Math.min(...dates): spreading 100K+ dates throws
      // "Maximum call stack size exceeded", which silently aborted load and left
      // the plot blank at scale.
      const { min, max } = minMax(dates);
      codapData.setAbsoluteDateRange(min, max);
    } else {
      console.warn("No valid dates found in the dataset");
    }
  } catch (error) {
    // This will happen if not embedded in CODAP
    console.warn("Not embedded in CODAP", error);
  }
}

// True while we're applying a CODAP-originated selection to the plugin. The
// plugin->CODAP reaction checks this so it doesn't echo that selection straight
// back to CODAP (which caused a feedback fight while selecting on a CODAP graph).
let applyingCodapSelection = false;
// Monotonic id for in-flight updateSelection requests. getSelectionList is async,
// so rapid CODAP notifications can resolve out of order; only the latest wins.
let selectionRequestSeq = 0;

/**
 * Set up selection synchronization between CODAP and the plugin
 * @param contextName The name of the dataset context to synchronize with
 */
export function setupSelectionSynchronization(contextName: string) {
  addDataContextChangeListener(contextName, notification => {
    const { operation } = notification.values ?? {};
    if (operation === "selectCases") {
      updateSelection(contextName);
    }
    // Set-aside / restore are intentionally NOT auto-synced; the user
    // triggers a sync by clicking the "Reload Table" button.
  });

  // When the selection changes in the plugin, pass those changes to Codap.
  reaction(
    () => Array.from(codapData.dataSet.selection),
    selection => {
      // Don't echo a CODAP-originated selection back to CODAP — that creates a
      // feedback loop while the user selects on a CODAP graph/table.
      if (applyingCodapSelection) return;
      // A very large selection — e.g. clicking a legend quintile that covers ~20%
      // of a big dataset — can exceed CODAP's request timeout. The selection is
      // already applied locally, so degrade gracefully rather than letting the
      // rejection surface as an unhandled promise rejection (dev-server overlay).
      selectCases(contextName, selection).catch((error: unknown) => {
        console.warn("Pushing selection to CODAP failed (the selection may be too large):", error);
      });
    },
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

  const requestSeq = ++selectionRequestSeq;
  try {
    const selectionListResult = await getSelectionList(contextName);
    // Discard a stale response: a newer CODAP notification superseded this one.
    if (requestSeq !== selectionRequestSeq) return;
    if (selectionListResult.success) {
      const ids = selectionListResult.values.map((aCase: any) => toV3CaseId(aCase.caseID));
      // Apply without echoing back to CODAP (see the reaction above).
      applyingCodapSelection = true;
      try {
        codapData.dataSet.setSelectedCases(ids);
      } finally {
        applyingCodapSelection = false;
      }
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
