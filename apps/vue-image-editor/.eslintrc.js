module.exports = {
  extends: ['tui/es6', 'plugin:vue/recommended', 'plugin:prettier/recommended'],
  plugins: ['vue', 'prettier'],
  ignorePatterns: ['node_modules/*', 'dist'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 7,
    sourceType: 'module',
  },
};
