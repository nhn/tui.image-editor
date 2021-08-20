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
};
