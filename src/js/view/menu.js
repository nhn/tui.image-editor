'use strict';
var View = require('./../base/view');

var Menu = tui.util.defineClass(View, {
    init: function() {
        View.call(this, 'menu');
    }
});

module.exports = Menu;
