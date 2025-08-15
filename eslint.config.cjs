const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                exports: 'writable',
                module: 'writable',
                require: 'readonly',
                global: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly'
            }
        },
        rules: {
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-unused-vars': ['warn'],
            'no-console': 'off',
            'no-undef': 'error',
            'no-trailing-spaces': 'error',
            'eol-last': 'error',
            'comma-dangle': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'space-before-function-paren': ['error', 'never'],
            'keyword-spacing': ['error', { 'before': true, 'after': true }],
            'space-infix-ops': 'error',
            'no-multiple-empty-lines': ['error', { 'max': 2 }],
            'brace-style': ['error', '1tbs', { 'allowSingleLine': true }]
        },
        files: ['src/**/*.js'],
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '*.min.js'
        ]
    },
    {
        files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly'
            }
        }
    }
];