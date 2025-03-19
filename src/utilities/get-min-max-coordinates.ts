import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { datasetConfig } from "../models/dataset-config";

// Interface for CODAP API responses
interface CodapApiResult {
  success: boolean;
  values?: any;
}

// Interface for collection
interface Collection {
  name: string;
  attrs?: any[];
  [key: string]: any;
}

// Interface for attribute
interface Attribute {
  name: string;
  [key: string]: any;
}

/**
 * Retrieves the minimum and maximum values for latitude and longitude
 * using the CODAP formula search API
 */
export async function getMinMaxCoordinates() {
  try {
    // First, check if we have a configured dataset
    if (!datasetConfig.dataContextName) {
      console.error("No dataset context configured");
      return null;
    }

    // Get current data context info
    const dataContextName = datasetConfig.dataContextName;
    console.log(`Getting min/max coordinates for dataset: ${dataContextName}`);

    // Get data context details to verify structure
    const contextResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}]`
    }) as CodapApiResult;

    if (!contextResult.success) {
      console.error(`Failed to retrieve data context: ${dataContextName}`);
      return null;
    }

    console.log("Data context details:", contextResult.values);

    // Find collections in the context (based on example)
    let collections: Collection[] = contextResult.values?.collections || [];
    
    // If no collections found in context, try a direct query
    if (!collections.length) {
      console.log("No collections found in context result, trying direct collection query");
      
      const collectionsResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection`
      }) as CodapApiResult;
      
      if (collectionsResult.success && collectionsResult.values) {
        collections = collectionsResult.values;
      }
    }

    if (!collections.length) {
      console.error("No collections found in data context");
      return null;
    }

    // Typically, the main collection is named "Cases"
    // But let's use the first collection if we can't find "Cases"
    const casesCollection = collections.find((c: Collection) => c.name === "Cases") || collections[0];
    
    console.log(`Using collection: ${casesCollection.name}`);

    // Get the configured attribute names
    const latAttr = datasetConfig.latitudeAttribute;
    const longAttr = datasetConfig.longitudeAttribute;

    if (!latAttr || !longAttr) {
      console.error("Latitude or longitude attributes not configured");
      return null;
    }

    console.log(`Using attributes: latitude=${latAttr}, longitude=${longAttr}`);

    // Check if attributes are already in the collection (from examples)
    let attributes: Attribute[] = [];
    
    // Look for attrs in the collection
    if (casesCollection.attrs && Array.isArray(casesCollection.attrs)) {
      attributes = casesCollection.attrs;
      console.log("Found attributes in collection:", attributes);
    }
    
    // If no attributes found in collection, try a direct query
    if (!attributes.length) {
      console.log("No attributes found in collection, trying direct attribute query");
      
      const attrsResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection[${casesCollection.name}].attribute`
      }) as CodapApiResult;

      if (attrsResult.success) {
        attributes = attrsResult.values || [];
      }
    }

    if (!attributes.length) {
      console.warn("No attributes found but proceeding anyway as they might exist");
    } else {
      // Verify our attributes exist
      const latAttrExists = attributes.some((attr: Attribute) => attr.name === latAttr);
      const longAttrExists = attributes.some((attr: Attribute) => attr.name === longAttr);

      if (!latAttrExists || !longAttrExists) {
        console.warn(`Some attributes not found in collection: ${!latAttrExists ? latAttr : ""} ${!longAttrExists ? longAttr : ""}`);
        console.log("Available attributes:", attributes.map(a => a.name).join(", "));
        // Continue anyway as they might exist but not be in the attribute list
      }
    }

    // Now use formula search to get min/max values
    console.log("Using caseFormulaSearch to retrieve min/max values...");

    // Get min latitude
    const minLatResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${casesCollection.name}].caseFormulaSearch[${latAttr}=min(${latAttr})]`
    }) as CodapApiResult;

    console.log("Min latitude result:", minLatResult);

    // Get max latitude
    const maxLatResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${casesCollection.name}].caseFormulaSearch[${latAttr}=max(${latAttr})]`
    }) as CodapApiResult;

    console.log("Max latitude result:", maxLatResult);

    // Get min longitude
    const minLongResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${casesCollection.name}].caseFormulaSearch[${longAttr}=min(${longAttr})]`
    }) as CodapApiResult;

    console.log("Min longitude result:", minLongResult);

    // Get max longitude
    const maxLongResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${casesCollection.name}].caseFormulaSearch[${longAttr}=max(${longAttr})]`
    }) as CodapApiResult;

    console.log("Max longitude result:", maxLongResult);

    // Extract values from results
    const result = {
      minLat: null as number | null,
      maxLat: null as number | null,
      minLong: null as number | null,
      maxLong: null as number | null,
      success: false
    };

    // Helper function to extract numeric value from case
    function extractValue(caseResult: CodapApiResult, attrName: string): number | null {
      if (!caseResult.success) {
        console.log(`Failed to get result for ${attrName}`);
        return null;
      }
      
      let values = caseResult.values;
      
      // Handle different response formats
      if (Array.isArray(values) && values.length > 0) {
        // Format: { values: [ { values: { attr: value } } ] }
        const caseData = values[0];
        let value = null;

        // Check in values object
        if (caseData.values && caseData.values[attrName] !== undefined) {
          value = caseData.values[attrName];
        } 
        // Check directly on case object
        else if (caseData[attrName] !== undefined) {
          value = caseData[attrName];
        }

        // Convert to number if it's a string
        if (value !== null && typeof value === "string" && !isNaN(Number(value))) {
          value = Number(value);
        }

        console.log(`Extracted ${attrName} value:`, value);
        return typeof value === "number" && !isNaN(value) ? value : null;
      } 
      // Format: { values: { attrName: value } }
      else if (values && typeof values === "object" && values[attrName] !== undefined) {
        const value = values[attrName];
        const numValue = typeof value === "string" ? Number(value) : value;
        console.log(`Extracted ${attrName} value from direct object:`, numValue);
        return typeof numValue === "number" && !isNaN(numValue) ? numValue : null;
      }
      
      console.log(`Could not extract ${attrName} from result`, caseResult);
      return null;
    }

    // Extract values
    result.minLat = extractValue(minLatResult, latAttr);
    result.maxLat = extractValue(maxLatResult, latAttr);
    result.minLong = extractValue(minLongResult, longAttr);
    result.maxLong = extractValue(maxLongResult, longAttr);

    // Check if we got all values
    result.success = result.minLat !== null && result.maxLat !== null && 
                    result.minLong !== null && result.maxLong !== null;

    if (result.success) {
      console.log("Successfully retrieved coordinate bounds:");
      console.log(`Latitude: ${result.minLat} to ${result.maxLat}`);
      console.log(`Longitude: ${result.minLong} to ${result.maxLong}`);
    } else {
      console.error("Failed to retrieve all coordinate bounds");
      console.log("Partial results:", result);
    }

    return result;
  } catch (error) {
    console.error("Error retrieving min/max coordinates:", error);
    return null;
  }
}

/**
 * Executes a direct formula search with the provided formula
 * @param dataContextName The data context name
 * @param collectionName The collection name
 * @param formula The formula to search with
 * @returns The API result
 */
export async function executeFormulaSearch(
  dataContextName: string,
  collectionName: string,
  formula: string
): Promise<CodapApiResult> {
  try {
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${formula}]`
    }) as CodapApiResult;
    
    return result;
  } catch (error) {
    console.error("Error executing formula search:", error);
    return { success: false };
  }
} 
