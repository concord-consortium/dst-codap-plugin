The `ICI` query parameter makes available a boxplot option, **Show ICI**, to display an "informal confidence interval."

The informal confidence interval (ICI) is a concept developed and used in New Zealand's math and statistics curriculum. See [Sample-to-population inference progressions across senior curriculum](https://new.censusatschool.org.nz/wp-content/uploads/2012/11/Sample-to-Population-Inference-progressions-v2c.pdf) for Level 7 learning objectives. Given a distribution of numeric values, the ICI is defined the 1.5 * the interquartile range (IQR) divided by the square root of the sample size. The interval is the median ± the ICI. In comparing two distributions, if their ICIs don't overlap, one can reasonably conclude that the populations from which they are drawn have different medians.

## Usage

Takes a value of 'yes' or 'no'. Default is 'no'. The **Show ICI** boxplot options is available if the query parameter has a value of 'yes'.

## Example

   https://codap.concord.org/releases/latest?ICI=yes