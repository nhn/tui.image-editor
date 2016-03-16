'use strict';
var View = require('./../interface/view'),
    consts = require('./../consts');
var template = require('./../../template/menu.hbs');

var Menu = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);

        this.render();
    },

    name: 'menu',

    templateContext: {
        className: consts.CLASSNAME_PREFIX + '-menu'
    },

    template: template
});

module.exports = Menu;
