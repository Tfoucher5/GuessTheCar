module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/**/__tests__/**',
        '!src/app.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testTimeout: 10000
};