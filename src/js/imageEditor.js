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
        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = new Broker();

        /**
         * Main view
         * @type {MainView}
         */
        this.mainView = new MainView(this.broker);
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
