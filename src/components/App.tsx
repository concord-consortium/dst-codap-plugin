import { ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { initializeDST, resizePlugin } from "../utilities/codap-utils";
import {
  kAboutTabHeight, kAboutTabLabel, kAboutTabWidth, kGraphTabHeight, kGraphTabLabel, kGraphTabWidth
} from "../utilities/constants";
import { AboutTab } from "./about-tab";
import "./App.css";
import { GraphTab } from "./graph-tab";

export const App = () => {
  useEffect(() => {
    initializeDST();
  }, []);

  const handleTabChange = (index: number) => {
    const height = [kGraphTabHeight, kAboutTabHeight][index];
    const width = [kGraphTabWidth, kAboutTabWidth][index];
    resizePlugin(height, width);
  };

  return (
    <ChakraProvider>
      <div className="App">
        <Tabs variant="enclosed" onChange={handleTabChange}>
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
