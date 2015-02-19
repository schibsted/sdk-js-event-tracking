var config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "browser",
    libs: [
    "tracker.js", "test/testlib.js"
    ],
    sources: [
    "tracker.js"
    ],
    tests: [
    "test/*-test.js"
    ],
    "buster-istanbul": {
        outputDirectory: "coverage",
        format: "lcov"
    },
    extensions: [
    require('buster-istanbul')
    ]
};
