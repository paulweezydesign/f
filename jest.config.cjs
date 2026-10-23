'use strict';

module.exports = {
    testEnvironment: 'node',
    // The tests share one throwaway project copy, so run them serially.
    maxWorkers: 1,
    // The suite shells out to the real build; allow it to finish.
    testTimeout: 120000,
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverageFrom: [
        'scripts/build-assets.js',
        'scripts/build-pug.js',
        'scripts/build-scss.js',
        'scripts/build-scripts.js',
        'scripts/check-docs.js',
        'scripts/clean.js',
        'scripts/render-assets.js',
        'scripts/render-pug.js',
        'scripts/render-scss.js',
        'scripts/render-scripts.js'
    ],
    coveragePathIgnorePatterns: ['/node_modules/'],
    coverageReporters: ['text', 'html', 'lcov', 'json-summary']
};
