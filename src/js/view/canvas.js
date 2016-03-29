'use strict';
var View = require('../interface/view'),
    commands = require('../consts').commands;
var template = require('../../template/canvas.hbs');

/**
 * Canvas view
 * @extends View
 * @class Canvas
 * @param {Delegator} parent - Parent delegator
 */
var Canvas = tui.util.defineClass(View, /* @lends Canvas.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'canvas',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'canvas',
        canvasWidth: 600,
        canvasHeight: 600
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Post processing after render
     * It posts a command to register canvas element
     */
    doAfterRender: function() {
        this.postCommand({
            name: commands.SET_CANVAS_ELEMENT,
            args: this.$element.find('canvas')[0]
        });
    }
});

module.exports = Canvas;
