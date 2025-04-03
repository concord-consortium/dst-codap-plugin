import React from "react";

import "./about-tab.scss";

export function AboutTab() {
  return (
    <div className="about-tab">
      <h4>About</h4>
      <p>
        This plug in is designed for exploration of spatiotemporal data. In order for the plug in to work properly, a dataset must contain an attribute for Time and two attributes for Latitude and Longitude, as well as any measures you would like to show within the cube. You will be able to select which attribute to show, and will have two optional legends to further characterize data with size of dots and color of dots.
      </p>
      <h4>Acknowledgements</h4>
      <p>
        This material is supported by the <a href="https://concord.org/our-work/research-projects/data-in-space-and-time/" rel="noreferrer" target="_blank">Data in Space and Time project</a> at the Concord Consortium. It is based on work supported by the National Science Foundation under Grant No. DUE-2201154. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the National Science Foundation.
      </p>
    </div>
  );
}
