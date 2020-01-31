module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {
    "ts-jest": {
      diagnostics: {
        ignoreCodes: [2564]
      }
    }
  },
  transformIgnorePatterns: [
		"/node_modules/",
		"/dist/",
	],
	modulePathIgnorePatterns: [
		"/dist/",
		"/node_modules/"
	],
}
