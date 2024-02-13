/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  coverageProvider: "v8",
  preset: 'ts-jest',
  rootDir: 'src',
  testEnvironment: "jest-environment-node",
};

module.exports = config;
