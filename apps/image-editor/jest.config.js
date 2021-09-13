const path = require('path');
const setupFile = path.resolve(__dirname, './jest-setup.js');

module.exports = {
  moduleFileExtensions: ['js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'jest-esm-transformer',
    '^.+\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['<rootDir>/**/*.spec.js'],
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/js/$1',
    '^@css/(.*)$': '<rootDir>/src/css/$1',
    '^@svg/(.*)$': '<rootDir>/src/svg/$1',
    '^fixtures/(.*)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFiles: [setupFile],
};
