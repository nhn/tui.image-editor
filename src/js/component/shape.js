/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Shape component
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');
var resizeHelper = require('../factory/shapeResizeHelper');

var util = tui.util;
var extend = util.extend;
var bind = util.bind;

var KEY_CODES = consts.keyCodes;
var DEFAULT_TYPE = 'rect';
var DEFAULT_OPTIONS = {
    strokeWidth: 1,
    stroke: '#000000',
    fill: '#ffffff',
    width: 1,
    height: 1,
    rx: 0,
    ry: 0,
    lockSkewingX: true,
    lockSkewingY: true,
    lockUniScaling: false,
    bringForward: true,
    isRegular: false
};

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
         * Object of The drawing shape
         * @type {fabric.Object}
         * @private
         */
        this._shapeObj = null;

        /**
         * Type of the drawing shape
         * @type {string}
         * @private
         */
        this._type = DEFAULT_TYPE;

        /**
         * Options to draw the shape
         * @type {object}
         * @private
         */
        this._options = DEFAULT_OPTIONS;

        /**
         * Whether the shape object is selected or not
         * @type {boolean}
         */
        this._isSelected = false;

        /**
         * Event handler list
         * @type {object}
         * @private
         */
        this._handlers = {
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
     * Start to draw the shape on canvas
     */
    startDrawingMode: function() {
        var canvas = this.getCanvas();

        this._isSelected = false;

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;
        canvas.on({
            'mouse:down': this._handlers.mousedown
        });

        fabric.util.addListener(document, 'keydown', this._handlers.keydown);
        fabric.util.addListener(document, 'keyup', this._handlers.keyup);
    },

    /**
     * End to draw the shape on canvas
     */
    endDrawingMode: function() {
        var canvas = this.getCanvas();

        this._isSelected = false;

        canvas.defaultCursor = 'default';
        canvas.selection = true;
        canvas.off({
            'mouse:down': this._handlers.mousedown
        });

        fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
        fabric.util.removeListener(document, 'keyup', this._handlers.keyup);
    },

    /**
     * Set states of the current drawing shape
     * @param {string} type - Shape type (ex: 'rect', 'circle')
     * @param {object} [options] - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     */
    setStates: function(type, options) {
        this._type = type;

        if (options) {
            this._options = extend(this._options, options);
        }
    },

    /**
     * Add the shape
     * @param {string} type - Shape type (ex: 'rect', 'circle')
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
     */
    add: function(type, options) {
        var canvas = this.getCanvas();
        var shapeObj;

        options = this._getOptions(options);
        shapeObj = this._getInstance(type, options);

        this._bindEventOnShape(shapeObj);

        canvas.add(shapeObj);
    },

    /**
     * Change the shape
     * @param {fabric.Object} shapeObj - Selected shape object on canvas
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
     */
    change: function(shapeObj, options) {
        shapeObj.set(options);
        this.getCanvas().renderAll();
    },

    /**
     * Get the instance of shape
     * @param {string} type - Shape type
     * @param {object} options - Options to creat the shape
     * @returns {fabric.Object} Shape instance
     * @private
     */
    _getInstance: function(type, options) {
        var instance;

        switch (type) {
            case 'rect':
                instance = new fabric.Rect(options);
                break;
            case 'circle':
                instance = new fabric.Ellipse(extend({
                    type: 'circle'
                }, options));
                break;
            case 'triangle':
                instance = new fabric.Triangle(options);
                break;
            default:
                instance = {};
        }

        return instance;
    },

    /**
     * Get the options to create the shape
     * @param {object} options - Options to creat the shape
     * @returns {object} Shape options
     * @private
     */
    _getOptions: function(options) {
        var centerPoint = this.getCanvas().getCenter();
        var selectionStyles = consts.fObjectOptions.SELECTION_STYLE;

        options = extend({}, DEFAULT_OPTIONS, selectionStyles, centerPoint, options);

        if (options.isRegular) {
            options.lockUniScaling = true;
        }

        return options;
    },

    /**
     * Bind fabric events on the creating shape object
     * @param {fabric.Object} shapeObj - Shape object
     * @private
     */
    _bindEventOnShape: function(shapeObj) {
        var self = this;
        var canvas = this.getCanvas();

        shapeObj.on({
            added: function() {
                self._shapeObj = this;
                resizeHelper.setOrigins(self._shapeObj);
            },
            selected: function() {
                self._isSelected = true;
                self._shapeObj = this;
                canvas.uniScaleTransform = true;
                resizeHelper.setOrigins(self._shapeObj);
            },
            deselected: function() {
                self._isSelected = false;
                canvas.uniScaleTransform = false;
            },
            modified: function() {
                var currentObj = self._shapeObj;

                resizeHelper.adjustOriginToCenter(currentObj);
                resizeHelper.setOrigins(currentObj);
            },
            scaling: function(fEvent) {
                var pointer = canvas.getPointer(fEvent.e);
                var currentObj = self._shapeObj;

                canvas.setCursor('crosshair');

                resizeHelper.resize(currentObj, pointer, true);
            }
        });
    },

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown: function(fEvent) {
        var canvas, pointer;

        if (!this._isSelected) {
            canvas = this.getCanvas();
            pointer = canvas.getPointer(fEvent.e);

            this.add(this._type, {
                left: pointer.x,
                top: pointer.y,
                isTemp: true
            });

            canvas.on({
                'mouse:move': this._handlers.mousemove,
                'mouse:up': this._handlers.mouseup
            });
        }
    },

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var shape = this._shapeObj;

        resizeHelper.resize(shape, pointer);

        canvas.renderAll();
    },

    /**
     * MouseUp event handler on canvas
     * @private
     */
    _onFabricMouseUp: function() {
        var canvas = this.getCanvas();

        this._controlAddedObject();

        canvas.off({
            'mouse:move': this._handlers.mousemove,
            'mouse:up': this._handlers.mouseup
        });
    },

    /**
     * Keydown event handler on document
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown: function(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._shapeObj.isRegular = true;
        }
    },

    /**
     * Keyup event handler on document
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyUp: function(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._shapeObj.isRegular = false;
        }
    },

    /**
     * Control the drawing shape object
     */
    _controlAddedObject: function() {
        var canvas = this.getCanvas();
        var shape = this._shapeObj;
        var strokeWidth = shape.strokeWidth;
        var width = shape.getWidth() - strokeWidth;
        var height = shape.getHeight() - strokeWidth;

        shape.remove();

        if (width > 1 && height > 1) {
            shape.isTemp = false;
            canvas.add(shape);
            resizeHelper.adjustOriginToCenter(shape);
        }
    }
});

module.exports = Shape;
