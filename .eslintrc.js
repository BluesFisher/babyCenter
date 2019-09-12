module.exports = {
    root: true,
    globals: { wx: true },
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // required to lint *.wpy files
    plugins: ['html'],
    settings: {
        'html/html-extensions': ['.html', '.wpy']
    },
    // add your custom rules here
    rules: {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'space-before-function-paren': 0,
        semi: ['error', 'always'],

        // Stylistic Issues
        'max-len': 0,
        indent: ['error', 4],
        'no-mixed-operators': 0,

        // Possible Errors
        'no-console': 0,
        'no-debugger': 0,

        // Best Practices
        'no-param-reassign': [2, { props: false }],
        'no-alert': 0,

        // import
        'import/extensions': 0,
        'import/no-extraneous-dependencies': 0,
        'import/no-unresolved': 0,

        // Stylistic Issues
        'linebreak-style': 0,
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-restricted-syntax': 0,
        'no-tabs': 0,
        'no-undef': 0
    }
};
