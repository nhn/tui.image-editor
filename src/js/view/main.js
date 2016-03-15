'use strict';
var View = require('./../interface/view');
var mainTemplate = require('./../../template/main.hbs');

var Main = tui.util.defineClass(View, {
    init: function(options) {
        /**
         *
         * @type {null}
         */
        this.$element = null;

        /**
         * Template context
         * @type {Object}
         */
        this.templateContext = options.templateContext || {};

        /**
         *
         * @type {Object<string, View>}
         */
        this._views = {};

        this._events = {};

        this.render();
    },

    name: 'main',

    hasView: function(view) {
        var name = view.getName();

        return !!this._views[name];
    },

    addView: function(view) {
        var name = view.getName(),
            el = view.getElement();

        this.removeView(name);
        this._views[name] = view;
        this.$element.append(el);
    },

    removeView: function(viewName) {
        var view = this._views[viewName];

        if (view) {
            view.destroy();
        }
    },

    render: function() {
        var ctx = this.templateContext,
            $el = $(mainTemplate(ctx));

        this.$element = $el;
        this.$wrapper.append($el);
    },

    destroy: function() {
        var $element = this.$element;

        tui.util.forEach(this._views, function(view) {
            view.destroy();
        });

        if ($element) {
            $element.remove();
            this.$element = null;
        }
    }
});

module.exports = Main;
