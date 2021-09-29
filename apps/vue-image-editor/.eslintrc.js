module.exports = {
  extends: ['tui/es6', 'plugin:vue/recommended', 'plugin:prettier/recommended'],
  plugins: ['vue', 'prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 7,
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/*', 'dist'],
};
