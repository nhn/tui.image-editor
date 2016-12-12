const testsContext = require.context('.', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);

const srcContexts = require.context('../src', true, /index\.js$/);
srcContexts.keys().forEach(srcContexts);
