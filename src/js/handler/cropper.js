'use strict';
var Component = require('../interface/component'),
    Cropzone = require('../extension/cropzone'),
    commands = require('../consts').commands;

var MOUSE_MOVE_THRESHOLD = 10;

var isEmpty = tui.util.isEmpty,
    min = Math.min,
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
            fill: 'transparent',
            hasBorders: false,
            cornerColor: 'black',
            cornerSize: 10,
            lockRotation: true,
            hasRotatingPoint: false
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

    //@todo: BUG - 캔버스 외부에서만 마우스를 움직일때.
    getSettingsFromPoint: function(x, y) {
        var settings = {},
            canvas = this.getCanvas(),
            width = canvas.getWidth(),
            height = canvas.getHeight();

        if (x < 0) {
            settings.left = 0;
        }

        if (y < 0) {
            settings.top = 0;
        }

        if (x > width) {
            settings.width = width - this.cropzone.left;
        }

        if (y > height) {
            settings.height = height - this.cropzone.top;
        }

        if (isEmpty(settings)) {
            settings = {
                left: min(x, this.startX),
                top: min(y, this.startY),
                width: abs(x - this.startX),
                height: abs(y - this.startY)
            };
        }

        return settings;
    },

    /**
     * onMousemove handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     */
    onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas(),
            coord = canvas.getPointer(fEvent.e),
            x = coord.x,
            y = coord.y,
            cropzone = this.cropzone;

        if (abs(x - this.startX) + abs(y - this.startY) > MOUSE_MOVE_THRESHOLD) {
            cropzone
                .remove()
                .set(this.getSettingsFromPoint(x, y));

            canvas.add(this.cropzone);
        }
    },

    /**
     * onMouseup handler in fabric canvas
     */
    onFabricMouseUp: function() {
        var cropzone = this.cropzone,
            handlers = this.handlers;

        cropzone.setCoords();
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

        this.cropzone.remove();
        this.cropzone = null;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.off('mouse:down', this.handlers.mousedown);
    }
});

module.exports = Cropper;
