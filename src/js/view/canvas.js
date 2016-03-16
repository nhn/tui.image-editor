'use strict';
var View = require('./../interface/view'),
    consts = require('./../consts');
var template = require('./../../template/canvas.hbs');

var Canvas = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);

        this.render();
    },

    name: 'canvas',

    templateContext: {
        className: consts.CLASSNAME_PREFIX + '-canvas'
    },

    template: template
});

module.exports = Canvas;
