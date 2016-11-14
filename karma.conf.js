'use strict';

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    config.set({
        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
            'bower_components/jquery/jquery.js',
            'bower_components/tui-code-snippet/code-snippet.min.js',
            'bower_components/fabric/dist/fabric.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'src/js/**/*.js',
            'test/**/*.spec.js',
            {
                pattern: 'test/fixtures/*.jpg',
                watched: false,
                included: false,
                served: true
            },
            {
                pattern: 'test/fixtures/*.png',
                watched: false,
                included: false,
                served: true
            },
            {
                pattern: 'test/fixtures/**/*.html',
                included: false
            }
        ],

        exclude: [
        ],

        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.spec.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: [istanbul({
                ignore: ['bower_components/**', 'test/**/*']
            })]
        },

        reporters: [
            'dots',
            'coverage',
            'junit'
        ],

        coverageReporter: {
            dir: 'report/coverage/',
            reporters: [
                {
                    type: 'html',
                    subdir: function(browser) {
                        return 'report-html/' + browser;
                    }
                },
                {
                    type: 'cobertura',
                    subdir: function(browser) {
                        return 'report-cobertura/' + browser;
                    },
                    file: 'cobertura.txt'
                }
            ]
        },

        junitReporter: {
            outputDir: 'report/junit',
            suite: ''
        },

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: [
            'PhantomJS'
        ],

        singleRun: false,

        browserNoActivityTimeout: 30000
    });
};
