1. In codap-data-interactives repo `master` branch:  
   1. Add an object for the plugin you want to add into the data-interactives-map.json file. If the value for `”isStandard”` is `true`, the object will automatically be added to the `published-plugins.json` file.  
      Example:   
         `{`  
           `"title": "Transformers",`  
           `"description": "Transform datasets with a collection of powerful tools",`  
           `"title-string": "DG.plugin.Transformers.title",`  
           `"description-string": "DG.plugin.Transformers.description",`  
           `"width": 350,`  
           `"height": 450,`  
           `"icon": "/codap-transformers/transformers-icon-small.svg",`  
           `"path": "/codap-transformers/",`  
           `"visible": "false",`  
           `"isStandard": "true",`  
           `"categories": [`  
             `"Partners",`  
             `"Tools"`  
           `]`  
         `}`  
        
   2. In the `bin/build` file, you need to add the plugin folder to the appropriate variable:  
      1. If adding a non-React plugin, add the containing folder to the `STATIC_PLUGIN_DIRS` variable.  
      2. If adding a React plugin, add the containing folder to the `BUILT_PLUGIN_DIRS` variable.  
   3. Delete the `target` folder in the codap-data-interactives repo.  
   4. In a terminal window, type `”bin/buid”` or `”npm run std:build”`. This should re-build the `target` folder.  
   5. Once build is done, open the `target` folder and check to see if the plugin you added to the published-plugins.json appears in the folder.  
2. In the `codap` repo:  
   1. Add a similar object  to the one you added in the `data-interactives-map.json` to the appropriate submenu array in the `apps/dg/resources/json/hierarchical_plugins.json` object  
3. To make the interactive appear in the codap-data-interactive-website. In the codap-data-interactives repo:  
   1. Make sure you have added the plugin object into the data-interactive-map.json.  
   2. Checkout \`gh-pages\` branch. Merge `master` branch to `gh-pages` branch  
   3. In a terminal window, type `”npm run build”`  
   4. Push changes to github.  
   5. You may have to wait 15-30 minutes for the codap-data-interactives pages to update with your changes.  
      