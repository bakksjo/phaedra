module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: true,
  collectCoverage: false,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      diagnostics: false
    }
  }
};
