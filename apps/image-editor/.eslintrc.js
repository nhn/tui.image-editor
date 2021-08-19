module.exports = {
  extends: ['tui/es6', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  plugins: ['prettier', 'jest'],
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
    jest: true,
    'jest/globals': true,
  },
  globals: {
    fabric: true,
    tui: true,
    loadFixtures: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: { array: true, object: true },
        AssignmentExpression: { array: false, object: false },
      },
    ],
  },
};
