'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var DEFAULT_MAX_WIDTH = 1000;
var DEFAULT_MAX_HEIGHT = 800;

var cssOnly = {cssOnly: true};
var backstoreOnly = {backstoreOnly: true};

/**
 * Main component
 * @extends {Component}
 * @class
 * @param {{maxWidth: number, maxHeight: number}} option - Option
 */
var Main = tui.util.defineClass(Component, /** @lends Main.prototype */{
    init: function(option) {
        option = option || {};

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

        /**
         * Max width of canvas elements
         * @type {number}
         */
        this.maxWidth = DEFAULT_MAX_WIDTH || option.maxWidth;

        /**
         * Max height of canvas elements
         * @type {number}
         */
        this.maxHeight = DEFAULT_MAX_HEIGHT || option.maxHeight;

        /**
         * Image name
         * @type {string}
         */
        this.imageName = '';
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.MAIN,

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.canvas && this.canvas.toDataURL(type);
    },

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     * @override
     */
    setCanvasImage: function(name, oImage) {
        tui.util.stamp(oImage);
        this.imageName = name;
        this.oImage = oImage;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     * @override
     */
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas($(canvasElement)[0], {
            containerClass: 'tui-imageEditor-canvasContainer'
        });
    },

    /**
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension: function() {
        var canvasImage = this.getCanvasImage().scale(1);
        var boundingRect = canvasImage.getBoundingRect();
        var width = boundingRect.width;
        var height = boundingRect.height;
        var wScaleFactor = this.maxWidth / width;
        var hScaleFactor = this.maxHeight / height;
        var maxWidth = Math.min(width, this.maxWidth);
        var maxHeight = Math.min(height, this.maxHeight);

        if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
            maxWidth = width * wScaleFactor;
            maxHeight = height * wScaleFactor;
        } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
            maxWidth = width * hScaleFactor;
            maxHeight = height * hScaleFactor;
        }

        this.setCanvasCssDimension({
            width: '100%',
            height: '', // Set height '' for IE9
            'max-width': Math.floor(maxWidth) + 'px',
            'max-height': Math.floor(maxHeight) + 'px'
        });
        this.setCanvasBackstoreDimension({
            width: width,
            height: height
        });
        this.getCanvas().centerObject(canvasImage);
    },

    /**
     * Set canvas dimension - css only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas css dimension
     * @override
     */
    setCanvasCssDimension: function(dimension) {
        this.canvas.setDimensions(dimension, cssOnly);
    },

    /**
     * Set canvas dimension - backstore only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas backstore dimension
     * @override
     */
    setCanvasBackstoreDimension: function(dimension) {
        this.canvas.setDimensions(dimension, backstoreOnly);
    },

    /**
     * Set image properties
     * {@link http://fabricjs.com/docs/fabric.Image.html#set}
     * @param {object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     * @override
     */
    setImageProperties: function(setting, withRendering) {
        var oImage = this.oImage;

        if (!oImage) {
            return;
        }

        oImage.set(setting).setCoords();
        if (withRendering) {
            this.canvas.renderAll();
        }
    },

    /**
     * Toggle properties of the image
     * {@link http://fabricjs.com/docs/fabric.Image.html#toggle}
     * @param {Array.<string>} properties - Image property names
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     * @override
     */
    toggleImageProperties: function(properties, withRendering) {
        var oImage = this.oImage;

        if (!oImage) {
            return;
        }

        oImage.toggle.apply(oImage, properties);
        if (withRendering) {
            this.canvas.renderAll();
        }
    },

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     * @override
     */
    getCanvasElement: function() {
        return this.canvas.getElement();
    },

    /**
     * Get fabric.Canvas instance
     * @override
     * @returns {fabric.Canvas}
     */
    getCanvas: function() {
        return this.canvas;
    },

    /**
     * Get canvasImage (fabric.Image instance)
     * @override
     * @returns {fabric.Image}
     */
    getCanvasImage: function() {
        return this.oImage;
    },

    /**
     * Get image name
     * @override
     * @returns {string}
     */
    getImageName: function() {
        return this.imageName;
    }
});

module.exports = Main;
