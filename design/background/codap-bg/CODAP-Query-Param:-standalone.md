The `standalone` query parameter opens CODAP in standalone mode. This mode is one of the ways of using the features of CODAP with CODAP in a subordinate role. A plugin is made to occupy the entire CODAP workspace. CODAP graphs, tables, and other components can be opened and positioned where the standalone plugin desires.

## Usage

Takes a value of `true` or `false` or the name of the standalone plugin. The name of the standalone plugin is the name or title specified by the plugin when it initiates its connection with CODAP. Use 'true' when there will only ever be one plugin in the standalone instance of CODAP. Specify the name when there could be more than one plugin (a Guide page counts as a plugin).

## Example
```
https://codap.concord.org/releases/latest?standalone=my plugin&di=https://example.org/myplugin.html
```
