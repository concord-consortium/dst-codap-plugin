Script to update the src/codap folder in the dst-plugin:
`rsync -av --existing --delete ../codap/v3/src/ src/codap/`

We are trying to avoid bringing in the document and top level tile infrastructure.
TileContentModel and SharedModel are included because they don't bring in many other dependencies and it was too hard to keep them out.

Tasks to reduce unneeded code:
- make translation a service so plugins using shared code don't need a copy of the full set of translations
- make url params a service so the plugin can provide just the url params required by the codap code or perhaps none at all

Cleanup tasks:
- remove the tileId stuff from the notification system since it isn't needed anymore.
- use a more basic test history service in the CODAP tests instead of the AppHistoryService
