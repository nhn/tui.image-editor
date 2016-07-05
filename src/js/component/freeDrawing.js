/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Free drawing module, Set brush
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

var keyCodes = consts.keyCodes;

/**
 * FreeDrawing
 * @class FreeDrawing
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var FreeDrawing = tui.util.defineClass(Component, /** @lends FreeDrawing.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Brush width
         * @type {number}
         * @private
         */
        this._width = 12;

        /**
         * fabric.Color instance for brush color
         * @type {fabric.Color}
         * @private
         */
        this._oColor = new fabric.Color('rgba(0, 0, 0, 0.5)');

        /**
         * State whether shortcut key is pressed or not
         * @type {boolean}
         * @private
         */
        this._withShiftKey = false;

        /**
         * Listeners
         * @type {object.<string, function>}
         * @private
         */
        this._listeners = {
            keydown: $.proxy(this._onKeyDown, this),
            keyup: $.proxy(this._onKeyUp, this),
            mousedown: $.proxy(this._onFabricMouseDown, this),
            mousemove: $.proxy(this._onFabricMouseMove, this),
            mouseup: $.proxy(this._onFabricMouseUp, this)
        };
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.FREE_DRAWING,

    /**
     * Start free drawing mode
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    start: function(setting) {
        var canvas = this.getCanvas();

        canvas.isDrawingMode = true;
        canvas.selection = false;

        this.setBrush(setting);

        fabric.util.addListener(document, 'keydown', this._listeners.keydown);
        fabric.util.addListener(document, 'keyup', this._listeners.keyup);

        canvas.on({
            'mouse:down': this._listeners.mousedown,
            'path:created': this._onPathCreated
        });
    },

    /**
     * Set brush
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    setBrush: function(setting) {
        var brush = this.getCanvas().freeDrawingBrush;

        setting = setting || {};
        this._width = setting.width || this._width;

        if (setting.color) {
            this._oColor = new fabric.Color(setting.color);
        }
        brush.width = this._width;
        brush.color = this._oColor.toRgba();
    },

    /**
     * End free drawing mode
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.isDrawingMode = false;
        canvas.selection = true;

        canvas.forEachObject(function(obj) {
            obj.set({
                borderColor: 'red',
                cornerColor: 'green',
                transparentCorners: false,
                selectable: true,
                hasBorders: true,
                hasControls: true,
                hasRotatingPoint: true
            });
        });

        fabric.util.removeListener(document, 'keydown', this._listeners.keydown);
        fabric.util.removeListener(document, 'keyup', this._listeners.keyup);

        canvas.off('mouse:down', this._listeners.mousedown);
    },

    /**
     * Keydown event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown: function(e) {
        if (e.keyCode === keyCodes.SHIFT) {
            this._withShiftKey = true;
            this.getCanvas().isDrawingMode = false;
        }
    },

    /**
     * Keyup event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyUp: function(e) {
        if (e.keyCode === keyCodes.SHIFT) {
            this._withShiftKey = false;
            this.getCanvas().isDrawingMode = true;
        }
    },

    /**
     * EventListener - "path:created"
     * @param {{path: fabric.Path}} obj - Path object
     * @private
     */
    _onPathCreated: function(obj) {
        obj.path.set({
            selectable: false,
            hasBorders: false,
            hasControls: false,
            hasRotatingPoint: false
        });
    },

    /**
     * Mousedown event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];

        if (!this._withShiftKey) {
            return;
        }

        canvas.defaultCursor = 'crosshair';
        canvas.isDrawingMode = false;

        this._line = new fabric.Line(points, {
            stroke: this._oColor.toRgba(),
            strokeWidth: this._width,
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            hasRotatingPoint: false
        });

        canvas.add(this._line);

        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    },

    /**
     * Mousemove event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);

        if (!this._withShiftKey || !this._line) {
            return;
        }

        this._line.set({
            x2: pointer.x,
            y2: pointer.y
        });

        this._line.setCoords();

        canvas.renderAll();
    },

    /**
     * Mouseup event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseUp: function() {
        var canvas = this.getCanvas();

        this._line = null;
        this._withShiftKey = false;

        canvas.defaultCursor = 'default';
        canvas.isDrawingMode = true;

        canvas.off({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }
});

module.exports = FreeDrawing;
