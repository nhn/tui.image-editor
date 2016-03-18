'use strict';

var Detail = require('./../../src/js/view/detail'),
    BranchView = require('./../../src/js/interface/branchView');

describe('Detail view', function() {
    var detail;

    beforeEach(function() {
        detail = new Detail({});
    });

    it('should have view name', function() {
        expect(detail.getName()).toEqual('detail');
    });

    it('should be extended from ViewBranch', function() {
        expect(Detail.prototype).toEqual(jasmine.objectContaining(BranchView.prototype));
    });
});
