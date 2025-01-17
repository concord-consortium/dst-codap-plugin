Script to update the src/codap folder in the dst-plugin:
`rsync -av --existing --delete ../codap/v3/src/ src/codap/`
To be complete after an update you need to review all of the files and see if the problem files list below needs to be updated.

We are trying to avoid bringing in the document and top level tile infrastructure.
TileContentModel and SharedModel are included to because they don't bring in many other dependencies and it was too hard to keep them out.

Tasks to reduce unneeded code:
- make translation a service so plugins using shared code don't need to a copy of the full set of translations
- make url params a service so the plugin can provide just the url params required by the codap code or perhaps none at all

Cleanup tasks:
- remove the tileId stuff from the notification system since it isn't needed anymore.
- use a more basic test history service in the CODAP tests instead of the AppHistoryService
