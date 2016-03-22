'use strict';
var View = require('./../interface/view'),
    Menu = require('./menu'),
    Canvas = require('./canvas'),
    Detail = require('./detail'),
    mixer = require('./../mixin/mixer');

var template = require('./../../template/container.hbs');

/**
 * MainView Class
 * @extends View
 * @mixes BranchView
 * @class
 * @param {Broker} broker - Components broker
*/
var Main = tui.util.defineClass(View, /* @lends Main.prototype */{
    init: function(broker) {
        View.call(this);

        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = broker;

        this.render();
    },

    /**
     * View name
     * @type {string}
     */
    name: 'main',

    /**
     * Template context
     * @type {Object}
     // @todo: Classname prefix 자동 셋팅 helper
     */
    templateContext: {
        name: 'main'
    },

    /**
     * Render template
     * @override
     * @type {function}
     */
    template: template,

    /**
     * Processing after render
     * It adds children
     */
    doAfterRender: function() {
        this.addChild(new Menu(this));
        this.addChild(new Canvas(this));
        this.addChild(new Detail(this));
    },

    /**
     * Processing before destroy
     * It clears children
     */
    doBeforeDestroy: function() {
        this.clearChildren();
    },

    /**
     * Post a command to broker
     * @override
     * @param {object} command - Command data
     * @param {function} callback - Callback if succeeded
     */
    postCommand: function(command, callback) {
        this.broker.receive(command, callback);
    },

    /**
     * Register action(s) to broker
     * @override
     */
    registerAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    }
});

mixer.mixin(Main, 'BranchView');
module.exports = Main;
