module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    // required to lint *.vue files
    plugins: [
        'vue',
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'comma-dangle': ['error', 'always-multiline'],
        'semi': ['error', 'always'],
        'space-before-function-paren': ['error', 'never'],
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
    overrides: [
    {
        files: [
            '**/__tests__/*.{j,t}s?(x)',
            '**/tests/unit/**/*.spec.{j,t}s?(x)',
        ],
        env: {
            jest: true,
        },
    }],
};
