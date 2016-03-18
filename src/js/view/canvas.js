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
        className: consts.CLASSNAME_PREFIX + '-canvas',
        canvasWidth: 500,
        canvasHeight: 500
    },

    template: template,

    doAfterRender: function() {
        this.postCommand({
            name: 'setCanvasElement',
            args: this.$element.find('canvas')[0]
        });
    }
});

module.exports = Canvas;
