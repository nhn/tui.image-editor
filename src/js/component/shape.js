/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Shape module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var util = tui.util;
var extend = util.extend;
var bind = util.bind;

var KEY_CODES = consts.keyCodes;
var SELECTION_STYLE = consts.fObjectOptions.SELECTION_STYLE;

/**
 * Shape
 * @class Shape
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Shape = tui.util.defineClass(Component, /** @lends Shape.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Object of current drawing shape
         * @type {fabric.Object}
         * @private
         */
        this._shapeObj = null;

        /**
         * Type for drawing shape
         * @type {string}
         * @private
         */
        this._type = 'rect';

        /**
         * Options for drawing shape
         * @type {object}
         * @private
         */
        this._options = {};

        /**
         * Whether drawing shpae is to be 1:1 ratio or not
         * @type {boolean}
         * @private
         */
        this._isRegularRatio = false;

        /**
         * Pointer for drawing shape (x, y)
         * @type {object}
         * @private
         */
        this._startPoint = {};

        /**
         * Using shortcut
         * @type {boolean}
         * @private
         */
        this._withShiftKey = false;

        /**
         * Event handler list
         * @type {object}
         * @private
         */
        this._handlers = {
            select: bind(this._onFabricSelect, this),
            deselect: bind(this._onFabricDeselect, this),
            mousedown: bind(this._onFabricMouseDown, this),
            mousemove: bind(this._onFabricMouseMove, this),
            mouseup: bind(this._onFabricMouseUp, this),
            keydown: bind(this._onKeyDown, this),
            keyup: bind(this._onKeyUp, this)
        };
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.SHAPE,

    /**
     * Start drawing shape on canvas
     */
    start: function() {
        var canvas = this.getCanvas();

        canvas.defaultCursor = 'crosshair';
        canvas.on({
            'mouse:down': this._handlers.mousedown
        });

        fabric.util.addListener(document, 'keydown', this._handlers.keydown);
        fabric.util.addListener(document, 'keyup', this._handlers.keyup);
    },

    /**
     * End drawing shape on canvas
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.defaultCursor = 'default';
        canvas.off({
            'mouse:down': this._handlers.mousedown
        });

        fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
        fabric.util.removeListener(document, 'keyup', this._handlers.keyup);
    },

    /**
     * Set states of current drawing shape
     * @param {string} type - Shape type (ex: 'rect', 'circle')
     * @param {object} [options] - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     * @param {boolean} isRegularRatio - Whether drawing shape is to be 1:1 ratio or not
     */
    setStates: function(type, options, isRegularRatio) {
        this._type = type;

        if (options) {
            this._options = options;
        }

        if (isRegularRatio) {
            this._isRegularRatio = isRegularRatio;
        }
    },

    /**
     * Add shape
     * @param {string} type - Shape type (ex: 'rect', 'circle')
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     * @returns {fabric.Object} New shape object
     */
    add: function(type, options) {
        var canvas = this.getCanvas();
        var newShape;

        options = extend({}, SELECTION_STYLE, (options || this._options));

        this._setPosition(options);

        newShape = this._getShapeInstance(type, options);

        newShape.on({
            'selected': this._handlers.select,
            'deselected': this._handlers.deselect,
            'scaling': this._onFabricScaling
        });

        canvas.add(newShape);

        return newShape;
    },

    /**
     * Change shape
     * @param {fabric.Object} activeObj - Selected object on canvas
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     */
    change: function(activeObj, options) {
        activeObj.set(options);

        this.getCanvas().renderAll();
    },

    /**
     * Scaling object event handler on canvas
     * @private
     */
    _onFabricScaling: function() {
        var type = this.type;
        var scaleX = this.scaleX;
        var scaleY = this.scaleY;
        var options = {
            scaleX: 1,
            scaleY: 1
        };

        if (type === 'rect') {
            options = extend(options, {
                width: this.width * scaleX,
                height: this.height * scaleY
            });
        } else if (type === 'circle') {
            options = extend(options, {
                rx: this.rx * scaleX,
                ry: this.ry * scaleY
            });
        }

        this.set(options);
    },

    /**
     * Select object event handler on canvas
     * @private
     */
    _onFabricSelect: function() {
        this._isSelected = true;
    },

    /**
     * Deselect object event handler on canvas
     * @private
     */
    _onFabricDeselect: function() {
        this._isSelected = false;
    },

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseDown: function(fEvent) {
        var canvas = this.getCanvas();
        var currentPointer = canvas.getPointer(fEvent.e);
        var shapeType = this._type;
        var options;

        if (!this._isSelected) {
            this._startPoint = currentPointer;

            options = this._getInitOptions(shapeType, currentPointer);

            this._shapeObj = this.add(shapeType, options);

            canvas.selection = false;
            canvas.on({
                'mouse:move': this._handlers.mousemove,
                'mouse:up': this._handlers.mouseup
            });
        }
    },

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var shapeType = this._type;

        if (shapeType === 'rect') {
            this._setRectOptions(pointer);
        } else if (shapeType === 'circle') {
            this._setCircleOptions(pointer);
        }

        this._adjustOrigins(pointer);

        this._shapeObj.setCoords();

        canvas.renderAll();
    },

    /**
     * MouseUp event handler on canvas
     * @private
     */
    _onFabricMouseUp: function() {
        var canvas = this.getCanvas();

        this._adjustPosition(); // set origin position

        this._shapeObj = null;

        canvas.renderAll();
        canvas.off({
            'mouse:move': this._handlers.mousemove,
            'mouse:up': this._handlers.mouseup
        });
    },

    /**
     * Get options for drawing shape
     * @param {string} type - Shape type
     * @param {object} pointer - Current mouse pointer
     * @returns {object} Options
     * @private
     */
    _getInitOptions: function(type, pointer) {
        var initX = pointer.x - this._startPoint.x;
        var initY = pointer.y - this._startPoint.y;
        var options = extend({
            originX: 'left',
            originY: 'top',
            left: pointer.x,
            top: pointer.y
        }, this._options);

        if (type === 'rect') {
            options.width = initX;
            options.height = initY;
        } else if (type === 'circle') {
            options.rx = initX;
            options.ry = initY;
        }

        return options;
    },

    /**
     * Set circle options while drawing shape
     * @param {{x: number, y: number}} pointer - Current pointer
     * @private
     */
    _setCircleOptions: function(pointer) {
        var currentShape = this._shapeObj;
        var startPoint = this._startPoint;
        var radiusX = Math.abs(startPoint.x - pointer.x) / 2;
        var radiusY = Math.abs(startPoint.y - pointer.y) / 2;

        if (this._withShiftKey || this._isRegularRatio) {
            radiusX = radiusY = Math.max(radiusX, radiusY);
        }

        if (radiusX > currentShape.strokeWidth) {
            radiusX -= currentShape.strokeWidth / 2;
        }

        if (radiusY > currentShape.strokeWidth) {
            radiusY -= currentShape.strokeWidth / 2;
        }

        currentShape.set({
            rx: radiusX,
            ry: radiusY
        });
    },

    /**
     * Set rectangle options while drawing shape
     * @param {{x: number, y: number}} pointer - Current pointer
     * @private
     */
    _setRectOptions: function(pointer) {
        var currentShape = this._shapeObj;
        var startPoint = this._startPoint;
        var width = Math.abs(startPoint.x - pointer.x);
        var height = Math.abs(startPoint.y - pointer.y);

        if (this._withShiftKey || this._isRegularRatio) {
            width = height = Math.max(width, height);
        }

        if (width > currentShape.strokeWidth) {
            width -= currentShape.strokeWidth;
        }

        if (height > currentShape.strokeWidth) {
            height -= currentShape.strokeWidth;
        }

        currentShape.set({
            width: width,
            height: height
        });
    },

    /**
     * Adjust "originX" or "originY" value on shape
     * @param {{x: number, y: number}} pointer - Current pointer
     * @private
     */
    _adjustOrigins: function(pointer) {
        var currentShape = this._shapeObj;
        var startPoint = this._startPoint;

        if (startPoint.x > pointer.x) {
            currentShape.set({originX: 'right'});
        } else {
            currentShape.set({originX: 'left'});
        }

        if (startPoint.y > pointer.y) {
            currentShape.set({originY: 'bottom'});
        } else {
            currentShape.set({originY: 'top'});
        }
    },

    /**
     * Adjust position of shape
     * @private
     */
    _adjustPosition: function() {
        var currentShape = this._shapeObj;
        var originX = currentShape.getOriginX();
        var originY = currentShape.getOriginY();
        var currentPoint = currentShape.getPointByOrigin(originX, originY);
        var nextPoint = currentShape.getPointByOrigin('center', 'center');
        var left = nextPoint.x - currentPoint.x;
        var top = nextPoint.y - currentPoint.y;

        currentShape.set({
            originX: 'center',
            originY: 'center',
            left: currentShape.getLeft() + left,
            top: currentShape.getTop() + top
        });
    },

    /**
     * Get instance of creating shape
     * @param {string} type - Shape type
     * @param {object} options - Shape options
     * @returns {fabric.Object} Instance of shape
     * @private
     */
    _getShapeInstance: function(type, options) {
        var instance;

        if (type === 'rect') {
            instance = new fabric.Rect(options);
        } else if (type === 'circle') {
            instance = new fabric.Ellipse(extend({type: 'circle'}, options));
        }

        return instance;
    },

    /**
     * Set position of shape
     * @param {object} options - Shape
     * @private
     */
    _setPosition: function(options) {
        var centerPoint = this.getCanvas().getCenter();

        if (!options.left) {
            options.left = centerPoint.left;
        }

        if (!options.top) {
            options.top = centerPoint.top;
        }
    },

    /**
     * Keydown event handler on document
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown: function(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._withShiftKey = true;
        }
    },

    /**
     * Keyup event handler on document
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyUp: function(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._withShiftKey = false;
        }
    }
});

module.exports = Shape;
