# Tutorial—A CODAP Data Interactive for Generating Random Numbers

**Caution: This tutorial uses the CODAP Game API, which is deprecated. Developers of new Data Interactives should consider employing the [CODAP Data Interactive API](https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API).**

In this tutorial we create an extremely simple data interactive that generates random numbers that appear as samples of numbers in CODAP. Simple as it is, playing with the result can be remarkably informative about sampling. And it's a good starter for more complex simulations.

We'll put everything in a single HTML file, but you may want to break out the Javascript into its own file. The finished file is [here](http://concord-consortium.github.io/codap-data-interactives/RandomNumbers/RandomNumbers.html "RandomNumbers"). If you follow the link, you'll see that the interactive refuses to do anything until you embed it in CODAP.

## The Head

Here are the first 11 lines of HTML:

    <!--This page is an example simulation for CODAP.
        When embedded in CODAP it will generate samples of random numbers.-->
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <!--These two scripts take care of the communication with CODAP-->
        <script src="http://concord-consortium.github.io/codap-data-interactives/Common/js/iframe-phone.js" language="javascript"></script>
        <script src="http://concord-consortium.github.io/codap-data-interactives/Common/js/codap_helper.js" language="javascript"></script>
        <title>Random Numbers</title>
    </head>

The only things of interest here are the two references to remotely stored Javascript files: `iframe-phone.js` and `codap_helper.js`. To understand their use we need some background about how a data interactive gets embedded in CODAP.

## Embedding iFrames

An iFrame is a web page whose content is encapsulated in a host web page. As long as the iFrame doesn't need to communicate with its host, nothing special needs to be done. But that's not the situation we have here. Our simulation will want to pass numbers to CODAP, its host.

The purpose of `iframe-phone.js` is to open up a communication channel with CODAP using a technology called _postMessage_. We don't have call anything in `iframe-phone` because there is a _helper_.

## The CODAP Helper

CODAP only understands a few things and the embedded data interactive has to know how to say them. The `codap_helper` provides a nice interface for simulations like ours to use. These are `checkForCODAP`, `initSim`, `openCase`, `closeCase`, `createCase`, and `createCases`.

## The Body

The body is short and sweet. We set the background color because if we don't it will be transparent. And that looks bad in CODAP. We set the action of clicking the button to be `generateNumbers`, a Javascript function we'll soon meet.

    <body bgcolor="white">
    <h1>Random Numbers</h1>
    <form name="form1">
        How many numbers: <input type="text" name="howMany" value="10"><br>
        <input type="button" onClick="RandomNumbers.generateNumbers();" value="Generate Them!">
    </form>
    </body>

## The Script

Between the opening `<script>` and closing `</script>` lies the the Javascript that drives our simulation.

### Getting Started—`codapHelper.initSim`

The code below gets executed as the page loads. Its purpose is to inform CODAP of the structure of the data and a few other odds and ends.

    codapHelper.initSim({
        name: 'Random Numbers',
        dimensions: {width: 300, height: 150},
        collections: [  // There are two collections: a parent and a child
            {
                name: 'samples',
                // The parent collection has just one attribute
                attrs: [ {name: "sample", type: 'categorical'}],
                childAttrName: "sample"
            },
            {
                name: 'numbers',
                labels: {
                    pluralCase: "numbers",
                    setOfCasesWithArticle: "a sample"
                },
                // The child collection also has just one attribute
                attrs: [{name: "number", type: 'numeric', precision: 1}]
            }
        ]
    });

Notice there are not one, but two, collections: one named 'samples' and another named 'numbers.' Each time you press the button you get a new sample with as many random numbers as are specified. The 'sample' attribute is specified as categorical so it will make groups when placed on a graph axis.

### The RandomNumbers Object

The work of the simulation, what little there is, is done by this simple Javascript object with one property to keep track of the sample number and a function to generate the random numbers.

    var RandomNumbers = {
        sampleNumber: 0,

        // Here is the function that is triggered when the user presses the button
        generateNumbers: function () {
            // If we're not embedded in CODAP, we bring up an alert and don't draw the sample
            if( !codapHelper.checkForCODAP())
                return;

            // This function is called once the parent case is opened
            var doSample = function( iResult) {
                var tID = iResult.caseID,
                    tHowMany = document.forms.form1.howMany.value.trim(),

                addOneNumber = function() {
                    if( tHowMany > 0) {
                        var tRandom = Math.random() * 100 + 1; // Choose a random number between 1 and 100
                        // Tell CODAP to create a case in the child collection
                        codapHelper.createCase('numbers', tRandom, tID, addOneNumber);
                        tHowMany--;
                    }
                    else codapHelper.closeCase('samples', null, tID);
                };

                addOneNumber(); // This starts an asynchronous recursion
            };

            // generateNumbers starts here
            this.sampleNumber++;
            // Tell CODAP to open a parent case and call doSample when done
            codapHelper.openCase( 'samples', this.sampleNumber, doSample);
        }
    };

Communication between an iFrame and its host is inherently asynchronous. The iFrame tells CODAP to do things but has no control over *when* they get done. Consider the line:

    codapHelper.openCase( 'samples', this.sampleNumber, doSample);

The simulation (through codapHelper) is telling CODAP to open a new case in the `samples` collection and to stash the current `sampleNumber` there. *And* when done, come back and execute the callback function `doSample`. The great thing about the use of callbacks is that our simulation can relinquish control and allow CODAP and the browser to update the screen. This is why we can see the the points get added to the graph in a sequence rather than all at once.

Notice that the first thing `doSample` does is to stash `iResult.caseID`, the ID of the newly created sample case, in a local variable. We have to use this ID when we tell CODAP to add a new number to the numbers collection. The second thing `doSample` does is to call `addOneNumber`. Normally this is where you would expect to see something like a `for…loop`. Instead we see that the line

    codapHelper.createCase('numbers', tRandom, tID, addOneNumber);

contains a recursive call to `addOneNumber` saying to CODAP "When you're done creating that case and updating the screen, come back to the `addOneNumber` function *again*.

So that's it! Put `RandomNumbers.html` on a web server and drag its URL into a blank CODAP document that you can get [here](http://codap.concord.org/releases/latest/). Or you can avoid the drag and drop by using a URL parameter like this:

    http://codap.concord.org/releases/latest/?di=http://<mydomain>/RandomNumbers.html

### Modifications You Can Make

Here are some ideas:

* Give user choice of lower and upper bounds of generated numbers.
* Give user choice of distributions beyond uniform.
* Instead of a single number, let the user choose how many numbers per trial and what to do with them. For example, generate two numbers per trial and also add them together. (Or you can add them together in CODAP.)
* Let each sample grow until a certain condition is met, as in rolling a die until you get a 6.
* Simulate the [Monty Hall problem](http://en.wikipedia.org/wiki/Monty_Hall_problem).