module.exports = {
  root: true,
  extends: ['tui/es6', 'plugin:jest/recommended', 'plugin:prettier/recommended'],
  plugins: ['jest', 'prettier'],
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
    jest: true,
    'jest/globals': true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    babelOptions: {
      rootMode: 'upward',
    },
  },
  ignorePatterns: ['node_modules/*', 'dist', 'examples'],
  rules: {
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: { array: true, object: true },
        AssignmentExpression: { array: false, object: false },
      },
    ],
  },
  overrides: [
    {
      files: ['*.spec.js'],
      rules: {
        'max-nested-callbacks': ['error', { max: 5 }],
        'dot-notation': ['error', { allowKeywords: true }],
        'no-undefined': 'off',
        'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'assert*'] }],
      },
    },
  ],
};
