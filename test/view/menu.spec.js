'use strict';

var Menu = require('./../../src/js/view/menu');

describe('Canvas view', function() {
    var menu;

    beforeEach(function() {
        menu = new Menu({});
    });

    it('should have view name', function() {
        expect(menu.getName()).toEqual('menu');
    });
});
