'use strict';

var Component = require('../interface/component'),
    commands = require('../consts').commands;

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
        //this.registerAction(commands.LOAD_IMAGE_FROM_INPUT, this.loadImageFromFile, this);
    },

    /**
     * Load image from url
     * @param {string} url - File url
     * @param {string} name - File name
     */
    loadImageFromURL: function(url, name) {
        fabric.Image.fromURL(url, $.proxy(function(oImage) {
            var canvas = this.getCanvas(),
                scaleFactor = this.calcInitialScale(oImage);

            oImage.scale(scaleFactor);
            canvas.add(oImage);
            canvas.centerObject(oImage);

            this.postCommands(name || url, oImage);
            this.attachImageEvents(oImage);
        }, this), {
            hasControls: false,
            padding: 10,
            lockMovementX: true,
            lockMovementY: true,
            crossOrigin: ''
        });
    },

    ///**
    // * Load image from fileInput
    // * @param fileInput
    // */
    //loadImageFromFile: function(fileInput) {
    //    var imgFile;
    //    if (!fileInput.files) {
    //        return;
    //    }
    //
    //    imgFile = fileInput.files[0];
    //    this.loadImageFromURL(
    //        URL.createObjectURL(imgFile),
    //        imgFile.name
    //    );
    //},

    /**
     * Post commands
     * @param {string} name - image name
     * @param {fabric.Image} oImage - Image object
     */
    postCommands: function(name, oImage) {
        this.postCommand({
            name: commands.SET_CANVAS_IMAGE,
            args: oImage
        });
        this.postCommand({
            name: commands.ON_LOAD_IMAGE,
            args: tui.util.extend({
                imageName: name || 'unknown',
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
