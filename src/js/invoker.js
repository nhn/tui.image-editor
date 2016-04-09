'use strict';

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/* @lends Invoker.prototype */{
    init: function(mainComponent) {
        /**
         * Undo stack
         * @type {Array.<Command>}
         */
        this.undoStack = [];

        /**
         * Redo stack
         * @type {Array.<Command>}
         */
        this.redoStack = [];

        /**
         * Component map
         * @type {Object.<string, Component>}
         */
        this.componentMap = {};

        this._createComponents(mainComponent);
    },

    /**
     * Create components
     * @param {Component} main - Main component
     * @private
     */
    _createComponents: function(main) {
        this._register(main);
        this._register(new ImageLoader(main));
        this._register(new Cropper(main));
    },

    /**
     * Register component
     * @param {Component} component - Component handling the canvas
     * @private
     */
    _register: function(component) {
        this.componentMap[component.getName()] = component;
    },

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    get: function(name) {
        return this.componentMap[name];
    },

    /**
     * Invoke command
     * Store the command to the undoStack
     * Clear the redoStack
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     */
    invoke: function(command) {
        var self = this;

        return $.when(command.execute(this.componentMap))
            .done(command.executionCallback)
            .done(function() {
                self.undoStack.push(command);
                self.clearRedoStack();
            });
    },

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo: function() {
        var command = this.undoStack.pop();
        var self = this;
        var dfd;

        if (command) {
            dfd = $.when(command.undo(this.componentMap))
                .done(command.undoerCallback)
                .done(function() {
                    self.redoStack.push(command);
                });
        } else {
            dfd = $.Deferred().reject();
        }

        return dfd;
    },

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo: function() {
        var command = this.redoStack.pop();
        var self = this;
        var dfd;

        if (command) {
            dfd = $.when(command.execute(this.componentMap))
                .done(command.executionCallback)
                .done(function() {
                    self.undoStack.push(command);
                });
        } else {
            dfd = $.Deferred().reject();
        }

        return dfd;
    },

    /**
     * Return whether the redoStack is empty
     * @returns {boolean}
     */
    isEmptyRedoStack: function() {
        return !!this.redoStack.length;
    },

    /**
     * Return whether the undoStack is empty
     * @returns {boolean}
     */
    isEmptyUndoStack: function() {
        return !!this.undoStack.length;
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this.undoStack = [];
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this.redoStack = [];
    }
});

module.exports = Invoker;
