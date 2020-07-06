/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape resize helper
 */
import {forEach, map, extend} from 'tui-code-snippet';
import {setCustomProperty, getCustomProperty} from '../util';
import resizeHelper from '../helper/shapeResizeHelper';

const FILTER_OPTION_MAP = {
    'pixelate': 'blocksize',
    'blur': 'blur'
};

/**
 * Cached canvas image element for fill image
 * @type {boolean}
 * @private
 */
let cachedCanvasImageElement = null;

/**
 * Get background image of fill
 * @param {fabric.Object} shapeObj - Shape object
 * @returns {fabric.Image}
 * @private
 */
export function getfillImageFromShape(shapeObj) {
    const {patternSourceCanvas} = getCustomProperty(shapeObj, 'patternSourceCanvas');
    const [fillImage] = patternSourceCanvas.getObjects();

    return fillImage;
}

/**
 * Reset the image position in the filter type fill area.
 * @param {fabric.Object} shapeObj - Shape object
 * @private
 */
export function rePositionFilterTypeFillImage(shapeObj) {
    const {angle, flipX, flipY} = shapeObj;
    const fillImage = getfillImageFromShape(shapeObj);
    const {width: rotatedWidth, height: rotatedHeight} = getRotatedDimension(shapeObj);
    const diffLeft = (rotatedWidth - shapeObj.width) / 2;
    const diffTop = (rotatedHeight - shapeObj.height) / 2;
    const cropX = shapeObj.left - (shapeObj.width / 2) - diffLeft;
    const cropY = shapeObj.top - (shapeObj.height / 2) - diffTop;
    let left = (rotatedWidth / 2) - diffLeft;
    let top = (rotatedHeight / 2) - diffTop;

    forEach(['x', 'y'], type => {
        const outDistance = type === 'x' ? cropX : cropY;
        if (outDistance < 0) {
            [left, top] = calculateFillImagePositionOutOfCanvas({
                type,
                shapeObj,
                outDistance,
                left,
                top,
                flipX,
                flipY
            });
        }
    });

    fillImage.set({
        angle: flipX === flipY ? -angle : angle,
        flipX,
        flipY,
        left,
        top,
        width: rotatedWidth,
        height: rotatedHeight,
        cropX,
        cropY
    });
}

/**
 * Make fill property of dynamic pattern type
 * @param {fabric.Image} canvasImage - canvas background image
 * @param {Array} filterOption - filter option
 * @returns {Object}
 * @private
 */
export function makeFillPatternForFilter(canvasImage, filterOption) {
    const copiedCanvasElement = getCachedCanvasImageElement(canvasImage);
    const patternSourceCanvas = new fabric.StaticCanvas();
    const fillImage = makeFillImage(copiedCanvasElement, canvasImage.angle, filterOption);

    patternSourceCanvas.add(fillImage);
    patternSourceCanvas.renderAll();

    const fabricProperty = {
        fill: new fabric.Pattern({
            source: () => {
                patternSourceCanvas.setDimensions({
                    width: Math.max(copiedCanvasElement.width, copiedCanvasElement.height),
                    height: Math.max(copiedCanvasElement.width, copiedCanvasElement.height)
                });
                patternSourceCanvas.renderAll();

                return patternSourceCanvas.getElement();
            },
            repeat: 'no-repeat'
        })
    };
    setCustomProperty(fabricProperty, {
        patternSourceCanvas,
        filterOption
    });

    return fabricProperty;
}

/**
 * Remake filter pattern image source
 * @param {fabric.Object} shapeObj - Shape object
 * @param {fabric.Image} canvasImage - canvas background image
 * @private
 */
export function reMakePatternImageSource(shapeObj, canvasImage) {
    const {patternSourceCanvas, filterOption} = getCustomProperty(shapeObj, ['patternSourceCanvas', 'filterOption']);
    const [fillImage] = patternSourceCanvas.getObjects();
    patternSourceCanvas.remove(fillImage);

    const copiedCanvasElement = getCachedCanvasImageElement(canvasImage, true);
    const newFillImage = makeFillImage(copiedCanvasElement, canvasImage.angle, filterOption);
    patternSourceCanvas.add(newFillImage);
}

/**
 * Calculate fill image position for out of Canvas
 * @param {string} type - 'x' or 'y'
 * @param {fabric.Object} shapeObj - shape object
 * @param {number} outDistance - distance away
 * @param {number} left - original left position
 * @param {number} top - original top position
 * @returns {Array}
 */
