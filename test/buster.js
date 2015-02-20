module.exports = {
    'My tests': {
        rootPath: '../',
        environment: 'browser',
        sources: [
            'dist/tracker.js'
        ],
        tests: [
            'test/*-test.js'
        ],
        'buster-istanbul': {
            outputDirectory: 'coverage',
            format: 'lcov'
        },
        extensions: [
            require('buster-istanbul')
        ]
    }
};
