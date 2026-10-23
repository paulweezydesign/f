'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

// The suite runs inside a temporary copy of the project (see tests/run-tests.js),
// so every path resolves relative to the copied project root, never the original.
const projectRoot = path.resolve(__dirname, '..');
const pkg = require('../package.json');

const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const stylesCssPath = path.join(distDir, 'css', 'styles.css');
const scriptsJsPath = path.join(distDir, 'js', 'scripts.js');
const faviconPath = path.join(distDir, 'assets', 'favicon.ico');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

function resetDist() {
    fs.rmSync(distDir, {recursive: true, force: true});
    fs.mkdirSync(distDir);
}

function readDist(relativePath) {
    return fs.readFileSync(path.join(distDir, relativePath), 'utf8');
}

function expectBuiltHtml(html) {
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<title>Full Width Pics - Start Bootstrap Template</title>');
    expect(html).toContain('css/styles.css');
    expect(html).toContain('js/scripts.js');
    expect(html).toContain('assets/favicon.ico');
}

async function waitFor(predicate, timeoutMs = 30000, intervalMs = 50) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (predicate()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Condition not met within ${timeoutMs}ms`);
}

function expectLicensedBanner(js) {
    expect(js).toMatch(/^\/\*\!/);
    expect(js).toContain(`Copyright 2013-${new Date().getFullYear()}`);
    expect(js).toContain(pkg.version);
}

describe('npm run build (subprocess)', () => {
    test('produces the full dist output from a clean state and removes stale artifacts', () => {
        resetDist();
        fs.writeFileSync(path.join(distDir, 'stale-artifact.txt'), 'left over from a previous build');

        const result = childProcess.spawnSync(npm, ['run', 'build'], {
            cwd: projectRoot,
            encoding: 'utf8',
            shell: isWindows
        });
        expect(result.status).toBe(0);

        expect(fs.readdirSync(distDir).sort()).toEqual(['assets', 'css', 'index.html', 'js']);
        expect(fs.existsSync(path.join(distDir, 'stale-artifact.txt'))).toBe(false);

        expectBuiltHtml(readDist('index.html'));

        const css = readDist(path.join('css', 'styles.css'));
        expect(css).toContain('Copyright 2013-');
        expect(css).toContain('.bg-image-full');
        expect(css).toContain('--bs-');

        const js = readDist(path.join('js', 'scripts.js'));
        expectLicensedBanner(js);
        expect(js.endsWith(fs.readFileSync(path.join(projectRoot, 'src', 'js', 'scripts.js'), 'utf8'))).toBe(true);

        expect(fs.readFileSync(faviconPath)).toEqual(
            fs.readFileSync(path.join(projectRoot, 'src', 'assets', 'favicon.ico'))
        );
    });

    test('is repeatable: a second full build regenerates the same artifact set', () => {
        const result = childProcess.spawnSync(npm, ['run', 'build'], {
            cwd: projectRoot,
            encoding: 'utf8',
            shell: isWindows
        });
        expect(result.status).toBe(0);

        expect(fs.readdirSync(distDir).sort()).toEqual(['assets', 'css', 'index.html', 'js']);
        expectBuiltHtml(readDist('index.html'));
    });
});

describe('render-pug (in process)', () => {
    const renderPug = require('../scripts/render-pug');
    const indexPath = path.join(projectRoot, 'src', 'pug', 'index.pug');

    test('creates the destination directory when it is missing', () => {
        fs.rmSync(distDir, {recursive: true, force: true});

        renderPug(indexPath);

        expectBuiltHtml(readDist('index.html'));
    });

    test('writes into an existing destination directory', () => {
        resetDist();

        renderPug(indexPath);

        expectBuiltHtml(readDist('index.html'));
    });
});

describe('build-pug (in process)', () => {
    test('renders page templates while skipping includes, mixins, and layouts', () => {
        resetDist();
        const pugRoot = path.join(projectRoot, 'src', 'pug');
        fs.mkdirSync(path.join(pugRoot, 'includes'), {recursive: true});
        fs.writeFileSync(path.join(pugRoot, 'includes', 'partial.pug'), 'p skipped-include\n');
        fs.mkdirSync(path.join(pugRoot, 'mixins'), {recursive: true});
        fs.writeFileSync(path.join(pugRoot, 'mixins', 'partial.pug'), 'p skipped-mixin\n');
        fs.mkdirSync(path.join(pugRoot, 'layouts'), {recursive: true});
        fs.writeFileSync(path.join(pugRoot, 'layouts', 'base.pug'), 'p skipped-layout\n');

        jest.resetModules();
        require('../scripts/build-pug');

        const rendered = fs.readdirSync(distDir).filter(name => name.endsWith('.html')).sort();
        expect(rendered).toEqual(['index.html']);
        expectBuiltHtml(readDist('index.html'));
    });
});

describe('render-scripts and render-assets (in process)', () => {
    test('render-scripts copies src/js and prepends the license banner', () => {
        resetDist();

        const renderScripts = require('../scripts/render-scripts');
        renderScripts();

        const js = readDist(path.join('js', 'scripts.js'));
        expectLicensedBanner(js);
        expect(js.endsWith(fs.readFileSync(path.join(projectRoot, 'src', 'js', 'scripts.js'), 'utf8'))).toBe(true);
    });

    test('render-assets copies static assets byte-for-byte', () => {
        resetDist();

        const renderAssets = require('../scripts/render-assets');
        renderAssets();

        expect(fs.readFileSync(faviconPath)).toEqual(
            fs.readFileSync(path.join(projectRoot, 'src', 'assets', 'favicon.ico'))
        );
    });
});

describe('render-scss (in process)', () => {
    test('compiles styles.scss through PostCSS and resolves only after the file is written', async () => {
        resetDist();

        const renderSCSS = require('../scripts/render-scss');
        // If render-scss.js ever stops returning its PostCSS promise, this line
        // fails because the awaited value is no longer a promise.
        await expect(renderSCSS()).resolves.toBeUndefined();

        const css = readDist(path.join('css', 'styles.css'));
        expect(css).toContain('Copyright 2013-');
        expect(css).toContain('.bg-image-full');
        expect(css).toContain('--bs-');
    });
});

describe('build entrypoint wrappers (in process)', () => {
    test('build-scripts.js runs the scripts renderer', () => {
        resetDist();

        jest.resetModules();
        require('../scripts/build-scripts');

        expectLicensedBanner(readDist(path.join('js', 'scripts.js')));
    });

    test('build-assets.js runs the assets renderer', () => {
        resetDist();

        jest.resetModules();
        require('../scripts/build-assets');

        expect(fs.readFileSync(faviconPath)).toEqual(
            fs.readFileSync(path.join(projectRoot, 'src', 'assets', 'favicon.ico'))
        );
    });

    test('build-scss.js runs the SCSS renderer', async () => {
        resetDist();

        jest.resetModules();
        require('../scripts/build-scss');

        // build-scss.js calls renderSCSS() without awaiting it, so poll for the
        // compiled output instead of asserting synchronously.
        await waitFor(() => {
            try {
                return fs.readFileSync(stylesCssPath, 'utf8').includes('.bg-image-full');
            } catch {
                return false;
            }
        });
        expect(readDist(path.join('css', 'styles.css'))).toContain('.bg-image-full');
    });
});

describe('clean (in process)', () => {
    test('empties dist but keeps the directory itself', () => {
        resetDist();
        fs.writeFileSync(path.join(distDir, 'stale-artifact.txt'), 'stale');
        fs.mkdirSync(path.join(distDir, 'css'));
        fs.writeFileSync(path.join(distDir, 'css', 'stale.css'), 'stale');

        jest.resetModules();
        require('../scripts/clean');

        expect(fs.readdirSync(distDir)).toEqual([]);
        expect(fs.existsSync(distDir)).toBe(true);
    });
});
