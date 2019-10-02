Selenium Page Object Helper
==============================

A nimble and flexible [Selenium Page Object Model](https://code.google.com/p/selenium/wiki/PageObjects) generator to improve [agile testing](https://en.wikipedia.org/wiki/Agile_testing) [process velocity](https://en.wikipedia.org/wiki/Velocity_(software_development)).



The template is using [Handlebars.js](http://handlebarsjs.com/) expression, a clean logic-less semantic templating language.

This is an early BETA release, it expected to have rough edges, and limited functionality. It currently support 2 different targets: Java & Json


(You need to use Chrome 40+ to try this out)

Installation
-

- To install this plugin download the CRX file from [here](). Open chrome://extensions/ in your chrome browser and drag and drop the downloaded CRX file to install the Plugin.


Development Dependencies
-
You will need to install [Node.js](https://nodejs.org/) as a local development dependency. The `npm` package manager comes bundled with all recent releases of `Node.js`.

`npm install` will attempt to resolve any `npm` module dependencies that have been declared in the project’s `package.json` file, installing them into the `node_modules` folder.

```bash
$ npm install
```

Development
-
To build the sources into corresponding packages, run:

```bash
$ npm run build
```

The `/build` folder and `/dist` folder are created. All built files are placed in the `build` folder, and the distribution ready packages are placed in `dist` folder.

Run Unit Tests
-
To make sure we did not break anything, let's run:

```bash
$ npm test
```

Distribution
-
Once the changes are in-place and ready for distribution, update `package.json` with new version, and run:

```bash
$ npm run build
```

The `/dist` folder will contain distribution ready packages.

How to use this plugin
-
Note : When ever page object need to be generated, please enable this plugin. Disable this plugin once page object is generated

Open the Page for which page object need to be generated. Right click the html elements in the page to add those html elements into page objects. Once a html element is right clicked, a dialog box will open to get the name of the locator. Once the name is entered the locator information is added to the plugin. This way we can add all the important html elements in the current page to page object.
![Screenshot](/images/screenshot1.png)

We have one more option to add html details to the current page object in addition to right clicking the html elements. Once Add button is clicked, popup will open to get locator details and verify html element with the locator specified is available in the current page and then add the correcponding html element details to current page object.


Once all the html elements are added, we can generate page object code by clicking "Generate" button. Currently we can generate page object with Java and Json.

We can also link Git repository to store the generated page object code.  For this configuration details need to be provided. This can be done by clicking "Options" button in the Plugin.

![Screenshot](/images/screenshot2.png)

In the Options Page we need to fill Git repository details like repo path, user name and key with write access to that repository. Also git commit details like default message when commiting page objects, name & email.
Once these configuration details are provided, we can directly push the newly generated page objects to the Git Repository.

Also when using this option, Using "Find Page" button, we can check and load Page objects that are already created for the current displayed page, if it is already available in the linked Git Repository. This feature will help in
1. find out the page objects that are already created for the current displayed page.
2. Update or Modify already page objects with the Chrome Plugin itself.


