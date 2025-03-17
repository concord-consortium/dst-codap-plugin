# The CODAP Game API

<!-- toc -->

* [Introduction](#introduction)
  * [About Data Interactives](#about-data-interactives)
  * [About IFramePhone](#about-iframephone)
  * [Definitions](#definitions)
* [API Overview](#api-overview)
  * [About Data Interactive-CODAP Communication Patterns](#about-data-interactive-codap-communication-patterns)
  * [Required Dependencies](#required-dependencies)
  * [Establishing a IFramePhone link to CODAP](#establishing-a-iframephone-link-to-codap)
* [Data Interactive-Initiated Commands](#data-interactive-initiated-commands)
  * [initGame](#initgame)
    * [Custom attribute colors](#custom-attribute-colors)
    * [Preventing Display of Empty Categories](#preventing-display-of-empty-categories)
  * [logAction](#logaction)
  * [createComponent](#createcomponent)
  * [createCollection](#createcollection)
  * [createCase](#createcase)
  * [createCases](#createcases)
  * [openCase](#opencase)
  * [updateCase](#updatecase)
  * [closeCase](#closecase)
  * [deleteCases](#deletecases)
  * [requestFormulaObject](#requestformulaobject)
  * [updateFormulaObject](#updateformulaobject)
  * [requestFormulaValue](#requestformulavalue)
  * [requestAttributeValues](#requestattributevalues)
  * [reset](#reset)
  * [undoableActionPerformed](#undoableactionperformed)
* [CODAP-Initiated Actions](#codap-initiated-actions)
  * [saveState](#savestate)
  * [restoreState](#restorestate)
  * [undoAction](#undoaction)
  * [redoAction](#redoaction)
  * [clearUndo](#clearundo)
  * [clearRedo](#clearredo)

<!-- toc stop -->





## Introduction

This document is intended to aid developers of CODAP Data Interactives.
It describes the API by which Data Interactives interact with their CODAP
host environment and send data for presentation by other CODAP components.

### About Data Interactives

Data Interactives are a class of components that may be employed
in a CODAP workspace.
Their role is to provide to CODAP data for analysis.
For example, [Data Games](http://app.codap.concord.org/interactives/)
are Data Interactives that export to CODAP the internal data generated
during the execution of simple video games.
By analyzing this data students can learn how
to improve his or her performance in the game.
The [Inquiry Space project](http://concord.org/projects/inquiryspace)
created
[a number of Data Interactives](http://lab.concord.org/interactives.html)
for sensor- or simulation-based investigation of the physical world.
A student can perform an experiment and then export the data he or she
created to CODAP for immediate analysis.

Data Interactives are loosely coupled with CODAP. They can be considered to be
plug-ins in this respect.
They need not have the same origin web server as the CODAP instance in which
they are run.
They are contained in IFrames and communicate with the CODAP engine through
PostMessage-based transport.

**Note about terminology:** This API was originally defined for use in the Data
Games project.
Thus, the API refers consistently to a *game* as in *initGame* and the single
global instance of CODAP is known as DG. This may change in the near future!

### About IFramePhone

The Data Interactives API uses
[IFramePhone](https://github.com/concord-consortium/iframe-phone) as a transport
library to implement communication between an installed Data Interactive and
CODAP.
IFramePhone is a wrapper for the PostMessage API. It simplifies the
establishment of the connection and implements a simple remote procedure call
 (RPC) interface.

CODAP defines command object structures and response object structures
that are passed through the IFramePhone connectors to the CODAP instance.
In most cases, the Data Interactive initiates a command and passes a callback
to receive the response object.
Some commands are initiated from the CODAP side. The mechanics of IFramePhone
interchange are the same in either case.

### Definitions

  * **Case:** An individual record or relation.
  Cases have attributes.
  * **Attribute:** A field of a Case record.
  Cases of a given Collection all have the same set of Attributes.
  * **Collection:** A set of Cases with the same set of Attributes. Typically,
  Data Interactives will define a parent and a child Collection where zero, one,
  or many child Cases are associated with each parent case and exactly one
  parent case associate with each child case.

## API Overview

### About Data Interactive-CODAP Communication Patterns

CODAP is oriented to the handling of hierarchically structured data.
Often, the hierarchy is a natural consequence of the repetition of a
process in the Data Interactive. For example, in scientific data
interactives, the hierarchy will come about from the repetition of an
experiment.
The parent collections will describe the overall conditions and
parameters of experiments, and the child collections,
the samples taken during the execution of each experiment.
Similarly, Data Games hierarchies are built on the natural repetitions built
into game play.
A Game Data Interactive will have parent collections that represent the
conditions and outcomes of the games,
and the child collections will describe the moves or other events that occurred
during the play of an individual game.
The execution of such a program will be like this:

  * Set up environment
  * In a loop repeat:
    * Begin an experiment (or game)
    * Collect experimental samples (or game moves)
    * Conclude experiment (or game)

A Data Interactive following the above pattern would look like this:

  * *Set up environment*
    * Initialize IFramePhone connection
    * Initialize the Data Interactive in CODAP by calling *initGame*
  * *In a loop repeat*:
    * *Begin an experiment (or game)*
      * Call *openCase* to create the parent case.
        In the callback, fetch and store the case id.
    * *Collect experimental samples (or game moves)*
      * Call *createCase* to create a child case for each sample or game move.
    * *Conclude experiment (or game)*
      * Call *closeCase* to close the parent case.


### Required Dependencies

This API requires the
[IFramePhone Library](https://github.com/concord-consortium/iframe-phone.git).
It may be included in your HTML page, like this:
```html
  <script src="js/iframe-phone.js" language="javascript"></script>
```
There are no other dependencies for a Data Interactive.
The Data Interactive will be placed in an IFrame and will be a draggable,
resizable component within the CODAP workspace.

### Establishing a IFramePhone link to CODAP

As soon as possible during the initialization process of the javascript you
should initiate a communication link with the CODAP application.
This permits exchange of messages between the Data Interactive and CODAP.
Like this:

```javascript
this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(
  doCommandHandler, "codap-game", window.parent);
```

Arguments:

  * handler: a function to respond to commands initiated from CODAP, see, [CODAP-Initiated Actions](#codap-initiated-actions).
  * name: a string identifying the Data Interactive to CODAP. The value **must** be "codap-game".
  * target: the parent element. Generally you will pass *window.parent*.

Returns: an IFramePhone instance. This object has a method, *call*,
that is used to issue commands to CODAP.


## Data Interactive-Initiated Commands

The command-specific arguments are documented by example in the sections
below.
Many of the examples are taken from the
[GuessMyNumber game](https://github.com/concord-consortium/codap-data-interactives/tree/master/GuessMyNumber),
which is a simple game used primarily for development purposes.
Command object generally look like this:

```javascript
{
  action: 'commandName',
  args: {JavaScript object containing command-specific arguments}
}
```

Response objects look like this:

```javascript
{
  success: [true/false indicating success/failure]
  ... optional additional properties ...
}
```

### initGame

Provides initial information about the interactive to CODAP. Called when an
interactive is first selected by the user.
```javascript
this.codapPhone.call({
    action: 'initGame',
    args: {
        name: "Guess My Number",
        version: "1.1",
        dimensions: { width: 400, height: 250 },
        collections: [
          {
            name: "Games",
            attrs: [
              { name: "game", type: 'numeric', description: "The game number", precision: 0 },
              { name: "guesses", type: 'numeric', description: "The number of guesses", precision: 0 }
            ],
            childAttrName: "Trials",
            labels: {
              singleCase: "game",
              pluralCase: "games",
              singleCaseWithArticle: "a game",
              setOfCases: "match",
              setOfCasesWithArticle: "a match"
            }
          },
          {
            name: "Trials",
            attrs: [
              { name: "trial", type: 'numeric', description: "The trial number", precision: 0 },
              { name: "guess", type: 'numeric', description: "The number guessed", precision: 0 },
              { name: "result", type: 'nominal', description: "The result of the trial" }
            ],
            labels: {
              singleCase: "trial",
              pluralCase: "trials",
              singleCaseWithArticle: "a trial",
              setOfCases: "game",
              setOfCasesWithArticle: "a game"
            },
            defaults: {
              xAttr: "trial",
              yAttr: "guess"
            }
          }
        ],
      doCommandFunc: GuessMyNumber.doAppCommand
    }
  },
  callback
);
```
Note that all properties of an attribute are optional except the name.

The return value provided to the callback is a JavaScript object of the form:

```javascript
{
  success: [true|false indicating success/failure]
}
```
#### Custom attribute colors

To set the graph legend's colors on a per-attribute or per-category basis,
add the 'colormap' parameter to 'initgame' for any attributes that need
custom colors.  
Uses hex RGB color values or
[color names](http://www.w3.org/TR/css3-color/#svg-color).

```javascript
[
  {
    name: "IsAccepted" ,
    type: "nominal" ,
    description: "Is piece an acceptable length?",
    colormap: {
      "Yes": 'green', 	// kAcceptString
      "No-Short": 'red',	// kRejectShortString
      "No-Long": 'red',	// kRejectLongString
      "Remnant": 'yellow'	// kRemnantString
    }
  },{
    name: "Log",
    type: "numeric",
    precision: 0,
    description: "Log number",
    colormap: {
      'attribute-color': '#6f4900'  // brown
    }
  }
]
```
The order in which values are listed in the color map will also determine the order they appear in the legend and on a categorical axis.

#### Preventing Display of Empty Categories

In some situations categories may be specified for which there are no corresponding cases and in which the display of those categories in a legend or on an axis is undesirable. To prevent display, set blockDisplayOfEmptyCategories to true.
```javascript
[
  {
    name: "Marital_status" ,
    type: "nominal" ,
    description: "The person's marital status",
    colormap: {
      "Single/Never Married": 'green',
      "Married": 'blue',
      "Divorced": 'lightblue',
      "Widowed": 'brown'
    },
    blockDisplayOfEmptyCategories: true
  }
]
```

### logAction

Logs the specified action (generally a user action).
These log messages are captured by the server and can be retrieved
using several log-access utilities.

Arguments:

* **formatStr**: Format string for the log statement. Use %@ for replaceable
parameters.
The format string follows SproutCore string format conventions, so %@1 can be
used for specific identification, etc.
* **replaceArgs**: Array of values used to replace %@ instances in formatStr

```javascript
this.codapPhone.call({
    action: 'logAction',
    args: {
      formatStr: "User set temperature to '%@'",
      replaceArgs: [ theNewTemperature ]
    }
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure]
}
```

### createComponent

Creates a new component, e.g. a case table or graph.
This can be used to create a default set of components when a particular
interactive or simulation is viewed.
A similar effect can also be achieved by saving a document that references a
particular interactive with a particular set of components in it,
but this can
be used when the document method is undesirable for some reason.

```javascript
this.codapPhone.call( {
    action: 'createComponent',
    args: {
      type: 'DG.TableView',  // or 'DG.GraphView', 'DG.SliderView', 'DG.TextView', 'DG.CalculatorView'
      log: false
    }
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure]
}
```

### createCollection

Creates a new collection with the specified attributes.\\
Most interactives don't need to use this command as they can specify their
collections in the 'initGame' command. For "games" which determine the
properties of their collections at runtime, however,
this command allows them
to delay the specification of the collection properties. For instance, the
"Importer" game uses this technique to create a collection whose properties
are derived from the imported data.

```javascript
this.codapPhone.call( {
    action: 'createCollection',
    args: {
      name: 'Logs',
      caseName: 'Log',
      attrs: [{ name: 'cases' }],
      childAttrName: "import",
      log: false
    }
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
  collectionID: [ID of the newly created collection]
}
```

### createCase

Creates a new case -- generally a child case in a hierarchical data model.
This command has been deprecated in favor of the 'createCases' command.
Clients are encouraged to batch up multiple cases where possible, with the
proviso that all cases must be children of the same parent case.

```javascript
this.codapPhone.call( {
    action: 'createCases',
    args: {
      collection: "Guesses",
      parent: this.openRoundID,
      values: [
        [ this.trialNum[0], this.guess[0], this.result[0] ]
      ]
    }
  },
  callback
);
```

Note that the data values are currently specified as an array of arrays of
values, where the values are assumed to be in the same order as the order in
which the attributes were listed in the collection in the call to 'initGame'
or 'createCollection'.

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
  caseID: [ID of the first newly created case],
  caseIDs: [Array of IDs for the newly created cases]
}
```

### createCases

Creates new cases -- generally child cases in a hierarchical data model.
The 'createCase' command for creating a single case has been deprecated in
favor of this command which has performance as well as convenience advantages.
Clients are encouraged to batch up multiple cases where possible, with the
proviso that all cases must be children of the same parent case.

```javascript
this.codapPhone.call( {
    action: 'createCases',
    args: {
      collection: "Guesses",
      parent: this.openRoundID,
      values: [
        [ this.trialNum[0], this.guess[0], this.result[0] ],
        [ this.trialNum[1], this.guess[1], this.result[1] ],
        [ this.trialNum[2], this.guess[2], this.result[2] ],
        ...
      ]
    }
  },
  callback
);
```

Note that the data values are currently specified as an array of arrays of
values, where the values are assumed to be in the same order as the order in
which the attributes were listed in the collection in the call to 'initGame'
or 'createCollection'.

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
  caseID: [ID of the first newly created case],
  caseIDs: [Array of IDs for the newly created cases]
}
```

### openCase

Creates a new case -- generally a parent case in a hierarchical data model.
Requires a subsequent call to 'closeCase' once any child cases have been
completed. (Although the data model nominally supports hierarchical data of
any depth, the components in the CODAP application currently only support data
models with two levels.)
```javascript
this.codapPhone.call({
    action: 'openCase',
    args: {
        collection: "Rounds",
        values: [
          this.gameNum,
          this.trialNum
        ]
    }
  },
  callback
);
```
Note that the data values are currently specified in an array, which is
assumed to be in the same order as the order in which the attributes were
listed in the collection in the call to 'initGame'.

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
  caseID: [ID of the newly created case]
}
```

Note that the returned caseID may be used in subsequent calls to create
child cases.

### updateCase

Updates the values in an open parent case. This can be used to update the
values of the parent case, such as an interactive, during the running of the
interactive. For instance, the Score could update as partial progress is
 achieved.
```javascript
this.codapPhone.call({
    action: 'updateCase',
    args: {
        collection: "Rounds",
        caseID: this.openRoundID,
        values: [
            this.gameNum,
            this.trialNum
        ]
    }
},
callback);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
}
```

### closeCase

Completes a parent case previously started with a call to 'openCase'.
Can update any values that were not specified with the 'openCase' and/or
which may have changed since the call to 'openCase' or the last call
to 'updateCase'.

```javascript
this.codapPhone.call({
    action: 'closeCase',
    args: {
      collection: "Rounds",
      caseID: this.openRoundID,
      values: [ this.gameNum, this.trialNum ]
    }
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
}
```

### deleteCases

Deletes a collection of cases. If a case is a parent case, will also delete
all this case's child cases.

```javascript
this.codapPhone.call({
    action: 'deleteCases',
    args: {
      collection: "Rounds",
      caseIDs: [this.openRoundID],
    }
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
}
```

### requestFormulaObject

The interactive issues this command when CODAP should present a formula-edit
dialog for entry of a formula.

The arguments to the command are:
* **output:** the name of the attribute for the result of the formula
* **inputs:** array of input variables, i.e. names that can be used in the
formula
* **descriptions:** capsule descriptions of each of the input variables

```javascript
this.codapPhone.call({
    action:'requestFormulaObject',
    args: {
      title: "Autoplay Strategy: A Formula for Push",
      description: 'some text',
      output: 'push',
      inputs: [ 'padRight'],
      descriptions: [ 'right edge of scoring pad'],
      allow_user_variables: false
    }
  },
  callback
);
```
The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
}
```

### updateFormulaObject

The interactive issues this command to alter the values of a previously
created formula.

The arguments to the command are:
* **output:** the name of the attribute for the result of the formula
* **inputs:** array of input variables, i.e. names that can be used in the
formula
* **descriptions:** capsule descriptions of each of the input variables

```javascript
this.codapPhone.call({
    action:'updateFormulaObject',
    args: {
      title: "Autoplay Strategy: A Formula for Push",
      description: 'some text',
      output: 'push',
      inputs: [ 'padRight'],
      descriptions: [ 'right edge of scoring pad'],
      allow_user_variables: false
    }
  },
  callback
);
```
The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
}
```

### requestFormulaValue

Calculates the value of the formula given the specified values of the
input variables.

```javascript
this.codapPhone.call({
    action:'requestFormulaValue',
    args:{
      output: 'push',
      curStart: 10,
      start1: 10,
      end1: 100,
      push1: 50,
      padLeft: 100,
      padRight: 150
    }
  },
  callback
)
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
  outputName: [the computed value of the formula;
               note that the name of the property
               is the value of the "output" passed in],
  formula: [a string representation of the formula]
}
```

### requestAttributeValues

Returns the values of the specified attributes for the specified case.

```javascript
CODAP.doCommand({
    action: 'requestAttributeValues',
    args: {
      collection: "Games",
      caseID: this.openGameID,
      attributeNames: [ this.gameNum, this.score ]
    }
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure],
  values: [array of values corresponding to attributeNames argument, in same order]
}
```

### reset

Resets the data context.
This is used when the Data Interactive needs to invalidate the
existing collections and the component displays based on the collections.
For example, if a Data Interactive is interactively filtering a
larger data set for display in CODAP, then the new filter configuration may
invalidate certain attributes, or cases.
The reset command causes the collections to be dropped on the
assumption that they will be reintroduced in a possibly changed form.

```javascript
CODAP.doCommand({
    action: 'reset'
  },
  callback
);
```

The return value provided to the callback is a JavaScript object of the form:
```javascript
{
  success: [true|false indicating success/failure]
}
```

### undoableActionPerformed

Notifies CODAP that the DI has performed an undoable action. This is used when the DI expects CODAP
to take control over undoing and redoing actions.

No arguments are sent, CODAP simply adds a "data interactive undoable action" to its undo stack, and
when a user clicks Undo and Redo at the appropriate point in the stack, CODAP sends `undoAction` or
`redoAction` to the DI as appropriate. The Data Interactive is responsible for maintaining its own
undo stack, CODAP is simply responsible for initiating the undo or redo events.

```javascript
CODAP.doCommand({
    action: 'undoableActionPerformed',
    args: {
        logMessage: 'Optional message to be logged'
    }
  }
);
```

## CODAP-Initiated Actions

The IFramePhone-based API is entirely symmetric.
It is a full duplex channel.
The mechanism for CODAP-initiated actions is the same as for
Data Interactive-initiated actions.
The request is encapsulated in a command object,
and the requester receives replies asynchronously through a callback.

The Data Interactive should register a dispatch function by providing it as an argument when initiating IFramePhone. Like this:

```javascript
this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(requestHandler, "codap-game", window.parent);
```
Here, 'requestHandler' is a function that will be called to handle requests from CODAP.

The form of the callback function looks like this:

```javascript
function requestHandler( iCommand, callback) {
  switch( iCommand.operation) {
    case 'saveState':
      callback(cartGame.model.saveState());
      break;
    case 'restoreState':
      callback(cartGame.model.restoreState( iCommand.args &&
        iCommand.args.state));
      break;
    default:
  }
}
```
We see that the requestHandler function is passed a callback.
It should be called with the results of executing the command handler.

If the Data Interactive has persistent state,
it should implement a request handler that dispatches to implementation of
saveState and restoreState functions.
If it does not have persistent state,
it need not implement a request handler at this time.
The requests from CODAP will be ignored.

### saveState

CODAP will send a save state command when it needs to persist a
CODAP Document.
The command object looks like this:

```javascript
{
  operation: 'saveState'
}
```

CODAP expects the reply as an object like this:

```javascript
{
  success: [true|false],
  state: { a JSON blob }
}
```
The contents of the state property should be valid JSON.
It is entirely in the purview of the Data Interactive to
define the contents of this JSON.

### restoreState

CODAP will call this method after it has instantiated the
Data Interactive and received an initGame request from the Data Interactive.
The command object looks like this:

```javascript
{
  operation: 'restoreState',
  state: { a JSON blob}
}
```

CODAP expects a reply object like this:

```javascript
{
  success: [true|false]
}
```

### undoAction

CODAP will send an Undo Action command when the user has initiated Undo and the
current undoable action was an action sent by the Data Interactive (using `undoableActionPerformed`).

```javascript
{
  operation: 'undoAction'
}
```

CODAP expects the reply as:

```javascript
{
  success: [true|false]
}
```

If the DI did not successfully undo the action and returned `false`, CODAP will assume that its
undo stack is in an error state, and clear the stack.

### redoAction

CODAP will send an Redo Action command when the user has initiated Redo and the
current redoable action was an action sent by the Data Interactive (using `undoableActionPerformed`).

```javascript
{
  operation: 'redoAction'
}
```

CODAP expects the reply as:

```javascript
{
  success: [true|false]
}
```

If the DI did not successfully redo the action and returned `false`, CODAP will assume that its
undo stack is in an error state, and clear the stack.

### clearUndo

CODAP will send an `clearUndo` when it clears its own undo stack. If CODAP is managing the initiation
of undoable actions, then at this point there will be no way to access the DI's undo stack. CODAP
informs the DI of this so that it can clear its own stack if desired.

```javascript
{
  operation: 'clearUndo'
}
```

### clearRedo

CODAP will send an `clearRedo` when it clears its own redo stack. If CODAP is managing the initiation
of undoable actions, then at this point there will be no way to access the DI's redo stack. CODAP
informs the DI of this so that it can clear its own stack if desired.

```javascript
{
  operation: 'clearRedo'
}
```