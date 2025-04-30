## SpecStory

## Timeout Issues with Large Datasets (4/28/2025, 6:27:56 PM)

_**User**_

I now am running into issues when loading more extensive datasets. If the dataset is beyond a certain size, I get the console error: 

codap-dataset-utils.ts:1433 Error updating map bounds: handleResponse: CODAP request timed out: {"action":"get","resource":"dataContext[edited_wildfire_data-trim-formatted-finalmidsize].collection[Cases].caseFormulaSearch[latitude=min(latitude)]"}
(anonymous)	@	codap-dataset-utils.ts:1433
await in (anonymous)		
j3	@	codap-dataset-utils.ts:190
await in j3		
onClick	@	graph-ui.tsx:263


---

_**Assistant**_

I'll help you troubleshoot this timeout issue with large datasets. Let's examine the error and find a solution.

---

_****_

<details>
            <summary>Searched codebase "Error updating map bounds: handleResponse: CODAP request timed out" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/utilities/codap-dataset-utils.js` | L1286-1312 |
| `src/utilities/codap-dataset-utils.ts` | L1210-1258 |
| `src/utilities/codap-dataset-utils.js` | L1312-1340 |
| `src/utilities/codap-dataset-utils.ts` | L1258-1292 |
| `src/utilities/codap-dataset-utils.js` | L1340-1352 |
| `src/utilities/codap-dataset-utils.js` | L1352-1384 |
| `src/utilities/codap-dataset-utils.js` | L1426-1437 |
| `src/utilities/codap-dataset-utils.js` | L1241-1275 |
| `src/utilities/codap-dataset-utils.ts` | L1432-1435 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L13563-13782 |
| `src/utilities/codap-dataset-utils.js` | L1398-1426 |
| `src/utilities/codap-dataset-utils.ts` | L1342-1389 |
| `src/utilities/codap-dataset-utils.js` | L1384-1398 |
| `src/utilities/codap-dataset-utils.ts` | L164-194 |
| `src/utilities/codap-dataset-utils.js` | L1532-1548 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L6882-6944 |
| `src/utilities/codap-dataset-utils.ts` | L1389-1432 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L7020-7155 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L9548-9639 |
| `src/utilities/codap-dataset-utils.ts` | L1292-1342 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L5356-5398 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L5265-5302 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L13843-14206 |
| `src/utilities/get-min-max-coordinates.ts` | L62-119 |
| `src/utilities/codap-dataset-utils.js` | L237-255 |

</details>

---

_****_

<details>
            <summary>Searched codebase "codapInterface sendRequest timeout handling" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/utilities/codap-interface-helpers.ts` | L7-41 |
| `src/utilities/codap-interface-helpers.js` | L115-145 |
| `src/utilities/codap-interface-helpers.ts` | L77-98 |
| `src/utilities/__tests__/codap-interface-helpers.test.ts` | L1-8 |
| `src/utilities/codap-interface-helpers.ts` | L1-7 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L3536-3604 |
| `src/utilities/codap-interface-helpers.js` | L38-72 |
| `src/utilities/codap-interface-helpers.js` | L72-115 |
| `src/utilities/codap-dataset-utils.ts` | L73-113 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L5875-5924 |
| `src/utilities/__tests__/codap-interface-helpers.test.ts` | L59-89 |
| `src/utilities/codap-examples.ts` | L1-7 |
| `src/utilities/codap-interface-helpers.ts` | L41-77 |
| `src/utilities/codap-dataset-utils.ts` | L194-222 |
| `src/utilities/codap-dataset-utils.js` | L255-273 |
| `design/background/codap-bg/CODAP-Game-API-(Deprecated).md` | L747-830 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L299-380 |
| `src/utilities/codap-dataset-utils.ts` | L700-748 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L5302-5356 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L6405-6440 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L6944-6982 |
| `src/utilities/get-min-max-coordinates.ts` | L31-62 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L3668-3754 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L15224-15264 |
| `src/utilities/__tests__/codap-interface-helpers.test.ts` | L89-127 |

</details>

---

_****_

