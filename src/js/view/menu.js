'use strict';
var View = require('../interface/view'),
    btnFactory = require('../factory/button'),
    CropSubButtonGroup = require('./CropSubButtonGroup'),
    commands = require('../consts').commands,
    mixer = require('../mixin/mixer');

/**
 * Menu view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Menu = tui.util.defineClass(View, /* @lends Menu.prototype */{
    init: function(parent, $wrapper) {
        View.call(this, parent);
        this.$wrapper = $wrapper;
        this.buttons = [];
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
        this._addChildren();
    },

    /**
     * Add children
     * @private
     */
    _addChildren: function() {
        this.addChild(btnFactory.create(this, {
            name: 'Crop',
            templateContext: {
                text: 'Crop'
            }
        }));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

mixer.mixin(Menu, 'BranchView');
module.exports = Menu;
