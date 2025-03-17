<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [CODAP Developer Guide](#codap-developer-guide)
  - [Installing the CODAP development environment](#installing-the-codap-development-environment)
    - [Development Dependencies](#development-dependencies)
      - [Notes for installing Git](#notes-for-installing-git)
      - [Notes for installing node.js and npm](#notes-for-installing-nodejs-and-npm)
      - [Notes for installing Ruby](#notes-for-installing-ruby)
    - [Installing CODAP](#installing-codap)
      - [Get the CODAP Source](#get-the-codap-source)
      - [Install the Sproutcore Server Environment](#install-the-sproutcore-server-environment)
      - [Install NPM Packages](#install-npm-packages)
      - [Run the CODAP Application Locally](#run-the-codap-application-locally)
      - [Troubleshooting](#troubleshooting)
  - [Working with the CODAP development environment](#working-with-the-codap-development-environment)
    - [Travis Builds](#travis-builds)
  - [Updating the Cloud File Manager](#updating-the-cloud-file-manager)
  - [Translation/Localization](#translationlocalization)
    - [Development](#development)
    - [Adding a language](#adding-a-language)
  - [Testing with Sage Modeler](#testing-with-sage-modeler)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# CODAP Developer Guide

These are instructions for setting up a full CODAP development environment. 
You will need to do this if you wish to modify or debug CODAP itself.
For example, you may wish to create an alternate version or contribute bug fixes 
to the CODAP project.
You do not need to do this if you wish to deploy an instance of CODAP to
an alternate web server or if you wish to create a plugin (Data Interactive) 
that will run in CODAP.
In these circumstances, you can download a zip file from
<a href="http://codap.concord.org/releases/zips/" target="_blank">http://codap.concord.org/releases/zips/</a> 
and then unzip it in the file space of your web server.
If you wish to develop a CODAP plugin please see:
<a href="https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API" target="_blank">https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API</a>.

## Installing the CODAP development environment

The following are instructions that will install CODAP and its dependencies. 
There are a variety of ways of installing the dependencies and it is likely that
any developer is set up for most dependencies already.

### Development Dependencies

The development environment for CODAP requires the following software:

  * [Git](https://git-scm.com) source code management,
  * [Node.js](https://nodejs.org/en/) the current version, and
  * <a href="https://en.wikipedia.org/wiki/Ruby_(programming_language)" target="_blank">Ruby</a> 
  version 1.9.3 or later with the [Bundler](https://bundler.io) gem.
  
The following notes may assist you in getting these packages installed and 
configured. If you already have these packages installed, whether by the means
identified below or by other means, these notes can safely be ignored.
  
#### Notes for installing Git

  * If you do not have git installed already, go <a href="https://git-scm.com/downloads" target="_blank">here</a>.
  * Mac OS does not have git installed natively, but it comes with the 
    <a href="https://itunes.apple.com/us/genre/mac-developer-tools/id12002?mt=12" target="_blank">Mac Developer Tools</a>(XCode).
    Mac developers may wish to also 
    <a href="http://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/" target="_blank">install command line tools</a>.
  * Windows: 
    * Follow the instructions in the link referenced in the first bullet, above.
    When prompted check the option for "use git from Windows Command Prompt", 
    pick "Git in Windows Console".
    * Accept defaults for all other options
    
#### Notes for installing node.js and npm

  * Mac OS: <a href="http://blog.teamtreehouse.com/install-node-js-npm-mac" target="_blank">Here</a> are 
    useful instructions.
  * Windows: <a href="http://blog.teamtreehouse.com/install-node-js-npm-windows" target="_blank">Here</a> are
    useful instructions.
  * Windows users are encouraged to install <a href="https://cygwin.com/install.html" target="_blank">cygwin</a>.
    Cygwin emulates a Unix command line environment, including a `bash` shell.

#### Notes for installing Ruby

There are several ways to install Ruby.

  * For Mac OS: Ruby is not installed natively on Mac OS, but, as with git, can be
    found in the <a href="https://itunes.apple.com/us/genre/mac-developer-tools/id12002?mt=12" target="_blank">Mac Developer Tools</a>(XCode). 
    The version of ruby currently installed with Developer Tools is 2.3.x, which works well with CODAP.
    You should make sure the Bundler Gem is installed:
    
    ```bash
    sudo gem install bundler
    ```
    
  * For Mac OS: for users who have 
  <a href="https://brew.sh" target="_blank">Homebrew</a> installed:
    
    ```bash
        $ brew install ruby
        $ gem install bundler
    ```
        
  * For Windows:
    Install Ruby 1.9.3 or later with DevKit
      + Go to <a href="http://rubyinstaller.org/downloads" target="_blank">RubyInstaller</a>
      + Download latest stable version for your windows instance 
      + Download DevKit from the same page. If possible, do so in the same installer.
      + Run installer to install Ruby
      + If you downloaded a separate DevKit, unzip it
      + Run "Command Prompt as Ruby" (Go to windows start icon. Search for "Command Prompt with Ruby".)
      
      ```
      c:\Users\username\Downloads>gem install bundler     
      ```
      
      + If you downloaded a separate DevKit, run the following in the terminal window:
      
      ```bash
      c:\Users\username\Downloads>ruby dk.rb init
      c:\Users\username\Downloads>ruby dk.rb review
      c:\Users\username\Downloads>ruby dk.rb install
      ```
      + Install the eventmachine.
      
      ```bash
      gem install eventmachine
      ```
      
  * For Any platform: It is also possible to install ruby through the Ruby Version 
    Manager(<a href="https://rvm.io/" target="_blank">RVM</a>). 
    This is useful if you need to swap between multiple Ruby versions, but is
    not required for CODAP's purposes.
    If you elect this path, please refer to the above site for installation 
    instructions.
    RVM installs the Bundler Gem automatically.
    
### Installing CODAP

#### Get the CODAP Source

  * In a terminal window:
  
    ```bash
    $ git clone https://github.com/concord-consortium/codap.git
    $ cd codap # we will refer to this as the "CODAP root directory"
    $ git submodule update --init --recursive
    ```

  * If you intend to modify the CODAP repository for your own purposes or to 
    contribute back, it may be useful to fork it on Github 
    and then clone the fork. To fork CODAP, go to the 
    [Github Repository](https://github.com/concord-consortium/codap) and click on 
    "Fork".

#### Install the Sproutcore Server Environment

  * In a terminal window:
  
    ```bash
        $ bundle install
    ```

#### Install NPM Packages

  * We assume you have the NodeJS and the Node Package Manager (npm) installed 
    on your system.
  * In your terminal window, with the current working directory set to the CODAP 
    root directory, run the following commands:
    
    ```bash
         % npm install --legacy-peer-deps
         % npm run build:bundle
    ```

_At present, Windows users will need to run the above command from an environment 
that supports standard Unix command line programs, such as Git Bash, installed above,
<a href="https://cygwin.com/install.html" target="_blank">cygwin</a>, or 
<a href="https://msdn.microsoft.com/en-us/commandline/wsl/about" target="_blank">bash in windows</a>. 
The terminal window mentioned above should be one of these._

The contents of the bundle change periodically as dependencies are changed. Whenever a code update requires updating the bundle the above steps can be used to build an updated bundle. To simplify the process, the `sync` script will update git submodules, install/update npm modules, and rebuild the bundle.

```bash
    $ npm run sync
```

#### Run the CODAP Application Locally

  * In your terminal window, with the current working directory set to the CODAP 
    root directory, run the following commands:

     ```bash
     $ npm start    # or "sc-server --allow-from-ips='*.*.*.*'"
     ```

  * This runs the 
    <a href="http://guides.sproutcore.com/build_tools.html#developing-with-sproutcore-sproutcore-server" target="_blank">SproutCore server</a>, 
    which serves the application code locally.
    To run the application, enter the following URL into your web browser of 
    choice: <a href="http://localhost:4020/dg" target="_blank">http://localhost:4020/dg</a>.
    CODAP should run well on the latest release of modern mainstream browsers, 
    including Chrome, Firefox, Safari, and Edge.
    
  * To verify your build there are two easy things to do:
  
    * Open your local CODAP instance in a browser. Open each the example documents.
      They should appear and behave exactly as they would in the [official CODAP 
      release](https://codap.concord.org/releases/latest).
    * In the terminal window change to the CODAP directory and execute:
     
     ```$ npm run test```. 
     
      This should execute without error.
    
#### Troubleshooting
  * If your local version of CODAP fails to build, try `npm run clean` and/or `npm run sync` and try again.
  * If your local version of CODAP fails to load, check the output in the 
    terminal window where you ran 'sc-server' and check your browser's console.

## Working with the CODAP development environment

Most changes to the CODAP application source are automatically reflected by 
simply reloading the browser page at 
<a href="http://localhost:4020/dg" target="_blank">http://localhost:4020/dg</a>. 
More extensive changes (e.g. adding/removing source files) may require stopping 
and restarting `sc-server` and/or removing the generated `tmp` folder. 
For npm users, a set of scripts are defined in the `package.json` file to 
assist with many of these development tasks. Some of the more commonly used 
scripts for local development are listed below. 
See the `package.json` file for the full list of available scripts.

- `npm run build:bundle` - builds the library bundle required by CODAP. Must be 
run before running CODAP locally for the first time or after bundle contents change.
- `npm run clean` - deletes the `tmp` directory and other build products
- `npm run clean-and-serve` - runs the `clean` script and then starts `sc-server`
- `npm run codap` - starts `sc-server`
- `npm run lint` - runs ESLint/JSHint over the sources
- `npm run start` - starts `sc-server`
- `npm run sync` - runs `clean`, updates submodules, runs npm install, and builds the bundle
- `npm run test` - runs CODAP's unit tests

_Note that some of these commands require unix or unix-like command line programs,
and may not work in pure Windows environments.  Windows users may wish to install 
<a href="https://cygwin.com/install.html" target="_blank">cygwin</a> or 
enable <a href="https://msdn.microsoft.com/en-us/commandline/wsl/about" target="_blank">bash in windows</a>._

### Travis Builds

Branches of CODAP pushed to the Github repository instigate an automated CI build
of CODAP and create a development instance of CODAP. If the build is named "foo",
the development instance will be "https://codap-dev.concord.org/branch/foo/". The 
terminating slash("/") in the URL is required. Pushes to the master branch create
an instance at "https://codap-dev.concord.org/". The builds can take some time, 
and can be monitored on the GitHub Actions page.

## Updating the Cloud File Manager ##

CODAP uses the 
<a href="https://github.com/concord-consortium/cloud-file-manager" target="_blank">Cloud File Manager</a> 
library (CFM) to handle most of its document storage/retrieval. Currently, the 
built CFM files are simply included in the CODAP git repository. 
To update the version of CFM included in CODAP, it is necessary to build the 
CFM library with some CODAP-specific options and put the appropriate CFM output 
files into the `apps/dg/resources/cloud-file-manager` directory in CODAP. 
There is an npm script named `build:codap` in the CFM repository which takes 
care of all the details as long as the `codap` and `cloud-file-manager` 
repositories are in sibling directories, i.e. something like `../projects/codap` 
and `../projects/cloud-file-manager`. With this configuration, from within the 
`codap` repository, typing:
```
$ npm run build:cfm
```
or from within the `cloud-file-manager` repository, typing:
```
$ npm run build:codap
```
will build the CFM and place the output files in the appropriate place in the 
`codap` repository. Under the hood, `npm run build:codap` executes the following 
command:
    ```bash
    $ gulp clean-and-build --dest ../codap/apps/dg/resources/cloud-file-manager \
        --codap --nojQuery --noReact --noMap
    ```
If your `codap` repository is not a sibling of your `cloud-file-manager` 
repository or has a different name, you can execute an analogous command with a 
different destination path. After updating the CFM, simply reloading the page at 
`http://localhost:4020/dg` should make the changes available as long as 
`sc-server` is running.

## Translation/Localization

The master English strings file is `lang/strings/en-US.json`, which is a 
standard JSON file except that JavaScript-style comments are allowed. (Comments 
are stripped before use where appropriate.) Changes to English strings should 
be made in the master English strings file. All other language files are output 
files generated by script and are stored in their respective `.lproj` 
directories, following SproutCore localization convention. Translations for 
other languages are managed via the 
[CODAP](https://poeditor.com/projects/view?id=125447) project (authentication 
required) on [POEditor](https://poeditor.com), which provides free hosting 
services for open source projects.

### Development

After making changes to the master English strings file 
(`lang/strings/en-US.json`), run the `strings:build` script to strip comments 
and deploy the `apps/dg/english.lproj/strings.js` file for building:
```
npm run strings:build
```

To push changes to the master English strings file to POEditor, run 
the `strings:push` script:
```
npm run strings:push -- -a <poeditor-api-token>
```
The API token must be provided as an argument to the `strings:push` script or 
it can be set as an environment variable:
```
export POEDITOR_API_TOKEN=<poeditor-api-token>
```

To update the strings files within the project, run the `strings:pull` script:
```
npm run strings:pull -- -a <poeditor-api-token>
```
As with the `strings:push` script, the API token must be provided or be set as 
an environment variable. The `strings:pull` script builds the English strings 
as well so all strings files will be up to date.

After pulling updated strings, the modified files can be committed to git, 
turned into a Github Pull Request, etc. Note that POEditor supports 
[Github integration](https://poeditor.com/help/how_to_translate_a_language_file_from_a_github_project) 
which could potentially automate part of this, but that requires further 
investigation.

Unicode escapes are converted to their UTF-8 equivalents when pushed, i.e. 
strings are viewed/edited in their "user" form in POEditor, and they remain in 
their UTF-8 form when pulled. For characters that are better left in their 
Unicode escape form, such as non-printable characters like ZERO-WIDTH-SPACE 
("`\u200b`") and the RIGHT-TO-LEFT-MARK ("`\u200f`"), the scripts support a 
custom Unicode escape sequence such that "`[u200b]`" and "`[u200f]`" are 
converted to "`\u200b`" and "`\u200f`" respectively when pulled.

The ZERO-WIDTH-SPACE character can be used to indicate that the empty string is 
the correct translation for a string in a particular language. If the string 
were simply left untranslated, then POEditor would 1) show it as untranslated 
in the POEditor UI and 2) replace it with the English string when pulled. The 
ZERO-WIDTH-SPACE prevents POEditor from treating the string as untranslated, 
but it is rendered like an empty string.

### Adding a language

To add a new language:

1. Add the language to the POEditor project
2. Add the language code to the list of languages in `bin/strings-pull-project.sh`
3. Create a new `{lang}.lproj` folder for the language, e.g. `es.lproj` for 
Spanish.
4. Copy the English `function_strings.json` (at `apps/dg/english.lproj/function_strings.json`) i
nto the new `{lang}.lproj` folder. Translation of the `function_strings.json` 
is not currently supported.
5. There may at some point be another step for configuring which builds should 
contain the new language, but for now all languages are built by default.

## Testing with Sage Modeler

This section assumes (a) you have a working CODAP development environment, (b)you know what Sage Modeler is and have a reason to test CODAP with it, and (c) the code you wish to debug is on the CODAP side, not the Sage Modeler side.

* The following URL will invoke a local CODAP development instance in standalone mode with Sage Modeler occupying the entire workspace. It is functionally equivalent to the invocation on the Sage Modeler website.

>  http://localhost:4020/dg?embeddedMode=yes&hideSplashScreen=yes&hideUndoRedoInComponent=yes&hideWebViewLoading=yes&standalone=SageModeler&di=http://sage.concord.org/sagemodeler.html%3Fstandalone%3Dtrue&di-override=sage&inbounds=true 