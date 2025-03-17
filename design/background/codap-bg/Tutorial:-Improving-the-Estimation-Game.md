This guide was originally shared by [Tim Erickson](https://bestcase.wordpress.com/about/) of [EEPS Media](http://www.eeps.com/projects/index.html) for the [Data Science Education Technology 2017 Conference](http://codap.concord.org/dset/).

# Assumptions!

We assume that you have set up your local web server, on your computer, and downloaded the starter files. If you have not, refer to the Getting Started document, [here](https://github.com/concord-consortium/codap/wiki/Developer-Guide).

You should also know how to edit these files, possibly using TextEdit or NotePad or some other text editor.
These instructions assume you are using Chrome on a Mac. Make appropriate adjustments if you are not.

# First, play the game
In your browser,  go to 

`http://localhost/dset `

to see our start page. Under Session 1, for the “Vanilla” Mac setup, click the link to go to the game, which is at a much longer URL that you don’t want to type. 

You will see something like the illustration. Bookmark the link, just in case.

![Estimation Game Screenshot](https://github.com/concord-consortium/codap/blob/master/images/estimation-game.png)

To play the game, press **New Game**. A black circle will appear in the blue rectangle. Now imagine that the blue rectangle represents the range [0, 1]. Where is the center of the black circle? It will be some decimal between zero and one. Make an estimate of the value, enter it in the text box, and press **Submit estimate**. Do this ten times to finish the game. You’ll get a score. 

As you do this, you can see the data you’re generating. Press the **Tables** button in the toolbar to make a table, and **Graph** to make a graph. Drag column headings from the table to graph axes to make your graph.
It will not take you long to discover things that would improve this game. And that’s what this session is about. You will change the program that governs the game, and learn about making plugins in CODAP and, by extension, what’s involved in making web-based data experiences for students. 

You will mostly work on the file called `estim8.js`, in the `estim8` folder. If you decide to change what appears in the game, you can edit `estim8.html`. 

This document is short! Too short to do anything very elaborate! So pick something commensurate with your comfort and experience. Here are some ideas, roughly in order of complexity. After the ideas come instructions. The instructions might refer to places in the code by letter; you will find them in the code surrounded by vertical bars, like this: |_Q_|.

### Before You Start: Developer Tools

If you’re an experienced programmer, you probably already have Developer Tools open. Good job.

If you’re new to this, believe me, you want these. In Chrome on the Mac, they’re in the View menu, at the bottom, under **Developer**. Choose **Developer Tools**.

This means that you can use the debugger, and also write to the console using the `console.log( )` function. We display some useful information using that technique.

For example, with the game running, click in the blue bar. You will see a message such as 

`Click at 271 pixels,` or `0.903`

Make sure that’s working properly.

### Recording the player name

The table has a column for the player name, but it isn’t filled in! There are several ways fix this. Here’s one:

Open the folder called `estim8`. In it you’ll see a `.html` file and a `.js` (JavaScript) file. Open them up in your editor. In the html file, the player name box comes from this line:

`<p>Enter your name: <input id="yourName" type="text"></p>`

The key part of this is the `id`, which is `yourName`. In the JavaScript (`estim8.js`) file, we want to get the string that’s inside it. 

For now, we’ll do that in the function that gets called whenever you press the **Submit estimate** button, which is called `endTurn( )`.  Find this part of the code:

`//  |A| set the value of the player name here.`
`var tCaseValues = {`
   `truth: this.state.currentTruth,`
   `estimate: this.state.lastInputNumber,`
   `player: this.state.playerName`
   `//  |C| ignore this part! It’s for the next task!`
`};`
`pluginHelper.createItems(tCaseValues);`

Here is the magic code you need:

`this.state.playerName = document.getElementById('yourName').value`

Insert this line in the file right after the comment labeled |_A_|. Save the file. Reload the web page. Enter your name in the box and play a turn. Does your name show up in the table? If so, yay! If not, see if you can fix it—or get help.


**What just happened?**
You set a variable called `playerName` (if you care: which is part of `state`, which is part of this, which, in this context, is the global called estim8). And we’re setting it equal to the value of this thing associated with the document (the actual web document); the thing is the “element” with an id of '`yourName`'. And that value is whatever you typed.


Then, in the game code, we create an object called `tCaseValues`, which already had a line in it for using `this.state.playerName`. In the next line, we ask a utility called `pluginHelper` to “`createItems`” using these case values. And that tells CODAP to make a new case—now with your name as part of it. 

### Recording the turn number

It would be lovely to have the turn number in the table. You will solve this problem completely by analogy with the previous task, looking at nearby code and copying it with changes.

First, to create the column in the table, find the comment with |_B_| in it. It’s near the bottom of the file. You can see lines that create columns for `truth`, `estimate`, and `player`. Duplicate one of those lines and alter it to fit your needs. Call the attribute `turnNo`. It will be `numeric`, and since it’s an integer, a `precision` of 0 is fine. 

**Danger:** be careful about the commas at the ends of the lines. Commas separate these JavaScript “properties” from one another. But the last line (of these four) does not have a comma. 

That makes the column, but doesn’t put the value in it. To do that, look for |_C_|.  That’s where you add a new line (watching out for commas) that defines the value for `turnNo`. For the value, use the variable `this.state.turnNumber`, which we have already defined. 

Save the file, reload, make sure it works. Then—for understanding—go back to the code and search for `turnNumber`. See where it gets initialized (in `newGame`) and where it gets updated (in `newTurn`). 

Even if you don’t speak JavaScript, this should start to give you a feel for the underlying organization of the game in the code. 


**You might wonder:** What’s the difference between `turnNo` and `turnNumber`? 
The way we have described this, `turnNumber`, or `estim8.state.turnNumber`, is the name of the JavaScript variable, in your plugin code. In contrast, `turnNo` is the name of the attribute in CODAP. They could have the same name. 

**What is this state thing?** We could have just made a variable called `estim8.turnNumber`, or even just `turnNumber` (a global). Why include `state`?

Look for |_S_|. This is where we initialize this variable. You can see that it’s attached to a call to `codapInterface`. Basically, this lets us save, for free, any variable we like, in `estim8.state`. If we restore this page from a file (like from Google Drive) instead of just refreshing, all of these variables take on the last-saved values. 


### Recording the Error, Plugin Calculates

The user could make a new column in CODAP to calculate the “error,” that is, how far their estimate is from the “truth.” But let’s do it for them. Make a new column in the table, maybe called `delta`, and have the code save that value as well. Just as in the last task, you need to add lines at |_B_| and |_C_|. See if you can spot where we calculated the error. You can use that variable as the value. 

### Recording the Error, but CODAP Calculates

The user could have made a new column with a _formula_ for the error. In the previous task we calculated the error and put it in the table. But instead, we could have had CODAP make a calculated column. That’s at |_B_|, but you need to know some additional syntax. Here is the line you want:

`{name: "delta", type: 'numeric', precision: 3, `
	`formula: "estimate - truth", description: "error"},`

That is, you use an additional “property,” called formula, which is a string.

If you want to use a function such as absolute value, you can do that, as in 

`formula: "abs(estimate - truth)"`

The function has to be one CODAP understands. That set is extensive and expanding; the best way to know what’s possible is to try to make the formula in CODAP and see what’s currently available in the formula menu. 

Use ^ for exponentiation.

Note that you don’t have to have the plugin save this value (So you don’t need some part of `estim8.state`.): it’s computed in CODAP. So you only need to make a change near |_B_|, not |_C_|. 

## Recording the Score

Did you realize you get a score? The variable is `this.state.currentScore`.

If you study the code or look at the console, you will see that your score is the sum of your (absolute) errors. That is, small is good. Still, this is not a very exciting score. See if you can devise a better one and, of course, have your plugin emit the current score into the table. 

It’s probably best if the plugin calculates this entirely, so don’t make a computed column in the CODAP table. That means that in addition to calculating the value, you must make changes at |_B_| and |_C_| to make the score appear in the table.

**More advanced:** You might want the score to appear in the plugin as well; for that you need to change the HTML and make an appropriate JavaScript call. You might, for example, have a `<div>` with an `id`, and change that object’s `innerHTML` to be the value of the score. The JavaScript line might be:

`document.getElementByID(“theScoreDiv”).innerHTML = "Score: " + this.state.currentScore`

## Recording the Game Number

Now you’re such an expert we don’t need to tell you much. We have already created the variable `this.state.gameNumber`. But we have not initialized it properly. You might have to try a few different things to get the correct game number to appear. 

## Reversing the Game

Okay, hotshot. 

Notice that in this game, you type a value that represents your estimate for a value you see as the position of a dot. Suppose you reverse the sense of this, that is, have the plugin display a numerical value, and you show your estimate by clicking in the blue bar.

To facilitate this, we have created another state variable, `estim8.state.lastClickPosition`, which is set by the view in `stripView.click()`. 

In CODAP’s architecture, a plugin is not just a source of data. It can also be a source of other instructions; and even more importantly, it can receive information from CODAP. That is, communication between the plugin and the data analysis environment goes both ways.

This is not just some esoteric drive by geeky software developers to be symmetrical. It’s important for a learning tool, and it’s important for how CODAP can be extensible. Here are some examples:

* When the user selects a case in CODAP, the plugin can show case information. That way the user—the learner—can see more clearly where the data came from.

This is just one example of communication from CODAP back to the plugin. But there are others we can demonstrate, such as

* If you want to create a “dashboard” for students of pre-configured and -positioned graphs, your plugin can instruct CODAP to do it.
* And, most amazingly: if CODAP doesn’t have the type of graph or analysis you want, you can create a plugin that makes it. You ask CODAP for the data; you receive it, make the relevant calculations, and display the result. 

### Selection Detection

First, let’s do selection. Here’s the goal:

* When the user selects a case in CODAP—in the table or in a graph—the estim8 plugin will show where the black dot (the “pointer”) was when you made that estimate, and also show what the true value was. 

You will quickly see that this ability brings up many questions about the UI, for example, how do you go back and forth between reviewing the game and playing the game? We’re not going to worry too much about that in this context, and instead will just make this decision:

* We’ll show the “old,” selected true value as a gray circle, and our guess as a white line.

The key learning, then, will be how to tell CODAP that we want to know about selection, and then how to receive that notification. We will also have to make the graphics change, but that will all be specific to software choices we made for this particular session. 

Onward!

## Registering Our Interest

Be default, a CODAP plugin does not react to anything the user does with the data. To change that, we need to tell CODAP that we want to know. 

We will do that (in this case) when the user starts a new game. So here is some code from the beginning of `estim8.newGame( )`. Look for |_M_|:

```
newGame: function () {
	//  |M| in Part 2, this is where you will tell CODAP we're interested in selection
	codapInterface.on('notify', estim8.constants.resourceString, estim8.codapSelects);
this.state.playing = true;	//	old code
```

What’s happening? We’re using the `codapInterface` object we used last time, and calling one of its most important methods, `codapInterface.on( )`. 

`on( )` takes three arguments.

* The kind of event we want to respond to, in this case, '`notify`'.
* A “resource string” that CODAP uses to determine what we want information about. In this case, it’s the data set (a.k.a. “data context”) called `estimates`. It’s the only data set we’re using, but it’s possible to have multiple data sets in your application. We define this resource string in the code. Its value is:

```
'dataContextChangeNotice[estimates]'
```

So we want information every time the data context (`estimates`) changes. 

* The name of a routine (a callback) that will be called whenever one of these events takes place. That’s `estim8.codapSelects()`, as you can see. You can find it in the code at |_N_|.

Type or paste the line of code where we call `codapInterface.on( )` into your own code., so it looks like the illustration up above.

Run the result, make some data, and do some selection. In your console, you will see messages like these:

```
Received a createCases message
Received a selectCases message
```

## Responding to the notification

The change we made above asks CODAP to notify us. Now we have to do something when that notification arrives. Here is the current code for the function:

```
estim8.codapSelects = function(iMessage) {      //  |N| part of part 2 solution
	 var tMessageValue = iMessage.values;
	if (Array.isArray(tMessageValue)) {
		tMessageValue = tMessageValue[0]; //      the first of the values in the message
	 }
	console.log("Received a " + tMessageValue.operation + " message");
};
```

CODAP calls this function with one argument, which we are calling `iMessage`. This is a JSON object with lots of possible formats and information, depending on the particular type of message we’re receiving. Here is an example of a message we’re looking for:

```
{
  "action": "notify",
  "resource": "dataContextChangeNotice[estimates]",
  "values": [
    {
      "operation": "selectCases",
      "result": {
        "success": true,
        "cases": [
          {
            "id": 8,
            "context": {
              "id": 3,
              "name": "estimates"
            },
            "collection": {
              "id": 4,
              "name": "estimates",
              "parent": null
            },
            "values": {
              "truth": 0.7526125913165849,
              "estimate": 0.75
            }
          }
        ]
      }
    }
  ]
}
```

Yikes! You can read about all the various kinds of messages CODAP sends and receives [here](https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API).

The key thing to know right now, however, is that there are other `dataContextChangeNotices`, such as `createCases`, that we don’t want to react to. You can also see, in the code, how to tell what kind of message it is. It’s in a variable we made called `tMessageValue.operation` (which we print out on the console).

Note to programmers: At the moment, as the CODAP system evolves, we don’t know in advance whether `iMessage.values` is an object or an array of objects. The first few lines of the function assure that we’re looking at a single object. 

In any case, our values field, that is, `tMessageValue`, has two properties: the `operation` and the `result`. The result has `success` and, for our operation, it has cases. `Cases` is an array of objects, each of which has (among other things) `values`. 

This is so deeply nested that the prudent coder advances a step at a time.

So let’s prudently improve this `codapSelects( )` function. Let’s first determine whether we even care about the message. After

```
console.log("Received a " + tMessageValue.operation + " message");
```

insert these lines, or their equivalent:

```
if (tMessageValue.operation == "selectCases") {
    console.log("Selection! We should address this!") 
}
```

Run your code and see if you get the appropriate log.

Once that is working properly, we need to get information about the selected case. (If there is more than one selected case, we’ll focus on whichever one is first.)

So inside that `if{}` block, we now know that `tMessageValue` is for selection, so its result has cases. Try inserting this:

```
if (tMessageValue.operation == "selectCases") {
    console.log("Selection! We should address this!");
    var tFirstCase = tMessageValue.result.cases[0];
    console.log(JSON.stringify(tFirstCase));
}
```

Now when you run it, you should see the JSON corresponding to the selected case.
 
The values we want are inside `tFirstCase`, so you could insert lines such as

```
var tTruth = tFirstCase.values.truth;
var tGuess = tFirstCase.values.estimate;
```

To extract the numbers we want: the true value and the estimate for that case. 

Insert those lines and print `tTruth` and `tGuess` to the console to verify that they are correct. (You will notice that they have more significant figures than the numbers in your table. See if you can figure out why!)

## Changing the display

Although it’s not strictly part of learning about the communication aspects of CODAP plugins, it’s rewarding to change the plugin’s display in response to the selection. 

First let’s see how we move the black circle, called the “Pointer”. That’s in this line in `estim8.newTurn()`:

```
this.stripView.movePointerTo(this.state.currentTruth);
this.stripView.setPointerVisibility(true);
```

Look in stripView (at |_P_| and |_Q_|) to see how we move the circle and make it visible. We need to do something analogous for the guess (which will be a line) and the selection’s truth (which will be a gray circle). 

So go to where you defined `tTruth` and `tGuess`, and insert these lines:

```
estim8.stripView.moveSelectionValues(tTruth, tGuess);
estim8.stripView.setSelectionVisibility(true);
```

Which calls functions (to be written) to do all of this. 

Then, in `stripView`, make copies of the two “pointer” functions and edit them. We have already created the gray circle and the white line in `stripView.initialize()` — look for |_R_| — so just substitute appropriate variables. Instead of `this.pointer`, use `this.guessLine` and `this.truthCircle`. 

The tricky bit is that for the line (`this.guessLine`), in Snap, the graphics library we’re using, you need to change _two_ values for _x_ (of course!) instead of just the center of the circle. These attributes are called `x1` and `x2`. Given an argument called `iGuess`, this code works:

```
tX = iGuess * estim8.constants.stripWidth;
this.guessLine.attr({"x1" : tX, "x2" : tX});
```