'use strict';
var View = require('../interface/view'),
    mixer = require('../mixin/mixer'),
    btnFactory = require('../factory/button'),
    commands = require('../consts').commands;

var template = require('../../template/container.hbs');

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
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'subButtonGroup'
    },

    /**zw
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     */
    doAfterRender: function() {
        this.addChild(btnFactory.create(this, {
            name: 'Apply',
            templateContext: {
                text: 'Apply'
            },
            clickCommand: {
                name: commands.ON_CROP_END,
                args: 'apply'
            }
        }));
        this.addChild(btnFactory.create(this, {
            name: 'Cancel',
            templateContext: {
                text: 'Cancel'
            },
            clickCommand: {
                name: commands.ON_CROP_END,
                args: 'cancel'
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
