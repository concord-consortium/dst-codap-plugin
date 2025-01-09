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
- models/data/data-set-conversion used by:
  - models/data/data-set.ts
- models/formula/formula used by:
  - components/data-display/models/data-configuration-model.ts
  - models/data/attribute.ts
  - models/data/data-set.ts
- models/formula/attribute-formula-adapter used by:
  - models/data/data-set-utils.ts
- models/formula/filter-formula-adapter used by:
  - models/data/data-set-utils.ts
- models/history/apply-model-change used by:
  - models/data/attribute.ts
  - models/data/data-set-utils.ts
  - models/data/data-set.ts
- models/history/without-undo used by:
  - models/data/attribute.ts
  - models/data/data-set.ts
- models/shared/shared-case-metadata used by:
  - components/data-display/models/data-configuration-model.ts
- models/shared/shared-case-metadata-constants used by:
  - components/data-display/models/data-configuration-model.ts
- models/shared/shared-data-utils used by:
  - models/data/data-set-utils.ts


Tasks to remove errors:
- See if we can make a tile-less version use-drag-drop
- look at the shared case metadata: how is it used? can we bring in a version of it without bringing in the shared model system which depends on the tile system?
- look at shared-data-utils, maybe it would be OK to bring this in, but probably it is about the shared model system. data-set-utils uses it to get the shared case metadata from the dataset.
- look at the formula system: do we need it? can we make it a service so data-configuration-model can look it up and handle the case where it isn't available?
- look at apply-model-change: can we make it a service that is basically a no-op in the plugin?
- look at without-undo: can we make it a service that is basically a no-op in the plugin?
- look at data-set-notifications: the plugin shouldn't need to do this so can it be made a service?
- try to isolate data-set-conversion so plugins using the data-set model don't need to worry about conversion? Or perhaps they should because the data-set is transferred in v2 format??
- bring in concord consortium MST so IOnActionOptions is supported, or perhaps the functions in mst-utils using it are not needed in the plugin so then split out the required functions from mst-utils

Tasks to reduce unneeded code:
- make translation a service so plugins using shared code don't need to a copy of the full set of translations
- make url params a service so the plugin can provide just the url params required by the codap code or perhaps none at all
