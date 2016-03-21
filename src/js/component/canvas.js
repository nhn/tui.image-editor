'use strict';

/**
 * Canvas components
 * @class Canvas
 */
var Canvas = tui.util.defineClass(/* @lends Canvas.prototype */{
    init: function(broker) {
        this.broker = broker;
        this.canvas = null;

        // stub
        this.broker.register({
            'setCanvasElement': this.setCanvasElement,
            'loadImageFromURL': this.loadImageFromURL
        }, this);
    },

     // stub
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas(canvasElement);
    },

    // stub
    loadImageFromURL: function(url) {
        fabric.Image.fromURL(url, $.proxy(function(oImage) {
            if (this.canvas) {
                if (oImage.width > oImage.height) {
                    oImage.scale((this.canvas.width - 70) / oImage.width);
                } else {
                    oImage.scale((this.canvas.height - 70) / oImage.height);
                }
                this.canvas.add(oImage);
                this.canvas.centerObject(oImage);
                this.broker.receive({
                    name: 'onLoad',
                    args: {
                        imageName: url,
                        originalWidth: oImage.width,
                        originalHeight: oImage.height,
                        currentWidth: parseInt(oImage.width * oImage.scaleX, 10),
                        currentHeight: parseInt(oImage.height * oImage.scaleY, 10)
                    }
                });
            }
        }, this));
    }
});

module.exports = Canvas;
