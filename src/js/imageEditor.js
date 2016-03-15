'use strict';

var ImageEditor = tui.util.defineClass({
    init: function() {
        /**
         * Components borker
         * It receives the command
         */
        this.borker = null;

        /**
         * View manager
         * It builds and handles the view
         */
        this.viewManager = null;
    }
});

module.exports = ImageEditor;
