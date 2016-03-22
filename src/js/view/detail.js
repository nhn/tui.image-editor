'use strict';
var View = require('./../interface/view'),
    ImageInformation = require('./imageInformation'),
    mixer = require('./../mixin/mixer');

var template = require('./../../template/container.hbs');

/**
 * Detail view
 * @extends View
 * @mixes BranchView
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
        name: 'detail'
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
        this.registerAction('onLoad', $.proxy(function(templateContext) {
            this.addChild(new ImageInformation(this, templateContext));
        }, this));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    }
});

mixer.mixin(Detail, 'BranchView');
module.exports = Detail;
