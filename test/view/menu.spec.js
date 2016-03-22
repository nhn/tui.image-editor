'use strict';

var Menu = require('./../../src/js/view/menu'),
    BranchView = require('./../../src/js/mixin/mixer').getMixture('branchView');

describe('Menu view', function() {
    var menu;

    beforeEach(function() {
        menu = new Menu({});
    });

    it('should have view name', function() {
        expect(menu.getName()).toEqual('menu');
    });

    it('should be mixed with BranchView', function() {
        expect(Menu.prototype).toEqual(jasmine.objectContaining(BranchView));
    });
});
