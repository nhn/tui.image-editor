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
            mouseup: $.proxy(this.onFabricMouseUp, this),
            onCropzoneMoving: $.proxy(this.onCropzoneMoving, this),
            onCropzoneScaling: $.proxy(this.onCropzoneScaling, this)
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
        this.cropzone.on({
            moving: this.handlers.onCropzoneMoving,
            scaling: this.handlers.onCropzoneScaling
        });

        this.getCanvas()
            .add(this.cropzone)
            .on('mouse:down', this.handlers.mousedown)
            .defaultCursor = 'crosshair';
    },

    /**
     * onCropzoneMoving event handler
     */
    onCropzoneMoving: function() {
        var canvas = this.getCanvas();
        var cropzone = this.cropzone;
        var left = cropzone.getLeft();
        var top = cropzone.getTop();
        var width = cropzone.getWidth();
        var height = cropzone.getHeight();
        var maxLeft = canvas.getWidth() - width;
        var maxTop = canvas.getHeight() - height;

        if (left < 0) {
            cropzone.setLeft(0);
        } else if (left > maxLeft) {
            cropzone.setLeft(maxLeft);
        }
        if (top < 0) {
            cropzone.setTop(0);
        } else if (top > maxTop) {
            cropzone.setTop(maxTop);
        }
        cropzone.setCoords();
    },

    /**
     * onCropzoneScaling event handler
     * @param {{e: MouseEvent}} fEvent - Fabric event
     */
    onCropzoneScaling: function(fEvent) {
        var cropzone = this.cropzone;
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var settings;

        settings = this.calcScaledSizeFromPointer(cropzone, pointer);
        cropzone.set(settings)
            .scale(1)
            .setCoords();
    },

    /**
     * Calc scaled size from mouse pointer with selected corner
     * @param {Cropzone} cropzone - cropzone(=== this.cropzone)
     * @param {{x: number, y: number}} pointer - Mouse position
     * @returns {object} Having left or(and) top or(and) width or(and) height.
     * @todo: tl일때 width, height 계산
     */
    calcScaledSizeFromPointer: function(cropzone, pointer) {
        var canvas = this.getCanvas();
        var maxX = canvas.getWidth();
        var maxY = canvas.getHeight();
        var left = cropzone.getLeft();
        var top = cropzone.getTop();
        var right = cropzone.getWidth() + left;
        var bottom = cropzone.getHeight() + top;

        var pointerX = pointer.x;
        var pointerY = pointer.y;
        
        var brWidth = max(1, (min(pointerX, maxX) - left));
        var brHeight = max(1, (min(pointerY, maxY) - top));

        // @todo
        // var tlWidth = max(1, (right - pointerX));
        // var tlHeight = max(1, (bottom - pointerY));

        var settings;
        switch (cropzone.getLastCorner()) {
            case 'tl':  // top-left
                settings = { // left, top 셋팅은 정상 아래가 맞음.
                    left: pointerX < 0 ? 0 : left,
                    top: pointerY < 0 ? 0 : top
                };
                break;
            case 'br':  // bottom-right
                settings = {
                    width: brWidth,
                    height: brHeight
                };
                break;
            case 'mb':  // medium-bottom
                settings = {
                    height: brHeight
                };
                break;
            case 'mr':
                settings = {
                    width: brWidth
                };
                break;
            default:
                settings = {};
                break;
        }

        return settings;
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
     * Get rect position setting from Canvas-Mouse-Position(x, y)
     * @param {number} x - Canvas-Mouse-Position x
     * @param {number} y - Canvas-Mouse-Position Y
     * @returns {{left: number, top: number, width: number, height: number}}
     */
    getSettingsFromPoint: function(x, y) {
        var image = this.getCanvasImage(),
            width = image.getWidth(),
            height = image.getHeight(),
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
            cropzone.set(this.getSettingsFromPoint(x, y));

            canvas.add(cropzone);
        }
    },

    /**
     * onMouseup handler in fabric canvas
     */
    onFabricMouseUp: function() {
        var cropzone = this.cropzone,
            handlers = this.handlers;

        console.log('?');
        this.getCanvas()
            .setActiveObject(cropzone)
            .off({
                'mouse:move': handlers.mousemove,
                'mouse:up': handlers.mouseup
            });
    },

    /**
     * onCropEnd handler
     */
    onCropEnd: function() {
        var canvas = this.getCanvas();

        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.discardActiveObject()
            .off('mouse:down', this.handlers.mousedown);
        this.cropzone.remove();
        this.cropzone = null;
    }
});

module.exports = Cropper;
