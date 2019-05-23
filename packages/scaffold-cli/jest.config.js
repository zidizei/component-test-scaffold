const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = Object.assign({}, baseConfig, {
    rootDir: ".",
    displayName: package.name
});
