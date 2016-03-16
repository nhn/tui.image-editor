'use strict';

var MainView = require('./../../src/js/view/main');

describe('Main view', function() {
    var mainView,
        brokerMock = {};

    beforeEach(function() {
        mainView = new MainView(brokerMock);
    });

    it('should have viewName', function() {
        expect(mainView.getName()).toEqual('main');
    });

    it('should have jquery element', function() {
        expect(mainView.getElement().jquery).toBeTruthy();
    });
});
