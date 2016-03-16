'use strict';

var ViewManager = require('./viewManager'),
    Broker = require('./broker');

var ImageEditor = tui.util.defineClass({
    init: function(wrapper) {
        /**
         * Components borker
         * It receives the command
         */
        this.borker = new Broker();

        /**
         * View manager
         * It builds and handles the view
         */
        this.viewManager = new ViewManager(wrapper, this.borker);
    }
});

module.exports = ImageEditor;
