'use strict';

var webpack = require('webpack');

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js', 'test/**/*.js', 'autotracking/**/*.js', 'integrationtest/**/*.js']
            }
        },
        watch: {
            all: {
                files: ['lib/**/*.js', 'test/**/*.js', 'autotracking/**/*.js', 'integrationtest/**/*.js'],
                tasks: ['devbuild', 'lint', 'karma:unit:run']
            }
        },
        jscs: {
            main: ['lib/**/*.js', 'autotracking/**/*.js'],
            options: {
                config: '.jscsrc',
                requireCurlyBraces: ['if']
            }
        },
        jsdoc: {
            dist: {
                src: ['lib/**/*.js', 'autotracking/**/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true,
                singleRun: false
            }
        },
        webpack: {
            sdkDev: {
                entry: './lib/activity.js',
                output: {
                    path: './dist/',
                    filename: 'tracker.js',
                    library: 'Activity',
                    libraryTarget: 'umd'
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                storeStatsTo: 'webpack_stats',
                failOnError: true
            },
            sdkProd: {
                entry: './lib/activity.js',
                output: {
                    path: './dist/',
                    filename: 'tracker.min.js',
                    library: 'Activity',
                    libraryTarget: 'umd'
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                plugins: [
                    new webpack.optimize.UglifyJsPlugin(),
                    new webpack.optimize.DedupePlugin()
                ],
                resolve: {
                    alias: {
                        vars: './prod/vars',
                        debug: './debug.prod.js'
                    }
                },
                storeStatsTo: 'webpack_stats',
                failOnError: true
            },
            autoDev: {
                entry: './autotracking/track.js',
                output: {
                    path: './dist/',
                    filename: 'autoTracker.js',
                    library: 'AutoTrack',
                    libraryTarget: 'umd'
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                storeStatsTo: 'webpack_stats',
                failOnError: true
            },
            autoProd: {
                entry: './autotracking/track.js',
                output: {
                    path: './dist/',
                    filename: 'autoTracker.min.js',
                    library: 'AutoTrack',
                    libraryTarget: 'umd'
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                plugins: [
                    new webpack.optimize.UglifyJsPlugin(),
                    new webpack.optimize.DedupePlugin()
                ],
                resolve: {
                    alias: {
                        vars: './prod/vars',
                        debug: './debug.prod.js'
                    }
                },
                storeStatsTo: 'webpack_stats',
                failOnError: true
            }
        },
        'http-server': {
			dev: {
				root: './',
				port: '8080',
				runInBackground: true
			}
		},
        nightwatch: {
            options: {
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-nightwatch');
	grunt.loadNpmTasks('grunt-http-server');

    // Default task.
    grunt.registerTask('prodbuild', ['webpack:sdkProd', 'webpack:autoProd']);
    grunt.registerTask('devbuild', ['webpack:sdkDev', 'webpack:autoDev']);
    grunt.registerTask('test', ['karma:unit:run', 'http-server:dev', 'nightwatch']);
    grunt.registerTask('build', ['prodbuild', 'devbuild', 'lint']);
    grunt.registerTask('default', ['jshint', 'jscs', 'devbuild', 'jsdoc']);
    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('build-test', ['lint', 'prodbuild', 'devbuild', 'test']);
    grunt.registerTask('integration', ['lint', 'http-server:dev', 'nightwatch']);

};
