The `componentMode` suppresses many of the "application" features of CODAP.
It is meant for displaying a document with a single component, such as a graph or case table, in an IFrame in an html page.
The displayed component is active and can be manipulated in the usual ways, but the component cannot be moved.
Undo and redo buttons are presented on the component's title bar.

## Usage

Takes a value of 'yes' or 'no'. Default is 'no'. Component mode is active if the query parameter has a value of 'yes'.

## Example

   https://codap.concord.org/releases/latest?url=some-codap-document&componentMode=yes


