module.exports = function (grunt) {

    'use strict';

    var path = require('path');

    if (grunt.option('help')) {
        require('load-grunt-tasks')(grunt);
    } else {
        require('jit-grunt')(grunt);
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                options: {
                    banner: '/*\n' +
                            '    <%= pkg.name %> - v<%= pkg.version %>\n' +
                            '\n' +
                            '    Copyright (c) <%= grunt.template.today("yyyy") %> Incuna Ltd.\n' +
                            '    Licensed under the MIT license.\n' +
                            '*/\n'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: '**/*.js',
                        dest: 'dist'
                    }
                ]
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= concat.dist.options.banner %>'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: '**/*.js',
                        dest: 'dist',
                        // Rename to .min.js
                        rename: function (destBase, destPath, options) {
                            destPath = destPath.replace(/\.js$/, '.min.js');
                            return path.join(destBase || '', destPath);
                        }
                    }
                ]
            }
        },
        karma: {
            options: {
                basePath: '',
                files: [
                    'lib/angular/angular.js',
                    'lib/angular-touch/angular-touch.js',
                    'lib/angular-mocks/angular-mocks.js'
                ],
                exclude: [],
                frameworks: ['jasmine'],
                plugins: [
                    'karma-jasmine',
                    'karma-firefox-launcher',
                    'karma-coverage'
                ],
                preprocessors: {
                    'src/**/*.js': 'coverage'
                },
                reporters: ['progress', 'coverage'],
                coverageReporter: {
                    dir: 'coverage',
                    reporters: [
                        {
                            // Browser view.
                            type: 'html'
                        },
                        {
                            type: 'lcovonly',
                            // Travis uses this path: coverage/lcov.info
                            subdir: '.',
                            file: 'lcov.info'
                        }
                    ]
                },
                port: 9876,
                colors: true,
                browsers: ['Firefox'],
                singleRun: true,
                logLevel: 'DEBUG'
            },
            src: {
                files: [
                    {src: 'src/**/*.js'},
                    {src: 'test/**/*.js'}
                ]
            },
            dist: {
                files: [
                    {src: 'dist/**/*.js'},
                    {src: 'test/**/*.js'}
                ]
            },
            watch: {
                options: {
                    singleRun: false,
                    autoWatch: true
                },
                files: '<%= karma.src.files %>'
            }
        }
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('watch', ['karma:watch']);

    grunt.registerTask('dist', ['concat', 'uglify']);

    grunt.registerTask('test-src', ['karma:src']);
    grunt.registerTask('test-dist', ['karma:dist']);
    grunt.registerTask('test', ['test-src', 'test-dist']);

};
