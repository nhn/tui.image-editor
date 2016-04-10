'use strict';
var View = require('../interface/view');
var viewNames = require('../consts').viewNames;

/**
 * Canvas view
 * @extends View
 * @class Canvas
 * @param {Delegator} parent - Parent delegator
 * @param {jQuery} $wrapper - Wrapper jquery element
 */
var Canvas = tui.util.defineClass(View, /* @lends Canvas.prototype */{
    init: function(parent, $wrapper) {
        View.call(this, parent, $wrapper);
    },

    /**
     * View name
     * @type {string}
     */
    name: viewNames.CANVAS,

    /**
     * Post processing after render
     * It posts a command to register canvas element
     */
    doAfterRender: function() {
        var $el = this.$wrapper.find('canvas');

        this.setElement($el);
        this.getEditor().setCanvasElement($el[0]);

        // fabricCanvas create a new wrapper element
        this.$wrapper = $el.parent();
    }
});

module.exports = Canvas;
