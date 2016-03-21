'use strict';

var View = require('./../interface/view');

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
     * @type {Object}
     */
    template: template,

    // stub
    // @todo: Classname prefix 자동 셋팅 helper
    templateContext: {
        classNames: {
            imageInformation: '-imageInformation',
            original: '-original',
            current: '-current',
            spanText: '-spanText'
        }
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
