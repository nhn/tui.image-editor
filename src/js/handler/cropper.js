'use strict';
var Component = require('../interface/component'),
    Cropzone = require('../extension/cropzone'),
    commands = require('../consts').commands;

var MOUSE_MOVE_THRESHOLD = 10,
    CORNER_TYPE_TOP_LEFT = 'tl',
    CORNER_TYPE_TOP_RIGHT = 'tr',
    CORNER_TYPE_MIDDLE_TOP = 'mt',
    CORNER_TYPE_MIDDLE_LEFT = 'ml',
    CORNER_TYPE_MIDDLE_RIGHT = 'mr',
    CORNER_TYPE_MIDDLE_BOTTOM = 'mb',
    CORNER_TYPE_BOTTOM_LEFT = 'bl',
    CORNER_TYPE_BOTTOM_RIGHT = 'br';

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
        var canvas = this.getCanvas(),
            cropzone = this.cropzone,
            left = cropzone.getLeft(),
            top = cropzone.getTop(),
            width = cropzone.getWidth(),
            height = cropzone.getHeight(),
            maxLeft = canvas.getWidth() - width,
            maxTop = canvas.getHeight() - height;

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
        var cropzone = this.cropzone,
            canvas = this.getCanvas(),
            pointer = canvas.getPointer(fEvent.e),
            settings = this._calcScalingSizeFromPointer(cropzone, pointer);

        cropzone.scale(1).set(settings);
    },

    /**
     * Calc scaled size from mouse pointer with selected corner
     * @param {Cropzone} cropzone - cropzone(=== this.cropzone)
     * @param {{x: number, y: number}} pointer - Mouse position
     * @returns {object} Having left or(and) top or(and) width or(and) height.
     * @private
     */
    _calcScalingSizeFromPointer: function(cropzone, pointer) {
        var canvas = this.getCanvas(),
            maxX = canvas.getWidth(),
            maxY = canvas.getHeight(),
            top = cropzone.getTop(),
            left = cropzone.getLeft(),
            bottom = cropzone.getHeight() + top,
            right = cropzone.getWidth() + left,
            pointerX = pointer.x,
            pointerY = pointer.y,
            tlWidth = min(max(1, (right - pointerX)), right),
            tlHeight = min(max(1, (bottom - pointerY)), bottom),
            tl = {  // When scaling "Top-Left corner": It fixes right and bottom coordinates
                width: tlWidth,
                height: tlHeight,
                left: right - tlWidth,
                top: bottom - tlHeight
            },
            br = {  // When scaling "Bottom-Right corner": It fixes left and top coordinates
                width: max(1, (min(pointerX, maxX) - left)),
                height: max(1, (min(pointerY, maxY) - top))
            };

        return this._makeScalingSettings(tl, br);
    },

    /**
     * Make scaling settings
     * @param {{width: number, height: number, left: number, top: number}} tl - Top-Left setting
     * @param {{width: number, height: number}} br - Bottom-Right setting
     * @returns {{width: ?number, height: ?number, left: ?number, top: ?number}} Position setting
     * @private
     */
    /*eslint-disable complexity*/
    _makeScalingSettings: function(tl, br) {
        var tlWidth = tl.width,
            tlHeight = tl.height,
            brHeight = br.height,
            brWidth = br.width,
            tlLeft = tl.left,
            tlTop = tl.top,
            settings;

        switch (this.cropzone.getLastCorner()) {
            case CORNER_TYPE_TOP_LEFT:
                settings = tl;
                break;
            case CORNER_TYPE_TOP_RIGHT:
                settings = {
                    width: brWidth,
                    height: tlHeight,
                    top: tlTop
                };
                break;
            case CORNER_TYPE_BOTTOM_LEFT:
                settings = {
                    width: tlWidth,
                    height: brHeight,
                    left: tlLeft
                };
                break;
            case CORNER_TYPE_BOTTOM_RIGHT:
                settings = {
                    width: brWidth,
                    height: brHeight
                };
                break;
            case CORNER_TYPE_MIDDLE_LEFT:
                settings = {
                    width: tlWidth,
                    left: tlLeft
                };
                break;
            case CORNER_TYPE_MIDDLE_TOP:
                settings = {
                    height: tlHeight,
                    top: tlTop
                };
                break;
            case CORNER_TYPE_MIDDLE_RIGHT:
                settings = {
                    width: brWidth
                };
                break;
            case CORNER_TYPE_MIDDLE_BOTTOM:
                settings = {
                    height: brHeight
                };
                break;
            default:
                break;
        }

        return settings;
    },
    /*eslint-enable complexity*/

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
            cropzone.set(this._getSettingsFromPoint(x, y));

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
    _getSettingsFromPoint: function(x, y) {
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
