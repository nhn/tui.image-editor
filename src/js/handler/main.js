'use strict';

var Component = require('../interface/component'),
    ImageLoader = require('./imageLoader'),
    Cropper = require('./cropper'),
    commands = require('../consts').commands;

var Main = tui.util.defineClass(Component, {
    init: function(broker) {
        this.broker = broker;

        this.canvas = null;
        this.oImage = null;
        this.components = null;
        this.registerActions();
    },

    /**
     * Register main handler actions
     */
    registerActions: function() {
        this.registerAction(commands.SET_CANVAS_ELEMENT, this.setCanvasElement, this);
        this.registerAction(commands.SET_CANVAS_IMAGE, this.setCanvasImage, this);
    },

    /**
     * Save image(background) of canvas
     * @param {fabric.Image} oImage - Fabric image instance
     * @param {string} name - Name of image
     */
    setCanvasImage: function(oImage, name) {
        this.oImage = oImage;
        this.imageName = name;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {Element} canvasElement - Canvas element
     */
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas(canvasElement);
        this.setComponents();
    },

    /**
     * Set components
     */
    setComponents: function() {
        this.components = {
            imageLoader: new ImageLoader(this),
            cropper: new Cropper(this)
        };
    },

    /**
     * Register action to broker
     */
    registerAction: function() {
        var broker = this.broker;

        broker.register.apply(broker, arguments);
    },

    /**
     * Deregister action from broker
     */
    deregisterAction: function() {
        var broker = this.broker;

        broker.deregister.apply(broker, arguments);
    },

    /**
     * Post command to broker
     * @param {{name: string, args: (object|Array)}} command - command
     * @returns {boolean} Result of invoking command
     */
    postCommand: function(command) {
        return this.broker.invoke(command);
    },

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.canvas && this.canvas.toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this.imageName;
    }
});

module.exports = Main;
