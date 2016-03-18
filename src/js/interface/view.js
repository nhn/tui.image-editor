'use strict';
var consts = require('./../consts');

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

        /**
         * Parent view or null
         * @type {View|null}
         */
        this._parentView = parent;
    },

    /**
     * Return jquery element
     * @returns {jQuery}
     */
    getElement: function() {
        var $element = this.$element;

        if (!$element) {
            throw new Error(consts.messages.NO_ELEMENT);
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
            throw new Error(consts.messages.NO_VIEW_NAME);
        }

        return name;
    },

    /**
     * HTML Template method
     */
    template: function() {
        throwNotImplementedError('template');
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
    },

    /**
     * Return parentView.
     * If the view is root, return null
     * @returns {View|null}
     */
    getParentView: function() {
        return this._parentView;
    },

    /**
     * Return root view
     * @returns {View}
     */
    getRoot: function() {
        var nextView = this.getParentView(),
        /* eslint-disable consistent-this */
            currentView = this;
        /* eslint-enable consistent-this */

        while (nextView) {
            currentView = nextView;
            nextView = currentView.getParentView();
        }

        return currentView;
    },

    /**
     * Post a command to broker
     * The root will be override this method
     * @param {object} command - Command data
     * @param {function} callback - Callback if succeeded
     */
    postCommand: function(command, callback) {
        var root = this.getRoot();

        if (this.postCommand === root.postCommand) {
            throwNotImplementedError('postCommand');
        }

        root.postCommand(command, callback);
    }
});

/**
 * Throw error: NOT_IMPLEMENTED
 * @param {string} name - Method name
 */
function throwNotImplementedError(name) {
    throw new Error(consts.messages.NOT_IMPLEMENTED + ': ' + name);
}

module.exports = View;