function calculateFillImagePositionOutOfCanvas({type, shapeObj, outDistance, left, top, flipX, flipY}) {
    const shapePointNavigation = getShapeEdgePoint(shapeObj);
    const shapeNeighborPointNavigation = [[1, 2], [0, 3], [0, 3], [1, 2]];
    const linePointsOutsideCanvas =
        calculateLinePointsOutsideCanvas(type, shapePointNavigation, shapeNeighborPointNavigation);
    const reatAngles =
        calculateLineAngleOfOutsideCanvas(type, shapePointNavigation, linePointsOutsideCanvas);
    const {startPointIndex} = linePointsOutsideCanvas;
    const diffPosition = isReversePositionForFlip({
        outDistance,
        startPointIndex,
        flipX,
        flipY,
        reatAngles
    });

    return [left + diffPosition.left, top + diffPosition.top];
}

/**
 * Calculate fill image position for out of Canvas
 * @param {number} outDistance - distance away
 * @param {boolean} flipX - flip x statux
 * @param {boolean} flipY - flip y statux
 * @param {Array} reatAngles - Line angle of the rectangle vertex.
 * @returns {Object} diffPosition
 */
function isReversePositionForFlip({outDistance, startPointIndex, flipX, flipY, reatAngles}) {
    const rotationChangePoint1 = outDistance * Math.cos(reatAngles[0] * Math.PI / 180);
    const rotationChangePoint2 = outDistance * Math.cos(reatAngles[1] * Math.PI / 180);
    const isForward = startPointIndex === 2 || startPointIndex === 3;
    const diffPosition = {
        top: isForward ? rotationChangePoint1 : rotationChangePoint2,
        left: isForward ? rotationChangePoint2 : rotationChangePoint1
    };

    if (isReverseLeftPositionForFlip(startPointIndex, flipX, flipY)) {
        diffPosition.left = diffPosition.left * -1;
    }
    if (isReverseTopPositionForFlip(startPointIndex, flipX, flipY)) {
        diffPosition.top = diffPosition.top * -1;
    }

    return diffPosition;
}

/**
 * Calculate a point line outside the canvas. 
 * @param {string} type - 'x' or 'y'
 * @param {Array} shapePointNavigation - shape edge positions
 *   @param {Object} shapePointNavigation.lefttop - left top position
 *   @param {Object} shapePointNavigation.righttop - right top position
 *   @param {Object} shapePointNavigation.leftbottom - lefttop position
 *   @param {Object} shapePointNavigation.rightbottom - rightbottom position
 * @param {Array} shapeNeighborPointNavigation - Array to find adjacent edges.
 * @returns {Object}
 */
function calculateLinePointsOutsideCanvas(type, shapePointNavigation, shapeNeighborPointNavigation) {
    let minimumPoint = 0;
    let minimumPointIndex = 0;
    forEach(shapePointNavigation, (point, index) => {
        if (point[type] < minimumPoint) {
            minimumPoint = point[type];
            minimumPointIndex = index;
        }
    });

    const [endPointIndex1, endPointIndex2] = shapeNeighborPointNavigation[minimumPointIndex];

    return {
        startPointIndex: minimumPointIndex,
        endPointIndex1,
        endPointIndex2
    };
}

/**
 * Calculate a point line outside the canvas. 
 * @param {string} type - 'x' or 'y'
 * @param {Array} shapePointNavigation - shape edge positions
 *   @param {object} shapePointNavigation.lefttop - left top position
 *   @param {object} shapePointNavigation.righttop - right top position
 *   @param {object} shapePointNavigation.leftbottom - lefttop position
 *   @param {object} shapePointNavigation.rightbottom - rightbottom position
 * @param {Object} LinePointsOfOneVertexIndex - Line point of one vertex
 *   @param {Object} LinePointsOfOneVertexIndex.startPoint - start point index
 *   @param {Object} LinePointsOfOneVertexIndex.endPointIndex1 - end point index
 *   @param {Object} LinePointsOfOneVertexIndex.endPointIndex2 - end point index
 * @returns {Object}
 */
function calculateLineAngleOfOutsideCanvas(type, shapePointNavigation, LinePointsOfOneVertexIndex) {
    const {startPointIndex, endPointIndex1, endPointIndex2} = LinePointsOfOneVertexIndex;
    const horizontalVerticalAngle = type === 'x' ? 180 : 270;

    return map([endPointIndex1, endPointIndex2], pointIndex => {
        const startPoint = shapePointNavigation[startPointIndex];
        const endPoint = shapePointNavigation[pointIndex];
        const diffY = startPoint.y - endPoint.y;
        const diffX = startPoint.x - endPoint.x;

        return (Math.atan2(diffY, diffX) * 180 / Math.PI) - horizontalVerticalAngle;
    });
}

