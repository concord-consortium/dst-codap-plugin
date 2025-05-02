import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { datasetConfig } from "../models/dataset-config";
import { codapData } from "../models/codap-data";
import { graph } from "../models/graph";
import { getData, setupSelectionSynchronization } from "./codap-utils";
import { analyzeDateString, parseDateWithFormat } from "./date-utils";
import { CodapApiResult, CodapAttribute, CodapDataContext, isCollectionResponse, isDataContextArray } from "./codap-types";
import { MapBoundsManager } from "./map-bounds-manager";

/**
 * Parse a date string using the specified format
 * @param dateStr The date string to parse
 * @param format Optional format to use for parsing
 * @returns Timestamp in milliseconds or undefined if parsing failed
 */
function parseDate(dateStr: string, format?: string): number | undefined {
  try {
    // If we have a specific format, use it with the existing parseDate function
    if (format) {
      const parsedDateResult = parseDateWithFormat(dateStr, format);
      return parsedDateResult;
    }
    
    // Otherwise analyze the date string
    const analysis = analyzeDateString(dateStr);
    if (analysis.isValid && analysis.parsed) {
      return analysis.parsed.getTime();
    }
    return undefined;
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`, error);
    return undefined;
  }
}

/**
 * Extract attributes directly from the dataContext result
 * This is for when standard collection methods fail
 * @param dataContextResult The data context result from CODAP API
 * @returns Array of attribute names
 */
function extractAttributesFromContext(dataContextResult: any): string[] {
  try {
    // Check if we have a valid context
    if (!dataContextResult?.success || !dataContextResult?.values) {
      return [];
    }
    
    const context = dataContextResult.values;
    const attributes: string[] = [];
    
    // Extract from collections if they exist in the context
    if (context.collections && Array.isArray(context.collections)) {
      // Iterate through each collection
      context.collections.forEach((collection: any) => {
        // Check if collection has attributes
        if (collection.attrs && Array.isArray(collection.attrs)) {
          // Extract attribute names
          const collectionAttrs = collection.attrs
            .filter((attr: any) => attr && attr.name)
            .map((attr: any) => attr.name);
          
          attributes.push(...collectionAttrs);
        }
      });
    }
    
    console.log("Extracted attributes from context:", attributes);
    return attributes;
  } catch (error) {
    console.error("Error extracting attributes from context:", error);
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
      resource: `dataContext[${dataContextName}].collection[Cases]`
    }) as CodapApiResult;

    if (!result.success || !result.values || !isCollectionResponse(result.values)) {
      console.warn("Failed to get attributes from data context");
      return [];
    }

    const attrs = result.values.attrs;
    if (!attrs || !Array.isArray(attrs)) {
      console.warn("Attributes are not in expected format");
      return [];
    }

    return attrs.map((attr: CodapAttribute) => attr.name);
  } catch (error) {
    console.error("Error getting dataset attributes:", error);
    return [];
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
    
    // Add a small delay to ensure data is fully loaded before calculating date range
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Calculate and set the absolute date range from the actual data
    await updateDateRangeFromData(datasetConfig.dataContextName);
    
    // Calculate and set the map bounds based on the geographic range of the data
    await updateMapBoundsFromData(datasetConfig.dataContextName);
  } catch (error) {
    console.error("Error loading configured data:", error);
  }
}

/**
 * Directly extract min/max values from items in a dataset
 * @param dataContextName The dataset context name
 * @param attributeName The attribute to extract values for
 * @returns Promise that resolves to min and max values
 */
async function getMinMaxFromItems(dataContextName: string, attributeName: string): Promise<{min: number | null, max: number | null}> {
  try {
    console.log(`Getting min/max for attribute ${attributeName} directly from items...`);
    
    // Get a reasonable number of items to analyze (up to 1000)
    const itemsResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].item[0-999]`
    }) as CodapApiResult;
    
    if (!itemsResult.success || !itemsResult.values || !Array.isArray(itemsResult.values) || !itemsResult.values.length) {
      console.warn(`No items found for min/max extraction of ${attributeName}`);
      return { min: null, max: null };
    }
    
    console.log(`Processing ${itemsResult.values.length} items for min/max extraction of ${attributeName}`);
    
    // Track min/max values
    let min: number | null = null;
    let max: number | null = null;
    let valuesFound = 0;
    
    // Process each item
    for (const item of itemsResult.values) {
      // Try different ways to get the value
      let value = null;
      
      // Direct property access
      if (item[attributeName] !== undefined) {
        value = item[attributeName];
      } 
      // Check values property
      else if (item.values && item.values[attributeName] !== undefined) {
        value = item.values[attributeName];
      }
      
      // Convert to number if needed
      if (value !== null && value !== undefined) {
        // If it's a string that could be a number, convert it
        if (typeof value === "string" && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        // Only process numeric values
        if (typeof value === "number" && !isNaN(value)) {
          if (min === null || value < min) min = value;
          if (max === null || value > max) max = value;
          valuesFound++;
        }
      }
    }
    
    console.log(`Found ${valuesFound} numeric values for ${attributeName}, min: ${min}, max: ${max}`);
    return { min, max };
  } catch (error) {
    console.error(`Error getting min/max for ${attributeName}:`, error);
    return { min: null, max: null };
  }
}

/**
 * Calculate and update the absolute date range based on the actual dataset
 * @param dataContextName The dataset context name
 */
