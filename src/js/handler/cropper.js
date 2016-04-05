'use strict';
var Component = require('../interface/component'),
    Cropzone = require('../extension/cropzone'),
    util = require('../util'),
    commands = require('../consts').commands;

var MOUSE_MOVE_THRESHOLD = 10;

var abs = Math.abs,
    clamp = util.clamp;

/**
 * Cropper components
 * @param {Delegator} parent - parent component
 * @extends {Component}
 * @class Cropper
 */
var Cropper = tui.util.defineClass(Component, /* @lends Cropper.prototype */{
    init: function(parent) {
        this.setParent(parent);
        this.registerAction(commands.START_CROPPING, this.start, this);
        this.registerAction(commands.END_CROPPING, this.end, this);

        /**
         * Cropzone
         * @type {Cropzone}
         */
        this.cropzone = null;

        /**
         * StartX of Cropzone
         * @type {number}
         */
        this.startX = null;

        /**
         * StartY of Cropzone
         * @type {number}
         */
        this.startY = null;

        /**
         * Handlers
         * @type {object.<string, function>} Handler hash for fabric canvas
         */
        this.handlers = {
            mousedown: $.proxy(this.onFabricMouseDown, this),
            mousemove: $.proxy(this.onFabricMouseMove, this),
            mouseup: $.proxy(this.onFabricMouseUp, this)
        };
    },

    /**
     * Start cropping
     */
    start: function() {
        var canvas;
        if (this.cropzone) {
            return;
        }

        this.cropzone = new Cropzone({
            left: -10,
            top: -10,
            width: 1,
            height: 1,
            cornerSize: 10,
            cornerColor: 'black',
            fill: 'transparent',
            hasRotatingPoint: false,
            hasBorders: false,
            lockScalingFlip: true,
            lockRotation: true
        });

        canvas = this.getCanvas();
        canvas.add(this.cropzone);
        canvas.on('mouse:down', this.handlers.mousedown);
        canvas.defaultCursor = 'crosshair';
    },

    /**
     * onMousedown handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     */
    onFabricMouseDown: function(fEvent) {
        var canvas = this.getCanvas(),
            coord;

        if (fEvent.target) {
            return;
        }

        canvas.selection = false;
        if (fEvent.target !== this.cropzone) {
            coord = canvas.getPointer(fEvent.e);
            this.startX = coord.x;
            this.startY = coord.y;

            canvas.on({
                'mouse:move': this.handlers.mousemove,
                'mouse:up': this.handlers.mouseup
            });
        }
    },

    /**
     * onMousemove handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     */
    onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas(),
            pointer = canvas.getPointer(fEvent.e),
            x = pointer.x,
            y = pointer.y,
            cropzone = this.cropzone;

        if (abs(x - this.startX) + abs(y - this.startY) > MOUSE_MOVE_THRESHOLD) {
            cropzone.remove();
            cropzone.set(this._calcRectPositionFromPoint(x, y));

            canvas.add(cropzone);
        }
    },

    /**
     * Get rect position setting from Canvas-Mouse-Position(x, y)
     * @param {number} x - Canvas-Mouse-Position x
     * @param {number} y - Canvas-Mouse-Position Y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _calcRectPositionFromPoint: function(x, y) {
        var canvas = this.getCanvas(),
            width = canvas.getWidth(),
            height = canvas.getHeight(),
            startX = this.startX,
            startY = this.startY,
            left = clamp(x, 0, startX),
            top = clamp(y, 0, startY);

        return {
            left: left,
            top: top,
            width: clamp(x, startX, width) - left, // (startX <= x(mouse) <= canvasWidth) - left,
            height: clamp(y, startY, height) - top // (startY <= y(mouse) <= canvasHeight) - top
        };
    },

    /**
     * onMouseup handler in fabric canvas
     */
    onFabricMouseUp: function() {
        var cropzone = this.cropzone,
            handlers = this.handlers;

        this.getCanvas()
            .setActiveObject(cropzone)
            .off({
                'mouse:move': handlers.mousemove,
                'mouse:up': handlers.mouseup
            });
    },

    /**
     * End cropping
     * @param {boolean} isDone - Is done or not
     */
    end: function(isDone) {
        var canvas = this.getCanvas(),
            cropzone = this.cropzone,
            cropInfo;

        this.cropzone = null;
        cropzone.remove();
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.discardActiveObject();
        canvas.off('mouse:down', this.handlers.mousedown);

        if (!cropzone.isValid() || !isDone) {
            return;
        }

        cropInfo = {
            left: cropzone.getLeft(),
            top: cropzone.getTop(),
            width: cropzone.getWidth(),
            height: cropzone.getHeight()
        };
        this.postCommand({
            name: commands.LOAD_IMAGE_FROM_URL,
            args: [canvas.toDataURL(cropInfo), this.getImageName()]
        });
    }
});

module.exports = Cropper;