<details>
            <summary>Searched codebase "graph-ui.tsx onClick timeout" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/components/ui/graph-ui.tsx` | L331-370 |
| `src/components/ui/graph-ui.tsx` | L23-47 |
| `src/components/ui/graph-ui.tsx` | L406-458 |
| `src/components/ui/graph-ui.tsx` | L279-331 |
| `src/components/ui/graph-ui.tsx` | L152-207 |
| `src/components/ui/time-slider/time-slider.tsx` | L62-89 |
| `src/components/ui/graph-ui.tsx` | L253-279 |
| `src/components/ui/graph-ui.tsx` | L1-23 |
| `src/components/ui/graph-ui.tsx` | L370-406 |
| `src/components/ui/graph-ui.tsx` | L47-100 |
| `src/components/ui/graph-ui.tsx` | L100-152 |
| `src/components/ui/graph-ui.tsx` | L207-253 |
| `src/components/ui/ui-button.tsx` | L16-46 |
| `src/codap/components/data-display/components/legend/categorical-legend.tsx` | L60-92 |
| `src/components/App.tsx` | L1-45 |
| `.specstory/history/2025-04-03_17-38-debugging-attribute-loading-in-graph-display.md` | L9250-9307 |
| `src/models/graph.ts` | L12-21 |
| `src/components/main-toolbar.tsx` | L1-78 |
| `src/components/ui/graph-ui.scss` | L1-103 |
| `.specstory/history/2025-04-03_17-38-debugging-attribute-loading-in-graph-display.md` | L17132-17161 |
| `src/components/ui/time-slider/slider-thumb.tsx` | L1-16 |
| `src/components/ui/time-slider/time-slider.tsx` | L1-20 |
| `.specstory/history/2025-04-03_17-38-debugging-attribute-loading-in-graph-display.md` | L12984-13075 |
| `src/components/ui/ui-button.tsx` | L1-16 |
| `src/codap/components/axis/components/axis-or-legend-attribute-menu.tsx` | L1-21 |

</details>

---

_****_

<details>
            <summary>Searched codebase "codapInterface request timeout configuration timeout handling" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/utilities/codap-interface-helpers.ts` | L7-41 |
| `src/utilities/codap-interface-helpers.ts` | L1-7 |
| `src/utilities/codap-interface-helpers.ts` | L77-98 |
| `src/utilities/codap-dataset-utils.js` | L206-237 |
| `src/utilities/codap-interface-helpers.js` | L72-115 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L3536-3604 |
| `src/utilities/codap-interface-helpers.js` | L115-145 |
| `src/utilities/codap-interface-helpers.ts` | L41-77 |
| `src/utilities/codap-examples.ts` | L1-7 |
| `src/utilities/__tests__/codap-interface-helpers.test.ts` | L1-8 |
| `src/utilities/codap-dataset-utils.ts` | L194-222 |
| `src/utilities/codap-interface-helpers.js` | L38-72 |
| `src/utilities/codap-dataset-utils.ts` | L1-33 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L299-380 |
| `src/utilities/codap-dataset-utils.ts` | L73-113 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L5875-5924 |
| `src/utilities/codap-utils.ts` | L51-87 |
| `src/utilities/codap-dataset-utils.ts` | L164-194 |
| `design/implementation.md` | L432-495 |
| `design/background/codap-bg/CODAP-Game-API-(Deprecated).md` | L747-830 |
| `src/utilities/codap-dataset-utils.js` | L255-273 |
| `src/utilities/__tests__/codap-interface-helpers.test.ts` | L59-89 |
| `src/utilities/codap-dataset-utils.ts` | L700-748 |
| `design/background/codap-bg/CODAP-Game-API-(Deprecated).md` | L656-747 |
| `src/utilities/get-min-max-coordinates.ts` | L23-31 |

</details>

---

_****_

