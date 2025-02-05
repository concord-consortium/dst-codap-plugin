import React from "react";

export function AboutTab() {
  return (
  <>
    <div>
      About the Space-Time Cube...
    </div>
    <button onClick={() => window.location.reload()}>Reload the plugin</button>
  </>
  );
}
