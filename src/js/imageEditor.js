'use strict';

var MainView = require('./view/main'),
    MainHandler = require('./handler/main'),
    Broker = require('./broker'),
    commands = require('./consts').commands;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} wrapper - Wrapper element or selector
 */
var ImageEditor = tui.util.defineClass({
    init: function(wrapper) {
        var broker = new Broker();

        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = broker;

        /**
         * Main components
         * @type {Canvas}
         */
        this.mainHandler = new MainHandler(broker);

        /**
         * Main view
         * @type {MainView}
         */
        this.mainView = new MainView(broker, wrapper);
    },

    // stub
    loadImageFromURL: function(url) {
        this.broker.invoke({
            name: commands.LOAD_IMAGE_FROM_URL,
            args: url
        });
    }
});

module.exports = ImageEditor;