export async function updateDateRangeFromData(dataContextName: string): Promise<void> {
  try {
    console.log("Calculating date range for dataset:", dataContextName);
    
    // Ensure we have a date attribute configured
    const dateAttr = datasetConfig.dateAttribute;
    if (!dateAttr) {
      console.warn("No date attribute configured, cannot calculate date range");
      return;
    }
    
    console.log(`Using date attribute: ${dateAttr}`);
    
    // Initialize date range variables
    let minDate: number | null = null;
    let maxDate: number | null = null;
    let hasValidDates = false;
    
    // Method 1: Try to get summary statistics for the date attribute
    console.log(`Requesting summary for date attribute: ${dateAttr}`);
    const dateSummaryResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].attributeSummary[${dateAttr}]`
    }) as CodapApiResult;
    
    console.log("Date summary result:", dateSummaryResult);
    
    if (
      dateSummaryResult.success &&
      dateSummaryResult.values &&
      typeof dateSummaryResult.values === "object" &&
      "min" in dateSummaryResult.values &&
      "max" in dateSummaryResult.values
    ) {
      let minDateValue = dateSummaryResult.values.min;
      let maxDateValue = dateSummaryResult.values.max;
      
      // Parse date values if they're strings
      if (typeof minDateValue === "string") {
        const parsedDate = parseDate(minDateValue, datasetConfig.dateFormat);
        minDate = parsedDate !== undefined ? parsedDate : null;
      } else if (typeof minDateValue === "number") {
        minDate = minDateValue;
      }
      
      if (typeof maxDateValue === "string") {
        const parsedDate = parseDate(maxDateValue, datasetConfig.dateFormat);
        maxDate = parsedDate !== undefined ? parsedDate : null;
      } else if (typeof maxDateValue === "number") {
        maxDate = maxDateValue;
      }
      
      if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
        hasValidDates = true;
        console.log(`Date range from summary: ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
      }
    } else {
      console.warn("Failed to get date summary statistics");
    }
    
    // Method 2: If attributeSummary failed, try getting attribute details directly
    if (!hasValidDates) {
      console.log("Trying to get attribute details directly...");
      
      const dateAttrResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].attribute[${dateAttr}]`
      }) as CodapApiResult;
      
      console.log("Date attribute details:", dateAttrResult);
      
      if (
        dateAttrResult.success &&
        dateAttrResult.values &&
        typeof dateAttrResult.values === "object" &&
        "stats" in dateAttrResult.values &&
        dateAttrResult.values.stats &&
        "min" in dateAttrResult.values.stats &&
        "max" in dateAttrResult.values.stats
      ) {
        let minDateValue = dateAttrResult.values.stats.min;
        let maxDateValue = dateAttrResult.values.stats.max;
        
        // Parse date values if they're strings
        if (typeof minDateValue === "string") {
          const parsedDate = parseDate(minDateValue, datasetConfig.dateFormat);
          minDate = parsedDate !== undefined ? parsedDate : null;
        } else if (typeof minDateValue === "number") {
          minDate = minDateValue;
        }
        
        if (typeof maxDateValue === "string") {
          const parsedDate = parseDate(maxDateValue, datasetConfig.dateFormat);
          maxDate = parsedDate !== undefined ? parsedDate : null;
        } else if (typeof maxDateValue === "number") {
          maxDate = maxDateValue;
        }
        
        if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
          hasValidDates = true;
          console.log(`Date range from attribute details: ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
        }
      }
    }
    
    // Method 3: Try using the collection attribute stats
    if (!hasValidDates) {
      console.log("Trying to get date range from collection stats...");
      
      const collectionResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection["Cases"]`
      }) as CodapApiResult;
      
      if (
        collectionResult.success &&
        collectionResult.values &&
        typeof collectionResult.values === "object" &&
        "attrs" in collectionResult.values &&
        Array.isArray(collectionResult.values.attrs)
      ) {
        console.log("Collection info:", collectionResult.values);
        
        // Check if we can find the attributes with stats
        const dateAttribute = collectionResult.values.attrs.find((attr: any) => attr && attr.name === dateAttr);
        
        if (
          dateAttribute &&
          typeof dateAttribute === "object" &&
          "stats" in dateAttribute &&
          dateAttribute.stats &&
          "min" in dateAttribute.stats &&
          "max" in dateAttribute.stats
        ) {
          let minDateValue = dateAttribute.stats.min;
          let maxDateValue = dateAttribute.stats.max;
          
          // Parse date values if they're strings
          if (typeof minDateValue === "string") {
            const parsedDate = parseDate(minDateValue, datasetConfig.dateFormat);
            minDate = parsedDate !== undefined ? parsedDate : null;
          } else if (typeof minDateValue === "number") {
            minDate = minDateValue;
          }
          
          if (typeof maxDateValue === "string") {
            const parsedDate = parseDate(maxDateValue, datasetConfig.dateFormat);
            maxDate = parsedDate !== undefined ? parsedDate : null;
          } else if (typeof maxDateValue === "number") {
            maxDate = maxDateValue;
          }
          
          if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
            hasValidDates = true;
            console.log(`Date range from collection stats: ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
          }
        }
      }
    }
    
    // Method 4: Direct item extraction
    if (!hasValidDates) {
      console.log("Trying to extract date range directly from items...");
      
      // If the configured attribute is 'date' but we know from logs that 'day' actually contains the date,
      // try with 'day' attribute as well
      let dateValues = await getMinMaxFromItems(dataContextName, dateAttr);
      
      // If the original attribute didn't work, try with 'day' if it's different
      if ((dateValues.min === null || dateValues.max === null) && dateAttr !== "day") {
        console.log("Original attribute didn't yield values, trying with 'day' attribute instead");
        dateValues = await getMinMaxFromItems(dataContextName, "day");
      }
      
      // We got numeric values that might be timestamps
      if (dateValues.min !== null && dateValues.max !== null) {
        minDate = dateValues.min;
        maxDate = dateValues.max;
        
        // Check if these are valid dates - they should be in milliseconds since epoch
        if (!isNaN(minDate) && !isNaN(maxDate)) {
          // Check if these might be days since a reference date (small numbers)
          if (minDate < 10000) {
            // Convert days to milliseconds using a reasonable reference date (e.g., Jan 1, 2000)
            const referenceDate = new Date(2000, 0, 1).getTime();
            minDate = referenceDate + (minDate * 24 * 60 * 60 * 1000);
            maxDate = referenceDate + (maxDate * 24 * 60 * 60 * 1000);
            console.log("Converted day values to milliseconds with reference date Jan 1, 2000");
          }
          
          hasValidDates = true;
          console.log(`Date range from direct item extraction: ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
        }
      }
    }
    
    // Method 5: Try the table data endpoint
    if (!hasValidDates) {
      console.log("Trying to extract date range from table data...");
      
      const tableResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection["Cases"].allCases`
      }) as CodapApiResult;
      
      console.log("Table cases result:", tableResult.success ? `Success, found ${tableResult.values?.length || 0} cases` : "Failed");
      
      if (tableResult.success && tableResult.values && Array.isArray(tableResult.values) && tableResult.values.length > 0) {
        let tableMinDate: number | null = null;
        let tableMaxDate: number | null = null;
        let foundDates = 0;
        
        // Find date values in the table data
        for (const row of tableResult.values) {
          let dateValue: string | number | undefined;
          
          // Try the primary attribute first
          if (row.values && row.values[dateAttr] !== undefined) {
            dateValue = row.values[dateAttr];
          } 
          // Then try alternative date field if primary not found
          else if (dateAttr !== "day" && row.values && row.values.day !== undefined) {
            dateValue = row.values.day;
          }
          // Also try case where values aren't nested
          else if (row[dateAttr] !== undefined) {
            dateValue = row[dateAttr];
          }
          else if (dateAttr !== "day" && row.day !== undefined) {
            dateValue = row.day;
          }
          
          if (dateValue !== undefined) {
            let timestamp: number | undefined;
            
            if (typeof dateValue === "string") {
              timestamp = parseDate(dateValue, datasetConfig.dateFormat);
            } else if (typeof dateValue === "number") {
              // If it's a small number, it might be days since a reference date
              if (dateValue < 10000) {
                const referenceDate = new Date(2000, 0, 1).getTime();
                timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
      } else {
                timestamp = dateValue;
              }
            }
            
            if (timestamp !== undefined && !isNaN(timestamp)) {
              if (tableMinDate === null || timestamp < tableMinDate) {
                tableMinDate = timestamp;
              }
              if (tableMaxDate === null || timestamp > tableMaxDate) {
                tableMaxDate = timestamp;
              }
              foundDates++;
            }
          }
        }
        
        if (tableMinDate !== null && tableMaxDate !== null && foundDates > 0) {
          minDate = tableMinDate;
          maxDate = tableMaxDate;
          hasValidDates = true;
          console.log(`Date range from table data (found ${foundDates} dates): ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
        }
      }
    }
    
    // Method 6: Try using caseFormulaSearch to directly get min/max dates
    if (!hasValidDates) {
      console.log("Trying to get date range using formula search...");
      
      try {
        // Get case with minimum date
        const minDateResult = await codapInterface.sendRequest({
          action: "get",
          resource: `dataContext[${dataContextName}].collection["Cases"].caseFormulaSearch[${dateAttr}=min(${dateAttr})]`
        }) as CodapApiResult;
        
        // Get case with maximum date
        const maxDateResult = await codapInterface.sendRequest({
          action: "get",
          resource: `dataContext[${dataContextName}].collection["Cases"].caseFormulaSearch[${dateAttr}=max(${dateAttr})]`
        }) as CodapApiResult;
        
        console.log("Date formula search results:", {
          minDate: minDateResult.success,
          maxDate: maxDateResult.success
        });
        
        // Process minimum date result
        if (minDateResult.success && minDateResult.values && Array.isArray(minDateResult.values) && minDateResult.values.length > 0) {
          const dateCase = minDateResult.values[0];
          let dateValue = null;
          
          // Try to extract the date value
          if (dateCase.values && dateCase.values[dateAttr] !== undefined) {
            dateValue = dateCase.values[dateAttr];
          } else if (dateCase[dateAttr] !== undefined) {
            dateValue = dateCase[dateAttr];
          }
          
          // Parse the date value
          if (dateValue !== null) {
            let timestamp: number | undefined;
            
            if (typeof dateValue === "string") {
              timestamp = parseDate(dateValue, datasetConfig.dateFormat);
            } else if (typeof dateValue === "number") {
              // If it's a small number, it might be days since a reference date
              if (dateValue < 10000) {
                const referenceDate = new Date(2000, 0, 1).getTime();
                timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
          } else {
                timestamp = dateValue;
              }
            }
            
            if (timestamp !== undefined && !isNaN(timestamp)) {
              minDate = timestamp;
              console.log(`Found min date: ${new Date(minDate).toLocaleDateString()}`);
            }
          }
        }
        
        // Process maximum date result
        if (maxDateResult.success && maxDateResult.values && Array.isArray(maxDateResult.values) && maxDateResult.values.length > 0) {
          const dateCase = maxDateResult.values[0];
          let dateValue = null;
          
          // Try to extract the date value
          if (dateCase.values && dateCase.values[dateAttr] !== undefined) {
            dateValue = dateCase.values[dateAttr];
          } else if (dateCase[dateAttr] !== undefined) {
            dateValue = dateCase[dateAttr];
          }
          
          // Parse the date value
          if (dateValue !== null) {
            let timestamp: number | undefined;
            
            if (typeof dateValue === "string") {
              timestamp = parseDate(dateValue, datasetConfig.dateFormat);
            } else if (typeof dateValue === "number") {
              // If it's a small number, it might be days since a reference date
              if (dateValue < 10000) {
                const referenceDate = new Date(2000, 0, 1).getTime();
                timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
              } else {
                timestamp = dateValue;
              }
            }
            
            if (timestamp !== undefined && !isNaN(timestamp)) {
              maxDate = timestamp;
              console.log(`Found max date: ${new Date(maxDate).toLocaleDateString()}`);
            }
          }
        }
        
        // If we found both min and max dates, consider it successful
        if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
          hasValidDates = true;
          console.log(`Date range from formula search: ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error("Error using formula search for dates:", error);
      }
    }
    
    // Method 7: Try accessing the cases endpoint directly
    if (!hasValidDates) {
      console.log("Trying to access date range from cases endpoint directly...");
      
      try {
        // Try the direct cases endpoint - this is a last resort
        const casesResult = await codapInterface.sendRequest({
          action: "get",
          resource: `dataContext[${dataContextName}].case`
        }) as CodapApiResult;
        
        console.log("Cases endpoint result:", casesResult.success ? 
          `Success, found ${casesResult.values?.length || 0} cases` : "Failed");
        
        if (casesResult.success && casesResult.values && 
          Array.isArray(casesResult.values) && casesResult.values.length > 0) {
          
          let casesMinDate: number | null = null;
          let casesMaxDate: number | null = null;
          let foundDates = 0;
          
          // Process each case to find date values
          for (const caseData of casesResult.values) {
            let dateValue: string | number | undefined;
            
            // Try to extract date from case values
            if (caseData.values && caseData.values[dateAttr] !== undefined) {
              dateValue = caseData.values[dateAttr];
            } else if (caseData[dateAttr] !== undefined) {
              dateValue = caseData[dateAttr];
            }
            
            if (dateValue !== undefined) {
              let timestamp: number | undefined;
              
              if (typeof dateValue === "string") {
                timestamp = parseDate(dateValue, datasetConfig.dateFormat);
              } else if (typeof dateValue === "number") {
                // Handle small numeric values as days since reference
                if (dateValue < 10000) {
                  const referenceDate = new Date(2000, 0, 1).getTime();
                  timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
                } else {
                  timestamp = dateValue;
                }
              }
              
              if (timestamp !== undefined && !isNaN(timestamp)) {
                if (casesMinDate === null || timestamp < casesMinDate) {
                  casesMinDate = timestamp;
                }
                if (casesMaxDate === null || timestamp > casesMaxDate) {
                  casesMaxDate = timestamp;
                }
                foundDates++;
              }
            }
          }
          
          if (casesMinDate !== null && casesMaxDate !== null && foundDates > 0) {
            minDate = casesMinDate;
            maxDate = casesMaxDate;
            hasValidDates = true;
            console.log(`Date range from cases endpoint (found ${foundDates} dates): ${new Date(minDate).toLocaleDateString()} to ${new Date(maxDate).toLocaleDateString()}`);
          }
        }
      } catch (error) {
        console.error("Error using cases endpoint for dates:", error);
      }
    }
    
    // Only update if we found valid dates
    if (hasValidDates && minDate! < maxDate!) {
      // Add a small buffer to the range (5% on each side)
      const buffer = (maxDate! - minDate!) * 0.05;
      codapData.setAbsoluteDateRange(minDate! - buffer, maxDate! + buffer);
      
      // Reset the graph visualization
      graph.resetDateVisualization();
      console.log(`Set date range: ${new Date(minDate!).toLocaleDateString()} to ${new Date(maxDate!).toLocaleDateString()}`);
    } else {
      console.warn("Could not determine date range from dataset - no valid dates found");
    }
  } catch (error) {
    console.error("Error calculating date range:", error);
  }
}

/**
 * Get detailed information about a CODAP dataset including collections and attributes
 * This is primarily for debugging purposes
 * @param dataContextName The dataset name
 * @returns Detailed dataset information
 */
export async function getDatasetDetails(dataContextName: string): Promise<any> {
  try {
    console.log(`Getting details for dataset: ${dataContextName}`);
    
    // Get the data context info
    const contextResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}]`
    }) as CodapApiResult;
    
    // Get collections
    const collectionsResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection`
    }) as CodapApiResult;
    
    // Get attributes for each collection
    const collectionsArr = collectionsResult.success && Array.isArray(collectionsResult.values) ? collectionsResult.values : [];
    const collectionsWithAttributes = [];
    
    for (const collection of collectionsArr) {
      const attrResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection["${collection.name}"].attribute`
      }) as CodapApiResult;
      
      collectionsWithAttributes.push({
        name: collection.name,
        attributes: attrResult.success ? attrResult.values : []
      });
    }
    
    return {
      context: contextResult.success ? contextResult.values : null,
      collections: collectionsWithAttributes
    };
  } catch (error) {
    console.error("Error getting dataset details:", error);
    return null;
  }
}

/**
 * Explore the dataset using a case to identify attribute names
 * This is a more direct approach to get attribute names when collection methods fail
 * @param dataContextName The name of the dataset
 * @returns An array of attribute names
 */
export async function exploreDataset(dataContextName: string): Promise<string[]> {
  try {
    console.log(`Exploring dataset: ${dataContextName}`);
    
    // Method 1: Try to get the first case using caseSearch
    const getCaseResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].caseSearch[1]`
    }) as CodapApiResult;
    
    console.log("First case result (caseSearch):", JSON.stringify(getCaseResult, null, 2));
    
    if (getCaseResult.success && getCaseResult.values && Array.isArray(getCaseResult.values) && getCaseResult.values.length) {
      // Extract attribute names from case values
      const firstCase = Array.isArray(getCaseResult.values) ? getCaseResult.values[0] : undefined;
      
      if (firstCase && firstCase.values) {
        const attributeNames = Object.keys(firstCase.values);
        console.log("Extracted attribute names from case:", attributeNames);
        return attributeNames;
      }
    } else {
      console.warn("Failed to get case using caseSearch");
    }
    
    // Method 2: Try to get cases directly
    const getAllCasesResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].allCases`
    }) as CodapApiResult;
    
    console.log("All cases result:", JSON.stringify(getAllCasesResult, null, 2));
    
    if (getAllCasesResult.success && getAllCasesResult.values && 
        Array.isArray(getAllCasesResult.values) && getAllCasesResult.values.length) {
      const firstCase = getAllCasesResult.values[0];
      
      if (firstCase && typeof firstCase === "object") {
        // Directly use the object keys if it's a plain object
        const caseAttributeNames = Object.keys(firstCase).filter(key => key !== "id" && key !== "_links");
        if (caseAttributeNames.length) {
          console.log("Extracted attribute names from allCases:", caseAttributeNames);
          return caseAttributeNames;
        }
        
        // If it has a values property, use that
        if (firstCase.values && typeof firstCase.values === "object") {
          const valueAttributeNames = Object.keys(firstCase.values);
          console.log("Extracted attribute names from allCases values:", valueAttributeNames);
          return valueAttributeNames;
        }
      }
    } else {
      console.warn("Failed to get cases using allCases");
    }
    
    // Method 3: Try to get item values
    try {
      const getItemsResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].item[0-9]`
      }) as CodapApiResult;
      
      console.log("Items result:", JSON.stringify(getItemsResult, null, 2));
      
      if (getItemsResult.success && getItemsResult.values && 
          Array.isArray(getItemsResult.values) && getItemsResult.values.length) {
        const firstItem = getItemsResult.values[0];
        
        if (firstItem && typeof firstItem === "object") {
          const itemAttributeNames = Object.keys(firstItem).filter(key => 
            key !== "id" && key !== "_links" && key !== "caseID");
          
          console.log("Extracted attribute names from items:", itemAttributeNames);
          return itemAttributeNames;
        }
      }
    } catch (error) {
      console.warn("Error getting items:", error);
    }
    
    // If all methods failed, return empty array
    console.warn("All methods failed to get attributes from dataset exploration");
    return [];
  } catch (error) {
    console.error("Error exploring dataset:", error);
    return [];
  }
}

