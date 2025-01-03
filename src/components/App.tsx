import { ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import {
  addDataContextsListListener, initializePlugin, ClientNotification,
} from "@concord-consortium/codap-plugin-api";
import React, { useEffect } from "react";
import { getData } from "../utilities/codap-utils";
import {
  kAboutTabLabel, kGraphTabLabel, kInitialDimensions, kPluginName, kVersion
} from "../utilities/constants";
import { AboutTab } from "./about-tab";
import "./App.css";
import { GraphTab } from "./graph-tab";

export const App = () => {
  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions})
      .catch(reason => {
        // This will happen if not embedded in CODAP
        console.warn("Not embedded in CODAP");
      });

    // Update data when there are new datasets in the document
    const documentChangeListener = (notification: ClientNotification) => {
      if (notification.values.operation === "dataContextCountChanged") {
        getData();
      }
    };
    addDataContextsListListener(documentChangeListener);

    getData();
  }, []);

  return (
    <ChakraProvider>
      <div className="App">
        <Tabs variant="enclosed">
          <TabList>
            <Tab>
              {kGraphTabLabel}
            </Tab>
            <Tab>
              {kAboutTabLabel}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <GraphTab />
            </TabPanel>
            <TabPanel>
              <AboutTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </ChakraProvider>
  );
};
