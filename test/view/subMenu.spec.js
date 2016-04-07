'use strict';

var SubMenu = require('./../../src/js/view/subMenu'),
    mixer = require('./../../src/js/mixin/mixer');

describe('SubMenu view', function() {
    var detail;

    beforeEach(function() {
        detail = new SubMenu({
            getParent: function() {},
            registerAction: function() {}
        });
    });

    it('should have view name', function() {
        expect(detail.getName()).toEqual('SubMenu');
    });
});
