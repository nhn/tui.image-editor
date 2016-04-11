'use strict';

var Invoker = require('./invoker');
var commandFactory = require('./factory/command');
var consts = require('./consts');

var eventNames = consts.eventNames;
var compNames = consts.componentNames;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
 */
var ImageEditor = tui.util.defineClass(/* @lends ImageEditor.prototype */{
    static: {
        eventNames: tui.util.extend({}, eventNames)
    },

    init: function(canvasElement) {
        /**
         * Inovker
         * @private
         * @type {Invoker}
         */
        this._invoker = new Invoker();

        // Set canvas element
        this.setCanvasElement($(canvasElement)[0]);
    },

    /**
     * Clear all actions
     */
    clear: function() {
        this.endCropping();
    },

    /**
     * Invoke command
     * @param {Command} command - Command
     */
    execute: function(command) {
        var self = this;

        this.clear();
        this._invoker.invoke(command).done(function() {
            self.fire(eventNames.PUSH_UNDO_STACK);
            self.fire(eventNames.EMPTY_REDO_STACK);
        });
    },

    /**
     * Undo
     */
    undo: function() {
        var invoker = this._invoker;
        var self = this;

        this.clear();
        invoker.undo().done(function() {
            if (invoker.isEmptyUndoStack()) {
                self.fire(eventNames.EMPTY_UNDO_STACK);
            }
            self.fire(eventNames.PUSH_REDO_STACK);
        });
    },

    /**
     * Redo
     */
    redo: function() {
        var invoker = this._invoker;
        var self = this;

        this.clear();
        invoker.redo().done(function() {
            if (invoker.isEmptyRedoStack()) {
                self.fire(eventNames.EMPTY_REDO_STACK);
            }
            self.fire(eventNames.PUSH_UNDO_STACK);
        });
    },

    /**
     * Load image from file
     * @param {File} imgFile - Image file
     */
    loadImageFromFile: function(imgFile) {
        if (!imgFile) {
            return;
        }

        this.loadImageFromURL(
            imgFile.name,
            URL.createObjectURL(imgFile)
        );
    },

    /**
     * Load image from url
     * @param {string} imageName - imageName
     * @param {string} url - File url
     */
    loadImageFromURL: function(imageName, url) {
        var callback, command;
        if (!imageName || !url) {
            return;
        }

        callback = $.proxy(this._callbackAfterImageLoading, this);
        command = commandFactory.createLoadCommand(imageName, url)
            .setExecutionCallback(callback)
            .setUndoerCallback(callback);

        this.execute(command);
    },

    /**
     * Callback after image loading
     * @param {?fabric.Image} oImage - Image instance
     */
    _callbackAfterImageLoading: function(oImage) {
        var mainComponent = this._invoker.get(compNames.MAIN);
        var $canvasElement = $(mainComponent.getCanvasElement());

        if (oImage) {
            this.fire(eventNames.LOAD_IMAGE, {
                originalWidth: oImage.width,
                originalHeight: oImage.height,
                currentWidth: $canvasElement.width(),
                currentHeight: $canvasElement.height()
            });
        } else {
            this.fire(eventNames.CLEAR_IMAGE);
        }
    },

    /**
     * Start cropping
     */
    startCropping: function() {
        var cropper = this._invoker.get(compNames.CROPPER);

        cropper.start();
        this.fire(eventNames.START_CROPPING);
    },

    /**
     * Apply cropping
     * @param {boolean} [isApplying] - Whether the cropping is applied or canceled
     */
    endCropping: function(isApplying) {
        var cropper = this._invoker.get(compNames.CROPPER);
        var data = cropper.end(isApplying);

        this.fire(eventNames.END_CROPPING);
        if (data) {
            this.loadImageFromURL(data.imageName, data.url);
        }
    },

    /**
     * Set canvas element
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     */
    setCanvasElement: function(canvasElement) {
        this._invoker.get(compNames.MAIN).setCanvasElement(canvasElement);
    },

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this._invoker.get(compNames.MAIN).toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this._invoker.get(compNames.MAIN).getImageName();
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this._invoker.clearUndoStack();
        this.fire(eventNames.EMPTY_UNDO_STACK);
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this._invoker.clearRedoStack();
        this.fire(eventNames.EMPTY_REDO_STACK);
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;
