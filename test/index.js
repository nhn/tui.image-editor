'use strict';
var testsContext = require.context('.', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);

var srcContexts = require.context('../src', true, /index\.js$/);
srcContexts.keys().forEach(srcContexts);
