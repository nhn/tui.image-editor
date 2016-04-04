'use strict';

var MainView = require('./view/main'),
    MainHandler = require('./handler/main'),
    Broker = require('./broker'),
    commands = require('./consts').commands;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} wrapper - Wrapper element or selector
 */
var ImageEditor = tui.util.defineClass(/* @lends ImageEditor.prototype */{
    init: function(wrapper) {
        var broker = new Broker();

        /**
         * Components broker
         * @type {Broker}
         */
        this.broker = broker;

        /**
         * Main components
         * @type {Canvas}
         */
        this.mainHandler = new MainHandler(broker);

        /**
         * Main view
         * @type {MainView}
         */
        this.mainView = new MainView(broker, wrapper);
    },

    /**
     * Invoke command
     * @param {{name: string, args: (Object|Array)}} command - Command
     * @private
     */
    _invoke: function(command) {
        this.broker.invoke(command);
    },

    /**
     * Load image from url
     * @param {string} url - File url
     * @param {string} filename - File name
     */
    loadImageFromURL: function(url, filename) {
        this._invoke({
            name: commands.LOAD_IMAGE_FROM_URL,
            args: [url, filename]
        });
    },

    /**
     * Load image from file
     * @param {File} file - Image file
     */
    loadImageFromFile: function(file) {
        this._invoke({
            name: commands.LOAD_IMAGE_FROM_FILE,
            args: file
        });
    },

    startCrop: function() {
        this._invoke({
            name: commands.START_CROPPING
        });
    },

    endCrop: function(isDone) {
        this._invoke({
            name: commands.END_CROPPING,
            args: isDone
        });
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
