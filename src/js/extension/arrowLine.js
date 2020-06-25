/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Blur extending fabric.Image.filters.Convolute
 */
import fabric from 'fabric';

const ARROW_ANGLE = 30;
const CHEVRON_SIZE_RATIO = 2.7;
const TRIANGLE_SIZE_RATIO = 1.7;
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

        this.headType = options.headType;
        this.tailType = options.tailType;
    },

    /**
     * Render ArrowLine
     * @private
     * @override
     */
    _render(ctx) {
        const {x1: fromX, y1: fromY, x2: toX, y2: toY} = this.calcLinePoints();
        this.ctx = ctx;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineWidth = this.strokeWidth;

        this._setDecoratorPath({
            fromX,
            fromY,
            toX,
            toY
        });

        this._renderStroke(ctx);
    },

    /**
     * Render Arrow Head
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _setDecoratorPath(linePosition) {
        this._setDecoratorPathImplement('start', linePosition);
        this._setDecoratorPathImplement('end', linePosition);
    },

    /**
     * Render Arrow Head
     * @param {string} type - 'start' or 'end'
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _setDecoratorPathImplement(type, linePosition) {
        switch (type === 'start' ? this.tailType : this.headType) {
            case 'triangle':
                this._setTrianglePath(type, linePosition);
                break;
            case 'chevron':
                this._setChevronPath(type, linePosition);
                break;
            default:
                break;
        }
    },

    /**
     * Render Triangle Head
     * @param {string} type - 'start' or 'end'
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _setTrianglePath(type, linePosition) {
        const decorateSize = this.ctx.lineWidth * TRIANGLE_SIZE_RATIO;

        this._setChevronPath(type, linePosition, decorateSize);
        this.ctx.closePath();
    },

    /**
     * Render Chevron Head
     * @param {string} type - 'start' or 'end'
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @param {number} decorateSize - decorate size
     * @private
     */
    _setChevronPath(type, {fromX, fromY, toX, toY}, decorateSize) {
        const {ctx} = this;
        if (!decorateSize) {
            decorateSize = this.ctx.lineWidth * CHEVRON_SIZE_RATIO;
        }

        const [standardX, standardY] = type === 'start' ? [toX, toY] : [fromX, fromY];
        const [compareX, compareY] = type === 'start' ? [fromX, fromY] : [toX, toY];

        const angle = Math.atan2(compareY - standardY, compareX - standardX) * RADIAN_CONVERSION_VALUE / Math.PI;
        const rotatedPosition = changeAngle => this.getRotatePosition(decorateSize, changeAngle, {
            x: standardX,
            y: standardY
        });

        ctx.moveTo(...rotatedPosition(angle + ARROW_ANGLE));
        ctx.lineTo(standardX, standardY);
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
