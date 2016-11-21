/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Shape resize helper
 */
'use strict';

var DIVISOR = {
    rect: 1,
    circle: 2,
    triangle: 1
};
var DIMENSION_KEYS = {
    rect: {
        w: 'width',
        h: 'height'
    },
    circle: {
        w: 'rx',
        h: 'ry'
    },
    triangle: {
        w: 'width',
        h: 'height'
    }
};

/**
 * Set the start point value to the shape object
 * @param {fabric.Object} shape - Shape object
 */
function setStartPoint(shape) {
    var originX = shape.getOriginX();
    var originY = shape.getOriginY();
    var originKey = originX.substring(0, 1) + originY.substring(0, 1);

    shape.startPoint = shape.origins[originKey];
}

/**
 * Get the positions of origin by the pointer value
 * @param {{x: number, y: number}} origin - Origin value
 * @param {{x: number, y: number}} pointer - Pointer value
 * @returns {object} Postions of origin
 */
function getOriginPositions(origin, pointer) {
    return {
        originX: (origin.x > pointer.x) ? 'right' : 'left',
        originY: (origin.y > pointer.y) ? 'bottom' : 'top'
    };
}

/**
 * Get the regular dimension by width, height
 * @param {number} width - Width value of the shape
 * @param {number} height - Height value of the shape
 * @param {boolean} isTriangle - Whether the dimension is calculated by triangle or not
 * @returns {object} Dimension values
 */
function getReguralrDimension(width, height, isTriangle) {
    width = height = Math.max(width, height);

    if (isTriangle) {
        height = Math.sqrt(3) / 2 * width;
    }

    return {
        width: width,
        height: height
    };
}

/**
 * Whether the shape has the center origin or not
 * @param {fabric.Object} shape - Shape object
 * @returns {boolean} State
 */
function hasCenterOrigin(shape) {
    return (shape.getOriginX() === 'center' &&
            shape.getOriginY() === 'center');
}

/**
 * Adjust the origin of shape by the start point
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {fabric.Object} shape - Shape object
 */
function adjustOriginByStartPoint(pointer, shape) {
    var centerPoint = shape.getPointByOrigin('center', 'center');
    var originPosition = getOriginPositions(centerPoint, pointer);
    var originX = originPosition.originX;
    var originY = originPosition.originY;
    var origin = shape.getPointByOrigin(originX, originY);
    var left = shape.getLeft() - (centerPoint.x - origin.x);
    var top = shape.getTop() - (centerPoint.x - origin.y);

    shape.set({
        originX: originX,
        originY: originY,
        left: left,
        top: top
    });

    shape.setCoords();
}

/**
 * Adjust the origin of shape by the moving pointer value
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {fabric.Object} shape - Shape object
 */
function adjustOriginByMovingPointer(pointer, shape) {
    var origin = shape.startPoint;
    var originPosition = getOriginPositions(origin, pointer);
    var originX = originPosition.originX;
    var originY = originPosition.originY;

    shape.setPositionByOrigin(origin, originX, originY);
}

/**
 * Adjust the dimension of shape on firing scaling event
 * @param {fabric.Object} shape - Shape object
 */
function adjustDimensionOnScaling(shape) {
    var type = shape.type;
    var dimensionKeys = DIMENSION_KEYS[type];
    var width = shape[dimensionKeys.w] * shape.scaleX;
    var height = shape[dimensionKeys.h] * shape.scaleY;
    var isTriangle = !!(shape.type === 'triangle');
    var lockUniScaling = !!(shape.isRegular);
    var options, dimension;

    if (shape.isRegular) {
        dimension = getReguralrDimension(width, height, isTriangle);
        width = dimension.width;
        height = dimension.height;
    }

    options = {
        hasControls: false,
        hasBorders: false,
        scaleX: 1,
        scaleY: 1,
        lockUniScaling: lockUniScaling
    };

    options[dimensionKeys.w] = width;
    options[dimensionKeys.h] = height;

    shape.set(options);
}

/**
 * Adjust the dimension of shape on firing mouse move event
 * @param {{x: number, y: number}} pointer - Pointer value
 * @param {fabric.Object} shape - Shape object
 */
function adjustDimensionOnMouseMove(pointer, shape) {
    var origin = shape.startPoint;
    var type = shape.type;
    var divisor = DIVISOR[type];
    var dimensionKeys = DIMENSION_KEYS[type];
    var width = Math.abs(origin.x - pointer.x) / divisor;
    var height = Math.abs(origin.y - pointer.y) / divisor;
    var strokeWidth = shape.strokeWidth;
    var isTriangle = !!(shape.type === 'triangle');
    var options = {};
    var dimension;

    if (width > strokeWidth) {
        width -= strokeWidth / divisor;
    }

    if (height > strokeWidth) {
        height -= strokeWidth / divisor;
    }

    if (shape.isRegular) {
        dimension = getReguralrDimension(width, height, isTriangle);
        width = dimension.width;
        height = dimension.height;
    }

    options[dimensionKeys.w] = width;
    options[dimensionKeys.h] = height;

    shape.set(options);
}

module.exports = {
    /**
     * Set each origin value to shape
     * @param {fabric.Object} shape - Shape object
     */
    setOrigins: function(shape) {
        var leftTopPoint = shape.getPointByOrigin('left', 'top');
        var rightTopPoint = shape.getPointByOrigin('right', 'top');
        var rightBottomPoint = shape.getPointByOrigin('right', 'bottom');
        var leftBottomPoint = shape.getPointByOrigin('left', 'bottom');

        shape.origins = {
            lt: leftTopPoint,
            rt: rightTopPoint,
            rb: rightBottomPoint,
            lb: leftBottomPoint
        };
    },

    /**
     * Resize the shape
     * @param {fabric.Object} shape - Shape object
     * @param {{x: number, y: number}} pointer - Mouse pointer values on canvas
     * @param {boolean} isScaling - Whether the resizing action is scaling or not
     */
    resize: function(shape, pointer, isScaling) {
        if (hasCenterOrigin(shape)) {
            adjustOriginByStartPoint(pointer, shape);
            setStartPoint(shape);
        }

        if (isScaling) {
            adjustDimensionOnScaling(shape);
        } else {
            adjustDimensionOnMouseMove(pointer, shape);
        }

        adjustOriginByMovingPointer(pointer, shape);
    },

    /**
     * Adjust the origin position of shape to center
     * @param {fabric.Object} shape - Shape object
     */
    adjustOriginToCenter: function(shape) {
        var centerPoint = shape.getPointByOrigin('center', 'center');
        var originX = shape.getOriginX();
        var originY = shape.getOriginY();
        var origin = shape.getPointByOrigin(originX, originY);
        var left = shape.getLeft() + (centerPoint.x - origin.x);
        var top = shape.getTop() + (centerPoint.y - origin.y);

        shape.set({
            hasControls: true,
            hasBorders: true,
            originX: 'center',
            originY: 'center',
            left: left,
            top: top
        });

        shape.setCoords(); // For left, top properties
    }
};
