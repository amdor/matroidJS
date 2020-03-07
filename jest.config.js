module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {
    "ts-jest": {
      diagnostics: {
        ignoreCodes: [2564, 7034, 2488, 7005, 7006, 2339, 2345]
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
