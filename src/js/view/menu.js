'use strict';
var View = require('./../interface/view'),
    BranchView = require('./../interface/branchView'),
    consts = require('./../consts'),
    Button = require('./button');
var template = require('./../../template/container.hbs');

var Menu = tui.util.defineClass(View, {
    init: function(parent) {
        View.call(this, parent);
        this.render();
    },

    name: 'menu',

    templateContext: {
        className: consts.CLASSNAME_PREFIX + '-menu'
    },

    template: template,

    doAfterRender: function() {
        this.addChild(new Button(this, 'Load', {text: 'Load'}));
        this.addChild(new Button(this, 'Save', {text: 'Save'}));
        this.addChild(new Button(this, 'Reset', {text: 'Reset'}));
    },

    doAfterDestroy: function() {
        this.clearChildren();
    }
});

BranchView.mixin(Menu);
module.exports = Menu;
