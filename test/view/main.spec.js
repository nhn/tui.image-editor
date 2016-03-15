'use strict';

var MainView = require('./../../src/js/view/main');

describe('Main view', function() {
    var mainView;

    beforeEach(function() {
        mainView = new MainView({
            wrapper: '<div />',
            templateContext: {
                className: 'mainView'
            }
        });
    });

    it('should have viewName', function() {
        expect(mainView.getName()).toEqual('main');
    });

    it('should return jquery element of views', function() {
        mainView.render();
        expect(mainView.getElement().jquery).toBeTruthy();
    });
});
