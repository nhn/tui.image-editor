'use strict';

var Component = require('./../interface/component'),
    commands = require('./../consts').commands;

var CANVAS_MARGIN = 70;

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 */
var ImageLoader = tui.util.defineClass(Component, {
    init: function(parent) {
        this.setParent(parent);
        this.registerAction(commands.LOAD_IMAGE_FROM_URL, this.loadImageFromURL, this);
    },

    /**
     * Load image from url
     * @param {string} url - url
     */
    loadImageFromURL: function(url) {
        fabric.Image.fromURL(url, $.proxy(function(oImage) {
            var canvas = this.getCanvas(),
                scaleFactor = this.calcInitialScale(oImage);

            oImage.scale(scaleFactor);
            canvas.add(oImage);
            canvas.centerObject(oImage);

            this.postCommands(url, oImage);
            this.attachImageEvents(oImage);
        }, this));
    },

    /**
     * Post commands
     * @param {string} url - image url
     * @param {fabric.Image} oImage - Image object
     */
    postCommands: function(url, oImage) {
        this.postCommand({
            name: commands.SET_CANVAS_IMAGE,
            args: oImage
        });
        this.postCommand({
            name: commands.ON_LOAD_IMAGE,
            args: tui.util.extend({
                imageName: url,
                originalWidth: oImage.width,
                originalHeight: oImage.height
            }, this.getCurrentSize(oImage))
        });
    },

    /**
     * Attach events to image
     * @param {fabric.Image} oImage - Image object
     */
    attachImageEvents: function(oImage) {
        oImage.on('scaling', $.proxy(function() {
            this.postCommand({
                name: commands.ON_SCALE_IMAGE,
                args: this.getCurrentSize(oImage)
            });
        }, this));
    },

    /**
     * Get current size of image
     * @param {fabric.Image} oImage - Image object
     * @returns {{currentWidth: Number, currentHeight: Number}}
     */
    getCurrentSize: function(oImage) {
        return {
            currentWidth: parseInt(oImage.width * oImage.scaleX, 10),
            currentHeight: parseInt(oImage.height * oImage.scaleY, 10)
        };
    },

    /**
     * Calculate initial scale
     * @param {fabric.Image} oImage - Image object
     * @returns {number}
     */
    calcInitialScale: function(oImage) {
        var canvas = this.getCanvas(),
            oWidth = oImage.width,
            oHeight = oImage.height,
            scaleFactor;

        if (oImage.width > oImage.height) {
            scaleFactor = (canvas.width - CANVAS_MARGIN) / oWidth;
        } else {
            scaleFactor = (canvas.height - CANVAS_MARGIN) / oHeight;
        }

        return scaleFactor;
    }
});

module.exports = ImageLoader;
