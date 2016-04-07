'use strict';

var MainView = require('./view/main');
var Command = require('./interface/Command');
var MainHandler = require('./handler/main');
var Invoker = require('./invoker');

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} wrapper - Wrapper element or selector
 */
var ImageEditor = tui.util.defineClass(/* @lends ImageEditor.prototype */{
    init: function(wrapper) {
        var invoker = new Invoker();

        /**
         * Components broker
         * @private
         * @type {Invoker}
         */
        this._invoker = invoker;

        /**
         * Main components
         * @type {Canvas}
         */
        this.mainHandler = new MainHandler(this, invoker);

        /**
         * Main view
         * @type {MainView}
         */
        this.mainView = new MainView(this, $(wrapper));
    },

    /**
     * Invoke command
     * @param {Command} command - Command
     */
    invoke: function(command) {
        this._invoker.invoke(command);
    },

    /**
     * Undo
     */
    undo: function() {
        this._invoker.undo();
    },

    /**
     * Redo
     */
    redo: function() {
        this._invoker.redo();
    },

    /**
     * Load image from url
     * @param {string} imageName - imageName
     * @param {string} url - File url
     */
    loadImageFromURL: function(imageName, url) {
        this.invoke(new Command({
            execute: function(components) {
                var loader = components.imageLoader;

                this.store = {
                    prevName: loader.getImageName(),
                    prevImage: loader.getCanvasImage()
                };

                loader.load(imageName, url);
            },
            undo: function(components) {
                var loader = components.imageLoader;
                var store = this.store;

                loader.load(store.prevName, store.prevImage);
            }
        }));
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
     * Start cropping
     */
    startCropping: function() {
    },

    /**
     * Apply cropping
     * @param {boolean} isDone - Cropping is done or cancel
     */
    endCropping: function(isDone) {
    },

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.mainHandler.toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this.mainHandler.getImageName();
    }
});

module.exports = ImageEditor;
