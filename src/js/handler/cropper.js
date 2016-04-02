'use strict';
var Component = require('../interface/component'),
    Cropzone = require('../extension/cropzone'),
    commands = require('../consts').commands;

var MOUSE_MOVE_THRESHOLD = 10;

var min = Math.min,
    max = Math.max,
    abs = Math.abs;

/**
 * Cropper components
 * @param {Delegator} parent - parent component
 * @extends {Component}
 * @class Cropper
 */
var Cropper = tui.util.defineClass(Component, /* @lends Cropper.prototype */{
    init: function(parent) {
        this.setParent(parent);
        this.registerAction(commands.ON_CROP_START, this.onCropStart, this);
        this.registerAction(commands.ON_CROP_END, this.onCropEnd, this);

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
     * onCropStart handler
     */
    onCropStart: function() {
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

        this.getCanvas()
            .add(this.cropzone)
            .on('mouse:down', this.handlers.mousedown)
            .defaultCursor = 'crosshair';
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
            settings, left, top;

        left = max(0, min(x, startX));
        top = max(0, min(y, startY));
        settings = {
            left: left,
            top: top,
            width: min(width, max(x, startX)) - left,
            height: min(height, max(y, startY)) - top
        };

        return settings;
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
     * onCropEnd handler
     * @param {string} btnType - Clicked button type
     */
    onCropEnd: function(btnType) {
        var canvas = this.getCanvas(),
            image = this.getCanvasImage(),
            cropzone = this.cropzone,
            cropInfo;

        cropzone.remove();
        this.cropzone = null;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.discardActiveObject()
            .off('mouse:down', this.handlers.mousedown);

        if (!cropzone.isValid()) {
            return;
        }

        if (btnType === 'apply') {
            cropInfo = {
                left: cropzone.getLeft(),
                top: cropzone.getTop(),
                width: cropzone.getWidth(),
                height: cropzone.getHeight()
            };

            this.postCommand({
                name: commands.LOAD_IMAGE_FROM_URL,
                args: [image.toDataURL(cropInfo), this.getImageName()]
            });
        }
    }
});

module.exports = Cropper;
