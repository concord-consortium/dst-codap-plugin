import { codapInterface } from "@concord-consortium/codap-plugin-api";

// Interface for CODAP API responses
interface CodapApiResult {
  success: boolean;
  values?: any;
}

/**
 * Example function demonstrating how to retrieve min/max latitude values
 * from the CODAP dataset using the caseFormulaSearch endpoint.
 */
export async function getMinMaxLatitudeExample() {
  const dataContextName = "Four-Seals"; // The name of the dataset
  const collectionName = "Cases"; // The main collection
  const attribute = "latitude"; // The attribute to get min/max for
  
  console.log(`Retrieving min/max ${attribute} values from ${dataContextName}`);
  
  try {
    // Example 1: Using caseFormulaSearch to get min latitude
    // Format: dataContext[context-name].collection[collection-name].caseFormulaSearch[attr=formula]
    const minLatResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${attribute}=min(${attribute})]`
    }) as CodapApiResult;
    
    console.log("Min latitude search result:", minLatResult);
    
    // Example 2: Using caseFormulaSearch to get max latitude
    const maxLatResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${attribute}=max(${attribute})]`
    }) as CodapApiResult;
    
    console.log("Max latitude search result:", maxLatResult);
    
    // Example 3: Alternative approach using caseSearch with a comparison formula
    // This may work better in some CODAP versions
    const minLatAltResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].caseSearch[${attribute}<=min(${attribute})]`
    }) as CodapApiResult;
    
    console.log("Alternative min latitude search result:", minLatAltResult);
    
    // Example 4: Getting all cases and processing in JavaScript
    // This is a fallback if the formula searches don't work
    const allCasesResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].allCases`
    }) as CodapApiResult;
    
    console.log("All cases result:", allCasesResult);
    
    if (allCasesResult.success && Array.isArray(allCasesResult.values)) {
      // Process the values to find min/max
      let minLat = Number.MAX_VALUE;
      let maxLat = Number.MIN_VALUE;
      
      allCasesResult.values.forEach((caseData: any) => {
        // The latitude might be in different locations based on the response format
        let latValue: number | null = null;
        
        // Check in values object first
        if (caseData.values && caseData.values[attribute] !== undefined) {
          latValue = Number(caseData.values[attribute]);
        } 
        // Check directly on case object
        else if (caseData[attribute] !== undefined) {
          latValue = Number(caseData[attribute]);
        }
        
        if (latValue !== null && !isNaN(latValue)) {
          minLat = Math.min(minLat, latValue);
          maxLat = Math.max(maxLat, latValue);
        }
      });
      
      console.log(`Calculated min latitude: ${minLat}`);
      console.log(`Calculated max latitude: ${maxLat}`);
      
      return {
        minLatitude: minLat !== Number.MAX_VALUE ? minLat : null,
        maxLatitude: maxLat !== Number.MIN_VALUE ? maxLat : null
      };
    }
    
    // Extract values from the formula search results
    const extractValue = (result: any): number | null => {
      if (!result.success) {
        return null;
      }
      
      const values = result.values;
      
      // Handle different response formats
      if (Array.isArray(values) && values.length > 0) {
        const caseData = values[0];
        
        // Try to get value from values object
        if (caseData.values && caseData.values[attribute] !== undefined) {
          const value = Number(caseData.values[attribute]);
          return !isNaN(value) ? value : null;
        }
        
        // Try to get value directly from case object
        if (caseData[attribute] !== undefined) {
          const value = Number(caseData[attribute]);
          return !isNaN(value) ? value : null;
        }
      }
      
      return null;
    };
    
    const minLatitude = extractValue(minLatResult);
    const maxLatitude = extractValue(maxLatResult);
    
    console.log(`Min latitude from formula search: ${minLatitude}`);
    console.log(`Max latitude from formula search: ${maxLatitude}`);
    
    return {
      minLatitude,
      maxLatitude,
      success: minLatitude !== null && maxLatitude !== null
    };
  } catch (error) {
    console.error("Error retrieving min/max values:", error);
    return {
      minLatitude: null,
      maxLatitude: null,
      success: false,
      error
    };
  }
}

/**
 * Usage example with the correct path pattern that should work with Four-Seals dataset
 */
