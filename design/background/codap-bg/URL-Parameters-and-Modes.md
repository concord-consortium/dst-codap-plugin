CODAP makes use of a number of URL parameters to cause actions to take place or to enter certain modes.

#### General

The following query parameters may be useful or may once have been useful for general users. Those that are no longer useful have been marked "deprecated".
* __[componentMode](https://github.com/concord-consortium/codap/wiki/CODAP-Query-Param:-componentMode)__ --
Opens a CODAP document without a navigational bar or file manager bar with the scope of the display narrowed to a single component. It is used to present a single CODAP graph or table in an IFrame in an HTML document.
* __di__ -- Opens codap with a ("data interactive") plugin as specified by the URL that is the value of the parameter.
* __di-override__ -- Takes a string value that specifies the name (or part of the name) of data interactive in the CODAP document to replace. It is used in conjunction with the __di__ param, which specifies the data interactive to load in place of the named one using the __di-override__ param.
* __embeddedMode, embeddedServer__ Opens CODAP with no file manager bar with optional capability to communicate with the hosting page. Intended to be used to embed CODAP in a page of lesson sequence.
* __[gaussianFit](https://github.com/concord-consortium/codap/wiki/CODAP-Query-Param:-gaussian)__ -- When a histogram is showing, replaces the **Normal Curve** option with **Gaussian Fit**.
* __[guideIndex](https://github.com/concord-consortium/codap/wiki/CODAP-Query-Param:-guideIndex)__ -- Opens a CODAP document with specific Guide Page made visible.
* __[ICI](https://github.com/concord-consortium/codap/wiki/CODAP-Query-Param:-ICI)__ --  Makes available a boxplot option to display an "informal confidence interval" as used in New Zealand's secondary mathematics curriculum.
* __[inbounds](https://github.com/concord-consortium/codap/wiki/CODAP-Inbounds-Mode)__ -— When opening a CODAP document, makes sure that all components are positioned within the visible workspace without scrolling.
* __[standalone](https://github.com/concord-consortium/codap/wiki/CODAP-Query-Param:-standalone)__ -- Opens CODAP in *standalone mode*. This mode is one of the ways of using the features of CODAP with CODAP in a subordinate role. A plugin is made to occupy the entire CODAP workspace. CODAP graphs, tables, and other components can be opened and positioned where the standalone plugin desires.
* __[url](https://github.com/concord-consortium/codap/wiki/CODAP-Query-Param:-URL)__ -- Opens a CODAP Document or CSV document as specified by URL that is the value of the parameter.
* __app__*(deprecated)*: Enabled specific specially built features.
* __moreGames__*(deprecated)*: an older way to open CODAP with a plugin. Replaced by the `di` query parameter.

#### Developer

The following query parameters are intended to facilitate development of CODAP features or plugins.

* __boundarySpec__: specifies the URL of an alternate index file for standard Boundary files.
* __cfmBaseURL__: specifies the URL of an alternate file manager library.
* __exampleURL__: specifies the URL of an alternate index file for CODAP example documents.
* __hideSplashScreen__: if "true", omits display of splash screen when CODAP opens.
* __hideUndoRedoInComponent__: In certain modes, undo and redo buttons are displayed in component title bars. Suppresses this.
* __hideWebViewLoading__: TBD
* __pluginURL__: specifies the URL of an alternate index file for standard CODAP plugins.
