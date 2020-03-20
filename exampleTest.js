const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'kimjinwoo4';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'yopqSJLdAq3t6wbtwoXW'
const assert = require('assert');
const http = require('http');
const {Builder} = require('selenium-webdriver');

const HttpAgent = new http.Agent({
    keepAlive: true
});

const urlpreset = 'http://nhn.github.io/tui.image-editor/latest';
const testUrls = [
    // '/examples/example01-includeUi.html',
    // '/examples/example02-useApiDirect.html',
    '/examples/example03-mobile.html'
];

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

if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
    throw Error('Id password required');
}

(async function() {
    try {
        const errorCount = await testAllUrl(testUrls);

        await assert.equal(errorCount, 0);
    } catch(err) {
        console.log(err);
    }
})();

async function testAllUrl(urls) {
    let errorCount = 0;

    for(let i = 0; i <= urls.length - 1; i++) {
        const url = urlpreset + urls[i];
        const errorBrowsersInfo = await testOneUrl(url);

        errorCount += errorBrowsersInfo.length;
        printErrorLog(url, errorBrowsersInfo);
    }

    return errorCount;
}

async function testOneUrl(url) {
    const parallelPendingTests = Object.keys(capabilities).map(index => testAllPlatform(index, url));
    const testResults = await Promise.all(parallelPendingTests);
    return testResults.reduce((errorList, errorInfo) => {
        if (!errorInfo.errorLogs) {
            errorInfo.errorLogs = {message: 'Not exist error catch code snippet in example page'};
            errorList.push(errorInfo);
        } else if (errorInfo.errorLogs.length) {
            errorList.push(errorInfo);
        }
        return errorList;
    }, []);
}

async function testAllPlatform(index, url) {
    const driver = getDriver(index);

    await driver.get(url);
    await driver.wait(function() {
      return driver.executeScript('return document.readyState').then(function(readyState) {
        return readyState === 'complete';
      });
    }, 20000);

    const browserInfo = await driver.getCapabilities();
    const errorLogs = await driver.executeScript('return window.errorLogs');

    driver.quit();

    return {
        browserName: browserInfo.get("browserName"),
        browserVersion: browserInfo.get("version") || browserInfo.get("browserVersion"),
        errorLogs
    };
}

function getDriver(index) {
    return new Builder()
        .usingHttpAgent(HttpAgent)
        .withCapabilities(Object.assign({}, capabilities[index], {build: `examplePageTest-${new Date().toLocaleDateString()}`}))
        .usingServer(`http://${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}@hub.browserstack.com/wd/hub`)
        .build();
}

function printErrorLog(url, errorBrowsersInfo) {
    console.log(url);
    errorBrowsersInfo.forEach(errorInfo => {
        console.log(errorInfo.browserName, errorInfo.browserVersion, errorInfo.errorLogs);
    });
}