export async function getCoordinateBoundsExample() {
  const dataContext = "Four-Seals";
  const collection = "Cases";
  const latAttr = "latitude";
  
  // Direct approach to get min latitude
  const minLatResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${latAttr}=min(${latAttr})]`;
  console.log(`Making API request to: ${minLatResource}`);
  
  const minLatResult = await codapInterface.sendRequest({
    action: "get",
    resource: minLatResource
  }) as CodapApiResult;
  
  // Log the full response structure to debug
  console.log("API Response Structure:", JSON.stringify(minLatResult, null, 2));
  
  return {
    resource: minLatResource,
    result: minLatResult
  };
}

/**
 * Simple test function to directly query min/max using formula search
 * This function strips everything down to the bare minimum for testing
 */
export async function testSimpleFormulaSearch() {
  try {
    console.log("%c========== DIRECT FORMULA SEARCH TEST ==========", "color: blue; font-size: 16px; font-weight: bold;");
    
    // Hard-coded values based on Four-Seals dataset
    const dataContext = "Four-Seals";
    const collection = "Cases";
    
    // Test both latitude and longitude
    const testAttributes = ["latitude", "longitude"];
    const results: Record<string, { min: number | null; max: number | null }> = {};
    
    for (const attribute of testAttributes) {
      console.log(`\n%cTesting ${attribute}:`, "color: green; font-size: 14px; font-weight: bold;");
      
      // Min value query
      const minResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${attribute}=min(${attribute})]`;
      console.log(`Query for min ${attribute}:`, minResource);
      
      const minResult = await codapInterface.sendRequest({
        action: "get",
        resource: minResource
      }) as CodapApiResult;
      
      console.log(`Min ${attribute} result success:`, minResult.success);
      
      // Max value query
      const maxResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${attribute}=max(${attribute})]`;
      console.log(`Query for max ${attribute}:`, maxResource);
      
      const maxResult = await codapInterface.sendRequest({
        action: "get",
        resource: maxResource
      }) as CodapApiResult;
      
      console.log(`Max ${attribute} result success:`, maxResult.success);
      
      // Process min result
      let minValue: number | null = null;
      if (minResult.success && minResult.values) {
        console.log(`Min ${attribute} raw values:`, minResult.values);
        
        if (Array.isArray(minResult.values) && minResult.values.length > 0) {
          const caseData = minResult.values[0];
          console.log(`Min ${attribute} first case:`, caseData);
          
          // Try to find the value in different possible locations
          if (caseData.values && caseData.values[attribute] !== undefined) {
            minValue = Number(caseData.values[attribute]);
            console.log(`Min ${attribute} from case.values:`, minValue);
          } else if (caseData[attribute] !== undefined) {
            minValue = Number(caseData[attribute]);
            console.log(`Min ${attribute} from direct property:`, minValue);
          } else {
            console.log(`Min ${attribute} not found in expected locations, examining all properties:`);
            console.log("All case properties:", Object.keys(caseData));
            if (caseData.values) {
              console.log("All case.values properties:", Object.keys(caseData.values));
            }
          }
        }
      }
      
      // Process max result
      let maxValue: number | null = null;
      if (maxResult.success && maxResult.values) {
        console.log(`Max ${attribute} raw values:`, maxResult.values);
        
        if (Array.isArray(maxResult.values) && maxResult.values.length > 0) {
          const caseData = maxResult.values[0];
          console.log(`Max ${attribute} first case:`, caseData);
          
          // Try to find the value in different possible locations
          if (caseData.values && caseData.values[attribute] !== undefined) {
            maxValue = Number(caseData.values[attribute]);
            console.log(`Max ${attribute} from case.values:`, maxValue);
          } else if (caseData[attribute] !== undefined) {
            maxValue = Number(caseData[attribute]);
            console.log(`Max ${attribute} from direct property:`, maxValue);
          } else {
            console.log(`Max ${attribute} not found in expected locations, examining all properties:`);
            console.log("All case properties:", Object.keys(caseData));
            if (caseData.values) {
              console.log("All case.values properties:", Object.keys(caseData.values));
            }
          }
        }
      }
      
      results[attribute] = {
        min: minValue,
        max: maxValue
      };
    }
    
    // Log final results in a clear format
    console.log("\n%c========== FINAL RESULTS ==========", "color: blue; font-size: 16px; font-weight: bold;");
    console.log("%cLatitude:", "font-weight: bold;");
    console.log(`  Min: ${results.latitude?.min ?? "Not found"}`);
    console.log(`  Max: ${results.latitude?.max ?? "Not found"}`);
    console.log("%cLongitude:", "font-weight: bold;");
    console.log(`  Min: ${results.longitude?.min ?? "Not found"}`);
    console.log(`  Max: ${results.longitude?.max ?? "Not found"}`);
    
    return results;
  } catch (error) {
    console.error("Error in formula search test:", error);
    return { success: false, error };
  }
} 
