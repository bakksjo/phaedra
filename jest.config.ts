module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: true,
  collectCoverage: false,
  transform: {
    "^.+\\.tsx?$": [ "ts-jest", { tsconfig: "tsconfig.json", diagnostics: false } ]
  },
  moduleNameMapper: {
    "^uuid$": "uuid" 
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
