'use strict';
var View = require('./../interface/view'),
    consts = require('./../consts');
var template = require('./../../template/canvas.hbs');

/**
 * Canvas view
 * @extends {View}
 * @Class
 * @param {Delegator} parent - Parent delegator
 */
var Canvas = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);
        this.render();
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
        className: consts.CLASSNAME_PREFIX + '-canvas',
        canvasWidth: 500,
        canvasHeight: 500
    },

    /**
     * Render template
     * @type {function}
     */
    template: template,

    /**
     * Post processing after render
     * It posts a command to register canvas element
     */
    doAfterRender: function() {
        this.postCommand({
            name: 'setCanvasElement',
            args: this.$element.find('canvas')[0]
        });
    }
});

module.exports = Canvas;