/**
 * Get attributes using the itemSearch method
 * This uses a simpler approach from the CODAP API
 * @param dataContextName The dataset name
 * @returns Array of attribute names
 */
export async function getAttributesFromItemSearch(dataContextName: string): Promise<string[]> {
  try {
    console.log(`Getting attributes using itemSearch for dataset: ${dataContextName}`);
    
    // Use the itemSearch endpoint with a simple query
    const itemSearchResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].itemSearch[1]`
    }) as CodapApiResult;
    
    console.log("Item search result:", JSON.stringify(itemSearchResult, null, 2));
    
    if (itemSearchResult.success && itemSearchResult.values && 
        Array.isArray(itemSearchResult.values) && itemSearchResult.values.length) {
      
      // Look for the first item with values
      for (const item of itemSearchResult.values) {
        if (item && typeof item === "object") {
          // Try different ways the data might be structured
          if (item.values && typeof item.values === "object") {
            const itemValueAttrs = Object.keys(item.values);
            console.log("Extracted attribute names from itemSearch values:", itemValueAttrs);
            return itemValueAttrs;
          }
          
          // Directly use the object keys if it's a plain object
          const itemKeyAttrs = Object.keys(item).filter(key => 
            !["id", "_links", "type", "guid", "parent", "children"].includes(key));
            
          if (itemKeyAttrs.length) {
            console.log("Extracted attribute names from itemSearch keys:", itemKeyAttrs);
            return itemKeyAttrs;
          }
        }
      }
    }
    
    console.warn("Failed to get attributes using itemSearch");
    return [];
  } catch (error) {
    console.error("Error getting attributes from itemSearch:", error);
    return [];
  }
}

/**
 * Analyze date formats in the dataset to diagnose parsing issues
 * @param dataContextName The dataset context name
 */
export async function analyzeDateFormats(dataContextName: string): Promise<void> {
  if (!datasetConfig.dateAttribute) {
    console.warn("No date attribute configured, can't analyze date formats");
    return;
  }
  
  try {
    console.log(`Analyzing date formats for attribute: ${datasetConfig.dateAttribute}`);
    
    // Get all cases
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].allCases`
    }) as CodapApiResult;
    
    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
      console.warn("Failed to get cases for date format analysis");
      return;
    }
    
    console.log(`Analyzing ${result.values.length} cases for date formats`);
    
    // Categorize date formats
    const formatCategories: Record<string, any[]> = {};
    
    // Sample raw values with their parsed dates for each category
    const sampleValues: Record<string, {raw: string, parsed: Date | null, analysis: ReturnType<typeof analyzeDateString>}[]> = {};
    
    const dateAttributeId = codapData.dataSet.getAttributeByName(datasetConfig.dateAttribute)?.id;
    
    // Statistics for success and failure
    const stats = {
      total: 0,
      parsed: 0,
      failed: 0,
      byMonth: {} as Record<string, number>,
      byYear: {} as Record<string, number>,
      byFormat: {} as Record<string, number>
    };
    
    // Process each case
    for (const caseData of result.values) {
      if (!caseData) continue;
      
      stats.total++;
      
      // Get the raw date value
      const rawValue = dateAttributeId 
        ? codapData.dataSet.getValue(caseData.id, dateAttributeId) 
        : undefined;
      
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        if (!formatCategories.empty) formatCategories.empty = [];
        formatCategories.empty.push(caseData.id);
        stats.failed++;
        continue;
      }
      
      const stringValue = String(rawValue).trim();
      
      // Use the analyzeDateString function for thorough analysis
      const analysis = analyzeDateString(stringValue);
      
      // Count by format
      stats.byFormat[analysis.format] = (stats.byFormat[analysis.format] || 0) + 1;
      
      // Create category if it doesn't exist
      if (!formatCategories[analysis.format]) {
        formatCategories[analysis.format] = [];
        sampleValues[analysis.format] = [];
      }
      
      // Add case ID to appropriate category
      formatCategories[analysis.format].push(caseData.id);
      
      // Store sample values (up to 3 per category)
      if (sampleValues[analysis.format].length < 3) {
        sampleValues[analysis.format].push({
          raw: stringValue,
          parsed: analysis.parsed,
          analysis
        });
      }
      
      // Gather stats for parsed dates
      if (analysis.isValid && analysis.parsed) {
        stats.parsed++;
        
        // Count by month and year
        const month = `${analysis.parsed.getFullYear()}-${(analysis.parsed.getMonth() + 1).toString().padStart(2, "0")}`;
        const year = analysis.parsed.getFullYear().toString();
        
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        stats.byYear[year] = (stats.byYear[year] || 0) + 1;
      } else {
        stats.failed++;
      }
    }
    
    // Summary of counts by format
    console.log("Date format distribution:");
    for (const [format, caseIds] of Object.entries(formatCategories)) {
      console.log(`  ${format}: ${caseIds.length} cases (${((caseIds.length/result.values.length)*100).toFixed(1)}%)`);
    }
    
    // Log parse success rate
    console.log(`\nParse success rate: ${stats.parsed}/${stats.total} (${((stats.parsed/stats.total)*100).toFixed(1)}%)`);
    
    // Sample values for each format
    console.log("\nSample values by format:");
    for (const [format, samples] of Object.entries(sampleValues)) {
      if (samples.length > 0) {
        console.log(`  ${format}:`);
        samples.forEach(sample => {
          const dateStr = sample.parsed && !isNaN(sample.parsed.getTime()) 
            ? sample.parsed.toISOString() 
            : "Invalid Date";
          console.log(`    "${sample.raw}" => ${dateStr} (${sample.analysis.formatDetails})`);
        });
      }
    }
    
    // Log distribution by year
    console.log("\nDistribution by year:");
    const sortedYears = Object.keys(stats.byYear).sort();
    for (const year of sortedYears) {
      console.log(`  ${year}: ${stats.byYear[year]} records`);
    }
    
    // Log distribution by month (for more recent years if there are many)
    console.log("\nDistribution by month:");
    const sortedMonths = Object.keys(stats.byMonth).sort();
    // If too many months, just show the most recent 24
    const monthsToShow = sortedMonths.length > 24 ? sortedMonths.slice(-24) : sortedMonths;
    for (const month of monthsToShow) {
      console.log(`  ${month}: ${stats.byMonth[month]} records`);
    }
    
    // Check for gaps in timeline
    console.log("\nChecking for timeline gaps...");
    const validDates: number[] = [];
    for (const caseData of result.values) {
      if (!caseData) continue;
      
      const date = codapData.getCaseDate(caseData.id);
      if (date && isFinite(date)) {
        validDates.push(date);
      }
    }
    
    if (validDates.length > 0) {
      // Sort dates
      validDates.sort((a, b) => a - b);
      
      // Find gaps larger than 30 days
      const gapThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      let lastDate = validDates[0];
      let gapsFound = 0;
      
      console.log(`Analyzing timeline from ${new Date(validDates[0]).toISOString()} to ${new Date(validDates[validDates.length-1]).toISOString()}`);
      
      for (let i = 1; i < validDates.length; i++) {
        const currentDate = validDates[i];
        const gap = currentDate - lastDate;
        
        if (gap > gapThreshold) {
          gapsFound++;
          if (gapsFound <= 5) { // Limit output to the first 5 gaps
            console.log(`  Gap detected: ${new Date(lastDate).toISOString()} to ${new Date(currentDate).toISOString()} (${Math.round(gap / (24 * 60 * 60 * 1000))} days)`);
          }
        }
        
        lastDate = currentDate;
      }
      
      if (gapsFound > 5) {
        console.log(`  (Plus ${gapsFound - 5} more gaps not shown)`);
      } else if (gapsFound === 0) {
        console.log("  No significant gaps found in the timeline");
      }
    } else {
      console.log("  No valid dates to analyze for gaps");
    }
    
  } catch (error) {
    console.error("Error analyzing date formats:", error);
  }
}

