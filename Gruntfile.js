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
                src: ['lib/**/*.js']
            }
        },
        watch: {
            all: {
                files: ['lib/**/*.js', 'test/**/*.js', 'config/*.js'],
                tasks: ['webpack:dev', 'lint', 'karma:unit:run']
            }
        },
        jscs: {
            main: ['lib/**/*.js'],
            options: {
                config: '.jscsrc',
                requireCurlyBraces: ['if']
            }
        },
        jsdoc: {
            dist: {
                src: ['lib/**/*.js'],
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
            dev: {
                entry: './lib/activity.js',
                output: {
                    path: 'dist/',
                    filename: 'tracker.js',
                    library: 'Activity'
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
            prod: {
                entry: './lib/activity.js',
                output: {
                    path: 'dist/',
                    filename: 'tracker.min.js',
                    library: 'Activity'
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
                        'debug': './debug.prod.js'
                    }
                },
                storeStatsTo: 'webpack_stats',
                failOnError: true
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

    // Default task.
    grunt.registerTask('default', ['jshint', 'jscs', 'webpack:dev', 'jsdoc']);
    grunt.registerTask('test', 'karma:unit:run');
    grunt.registerTask('check', ['watch']);
    grunt.registerTask('lint', ['jshint', 'jscs']);

};