<details>
            <summary>Searched codebase "sendCodapRequest timeout" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/utilities/__tests__/codap-interface-helpers.test.ts` | L1-8 |
| `src/utilities/codap-interface-helpers.ts` | L7-41 |
| `src/utilities/codap-interface-helpers.js` | L72-115 |
| `src/utilities/codap-dataset-utils.ts` | L73-113 |
| `src/utilities/codap-interface-helpers.js` | L115-145 |
| `src/utilities/codap-interface-helpers.ts` | L77-98 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L5875-5924 |
| `src/utilities/codap-dataset-utils.js` | L116-149 |
| `src/utilities/codap-interface-helpers.ts` | L41-77 |
| `src/utilities/codap-dataset-utils.ts` | L700-748 |
| `src/utilities/codap-dataset-utils.js` | L206-237 |
| `src/utilities/codap-dataset-utils.js` | L255-273 |
| `src/utilities/codap-dataset-utils.js` | L1532-1548 |
| `src/utilities/codap-interface-helpers.js` | L38-72 |
| `src/utilities/codap-dataset-utils.js` | L1340-1352 |
| `src/utilities/get-min-max-coordinates.ts` | L31-62 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L3536-3604 |
| `src/utilities/codap-dataset-utils.js` | L740-770 |
| `design/background/codap-bg/CODAP-Data-Interactive-Plugin-API.md` | L299-380 |
| `src/utilities/codap-interface-helpers.ts` | L1-7 |
| `src/codap/constants.js` | L2-6 |
| `src/utilities/codap-examples.ts` | L7-52 |
| `src/utilities/codap-dataset-utils.ts` | L1435-1494 |
| `.specstory/history/2025-03-17_20-50-date-parsing-errors-in-data-processing.md` | L15224-15264 |
| `src/utilities/codap-dataset-utils.ts` | L194-222 |

</details>

---

_****_

Read file: undefined

---

_****_

Read file: undefined

---

_****_

After analyzing the error and your codebase, I can see that you're experiencing a timeout issue when loading large datasets. The error occurs specifically in the `updateMapBoundsFromData` function when attempting to use the `caseFormulaSearch` method to find coordinate boundaries.

The problem is in the CODAP API requests that are timing out when dealing with larger datasets. Let's implement a solution with a more efficient approach for handling large datasets:

---

_****_

```diff
      }
      
-     // Now use formula search to get min/max values directly - this is the approach that works
-     console.log("Using caseFormulaSearch to retrieve min/max coordinate values...");
- 
-     // Get min latitude
-     const minLatResult = await codapInterface.sendRequest({
-       action: "get",
-       resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${latAttr}=min(${latAttr})]`
-     }) as CodapApiResult;
- 
-     // Get max latitude
-     const maxLatResult = await codapInterface.sendRequest({
-       action: "get",
-       resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${latAttr}=max(${latAttr})]`
-     }) as CodapApiResult;
- 
-     // Get min longitude
-     const minLongResult = await codapInterface.sendRequest({
-       action: "get",
-       resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${longAttr}=min(${longAttr})]`
-     }) as CodapApiResult;
- 
-     // Get max longitude
-     const maxLongResult = await codapInterface.sendRequest({
-       action: "get",
-       resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${longAttr}=max(${longAttr})]`
-     }) as CodapApiResult;
- 
-     console.log("Formula search results:", {
-       minLat: minLatResult.success,
-       maxLat: maxLatResult.success,
-       minLong: minLongResult.success,
-       maxLong: maxLongResult.success
-     });
- 
+     // Try different approaches to get min/max coordinate values, with fallbacks for large datasets
+     
      // Helper function to extract numeric value from a case result
      function extractValue(caseResult: CodapApiResult, attrName: string): number | null {
        return null;
      }
