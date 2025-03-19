import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Divider,
  ButtonGroup,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { getMinMaxCoordinates } from "../utilities/get-min-max-coordinates";
import { datasetConfig } from "../models/dataset-config";
import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { testSimpleFormulaSearch } from "../utilities/codap-examples";

// Interface for CODAP API responses
interface CodapApiResult {
  success: boolean;
  values?: any;
}

/**
 * Component that demonstrates retrieving min/max coordinate values
 * from the current CODAP dataset using formula search
 */
export const CoordinateExplorer: React.FC = () => {
  const [coordinates, setCoordinates] = useState<{
    minLat: number | null;
    maxLat: number | null;
    minLong: number | null;
    maxLong: number | null;
    success: boolean;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataContextDetails, setDataContextDetails] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [directApiResponse, setDirectApiResponse] = useState<any>(null);
  
  // Fetch min/max coordinates using our utility function
  const fetchCoordinates = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const result = await getMinMaxCoordinates();
      setCoordinates(result);
      
      if (!result || !result.success) {
        setError("Failed to retrieve coordinate bounds completely");
      }
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Direct API call to get min/max latitude using formula search
  const fetchDirectCoordinates = async () => {
    if (!datasetConfig.dataContextName || !dataContextDetails?.mainCollection?.name) {
      setError("No dataset context or collection configured");
      return;
    }
    
    setLoading(true);
    setError(null);
    setDebugInfo("Attempting direct formula search...");
    setDirectApiResponse(null);
    
    try {
      const dataContext = datasetConfig.dataContextName;
      const collection = dataContextDetails.mainCollection.name;
      const latAttr = datasetConfig.latitudeAttribute || "latitude";
      const longAttr = datasetConfig.longitudeAttribute || "longitude";
      
      // Create the resource paths for min/max latitude and longitude
      const minLatResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${latAttr}=min(${latAttr})]`;
      const maxLatResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${latAttr}=max(${latAttr})]`;
      const minLongResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${longAttr}=min(${longAttr})]`;
      const maxLongResource = `dataContext[${dataContext}].collection[${collection}].caseFormulaSearch[${longAttr}=max(${longAttr})]`;
      
      // Log the resources we're using
      console.log("--------- COORDINATE FORMULA SEARCH DETAILS ---------");
      console.log("Data Context:", dataContext);
      console.log("Collection:", collection);
      console.log("Latitude Attribute:", latAttr);
      console.log("Longitude Attribute:", longAttr);
      console.log("Min Latitude Resource:", minLatResource);
      console.log("Max Latitude Resource:", maxLatResource);
      console.log("Min Longitude Resource:", minLongResource);
      console.log("Max Longitude Resource:", maxLongResource);
      
      setDebugInfo((prev) => `${prev}\nRequesting min latitude: ${minLatResource}`);
      
      // Get min latitude
      const minLatResult = await codapInterface.sendRequest({
        action: "get",
        resource: minLatResource
      }) as CodapApiResult;
      
      console.log("MIN LATITUDE RESULT:", minLatResult);
      console.log("MIN LATITUDE RESULT (JSON):", JSON.stringify(minLatResult, null, 2));
      
      setDebugInfo((prev) => `${prev}\nMin latitude result: ${JSON.stringify(minLatResult)}`);
      
      // Get max latitude
      const maxLatResult = await codapInterface.sendRequest({
        action: "get",
        resource: maxLatResource
      }) as CodapApiResult;
      
      console.log("MAX LATITUDE RESULT:", maxLatResult);
      console.log("MAX LATITUDE RESULT (JSON):", JSON.stringify(maxLatResult, null, 2));
      
      setDebugInfo((prev) => `${prev}\nMax latitude result: ${JSON.stringify(maxLatResult)}`);
      
      // Get min longitude
      const minLongResult = await codapInterface.sendRequest({
        action: "get",
        resource: minLongResource
      }) as CodapApiResult;
      
      console.log("MIN LONGITUDE RESULT:", minLongResult);
      console.log("MIN LONGITUDE RESULT (JSON):", JSON.stringify(minLongResult, null, 2));
      
      setDebugInfo((prev) => `${prev}\nMin longitude result: ${JSON.stringify(minLongResult)}`);
      
      // Get max longitude
      const maxLongResult = await codapInterface.sendRequest({
        action: "get",
        resource: maxLongResource
      }) as CodapApiResult;
      
      console.log("MAX LONGITUDE RESULT:", maxLongResult);
      console.log("MAX LONGITUDE RESULT (JSON):", JSON.stringify(maxLongResult, null, 2));
      
      setDebugInfo((prev) => `${prev}\nMax longitude result: ${JSON.stringify(maxLongResult)}`);
      
      // Helper function to extract value
      const extractValue = (result: CodapApiResult, attr: string): number | null => {
        if (!result.success) {
          return null;
        }
        
        const values = result.values;
        
        // Handle different response formats
        if (Array.isArray(values) && values.length > 0) {
          const caseData = values[0];
          
          // Check in values object first
          if (caseData.values && caseData.values[attr] !== undefined) {
            const numValue = Number(caseData.values[attr]);
            return !isNaN(numValue) ? numValue : null;
          }
          
          // Check directly on case object
          if (caseData[attr] !== undefined) {
            const numValue = Number(caseData[attr]);
            return !isNaN(numValue) ? numValue : null;
          }
        }
        
        return null;
      };
      
      // Extract values
      const minLat = extractValue(minLatResult, latAttr);
      const maxLat = extractValue(maxLatResult, latAttr);
      const minLong = extractValue(minLongResult, longAttr);
      const maxLong = extractValue(maxLongResult, longAttr);
      
      console.log("--------- EXTRACTED COORDINATE VALUES ---------");
      console.log("Min Latitude:", minLat);
      console.log("Max Latitude:", maxLat);
      console.log("Min Longitude:", minLong);
      console.log("Max Longitude:", maxLong);
      
      const success = minLat !== null && maxLat !== null && minLong !== null && maxLong !== null;
      
      console.log("All values successfully extracted:", success);
      
      // Test alternative extraction approach for debugging
      console.log("--------- TESTING ALTERNATIVE EXTRACTION APPROACH ---------");
      
      if (minLatResult.success && Array.isArray(minLatResult.values)) {
        console.log("Min Latitude Values Array:", minLatResult.values);
        
        if (minLatResult.values.length > 0) {
          const firstCase = minLatResult.values[0];
          console.log("First Case Object:", firstCase);
          
          if (firstCase.values) {
            console.log("Case Values Object:", firstCase.values);
            console.log(`Latitude Value (${latAttr}):`, firstCase.values[latAttr]);
          } else {
            console.log("No 'values' property on case object");
            console.log(`Direct Property (${latAttr}):`, firstCase[latAttr]);
          }
        }
      }
      
      // Store the extracted coordinates
      setCoordinates({
        minLat,
        maxLat,
        minLong,
        maxLong,
        success
      });
      
      if (!success) {
        setError("Could not extract all coordinate values");
      }
      
      // Store the raw API responses for debugging
      setDirectApiResponse({
        minLatResult,
        maxLatResult,
        minLongResult,
        maxLongResult
      });
      
    } catch (err) {
      console.error("Error in direct formula search:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch dataset structure information to show API resource paths
  const fetchDataContextDetails = async () => {
    if (!datasetConfig.dataContextName) {
      setError("No dataset context configured");
      return;
    }
    
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // Log current context name
      console.log(`Fetching details for data context: ${datasetConfig.dataContextName}`);
      setDebugInfo(`Fetching details for: ${datasetConfig.dataContextName}`);
      
      // Get data context info
      const contextResult = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${datasetConfig.dataContextName}]`
      }) as CodapApiResult;
      
      console.log("Context result:", contextResult);
      
      if (!contextResult.success) {
        setError(`Failed to retrieve data context: ${datasetConfig.dataContextName}`);
        setDebugInfo(`API Response: ${JSON.stringify(contextResult)}`);
        setLoading(false);
        return;
      }
      
      // Get collections - looking at examples, collections should be inside the context
      const collections = contextResult.values?.collections || [];
      console.log("Collections from context:", collections);
      
      // If no collections found in context, try a direct query
      if (!collections.length) {
        console.log("No collections found in context, trying direct query");
        setDebugInfo((prev) => `${prev}\nNo collections found in context, trying direct query`);
        
        const collectionsResult = await codapInterface.sendRequest({
          action: "get",
          resource: `dataContext[${datasetConfig.dataContextName}].collection`
        }) as CodapApiResult;
        
        console.log("Direct collections result:", collectionsResult);
        
        if (collectionsResult.success && collectionsResult.values) {
          collections.push(...collectionsResult.values);
        }
      }
      
      if (!collections.length) {
        setError("No collections found in this data context");
        setLoading(false);
        return;
      }
      
      // Find the main collection (usually "Cases")
      const mainCollection = collections.find((c: any) => c.name === "Cases") || collections[0];
      console.log("Selected main collection:", mainCollection);
      
      // Get attributes - they might be in the collection already as 'attrs'
      let attributes = mainCollection.attrs || [];
      
      // If no attributes found, try a direct query
      if (!attributes.length) {
        console.log("No attributes found in collection, trying direct query");
        setDebugInfo((prev) => `${prev}\nNo attributes found in collection, trying direct query`);
        
        const attrsResult = await codapInterface.sendRequest({
          action: "get",
          resource: `dataContext[${datasetConfig.dataContextName}].collection[${mainCollection.name}].attribute`
        }) as CodapApiResult;
        
        console.log("Direct attributes result:", attrsResult);
        
        if (attrsResult.success && attrsResult.values) {
          attributes = attrsResult.values;
        }
      }
      
      // Store all details
      setDataContextDetails({
        context: contextResult.values,
        collections,
        mainCollection,
        attributes
      });
      
      setDebugInfo((prev) => `${prev}\nSuccessfully retrieved data structure.
Collections: ${collections.map((c: any) => c.name).join(", ")}
Attributes: ${attributes.map((a: any) => a.name).join(", ")}`);
      
    } catch (err) {
      console.error("Error fetching data context details:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate the formula search resource path for the UI
  const getFormulaSearchResource = (attribute: string, formula: string) => {
    if (!datasetConfig.dataContextName || !dataContextDetails?.mainCollection) {
      return "dataContext[...].collection[...].caseFormulaSearch[...]";
    }
    
    return `dataContext[${datasetConfig.dataContextName}].collection[${dataContextDetails.mainCollection.name}].caseFormulaSearch[${attribute}=${formula}]`;
  };
  
  // Run the simple test function to directly test formula search
  const runSimpleTest = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo("Running simple formula search test...");
    
    try {
      await testSimpleFormulaSearch();
      setDebugInfo((prev) => `${prev}\nTest complete. Check browser console for detailed output.`);
    } catch (err) {
      console.error("Error running simple test:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <VStack spacing={6} align="stretch" p={4}>
      <Heading as="h2" size="lg">Coordinate Data Explorer</Heading>
      
      <Card>
        <CardHeader>
          <Heading size="md">Dataset Information</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={2}>
            <Text><strong>Data Context:</strong> {datasetConfig.dataContextName || "Not configured"}</Text>
            <Text><strong>Latitude Attribute:</strong> {datasetConfig.latitudeAttribute || "Not configured"}</Text>
            <Text><strong>Longitude Attribute:</strong> {datasetConfig.longitudeAttribute || "Not configured"}</Text>
            
            <ButtonGroup mt={4}>
              <Button 
                colorScheme="blue" 
                isLoading={loading} 
                onClick={fetchDataContextDetails}
                isDisabled={!datasetConfig.dataContextName}
              >
                Fetch Dataset Structure
              </Button>
            </ButtonGroup>
          </VStack>
          
          {dataContextDetails && (
            <Box mt={4}>
              <Heading size="sm" mb={2}>Data Structure</Heading>
              <Text><strong>Collections:</strong> {dataContextDetails.collections.map((c: any) => c.name).join(", ")}</Text>
              <Text><strong>Main Collection:</strong> {dataContextDetails.mainCollection?.name}</Text>
              <Text><strong>Attributes:</strong> {dataContextDetails.attributes.map((a: any) => a.name).join(", ")}</Text>
            </Box>
          )}
          
          {debugInfo && (
            <Alert status="info" mt={4} fontSize="sm">
              <AlertIcon />
              <Box>
                <AlertTitle>Debug Information</AlertTitle>
                <AlertDescription whiteSpace="pre-wrap">{debugInfo}</AlertDescription>
              </Box>
            </Alert>
          )}
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <Heading size="md">Coordinate Formula Search</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={4}>
            <Text>
              Using CODAP&apos;s <Code>caseFormulaSearch</Code> API to find minimum and maximum coordinates.
            </Text>
            
            {datasetConfig.latitudeAttribute && (
              <>
                <Text><strong>Min Latitude Formula:</strong></Text>
                <Code p={2}>{getFormulaSearchResource(datasetConfig.latitudeAttribute, `min(${datasetConfig.latitudeAttribute})`)}</Code>
                
                <Text><strong>Max Latitude Formula:</strong></Text>
                <Code p={2}>{getFormulaSearchResource(datasetConfig.latitudeAttribute, `max(${datasetConfig.latitudeAttribute})`)}</Code>
              </>
            )}
            
            {datasetConfig.longitudeAttribute && (
              <>
                <Text><strong>Min Longitude Formula:</strong></Text>
                <Code p={2}>{getFormulaSearchResource(datasetConfig.longitudeAttribute, `min(${datasetConfig.longitudeAttribute})`)}</Code>
                
                <Text><strong>Max Longitude Formula:</strong></Text>
                <Code p={2}>{getFormulaSearchResource(datasetConfig.longitudeAttribute, `max(${datasetConfig.longitudeAttribute})`)}</Code>
              </>
            )}
            
            <ButtonGroup mt={2}>
              <Button 
                colorScheme="blue" 
                isLoading={loading} 
                onClick={fetchCoordinates}
                isDisabled={!datasetConfig.latitudeAttribute || !datasetConfig.longitudeAttribute}
              >
                Fetch Min/Max Coordinates
              </Button>
              {dataContextDetails?.mainCollection && (
                <Button 
                  colorScheme="green" 
                  isLoading={loading} 
                  onClick={fetchDirectCoordinates}
                  isDisabled={!datasetConfig.latitudeAttribute || !datasetConfig.longitudeAttribute}
                >
                  Try Direct Formula Search
                </Button>
              )}
              <Button
                colorScheme="purple"
                isLoading={loading}
                onClick={runSimpleTest}
              >
                Run Simple Test (Check Console)
              </Button>
            </ButtonGroup>
          </VStack>
        </CardBody>
      </Card>
      
      {error && (
        <Card borderColor="red.500" borderWidth={1}>
          <CardBody>
            <Text color="red.500">{error}</Text>
          </CardBody>
        </Card>
      )}
      
      {coordinates && (
        <Card>
          <CardHeader>
            <Heading size="md">Results</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text><strong>Min Latitude:</strong> {coordinates.minLat !== null ? coordinates.minLat : "Not found"}</Text>
              <Text><strong>Max Latitude:</strong> {coordinates.maxLat !== null ? coordinates.maxLat : "Not found"}</Text>
              <Divider my={2} />
              <Text><strong>Min Longitude:</strong> {coordinates.minLong !== null ? coordinates.minLong : "Not found"}</Text>
              <Text><strong>Max Longitude:</strong> {coordinates.maxLong !== null ? coordinates.maxLong : "Not found"}</Text>
            </VStack>
          </CardBody>
        </Card>
      )}
      
      {directApiResponse && (
        <Card>
          <CardHeader>
            <Heading size="md">API Response Details</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="start" spacing={2}>
              <Heading size="sm">Min Latitude Response:</Heading>
              <Code p={2} fontSize="xs" width="100%" overflowX="auto">
                {JSON.stringify(directApiResponse.minLatResult, null, 2)}
              </Code>
              
              <Heading size="sm" mt={2}>Max Latitude Response:</Heading>
              <Code p={2} fontSize="xs" width="100%" overflowX="auto">
                {JSON.stringify(directApiResponse.maxLatResult, null, 2)}
              </Code>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}; 
