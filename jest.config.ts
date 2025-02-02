module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: true,
  collectCoverage: false,
  transform: {
    "^.+\\.tsx?$": [ "ts-jest", { tsconfig: "tsconfig.json", diagnostics: false } ]
  },
  moduleNameMapper: {
    "^uuid$": "uuid",
    '\\.(css|less|scss|sass)$': '<rootDir>/src/components/styleMock.ts'
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
