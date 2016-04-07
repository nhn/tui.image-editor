'use strict';

var mixer = require('../mixin/mixer');

var Component = tui.util.defineClass({
    init: function() {},

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     */
    setCanvasImage: function(name, oImage) {
        var root = this.getRoot();

        root.imageName = name;
        root.oImage = oImage;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {Element} canvasElement - Canvas element
     */
    setCanvasElement: function(canvasElement) {
        var root = this.getRoot();

        root.canvas = new fabric.Canvas(canvasElement, {
            isDrawingMode: false
        });
    },

    /**
     * Get fabric.Canvas instance
     * @returns {fabric.Canvas}
     */
    getCanvas: function() {
        if (this === this.getRoot()) {
            return this.canvas;
        }

        return this.getRoot().getCanvas();
    },

    /**
     * Get canvasImage (fabric.Image instance)
     * @returns {fabric.Image}
     */
    getCanvasImage: function() {
        if (this === this.getRoot()) {
            return this.oImage;
        }

        return this.getRoot().getCanvasImage();
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        if (this === this.getRoot()) {
            return this.imageName;
        }

        return this.getRoot().getImageName();
    }
});

mixer.mixin(Component, 'Delegator');
module.exports = Component;