/**
 * Specifically check date ranges and distributions within the 2005 gap period
 * @param dataContextName The dataset context name
 */
export async function checkGapDateRange(dataContextName: string): Promise<void> {
  try {
    console.log("Running detailed gap period analysis...");
    
    // Get all cases
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].allCases`
    }) as CodapApiResult;
    
    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
      console.warn("Failed to get cases for gap analysis");
      return;
    }
    
    console.log(`Analyzing ${result.values.length} cases for dates in the gap period (Jun-Nov 2005)`);
    
    // Define gap period
    const gapStart = new Date("2005-06-30").getTime();
    const gapEnd = new Date("2005-11-30").getTime();
    
    // Store date information in arrays
    const allDates: {id: string, date: number, dateStr: string}[] = [];
    const gapDates: {id: string, date: number, dateStr: string}[] = [];
    const beforeGapDates: {id: string, date: number, dateStr: string}[] = [];
    const afterGapDates: {id: string, date: number, dateStr: string}[] = [];
    
    // Process all dates
    for (const caseData of result.values) {
      if (!caseData) continue;
      
      const date = codapData.getCaseDate(caseData.id);
      if (!date || !isFinite(date)) continue;
      
      const dateObj = {
        id: caseData.id,
        date,
        dateStr: new Date(date).toISOString()
      };
      
      allDates.push(dateObj);
      
      // Categorize dates
      if (date >= gapStart && date <= gapEnd) {
        gapDates.push(dateObj);
      } else if (date < gapStart) {
        beforeGapDates.push(dateObj);
      } else if (date > gapEnd) {
        afterGapDates.push(dateObj);
      }
    }
    
    // Sort dates
    allDates.sort((a, b) => a.date - b.date);
    gapDates.sort((a, b) => a.date - b.date);
    beforeGapDates.sort((a, b) => a.date - b.date);
    afterGapDates.sort((a, b) => a.date - b.date);
    
    // Log gap analysis results
    console.log(`Found ${allDates.length} total dates in dataset`);
    console.log(`  - ${beforeGapDates.length} dates before the gap period`);
    console.log(`  - ${gapDates.length} dates within the gap period`);
    console.log(`  - ${afterGapDates.length} dates after the gap period`);
    
    // Log dates immediately surrounding the gap
    if (beforeGapDates.length > 0) {
      const lastBeforeGap = beforeGapDates[beforeGapDates.length - 1];
      console.log(`Last date before gap: ${lastBeforeGap.dateStr}`);
    }
    
    if (afterGapDates.length > 0) {
      const firstAfterGap = afterGapDates[0];
      console.log(`First date after gap: ${firstAfterGap.dateStr}`);
    }
    
    // If there are dates within the gap, log them for analysis
    if (gapDates.length > 0) {
      console.log(`Found ${gapDates.length} dates within the gap period!`);
      console.log("Sample dates within gap period:");
      
      // Show at most 10 dates from the gap period
      const samplesToShow = Math.min(10, gapDates.length);
      for (let i = 0; i < samplesToShow; i++) {
        console.log(`  ${gapDates[i].dateStr} (Case ID: ${gapDates[i].id})`);
      }
      
      // Check if these dates are visible according to the graph filters
      console.log("\nChecking visibility of gap period dates:");
      for (let i = 0; i < samplesToShow; i++) {
        const isVisible = graph.caseIsVisible(gapDates[i].id);
        console.log(`  ${gapDates[i].dateStr} - visible: ${isVisible}`);
      }
    } else {
      console.log("No dates found within the gap period - confirmed gap exists");
    }
    
    // Check date distribution by month for the whole of 2005
    const monthCounts: Record<string, number> = {};
    
    allDates.forEach(dateObj => {
      const date = new Date(dateObj.date);
      if (date.getFullYear() === 2005) {
        const monthKey = date.getMonth() + 1; // 1-12 for Jan-Dec
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });
    
    console.log("\nDistribution of 2005 dates by month:");
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2005, month - 1, 1).toLocaleString("default", { month: "long" });
      console.log(`  ${monthName}: ${monthCounts[month] || 0} records`);
    }
    
  } catch (error) {
    console.error("Error checking gap date range:", error);
  }
}

/**
 * Updates the map bounds based on the geographic coordinates in the dataset
 * Uses an optimized approach that provides immediate feedback while calculating precise bounds
 */
export async function updateMapBoundsFromData(dataContextName: string): Promise<void> {
  if (!dataContextName) {
    console.warn("No data context name provided for map bounds update");
    return;
  }

  const latAttr = datasetConfig.latitudeAttribute;
  const longAttr = datasetConfig.longitudeAttribute;

  if (!latAttr || !longAttr) {
    console.warn("Latitude or longitude attributes not configured");
    return;
  }

  console.log(`Updating map bounds for dataset: ${dataContextName}`);
  console.log(`Using attributes: latitude=${latAttr}, longitude=${longAttr}`);

  const mapBoundsManager = new MapBoundsManager();
  await mapBoundsManager.updateMapBounds(dataContextName, latAttr, longAttr);
}

/**
 * Analyze geographic coordinates for cases in the 2005 gap period
 * @param dataContextName Name of the data context
 */
export async function analyzeGapPeriodCoordinates(dataContextName: string): Promise<void> {
  try {
    console.log("Analyzing geographic coordinates for cases in the 2005 gap period...");
    
    // Get all cases
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].allCases`
    }) as CodapApiResult;
    
    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
      console.warn("Failed to get cases for gap coordinates analysis");
      return;
    }
    
    // Define gap period
    const gapStart = new Date("2005-06-30").getTime();
    const gapEnd = new Date("2005-11-30").getTime();
    
    // Store cases with coordinates
    const gapCases: {
      id: string, 
      date: Date, 
      latitude: number, 
      longitude: number
    }[] = [];
    
    // Get coordinates for cases in the gap period
    for (const caseData of result.values) {
      if (!caseData) continue;
      
      const dateValue = codapData.getCaseDate(caseData.id);
      if (!dateValue || !isFinite(dateValue)) continue;
      
      const date = new Date(dateValue);
      
      // Check if the date is in the gap period
      if (dateValue >= gapStart && dateValue <= gapEnd) {
        const latitude = codapData.getLatitude(caseData.id);
        const longitude = codapData.getLongitude(caseData.id);
        
        if (latitude !== undefined && longitude !== undefined) {
          gapCases.push({
            id: caseData.id,
            date,
            latitude,
            longitude
          });
        }
      }
    }
    
    // Log results
    console.log(`Found ${gapCases.length} cases with coordinates in the gap period`);
    
    if (gapCases.length > 0) {
      // Find min/max lat/long for these cases
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLong = Infinity;
      let maxLong = -Infinity;
      
      for (const c of gapCases) {
        minLat = Math.min(minLat, c.latitude);
        maxLat = Math.max(maxLat, c.latitude);
        minLong = Math.min(minLong, c.longitude);
        maxLong = Math.max(maxLong, c.longitude);
      }
      
      console.log("Geographic bounds for gap period cases:", {
        latitude: [minLat, maxLat],
        longitude: [minLong, maxLong]
      });
      
      console.log("Current map view bounds:", {
        latitude: [graph.minLatitude, graph.maxLatitude],
        longitude: [graph.minLongitude, graph.maxLongitude]
      });
      
      console.log("Absolute map bounds:", {
        latitude: [graph.absoluteMinLatitude, graph.absoluteMaxLatitude],
        longitude: [graph.absoluteMinLongitude, graph.absoluteMaxLongitude]
      });
      
      // Sample some cases
      const samplesToShow = Math.min(5, gapCases.length);
      console.log(`Sample coordinates for ${samplesToShow} cases in the gap period:`);
      
      for (let i = 0; i < samplesToShow; i++) {
        const c = gapCases[i];
        console.log(`  Case ${c.id} (${c.date.toISOString()}): Lat ${c.latitude}, Long ${c.longitude}`);
        
        // Check if this case is within the current map bounds
        const isInLatRange = c.latitude >= graph.minLatitude && c.latitude <= graph.maxLatitude;
        const isInLongRange = c.longitude >= graph.minLongitude && c.longitude <= graph.maxLongitude;
        const isVisible = graph.caseIsVisible(c.id);
        
        console.log(`    Within lat range: ${isInLatRange}, Within long range: ${isInLongRange}, Visible: ${isVisible}`);
      }
    }
  } catch (error) {
    console.error("Error analyzing gap period coordinates:", error);
  }
}

