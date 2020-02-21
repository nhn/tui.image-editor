/* eslint-disable consts-on-top, no-process-env, require-jsdoc */
/* eslint-disable no-process-env, require-jsdoc */
const webdriverConfig = {
    hostname: 'fe.nhnent.com',
    port: 4444,
    remoteHost: true
};

function setConfig(defaultConfig, server) {
    if (server === 'ne') {
        defaultConfig.customLaunchers = {
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '9'
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '10'
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '11'
            },
            'Edge': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'MicrosoftEdge'
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            },
            'Firefox-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'firefox'
            },
            'Safari-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'safari'
            }
        };
        defaultConfig.browsers = [
            'IE9',
            'IE10',
            // 'IE11',
            // 'Edge',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
            // 'Safari-WebDriver'
        ];
        defaultConfig.reporters.push('coverage');
        defaultConfig.reporters.push('junit');
        defaultConfig.coverageReporter = {
            dir: 'report/coverage/',
            reporters: [
                {
                    type: 'html',
                    subdir(browser) {
                        return `report-html/${browser}`;
                    }
                },
                {
                    type: 'cobertura',
                    subdir(browser) {
                        return `report-cobertura/${browser}`;
                    },
                    file: 'cobertura.txt'
                }
            ]
        };
        defaultConfig.junitReporter = {
            outputDir: 'report/junit',
            suite: ''
        };
    } else {
        defaultConfig.browsers = [
            'ChromeHeadless'
        ];
    }
}

module.exports = function(config) {
    const defaultConfig = {
        basePath: './',
        frameworks: [
            'jasmine',
            'jquery-3.2.1',
            'es5-shim'
        ],
        files: [
            // reason for not using karma-jasmine-jquery framework is that including older jasmine-karma file
            // included jasmine-karma version is 2.0.5 and this version don't support ie8
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'node_modules/fabric/dist/fabric.js',
            'test/index.js',
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
                pattern: 'test/fixtures/*.svg',
                watched: false,
                included: false,
                served: true
            }
        ],
        preprocessors: {
            'test/index.js': ['webpack', 'sourcemap']
        },
        reporters: ['dots'],
        webpack: {
            mode: 'development',
            devtool: 'inline-source-map',
            externals: {
                fabric: 'fabric'
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        include: /src/,
                        exclude: /node_modules/,
                        loader: 'eslint-loader',
                        enforce: 'pre'
                    },
                    {
                        test: /\.js$/,
                        exclude: /(test|node_modules)/,
                        loader: 'istanbul-instrumenter-loader',
                        query: {
                            esModules: true
                        }
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader?cacheDirectory',
                        options: {
                            babelrc: true
                        }
                    }, {
                        test: /\.styl$/,
                        use: ['css-loader', 'stylus-loader']
                    }
                ]
            }
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: true
    };

    /* eslint-disable */
    setConfig(defaultConfig, process.env.KARMA_SERVER);
    config.set(defaultConfig);
};
