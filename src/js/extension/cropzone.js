/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Cropzone extending fabric.Rect
 */
import snippet from 'tui-code-snippet';
import fabric from 'fabric';
import {clamp} from '../util';

const CORNER_TYPE_TOP_LEFT = 'tl';
const CORNER_TYPE_TOP_RIGHT = 'tr';
const CORNER_TYPE_MIDDLE_TOP = 'mt';
const CORNER_TYPE_MIDDLE_LEFT = 'ml';
const CORNER_TYPE_MIDDLE_RIGHT = 'mr';
const CORNER_TYPE_MIDDLE_BOTTOM = 'mb';
const CORNER_TYPE_BOTTOM_LEFT = 'bl';
const CORNER_TYPE_BOTTOM_RIGHT = 'br';

/**
 * Cropzone object
 * Issue: IE7, 8(with excanvas)
 *  - Cropzone is a black zone without transparency.
 * @class Cropzone
 * @extends {fabric.Rect}
 * @ignore
 */
const Cropzone = fabric.util.createClass(fabric.Rect, /** @lends Cropzone.prototype */{
    /**
     * Constructor
     * @param {Object} canvas canvas
     * @param {Object} options Options object
     * @param {Object} extendsOptions object for extends "options" 
     * @override
     */
    initialize(canvas, options, extendsOptions) {
        options = snippet.extend(options, extendsOptions);
        options.type = 'cropzone';

        this.callSuper('initialize', options);

        this.canvas = canvas;
        this.options = options;

        this.on({
            'moving': this._onMoving.bind(this),
            'scaling': this._onScaling.bind(this)
        });
    },

    _renderCropzone() {
        const cropzoneDashLineWidth = 7;
        const cropzoneDashLineOffset = 7;

        // Calc original scale
        const originalFlipX = this.flipX ? -1 : 1;
        const originalFlipY = this.flipY ? -1 : 1;
        const originalScaleX = originalFlipX / this.scaleX;
        const originalScaleY = originalFlipY / this.scaleY;

        // Set original scale
        const ctx = this.canvas.getContext();
        ctx.scale(originalScaleX, originalScaleY);

        // Render outer rect
        this._fillOuterRect(ctx, 'rgba(0, 0, 0, 0.5)');

        if (this.options.lineWidth) {
            this._fillInnerRect(ctx);
            this._strokeBorder(ctx, 'rgb(255, 255, 255)', {
                lineWidth: this.options.lineWidth
            });
        } else {
            // Black dash line
            this._strokeBorder(ctx, 'rgb(0, 0, 0)', {
                lineDashWidth: cropzoneDashLineWidth
            });

            // White dash line
            this._strokeBorder(ctx, 'rgb(255, 255, 255)', {
                lineDashWidth: cropzoneDashLineWidth,
                lineDashOffset: cropzoneDashLineOffset
            });
        }

        // Reset scale
        ctx.scale(1 / originalScaleX, 1 / originalScaleY);
    },

    /**
     * Render Crop-zone
     * @private
     * @override
     */
    _render() {
        const ctx = this.canvas.getContext();

        this.callSuper('_render', ctx);

        this._renderCropzone();
    },

    /**
     * Cropzone-coordinates with outer rectangle
     *
     *     x0     x1         x2      x3
     *  y0 +--------------------------+
     *     |///////|//////////|///////|    // <--- "Outer-rectangle"
     *     |///////|//////////|///////|
     *  y1 +-------+----------+-------+
     *     |///////| Cropzone |///////|    Cropzone is the "Inner-rectangle"
     *     |///////|  (0, 0)  |///////|    Center point (0, 0)
     *  y2 +-------+----------+-------+
     *     |///////|//////////|///////|
     *     |///////|//////////|///////|
     *  y3 +--------------------------+
     *
     * @typedef {{x: Array<number>, y: Array<number>}} cropzoneCoordinates
     * @ignore
     */

    /**
     * Fill outer rectangle
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {string|CanvasGradient|CanvasPattern} fillStyle - Fill-style
     * @private
     */
    _fillOuterRect(ctx, fillStyle) {
        const {x, y} = this._getCoordinates();

        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.beginPath();

        // Outer rectangle
        // Numbers are +/-1 so that overlay edges don't get blurry.
        ctx.moveTo(x[0] - 1, y[0] - 1);
        ctx.lineTo(x[3] + 1, y[0] - 1);
        ctx.lineTo(x[3] + 1, y[3] + 1);
        ctx.lineTo(x[0] - 1, y[3] + 1);
        ctx.lineTo(x[0] - 1, y[0] - 1);
        ctx.closePath();

        // Inner rectangle
        ctx.moveTo(x[1], y[1]);
        ctx.lineTo(x[1], y[2]);
        ctx.lineTo(x[2], y[2]);
        ctx.lineTo(x[2], y[1]);
        ctx.lineTo(x[1], y[1]);
        ctx.closePath();

        ctx.fill();
        ctx.restore();
    },

    /**
     * Draw Inner grid line
     * @param {CanvasRenderingContext2D} ctx - Context
     * @private
     */
    _fillInnerRect(ctx) {
        const {x: outerX, y: outerY} = this._getCoordinates();
        const x = this._caculateInnerPosition(outerX, (outerX[2] - outerX[1]) / 3);
        const y = this._caculateInnerPosition(outerY, (outerY[2] - outerY[1]) / 3);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = this.options.lineWidth;
        ctx.beginPath();

        ctx.moveTo(x[0], y[1]);
        ctx.lineTo(x[3], y[1]);

        ctx.moveTo(x[0], y[2]);
        ctx.lineTo(x[3], y[2]);

        ctx.moveTo(x[1], y[0]);
        ctx.lineTo(x[1], y[3]);

        ctx.moveTo(x[2], y[0]);
        ctx.lineTo(x[2], y[3]);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    },

    /**
     * Calculate Inner Position
     * @param {Array} outer - outer position
     * @param {number} size - interval for calculate
     * @returns {Array} - inner position
     * @private
     */
    _caculateInnerPosition(outer, size) {
        const position = [];
        position[0] = outer[1];
        position[1] = outer[1] + size;
        position[2] = outer[1] + (size * 2);
        position[3] = outer[2];

        return position;
    },

    /**
     * Get coordinates
     * @returns {cropzoneCoordinates} - {@link cropzoneCoordinates}
     * @private
     */
    _getCoordinates() {
        const {canvas, width, height, left, top} = this;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const canvasHeight = canvas.getHeight(); // fabric object
        const canvasWidth = canvas.getWidth(); // fabric object

        return {
            x: snippet.map([
                -(halfWidth + left), // x0
                -(halfWidth), // x1
                halfWidth, // x2
                halfWidth + (canvasWidth - left - width) // x3
            ], Math.ceil),
            y: snippet.map([
                -(halfHeight + top), // y0
                -(halfHeight), // y1
                halfHeight, // y2
                halfHeight + (canvasHeight - top - height) // y3
            ], Math.ceil)
        };
    },

    /**
     * Stroke border
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {string|CanvasGradient|CanvasPattern} strokeStyle - Stroke-style
     * @param {number} lineDashWidth - Dash width
     * @param {number} [lineDashOffset] - Dash offset
     * @param {number} [lineWidth] - line width
     * @private
     */
    _strokeBorder(ctx, strokeStyle, {lineDashWidth, lineDashOffset, lineWidth}) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        ctx.save();
        ctx.strokeStyle = strokeStyle;

        if (ctx.setLineDash) {
            ctx.setLineDash([lineDashWidth, lineDashWidth]);
        }
        if (lineDashOffset) {
            ctx.lineDashOffset = lineDashOffset;
        }
        if (lineWidth) {
            ctx.lineWidth = lineWidth;
        }

        ctx.beginPath();
        ctx.moveTo(-halfWidth, -halfHeight);
        ctx.lineTo(halfWidth, -halfHeight);
        ctx.lineTo(halfWidth, halfHeight);
        ctx.lineTo(-halfWidth, halfHeight);
        ctx.lineTo(-halfWidth, -halfHeight);
        ctx.stroke();

        ctx.restore();
    },

    /**
     * onMoving event listener
     * @private
     */
    _onMoving() {
        const {height, width, left, top} = this;
        const maxLeft = this.canvas.getWidth() - width;
        const maxTop = this.canvas.getHeight() - height;

        this.left = clamp(left, 0, maxLeft);
        this.top = clamp(top, 0, maxTop);
    },

    /**
     * onScaling event listener
     * @param {{e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onScaling(fEvent) {
        const pointer = this.canvas.getPointer(fEvent.e);
        const settings = this._calcScalingSizeFromPointer(pointer);

        // On scaling cropzone,
        // change real width and height and fix scaleFactor to 1
        this.scale(1).set(settings);
    },

    /**
     * Calc scaled size from mouse pointer with selected corner
     * @param {{x: number, y: number}} pointer - Mouse position
     * @returns {Object} Having left or(and) top or(and) width or(and) height.
     * @private
     */
    _calcScalingSizeFromPointer(pointer) {
        const pointerX = pointer.x,
            pointerY = pointer.y,
            tlScalingSize = this._calcTopLeftScalingSizeFromPointer(pointerX, pointerY),
            brScalingSize = this._calcBottomRightScalingSizeFromPointer(pointerX, pointerY);

        /*
         * @todo: 일반 객체에서 shift 조합키를 누르면 free size scaling이 됨 --> 확인해볼것
         *      canvas.class.js // _scaleObject: function(...){...}
         */
        return this._makeScalingSettings(tlScalingSize, brScalingSize);
    },

    /**
     * Calc scaling size(position + dimension) from left-top corner
     * @param {number} x - Mouse position X
     * @param {number} y - Mouse position Y
     * @returns {{top: number, left: number, width: number, height: number}}
     * @private
     */
    _calcTopLeftScalingSizeFromPointer(x, y) {
        const rect = this.getBoundingRect(false, true);
        const bottom = rect.height + this.top;
        const right = rect.width + this.left;
        const top = clamp(y, 0, bottom - 1); // 0 <= top <= (bottom - 1)
        const left = clamp(x, 0, right - 1); // 0 <= left <= (right - 1)

        // When scaling "Top-Left corner": It fixes right and bottom coordinates
        return {
            top,
            left,
            width: right - left,
            height: bottom - top
        };
    },

    /**
     * Calc scaling size from right-bottom corner
     * @param {number} x - Mouse position X
     * @param {number} y - Mouse position Y
     * @returns {{width: number, height: number}}
     * @private
     */
    _calcBottomRightScalingSizeFromPointer(x, y) {
        const {width: maxX, height: maxY} = this.canvas;
        const {left, top} = this;

        // When scaling "Bottom-Right corner": It fixes left and top coordinates
        return {
            width: clamp(x, (left + 1), maxX) - left, // (width = x - left), (left + 1 <= x <= maxX)
            height: clamp(y, (top + 1), maxY) - top // (height = y - top), (top + 1 <= y <= maxY)
        };
    },

    /* eslint-disable complexity */
    /**
     * Make scaling settings
     * @param {{width: number, height: number, left: number, top: number}} tl - Top-Left setting
     * @param {{width: number, height: number}} br - Bottom-Right setting
     * @returns {{width: ?number, height: ?number, left: ?number, top: ?number}} Position setting
     * @private
     */
    _makeScalingSettings(tl, br) {
        const tlWidth = tl.width;
        const tlHeight = tl.height;
        const brHeight = br.height;
        const brWidth = br.width;
        const tlLeft = tl.left;
        const tlTop = tl.top;
        let settings;

        switch (this.__corner) {
            case CORNER_TYPE_TOP_LEFT:
                settings = tl;
                break;
            case CORNER_TYPE_TOP_RIGHT:
                settings = {
                    width: brWidth,
                    height: tlHeight,
                    top: tlTop
                };
                break;
            case CORNER_TYPE_BOTTOM_LEFT:
                settings = {
                    width: tlWidth,
                    height: brHeight,
                    left: tlLeft
                };
                break;
            case CORNER_TYPE_BOTTOM_RIGHT:
                settings = br;
                break;
            case CORNER_TYPE_MIDDLE_LEFT:
                settings = {
                    width: tlWidth,
                    left: tlLeft
                };
                break;
            case CORNER_TYPE_MIDDLE_TOP:
                settings = {
                    height: tlHeight,
                    top: tlTop
                };
                break;
            case CORNER_TYPE_MIDDLE_RIGHT:
                settings = {
                    width: brWidth
                };
                break;
            case CORNER_TYPE_MIDDLE_BOTTOM:
                settings = {
                    height: brHeight
                };
                break;
            default:
                break;
        }

        return settings;
    }, /* eslint-enable complexity */

    /**
     * Return the whether this cropzone is valid
     * @returns {boolean}
     */
    isValid() {
        return (
            this.left >= 0 &&
            this.top >= 0 &&
            this.width > 0 &&
            this.height > 0
        );
    }
});

module.exports = Cropzone;
