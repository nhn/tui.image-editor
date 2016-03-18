'use strict';
var Delegator = require('./../interface/delegator'),
    errorThrower = require('./../errorThrower');

/**
 * View interface
 * @interface
 * @param {View} parent - Parent view
 */
var View = tui.util.defineClass({
    init: function(parent) {
        /**
         * jQuery Element
         * @type {jQuery}
         */
        this.$element = null;

        this.setParent(parent);
    },

    /**
     * Return jquery element
     * @returns {jQuery}
     */
    getElement: function() {
        var $element = this.$element;

        if (!$element) {
            errorThrower.throwNoElement(this.getName());
        }

        return $element;
    },

    /**
     * Return view name
     * @returns {string}
     */
    getName: function() {
        var name = this.name;

        if (!name) {
            errorThrower.throwNoView();
        }

        return name;
    },

    /**
     * HTML Template method
     */
    template: function() {
        errorThrower.throwUnImplementation('template');
    },

    /**
     * Render view
     */
    render: function() {
        var ctx = this.templateContext;

        this.destroy();
        this.$element = $(this.template(ctx));

        if (this.doAfterRender) {
            this.doAfterRender();
        }
    },

    /**
     * Destroy view
     */
    destroy: function() {
        var $element = this.$element;

        if ($element) {
            $element.remove();
        }
        this.$element = null;

        if (this.doAfterDestroy) {
            this.doAfterDestroy();
        }
    }
});

Delegator.mixin(View);
module.exports = View;
