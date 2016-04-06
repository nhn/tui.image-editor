'use strict';

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/* @lends Invoker.prototype */{
    init: function() {
        this.undoStack = [];
        this.redoStack = [];
        this.components = {};
    },

    /**
     * Register component
     * @param {string} name - Component name
     * @param {Component} component - Component handling the canvas
     */
    register: function(name, component) {
        this.components[name] = component;
    },

    /**
     * Invoke command
     * Store the command to the undoStack
     * Clear the redoStack
     * @param {Command} command - Command
     */
    invoke: function(command) {
        command.execute(this.components);
        this.undoStack.push(command);
        this.redoStack = [];
    },

    /**
     * Undo command
     */
    undo: function() {
        var command = this.undoStack.pop();

        if (command) {
            command.undo(this.components);
            this.redoStack.push(command);
        }
    },

    /**
     * Redo command
     */
    redo: function() {
        var command = this.redoStack.pop();

        if (command) {
            command.execute(this.components);
            this.undoStack.push(command);
        }
    }
});

module.exports = Invoker;
