'use strict';
var View = require('./../interface/view'),
    BranchView = require('./../interface/branchView'),
    Menu = require('./menu'),
    Canvas = require('./canvas'),
    Detail = require('./detail'),
    consts = require('../consts');

var template = require('./../../template/container.hbs');

/**
 * MainView Class
 * @extends {View}
 * @mixin {BranchView}
 * @Class
 * @param {Broker} broker - Components broker
*/
var Main = tui.util.defineClass(View, {
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
     */
    templateContext: {
        className: consts.CLASSNAME_PREFIX + '-main'
    },

    /**
     * Render template
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
     * @param {object} command - Command data
     * @param {function} callback - Callback if succeeded
     */
    postCommand: function(command, callback) {
        this.broker.receive(command, callback);
    },

    /**
     * Register action(s) to broker
     */
    registerAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    }
});

BranchView.mixin(Main);
module.exports = Main;
