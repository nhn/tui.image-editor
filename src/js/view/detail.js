'use strict';
var View = require('./../base/view');

var Detail = tui.util.defineClass(View, {
    init: function() {
        View.call(this, 'detail');
    }
});

module.exports = Detail;
