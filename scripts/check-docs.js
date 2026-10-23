'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const pages = ['index', 'getting-started', 'api-reference', 'configuration', 'security', 'migration'];

function decode(value) {
    return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity) => {
        if (entity[0] === '#') {
            const hex = entity[1].toLowerCase() === 'x';
            return String.fromCodePoint(parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10));
        }
        return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[entity.toLowerCase()];
    });
}

// The build emits quoted attributes; this checks that generated HTML, not arbitrary user HTML.
function attributes(html, name) {
    const values = [];
    const tags = html.replace(/<!--[\s\S]*?-->/g, '').match(/<[a-z][^>]*>/gi) || [];
    const pattern = new RegExp('(?:\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'gi');
    for (const tag of tags) {
        for (const match of tag.matchAll(pattern)) values.push(decode(match[1] === undefined ? match[2] : match[1]));
    }
    return values;
}

function text(html) {
    return decode(html.replace(/<[^>]+>/g, '')).trim();
}

function within(root, target) {
    const relative = path.relative(root, target);
    return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}

function resolveLink(root, file, value) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return null;
    assert(value.trim(), `${file}: empty local URL`);
    assert(!value.startsWith('/'), `${file}: root-relative URL will break subdirectory hosting: ${value}`);
    const [location, ...fragmentParts] = value.split('#');
    const pathname = decodeURIComponent(location.split('?')[0]);
    const target = pathname ? path.resolve(path.dirname(file), pathname) : file;
    assert(within(root, target), `${file}: URL escapes dist: ${value}`);
    assert(fs.existsSync(target) && fs.statSync(target).isFile(), `${file}: missing local target: ${value}`);
    assert(within(root, fs.realpathSync(target)), `${file}: URL resolves outside dist: ${value}`);
    if (fragmentParts.length && fragmentParts.join('#')) {
        const fragment = decodeURIComponent(fragmentParts.join('#'));
        assert(/\.html$/i.test(target), `${file}: fragment on non-HTML target: ${value}`);
        const ids = attributes(fs.readFileSync(target, 'utf8'), 'id');
        assert(ids.includes(fragment), `${file}: missing fragment: ${value}`);
    }
    return target;
}

function checkDocs(directory = path.resolve(__dirname, '../dist')) {
    const root = fs.realpathSync(directory);
    const titles = new Set();
    const expected = pages.map(page => path.join(root, 'docs', page + '.html'));
    for (const file of expected) {
        assert(fs.existsSync(file), `Missing documentation page: ${file}`);
        const html = fs.readFileSync(file, 'utf8');
        const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
        assert.strictEqual(titleMatches.length, 1, `${file}: expected one title`);
        const title = text(titleMatches[0][1]);
        assert(title && !titles.has(title), `${file}: empty or duplicate title`);
        titles.add(title);
        const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
        assert(headings.length === 1 && text(headings[0][1]), `${file}: expected one nonempty h1`);
        const mains = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)];
        assert.strictEqual(mains.length, 1, `${file}: expected one main landmark`);
        const sections = [...mains[0][1].matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
        assert(sections.length >= 2 && sections.every(section => text(section[1]).length >= 3), `${file}: expected meaningful h2 sections`);
        const ids = attributes(html, 'id');
        assert.strictEqual(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
        const links = attributes(html, 'href');
        const resources = [...links, ...attributes(html, 'src')];
        const targets = resources.map(value => resolveLink(root, file, value)).filter(Boolean);
        for (const asset of ['css/styles.css', 'assets/favicon.ico']) {
            assert(targets.includes(path.join(root, asset)), `${file}: missing shared asset reference: ${asset}`);
        }
        const nav = [...html.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gi)].map(match => match[1]).join('\n');
        const navigation = attributes(nav, 'href').map(value => resolveLink(root, file, value));
        for (const destination of expected) {
            assert(navigation.includes(destination), `${file}: missing navigation to ${path.basename(destination)}`);
        }
        assert(links.some(value => value.startsWith('#') && value.length > 1), `${file}: missing skip link`);
    }
    const home = path.join(root, 'index.html');
    const homeLinks = attributes(fs.readFileSync(home, 'utf8'), 'href');
    assert(homeLinks.includes('docs/index.html'), 'Landing page must link to docs/index.html');
    resolveLink(root, home, 'docs/index.html');
    assert(!fs.existsSync(path.join(root, 'layouts', 'docs.html')), 'Layout must not be emitted as a page');
    return expected.length;
}

function selfTest(directory) {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'check-docs-'));
    try {
        const fixture = path.join(temporary, 'dist');
        fs.cpSync(directory, fixture, { recursive: true });
        const page = path.join(fixture, 'docs', 'index.html');
        const original = fs.readFileSync(page, 'utf8');
        for (const [link, failure] of [
            ['missing-checker-target.html', /missing local target/],
            ['index.html#missing-checker-fragment', /missing fragment/],
            ['../../outside.html', /URL escapes dist/],
        ]) {
            try {
                fs.writeFileSync(page, original.replace('</main>', `<a href="${link}">Checker fixture</a></main>`));
                assert.throws(() => checkDocs(fixture), failure);
            } finally {
                fs.writeFileSync(page, original);
            }
        }
        checkDocs(fixture);
    } finally {
        fs.rmSync(temporary, { recursive: true, force: true });
    }
}

if (require.main === module) {
    try {
        const directory = path.resolve(__dirname, '../dist');
        const count = checkDocs(directory);
        selfTest(directory);
        console.log(`Documentation checks passed for ${count} pages; broken-link, fragment, and path-escape self-tests passed.`);
    } catch (error) {
        console.error(`Documentation check failed: ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { checkDocs, selfTest };
