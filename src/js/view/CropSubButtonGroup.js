'use strict';
var View = require('../interface/view'),
    mixer = require('../mixin/mixer'),
    btnFactory = require('../factory/button'),
    commands = require('../consts').commands;

/**
 * Detail view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var CropSubButtonGroup = tui.util.defineClass(View, /* @lends Detail.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'subButtonGroup',

    /**
     * Processing after render
     */
    doAfterRender: function() {
        this.addChild(btnFactory.create(this, {
            name: 'Apply',
            templateContext: {
                text: 'Apply'
            }
        }));
        this.addChild(btnFactory.create(this, {
            name: 'Cancel',
            templateContext: {
                text: 'Cancel'
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

mixer.mixin(CropSubButtonGroup, 'BranchView');
module.exports = CropSubButtonGroup;
