/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape resize helper
 */
import {forEach, map} from 'tui-code-snippet';
import {setCustomProperty} from '../util';
import resizeHelper from '../helper/shapeResizeHelper';

/**
 * Rotated shape dimension
 * @param {fabric.Object} shapeObj - Shape object
 * @returns {Object} Rotated shape dimension
 */
export function getRotatedDimension(shapeObj) {
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
 * Make fill image
 * @param {HTMLImageElement} copiedCanvasElement - html image element
 * @param {number} currentCanvasImageAngle - current canvas angle
 * @returns {fabric.Image}
 * @private
 */
export function makeFillImage(copiedCanvasElement, currentCanvasImageAngle) {
    const fillImage = new fabric.Image(copiedCanvasElement);
    const filter = new fabric.Image.filters.Pixelate({
        blocksize: 20
    });
    /*
    const filter2 = new fabric.Image.filters.Blur({
        blur: 0.3
    });
    */

    setCustomProperty(fillImage, {originalAngle: currentCanvasImageAngle});
    resizeHelper.adjustOriginToCenter(fillImage);

    fillImage.filters.push(filter);
    // fillImage.filters.push(filter2);
    fillImage.applyFilters();

    return fillImage;
}

/**
 * Calculate position for out of Canvas
 * @param {fabric.Object} shapeObj - shape object
 * @param {string} type - 'x' or 'y'
 * @param {number} outDistance - distance away
 * @param {number} left - original left position
 * @param {number} top - original top position
 * @returns {Array}
 */
export function calculatePositionOutOfCanvas(shapeObj, type, outDistance, left, top) {
    const shapePointNavigation = getShapeEdgePoint(shapeObj);
    const shapeNeighborPointNavigation = [[1, 2], [0, 3], [0, 3], [1, 2]];

    const {startPointIndex, endPointIndex1, endPointIndex2} =
        calculateLinePointsOutsideCanvas(type, shapePointNavigation, shapeNeighborPointNavigation);
    const [angle1, angle2] = calculateLineAngleOfOutsideCanvas(type, shapePointNavigation, {
        startPointIndex,
        endPointIndex1,
        endPointIndex2
    });

    const rotationChangePoint1 = outDistance * Math.cos(angle1 * Math.PI / 180);
    const rotationChangePoint2 = outDistance * Math.cos(angle2 * Math.PI / 180);

    if (startPointIndex === 0) {
        top = top - rotationChangePoint2;
        left = left - rotationChangePoint1;
    }
    if (startPointIndex === 1) {
        top = top - rotationChangePoint2;
        left = left + rotationChangePoint1;
    }
    if (startPointIndex === 2) {
        top = top + rotationChangePoint1;
        left = left - rotationChangePoint2;
    }
    if (startPointIndex === 3) {
        top = top + rotationChangePoint1;
        left = left + rotationChangePoint2;
    }

    return [left, top];
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

