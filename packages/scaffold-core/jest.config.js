const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = Object.assign({}, baseConfig, {
    rootDir: ".",
    displayName: package.name,
    setupFiles: [
        "./test/setup.ts"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "<rootDir>/test/tsconfig.json"
        }
    }
});
