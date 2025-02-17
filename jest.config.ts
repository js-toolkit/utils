import { type JestConfigWithTsJest } from 'ts-jest';
import { getJSExtensions, getTSExtensions } from '@js-toolkit/configs/paths';

const config: JestConfigWithTsJest = {
  // ...createDefaultEsmPreset(),
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { useESM: true, isolatedModules: true }],
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  resetMocks: true,
  cache: false,
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src/tests'],
  // The test environment that will be used for testing
  // testEnvironment: 'node',
  // The regexp pattern or array of patterns that Jest uses to detect test files
  testRegex: '^.+\\.(test|spec)\\.(t|j)sx?$',
  moduleFileExtensions: [...getJSExtensions(), ...getTSExtensions()].map((ext) => ext.substring(1)),
  extensionsToTreatAsEsm: getTSExtensions(),
};

export default config;
