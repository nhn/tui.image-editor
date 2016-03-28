'use strict';
var View = require('../interface/view');
var template = require('../../template/button.hbs');

/**
 * @extends View
 * @class Button
 * @param {Delegator} parent - Parent delegator
 * @param {string} name - Button name
 * @param {object} templateContext - Template context
 */
var Button = tui.util.defineClass(View, /* @lends Button.prototype */{
    init: function(parent, option) {
        View.call(this, parent);
        option = option || {};
        /**
         * Button name
         * @type {string}
         */
        this.name = option.name;

        this.setTemplateContext(option.templateContext);
    },

    /**
     * Template context
     * It will be overridden
     * @type {Object}
     */
    templateContext: {
        buttonName: 'button'
    },

    /**
     * Render template
     * @override
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

    doAfterRender: function() {
        this._attachEvents();
    },

    _attachEvents: function() {
        var self = this;

        switch (this.name.toLowerCase()) {
            case 'load':
                this.$element.on('change', function(event) {
                    console.log(event.target);
                    self.postCommand({

                    });
                });
                break;
            default:
                break;
        }
    }
});

module.exports = Button;
