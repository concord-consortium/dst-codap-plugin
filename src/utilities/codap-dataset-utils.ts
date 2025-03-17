import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { datasetConfig } from "../models/dataset-config";
import { getData, setupSelectionSynchronization } from "./codap-utils";

interface CodapApiResult {
  success: boolean;
  values?: any;
}

/**
 * Get a list of available datasets in CODAP
 * @returns An array of dataset names
 */
export async function getAvailableDatasets(): Promise<string[]> {
  try {
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: "dataContextList"
    }) as CodapApiResult;
    
    if (result.success && result.values) {
      return result.values.map((context: any) => context.name);
    }
    return [];
  } catch (error) {
    console.error("Error getting available datasets:", error);
    return [];
  }
}

/**
 * Get all attributes for a specific dataset in CODAP
 * @param dataContextName The name of the dataset
 * @returns An array of attribute names
 */
export async function getDatasetAttributes(dataContextName: string): Promise<string[]> {
  try {
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[*].attribute`
    }) as CodapApiResult;
    
    if (result.success && result.values) {
      return result.values.map((attr: any) => attr.name);
    }
    return [];
  } catch (error) {
    console.error("Error getting dataset attributes:", error);
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
    // Update the interactive state through CODAP API
    return await codapInterface.sendRequest({
      action: "update",
      resource: "interactiveState",
      values: state
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

/**
 * Load the dataset based on the current configuration
 * @returns Promise that resolves when data is loaded
 */
export async function loadConfiguredData(): Promise<void> {
  if (!datasetConfig.dataContextName || !datasetConfig.isConfigured) {
    console.error("Cannot load data: dataset not properly configured");
    return;
  }
  
  try {
    // Load the dataset using the configured context name
    await getData(datasetConfig.dataContextName);
    
    // Set up selection synchronization with the configured context
    setupSelectionSynchronization(datasetConfig.dataContextName);
  } catch (error) {
    console.error("Error loading configured data:", error);
  }
} 
