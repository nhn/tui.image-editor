'use strict';
var View = require('./../base/view');

var Canvas = tui.util.defineClass(View, {
    init: function() {
        View.call(this, 'canvas');
    }
});

module.exports = Canvas;
