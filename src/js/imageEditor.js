'use strict';

var MainView = require('./view/main'),
    Broker = require('./broker');

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

        //this.mainComponent = new MainComponent(broker)

        /**
         * Main view
         * @type {MainView}
         */
        this.mainView = new MainView(broker);
        $(wrapper).append(this.mainView.getElement());
    },

    // stub
    loadImageFromURL: function(url) {
        this.broker.receive({
            name: 'loadImageFromURL',
            args: url
        });
    }
});

module.exports = ImageEditor;
