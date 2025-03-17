This guide was originally shared by [Tim Erickson](https://bestcase.wordpress.com/about/) of [EEPS Media](http://www.eeps.com/projects/index.html) for the [Data Science Education Technology 2017 Conference](http://codap.concord.org/dset/).

In this guide, you’ll see how a CODAP plugin works. We have made a bare-bones data game; you will alter it.
But to get started, you have to set up a bunch of things on your computer. You are probably in one of three categories:

* You are an experienced programmer, and can almost be left to your own devices.
* You have some experience, or a sense of adventure, and are willing to try setting up your computer yourself.
* You’re a bit more trepid, or pressed for time.

We will begin with quick instructions for an experienced programmer. If they’re enough for you, great! If they’re confusing, we’ll repeat the same steps, actually telling you what to do.

## Experienced Setup

You will be programming a CODAP plugin in JavaScript. 

To make everything work easily, you need to have a working web server on your local computer. Be sure you know how to turn it on, and where it looks for files. On the Mac, by default, this is in `Library/WebServer/Documents/`. 

Download our starter files from [here](https://github.com/concord-consortium/data-science-games/tree/master/gamePrototypes/dset), putting the entire folder (called dset) into this “server folder,” i.e., the root directory of your server.

In your browser (we used Chrome) point to `http://localhost/dset/`

Your server should show the `index.html` file in that folder. If it does not, perhaps your server is not running. Open the Terminal application and type `sudo apachectl` start. Reload the page.

(If you are using some other server package such as MAMP, or have directed Apache to serve from some other folder, make appropriate adjustments.)

If you see the page we have created, great! It’s working! You will see a link to your “estimate” game. Click it to play. It should open up inside CODAP, so you can create a table to display your moves and a graph to graph them. As you make new moves, the new cases should appear.

You will very quickly be dissatisfied with the app, which is the point of this guide: you will choose some bugs to fix or features to implement, depending on your interest and skills. Some ideas appear below, after the detailed instructions.

## Setup for Mortals

You will be programming a CODAP plugin in JavaScript. You’ve never programmed in JavaScript? Don’t worry. We’ll help. Leave a comment or two in our [CODAP Developer Forum](https://codap.concord.org/forums/forum/developer-forum/). It would be good if you have programmed in some language in the last 10 years, but it’s not essential. 

In these instructions, we assume you have a Mac with an updated operating system and that you can use Chrome as your browser. You can still do the tutorial and get a lot out of it if this is not the case, but we strongly recommend that you have accomplished the goals of these setup instructions before you go further. You may need help from some real person (an immortal, perhaps) to do this.

Ready? Here we go. 

To make everything work easily, you need to have a working web server on your local computer. Fortunately, your Mac has one built in. Let’s make sure it’s working. 

In your browser, enter `http://localhost`, and press **return**.

We hope you see the left illustration, not the one on the right:

![Right Screenshot: It works! Left screenshot: This site can't be reached...](https://github.com/concord-consortium/codap/blob/master/images/browser-images.png)

If you see the error message on the right, you need to turn the server on. Here is how:

* Launch the Terminal program. <img style="float: right;" src="https://github.com/concord-consortium/codap/blob/master/images/Terminal.png">
* Press the search magnifying glass in the menu bar, near the upper right of your screen. (This opens Spotlight.)
* Type `Terminal`. If you see its icon on the right, press **return**. Terminal starts.
* At the prompt, type `sudo apachectl start.`
* It will ask for a password. Enter your main computer password. 
* If all goes well, you will see the prompt again. 
* Refresh your browser window or enter `http://localhost` again, and press **return**. Ideally, you now see the screen on the left.

Assuming it’s working properly, let’s reflect. Your computer is a web server, and you are browsing its files. But where are these files? On the Mac, by default, they are in `Library/WebServer/Documents/`. 

Switch to the Finder and navigate to that folder. Start way up at the top, at your hard disk, not in your User folder (mine is called `Tim`). If you use the “browser” type Finder window, it might look like this:

![Finder](https://github.com/concord-consortium/codap/blob/master/images/Finder.png)

## Downloading our starter files

To make our session work, we have made a “starter” plugin for you to alter. You will need to put its code into the folder that your web server uses. We have put everything you need in a single folder called `dset`. It has some subfolders (one of which is called `estim8`). 

Get this folder off of GitHub. [Here is the link](https://github.com/concord-consortium/data-science-games/tree/master/gamePrototypes/dset) to that folder.  The GitHub window will show something like this:

![GitHub Window](https://github.com/concord-consortium/codap/blob/master/images/GitHubWindow.png)

Download this dset folder you see into the root folder of your server, that is, into the `Library/WebServer/Documents/` folder.

Now test it! In your browser, navigate to `http://localhost/dset`. You should see our baby web site. Something like the illustration.

![Illustration window](https://github.com/concord-consortium/codap/blob/master/images/DSET_website.png)

## Editing files on your local web site

We need to make sure you can edit the files in order to change this local web site you are hosting. The file that displays when you point your browser at `localhost/dset/` is named `index.html`.
 
We need to edit this file. There is a good chance, however, that if you double-click it, it will simply open Safari (or Chrome) and display the same page you just saw. 

So if you have a favorite _text editor_ (not a word processor!) start it. If you have no idea, open `TextEdit`. You can find it by pressing that magnifying glass at the right end of the menu bar—which opens Spotlight—and starting to type `TextEdit`. When its icon appears (as in the illustration), press **return** and TextEdit will launch.

![TextEdit Launch](https://github.com/concord-consortium/codap/blob/master/images/TextEdit-launch.png)

In TextEdit, go to the File menu and choose Open. Navigate to the web folder (top level—Library—WebServer—Documents) and select `index.html`. 

But do not click **Open** yet! Click the **Options** button and then check the box that says `Ignore` rich text commands. It will look something like this:

![Options](https://github.com/concord-consortium/codap/blob/master/images/Options.png)

Now click **Open**, and you will see the file. It might look like this:

![TextEdit](https://github.com/concord-consortium/codap/blob/master/images/TextEdit.png)

You can edit it as you would edit any file. 

* The top of the file has just comments. Scroll down (not very far) to where you see

```
</head>
<body>
<div class='banner'>DSET Connecting Technology Sessions</div>`
<div class="body">
```
* Change the phrase DSET Connecting Technology Sessions to something else, like Brussels sprouts are delicious! 
* Save the file
* Reload your browser page. If everything worked, your browser will show the new text. 

### The point of all this…

…was to make sure that you can edit files and see the changes you make on your website. This means you will be able to change the code for the CODAP plugin.

## Onward to the Estimate Session!
[The next article](https://github.com/concord-consortium/codap/wiki/Tutorial:-Improving-the-Estimation-Game) has instructions for the plugin itself. It assumes everything worked in this setup. 

### One More Thing: If You Haven’t Used WebStorm, you could give it a try

TextEdit is sufficient for the simple tasks in this handout, but if you work on something bigger, it helps to have an integrated development environment (IDE). We use WebStorm, from IntelliJ.
If you’ve never tried it, this might be a good chance to see how you like it. You can get it for free—well, a 30-day free trial—here:

[https://www.jetbrains.com/webstorm/download/](https://www.jetbrains.com/webstorm/download/)

If you like it and promise not to make any money off of it, the nice people at IntelliJ, a.k.a. JetBrains, have generous freebie policies. 
 