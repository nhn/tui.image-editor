/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Free drawing module, Set brush
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * Line
 * @class Line
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Line = tui.util.defineClass(Component, /** @lends FreeDrawing.prototype */{
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
         * Listeners
         * @type {object.<string, function>}
         * @private
         */
        this._listeners = {
            mousedown: $.proxy(this._onFabricMouseDown, this),
            mousemove: $.proxy(this._onFabricMouseMove, this),
            mouseup: $.proxy(this._onFabricMouseUp, this)
        };
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.LINE,

    /**
     * Start drawing line mode
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    start: function(setting) {
        var canvas = this.getCanvas();

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;

        this.setBrush(setting);

        canvas.forEachObject(function(obj) {
            obj.set({
                evented: false
            });
        });

        canvas.on({
            'mouse:down': this._listeners.mousedown
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
     * End drawing line mode
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.defaultCursor = 'default';
        canvas.selection = true;

        canvas.forEachObject(function(obj) {
            obj.set({
                evented: true
            });
        });

        canvas.off('mouse:down', this._listeners.mousedown);
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

        this._line = new fabric.Line(points, {
            stroke: this._oColor.toRgba(),
            strokeWidth: this._width,
            evented: false
        });

        this._line.set(consts.fObjectOptions.SELECTION_STYLE);

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

        canvas.off({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }
});

module.exports = Line;
