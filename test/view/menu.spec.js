'use strict';

var MenuView = require('./../../src/js/view/menu'),
    BranchView = require('./../../src/js/interface/branchView');

describe('Menu view', function() {
    var menu;

    beforeEach(function() {
        menu = new MenuView({});
    });

    it('should have view name', function() {
        expect(menu.getName()).toEqual('menu');
    });

    it('should be extended with ViewBranch', function() {
        expect(MenuView.prototype).toEqual(jasmine.objectContaining(BranchView.prototype));
    });
});
