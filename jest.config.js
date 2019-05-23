module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coverageDirectory: "test/coverage",
    modulePathIgnorePatterns: [
        'examples/.*',
        'packages/.*/dist',
        'scripts/.*',
    ],
    projects: ["<rootDir>/packages/*"]
};
