/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Mask extending fabric.Image.filters.Mask
 */
'use strict';

/**
 * Mask object
 * @class Mask
 * @extends {fabric.Image.filters.Mask}
 */
var Mask = fabric.util.createClass(fabric.Image.filters.Mask, /** @lends Mask.prototype */{
    /**
     * Apply filter to canvas element
     * @param {object} canvasEl - Canvas element to apply filter
     * @override
     */
    applyTo: function(canvasEl) {
        var maskCanvasEl, ctx, maskCtx, imageData;
        var width, height;

        if (!this.mask) {
            return;
        }

        width = canvasEl.width;
        height = canvasEl.height;

        maskCanvasEl = this._createCanvasOfMask(width, height);

        ctx = canvasEl.getContext('2d');
        maskCtx = maskCanvasEl.getContext('2d');

        imageData = ctx.getImageData(0, 0, width, height);

        this._drawMask(maskCtx, canvasEl, ctx);

        this._mapData(maskCtx, imageData, width, height);

        ctx.putImageData(imageData, 0, 0);
    },

    /**
     * Create canvas of mask image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @returns {HTMLElement} Canvas element
     * @private
     */
    _createCanvasOfMask: function(width, height) {
        var maskCanvasEl = fabric.util.createCanvasElement();

        maskCanvasEl.width = width;
        maskCanvasEl.height = height;

        return maskCanvasEl;
    },

    /**
     * Draw mask image on canvas element
     * @param {object} maskCtx - Context of mask canvas
     * @private
     */
    _drawMask: function(maskCtx) {
        var left, top, angle;
        var mask = this.mask;
        var maskImg = mask.getElement();

        left = mask.getLeft();
        top = mask.getTop();
        angle = mask.getAngle();

        maskCtx.save();
        maskCtx.translate(left, top);
        maskCtx.rotate(angle * Math.PI / 180);
        maskCtx.scale(mask.scaleX, mask.scaleY);
        maskCtx.drawImage(maskImg, -maskImg.width / 2, -maskImg.height / 2);
        maskCtx.restore();
    },

    /**
     * Map mask image data to source image data
     * @param {object} maskCtx - Context of mask canvas
     * @param {object} imageData - Data of source image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @private
     */
    _mapData: function(maskCtx, imageData, width, height) {
        var sourceData = imageData.data;
        var maskData = maskCtx.getImageData(0, 0, width, height).data;
        var channel = this.channel;
        var i = 0;
        var len = imageData.width * imageData.height * 4;

        for (; i < len; i += 4) {
            sourceData[i + 3] = maskData[i + channel]; // adjust value of alpha data
        }
    }
});

module.exports = Mask;
