'use strict';

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    config.set({
        basePath: './',

        frameworks: ['browserify', 'jasmine'],

        files: [
            'bower_components/jquery/jquery.js',
            'bower_components/tui-code-snippet/code-snippet.min.js',
            'bower_components/fabric/dist/fabric.js',
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

        browserStack: {
            username: process.env.BROWSER_STACK_USERNAME,
            accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
            project: 'tui-component-image-editor'
        },

        // define browsers
        customLaunchers: {
            'bs_ie9': {
                'base': 'BrowserStack',
                'os': 'Windows',
                'os_version': '7',
                'browser_version': '9.0',
                'browser': 'ie'
            },
            'bs_ie10': {
                'base': 'BrowserStack',
                'os': 'Windows',
                'os_version': '7',
                'browser_version': '10.0',
                'browser': 'ie'
            },
            'bs_ie11': {
                'base': 'BrowserStack',
                'os': 'Windows',
                'os_version': '7',
                'browser_version': '11.0',
                'browser': 'ie'
            },
            'bs_edge': {
                'base': 'BrowserStack',
                'os': 'Windows',
                'os_version': '10',
                'browser': 'edge',
                'browser_version': 'latest'
            },
            'bs_chrome_mac': {
                'base': 'BrowserStack',
                'os': 'OS X',
                'os_version': 'El Capitan',
                'browser': 'chrome',
                'browser_version': 'latest'
            },
            'bs_firefox_mac': {
                'base': 'BrowserStack',
                'os': 'OS X',
                'os_version': 'El Capitan',
                'browser': 'firefox',
                'browser_version': 'latest'
            }
        },

        browsers: [
            'bs_ie9',
            'bs_ie10',
            'bs_ie11',
            'bs_edge',
            'bs_chrome_mac',
            'bs_firefox_mac'
        ],

        singleRun: true
    });
};
