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
 * @implements {View}
 * @implements {BranchView}
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

    /**
     * Post processing after render
     * It adds children
     */
    doAfterRender: function() {
        this.addChild(new Menu(this));
        this.addChild(new Canvas(this));
        this.addChild(new Detail(this));
    },

    /**
     * Post processing after destroy
     * It clears children
     */
    doAfterDestroy: function() {
        this.clearChildren();
    },

    /**
     * Post a command to broker
     * @param {object} command - Command data
     * @param {function} callback - Callback if succeeded
     */
    postCommand: function(command, callback) {
        this.broker.receive(command, callback);
    }
});

BranchView.mixin(Main);
module.exports = Main;
