'use strict';
var mixer = require('./../mixin/mixer'),
    createError = require('./../factory/error').create;

/**
 * View interface
 * @class View
 * @mixes Delegator
 * @param {View} parent - Parent view
 */
var View = tui.util.defineClass(/* @lends View.prototype */{
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
            throw createError('noElement', this.getName());
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
            throw createError('noView');
        }

        return name;
    },

    /**
     * HTML Template method
     * @virtual
     */
    template: function() {
        throw createError('unImplementation', 'template');
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
        var $element;

        if (this.doBeforeDestroy) {
            this.doBeforeDestroy();
        }

        this.deregisterAction(this);
        $element = this.$element;
        if ($element) {
            $element.remove();
        }
        this.$element = null;
    }
});

mixer.mixin(View, 'Delegator');
module.exports = View;
