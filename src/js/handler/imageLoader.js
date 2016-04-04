'use strict';

var Component = require('../interface/component');
var commands = require('../consts').commands;
var ceil = Math.ceil;

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 */
var ImageLoader = tui.util.defineClass(Component, /* @lends ImageLoader.prototype */{
    init: function(parent) {
        this.setParent(parent);
        this.registerAction(commands.LOAD_IMAGE_FROM_URL, this.loadImageFromURL, this);
        this.registerAction(commands.LOAD_IMAGE_FROM_FILE, this.loadImageFromFile, this);
    },

    /**
     * Load image from url
     * @param {string} url - File url
     * @param {string} filename - File name
     */
    loadImageFromURL: function(url, filename) {
        var canvas = this.getCanvas(),
            self = this;

        canvas.setBackgroundImage(url, function() {
            var oImage = canvas.backgroundImage;

            canvas.setDimensions({
                width: '100%',
                'max-width': oImage.width + 'px',
                height: ''  // No inline-css "height" for IE9
            }, {
                cssOnly: true
            })
            .setDimensions({
                width: oImage.width,
                height: oImage.height
            }, {
                backstoreOnly: true
            });
            self.postCommands(filename || url, oImage);
        }, {
            crossOrigin: ''
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
            URL.createObjectURL(imgFile),
            imgFile.name
        );
    },

    /**
     * Post commands
     * @param {string} name - image name
     * @param {fabric.Image} oImage - Image object
     */
    postCommands: function(name, oImage) {
        name = name || 'unknown';
        this.postCommand({
            name: commands.SET_CANVAS_IMAGE,
            args: [oImage, name]
        });
        this.postCommand({
            name: commands.ON_LOAD_IMAGE,
            args: tui.util.extend({
                imageName: name
            }, this.getSize(oImage))
        });
    },

    /**
     * Get current size of image
     * @param {fabric.Image} oImage - Image object
     * @returns {{currentWidth: Number, currentHeight: Number}}
     */
    getSize: function(oImage) {
        var $canvasElement = $(this.getCanvas().getSelectionElement());

        return {
            originalWidth: oImage.width,
            originalHeight: oImage.height,
            currentWidth: $canvasElement.width(),
            currentHeight: $canvasElement.height()
        };
    }
});

module.exports = ImageLoader;
