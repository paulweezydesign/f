# paulweezydesign/f

A static-site starting point based on Start Bootstrap's **Full Width Pics v5.0.3**, using Pug, SCSS, JavaScript, and Bootstrap 5.1.0. The existing template content is retained; agency branding and deployment are separate work.

## Prerequisites

- Node.js and npm (verified with Node.js 22.23.2 and npm 10.9.8)
- Git to clone the repository

## Getting started

```sh
git clone https://github.com/paulweezydesign/f.git
cd f
npm ci
npm run build
npm start
```

`npm ci` installs the versions in `package-lock.json`. `npm start` rebuilds the site, starts BrowserSync, and watches source files for changes. Open the local address printed in the terminal; stop the preview with Ctrl+C.

The template uses external image services and a Bootstrap JavaScript CDN, so a fully rendered preview requires network access.

## File structure

```text
src/
  pug/index.pug       Page markup
  scss/styles.scss    Styles, including Bootstrap imports
  js/scripts.js       Browser-side JavaScript
  assets/             Static assets, including the favicon
scripts/              Build, rendering, and preview tooling
dist/                 Generated HTML, CSS, JavaScript, and assets
package.json          Project metadata, scripts, and pinned dependencies
package-lock.json     Locked dependency tree
LICENSE               Original MIT license and copyright notice
```

Edit `src/`, not `dist/`. The build scripts compile or copy source files into `dist/`. Generated output is kept in version control to preserve the repository's existing distribution layout: run `npm run build` and review and commit intentional `dist/` changes alongside source changes. Builds regenerate attribution banners with the current year.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Clean and rebuild all output in `dist/` |
| `npm run build:pug` | Compile Pug pages to HTML |
| `npm run build:scss` | Compile SCSS to CSS |
| `npm run build:scripts` | Copy JavaScript and generate its attribution banner |
| `npm run build:assets` | Copy static assets |
| `npm run clean` | Remove generated contents of `dist/` |
| `npm start` | Build, serve, watch, and reload the preview |
| `npm run start:debug` | Build and run the debug preview |

There is no dedicated automated test or lint suite. Before submitting changes, run a clean dependency install and build, preview the site, and check that the page, stylesheet, script, and favicon are served successfully. Do not upgrade dependencies as part of routine scaffold changes.

## Repository policy

This is a private npm package (`private: true` prevents accidental npm publication; it does not control GitHub visibility). The package name, title, version, author, contributors, and homepage retain template provenance and support generated attribution banners; they do not identify a deployed agency site. The repository metadata points to this project rather than the upstream template.

Keep dependencies, local `.env` files, and npm debug logs out of version control. A sanitized `.env.example` may be committed if configuration is introduced later. Do not include secrets in it.

## Attribution

Based on [Start Bootstrap — Full Width Pics](https://startbootstrap.com/template/full-width-pics), originally created by Start Bootstrap and David Miller. The original copyright notice and MIT license are preserved in [LICENSE](LICENSE).
