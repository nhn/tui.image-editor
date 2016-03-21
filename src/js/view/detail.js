'use strict';
var View = require('./../interface/view'),
    BranchView = require('./../interface/branchView'),
    consts = require('./../consts');
var template = require('./../../template/detail.hbs');

/**
 * Detail view
 * @extends {View}
 * @mixin {BranchView}
 * @class
 * @param {Delegator} parent - Parent delegator
 */
var Detail = tui.util.defineClass(View, /* @lends Detail.prototype */{
    init: function(parent) {
        View.call(this, parent);
        this.render();
    },

    /**
     * View name
     * @type {string}
     */
    name: 'detail',

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        classNames: {
            container: consts.CLASSNAME_PREFIX + '-detail',
            imageInfo: consts.CLASSNAME_PREFIX + '-image-info',
            setting: consts.CLASSNAME_PREFIX + '-setting'
        }
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * @todo: imageInfo, detailSetting 나누기
     */
    doAfterRender: function() {

    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

BranchView.mixin(Detail);
module.exports = Detail;
