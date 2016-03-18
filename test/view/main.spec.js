'use strict';

var Main = require('./../../src/js/view/main'),
    BranchView = require('./../../src/js/interface/branchView');

describe('Main view', function() {
    var main,
        brokerMock = {
            receive: jasmine.createSpy()
        };

    beforeEach(function() {
        main = new Main(brokerMock);
    });

    it('should have viewName', function() {
        expect(main.getName()).toEqual('main');
    });

    it('should be extended from ViewBranch', function() {
        expect(Main.prototype).toEqual(jasmine.objectContaining(BranchView.prototype));
    });
});
