module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'max-nested-callbacks': ['error', { max: 5 }],
    'dot-notation': ['error', { allowKeywords: true }],
    'no-undefined': 'off',
    'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'assert*'] }],
  },
};
