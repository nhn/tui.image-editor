'use strict';

var MainView = require('./../../src/js/view/main'),
    BranchView = require('./../../src/js/interface/branchView');

describe('Main view', function() {
    var mainView,
        brokerMock = {
            receive: jasmine.createSpy()
        };

    beforeEach(function() {
        mainView = new MainView(brokerMock);
    });

    it('should have viewName', function() {
        expect(mainView.getName()).toEqual('main');
    });

    it('should be extended from ViewBranch', function() {
        expect(MainView.prototype).toEqual(jasmine.objectContaining(BranchView.prototype));
    });
});
