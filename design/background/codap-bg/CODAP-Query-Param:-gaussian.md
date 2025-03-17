The `gaussianFit` query parameter changes the **Normal Curve** option when a histogram is displayed to **Gaussian Fit**.

A gaussian fit curve finds the mean and standard deviation for the normal curve that produces the least sum of squares of residuals computed for each of the center-tops of the displayed histogram with the constraint that the area under the curve is the total sample count. The parameters for this curve will typically differ from those obtained from the sample data values and they depend somewhat strongly on the bin width and alignment of the histogram.

(Provided by the *Developing Simulations with Noise* project at PhET, University of Colorado at Boulder and the Concord Consortium. Research sponsored by the National Science Foundation, award number 2142356.)

## Usage

Takes a value of 'yes' or 'no'. Default is 'no'. The **Gaussian Fit** is available if the query parameter has a value of 'yes'.

## Example

   https://codap.concord.org/app?gaussianFit=yes

