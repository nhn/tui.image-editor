'use strict';
var View = require('../interface/view'),
    btnFactory = require('../factory/button'),
    CropSubButtonGroup = require('./CropSubButtonGroup'),
    commands = require('../consts').commands,
    mixer = require('../mixin/mixer');

var template = require('../../template/container.hbs');

/**
 * Menu view
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Menu = tui.util.defineClass(View, /* @lends Menu.prototype */{
    init: function(parent) {
        View.call(this, parent);
    },

    /**
     * View name
     * @type {string}
     */
    name: 'menu',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        name: 'menu'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * It adds buttons
     */
    doAfterRender: function() {
        this._addChildren();
        this._registerActions();
    },

    _addChildren: function() {
        this.addChild(btnFactory.create(this, {
            name: 'Crop',
            templateContext: {
                text: 'Crop'
            },
            clickCommand: {
                name: commands.START_CROPPING
            }
        }));
    },

    _registerActions: function() {
        this.registerAction(commands.START_CROPPING, function() {
            this.addChild(new CropSubButtonGroup(this));
        }, this);
        this.registerAction(commands.END_CROPPING, function() {
            this.removeChild('subButtonGroup');
        }, this);
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
