/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Blur extending fabric.Image.filters.Convolute
 */
import fabric from 'fabric';

const ARROW_ANGLE = 30;
const HEAD_LINE_LENGTH_RATIO = 2.7;
const RADIAN_CONVERSION_VALUE = 180;

const ArrowLine = fabric.util.createClass(fabric.Line, /** @lends Convolute.prototype */{

    /**
     * Line type
     * @param {String} type
     * @default
     */
    type: 'ArrowLine',

    /**
     * Constructor
     * @param {Array} [points] Array of points
     * @param {Object} [options] Options object
     * @override
     */
    initialize(points, options) {
        this.callSuper('initialize', points, options);
    },

    /**
     * Render ArrowLine
     * @private
     * @override
     */
    _render(ctx) {
        const {x1: fromX, y1: fromY, x2: toX, y2: toY} = this.calcLinePoints();

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);

        this.renderHead(ctx, {
            fromX,
            fromY,
            toX,
            toY
        });

        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.stroke;

        this._renderStroke(ctx);
    },

    /**
     * Render Arrow Head
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    renderHead(ctx, {fromX, fromY, toX, toY}) {
        const headLineLength = ctx.lineWidth * HEAD_LINE_LENGTH_RATIO;
        const angle = Math.atan2(fromY - toY, fromX - toX) * RADIAN_CONVERSION_VALUE / Math.PI;
        const rotatedPosition = changeAngle => this.getRotatePosition(headLineLength, changeAngle, {
            x: toX,
            y: toY
        });

        ctx.moveTo(...rotatedPosition(angle + ARROW_ANGLE));
        ctx.lineTo(toX, toY);
        ctx.lineTo(...rotatedPosition(angle - ARROW_ANGLE));
    },

    /**
     * return position from change angle.
     * @param {number} distance - change distance
     * @param {number} angle - change angle
     * @param {Object} referencePosition - reference position
     * @returns {Array}
     * @private
     */
    getRotatePosition(distance, angle, referencePosition) {
        const radian = angle * Math.PI / RADIAN_CONVERSION_VALUE;
        const {x, y} = referencePosition;

        return [
            (distance * Math.cos(radian)) + x,
            (distance * Math.sin(radian)) + y
        ];
    }
});

export default ArrowLine;
