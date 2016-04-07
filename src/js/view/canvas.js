'use strict';
var View = require('../interface/view');
var viewNames = require('../consts').viewNames;

/**
 * Canvas view
 * @extends View
 * @class Canvas
 * @param {Delegator} parent - Parent delegator
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
        this.getEditor().mainHandler.setCanvasElement($el[0]);
    }
});

module.exports = Canvas;
