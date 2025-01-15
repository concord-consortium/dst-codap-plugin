Script to update the src/codap folder in the dst-plugin:
`rsync -av --existing --delete ../codap/v3/src/ src/codap/`
To be complete after an update you need to review all of the files and see if the problem files list below needs to be updated.

We are trying to avoid bringing in the tile infrastructure.

Problem files:
- data-interactive/data-interactive-type-utils used by:
  - models/data/data-set-notifications.ts
- hooks/use-drag-drop used by:
  - components/axis/components/axis-or-legend-attribute-menu
  - components/data-display/components/legend/multi-legend
  - hooks/use-drop-hint-string
- `linkTileToDataSet` in shared-data-utils.ts needs `ITileModel` (we are trying to avoid that)
- `getGlobalValueManager` in tile-environment.ts needs global value manager stuff, it should be moved out of the tile environment file. It is just a specific shared model. 

Tasks to remove errors:
- See if we can make a tile-less version use-drag-drop
- shared-data-utils depends on the tile system
- look at data-set-notifications: the plugin shouldn't need to do this so can it be made a service?
- separate out linkTileToDataSet from shared-data-utils
- move getGlobalValueManager out of tile-environment

Tasks to reduce unneeded code:
- make translation a service so plugins using shared code don't need to a copy of the full set of translations
- make url params a service so the plugin can provide just the url params required by the codap code or perhaps none at all

Ideas:
Handling the conversion of types to v2 format in the notifications.
This can be done with a notification-service like the history service.
It can provide methods for converting/processing/exporting cases and attributes

Service to implement `getSharedCaseMetadataFromDataset` in the plugin this can just return a singleton. In the app it will use the sharedModelManager. Or we could just use the sharedModelManager for this. The sharedModelManager is already a service that is found by looking at the environment of the dataset. The problem with this is that it is called TileEnvironment. I guess if we hold our nose with the name for the time being. We could use this same approach to break the dependency with the actual tile system. 
- The notify and log properties of the tile-environment we already handled because it is used applyModelChange which works with several other things.
- If we leave them there we need to update the types of notify to be the non iframePhone types
- The log method uses ILogMessage which brings in analytics which references all of the tile types, but we've already brought that in.
- The formulaManager is harder. It doesn't have a simple interface. We are going to have to deal with it in some way already though. So I guess I need to look at that before figuring how to deal with the sharedModelManager.

Try moving the formula methods used by the Formula model into the FormulaManager. This would allow the Formula model to be used to load and save state even when a full formula engine wasn't available. These methods are:
- isRandomFunctionPresent
- preprocessDisplayFormula
- parse (from mathjs)

The AttributeFormulaAdapter and FilterFormulaAdapters are just registered by data-set-utils. So these registrations can be moved to a different file. Perhaps document.ts where the history service is registered. Or maybe app.tsx is better that is where `shared-case-metadata-registration`, `shared-data-set-registration`, and `registerTileTypes()` is done. The downside is that any tests that just use data-set-utils directly or indirectly will have to be updated.

This could be moved to where ever the FormulaManager is added. Or where the 
This doesn't address the use of filter-formula-adapter. This adapter


Formula Adapter system abstract definition:
Tile types basically define a list of formulaAdapter classes they support via the `getFormulaAdapter` method on registerTileContentInfo. This method returns a list of formula adapter instances for the document of the passed in MST node.

Adapter classes have to be registered globally. When a document is created all of the globally registered adapters are created and added to a formulaManager instance associated with that document.

Some of these adapter classes are registered by tiles themselves like in `graph-registration`
Other adapter classes are registered independently from a tile type. For example `plotted-function-adornment-registration`.

The DataDisplayContentModel which has a 1:1 relationship with Graph and Map tile instances provides a `formulaAdapters` method returns all of the formula adapter instances that the specific Tile model supports. This `formulaAdapters` method is used by Graph and Map tiles to add themselves to each of the formulaAdapters with the addContentModel method.

The intention as described by Kirk is that the formula adapter can have knowledge of the tile content model. For example: BaseGraphFormulaAdapter knows about IGraphContentModel and it is extended by PlottedFunctionFormulaAdapter and PlottedValueFormulaAdapter. 

However the tile content model itself is not supposed to have knowledge of the formula adapters. But in practice the graph-registration, which is closely associated with the graph content model, does directly depend on the Plotted*FormulaAdapterS. 
I believe the circular dependency that caused this abstraction to be added was:
MapFilterFormulaAdapter -> IMapContentModel -> MapFilterFormulaAdapter
This was needed when the MapContentModel needed to get the map filter formula adapter to add it self to it as a content model.

One possible way to simplify this would be for the the formula adapters to just search the document for all of the tiles which are the correct type. This would remove the need for the addContentModel on the adapter interface. However the adapters will need to know which MST tree/document they are in so they can find their own content models.


Implementation:
- Some Adapter classes defines static get(mstNode) 
  - Which gets formulaManager from the node's context
  - Gets all of the adapters on the formulaManager
  - returns the adapter instance that has a type matching the current adapter
- Some Tile types register a getFormulaAdapters(mstNode) function
  - Which returns a list of adapter instances supported by the tile type
  - these are found by calling the `get` method defined above with the mstNode
When the 