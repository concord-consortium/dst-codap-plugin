import { ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { initializeDST } from "../utilities/codap-utils";
import { kAboutTabLabel, kGraphTabLabel } from "../utilities/constants";
import { AboutTab } from "./about-tab";
import "./App.css";
import { GraphTab } from "./graph-tab";

export const App = () => {
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
      </div>
    </ChakraProvider>
  );
};
