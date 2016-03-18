'use strict';

var Menu = require('./../../src/js/view/menu'),
    BranchView = require('./../../src/js/interface/branchView');

describe('Menu view', function() {
    var menu;

    beforeEach(function() {
        menu = new Menu({});
    });

    it('should have view name', function() {
        expect(menu.getName()).toEqual('menu');
    });

    it('should be extended with ViewBranch', function() {
        expect(Menu.prototype).toEqual(jasmine.objectContaining(BranchView.prototype));
    });
});
