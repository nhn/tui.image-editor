'use strict';

var ViewManager = require('./viewManager'),
    Broker = require('./broker');

var ImageEditor = tui.util.defineClass({
    init: function(wrapper) {
        /**
         * Components broker
         * @type {Broker}
         */
        this.borker = new Broker();

        /**
         * View manager
         * @type {ViewManager}
         */
        this.viewManager = new ViewManager(wrapper, this.borker);
    }
});

module.exports = ImageEditor;
