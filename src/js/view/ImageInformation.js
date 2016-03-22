'use strict';

var View = require('./../interface/view'),
    consts = require('./../consts');

var template = require('./../../template/ImageInformation.hbs');

/**
 * @class ImageInformation
 * @extends View
 * @param {Delegator} parent - Parent
 * @param {object} templateContext - Object having image information
 */
var ImageInformation = tui.util.defineClass(View, /* @lends ImageInformation.prototype */{
    init: function(parent, templateContext) {
        View.call(this, parent);
        this.setTemplateContext(templateContext);
        this.render();
    },

    /**
     * View name
     * @type {string}
     */
    name: 'imageInformation',

    /**
     * Template context
     * @type {function}
     */
    template: template,

    // stub
    // @todo: Classname prefix 자동 셋팅 helper
    templateContext: {
        title: 'title',
        imageInformation: 'imageInformation',
        original: 'original',
        current: 'current',
        spanText: 'spanText'
    },

    // stub
    doAfterRender: function() {
        var prefix = consts.CLASSNAME_PREFIX,
            curInfoClass = prefix + '-' + this.templateContext.current;

        this.registerAction('update', $.proxy(function(ctx) {
            ctx.onUpdate = true;
            this.$element.find('.' + curInfoClass).html(this.template(ctx));
        }, this));
    },

    /**
     * Override template context
     * @param {object} templateContext - Template context
     */
    setTemplateContext: function(templateContext) {
        this.templateContext = tui.util.extend(
            {},
            ImageInformation.prototype.templateContext,
            templateContext
        );
    }
});


module.exports = ImageInformation;
