module.exports = {
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  // @faker-js/faker ships ESM-only from v10 — let babel-jest transform it instead
  // of leaving it in the default node_modules transform-ignore list.
  transformIgnorePatterns: ["node_modules/(?!(@faker-js/faker)/)"],
  testEnvironment: "node",
  testRegex: "./tests/.*\\.(test|spec)?\\.(ts|ts)$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  roots: ["<rootDir>"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
};

