'use strict';
var View = require('../interface/view');

/**
 * Menu view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 * @param {jQuery} $wrapper - Wrapper jquery element
 */
var Menu = tui.util.defineClass(View, /* @lends Menu.prototype */{
    init: function(parent, $wrapper) {
        View.call(this, parent, $wrapper);

        /**
         * Undo button
         * @type {View}
         */
        this.undoBtn = null;

        /**
         * Redo button
         * @type {View}
         */
        this.redoBtn = null;

        /**
         * Crop button
         * @type {View}
         */
        this.cropBtn = null;
    },

    /**
     * View name
     * @type {string}
     */
    name: 'menu',

    /**
     * Processing after render
     * It adds buttons
     */
    doAfterRender: function() {
        this.setElement(this.$wrapper);
    },

    /**
     * Add children
     * @private
     */
    _addChildren: function() {
        this.buttons
    }
});

module.exports = Menu;
