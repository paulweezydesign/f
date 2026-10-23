# [Start Bootstrap - Full Width Pics](https://startbootstrap.com/template/full-width-pics/)

[Full Width Pics](https://startbootstrap.com/template/full-width-pics/) is an HTML starter template for [Bootstrap](https://getbootstrap.com/) created by [Start Bootstrap](https://startbootstrap.com/). This template features numerous full width background image content sections.

## Preview

[![Full Width Pics Preview](https://assets.startbootstrap.com/img/screenshots/templates/full-width-pics.png)](https://startbootstrap.github.io/startbootstrap-full-width-pics/)

**[View Live Preview](https://startbootstrap.github.io/startbootstrap-full-width-pics/)**

## Status

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/StartBootstrap/startbootstrap-full-width-pics/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/startbootstrap-full-width-pics.svg)](https://www.npmjs.com/package/startbootstrap-full-width-pics)
[![dependencies Status](https://david-dm.org/StartBootstrap/startbootstrap-full-width-pics/status.svg)](https://david-dm.org/StartBootstrap/startbootstrap-full-width-pics)
[![devDependencies Status](https://david-dm.org/StartBootstrap/startbootstrap-full-width-pics/dev-status.svg)](https://david-dm.org/StartBootstrap/startbootstrap-full-width-pics?type=dev)

## Download and Installation

To begin using this template, choose one of the following options to get started:

* [Download the latest release on Start Bootstrap](https://startbootstrap.com/template/full-width-pics/)
* Install via npm: `npm i startbootstrap-full-width-pics`
* Clone the repo: `git clone https://github.com/StartBootstrap/startbootstrap-full-width-pics.git`
* [Fork, Clone, or Download on GitHub](https://github.com/StartBootstrap/startbootstrap-full-width-pics)

## Usage

### Basic Usage

After downloading, simply edit the HTML and CSS files included with `dist` directory. These are the only files you need to worry about, you can ignore everything else! To preview the changes you make to the code, you can open the `index.html` file in your web browser.

### Advanced Usage

Clone the source files of the theme and navigate into the theme's root directory. Run `npm install` and then run `npm start` which will open up a preview of the template in your default browser, watch for changes to core template files, and live reload the browser when changes are saved. You can view the `package.json` file to see which scripts are included.

#### npm Scripts

* `npm run build` builds the project * this builds assets, HTML, JS, and CSS into `dist`
* `npm run build:assets` copies the files in the `src/assets/` directory into `dist`
* `npm run build:pug` compiles the Pug located in the `src/pug/` directory into `dist`
* `npm run build:scripts` brings the `src/js/scripts.js` file into `dist`
* `npm run build:scss` compiles the SCSS files located in the `src/scss/` directory into `dist`
* `npm run clean` deletes the `dist` directory to prepare for rebuilding the project
* `npm run start:debug` runs the project in debug mode
* `npm start` or `npm run start` runs the project, launches a live preview in your default browser, and watches for changes made to files in `src`

You must have npm installed in order to use this build environment.

## Testing

The project ships integration tests for the build pipeline (Jest on Node.js 18 or later; CI uses Node.js 22). The suite runs the real compilers — Pug, Sass/PostCSS, the script and asset copy steps — and asserts the artifacts they produce.

* `npm test` runs the full test suite
* `npm run test:coverage` runs the suite with coverage collection

### How it works

Each run copies the project into a throwaway temporary directory, so the tests never write to your working copy's `src` or `dist` directories, and coverage reports are written back to `coverage/` in the project root (HTML and LCOV reports land in `coverage/lcov-report/`).

The suite covers:

* a full `npm run build` from a clean state, including removal of stale `dist` artifacts and repeatability of a second build
* the Pug, Sass/PostCSS, scripts, and assets renderers, the `build:*` entrypoints, and the `clean` script
* the build contract for each artifact: valid HTML with the expected title and asset references, compiled CSS with Bootstrap output, and the license banner prepended to `scripts.js`

Continuous Integration runs the same suite with coverage on every pull request and every push to `master` via the workflow in `.github/workflows/ci.yml` (Node.js 22, Ubuntu). There are currently no coverage percentage gates and no authentication flows to test — the template is a static site.

## About

Start Bootstrap is an open source library of free Bootstrap templates and themes. All of the free templates and themes on Start Bootstrap are released under the MIT license, which means you can use them for any purpose, even for commercial projects.

* <https://startbootstrap.com>
* <https://twitter.com/SBootstrap>

Start Bootstrap was created by and is maintained by **[David Miller](https://davidmiller.io/)**.

* <https://davidmiller.io>
* <https://twitter.com/davidmillerhere>
* <https://github.com/davidtmiller>

Start Bootstrap is based on the [Bootstrap](https://getbootstrap.com/) framework created by [Mark Otto](https://twitter.com/mdo) and [Jacob Thorton](https://twitter.com/fat).

## Copyright and License

Copyright 2013-2021 Start Bootstrap LLC. Code released under the [MIT](https://github.com/StartBootstrap/startbootstrap-full-width-pics/blob/master/LICENSE) license.