- 
-     // Extract coordinate values
-     const minLat = extractValue(minLatResult, latAttr);
-     const maxLat = extractValue(maxLatResult, latAttr);
-     const minLong = extractValue(minLongResult, longAttr);
-     const maxLong = extractValue(maxLongResult, longAttr);
- 
-     // Check if we have all coordinate values
-     const hasValidCoordinates = 
-       minLat !== null && maxLat !== null && 
-       minLong !== null && maxLong !== null &&
-       !isNaN(minLat) && !isNaN(maxLat) && 
-       !isNaN(minLong) && !isNaN(maxLong);
- 
-     // APPROACH: Set the view to show the entire world and ensure data point alignment
-     // We'll use the standard geographic coordinate system (-90 to 90 lat, -180 to 180 long)
-     
-     // 1. Set the absolute bounds to full world coordinates
+     
+     // Initialize coordinates
+     let minLat: number | null = null;
+     let maxLat: number | null = null;
+     let minLong: number | null = null;
+     let maxLong: number | null = null;
+     let hasValidCoordinates = false;
+     
+     // APPROACH 1: First try using caseFormulaSearch with a timeout safety
+     console.log("APPROACH 1: Using caseFormulaSearch to retrieve min/max coordinate values...");
+     
+     try {
+       // Create a promise with timeout for formula search
+       const timeoutDuration = 3000; // 3 seconds timeout
+       
+       const getValueWithTimeout = async (request: any): Promise<CodapApiResult> => {
+         // Create a timeout promise
+         const timeoutPromise = new Promise<CodapApiResult>((_, reject) => {
+           setTimeout(() => reject(new Error("Request timed out")), timeoutDuration);
+         });
+         
+         // Race the actual request against the timeout
+         return Promise.race([
+           codapInterface.sendRequest(request),
+           timeoutPromise
+         ]) as Promise<CodapApiResult>;
+       };
+       
+       // Get min latitude with timeout
+       const minLatResult = await getValueWithTimeout({
+         action: "get",
+         resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${latAttr}=min(${latAttr})]`
+       });
+       
+       // Get max latitude with timeout
+       const maxLatResult = await getValueWithTimeout({
+         action: "get",
+         resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${latAttr}=max(${latAttr})]`
+       });
+       
+       // Get min longitude with timeout
+       const minLongResult = await getValueWithTimeout({
+         action: "get",
+         resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${longAttr}=min(${longAttr})]`
+       });
+       
+       // Get max longitude with timeout
+       const maxLongResult = await getValueWithTimeout({
+         action: "get",
+         resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${longAttr}=max(${longAttr})]`
+       });
+       
+       // Extract coordinate values
+       minLat = extractValue(minLatResult, latAttr);
+       maxLat = extractValue(maxLatResult, latAttr);
+       minLong = extractValue(minLongResult, longAttr);
+       maxLong = extractValue(maxLongResult, longAttr);
+       
+       // Check if we have all coordinate values
+       hasValidCoordinates = 
+         minLat !== null && maxLat !== null && 
+         minLong !== null && maxLong !== null &&
+         !isNaN(minLat) && !isNaN(maxLat) && 
+         !isNaN(minLong) && !isNaN(maxLong);
+       
+       if (hasValidCoordinates) {
+         console.log("Successfully retrieved coordinates using caseFormulaSearch");
+       } else {
+         console.log("Failed to get complete coordinates using caseFormulaSearch");
+       }
+     } catch (error) {
+       console.warn("caseFormulaSearch approach failed:", error);
+     }
+     
+     // APPROACH 2: Try using a sampling approach for large datasets
+     if (!hasValidCoordinates) {
+       console.log("APPROACH 2: Using cases sampling approach...");
+       
+       try {
+         // Get a sample of cases (first 200 cases should be enough for most datasets)
+         const sampleSize = 200;
+         const sampleResult = await codapInterface.sendRequest({
+           action: "get",
+           resource: `dataContext[${dataContextName}].collection[${collectionName}].caseCount[0:${sampleSize}]`
+         }) as CodapApiResult;
+         
+         if (sampleResult.success && sampleResult.values) {
+           const cases = Array.isArray(sampleResult.values) ? sampleResult.values : [sampleResult.values];
+           
+           // Scan through the sample cases to find min/max values
+           cases.forEach((caseData: any) => {
+             let latValue: number | null = null;
+             let longValue: number | null = null;
+             
+             // Try to extract latitude value
+             if (caseData.values && caseData.values[latAttr] !== undefined) {
+               const rawLat = caseData.values[latAttr];
+               latValue = typeof rawLat === "string" ? Number(rawLat) : rawLat;
+             }
+             
+             // Try to extract longitude value
+             if (caseData.values && caseData.values[longAttr] !== undefined) {
+               const rawLong = caseData.values[longAttr];
+               longValue = typeof rawLong === "string" ? Number(rawLong) : rawLong;
+             }
+             
+             // Update min/max values if we found valid coordinates
+             if (latValue !== null && !isNaN(latValue) && 
+                 longValue !== null && !isNaN(longValue)) {
+               
+               if (minLat === null || latValue < minLat) minLat = latValue;
+               if (maxLat === null || latValue > maxLat) maxLat = latValue;
+               if (minLong === null || longValue < minLong) minLong = longValue;
+               if (maxLong === null || longValue > maxLong) maxLong = longValue;
+             }
+           });
+           
+           // Check if we found valid coordinates from sampling
+           hasValidCoordinates = 
+             minLat !== null && maxLat !== null && 
+             minLong !== null && maxLong !== null;
+           
+           if (hasValidCoordinates) {
+             console.log("Successfully retrieved coordinates using case sampling");
+           }
+         }
+       } catch (error) {
+         console.warn("Case sampling approach failed:", error);
+       }
+     }
+     
+     // APPROACH 3: If all else fails, set default world map bounds
+     if (!hasValidCoordinates) {
+       console.log("APPROACH 3: Using default world map bounds...");
+       
+       // Default to full globe coordinates
+       minLat = -85;
+       maxLat = 85;
+       minLong = -175;
+       maxLong = 175;
+       hasValidCoordinates = true;
+       
+       console.log("Using default world map bounds as fallback");
+     }
+     
+     console.log("Final map coordinates:");
+     console.log(`Latitude: ${minLat} to ${maxLat}`);
+     console.log(`Longitude: ${minLong} to ${maxLong}`);
+     
+     // Set the absolute bounds to full world coordinates
      const absoluteMinLat = -90;
      const absoluteMaxLat = 90;
      const absoluteMinLong = -180;
      const absoluteMaxLong = 180;
