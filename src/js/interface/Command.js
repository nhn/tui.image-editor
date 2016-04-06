'use strict';

var msgFactory = require('../factory/errorMessage');

/**
 * Command class
 * @class
 * @param {{name: string, execute: function, undo: function}} actions - Command actions
 */
var Command = tui.util.defineClass({
    init: function(actions) {
        /**
         * Command name
         * @type {string}
         */
        this.name = actions.name || 'unknownCommand';

        /**
         * Execute function
         * @type {function}
         */
        this.execute = actions.execute;

        /**
         * Undo function
         * @type {function}
         */
        this.undo = actions.undo;
    },

    /**
     * Execute action
     * @abstract
     */
    execute: function() {
        throw new Error(msgFactory.unimplementation(this.name + '.execute'));
    },

    /**
     * Undo action
     * @abstract
     */
    undo: function() {
        throw new Error(msgFactory.unimplementation(this.name + '.undo'));
    }
});

module.exports = Command;
