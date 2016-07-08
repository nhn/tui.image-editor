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
var Mask = fabric.util.createClass(fabric.Image.filters.Mask, /** @lends Cropzone.prototype */{
    /**
     * Applies filter to canvas element
     * @param {Object} canvasEl - Canvas element to apply filter to
     * @override
     */
    applyTo: function(canvasEl) {
        var ctx, imageData, data, maskEl, maskCanvasEl;
        var mask, channel, i, len;
        var left, top, width, height;
        var maskCtx, maskData;

        if (!this.mask) {
            return;
        }

        ctx = canvasEl.getContext('2d');
        imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        data = imageData.data;
        maskEl = this.mask.getElement();
        maskCanvasEl = fabric.util.createCanvasElement();
        maskCtx = maskCanvasEl.getContext('2d');

        mask = this.mask;
        channel = this.channel;

        i = 0;
        len = imageData.width * imageData.height * 4;

        maskCanvasEl.width = canvasEl.width;
        maskCanvasEl.height = canvasEl.height;

        width = mask.getWidth();
        height = mask.getHeight();
        left = mask.getLeft() - width / 2;
        top = mask.getTop() - height / 2;

        maskCtx.drawImage(maskEl, left, top, width, height);

        maskData = maskCtx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;

        for (; i < len; i += 4) {
            if (maskData[i + channel] !== 0) {
                data[i + 3] = maskData[i + channel];
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
});

module.exports = Mask;
