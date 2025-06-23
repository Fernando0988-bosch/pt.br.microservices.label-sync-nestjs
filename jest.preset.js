const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ['text', 'lcov', 'html', 'text-summary', 'json-summary'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/*.interface.{js,ts}',
    '!src/**/*.dto.{js,ts}',
    '!src/**/*.entity.{js,ts}',
    '!src/**/*.constants.{js,ts}',
    '!src/**/index.{js,ts}',
    '!src/main.{js,ts}',
    '!src/**/*.module.{js,ts}'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  rootDir: '.',
  testTimeout: 20000,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  }
};
