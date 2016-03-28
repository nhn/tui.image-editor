'use strict';
var mixer = require('../mixin/mixer'),
    createMessage = require('../factory/errorMessage').create;

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
            throw new Error(createMessage('noElement', this.getName()));
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
            throw new Error(createMessage('noView'));
        }

        return name;
    },

    /**
     * HTML Template method
     * @virtual
     */
    template: function() {
        throw new Error(createMessage('unImplementation', 'template'));
    },

    /**
     * Render view
     * @param {jQuery} $wrapper - $Wrapper element
     */
    render: function($wrapper) {
        var ctx = this.templateContext;

        this.destroy();
        this.$element = $(this.template(ctx));
        if ($wrapper) {
            $wrapper.append(this.$element);
        }

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

        $element = this.$element;
        if ($element) {
            $element.remove();
        }
        this.$element = null;
    }
});

mixer.mixin(View, 'Delegator');
module.exports = View;
