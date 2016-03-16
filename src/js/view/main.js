'use strict';
var View = require('./../interface/view'),
    Menu = require('./menu'),
    Canvas = require('./canvas'),
    Detail = require('./detail'),
    consts = require('../consts');
var template = require('./../../template/main.hbs');

var Main = tui.util.defineClass(View, {
    init: function(broker) {
        View.call(this, parent);

        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = broker;

        /**
         * Child views
         * @type {Object<string, View>}
         */
        this.children = {};

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
        className: consts.CLASSNAME_PREFIX + '-main'
    },

    addChild: function(view) {
        var name = view.getName(),
            el = view.getElement();

        this.removeChild(name);
        this.children[name] = view;
        this.$element.append(el);
    },

    removeChild: function(viewName) {
        var views = this.children,
            view = views[viewName];

        if (view) {
            view.destroy();
            delete views[viewName];
        }
    },

    clearChildren: function() {
        tui.util.forEach(this.children, function(view) {
            view.destroy();
        });
        this.children = {};
    },

    doAfterRender: function() {
        this.addChild(new Menu(this));
        this.addChild(new Canvas(this));
        this.addChild(new Detail(this));
    },

    doAfterDestroy: function() {
        this.clearChildren();
    },

    postCommand: function(data, callback) {
        this.broker.receive(data, callback);
    }
});

module.exports = Main;
