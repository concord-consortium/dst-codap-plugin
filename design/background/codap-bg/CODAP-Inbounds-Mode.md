CODAP in-bounds mode is designed to keep Components onscreen or within the boundaries of the container view as well as scaling and repositioning Components to maintain (when possible) the original Component layout within a loaded Document. 

## Enabling In-Bounds Mode

Use the URL parameter inbounds=true to turn on in-bounds mode.  
example: https://codap.concord.org/releases/latest/static/dg/en/cert/index.html?inbounds=true

## Rules When Using In-Bounds Mode

- When moving or resizing a Component, no portion of the Component (including the Inspector) can be positioned or sized so that it is outside the boundaries of the container view. 

- When a Document is loaded, Target Bounds are computed from the maximum height and width needed to display all visible Components.

- When a Component is positioned or sized such that any portion of the Component is outside the current Target Bounds, new Target Bounds are computed from the maximum height and width needed to display Components.
example: original layout has Target Bounds 1000 x 1000, container view has size 1200 x 1200, Component is positioned so that its right edge is at x = 1100.  New target bounds is computed as 1100 x 1000.

- When a Component is positioned or sized such that the Component is within the current Target Bounds, no new Target Bounds are computed.
example: original layout has Target Bounds 1000 x 1000, container view has size 1100 x 1100, rightmost Component is positioned so that its right edge is at x = 900.  Target bounds remain 1000 x 1000.

- If the Component container view height or width is smaller than the target bounds height or width (for example, user resizes browser hence shrinking the size of the container view), then Component positions and sizes are rescaled to keep Components within the boundaries of the container view and to maintain the Document layout. 
example: original layout has target bounds 1000 x 1000, but browser is resized so container view is 900 x 900.  Components are rescaled and repositioned to accommodate new container view size.
