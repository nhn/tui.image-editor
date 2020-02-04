/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Cropzone extending fabric.Rect
 */
import snippet from 'tui-code-snippet';
import fabric from 'fabric';
import {clamp} from '../util';
import {eventNames as events} from '../consts';

const CORNER_TYPE_TOP_LEFT = 'tl';
const CORNER_TYPE_TOP_RIGHT = 'tr';
const CORNER_TYPE_MIDDLE_TOP = 'mt';
const CORNER_TYPE_MIDDLE_LEFT = 'ml';
const CORNER_TYPE_MIDDLE_RIGHT = 'mr';
const CORNER_TYPE_MIDDLE_BOTTOM = 'mb';
const CORNER_TYPE_BOTTOM_LEFT = 'bl';
const CORNER_TYPE_BOTTOM_RIGHT = 'br';
const NOOP_FUNCTION = () => {};

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
        this._addEventHandler();

        this.canvas = canvas;
        this.options = options;
    },
    canvasEventDelegation(eventName) {
        let delegationState = 'unregisted';
        const isRegisted = this.canvasEventTrigger[eventName] !== NOOP_FUNCTION;
        if (isRegisted) {
            delegationState = 'registed';
        } else if ([events.OBJECT_MOVED, events.OBJECT_SCALED].indexOf(eventName) < 0) {
            delegationState = 'none';
        }

        return delegationState;
    },
    canvasEventRegister(eventName, eventTrigger) {
        this.canvasEventTrigger[eventName] = eventTrigger;
    },
    _addEventHandler() {
        this.canvasEventTrigger = {
            [events.OBJECT_MOVED]: NOOP_FUNCTION,
            [events.OBJECT_SCALED]: NOOP_FUNCTION
        };
        this.on({
            'mousedown': e => {
                if (e.transform.corner) {
                    this.dragStartPoint = {
                        x: e.pointer.x,
                        y: e.pointer.y
                    };
                }
            },
            'mouseup': () => {
                this.dragStartPoint = null;
            },
            'moving': this._onMoving.bind(this),
            'scaling': this._onScaling.bind(this)
        });
    },
    _renderCropzone(ctx) {
        const cropzoneDashLineWidth = 7;
        const cropzoneDashLineOffset = 7;

        // Calc original scale
        const originalFlipX = this.flipX ? -1 : 1;
        const originalFlipY = this.flipY ? -1 : 1;
        const originalScaleX = originalFlipX / this.scaleX;
        const originalScaleY = originalFlipY / this.scaleY;

        // Set original scale
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
    _render(ctx) {
        this.callSuper('_render', ctx);

        this._renderCropzone(ctx);
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

        this.canvasEventTrigger[events.OBJECT_MOVED](this);
    },

    /**
     * onScaling event listener
     * @param {{e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onScaling(fEvent) {
        const selectedCorner = fEvent.transform.corner;
        const pointer = this.canvas.getPointer(fEvent.e);
        const settings = this._calcScalingSizeFromPointer(pointer, selectedCorner);

        // On scaling cropzone,
        // change real width and height and fix scaleFactor to 1
        this.scale(1).set(settings);

        this.canvasEventTrigger[events.OBJECT_SCALED](this);
    },

    /**
     * Calc scaled size from mouse pointer with selected corner
     * @param {{x: number, y: number}} pointer - Mouse position
     * @param {string} selectedCorner - selected corner type
     * @returns {Object} Having left or(and) top or(and) width or(and) height.
     * @private
     */
    _calcScalingSizeFromPointer(pointer, selectedCorner) {
        const isCornerTypeValid = this._cornerTypeValid(selectedCorner);
        const scalingMathodName = `_resize${selectedCorner.toUpperCase()}`;

        return isCornerTypeValid && this[scalingMathodName](pointer);
    },

    /**
     * Align with cropzone ratio
     * @param {string} selectedCorner - selected corner type
     * @returns {{width: number, height: number}}
     * @private
     */
    _cornerTypeValid(selectedCorner) {
        return [CORNER_TYPE_TOP_LEFT,
            CORNER_TYPE_TOP_RIGHT,
            CORNER_TYPE_MIDDLE_TOP,
            CORNER_TYPE_MIDDLE_LEFT,
            CORNER_TYPE_MIDDLE_RIGHT,
            CORNER_TYPE_MIDDLE_BOTTOM,
            CORNER_TYPE_BOTTOM_LEFT,
            CORNER_TYPE_BOTTOM_RIGHT].indexOf(selectedCorner) >= 0;
    },

    /**
     * Align with cropzone ratio
     * @param {Object} position - Mouse position
     *   @param {number} width - cropzone width
     *   @param {number} height - cropzone height
     *   @param {number} ratio - cropzone ratio
     *   @param {number} maxWidth - limit max width
     *   @param {number} maxHeight - limit max height
     * @returns {{width: number, height: number}}
     * @private
     */
    adjustRatioSize({width, height, ratio, scaleTo, maxWidth, maxHeight}) {
        if (scaleTo === 'width') {
            height = width / ratio;
        } else {
            width = height * ratio;
        }

        const maxScaleFactor = Math.min(maxWidth / width, maxHeight / height);
        if (maxScaleFactor <= 1) {
            [width, height] = [width, height].map(v => v * maxScaleFactor);
        }

        return {
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control TL
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeTL({x, y}) {
        // const {width: maxX, height: maxY} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const bottom = rect.height + rect.top;
        const right = rect.width + rect.left;

        const maxWidth = right;
        const minWidth = 1;
        const maxHeight = bottom;
        const minHeight = 1;

        let width = clamp(right - x, minWidth, maxWidth);
        let height = clamp(bottom - y, minHeight, maxHeight);

        if (this.dragStartPoint && presetRatio) {
            const dx = rect.left - x;
            const dy = rect.top - y;
            const scaleTo = dx > dy ? 'width' : 'height';
            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo,
                maxWidth,
                maxHeight
            }));
        }

        const left = right - width;
        const top = bottom - height;

        return {
            left,
            top,
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control MT
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeMT({y}) {
        const {width: maxX} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);
        const bottom = rect.height + rect.top;

        const maxWidth = maxX - rect.left;
        const maxHeight = bottom;
        const minHeight = 1;

        let height = clamp(bottom - y, minHeight, maxHeight);
        const {left} = rect;
        let {width} = rect;

        if (this.dragStartPoint && presetRatio) {
            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo: 'height',
                maxWidth,
                maxHeight
            }));
        }

        const top = bottom - height;

        return {
            left,
            top,
            height,
            width
        };
    },

    /**
     * Calc scaling dimension with control TR
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeTR({x, y}) {
        const {width: maxX} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const right = rect.width + rect.left;
        const bottom = rect.height + rect.top;

        const maxWidth = maxX - rect.left;
        const minWidth = 1;
        const maxHeight = bottom;
        const minHeight = 1;

        let width = clamp(x - rect.left, minWidth, maxWidth);
        let height = clamp(bottom - y, minHeight, maxHeight);

        if (this.dragStartPoint && presetRatio) {
            const dx = x - right;
            const dy = rect.top - y;
            const scaleTo = dx > dy ? 'width' : 'height';
            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo,
                maxWidth,
                maxHeight
            }));
        }

        const top = bottom - height;

        return {
            left: rect.left,
            top,
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control BL
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeBL({x, y}) {
        const {height: maxY} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const right = rect.width + rect.left;
        const bottom = rect.height + rect.top;

        const maxWidth = right;
        const minWidth = 1;

        const maxHeight = maxY - rect.top;
        const minHeight = 1;

        let width = clamp(right - x, minWidth, maxWidth);
        let height = clamp(y - rect.top, minHeight, maxHeight);

        if (this.dragStartPoint && presetRatio) {
            const dx = rect.left - x;
            const dy = y - bottom;
            const scaleTo = dx > dy ? 'width' : 'height';

            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo,
                maxWidth,
                maxHeight
            }));
        }

        const left = right - width;

        return {
            left,
            top: rect.top,
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control BR
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeBR({x, y}) {
        const {width: maxX, height: maxY} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const bottom = rect.height + rect.top;
        const right = rect.width + rect.left;

        const maxWidth = maxX - rect.left;
        const minWidth = 1;

        const maxHeight = maxY - rect.top;
        const minHeight = 1;

        let width = clamp(x - rect.left, minWidth, maxWidth);
        let height = clamp(y - rect.top, minHeight, maxHeight);

        if (this.dragStartPoint && presetRatio) {
            const dx = x - right;
            const dy = y - bottom;
            const scaleTo = dx > dy ? 'width' : 'height';

            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo,
                maxWidth,
                maxHeight
            }));
        }

        return {
            left: rect.left,
            top: rect.top,
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control MB
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeMB({y}) {
        const {width: maxX, height: maxY} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const maxWidth = maxX - rect.left;
        const maxHeight = maxY - rect.top;
        const minHeight = 1;

        let {width} = rect;
        let height = clamp(y - rect.top, minHeight, maxHeight);

        if (this.dragStartPoint && presetRatio) {
            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo: 'height',
                maxWidth,
                maxHeight
            }));
        }

        return {
            left: rect.left,
            top: rect.top,
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control ML
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeML({x}) {
        const {height: maxY} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const right = rect.width + rect.left;

        const maxWidth = right;
        const minWidth = 1;
        const maxHeight = maxY - rect.top;

        let width = clamp(right - x, minWidth, maxWidth);
        let {height} = rect;

        if (presetRatio) {
            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo: 'width',
                maxWidth,
                maxHeight
            }));
        }

        const left = right - width;

        return {
            left,
            top: rect.top,
            width,
            height
        };
    },

    /**
     * Calc scaling dimension with control MR
     * @param {Object} position - Mouse position
     *   @param {string} x - Mouse position x
     *   @param {string} y - Mouse position y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _resizeMR({x}) {
        const {width: maxX, height: maxY} = this.canvas;
        const {presetRatio} = this.options;
        const rect = this.getBoundingRect(false, true);

        const maxWidth = maxX - rect.left;
        const minWidth = 1;
        const maxHeight = maxY - rect.top;

        let width = clamp(x - rect.left, minWidth, maxWidth);
        let {height} = rect;

        if (presetRatio) {
            ({width, height} = this.adjustRatioSize({
                width,
                height,
                presetRatio,
                scaleTo: 'width',
                maxWidth,
                maxHeight
            }));
        }

        return {
            left: rect.left,
            top: rect.top,
            width,
            height
        };
    },

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
