'use strict';

var Component = require('../interface/component');
var Command = require('../interface/command');

var componentNames = require('../consts').componentNames;

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 */
var ImageLoader = tui.util.defineClass(Component, /* @lends ImageLoader.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Load image from url
     * @param {string} imageName - File name
     * @param {(fabric.Image|string)} img - fabric.Image instance or URL of an image
     * @returns {jQuery.Deferred} deferred
     */
    load: function(imageName, img) {
        this._setBackgroundImage(img).done($.proxy(function(oImage) {
            this.setCanvasImage(imageName, oImage);
        }, this));
    },

    /**
     * Set background image
     * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set background to
     * @returns {*}
     * @private
     */
    _setBackgroundImage: function(image) {
        var dfd = $.Deferred(), // eslint-disable-line new-cap
            canvas = this.getCanvas();

        canvas.setBackgroundImage(image, function() {
            var oImage = canvas.backgroundImage,
                cssOnly = {cssOnly: true},
                backstoreOnly = {backstoreOnly: true};

            canvas.setDimensions({
                width: '100%',
                'max-width': oImage.width + 'px',
                height: ''  // No inline-css "height" for IE9
            }, cssOnly);

            canvas.setDimensions({
                width: oImage.width,
                height: oImage.height
            }, backstoreOnly);

            dfd.resolve(oImage);
        }, {
            crossOrigin: ''
        });

        return dfd;
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
