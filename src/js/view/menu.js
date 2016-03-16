'use strict';
var View = require('./../interface/view');
var template = require('./../../template/menu.hbs');

var Menu = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);

        this.render();
    },

    name: 'menu',

    templateContext: {
        className: 'tui-image-editor-menu'
    },

    template: template
});

module.exports = Menu;
