import { ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { initializeDST } from "../utilities/codap-utils";
import { kAboutTabLabel, kGraphTabLabel } from "../utilities/constants";
import { AboutTab } from "./about-tab";
import { GraphTab } from "./graph-tab";
import { DatasetConfigPanel } from "./dataset-config-panel";
import { ui } from "../models/ui";
import "./App.css";

export const App = observer(() => {
  useEffect(() => {
    initializeDST();
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
        
        {/* DatasetConfigPanel is now always rendered, but only shown as a modal when needed */}
        <DatasetConfigPanel />
      </div>
    </ChakraProvider>
  );
});