/* eslint-disable complexity */
/**
 * Calculate a point line outside the canvas. 
 * @param {number} startPointIndex - start point index
 * @param {boolean} flipX - flip x statux
 * @param {boolean} flipY - flip y statux
 * @returns {boolean} flipY - flip y statux
 */
function isReverseLeftPositionForFlip(startPointIndex, flipX, flipY) {
    /* eslint-disable complexity */
    return (
        (((!flipX && flipY) || (!flipX && !flipY)) && startPointIndex === 0) ||
        (((flipX && flipY) || (flipX && !flipY)) && startPointIndex === 1) ||
        (((!flipX && !flipY) || (!flipX && flipY)) && startPointIndex === 2) ||
        (((flipX && !flipY) || (flipX && flipY)) && startPointIndex === 3)
    );
}

/**
 * Calculate a point line outside the canvas. 
 * @param {number} startPointIndex - start point index
 * @param {boolean} flipX - flip x statux
 * @param {boolean} flipY - flip y statux
 * @returns {boolean} flipY - flip y statux
 */
function isReverseTopPositionForFlip(startPointIndex, flipX, flipY) {
    return (
        (((flipX && !flipY) || (!flipX && !flipY)) && startPointIndex === 0) ||
        (((!flipX && !flipY) || (flipX && !flipY)) && startPointIndex === 1) ||
        (((flipX && flipY) || (!flipX && flipY)) && startPointIndex === 2) ||
        (((!flipX && flipY) || (flipX && flipY)) && startPointIndex === 3)
    );
}
/* eslint-enable complexity */

/**
 * Shape edge points
 * @param {fabric.Object} shapeObj - Selected shape object on canvas
 * @returns {Array} shapeEdgePoint - shape edge positions
 */
function getShapeEdgePoint(shapeObj) {
    return [
        shapeObj.getPointByOrigin('left', 'top'),
        shapeObj.getPointByOrigin('right', 'top'),
        shapeObj.getPointByOrigin('left', 'bottom'),
        shapeObj.getPointByOrigin('right', 'bottom')
    ];
}

/**
 * Rotated shape dimension
 * @param {fabric.Object} shapeObj - Shape object
 * @returns {Object} Rotated shape dimension
 */
function getRotatedDimension(shapeObj) {
    const [
        {x: ax, y: ay},
        {x: bx, y: by},
        {x: cx, y: cy},
        {x: dx, y: dy}
    ] = getShapeEdgePoint(shapeObj);

    const left = Math.min(ax, bx, cx, dx);
    const top = Math.min(ay, by, cy, dy);
    const right = Math.max(ax, bx, cx, dx);
    const bottom = Math.max(ay, by, cy, dy);

    return {
        left,
        top,
        width: right - left,
        height: bottom - top
    };
}

/**
 * Calculate a point line outside the canvas. 
 * @param {fabric.Image} canvasImage - canvas background image
 * @param {boolean} reset - default is false
 * @returns {HTMLImageElement}
 */
function getCachedCanvasImageElement(canvasImage, reset = false) {
    if (!cachedCanvasImageElement || reset) {
        cachedCanvasImageElement = canvasImage.toCanvasElement();
    }

    return cachedCanvasImageElement;
}

/**
 * Make fill image
 * @param {HTMLImageElement} copiedCanvasElement - html image element
 * @param {number} currentCanvasImageAngle - current canvas angle
 * @param {Array} filterOption - filter option
 * @returns {fabric.Image}
 * @private
 */
function makeFillImage(copiedCanvasElement, currentCanvasImageAngle, filterOption) {
    const fillImage = new fabric.Image(copiedCanvasElement);

    forEach(extend({}, ...filterOption), (value, key) => {
        const fabricFiterClassName = key.charAt(0).toUpperCase() + key.slice(1);
        const filter = new fabric.Image.filters[fabricFiterClassName]({
            [FILTER_OPTION_MAP[key]]: value
        });
        fillImage.filters.push(filter);
    });
    fillImage.applyFilters();

    setCustomProperty(fillImage, {originalAngle: currentCanvasImageAngle});
    resizeHelper.adjustOriginToCenter(fillImage);

    return fillImage;
}
