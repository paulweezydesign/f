'use strict';

// Runs the Jest suite inside a throwaway copy of the project so build
// subprocesses and renderer tests never touch the real src/ or dist/ trees.
// Coverage reports are written back to <projectRoot>/coverage so they survive
// fixture cleanup.
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const jestBin = path.join(projectRoot, 'node_modules', 'jest', 'bin', 'jest.js');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'pau19-build-tests-'));

try {
    fs.cpSync(path.join(projectRoot, 'src'), path.join(fixture, 'src'), {recursive: true});
    fs.cpSync(path.join(projectRoot, 'scripts'), path.join(fixture, 'scripts'), {recursive: true});
    fs.cpSync(path.join(projectRoot, 'tests'), path.join(fixture, 'tests'), {recursive: true});
    fs.copyFileSync(path.join(projectRoot, 'package.json'), path.join(fixture, 'package.json'));
    fs.copyFileSync(path.join(projectRoot, 'jest.config.cjs'), path.join(fixture, 'jest.config.cjs'));
    fs.mkdirSync(path.join(fixture, 'dist'));
    // The fixture reuses the real node_modules so the compilers resolve identically.
    fs.symlinkSync(
        path.join(projectRoot, 'node_modules'),
        path.join(fixture, 'node_modules'),
        process.platform === 'win32' ? 'junction' : 'dir'
    );

    const args = [
        '--config', path.join(fixture, 'jest.config.cjs'),
        '--rootDir', fixture,
        '--coverageDirectory', path.join(projectRoot, 'coverage'),
        ...process.argv.slice(2)
    ];

    // Jest's cwd must be the fixture so its rootDir-relative globs (tests,
    // collectCoverageFrom) resolve inside the copy, not the original project.
    const result = childProcess.spawnSync(process.execPath, [jestBin, ...args], {cwd: fixture, stdio: 'inherit'});
    process.exitCode = result.status === null ? 1 : result.status;
} finally {
    process.chdir(projectRoot);
    // fs.rmSync removes the node_modules symlink itself, never its target.
    fs.rmSync(fixture, {recursive: true, force: true});
}
