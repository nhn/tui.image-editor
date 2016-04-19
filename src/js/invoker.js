'use strict';

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');
var MainComponent = require('./component/main');
var Flip = require('./component/flip');
var Rotation = require('./component/rotation');
var FreeDrawing = require('./component/freeDrawing');

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/** @lends Invoker.prototype */{
    init: function() {
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

        /**
         * Lock-flag for executing command
         * @type {boolean}
         */
        this._isLocked = false;

        this.lock = $.proxy(this.lock, this);
        this.unlock = $.proxy(this.unlock, this);
        this._createComponents();
    },

    /**
     * Create components
     * @private
     */
    _createComponents: function() {
        var main = new MainComponent();

        this._register(main);
        this._register(new ImageLoader(main));
        this._register(new Cropper(main));
        this._register(new Flip(main));
        this._register(new Rotation(main));
        this._register(new FreeDrawing(main));
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
    getComponent: function(name) {
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

        if (this._isLocked) {
            return $.Deferred.reject();
        }

        return $.when(this.lock, command.execute(this.componentMap))
            .done(function() {
                self.undoStack.push(command);
                self.clearRedoStack();
            })
            .done(command.executeCallback)
            .always(this.unlock);
    },

    /**
     * Lock this invoker
     */
    lock: function() {
        this._isLocked = true;
    },

    /**
     * Unlock this invoker
     */
    unlock: function() {
        this._isLocked = false;
    },

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo: function() {
        var undoStack = this.undoStack;
        var command = undoStack.pop();
        var self = this;
        var jqDefer;

        if (command && this._isLocked) {
            undoStack.push(command);
            command = null;
        }

        if (command) {
            jqDefer = $.when(this.lock, command.undo(this.componentMap))
                .done(function() {
                    self.redoStack.push(command);
                })
                .done(command.undoCallback)
                .always(this.unlock);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
    },

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo: function() {
        var redoStack = this.redoStack;
        var command = redoStack.pop();
        var self = this;
        var jqDefer;

        if (command && this._isLocked) {
            redoStack.push(command);
            command = null;
        }

        if (command) {
            jqDefer = $.when(this.lock, command.execute(this.componentMap))
                .done(function() {
                    self.undoStack.push(command);
                })
                .done(command.executeCallback)
                .always(this.unlock, this);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
    },

    /**
     * Return whether the redoStack is empty
     * @returns {boolean}
     */
    isEmptyRedoStack: function() {
        return this.redoStack.length === 0;
    },

    /**
     * Return whether the undoStack is empty
     * @returns {boolean}
     */
    isEmptyUndoStack: function() {
        return this.undoStack.length === 0;
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
