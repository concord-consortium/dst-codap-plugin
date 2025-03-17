The `guideIndex` query parameter selects a section of the guide for the initial CODAP document.
It is meant for when a CODAP document is used in multiple steps of a lesson sequence.
It permits the same document to be employed, but with the instructions varying with each separate invocation.

## Usage

Specify the index of the Guide section you want to open as the value of this query parameter. 
The index is a number corresponding to the desired Guide section in the section list.
Indices are numbered starting with zero, so "0" requests the first section, "1" the second, and so on.

## Example

   https://codap.concord.org/releases/latest?url=some-codap-document&guideIndex=1


