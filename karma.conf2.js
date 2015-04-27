'use strict';

module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai'],

        // list of files / patterns to load in the browser
        files: [
            'test/**/*.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.js': ['webpack']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            reporters: [{
                type: 'html',
                dir: 'coverage/'
            }, {
                type: 'text'
            }]
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
        // config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // BrowserStack config

        // Custom browser launchers
        customLaunchers: {
            bs_firefox_mac: {
                base: 'BrowserStack',
                browser: 'firefox',
                browser_version: '21.0',
                os: 'OS X',
                os_version: 'Yosemite'
            },
            bs_chrome_win: {
                base: 'BrowserStack',
                browser: 'chrome',
                browser_version: '41.0',
                os: 'WINDOWS',
                os_version: '8.1'
            },
            bs_safari_ios: {
                base: 'BrowserStack',
                device: 'iPhone 6',
                os: 'ios',
                os_version: '8.0'
            },
            bs_ie10_win8: {
                base: 'BrowserStack',
                browser: 'ie',
                browser_version: '10.0',
                os: 'WINDOWS',
                os_version: '8'
            },
            bs_ie9_win7: {
                base: 'BrowserStack',
                browser: 'ie',
                browser_version: '9',
                os: 'WINDOWS',
                os_version: '7'
            },
            bs_ie11_win81: {
                base: 'BrowserStack',
                browser: 'ie',
                browser_version: '11.0',
                os: 'WINDOWS',
                os_version: '8.1'
            }
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'bs_firefox_mac',
            // 'bs_ie10_win8',
            // 'bs_ie11_win81',
            // 'bs_ie9_win7',
            'bs_chrome_win'
            // 'bs_safari_ios'
        ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        webpack: {
            module: {
                postLoaders: [{
                    test: /\.js$/,
                    exclude: /(test|node_modules|bower_components)\//,
                    loader: 'istanbul-instrumenter'
                }]
            }
        }
    });
};
