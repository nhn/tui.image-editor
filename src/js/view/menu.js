'use strict';
var View = require('./../interface/view'),
    Button = require('./button'),
    mixer = require('./../mixin/mixer');

var template = require('./../../template/container.hbs');

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

mixer.mixin(Menu, 'BranchView');
module.exports = Menu;
