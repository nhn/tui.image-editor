'use strict';

/**
 * @class BranchView
 * @mixin
 */
var BranchView = tui.util.defineClass(/* @lends BranchView.prototype */{
    static: {
        /**
         * Mixin
         * @param {Function} Target - Target constructor
         */
        mixin: function(Target) {
            tui.util.extend(Target.prototype, BranchView.prototype);
        }
    },
    init: function() {
        this._children = {};
    },

    /**
     * Add child
     * @param {View} view - View instance
     */
    addChild: function(view) {
        var name = view.getName(),
            el = view.getElement();

        this._children = this._children || {};
        this.removeChild(name);
        this._children[name] = view;
        this.$element.append(el);
    },

    /**
     * Remove child
     * @param {string} viewName - View name
     */
    removeChild: function(viewName) {
        var views = this._children,
            view = views[viewName];

        if (view) {
            view.destroy();
            delete views[viewName];
        }
    },

    /**
     * Clear children
     */
    clearChildren: function() {
        tui.util.forEach(this._children, function(view) {
            view.destroy();
        });
        this._children = {};
    }
});

module.exports = BranchView;
