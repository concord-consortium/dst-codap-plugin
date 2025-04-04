import { codapInterface } from "@concord-consortium/codap-plugin-api";

// Interface for CODAP API responses
export interface CodapApiResult {
  success: boolean;
  values?: any;
}

/**
 * Get a list of available datasets in CODAP
 * @returns An array of dataset names
 */
export async function getAvailableDatasets(): Promise<string[]> {
  try {
    console.log("Sending request to get dataContextList...");
    
    if (!codapInterface) {
      console.error("codapInterface is not available");
      return [];
    }
    
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: "dataContextList"
    }) as CodapApiResult;
    
    console.log("dataContextList response:", result);
    
    if (result.success && result.values) {
      const datasets = result.values.map((context: any) => context.name);
      console.log("Extracted dataset names:", datasets);
      return datasets;
    } else {
      console.warn("dataContextList request was unsuccessful:", result);
      return [];
    }
  } catch (error) {
    console.error("Error getting available datasets:", error);
    return [];
  }
}

/**
 * Save the interactive state to CODAP
 * @param state The state to save
 * @returns The result of the save operation
 */
export async function saveInteractiveState(state: any): Promise<any> {
  try {
    // Create a serializable version of the state
    const serializableState: Record<string, any> = {};
    
    // If datasetConfig is in the state, extract only the serializable properties
    if (state.datasetConfig) {
      serializableState.datasetConfig = {
        dataContextName: state.datasetConfig.dataContextName,
        latitudeAttribute: state.datasetConfig.latitudeAttribute,
        longitudeAttribute: state.datasetConfig.longitudeAttribute,
        dateAttribute: state.datasetConfig.dateAttribute,
        colorAttribute: state.datasetConfig.colorAttribute,
        sizeAttribute: state.datasetConfig.sizeAttribute,
        dateFormat: state.datasetConfig.dateFormat,
        isConfigured: state.datasetConfig.isConfigured
      };
    }
    
    // Update the interactive state through CODAP API
    return await codapInterface.sendRequest({
      action: "update",
      resource: "interactiveState",
      values: serializableState
    });
  } catch (error) {
    console.error("Error saving interactive state:", error);
    return { success: false, error };
  }
}

/**
 * Load the interactive state from CODAP
 * @returns The loaded state or undefined if not found
 */
export async function loadInteractiveState(): Promise<any> {
  try {
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: "interactiveState"
    }) as CodapApiResult;
    
    if (result.success && result.values) {
      return result.values;
    }
    return undefined;
  } catch (error) {
    console.error("Error loading interactive state:", error);
    return undefined;
  }
} 

