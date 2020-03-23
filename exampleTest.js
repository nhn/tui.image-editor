const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME;
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');
const {Builder} = require('selenium-webdriver');
const HttpAgent = new http.Agent({keepAlive: true});
const testUrls = getTestUrls();

/**
 * Url prefix
 */
const urlPrefix = 'http://nhn.github.io/tui.image-editor/latest';

/**
 * Capabilities
 * https://www.browserstack.com/automate/capabilities
 */
const capabilities = [
    {
        browserName: 'Firefox',
        name: 'Firefox Test',
        os: 'Windows'
    }, {
        browserName: 'Chrome',
        name: 'Chrome Test',
        os: 'Windows'
    }, {
        os: 'Windows',
        osVersion: '7',
        name: 'IE10 Test',
        browserName: 'IE',
        browserVersion: '10.0'
    }, {
        os: 'Windows',
        osVersion: '10',
        name: 'IE11 Test',
        browserName: 'IE',
        browserVersion: '11.0'
    }, {
        os: 'OS X',
        osVersion: 'Catalina',
        name: 'Safari Test',
        browserName: 'Safari'
    }, {
        os: 'Windows',
        osVersion: '10',
        name: 'Edge Test',
        browserName: 'Edge'
    }
];

urlTest(testUrls).catch(err => {
    console.log(err);
    process.exit(1);
});


/**
 * Url test
 */
async function urlTest(urls) {
    const parallelPendingTests = Object.keys(capabilities).map(index => testPlatform(index, urls));
    const testResults = await Promise.all(parallelPendingTests);
    const result = testResults.flat().reduce((errorList, errorInfo) => {
        if (!errorInfo.errorLogs) {
            errorInfo.errorLogs = {message: 'Not exist error catch code snippet in example page'};
            errorList.push(errorInfo);
        } else if (errorInfo.errorLogs.length) {
            errorList.push(errorInfo);
        }
        return errorList;
    }, []);

    printErrorLog(result);
    
    assert.equal(result.length, 0);
}

/*
 * Test one platform
 */
async function testPlatform(index, urls) {
    const driver = getDriver(index);
    const result = [];

    for(let i = 0; i <= urls.length - 1; i++) {
        const url = urlPrefix + urls[i];
        await driver.get(url);
        await driver.wait(function() {
          return driver.executeScript('return document.readyState').then(function(readyState) {
            return readyState === 'complete';
          });
        }, 20000);

        const browserInfo = await driver.getCapabilities();
        const errorLogs = await driver.executeScript('return window.errorLogs');
        const browserName = browserInfo.get("browserName");
        const browserVersion = browserInfo.get("version") || browserInfo.get("browserVersion");

        result.push({
            url,
            browserName,
            browserVersion,
            errorLogs
        });

        console.log(browserName, browserVersion, ' - ', url);
    }

    driver.quit();

    return result;
}

/**
 * Get Selenium Builder
 */
function getDriver(index) {
    return new Builder()
        .usingHttpAgent(HttpAgent)
        .withCapabilities(Object.assign({}, capabilities[index], {build: `examplePageTest-${new Date().toLocaleDateString()}`}))
        .usingServer(`http://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub.browserstack.com/wd/hub`)
        .build();
}

/**
 * Print browser error logs
 */
function printErrorLog(errorBrowsersInfo) {
    errorBrowsersInfo.forEach(errorInfo => {
        console.log(errorInfo.url);
        console.log(errorInfo.browserName, errorInfo.browserVersion, errorInfo.errorLogs);
    });
}

/**
 * Get Examples Url
 */
function getTestUrls() {
    const config = require(path.resolve(process.cwd(), 'tuidoc.config.json'));
    const filePath = (config.examples || {filePath: ''}).filePath;
    return fs.readdirSync(filePath).reduce((urls, fileName) => {
        if (fileName.match(/html$/)) {
            urls.push(`/${filePath}/${fileName}`);
        }
        return urls;
    }, []);
}

