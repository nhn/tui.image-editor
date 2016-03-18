'use strict';

/**
 * BranchView
 * @interface
 */
var BranchView = tui.util.defineClass({
    static: {
        mixin: function(Target) {
            tui.util.extend(Target.prototype, BranchView.prototype);
        }
    },

    init: function() {
        this._children = {};
    },

    addChild: function(view) {
        var name = view.getName(),
            el = view.getElement();

        this._children = this._children || {};
        this.removeChild(name);
        this._children[name] = view;
        this.$element.append(el);
    },

    removeChild: function(viewName) {
        var views = this._children,
            view = views[viewName];

        if (view) {
            view.destroy();
            delete views[viewName];
        }
    },

    clearChildren: function() {
        tui.util.forEach(this._children, function(view) {
            view.destroy();
        });
        this._children = {};
    }
});

module.exports = BranchView;
