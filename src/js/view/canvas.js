'use strict';
var View = require('./../interface/view');
var template = require('./../../template/canvas.hbs');

var Canvas = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);

        this.render();
    },

    name: 'canvas',

    templateContext: {
        className: 'tui-image-editor-canvas'
    },

    template: template
});

module.exports = Canvas;
