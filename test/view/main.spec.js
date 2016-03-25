'use strict';

var Main = require('./../../src/js/view/main'),
    BranchView = require('./../../src/js/mixin/mixer').getMixture('branchView');

describe('Main view', function() {
    var main,
        brokerMock = {
            receive: function() {},
            invoke: function() {},
            register: function() {},
            deregister: function() {}
        };

    beforeEach(function() {
        main = new Main(brokerMock);
    });

    it('should have viewName', function() {
        expect(main.getName()).toEqual('main');
    });

    it('should be extended from ViewBranch', function() {
        expect(Main.prototype).toEqual(jasmine.objectContaining(BranchView));
    });
});
