'use strict';

var Component = require('../interface/component');
var ImageLoader = require('./imageLoader');
var Cropper = require('./cropper');

var componentNames = require('../consts').componentNames;

/**
 * Main component
 * @extends Component
 * @class
 * @param {ImageEditor} editor - ImageEditor
 * @param {Invoker} invoker - Invoker
 */
var Main = tui.util.defineClass(Component, {
    init: function(editor, invoker) {
        /**
         * editor
         * @type {ImageEditor}
         */
        this.editor = editor;

        /**
         * invoker
         * @type {Invoker}
         */
        this.invoker = invoker;

        /**
         * Fabric canvas instance
         * @type {fabric.Canvas}
         */
        this.canvas = null;

        /**
         * Fabric image instance
         * @type {fabric.Image}
         */
        this.oImage = null;

        this.createComponents();
    },

    /**
     * Create components
     */
    createComponents: function() {
        var invoker = this.invoker;

        invoker.register(componentNames.MAIN, this);
        invoker.register(componentNames.IMAGE_LOADER, new ImageLoader(this));
        invoker.register(componentNames.CROPPER, new Cropper(this));
    },

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.canvas && this.canvas.toDataURL(type);
    }
});

module.exports = Main;