/**
 * Set the map view to focus specifically on data points from the 2005 gap period
 * @param dataContextName Name of the data context
 */
export async function focusOnGapPeriodData(dataContextName: string): Promise<void> {
  try {
    console.log("Focusing map view on 2005 gap period data points...");
    
    // Get all cases
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].allCases`
    }) as CodapApiResult;
    
    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
      console.warn("Failed to get cases for focusing on gap period");
      return;
    }
    
    // Define gap period
    const gapStart = new Date("2005-06-30").getTime();
    const gapEnd = new Date("2005-11-30").getTime();
    
    // Get coordinates for cases in the gap period
    let gapPointsFound = false;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLong = Infinity;
    let maxLong = -Infinity;
    
    for (const caseData of result.values) {
      if (!caseData) continue;
      
      const dateValue = codapData.getCaseDate(caseData.id);
      if (!dateValue || !isFinite(dateValue)) continue;
      
      // Check if the date is in the gap period
      if (dateValue >= gapStart && dateValue <= gapEnd) {
        const latitude = codapData.getLatitude(caseData.id);
        const longitude = codapData.getLongitude(caseData.id);
        
        if (latitude !== undefined && longitude !== undefined && 
            isFinite(latitude) && isFinite(longitude)) {
          gapPointsFound = true;
          minLat = Math.min(minLat, latitude);
          maxLat = Math.max(maxLat, latitude);
          minLong = Math.min(minLong, longitude);
          maxLong = Math.max(maxLong, longitude);
        }
      }
    }
    
    if (!gapPointsFound) {
      console.warn("No geographic points found in the gap period to focus on");
      return;
    }
    
    console.log("Found gap period geographic bounds:", { minLat, maxLat, minLong, maxLong });
    
    // Add a 100% margin to ensure visibility
    const latRange = maxLat - minLat;
    const longRange = maxLong - minLong;
    
    const expandedMinLat = minLat - latRange;
    const expandedMaxLat = maxLat + latRange;
    const expandedMinLong = minLong - longRange;
    const expandedMaxLong = maxLong + longRange;
    
    // Directly set the graph's view to focus on these points
    // Skip updating absolute boundaries and just set the view
    graph.minLatitude = expandedMinLat;
    graph.maxLatitude = expandedMaxLat;
    graph.minLongitude = expandedMinLong;
    graph.maxLongitude = expandedMaxLong;
    
    console.log("Map view focused on gap period data points:", {
      latitude: [expandedMinLat, expandedMaxLat],
      longitude: [expandedMinLong, expandedMaxLong]
    });
  } catch (error) {
    console.error("Error focusing on gap period data:", error);
  }
}

/**
 * Gets all available data contexts from CODAP
 * @returns Array of data context names
 */
export async function getAvailableDatasets(): Promise<string[]> {
  try {
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: "dataContextList"
    }) as CodapApiResult;

    if (!result.success || !result.values || !isDataContextArray(result.values)) {
      console.warn("Failed to get data context list");
      return [];
    }

    return result.values.map((context: CodapDataContext) => context.name);
  } catch (error) {
    console.error("Error getting available datasets:", error);
    return [];
  }
} 
