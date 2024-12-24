import { ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import {
  initializePlugin, addDataContextChangeListener, ClientNotification
} from "@concord-consortium/codap-plugin-api";
import React, { useEffect, useState } from "react";
import { getData } from "../utilities/codap-utils";
import {
  kAboutTabLabel, kDataContextName, kGraphTabLabel, kInitialDimensions, kPluginName, kVersion
} from "../utilities/constants";
import { AboutTab } from "./about-tab";
import "./App.css";
import { GraphTab } from "./graph-tab";

export const App = () => {
  const [listenerNotification, setListenerNotification] = useState<string>();

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions})
      .catch(reason => {
        // This will happen if not embedded in CODAP
        console.warn("Not embedded in CODAP");
      });

    // this is an example of how to add a notification listener to a CODAP component
    // for more information on listeners and notifications, see
    // https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API#documentchangenotice
    const casesUpdatedListener = (listenerRes: ClientNotification) => {
      if (listenerRes.values.operation === "updateCases") {
        setListenerNotification(JSON.stringify(listenerRes.values.result));
      }
    };
    addDataContextChangeListener(kDataContextName, casesUpdatedListener);

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
              <GraphTab listenerNotification={listenerNotification} />
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
