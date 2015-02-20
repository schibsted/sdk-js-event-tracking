'use strict';

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
                src: ['app/**/*.js', 'lib/**/*.js']
            },

        },
        watch: {
            all: {
                files: ['src/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'config/*.js', 'tracker.js'],
                tasks: ['webpack:webBuild'/*,'concat', 'jshint', 'buster:unit', 'jsdoc'*/]
            }
        },
        jsdoc : {
            dist : {
                src: ['src/*.js', 'lib/**/*.js', 'tracker.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        buster: {
            unit: {
            }
        },
        webpack: {
            webBuild: {
                // webpack options
                entry: "./lib/main.js",
                output: {
                    //libraryTarget: "umd",
                    path: "dist/",
                    filename: "tracker.js",
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                storeStatsTo: "webpack_stats",
                failOnError: true,
            },
        },
        concat: {
            options: {
                stripBanners: {
                    line: true,
                }
            },
            dist: {
                src: ['src/variables.js', 'src/events.js', 'src/dataTracker.js', 'src/users.js', 'src/sendData.js', 'src/utilities.js'],
                dest: 'tracker.js',
            },
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-buster');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task.
    grunt.registerTask('default', ['concat', 'jshint', 'buster:unit', 'jsdoc']);
    grunt.registerTask('test', 'buster:unit');
    grunt.registerTask('check', ['watch']);
    grunt.registerTask('run', ['buster:unit']);

};