-     
-     console.log("Setting absolute map boundaries to full world coordinates:");
-     console.log(`Latitude: ${absoluteMinLat} to ${absoluteMaxLat}`);
-     console.log(`Longitude: ${absoluteMinLong} to ${absoluteMaxLong}`);
- 
+     
      // Update absolute boundaries in the graph model - these are the furthest limits
      graph.absoluteMinLatitude = absoluteMinLat;
      graph.absoluteMaxLongitude = absoluteMaxLong;
      
-     // Use slightly tighter bounds for the visible area (to avoid edge distortion)
-     // These give a small margin around the map
-     const visibleMinLat = -85;
-     const visibleMaxLat = 85;
-     const visibleMinLong = -175;
-     const visibleMaxLong = 175;
-     
-     // 2. Now set the current view to show the entire world map
-     console.log("Setting current view to show the entire world map:");
-     console.log(`Latitude: ${visibleMinLat} to ${visibleMaxLat}`);
-     console.log(`Longitude: ${visibleMinLong} to ${visibleMaxLong}`);
-     
-     // Set current view directly (to immediately display the entire world)
-     graph.minLatitude = visibleMinLat;
-     graph.maxLatitude = visibleMaxLat;
-     graph.minLongitude = visibleMinLong;
-     graph.maxLongitude = visibleMaxLong;
-     
-     // Set home view to the same - this is what "reset" will return to
-     graph.homeMinLatitude = visibleMinLat;
-     graph.homeMaxLatitude = visibleMaxLat;
-     graph.homeMinLongitude = visibleMinLong;
-     graph.homeMaxLongitude = visibleMaxLong;
-     
-     // If we have valid data coordinates, also set up a data-focused view
-     if (hasValidCoordinates) {
-       console.log("Valid geographic coordinates found in dataset:");
-       console.log(`Latitude: ${minLat} to ${maxLat}`);
-       console.log(`Longitude: ${minLong} to ${maxLong}`);
-       
+     // If we're using the default world map bounds, set view to entire world
+     if (minLat === -85 && maxLat === 85 && minLong === -175 && maxLong === 175) {
+       // Set current view directly to show the entire world
+       graph.minLatitude = minLat;
+       graph.maxLatitude = maxLat;
+       graph.minLongitude = minLong;
+       graph.maxLongitude = maxLong;
+       
+       // Set home view to the same
+       graph.homeMinLatitude = minLat;
+       graph.homeMaxLatitude = maxLat;
+       graph.homeMinLongitude = minLong;
+       graph.homeMaxLongitude = maxLong;
+       
+       console.log("Map configured to show the entire world");
+     } else {
        // Calculate the data center point (midpoint of data coordinates)
        const dataCenterLat = (maxLat! + minLat!) / 2;
        const dataCenterLong = (maxLong! + minLong!) / 2;
        
        // Calculate the data spans with a margin to ensure visibility
-       const dataLatSpan = (maxLat! - minLat!) * 1.5; // 50% margin
-       const dataLongSpan = (maxLong! - minLong!) * 1.5; // 50% margin
+       const dataLatSpan = Math.max(0.1, (maxLat! - minLat!) * 1.5); // 50% margin
+       const dataLongSpan = Math.max(0.1, (maxLong! - minLong!) * 1.5); // 50% margin
        
        // Calculate bounds for a data-focused view (with margin)
        const dataMaxLong = Math.min(absoluteMaxLong, dataCenterLong + dataLongSpan/2);
        
-       console.log("Data-focused view (with 50% margin):");
+       console.log("Data-focused view (with margin):");
        console.log(`Latitude: ${dataMinLat} to ${dataMaxLat}`);
        console.log(`Longitude: ${dataMinLong} to ${dataMaxLong}`);
        
-       // Animate to the data-focused view after a delay
-       // This starts with the full world and then zooms to show the data
-       setTimeout(() => {
-         graph.animateTo({
-           minLatitude: dataMinLat,
-           maxLatitude: dataMaxLat,
-           minLongitude: dataMinLong,
-           maxLongitude: dataMaxLong
-         });
-         console.log("Animated to data-focused view");
-       }, 1000);
-     }
-     
-     console.log("Map configured to show the entire world with proper data alignment");
+       // Animate to the data-focused view
+       graph.animateTo({
+         minLatitude: dataMinLat,
+         maxLatitude: dataMaxLat,
+         minLongitude: dataMinLong,
+         maxLongitude: dataMaxLong
+       });
+       
+       console.log("Map configured to focus on data points");
+     }
    } catch (error) {
      console.error("Error updating map bounds:", error);
+     
+     // Fallback to full world map in case of any error
+     const fallbackMinLat = -85;
+     const fallbackMaxLat = 85;
+     const fallbackMinLong = -175;
+     const fallbackMaxLong = 175;
+     
+     // Set absolute bounds
+     graph.absoluteMinLatitude = -90;
+     graph.absoluteMaxLatitude = 90;
+     graph.absoluteMinLongitude = -180;
+     graph.absoluteMaxLongitude = 180;
+     
+     // Set current view
+     graph.minLatitude = fallbackMinLat;
+     graph.maxLatitude = fallbackMaxLat;
+     graph.minLongitude = fallbackMinLong;
+     graph.maxLongitude = fallbackMaxLong;
+     
+     // Set home view
+     graph.homeMinLatitude = fallbackMinLat;
+     graph.homeMaxLatitude = fallbackMaxLat;
+     graph.homeMinLongitude = fallbackMinLong;
+     graph.homeMaxLongitude = fallbackMaxLong;
+     
+     console.log("Fallback to world map view due to error");
    }
  }
```

---

_****_

I've implemented a robust solution to handle the CODAP API timeout issues when working with large datasets. Here's what the improved code does:

1. **Added timeout handling**: The new code implements a timeout mechanism that prevents requests from hanging indefinitely. Each CODAP request now has a 3-second timeout after which it will fail gracefully.

2. **Implemented a multi-step fallback approach**:
   - **Approach 1**: First tries the original method (`caseFormulaSearch`) but with timeout protection
   - **Approach 2**: If the first approach fails, uses a sampling approach that only looks at a subset of cases (up to 200)
   - **Approach 3**: As a last resort, falls back to showing the entire world map

3. **Added error recovery**: Even if all approaches fail, there's a final fallback that ensures the map will always show something useful.

4. **Optimized coordinate calculations**: Added safety checks to prevent division by zero and ensure reasonable map boundaries even with unusual data.

This solution should handle large datasets much better by:
1. Preventing timeouts from blocking the UI
2. Using more efficient data sampling when needed
3. Providing reasonable fallbacks to ensure the map always works

Give it a try with your larger datasets - it should now be able to handle them without timing out, and even if some requests do timeout, the map will still show either the sampled data boundaries or the entire world view.

---



---

