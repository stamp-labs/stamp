/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 50
    }
  },
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/', '<rootDir>/test/fixtures/'],

  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  moduleFileExtensions: ['js', 'ts']
};
