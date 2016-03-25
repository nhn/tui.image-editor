'use strict';

var Detail = require('./../../src/js/view/detail'),
    mixer = require('./../../src/js/mixin/mixer');

describe('Detail view', function() {
    var branchView = mixer.getMixture('BranchView'),
        detail;

    beforeEach(function() {
        detail = new Detail({
            getParent: function() {},
            registerAction: function() {}
        });
    });

    it('should have view name', function() {
        expect(detail.getName()).toEqual('detail');
    });

    it('should be extended from BranchView', function() {
        expect(Detail.prototype).toEqual(jasmine.objectContaining(branchView));
    });
});
