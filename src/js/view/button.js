'use strict';
var View = require('./../interface/view'),
    consts = require('./../consts');
var template = require('./../../template/button.hbs');

/**
 * Button view
 * @extends {View}
 * @Class
 * @param {Delegator} parent - Parent delegator
 * @param {string} name - Button name
 * @param {object} templateContext - Template context
 */
var Button = tui.util.defineClass(View, {
    init: function(parent, name, templateContext) {
        View.call(this, parent);

        /**
         * Button name
         * @type {string}
         */
        this.name = name;

        this.setTemplateContext(templateContext);
        this.render();
    },

    /**
     * Default button name
     * It will be overridden
     * @type {string}
     */
    name: 'button',

    /**
     * Template context
     * It will be overridden
     * @type {Object}
     */
    templateContext: {
        className: consts.CLASSNAME_PREFIX + '-button'
    },

    /**
     * Render template
     * @type {function}
     */
    template: template,

    /**
     * Override template context
     * @param {object} templateContext - Template context
     * @todo: template context 오버라이드 방식 개선??
     */
    setTemplateContext: function(templateContext) {
        this.templateContext = tui.util.extend(
            {},
            Button.prototype.templateContext,
            templateContext
        );
    },

    /**
     * Bind event handlers
     */
    on: function() {
        var $el = this.$element;

        $el.on.apply($el, arguments);
    }
});

module.exports = Button;
