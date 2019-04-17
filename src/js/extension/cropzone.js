/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Cropzone extending fabric.Rect
 */
import snippet from 'tui-code-snippet';
import {fabric} from 'fabric';
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
     * @param {Object} canvas Options object
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
        this.outerRectPath = null;
        this.innerRectPath = null;
        this.borderPaths = [];

        this.on({
            'moving': this._onMoving,
            'scaling': this._onScaling
        });
    },

    /**
     * Render Crop-zone
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {boolean} isFirstRender - is first render
     * @private
     * @override
     */
    _render(ctx, isFirstRender) {
        const cropzoneDashLineWidth = 7;
        const cropzoneDashLineOffset = 7;

        if (!isFirstRender) {
            this.callSuper('_render', ctx);
        }

        this.isCropzoneInner = true;

        // Calc original scale
        const originalFlipX = this.flipX ? -1 : 1;
        const originalFlipY = this.flipY ? -1 : 1;
        const originalScaleX = originalFlipX / this.scaleX;
        const originalScaleY = originalFlipY / this.scaleY;

        // Set original scale
        ctx.scale(originalScaleX, originalScaleY);

        // Render outer rect
        this._fillOuterRect('rgba(0, 0, 0, 0.5)');

        if (this.options.lineWidth) {
            this._fillInnerRect();
            this._strokeBorder('rgb(255, 255, 255)', {
                lineWidth: this.options.lineWidth
            });
        } else {
            // Black dash line
            this._strokeBorder('rgb(0, 0, 0)', {
                lineDashWidth: cropzoneDashLineWidth
            });

            // White dash line
            this._strokeBorder('rgb(255, 255, 255)', {
                lineDashWidth: cropzoneDashLineWidth,
                lineDashOffset: cropzoneDashLineOffset
            });
        }

        // Reset scale
        ctx.scale(1 / originalScaleX, 1 / originalScaleY);
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
     * @param {string|CanvasGradient|CanvasPattern} fillStyle - Fill-style
     * @private
     */
    _fillOuterRect(fillStyle) {
        const {x, y} = this._getCoordinates();

        const pathStr = [
            // Outer rect
            `M${x[0] - 1},${y[0] - 1}`,
            `L${x[3] + 1},${y[0] - 1}`,
            `L${x[3] + 1},${y[3] + 1}`,
            `L${x[0] - 1},${y[3] + 1}`,
            `L${x[0] - 1},${y[0] - 1}`,
            'Z',

            // Inner rect
            `M${x[1]},${y[1]}`,
            `L${x[1]},${y[2]}`,
            `L${x[2]},${y[2]}`,
            `L${x[2]},${y[1]}`,
            `L${x[1]},${y[1]}`,
            'Z'
        ].join('');

        const outerRectPath = new fabric.Path(pathStr);

        console.log('------------');
        console.log(x[0], y[0]);
        console.log(x[1], y[1]);
        console.log(x[2], y[2]);
        console.log(x[3], y[3]);
        console.log('============');
        console.log(this.width, this.height);

        outerRectPath.fill = fillStyle;
        outerRectPath.selectable = false;

        this.canvas.add(outerRectPath);
        this.outerRectPath = outerRectPath;
    },

    /**
     * Draw Inner grid line
     * @private
     */
    _fillInnerRect() {
        const {x: outerX, y: outerY} = this._getCoordinates();
        const x = this._calculateInnerPosition(outerX, (outerX[2] - outerX[1]) / 3);
        const y = this._calculateInnerPosition(outerY, (outerY[2] - outerY[1]) / 3);

        const innerRectPath = new fabric.Path([
            `M${x[0]},${y[1]}`,
            `L${x[3]},${y[1]}`,
            `M${x[0]},${y[2]}`,
            `L${x[3]},${y[2]}`,
            `M${x[1]},${y[0]}`,
            `L${x[1]},${y[3]}`,
            `M${x[2]},${y[0]}`,
            `L${x[2]},${y[3]}`
        ].join(''));
        innerRectPath.stroke = 'rgba(255, 255, 255, 0.7)';
        innerRectPath.strokeWidth = this.options.lineWidth;
        innerRectPath.fill = 'rgba(0,0,0,0)';
        innerRectPath.selectable = false;

        this.innerRectPath = innerRectPath;

        this.canvas.add(innerRectPath);
    },

    /**
     * Calculate Inner Position
     * @param {Array} outer - outer position
     * @param {number} size - interval for calculate
     * @returns {Array} - inner position
     * @private
     */
    _calculateInnerPosition(outer, size) {
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
        const {width, height, left, top} = this;
        const canvasEl = this.canvas; // canvas element, not fabric object

        const x = snippet.map([
            0, // x0
            left, // x1
            left + width, // x2
            canvasEl.width// x3
        ], Math.ceil);
        const y = snippet.map([
            0, // y0
            top, // y1
            top + height, // y2
            canvasEl.height// y3
        ], Math.ceil);

        return {
            x,
            y
        };
    },

    /**
     * Stroke border
     * @param {string|CanvasGradient|CanvasPattern} strokeStyle - Stroke-style
     * @param {number} lineDashWidth - Dash width
     * @param {number} [lineDashOffset] - Dash offset
     * @param {number} [lineWidth] - line width
     * @private
     */
    _strokeBorder(strokeStyle, {lineDashWidth, lineDashOffset, lineWidth}) {
        const {x, y} = this._getCoordinates();

        const borderPath = new fabric.Path([
            `M${x[1]},${y[1]}`,
            `L${x[2]},${y[1]}`,
            `L${x[2]},${y[2]}`,
            `L${x[1]},${y[2]}`,
            `L${x[1]},${y[1]}`,
            'Z'
        ].join(''));

        borderPath.stroke = strokeStyle;

        if (lineDashOffset) {
            borderPath.strokeDashOffset = lineDashOffset;
        }
        if (lineWidth) {
            borderPath.strokeWidth = lineWidth;
        }

        borderPath.borderDashArray = [lineDashWidth, lineDashWidth];
        borderPath.selectable = false;
        borderPath.fill = 'rgba(0,0,0,0)';

        this.borderPaths.push(borderPath);

        this.canvas.add(borderPath);
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
        const bottom = this.height + this.top;
        const right = this.width + this.left;
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
    },

    remove() {
        this.canvas.remove(this.outerRectPath);
        this.canvas.remove(this.innerRectPath);
        this.borderPaths.forEach(path => this.canvas.remove(path));
    }
});

module.exports = Cropzone;
