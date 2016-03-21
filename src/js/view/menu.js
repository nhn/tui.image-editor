'use strict';
var View = require('./../interface/view'),
    BranchView = require('./../interface/branchView'),
    consts = require('./../consts'),
    Button = require('./button');
var template = require('./../../template/container.hbs');

/**
 * Menu view
 * @extends {View}
 * @mixin {BranchView}
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Menu = tui.util.defineClass(View, /* @lends Menu.prototype */{
    init: function(parent) {
        View.call(this, parent);
        this.render();
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
        className: consts.CLASSNAME_PREFIX + '-menu'
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
        this.addChild(new Button(this, 'Load', {text: 'Load'}));
        this.addChild(new Button(this, 'Save', {text: 'Save'}));
        this.addChild(new Button(this, 'Reset', {text: 'Reset'}));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

BranchView.mixin(Menu);
module.exports = Menu;
