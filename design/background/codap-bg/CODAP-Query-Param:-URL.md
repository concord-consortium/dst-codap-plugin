The `url` query parameter provides a means to specify a starting
document. 
CODAP will read the resource identified by the query parameter. 
If it is a CODAP document or CSV or tab-delimited text file it
will use the contents to set CODAP's initial state.

Note that browser security rules may prevent this feature from
working as expected. 
For example, browsers prevent web applications from opening URLs with
the "file:" scheme.
Some web servers will prevent resources from being retrieved from
web applications that were served from other originating servers.

## Usage

Takes a value that is a valid URL.

## Example

```
  https://codap.concord.org/releases/latest/static/dg/en/cert/index.html?url=https://concord-consortium.github.io/codap-data/SampleDocs/Mathematics/Probability/markov/Markov_Sample.json
```