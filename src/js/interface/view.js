'use strict';
var mixer = require('../mixin/mixer'),
    errorMessage = require('../factory/errorMessage');

var createMessage = errorMessage.create,
    errorTypes = errorMessage.types;

/**
 * View interface
 * @class View
 * @mixes Delegator
 * @param {View} parent - Parent view
 */
var View = tui.util.defineClass(/* @lends View.prototype */{
    init: function(parent, $wrapper) {
        /**
         * jQuery Element
         * @type {jQuery}
         */
        this.$wrapper = $wrapper;

        this.setParent(parent);
    },

    /**
     * Return jquery element
     * @returns {jQuery}
     */
    getElement: function() {
        return this.$element;
    },

    /**
     * Set jquery element
     * @param {jQuery} $element - jQuery element
     */
    setElement: function($element) {
        this.$element = $element;
    },

    /**
     * Return view name
     * @returns {string}
     */
    getName: function() {
        var name = this.name;

        if (!name) {
            throw new Error(createMessage(errorTypes.NO_VIEW_NAME));
        }

        return name;
    },

    /**
     * HTML Template method
     * @returns {string}
     * @protected
     */
    template: function() {
        return '';
    },

    /**
     * Render view
     */
    render: function() {
        var ctx = this.templateContext;

        this.destroy();
        this.$element = $(this.template(ctx));

        if (this.$wrapper) {
            this.$wrapper.append(this.$element);
        }

        if (this.doAfterRender) {
            this.doAfterRender();
        }
    },

    /**
     * Destroy view
     */
    destroy: function() {
        if (this.doBeforeDestroy) {
            this.doBeforeDestroy();
        }
        if (this.$element) {
            this.$element.remove();
            this.$element = null;
        }
    },

    /**
     * Get image editor
     * @returns {ImageEditor}
     */
    getEditor: function() {
        return this.getRoot().getEditor();
    }
});

mixer.mixin(View, 'Delegator');
module.exports = View;
