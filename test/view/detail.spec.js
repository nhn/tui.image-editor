'use strict';

var Detail = require('./../../src/js/view/detail');

describe('Canvas view', function() {
    var detail;

    beforeEach(function() {
        detail = new Detail({});
    });

    it('should have view name', function() {
        expect(detail.getName()).toEqual('detail');
    });
});
