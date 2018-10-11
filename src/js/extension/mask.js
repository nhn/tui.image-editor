/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Mask extending fabric.Image.filters.Mask
 */
import {fabric} from 'fabric';

/**
 * Mask object
 * @class Mask
 * @extends {fabric.Image.filters.Mask}
 * @ignore
 */
const Mask = fabric.util.createClass(fabric.Image.filters.Mask, /** @lends Mask.prototype */{
    /**
     * Apply filter to canvas element
     * @param {Object} canvasEl - Canvas element to apply filter
     * @override
     */
    applyTo(canvasEl) {
        if (!this.mask) {
            return;
        }

        const {width, height} = canvasEl;
        const maskCanvasEl = this._createCanvasOfMask(width, height);
        const ctx = canvasEl.getContext('2d');
        const maskCtx = maskCanvasEl.getContext('2d');
        const imageData = ctx.getImageData(0, 0, width, height);

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
    _createCanvasOfMask(width, height) {
        const maskCanvasEl = fabric.util.createCanvasElement();

        maskCanvasEl.width = width;
        maskCanvasEl.height = height;

        return maskCanvasEl;
    },

    /**
     * Draw mask image on canvas element
     * @param {Object} maskCtx - Context of mask canvas
     * @private
     */
    _drawMask(maskCtx) {
        const {mask} = this;
        const maskImg = mask.getElement();

        const left = mask.getLeft();
        const top = mask.getTop();
        const angle = mask.getAngle();

        maskCtx.save();
        maskCtx.translate(left, top);
        maskCtx.rotate(angle * Math.PI / 180);
        maskCtx.scale(mask.scaleX, mask.scaleY);
        maskCtx.drawImage(maskImg, -maskImg.width / 2, -maskImg.height / 2);
        maskCtx.restore();
    },

    /**
     * Map mask image data to source image data
     * @param {Object} maskCtx - Context of mask canvas
     * @param {Object} imageData - Data of source image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @private
     */
    _mapData(maskCtx, imageData, width, height) {
        const sourceData = imageData.data;
        const maskData = maskCtx.getImageData(0, 0, width, height).data;
        const {channel} = this;
        const len = imageData.width * imageData.height * 4;

        for (let i = 0; i < len; i += 4) {
            sourceData[i + 3] = maskData[i + channel]; // adjust value of alpha data
        }
    }
});

module.exports = Mask;
