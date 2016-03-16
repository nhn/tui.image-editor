'use strict';
var View = require('./../interface/view'),
    Menu = require('./menu'),
    Canvas = require('./canvas'),
    Detail = require('./detail');
var template = require('./../../template/main.hbs');

var Main = tui.util.defineClass(View, {
    init: function(broker) {
        View.call(this, parent);

        /**
         * Components broker
         * @type {Broker}
         */
        this.borker = broker;

        /**
         * Child views
         * @type {Object<string, View>}
         */
        this.childViews = {};

        this.render();
    },

    /**
     * View name
     * @type {string}
     */
    name: 'main',

    /**
     * Render template
     * @type {function}
     */
    template: template,

    /**
     * Template context
     * @type {Object}
     */
    templateContext: {
        className: 'tui-image-editor-main'
    },

    addView: function(view) {
        var name = view.getName(),
            el = view.getElement();

        this.removeView(name);
        this.childViews[name] = view;
        this.$element.append(el);
    },

    removeView: function(viewName) {
        var views = this.childViews,
            view = views[viewName];

        if (view) {
            view.destroy();
            delete views[viewName];
        }
    },

    doAfterRender: function() {
        this.addView(new Menu(this));
        this.addView(new Canvas(this));
        this.addView(new Detail(this));
    },

    doAfterDestroy: function() {
        this.clearChildren();
    },

    clearChildren: function() {
        tui.util.forEach(this.childViews, function(view) {
            view.destroy();
        });
        this.childViews = {};
    }
});

module.exports = Main;
