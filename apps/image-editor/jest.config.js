const path = require('path');
const setupFile = path.resolve(__dirname, './jest-setup.js');

module.exports = {
  moduleFileExtensions: ['js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'jest-esm-transformer',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['<rootDir>/**/*.spec.js'],
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/js/$1',
  },
  setupFiles: [setupFile],
};
