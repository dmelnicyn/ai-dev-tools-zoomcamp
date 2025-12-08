module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(nanoid)/)",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/index.ts",
  ],
};
