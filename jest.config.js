const ignorePatterns = [
    'examples',
    'packages/.*/dist',
    'packages/.*/test/__scaffolds__',
    'packages/.*/test/__snapshots__',
    'scripts',
    'node_modules',
]

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coverageDirectory: "test/coverage",
    coveragePathIgnorePatterns: ignorePatterns,
    modulePathIgnorePatterns: ignorePatterns,
    projects: ["<rootDir>/packages/*"]
};
