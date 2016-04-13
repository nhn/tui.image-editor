(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":10}],2:[function(require,module,exports){
'use strict';
var Component = require('../interface/component');
var Cropzone = require('../extension/cropzone');
var consts = require('../consts');
var util = require('../util');

var MOUSE_MOVE_THRESHOLD = 10;

var abs = Math.abs;
var clamp = util.clamp;

/**
 * Cropper components
 * @param {Component} parent - parent component
 * @extends {Component}
 * @class Cropper
 */
var Cropper = tui.util.defineClass(Component, /** @lends Cropper.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Cropzone
         * @type {Cropzone}
         * @private
         */
        this._cropzone = null;

        /**
         * StartX of Cropzone
         * @type {number}
         * @private
         */
        this._startX = null;

        /**
         * StartY of Cropzone
         * @type {number}
         * @private
         */
        this._startY = null;

        /**
         * listeners
         * @type {object.<string, function>} Handler hash for fabric canvas
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
    name: consts.componentNames.CROPPER,

    /**
     * Start cropping
     */
    start: function() {
        var canvas;

        if (this._cropzone) {
            return;
        }

        this._cropzone = new Cropzone({
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
        canvas.add(this._cropzone);
        canvas.on('mouse:down', this._listeners.mousedown);
        canvas.defaultCursor = 'crosshair';
    },

    /**
     * End cropping
     * @param {boolean} isApplying - Is applying or not
     * @returns {?{imageName: string, url: string}} cropped Image data
     */
    end: function(isApplying) {
        var canvas = this.getCanvas();
        var cropzone = this._cropzone;
        var data;

        if (!cropzone) {
            return null;
        }
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.discardActiveObject();
        canvas.off('mouse:down', this._listeners.mousedown);

        cropzone.remove();
        if (isApplying) {
            data = this._getCroppedImageData();
        }
        this._cropzone = null;

        return data;
    },


    /**
     * onMousedown handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseDown: function(fEvent) {
        var canvas = this.getCanvas();
        var coord;

        if (fEvent.target) {
            return;
        }

        canvas.selection = false;
        coord = canvas.getPointer(fEvent.e);

        this._startX = coord.x;
        this._startY = coord.y;

        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    },

    /**
     * onMousemove handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var x = pointer.x;
        var y = pointer.y;
        var cropzone = this._cropzone;

        if (abs(x - this._startX) + abs(y - this._startY) > MOUSE_MOVE_THRESHOLD) {
            cropzone.remove();
            cropzone.set(this._calcRectDimensionFromPoint(x, y));

            canvas.add(cropzone);
        }
    },

    /**
     * Get rect dimension setting from Canvas-Mouse-Position(x, y)
     * @param {number} x - Canvas-Mouse-Position x
     * @param {number} y - Canvas-Mouse-Position Y
     * @returns {{left: number, top: number, width: number, height: number}}
     * @private
     */
    _calcRectDimensionFromPoint: function(x, y) {
        var canvas = this.getCanvas();
        var width = canvas.getWidth();
        var height = canvas.getHeight();
        var startX = this._startX;
        var startY = this._startY;
        var left = clamp(x, 0, startX);
        var top = clamp(y, 0, startY);

        return {
            left: left,
            top: top,
            width: clamp(x, startX, width) - left, // (startX <= x(mouse) <= canvasWidth) - left,
            height: clamp(y, startY, height) - top // (startY <= y(mouse) <= canvasHeight) - top
        };
    },

    /**
     * onMouseup handler in fabric canvas
     * @private
     */
    _onFabricMouseUp: function() {
        var cropzone = this._cropzone;
        var listeners = this._listeners;
        var canvas = this.getCanvas();

        canvas.setActiveObject(cropzone);
        canvas.off({
            'mouse:move': listeners.mousemove,
            'mouse:up': listeners.mouseup
        });
    },

    /**
     * Get cropped image data
     * @returns {?{imageName: string, url: string}} cropped Image data
     * @private
     */
    _getCroppedImageData: function() {
        var cropzone = this._cropzone;
        var cropInfo;

        if (!cropzone.isValid()) {
            return null;
        }

        cropInfo = {
            left: cropzone.getLeft(),
            top: cropzone.getTop(),
            width: cropzone.getWidth(),
            height: cropzone.getHeight()
        };

        return {
            imageName: this.getImageName(),
            url: this.getCanvas().toDataURL(cropInfo)
        };
    }
});

module.exports = Cropper;

},{"../consts":6,"../extension/cropzone":7,"../interface/component":13,"../util":15}],3:[function(require,module,exports){
/**
 * flip.js created on 2016. 4. 12.
 *
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image flip module
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * Flip
 * @class Flip
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Flip = tui.util.defineClass(Component, /** @lends Flip.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.FLIP,

    /**
     * Get current flip settings
     * @returns {{flipX: Boolean, flipY: Boolean}}
     */
    getCurrentSetting: function() {
        var canvasImage = this.getCanvasImage();

        return {
            flipX: canvasImage.flipX,
            flipY: canvasImage.flipY
        };
    },

    /**
     * Set flipX, flipY
     * @param {{flipX: ?Boolean, flipY: ?Boolean}} flipSetting - Flip setting
     * @returns {jQuery.Deferred}
     */
    set: function(flipSetting) {
        var current = this.getCurrentSetting();
        var $defer = $.Deferred();

        flipSetting.flipX = !!(flipSetting.flipX);
        flipSetting.flipY = !!(flipSetting.flipY);
        if (flipSetting.flipX === current.flipX && flipSetting.flipY === current.flipY) {
            $defer.reject();
        } else {
            tui.util.extend(current, flipSetting);
            this.setImageProperties(flipSetting, true);
            $defer.resolve(flipSetting);
        }

        return $defer;
    },

    /**
     * Reset flip settings
     * @returns {jQuery.Deferred}
     */
    reset: function() {
        return this.set({
            flipX: false,
            flipY: false
        });
    },

    /**
     * Flip x
     * @returns {jQuery.Deferred}
     */
    flipX: function() {
        this.toggleImageProperties(['flipX'], true);

        return $.Deferred().resolve(this.getCurrentSetting());
    },

    /**
     * Flip y
     * @returns {jQuery.Deferred}
     */
    flipY: function() {
        this.toggleImageProperties(['flipY'], true);

        return $.Deferred().resolve(this.getCurrentSetting());
    }
});

module.exports = Flip;

},{"../consts":6,"../interface/Component":11}],4:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var crossOrigin = {crossOrigin: ''};
var cssOnly = {cssOnly: true};
var backstoreOnly = {backstoreOnly: true};

/**
 * ImageLoader components
 * @extends {Component}
 * @class ImageLoader
 * @param {Component} parent - parent component
 */
var ImageLoader = tui.util.defineClass(Component, /** @lends ImageLoader.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.IMAGE_LOADER,

    /**
     * Load image from url
     * @param {?string} imageName - File name
     * @param {?(fabric.Image|string)} img - fabric.Image instance or URL of an image
     * @returns {jQuery.Deferred} deferred
     */
    load: function(imageName, img) {
        var self = this;
        var $defer, canvas;

        if (!imageName && !img) { // Back to the initial state, not error.
            canvas = this.getCanvas();
            canvas.backgroundImage = null;
            canvas.renderAll();

            $defer = $.Deferred(function() {
                self.setCanvasImage('', null);
            }).resolve();
        } else {
            $defer = this._setBackgroundImage(img).done(function(oImage) {
                self._onSuccessImageLoad(oImage);
                self.setCanvasImage(imageName, oImage);
            });
        }

        return $defer;
    },

    /**
     * Set background image
     * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
     * @returns {$.Deferred} deferred
     * @private
     */
    _setBackgroundImage: function(img) {
        var $defer = $.Deferred();
        var canvas;

        if (!img) {
            return $defer.reject();
        }
        canvas = this.getCanvas();
        canvas.setBackgroundImage(img, function() {
            var oImage = canvas.backgroundImage;

            if (oImage.getElement()) {
                $defer.resolve(oImage);
            } else {
                $defer.reject();
            }
        }, crossOrigin);

        return $defer;
    },

    /**
     * onSuccess callback
     * @param {fabric.Image} oImage - Fabric image instance
     * @private
     */
    _onSuccessImageLoad: function(oImage) {
        var canvas = this.getCanvas();
        var maxWidth = Math.min(
            Math.floor(1000), //@todo ImageEditor option: Max-Width of canvas
            oImage.width
        );

        canvas.setDimensions({
            margin: 'auto',
            width: '100%',
            height: '',  // No inline-css "height" for IE9
            'max-width': maxWidth + 'px'
        }, cssOnly);

        canvas.setDimensions({
            width: oImage.width,
            height: oImage.height
        }, backstoreOnly);
    }
});

module.exports = ImageLoader;

},{"../consts":6,"../interface/component":13}],5:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

/**
 * Main component
 * @extends {Component}
 * @class
 */
var Main = tui.util.defineClass(Component, /** @lends Main.prototype */{
    init: function() {
        /**
         * Fabric canvas instance
         * @type {fabric.Canvas}
         */
        this.canvas = null;

        /**
         * Fabric image instance
         * @type {fabric.Image}
         */
        this.oImage = null;

        /**
         * Image name
         * @type {string}
         */
        this.imageName = '';
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.MAIN,

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this.canvas && this.canvas.toDataURL(type);
    },

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     * @override
     */
    setCanvasImage: function(name, oImage) {
        this.imageName = name;
        this.oImage = oImage;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     * @override
     */
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas($(canvasElement)[0], {
            containerClass: 'tui-component-imageEditor-canvasContainer'
        });
    },

    /**
     * Set image properties
     * @param {object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     * @override
     */
    setImageProperties: function(setting, withRendering) {
        var oImage = this.oImage;

        if (!oImage) {
            return;
        }

        oImage.set(setting);
        if (withRendering) {
            this.canvas.renderAll();
        }
    },

    /**
     * Toggle properties of the image
     * @param {Array.<string>} properties - Image property names
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     * @override
     */
    toggleImageProperties: function(properties, withRendering) {
        var oImage = this.oImage;

        if (!oImage) {
            return;
        }

        oImage.toggle.apply(oImage, properties);
        if (withRendering) {
            this.canvas.renderAll();
        }
    },

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     * @override
     */
    getCanvasElement: function() {
        return this.canvas.getElement();
    },

    /**
     * Get fabric.Canvas instance
     * @override
     * @returns {fabric.Canvas}
     */
    getCanvas: function() {
        return this.canvas;
    },

    /**
     * Get canvasImage (fabric.Image instance)
     * @override
     * @returns {fabric.Image}
     */
    getCanvasImage: function() {
        return this.oImage;
    },

    /**
     * Get image name
     * @override
     * @returns {string}
     */
    getImageName: function() {
        return this.imageName;
    }
});

module.exports = Main;

},{"../consts":6,"../interface/component":13}],6:[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = {
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER',
        'FLIP'
    ),

    commandNames: util.keyMirror(
        'LOAD_IMAGE',
        'FLIP_IMAGE'
    ),

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        FLIP_IMAGE: 'flipImage',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};

},{"./util":15}],7:[function(require,module,exports){
'use strict';

var clamp = require('../util').clamp;

var CORNER_TYPE_TOP_LEFT = 'tl';
var CORNER_TYPE_TOP_RIGHT = 'tr';
var CORNER_TYPE_MIDDLE_TOP = 'mt';
var CORNER_TYPE_MIDDLE_LEFT = 'ml';
var CORNER_TYPE_MIDDLE_RIGHT = 'mr';
var CORNER_TYPE_MIDDLE_BOTTOM = 'mb';
var CORNER_TYPE_BOTTOM_LEFT = 'bl';
var CORNER_TYPE_BOTTOM_RIGHT = 'br';

/**
 * Cropzone object
 * Issue: IE7, 8(with excanvas)
 *  - Cropzone is a black zone without transparency.
 * @class Cropzone
 * @extends {fabric.Rect}
 */
var Cropzone = fabric.util.createClass(fabric.Rect, /** @lends Cropzone.prototype */{
    /**
     * Constructor
     * @param {Object} [options] Options object
     * @override
     */
    initialize: function(options) {
        this.callSuper('initialize', options);
        this.on({
            'moving': this._onMoving,
            'scaling': this._onScaling
        });
    },

    /**
     * Render Crop-zone
     * @param {CanvasRenderingContext2D} ctx - Context
     * @private
     * @override
     */
    _render: function(ctx) {
        var originalFlipX, originalFlipY,
            originalScaleX, originalScaleY,
            cropzoneDashLineWidth = 7,
            cropzoneDashLineOffset = 7;
        this.callSuper('_render', ctx);

        // Calc original scale
        originalFlipX = this.flipX ? -1 : 1;
        originalFlipY = this.flipY ? -1 : 1;
        originalScaleX = originalFlipX / this.scaleX;
        originalScaleY = originalFlipY / this.scaleY;

        // Set original scale
        ctx.scale(originalScaleX, originalScaleY);

        // Render outer rect
        this._fillOuterRect(ctx, 'rgba(0, 0, 0, 0.55)');

        // Black dash line
        this._strokeBorder(ctx, 'rgb(0, 0, 0)', cropzoneDashLineWidth);

        // White dash line
        this._strokeBorder(ctx, 'rgb(255, 255, 255)', cropzoneDashLineWidth, cropzoneDashLineOffset);

        // Reset scale
        ctx.scale(1 / originalScaleX, 1 / originalScaleY);
    },

    /**
     * Cropzone-coordinates with outer rectangle
     *
     *     x0     x1         x2      x3
     *  y0 +--------------------------+
     *     |///////|//////////|///////|    // <--- "Outer-rectangle"
     *     |///////|//////////|///////|
     *  y1 +-------+----------+-------+
     *     |///////| Cropzone |///////|    Cropzone is the "Inner-rectangle"
     *     |///////|  (0, 0)  |///////|    Center point (0, 0)
     *  y2 +-------+----------+-------+
     *     |///////|//////////|///////|
     *     |///////|//////////|///////|
     *  y3 +--------------------------+
     *
     * @typedef {{x: Array<number>, y: Array<number>}} cropzoneCoordinates
     */

    /**
     * Fill outer rectangle
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {string|CanvasGradient|CanvasPattern} fillStyle - Fill-style
     * @private
     */
    _fillOuterRect: function(ctx, fillStyle) {
        var coordinates = this._getCoordinates(ctx),
            x = coordinates.x,
            y = coordinates.y;

        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.beginPath();

        // Outer rectangle
        // Numbers are +/-1 so that overlay edges don't get blurry.
        ctx.moveTo(x[0] - 1, y[0] - 1);
        ctx.lineTo(x[3] + 1, y[0] - 1);
        ctx.lineTo(x[3] + 1, y[3] + 1);
        ctx.lineTo(x[0] - 1, y[3] - 1);
        ctx.lineTo(x[0] - 1, y[0] - 1);
        ctx.closePath();

        // Inner rectangle
        ctx.moveTo(x[1], y[1]);
        ctx.lineTo(x[1], y[2]);
        ctx.lineTo(x[2], y[2]);
        ctx.lineTo(x[2], y[1]);
        ctx.lineTo(x[1], y[1]);
        ctx.closePath();

        ctx.fill();
        ctx.restore();
    },

    /**
     * Get coordinates
     * @param {CanvasRenderingContext2D} ctx - Context
     * @returns {cropzoneCoordinates} - {@link cropzoneCoordinates}
     * @private
     */
    _getCoordinates: function(ctx) {
        var ceil = Math.ceil,
            width = this.getWidth(),
            height = this.getHeight(),
            halfWidth = width / 2,
            halfHeight = height / 2,
            left = this.getLeft(),
            top = this.getTop(),
            canvasEl = ctx.canvas; // canvas element, not fabric object

        return {
            x: tui.util.map([
                -(halfWidth + left),                        // x0
                -(halfWidth),                               // x1
                halfWidth,                                  // x2
                halfWidth + (canvasEl.width - left - width) // x3
            ], ceil),
            y: tui.util.map([
                -(halfHeight + top),                            // y0
                -(halfHeight),                                  // y1
                halfHeight,                                     // y2
                halfHeight + (canvasEl.height - top - height)   // y3
            ], ceil)
        };
    },

    /**
     * Stroke border
     * @param {CanvasRenderingContext2D} ctx - Context
     * @param {string|CanvasGradient|CanvasPattern} strokeStyle - Stroke-style
     * @param {number} lineDashWidth - Dash width
     * @param {number} [lineDashOffset] - Dash offset
     * @private
     */
    _strokeBorder: function(ctx, strokeStyle, lineDashWidth, lineDashOffset) {
        var halfWidth = this.getWidth() / 2,
            halfHeight = this.getHeight() / 2;

        ctx.save();
        ctx.strokeStyle = strokeStyle;
        if (ctx.setLineDash) {
            ctx.setLineDash([lineDashWidth, lineDashWidth]);
        }
        if (lineDashOffset) {
            ctx.lineDashOffset = lineDashOffset;
        }

        ctx.beginPath();
        ctx.moveTo(-halfWidth, -halfHeight);
        ctx.lineTo(halfWidth, -halfHeight);
        ctx.lineTo(halfWidth, halfHeight);
        ctx.lineTo(-halfWidth, halfHeight);
        ctx.lineTo(-halfWidth, -halfHeight);
        ctx.stroke();

        ctx.restore();
    },

    /**
     * onMoving event listener
     * @private
     */
    _onMoving: function() {
        var canvas = this.canvas,
            left = this.getLeft(),
            top = this.getTop(),
            width = this.getWidth(),
            height = this.getHeight(),
            maxLeft = canvas.getWidth() - width,
            maxTop = canvas.getHeight() - height;

        this.setLeft(clamp(left, 0, maxLeft));
        this.setTop(clamp(top, 0, maxTop));
    },

    /**
     * onScaling event listener
     * @param {{e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onScaling: function(fEvent) {
        var pointer = this.canvas.getPointer(fEvent.e),
            settings = this._calcScalingSizeFromPointer(pointer);

        // On scaling cropzone,
        // change real width and height and fix scaleFactor to 1
        this.scale(1).set(settings);
    },

    /**
     * Calc scaled size from mouse pointer with selected corner
     * @param {{x: number, y: number}} pointer - Mouse position
     * @returns {object} Having left or(and) top or(and) width or(and) height.
     * @private
     */
    _calcScalingSizeFromPointer: function(pointer) {
        var pointerX = pointer.x,
            pointerY = pointer.y,
            tlScalingSize = this._calcTopLeftScalingSizeFromPointer(pointerX, pointerY),
            brScalingSize = this._calcBottomRightScalingSizeFromPointer(pointerX, pointerY);

        /*
         * @todo: 일반 객체에서 shift 조합키를 누르면 free size scaling이 됨 --> 확인해볼것
         *      canvas.class.js // _scaleObject: function(...){...}
         */
        return this._makeScalingSettings(tlScalingSize, brScalingSize);
    },

    /**
     * Calc scaling size(position + dimension) from left-top corner
     * @param {number} x - Mouse position X
     * @param {number} y - Mouse position Y
     * @returns {{top: number, left: number, width: number, height: number}}
     * @private
     */
    _calcTopLeftScalingSizeFromPointer: function(x, y) {
        var bottom = this.getHeight() + this.top,
            right = this.getWidth() + this.left,
            top = clamp(y, 0, bottom - 1),  // 0 <= top <= (bottom - 1)
            left = clamp(x, 0, right - 1);  // 0 <= left <= (right - 1)

        // When scaling "Top-Left corner": It fixes right and bottom coordinates
        return {
            top: top,
            left: left,
            width: right - left,
            height: bottom - top
        };
    },

    /**
     * Calc scaling size from right-bottom corner
     * @param {number} x - Mouse position X
     * @param {number} y - Mouse position Y
     * @returns {{width: number, height: number}}
     * @private
     */
    _calcBottomRightScalingSizeFromPointer: function(x, y) {
        var canvas = this.canvas,
            maxX = canvas.width,
            maxY = canvas.height,
            left = this.left,
            top = this.top;

        // When scaling "Bottom-Right corner": It fixes left and top coordinates
        return {
            width: clamp(x, (left + 1), maxX) - left,    // (width = x - left), (left + 1 <= x <= maxX)
            height: clamp(y, (top + 1), maxY) - top      // (height = y - top), (top + 1 <= y <= maxY)
        };
    },

    /*eslint-disable complexity*/
    /**
     * Make scaling settings
     * @param {{width: number, height: number, left: number, top: number}} tl - Top-Left setting
     * @param {{width: number, height: number}} br - Bottom-Right setting
     * @returns {{width: ?number, height: ?number, left: ?number, top: ?number}} Position setting
     * @private
     */
    _makeScalingSettings: function(tl, br) {
        var tlWidth = tl.width,
            tlHeight = tl.height,
            brHeight = br.height,
            brWidth = br.width,
            tlLeft = tl.left,
            tlTop = tl.top,
            settings;

        switch (this.__corner) {
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
                settings = br;
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
    }, /*eslint-enable complexity*/

    /**
     * Return the whether this cropzone is valid
     * @returns {boolean}
     */
    isValid: function() {
        return (
            this.left >= 0 &&
            this.top >= 0 &&
            this.width > 0 &&
            this.height > 0
        );
    }
});

module.exports = Cropzone;

},{"../util":15}],8:[function(require,module,exports){
'use strict';

var Command = require('../interface/command');
var consts = require('../consts');

var componentNames = consts.componentNames;
var commandNames = consts.commandNames;
var IMAGE_LOADER = componentNames.IMAGE_LOADER;
var FLIP = componentNames.FLIP;
var creators = {};

/**
 * Set mapping creators
 */
creators[commandNames.LOAD_IMAGE] = createLoadImageCommand;
creators[commandNames.FLIP_IMAGE] = createFlipImageCommand;

/**
 * @param {string} imageName - Image name
 * @param {string} url - Image url
 * @returns {Command}
 */
function createLoadImageCommand(imageName, url) {
    return new Command({
        execute: function(compMap) {
            var loader = compMap[IMAGE_LOADER];

            this.store = {
                prevName: loader.getImageName(),
                prevImage: loader.getCanvasImage()
            };

            return loader.load(imageName, url);
        },
        undo: function(compMap) {
            var loader = compMap[IMAGE_LOADER];
            var store = this.store;

            return loader.load(store.prevName, store.prevImage);
        }
    });
}

/**
 * @param {string} type - 'flipX' or 'flipY' or 'reset'
 * @returns {$.Deferred}
 */
function createFlipImageCommand(type) {
    return new Command({
        execute: function(compMap) {
            var flipComp = compMap[FLIP];

            this.store = flipComp.getCurrentSetting();

            return flipComp[type]();
        },
        undo: function(compMap) {
            var flipComp = compMap[FLIP];

            return flipComp.set(this.store);
        }
    });
}

/**
 * Create command
 * @param {string} name - Command name
 * @param {...*} args - Arguments for creating command
 * @returns {Command}
 */
function create(name, args) {
    args = Array.prototype.slice.call(arguments, 1);

    return creators[name].apply(null, args);
}


module.exports = {
    create: create
};

},{"../consts":6,"../interface/command":12}],9:[function(require,module,exports){
'use strict';

var keyMirror = require('../util').keyMirror;

var types = keyMirror(
    'UN_IMPLEMENTATION',
    'NO_COMPONENT_NAME',
    'UNKNOWN'
);

var messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_COMPONENT_NAME: 'Should set a component name',
    UNKNOWN: 'Unknown: '
};


var map = {
    UN_IMPLEMENTATION: function(methodName) {
        return messages.UN_IMPLEMENTATION + methodName;
    },

    NO_COMPONENT_NAME: function() {
        return messages.NO_COMPONENT_NAME;
    },

    UNKNOWN: function(msg) {
        return messages.UNKNOWN + msg;
    }
};

module.exports = {
    types: tui.util.extend({}, types),

    create: function(type) {
        var func;

        type = type.toLowerCase();
        func = map[type] || map.unknown;
        Array.prototype.shift.apply(arguments);

        return func.apply(null, arguments);
    }
};

},{"../util":15}],10:[function(require,module,exports){
'use strict';

var Invoker = require('./invoker');
var commandFactory = require('./factory/command');
var consts = require('./consts');

var events = consts.eventNames;
var commands = consts.commandNames;
var compList = consts.componentNames;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
 */
var ImageEditor = tui.util.defineClass(/** @lends ImageEditor.prototype */{
    init: function(canvasElement) {
        /**
         * Inovker
         * @private
         * @type {Invoker}
         */
        this._invoker = new Invoker();

        this._setCanvasElement($(canvasElement)[0]);
    },

    /**
     * Return event names
     * @returns {Object}
     */
    getEventNames: function() {
        return tui.util.extend({}, events);
    },

    /**
     * Set canvas element
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     * @private
     */
    _setCanvasElement: function(canvasElement) {
        this._getMainComponent().setCanvasElement(canvasElement);
    },

    /**
     * Returns main component
     * @returns {Component} Main component
     * @private
     */
    _getMainComponent: function() {
        return this._getComponent(compList.MAIN);
    },

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     * @private
     */
    _getComponent: function(name) {
        return this._invoker.getComponent(name);
    },

    /**
     * Clear all actions
     */
    clear: function() {
        this.endCropping();
    },

    /**
     * Invoke command
     * @param {Command} command - Command
     */
    execute: function(command) {
        var self = this;

        this.clear();
        this._invoker.invoke(command).done(function() {
            self.fire(events.PUSH_UNDO_STACK);
            self.fire(events.EMPTY_REDO_STACK);
        });
    },

    /**
     * Undo
     */
    undo: function() {
        var invoker = this._invoker;
        var self = this;

        this.clear();
        invoker.undo().done(function() {
            if (invoker.isEmptyUndoStack()) {
                self.fire(events.EMPTY_UNDO_STACK);
            }
            self.fire(events.PUSH_REDO_STACK);
        });
    },

    /**
     * Redo
     */
    redo: function() {
        var invoker = this._invoker;
        var self = this;

        this.clear();
        invoker.redo().done(function() {
            if (invoker.isEmptyRedoStack()) {
                self.fire(events.EMPTY_REDO_STACK);
            }
            self.fire(events.PUSH_UNDO_STACK);
        });
    },

    /**
     * Load image from file
     * @param {File} imgFile - Image file
     */
    loadImageFromFile: function(imgFile) {
        if (!imgFile) {
            return;
        }

        this.loadImageFromURL(
            imgFile.name,
            URL.createObjectURL(imgFile)
        );
    },

    /**
     * Load image from url
     * @param {string} imageName - imageName
     * @param {string} url - File url
     */
    loadImageFromURL: function(imageName, url) {
        var self = this;
        var callback, command;

        if (!imageName || !url) {
            return;
        }

        callback = $.proxy(this._callbackAfterImageLoading, this);
        command = commandFactory.create(commands.LOAD_IMAGE, imageName, url)
            .setExecuteCallback(callback)
            .setUndoCallback(function(oImage) {
                if (oImage) {
                    callback(oImage);
                }
                self.fire(events.CLEAR_IMAGE);
            });

        this.execute(command);
    },

    /**
     * Callback after image loading
     * @param {?fabric.Image} oImage - Image instance
     */
    _callbackAfterImageLoading: function(oImage) {
        var mainComponent = this._getMainComponent();
        var $canvasElement = $(mainComponent.getCanvasElement());

        this.fire(events.LOAD_IMAGE, {
            originalWidth: oImage.width,
            originalHeight: oImage.height,
            currentWidth: $canvasElement.width(),
            currentHeight: $canvasElement.height()
        });
    },

    /**
     * Start cropping
     */
    startCropping: function() {
        var cropper = this._getComponent(compList.CROPPER);

        cropper.start();
        this.fire(events.START_CROPPING);
    },

    /**
     * Apply cropping
     * @param {boolean} [isApplying] - Whether the cropping is applied or canceled
     */
    endCropping: function(isApplying) {
        var cropper = this._getComponent(compList.CROPPER);
        var data = cropper.end(isApplying);

        this.fire(events.END_CROPPING);
        if (data) {
            this.loadImageFromURL(data.imageName, data.url);
        }
    },

    /**
     * Flip
     * @param {string} type - 'flipX' or 'flipY' or 'reset'
     * @private
     */
    _flip: function(type) {
        var callback = $.proxy(this.fire, this, events.FLIP_IMAGE);
        var command = commandFactory.create(commands.FLIP_IMAGE, type)
            .setExecuteCallback(callback)
            .setUndoCallback(callback);

        this.execute(command);
    },

    /**
     * Flip x
     */
    flipX: function() {
        this._flip('flipX');
    },

    /**
     * Flip y
     */
    flipY: function() {
        this._flip('flipY');
    },

    /**
     * Reset flip
     */
    resetFlip: function() {
        this._flip('reset');
    },

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this._getMainComponent().toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this._getMainComponent().getImageName();
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this._invoker.clearUndoStack();
        this.fire(events.EMPTY_UNDO_STACK);
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this._invoker.clearRedoStack();
        this.fire(events.EMPTY_REDO_STACK);
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;

},{"./consts":6,"./factory/command":8,"./invoker":14}],11:[function(require,module,exports){
'use strict';

/**
 * Component interface
 * @class
 */
var Component = tui.util.defineClass(/** @lends Component.prototype */{
    init: function() {},

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {fabric.Image} oImage - Fabric image instance
     */
    setCanvasImage: function(name, oImage) {
        this.getRoot().setCanvasImage(name, oImage);
    },

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     */
    getCanvasElement: function() {
        return this.getRoot().getCanvasElement();
    },

    /**
     * Get fabric.Canvas instance
     * @returns {fabric.Canvas}
     */
    getCanvas: function() {
        return this.getRoot().getCanvas();
    },

    /**
     * Get canvasImage (fabric.Image instance)
     * @returns {fabric.Image}
     */
    getCanvasImage: function() {
        return this.getRoot().getCanvasImage();
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this.getRoot().getImageName();
    },

    /**
     * Get image editor
     * @returns {ImageEditor}
     */
    getEditor: function() {
        return this.getRoot().getEditor();
    },

    /**
     * Return component name
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * Set image properties
     * @param {object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     */
    setImageProperties: function(setting, withRendering) {
        this.getRoot().setImageProperties(setting, withRendering);
    },

    /**
     * Toggle properties of the image
     * @param {Array.<string>} properties - Image property names
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     */
    toggleImageProperties: function(properties, withRendering) {
        this.getRoot().toggleImageProperties(properties, withRendering);
    },

    /**
     * Set parent
     * @param {Component|null} parent - Parent
     */
    setParent: function(parent) {
        this._parent = parent || null;
    },

    /**
     * Return parent.
     * If the view is root, return null
     * @returns {Component|null}
     */
    getParent: function() {
        return this._parent;
    },

    /**
     * Return root
     * @returns {Component}
     */
    getRoot: function() {
        var next = this.getParent(),
        /* eslint-disable consistent-this */
            current = this;
        /* eslint-enable consistent-this */

        while (next) {
            current = next;
            next = current.getParent();
        }

        return current;
    }
});

module.exports = Component;

},{}],12:[function(require,module,exports){
'use strict';

var errorMessage = require('../factory/errorMessage');

var createMessage = errorMessage.create,
    errorTypes = errorMessage.types;

/**
 * Command class
 * @class
 * @param {{execute: function, undo: function}} actions - Command actions
 */
var Command = tui.util.defineClass(/** @lends Command.prototype */{
    init: function(actions) {
        /**
         * Execute function
         * @type {function}
         */
        this.execute = actions.execute;

        /**
         * Undo function
         * @type {function}
         */
        this.undo = actions.undo;

        /**
         * executeCallback
         * @type {null}
         */
        this.executeCallback = null;

        /**
         * undoCallback
         * @type {null}
         */
        this.undoCallback = null;
    },

    /**
     * Execute action
     * @abstract
     */
    execute: function() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
    },

    /**
     * Undo action
     * @abstract
     */
    undo: function() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'undo'));
    },

    /**
     * Attach execute callabck
     * @param {function} callback - Callback after execution
     * @returns {Command} this
     */
    setExecuteCallback: function(callback) {
        this.executeCallback = callback;

        return this;
    },

    /**
     * Attach undo callback
     * @param {function} callback - Callback after undo
     * @returns {Command} this
     */
    setUndoCallback: function(callback) {
        this.undoCallback = callback;

        return this;
    }
});

module.exports = Command;

},{"../factory/errorMessage":9}],13:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],14:[function(require,module,exports){
'use strict';

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');
var MainComponent = require('./component/main');
var Flip = require('./component/flip');

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/** @lends Invoker.prototype */{
    init: function() {
        /**
         * Undo stack
         * @type {Array.<Command>}
         */
        this.undoStack = [];

        /**
         * Redo stack
         * @type {Array.<Command>}
         */
        this.redoStack = [];

        /**
         * Component map
         * @type {Object.<string, Component>}
         */
        this.componentMap = {};

        this._createComponents();
    },

    /**
     * Create components
     * @private
     */
    _createComponents: function() {
        var main = new MainComponent();

        this._register(main);
        this._register(new ImageLoader(main));
        this._register(new Cropper(main));
        this._register(new Flip(main));
    },

    /**
     * Register component
     * @param {Component} component - Component handling the canvas
     * @private
     */
    _register: function(component) {
        this.componentMap[component.getName()] = component;
    },

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    getComponent: function(name) {
        return this.componentMap[name];
    },

    /**
     * Invoke command
     * Store the command to the undoStack
     * Clear the redoStack
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     */
    invoke: function(command) {
        var self = this;

        return $.when(command.execute(this.componentMap))
            .done(command.executeCallback)
            .done(function() {
                self.undoStack.push(command);
                self.clearRedoStack();
            });
    },

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo: function() {
        var command = this.undoStack.pop();
        var self = this;
        var $defer;

        if (command) {
            $defer = $.when(command.undo(this.componentMap))
                .done(command.undoCallback)
                .done(function() {
                    self.redoStack.push(command);
                });
        } else {
            $defer = $.Deferred().reject();
        }

        return $defer;
    },

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo: function() {
        var command = this.redoStack.pop();
        var self = this;
        var $defer;

        if (command) {
            $defer = $.when(command.execute(this.componentMap))
                .done(command.executeCallback)
                .done(function() {
                    self.undoStack.push(command);
                });
        } else {
            $defer = $.Deferred().reject();
        }

        return $defer;
    },

    /**
     * Return whether the redoStack is empty
     * @returns {boolean}
     */
    isEmptyRedoStack: function() {
        return this.redoStack.length === 0;
    },

    /**
     * Return whether the undoStack is empty
     * @returns {boolean}
     */
    isEmptyUndoStack: function() {
        return this.undoStack.length === 0;
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this.undoStack = [];
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this.redoStack = [];
    }
});

module.exports = Invoker;

},{"./component/cropper":2,"./component/flip":3,"./component/imageLoader":4,"./component/main":5}],15:[function(require,module,exports){
'use strict';

var min = Math.min,
    max = Math.max;

module.exports = {
    /**
     * Clamp value
     * @param {number} value - Value
     * @param {number} minValue - Minimum value
     * @param {number} maxValue - Maximum value
     * @returns {number} clamped value
     */
    clamp: function(value, minValue, maxValue) {
        var temp;
        if (minValue > maxValue) {
            temp = minValue;
            minValue = maxValue;
            maxValue = temp;
        }

        return max(minValue, min(value, maxValue));
    },

    /**
     * Make key-value object from arguments
     * @returns {object.<string, string>}
     */
    keyMirror: function() {
        var obj = {};

        tui.util.forEach(arguments, function(key) {
            obj[key] = key;
        });

        return obj;
    }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29uc3RzLmpzIiwic3JjL2pzL2V4dGVuc2lvbi9jcm9wem9uZS5qcyIsInNyYy9qcy9mYWN0b3J5L2NvbW1hbmQuanMiLCJzcmMvanMvZmFjdG9yeS9lcnJvck1lc3NhZ2UuanMiLCJzcmMvanMvaW1hZ2VFZGl0b3IuanMiLCJzcmMvanMvaW50ZXJmYWNlL0NvbXBvbmVudC5qcyIsInNyYy9qcy9pbnRlcmZhY2UvY29tbWFuZC5qcyIsInNyYy9qcy9pbnZva2VyLmpzIiwic3JjL2pzL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5JbWFnZUVkaXRvcicsIHJlcXVpcmUoJy4vc3JjL2pzL2ltYWdlRWRpdG9yJyksIHRydWUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBDcm9wem9uZSA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbi9jcm9wem9uZScpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBNT1VTRV9NT1ZFX1RIUkVTSE9MRCA9IDEwO1xuXG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgY2xhbXAgPSB1dGlsLmNsYW1wO1xuXG4vKipcbiAqIENyb3BwZXIgY29tcG9uZW50c1xuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgQ3JvcHBlclxuICovXG52YXIgQ3JvcHBlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBDcm9wcGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge0Nyb3B6b25lfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFggb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WSBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRZID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogbGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBIYW5kbGVyIGhhc2ggZm9yIGZhYnJpYyBjYW52YXNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZW1vdmU6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZU1vdmUsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2V1cDogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlVXAsIHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuQ1JPUFBFUixcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICh0aGlzLl9jcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBuZXcgQ3JvcHpvbmUoe1xuICAgICAgICAgICAgbGVmdDogLTEwLFxuICAgICAgICAgICAgdG9wOiAtMTAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcblxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vkb3duIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VEb3duOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjb29yZDtcblxuICAgICAgICBpZiAoZkV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBjb29yZCA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcblxuICAgICAgICB0aGlzLl9zdGFydFggPSBjb29yZC54O1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBjb29yZC55O1xuXG4gICAgICAgIGNhbnZhcy5vbih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiB0aGlzLl9saXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZW1vdmUgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZU1vdmU6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG4gICAgICAgIHZhciB4ID0gcG9pbnRlci54O1xuICAgICAgICB2YXIgeSA9IHBvaW50ZXIueTtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG5cbiAgICAgICAgaWYgKGFicyh4IC0gdGhpcy5fc3RhcnRYKSArIGFicyh5IC0gdGhpcy5fc3RhcnRZKSA+IE1PVVNFX01PVkVfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNyb3B6b25lLnNldCh0aGlzLl9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludCh4LCB5KSk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQoY3JvcHpvbmUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZWN0IGRpbWVuc2lvbiBzZXR0aW5nIGZyb20gQ2FudmFzLU1vdXNlLVBvc2l0aW9uKHgsIHkpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBDYW52YXMtTW91c2UtUG9zaXRpb24geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHdpZHRoID0gY2FudmFzLmdldFdpZHRoKCk7XG4gICAgICAgIHZhciBoZWlnaHQgPSBjYW52YXMuZ2V0SGVpZ2h0KCk7XG4gICAgICAgIHZhciBzdGFydFggPSB0aGlzLl9zdGFydFg7XG4gICAgICAgIHZhciBzdGFydFkgPSB0aGlzLl9zdGFydFk7XG4gICAgICAgIHZhciBsZWZ0ID0gY2xhbXAoeCwgMCwgc3RhcnRYKTtcbiAgICAgICAgdmFyIHRvcCA9IGNsYW1wKHksIDAsIHN0YXJ0WSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCBzdGFydFgsIHdpZHRoKSAtIGxlZnQsIC8vIChzdGFydFggPD0geChtb3VzZSkgPD0gY2FudmFzV2lkdGgpIC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgc3RhcnRZLCBoZWlnaHQpIC0gdG9wIC8vIChzdGFydFkgPD0geShtb3VzZSkgPD0gY2FudmFzSGVpZ2h0KSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNldXAgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QoY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub2ZmKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IGxpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3JvcHBlZCBpbWFnZSBkYXRhXG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q3JvcHBlZEltYWdlRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgY3JvcEluZm87XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JvcEluZm8gPSB7XG4gICAgICAgICAgICBsZWZ0OiBjcm9wem9uZS5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3A6IGNyb3B6b25lLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGg6IGNyb3B6b25lLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGNyb3B6b25lLmdldEhlaWdodCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlTmFtZTogdGhpcy5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgIHVybDogdGhpcy5nZXRDYW52YXMoKS50b0RhdGFVUkwoY3JvcEluZm8pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjtcbiIsIi8qKlxuICogZmxpcC5qcyBjcmVhdGVkIG9uIDIwMTYuIDQuIDEyLlxuICpcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBmbGlwIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogRmxpcFxuICogQGNsYXNzIEZsaXBcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRmxpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGbGlwLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GTElQLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHt7ZmxpcFg6IEJvb2xlYW4sIGZsaXBZOiBCb29sZWFufX1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50U2V0dGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmxpcFg6IGNhbnZhc0ltYWdlLmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6IGNhbnZhc0ltYWdlLmZsaXBZXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBmbGlwWCwgZmxpcFlcbiAgICAgKiBAcGFyYW0ge3tmbGlwWDogP0Jvb2xlYW4sIGZsaXBZOiA/Qm9vbGVhbn19IGZsaXBTZXR0aW5nIC0gRmxpcCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKGZsaXBTZXR0aW5nKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50U2V0dGluZygpO1xuICAgICAgICB2YXIgJGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgIGZsaXBTZXR0aW5nLmZsaXBYID0gISEoZmxpcFNldHRpbmcuZmxpcFgpO1xuICAgICAgICBmbGlwU2V0dGluZy5mbGlwWSA9ICEhKGZsaXBTZXR0aW5nLmZsaXBZKTtcbiAgICAgICAgaWYgKGZsaXBTZXR0aW5nLmZsaXBYID09PSBjdXJyZW50LmZsaXBYICYmIGZsaXBTZXR0aW5nLmZsaXBZID09PSBjdXJyZW50LmZsaXBZKSB7XG4gICAgICAgICAgICAkZGVmZXIucmVqZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0dWkudXRpbC5leHRlbmQoY3VycmVudCwgZmxpcFNldHRpbmcpO1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZVByb3BlcnRpZXMoZmxpcFNldHRpbmcsIHRydWUpO1xuICAgICAgICAgICAgJGRlZmVyLnJlc29sdmUoZmxpcFNldHRpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRkZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQoe1xuICAgICAgICAgICAgZmxpcFg6IGZhbHNlLFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy50b2dnbGVJbWFnZVByb3BlcnRpZXMoWydmbGlwWCddLCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUodGhpcy5nZXRDdXJyZW50U2V0dGluZygpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBmbGlwWTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlSW1hZ2VQcm9wZXJ0aWVzKFsnZmxpcFknXSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmxpcDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGNyb3NzT3JpZ2luID0ge2Nyb3NzT3JpZ2luOiAnJ307XG52YXIgY3NzT25seSA9IHtjc3NPbmx5OiB0cnVlfTtcbnZhciBiYWNrc3RvcmVPbmx5ID0ge2JhY2tzdG9yZU9ubHk6IHRydWV9O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBJbWFnZUxvYWRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSLFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gaW1hZ2VOYW1lIC0gRmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxzdHJpbmcpfSBpbWcgLSBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH0gZGVmZXJyZWRcbiAgICAgKi9cbiAgICBsb2FkOiBmdW5jdGlvbihpbWFnZU5hbWUsIGltZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciAkZGVmZXIsIGNhbnZhcztcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7IC8vIEJhY2sgdG8gdGhlIGluaXRpYWwgc3RhdGUsIG5vdCBlcnJvci5cbiAgICAgICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICBjYW52YXMuYmFja2dyb3VuZEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAgJGRlZmVyID0gJC5EZWZlcnJlZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldENhbnZhc0ltYWdlKCcnLCBudWxsKTtcbiAgICAgICAgICAgIH0pLnJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRkZWZlciA9IHRoaXMuX3NldEJhY2tncm91bmRJbWFnZShpbWcpLmRvbmUoZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25TdWNjZXNzSW1hZ2VMb2FkKG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZShpbWFnZU5hbWUsIG9JbWFnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkZGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciAkZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWcpIHtcbiAgICAgICAgICAgIHJldHVybiAkZGVmZXIucmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLnNldEJhY2tncm91bmRJbWFnZShpbWcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG9JbWFnZSA9IGNhbnZhcy5iYWNrZ3JvdW5kSW1hZ2U7XG5cbiAgICAgICAgICAgIGlmIChvSW1hZ2UuZ2V0RWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAgJGRlZmVyLnJlc29sdmUob0ltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGRlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBjcm9zc09yaWdpbik7XG5cbiAgICAgICAgcmV0dXJuICRkZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TdWNjZXNzIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU3VjY2Vzc0ltYWdlTG9hZDogZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgbWF4V2lkdGggPSBNYXRoLm1pbihcbiAgICAgICAgICAgIE1hdGguZmxvb3IoMTAwMCksIC8vQHRvZG8gSW1hZ2VFZGl0b3Igb3B0aW9uOiBNYXgtV2lkdGggb2YgY2FudmFzXG4gICAgICAgICAgICBvSW1hZ2Uud2lkdGhcbiAgICAgICAgKTtcblxuICAgICAgICBjYW52YXMuc2V0RGltZW5zaW9ucyh7XG4gICAgICAgICAgICBtYXJnaW46ICdhdXRvJyxcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcnLCAgLy8gTm8gaW5saW5lLWNzcyBcImhlaWdodFwiIGZvciBJRTlcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiBtYXhXaWR0aCArICdweCdcbiAgICAgICAgfSwgY3NzT25seSk7XG5cbiAgICAgICAgY2FudmFzLnNldERpbWVuc2lvbnMoe1xuICAgICAgICAgICAgd2lkdGg6IG9JbWFnZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogb0ltYWdlLmhlaWdodFxuICAgICAgICB9LCBiYWNrc3RvcmVPbmx5KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUxvYWRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBNYWluIGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzc1xuICovXG52YXIgTWFpbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBNYWluLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBjYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkltYWdlfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vSW1hZ2UgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbWFnZSBuYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLk1BSU4sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkYXRhIHVybCBmcm9tIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyAmJiB0aGlzLmNhbnZhcy50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5pbWFnZU5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm9JbWFnZSA9IG9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50IHRvIGZhYnJpYy5DYW52YXNcbiAgICAgKiBAcGFyYW0ge2pRdWVyeXxFbGVtZW50fHN0cmluZ30gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCQoY2FudmFzRWxlbWVudClbMF0sIHtcbiAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAndHVpLWNvbXBvbmVudC1pbWFnZUVkaXRvci1jYW52YXNDb250YWluZXInXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB2YXIgb0ltYWdlID0gdGhpcy5vSW1hZ2U7XG5cbiAgICAgICAgaWYgKCFvSW1hZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9JbWFnZS5zZXQoc2V0dGluZyk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgcHJvcGVydGllcyBvZiB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwcm9wZXJ0aWVzIC0gSW1hZ2UgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICB0b2dnbGVJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdmFyIG9JbWFnZSA9IHRoaXMub0ltYWdlO1xuXG4gICAgICAgIGlmICghb0ltYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvSW1hZ2UudG9nZ2xlLmFwcGx5KG9JbWFnZSwgcHJvcGVydGllcyk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlTmFtZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb21wb25lbnROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdNQUlOJyxcbiAgICAgICAgJ0lNQUdFX0xPQURFUicsXG4gICAgICAgICdDUk9QUEVSJyxcbiAgICAgICAgJ0ZMSVAnXG4gICAgKSxcblxuICAgIGNvbW1hbmROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdMT0FEX0lNQUdFJyxcbiAgICAgICAgJ0ZMSVBfSU1BR0UnXG4gICAgKSxcblxuICAgIGV2ZW50TmFtZXM6IHtcbiAgICAgICAgTE9BRF9JTUFHRTogJ2xvYWRJbWFnZScsXG4gICAgICAgIENMRUFSX0lNQUdFOiAnY2xlYXJJbWFnZScsXG4gICAgICAgIFNUQVJUX0NST1BQSU5HOiAnc3RhcnRDcm9wcGluZycsXG4gICAgICAgIEVORF9DUk9QUElORzogJ2VuZENyb3BwaW5nJyxcbiAgICAgICAgRkxJUF9JTUFHRTogJ2ZsaXBJbWFnZScsXG4gICAgICAgIEVNUFRZX1JFRE9fU1RBQ0s6ICdlbXB0eVJlZG9TdGFjaycsXG4gICAgICAgIEVNUFRZX1VORE9fU1RBQ0s6ICdlbXB0eVVuZG9TdGFjaycsXG4gICAgICAgIFBVU0hfVU5ET19TVEFDSzogJ3B1c2hVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1JFRE9fU1RBQ0s6ICdwdXNoUmVkb1N0YWNrJ1xuICAgIH0sXG5cbiAgICBJU19TVVBQT1JUX0ZJTEVfQVBJOiAhISh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkZpbGVSZWFkZXIpXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2xhbXAgPSByZXF1aXJlKCcuLi91dGlsJykuY2xhbXA7XG5cbnZhciBDT1JORVJfVFlQRV9UT1BfTEVGVCA9ICd0bCc7XG52YXIgQ09STkVSX1RZUEVfVE9QX1JJR0hUID0gJ3RyJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfVE9QID0gJ210JztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfTEVGVCA9ICdtbCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUID0gJ21yJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NID0gJ21iJztcbnZhciBDT1JORVJfVFlQRV9CT1RUT01fTEVGVCA9ICdibCc7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUID0gJ2JyJztcblxuLyoqXG4gKiBDcm9wem9uZSBvYmplY3RcbiAqIElzc3VlOiBJRTcsIDgod2l0aCBleGNhbnZhcylcbiAqICAtIENyb3B6b25lIGlzIGEgYmxhY2sgem9uZSB3aXRob3V0IHRyYW5zcGFyZW5jeS5cbiAqIEBjbGFzcyBDcm9wem9uZVxuICogQGV4dGVuZHMge2ZhYnJpYy5SZWN0fVxuICovXG52YXIgQ3JvcHpvbmUgPSBmYWJyaWMudXRpbC5jcmVhdGVDbGFzcyhmYWJyaWMuUmVjdCwgLyoqIEBsZW5kcyBDcm9wem9uZS5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLmNhbGxTdXBlcignaW5pdGlhbGl6ZScsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9uKHtcbiAgICAgICAgICAgICdtb3ZpbmcnOiB0aGlzLl9vbk1vdmluZyxcbiAgICAgICAgICAgICdzY2FsaW5nJzogdGhpcy5fb25TY2FsaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgQ3JvcC16b25lXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9yZW5kZXI6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxGbGlwWCwgb3JpZ2luYWxGbGlwWSxcbiAgICAgICAgICAgIG9yaWdpbmFsU2NhbGVYLCBvcmlnaW5hbFNjYWxlWSxcbiAgICAgICAgICAgIGNyb3B6b25lRGFzaExpbmVXaWR0aCA9IDcsXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lT2Zmc2V0ID0gNztcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ19yZW5kZXInLCBjdHgpO1xuXG4gICAgICAgIC8vIENhbGMgb3JpZ2luYWwgc2NhbGVcbiAgICAgICAgb3JpZ2luYWxGbGlwWCA9IHRoaXMuZmxpcFggPyAtMSA6IDE7XG4gICAgICAgIG9yaWdpbmFsRmxpcFkgPSB0aGlzLmZsaXBZID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbFNjYWxlWCA9IG9yaWdpbmFsRmxpcFggLyB0aGlzLnNjYWxlWDtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVkgPSBvcmlnaW5hbEZsaXBZIC8gdGhpcy5zY2FsZVk7XG5cbiAgICAgICAgLy8gU2V0IG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZShvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVkpO1xuXG4gICAgICAgIC8vIFJlbmRlciBvdXRlciByZWN0XG4gICAgICAgIHRoaXMuX2ZpbGxPdXRlclJlY3QoY3R4LCAncmdiYSgwLCAwLCAwLCAwLjU1KScpO1xuXG4gICAgICAgIC8vIEJsYWNrIGRhc2ggbGluZVxuICAgICAgICB0aGlzLl9zdHJva2VCb3JkZXIoY3R4LCAncmdiKDAsIDAsIDApJywgY3JvcHpvbmVEYXNoTGluZVdpZHRoKTtcblxuICAgICAgICAvLyBXaGl0ZSBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigyNTUsIDI1NSwgMjU1KScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCwgY3JvcHpvbmVEYXNoTGluZU9mZnNldCk7XG5cbiAgICAgICAgLy8gUmVzZXQgc2NhbGVcbiAgICAgICAgY3R4LnNjYWxlKDEgLyBvcmlnaW5hbFNjYWxlWCwgMSAvIG9yaWdpbmFsU2NhbGVZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JvcHpvbmUtY29vcmRpbmF0ZXMgd2l0aCBvdXRlciByZWN0YW5nbGVcbiAgICAgKlxuICAgICAqICAgICB4MCAgICAgeDEgICAgICAgICB4MiAgICAgIHgzXG4gICAgICogIHkwICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfCAgICAvLyA8LS0tIFwiT3V0ZXItcmVjdGFuZ2xlXCJcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MSArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfCBDcm9wem9uZSB8Ly8vLy8vL3wgICAgQ3JvcHpvbmUgaXMgdGhlIFwiSW5uZXItcmVjdGFuZ2xlXCJcbiAgICAgKiAgICAgfC8vLy8vLy98ICAoMCwgMCkgIHwvLy8vLy8vfCAgICBDZW50ZXIgcG9pbnQgKDAsIDApXG4gICAgICogIHkyICstLS0tLS0tKy0tLS0tLS0tLS0rLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogIHkzICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAgICAgKlxuICAgICAqIEB0eXBlZGVmIHt7eDogQXJyYXk8bnVtYmVyPiwgeTogQXJyYXk8bnVtYmVyPn19IGNyb3B6b25lQ29vcmRpbmF0ZXNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEZpbGwgb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBmaWxsU3R5bGUgLSBGaWxsLXN0eWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsbE91dGVyUmVjdDogZnVuY3Rpb24oY3R4LCBmaWxsU3R5bGUpIHtcbiAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gdGhpcy5fZ2V0Q29vcmRpbmF0ZXMoY3R4KSxcbiAgICAgICAgICAgIHggPSBjb29yZGluYXRlcy54LFxuICAgICAgICAgICAgeSA9IGNvb3JkaW5hdGVzLnk7XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZTtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIC8vIE91dGVyIHJlY3RhbmdsZVxuICAgICAgICAvLyBOdW1iZXJzIGFyZSArLy0xIHNvIHRoYXQgb3ZlcmxheSBlZGdlcyBkb24ndCBnZXQgYmx1cnJ5LlxuICAgICAgICBjdHgubW92ZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzNdICsgMSwgeVszXSArIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzNdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFswXSAtIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIC8vIElubmVyIHJlY3RhbmdsZVxuICAgICAgICBjdHgubW92ZVRvKHhbMV0sIHlbMV0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMV0sIHlbMl0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMl0sIHlbMl0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMl0sIHlbMV0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMV0sIHlbMV0pO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvb3JkaW5hdGVzXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcmV0dXJucyB7Y3JvcHpvbmVDb29yZGluYXRlc30gLSB7QGxpbmsgY3JvcHpvbmVDb29yZGluYXRlc31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb29yZGluYXRlczogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBjZWlsID0gTWF0aC5jZWlsLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgaGFsZldpZHRoID0gd2lkdGggLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IGhlaWdodCAvIDIsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgY2FudmFzRWwgPSBjdHguY2FudmFzOyAvLyBjYW52YXMgZWxlbWVudCwgbm90IGZhYnJpYyBvYmplY3RcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogdHVpLnV0aWwubWFwKFtcbiAgICAgICAgICAgICAgICAtKGhhbGZXaWR0aCArIGxlZnQpLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgwXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGgpLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MVxuICAgICAgICAgICAgICAgIGhhbGZXaWR0aCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDJcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGggKyAoY2FudmFzRWwud2lkdGggLSBsZWZ0IC0gd2lkdGgpIC8vIHgzXG4gICAgICAgICAgICBdLCBjZWlsKSxcbiAgICAgICAgICAgIHk6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0ICsgdG9wKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTBcbiAgICAgICAgICAgICAgICAtKGhhbGZIZWlnaHQpLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MVxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkyXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCArIChjYW52YXNFbC5oZWlnaHQgLSB0b3AgLSBoZWlnaHQpICAgLy8geTNcbiAgICAgICAgICAgIF0sIGNlaWwpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0cm9rZSBib3JkZXJcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59IHN0cm9rZVN0eWxlIC0gU3Ryb2tlLXN0eWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVEYXNoV2lkdGggLSBEYXNoIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtsaW5lRGFzaE9mZnNldF0gLSBEYXNoIG9mZnNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3N0cm9rZUJvcmRlcjogZnVuY3Rpb24oY3R4LCBzdHJva2VTdHlsZSwgbGluZURhc2hXaWR0aCwgbGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgdmFyIGhhbGZXaWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSAvIDI7XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGU7XG4gICAgICAgIGlmIChjdHguc2V0TGluZURhc2gpIHtcbiAgICAgICAgICAgIGN0eC5zZXRMaW5lRGFzaChbbGluZURhc2hXaWR0aCwgbGluZURhc2hXaWR0aF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lRGFzaE9mZnNldCkge1xuICAgICAgICAgICAgY3R4LmxpbmVEYXNoT2Zmc2V0ID0gbGluZURhc2hPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oLWhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3ZpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMuZ2V0VG9wKCksXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCksXG4gICAgICAgICAgICBtYXhMZWZ0ID0gY2FudmFzLmdldFdpZHRoKCkgLSB3aWR0aCxcbiAgICAgICAgICAgIG1heFRvcCA9IGNhbnZhcy5nZXRIZWlnaHQoKSAtIGhlaWdodDtcblxuICAgICAgICB0aGlzLnNldExlZnQoY2xhbXAobGVmdCwgMCwgbWF4TGVmdCkpO1xuICAgICAgICB0aGlzLnNldFRvcChjbGFtcCh0b3AsIDAsIG1heFRvcCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvblNjYWxpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3tlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25TY2FsaW5nOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSB0aGlzLmNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdGhpcy5fY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlcik7XG5cbiAgICAgICAgLy8gT24gc2NhbGluZyBjcm9wem9uZSxcbiAgICAgICAgLy8gY2hhbmdlIHJlYWwgd2lkdGggYW5kIGhlaWdodCBhbmQgZml4IHNjYWxlRmFjdG9yIHRvIDFcbiAgICAgICAgdGhpcy5zY2FsZSgxKS5zZXQoc2V0dGluZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxlZCBzaXplIGZyb20gbW91c2UgcG9pbnRlciB3aXRoIHNlbGVjdGVkIGNvcm5lclxuICAgICAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gcG9pbnRlciAtIE1vdXNlIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gSGF2aW5nIGxlZnQgb3IoYW5kKSB0b3Agb3IoYW5kKSB3aWR0aCBvcihhbmQpIGhlaWdodC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjU2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24ocG9pbnRlcikge1xuICAgICAgICB2YXIgcG9pbnRlclggPSBwb2ludGVyLngsXG4gICAgICAgICAgICBwb2ludGVyWSA9IHBvaW50ZXIueSxcbiAgICAgICAgICAgIHRsU2NhbGluZ1NpemUgPSB0aGlzLl9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlclgsIHBvaW50ZXJZKSxcbiAgICAgICAgICAgIGJyU2NhbGluZ1NpemUgPSB0aGlzLl9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogQHRvZG86IOydvOuwmCDqsJ3ssrTsl5DshJwgc2hpZnQg7KGw7ZWp7YKk66W8IOuIhOultOuptCBmcmVlIHNpemUgc2NhbGluZ+ydtCDrkKggLS0+IO2ZleyduO2VtOuzvOqyg1xuICAgICAgICAgKiAgICAgIGNhbnZhcy5jbGFzcy5qcyAvLyBfc2NhbGVPYmplY3Q6IGZ1bmN0aW9uKC4uLil7Li4ufVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTY2FsaW5nU2V0dGluZ3ModGxTY2FsaW5nU2l6ZSwgYnJTY2FsaW5nU2l6ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGluZyBzaXplKHBvc2l0aW9uICsgZGltZW5zaW9uKSBmcm9tIGxlZnQtdG9wIGNvcm5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gTW91c2UgcG9zaXRpb24gWFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gTW91c2UgcG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNUb3BMZWZ0U2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgYm90dG9tID0gdGhpcy5nZXRIZWlnaHQoKSArIHRoaXMudG9wLFxuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLmdldFdpZHRoKCkgKyB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSBjbGFtcCh5LCAwLCBib3R0b20gLSAxKSwgIC8vIDAgPD0gdG9wIDw9IChib3R0b20gLSAxKVxuICAgICAgICAgICAgbGVmdCA9IGNsYW1wKHgsIDAsIHJpZ2h0IC0gMSk7ICAvLyAwIDw9IGxlZnQgPD0gKHJpZ2h0IC0gMSlcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJUb3AtTGVmdCBjb3JuZXJcIjogSXQgZml4ZXMgcmlnaHQgYW5kIGJvdHRvbSBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgd2lkdGg6IHJpZ2h0IC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogYm90dG9tIC0gdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGluZyBzaXplIGZyb20gcmlnaHQtYm90dG9tIGNvcm5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gTW91c2UgcG9zaXRpb24gWFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gTW91c2UgcG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNCb3R0b21SaWdodFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgbWF4WCA9IGNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIG1heFkgPSBjYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMudG9wO1xuXG4gICAgICAgIC8vIFdoZW4gc2NhbGluZyBcIkJvdHRvbS1SaWdodCBjb3JuZXJcIjogSXQgZml4ZXMgbGVmdCBhbmQgdG9wIGNvb3JkaW5hdGVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogY2xhbXAoeCwgKGxlZnQgKyAxKSwgbWF4WCkgLSBsZWZ0LCAgICAvLyAod2lkdGggPSB4IC0gbGVmdCksIChsZWZ0ICsgMSA8PSB4IDw9IG1heFgpXG4gICAgICAgICAgICBoZWlnaHQ6IGNsYW1wKHksICh0b3AgKyAxKSwgbWF4WSkgLSB0b3AgICAgICAvLyAoaGVpZ2h0ID0geSAtIHRvcCksICh0b3AgKyAxIDw9IHkgPD0gbWF4WSlcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyplc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5Ki9cbiAgICAvKipcbiAgICAgKiBNYWtlIHNjYWxpbmcgc2V0dGluZ3NcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRsIC0gVG9wLUxlZnQgc2V0dGluZ1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYnIgLSBCb3R0b20tUmlnaHQgc2V0dGluZ1xuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6ID9udW1iZXIsIGhlaWdodDogP251bWJlciwgbGVmdDogP251bWJlciwgdG9wOiA/bnVtYmVyfX0gUG9zaXRpb24gc2V0dGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTY2FsaW5nU2V0dGluZ3M6IGZ1bmN0aW9uKHRsLCBicikge1xuICAgICAgICB2YXIgdGxXaWR0aCA9IHRsLndpZHRoLFxuICAgICAgICAgICAgdGxIZWlnaHQgPSB0bC5oZWlnaHQsXG4gICAgICAgICAgICBickhlaWdodCA9IGJyLmhlaWdodCxcbiAgICAgICAgICAgIGJyV2lkdGggPSBici53aWR0aCxcbiAgICAgICAgICAgIHRsTGVmdCA9IHRsLmxlZnQsXG4gICAgICAgICAgICB0bFRvcCA9IHRsLnRvcCxcbiAgICAgICAgICAgIHNldHRpbmdzO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5fX2Nvcm5lcikge1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9UT1BfTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9UT1BfUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBicldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRsVG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0bFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0bExlZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9CT1RUT01fUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSBicjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0bFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0bExlZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfVE9QOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRsVG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9CT1RUT006XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYnJIZWlnaHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9LCAvKmVzbGludC1lbmFibGUgY29tcGxleGl0eSovXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHdoZXRoZXIgdGhpcyBjcm9wem9uZSBpcyB2YWxpZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzVmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy5sZWZ0ID49IDAgJiZcbiAgICAgICAgICAgIHRoaXMudG9wID49IDAgJiZcbiAgICAgICAgICAgIHRoaXMud2lkdGggPiAwICYmXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA+IDBcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wem9uZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbW1hbmQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgY29tcG9uZW50TmFtZXMgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG52YXIgY29tbWFuZE5hbWVzID0gY29uc3RzLmNvbW1hbmROYW1lcztcbnZhciBJTUFHRV9MT0FERVIgPSBjb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVI7XG52YXIgRkxJUCA9IGNvbXBvbmVudE5hbWVzLkZMSVA7XG52YXIgY3JlYXRvcnMgPSB7fTtcblxuLyoqXG4gKiBTZXQgbWFwcGluZyBjcmVhdG9yc1xuICovXG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuTE9BRF9JTUFHRV0gPSBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkZMSVBfSU1BR0VdID0gY3JlYXRlRmxpcEltYWdlQ29tbWFuZDtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gSW1hZ2UgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEltYWdlIHVybFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxvYWRJbWFnZUNvbW1hbmQoaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgICAgIHByZXZOYW1lOiBsb2FkZXIuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICAgICAgcHJldkltYWdlOiBsb2FkZXIuZ2V0Q2FudmFzSW1hZ2UoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGxvYWRlci5sb2FkKGltYWdlTmFtZSwgdXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChzdG9yZS5wcmV2TmFtZSwgc3RvcmUucHJldkltYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAqIEByZXR1cm5zIHskLkRlZmVycmVkfVxuICovXG5mdW5jdGlvbiBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kKHR5cGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gZmxpcENvbXAuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZsaXBDb21wW3R5cGVdKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmbGlwQ29tcCA9IGNvbXBNYXBbRkxJUF07XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcC5zZXQodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgY29tbWFuZFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21tYW5kIG5hbWVcbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIEFyZ3VtZW50cyBmb3IgY3JlYXRpbmcgY29tbWFuZFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZShuYW1lLCBhcmdzKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICByZXR1cm4gY3JlYXRvcnNbbmFtZV0uYXBwbHkobnVsbCwgYXJncyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBjcmVhdGVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlNaXJyb3IgPSByZXF1aXJlKCcuLi91dGlsJykua2V5TWlycm9yO1xuXG52YXIgdHlwZXMgPSBrZXlNaXJyb3IoXG4gICAgJ1VOX0lNUExFTUVOVEFUSU9OJyxcbiAgICAnTk9fQ09NUE9ORU5UX05BTUUnLFxuICAgICdVTktOT1dOJ1xuKTtcblxudmFyIG1lc3NhZ2VzID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiAnU2hvdWxkIGltcGxlbWVudCBhIG1ldGhvZDogJyxcbiAgICBOT19DT01QT05FTlRfTkFNRTogJ1Nob3VsZCBzZXQgYSBjb21wb25lbnQgbmFtZScsXG4gICAgVU5LTk9XTjogJ1Vua25vd246ICdcbn07XG5cblxudmFyIG1hcCA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuVU5fSU1QTEVNRU5UQVRJT04gKyBtZXRob2ROYW1lO1xuICAgIH0sXG5cbiAgICBOT19DT01QT05FTlRfTkFNRTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5OT19DT01QT05FTlRfTkFNRTtcbiAgICB9LFxuXG4gICAgVU5LTk9XTjogZnVuY3Rpb24obXNnKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5VTktOT1dOICsgbXNnO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHR5cGVzOiB0dWkudXRpbC5leHRlbmQoe30sIHR5cGVzKSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgZnVuYztcblxuICAgICAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBmdW5jID0gbWFwW3R5cGVdIHx8IG1hcC51bmtub3duO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcblxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbnZva2VyID0gcmVxdWlyZSgnLi9pbnZva2VyJyk7XG52YXIgY29tbWFuZEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnkvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciBldmVudHMgPSBjb25zdHMuZXZlbnROYW1lcztcbnZhciBjb21tYW5kcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY29tcExpc3QgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG5cbi8qKlxuICogSW1hZ2UgZWRpdG9yXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfGpRdWVyeXxIVE1MRWxlbWVudH0gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gKi9cbnZhciBJbWFnZUVkaXRvciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW1hZ2VFZGl0b3IucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElub3ZrZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0ludm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyID0gbmV3IEludm9rZXIoKTtcblxuICAgICAgICB0aGlzLl9zZXRDYW52YXNFbGVtZW50KCQoY2FudmFzRWxlbWVudClbMF0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZXZlbnQgbmFtZXNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEV2ZW50TmFtZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZXh0ZW5kKHt9LCBldmVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeXxFbGVtZW50fHN0cmluZ30gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkuc2V0Q2FudmFzRWxlbWVudChjYW52YXNFbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBtYWluIGNvbXBvbmVudFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9IE1haW4gY29tcG9uZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TWFpbkNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuTUFJTik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZXIuZ2V0Q29tcG9uZW50KG5hbWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgYWN0aW9uc1xuICAgICAqL1xuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRDcm9wcGluZygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIENvbW1hbmRcbiAgICAgKi9cbiAgICBleGVjdXRlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuaW52b2tlKGNvbW1hbmQpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW52b2tlciA9IHRoaXMuX2ludm9rZXI7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGludm9rZXIudW5kbygpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW52b2tlci5pc0VtcHR5VW5kb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50cy5QVVNIX1JFRE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkb1xuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW52b2tlciA9IHRoaXMuX2ludm9rZXI7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGludm9rZXIucmVkbygpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW52b2tlci5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50cy5QVVNIX1VORE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIGZpbGVcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltZ0ZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbUZpbGU6IGZ1bmN0aW9uKGltZ0ZpbGUpIHtcbiAgICAgICAgaWYgKCFpbWdGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoXG4gICAgICAgICAgICBpbWdGaWxlLm5hbWUsXG4gICAgICAgICAgICBVUkwuY3JlYXRlT2JqZWN0VVJMKGltZ0ZpbGUpXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gaW1hZ2VOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEZpbGUgdXJsXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbVVSTDogZnVuY3Rpb24oaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgfHwgIXVybCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmcsIHRoaXMpO1xuICAgICAgICBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkxPQURfSU1BR0UsIGltYWdlTmFtZSwgdXJsKVxuICAgICAgICAgICAgLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhvSW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkNMRUFSX0lNQUdFKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYWZ0ZXIgaW1hZ2UgbG9hZGluZ1xuICAgICAqIEBwYXJhbSB7P2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gSW1hZ2UgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBfY2FsbGJhY2tBZnRlckltYWdlTG9hZGluZzogZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgIHZhciBtYWluQ29tcG9uZW50ID0gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpO1xuICAgICAgICB2YXIgJGNhbnZhc0VsZW1lbnQgPSAkKG1haW5Db21wb25lbnQuZ2V0Q2FudmFzRWxlbWVudCgpKTtcblxuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkxPQURfSU1BR0UsIHtcbiAgICAgICAgICAgIG9yaWdpbmFsV2lkdGg6IG9JbWFnZS53aWR0aCxcbiAgICAgICAgICAgIG9yaWdpbmFsSGVpZ2h0OiBvSW1hZ2UuaGVpZ2h0LFxuICAgICAgICAgICAgY3VycmVudFdpZHRoOiAkY2FudmFzRWxlbWVudC53aWR0aCgpLFxuICAgICAgICAgICAgY3VycmVudEhlaWdodDogJGNhbnZhc0VsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnRDcm9wcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuXG4gICAgICAgIGNyb3BwZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5TVEFSVF9DUk9QUElORyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IGNyb3BwaW5nXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNBcHBseWluZ10gLSBXaGV0aGVyIHRoZSBjcm9wcGluZyBpcyBhcHBsaWVkIG9yIGNhbmNlbGVkXG4gICAgICovXG4gICAgZW5kQ3JvcHBpbmc6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNyb3BwZXIgPSB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuQ1JPUFBFUik7XG4gICAgICAgIHZhciBkYXRhID0gY3JvcHBlci5lbmQoaXNBcHBseWluZyk7XG5cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5FTkRfQ1JPUFBJTkcpO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGcm9tVVJMKGRhdGEuaW1hZ2VOYW1lLCBkYXRhLnVybCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mbGlwOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBldmVudHMuRkxJUF9JTUFHRSk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkZMSVBfSU1BR0UsIHR5cGUpXG4gICAgICAgICAgICAuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKi9cbiAgICBmbGlwWDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ2ZsaXBYJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFknKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcFxuICAgICAqL1xuICAgIHJlc2V0RmxpcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ3Jlc2V0Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRhIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pbnZva2VyLmNsZWFyVW5kb1N0YWNrKCk7XG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuRU1QVFlfVU5ET19TVEFDSyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHJlZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyUmVkb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclJlZG9TdGFjaygpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oSW1hZ2VFZGl0b3IpO1xubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb21wb25lbnQgaW50ZXJmYWNlXG4gKiBAY2xhc3NcbiAqL1xudmFyIENvbXBvbmVudCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tcG9uZW50LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNJbWFnZShuYW1lLCBvSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzRWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNJbWFnZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgZWRpdG9yXG4gICAgICogQHJldHVybnMge0ltYWdlRWRpdG9yfVxuICAgICAqL1xuICAgIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRFZGl0b3IoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgcHJvcGVydGllcyBvZiB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwcm9wZXJ0aWVzIC0gSW1hZ2UgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICB0b2dnbGVJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkudG9nZ2xlSW1hZ2VQcm9wZXJ0aWVzKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcGFyZW50XG4gICAgICogQHBhcmFtIHtDb21wb25lbnR8bnVsbH0gcGFyZW50IC0gUGFyZW50XG4gICAgICovXG4gICAgc2V0UGFyZW50OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50IHx8IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwYXJlbnQuXG4gICAgICogSWYgdGhlIHZpZXcgaXMgcm9vdCwgcmV0dXJuIG51bGxcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fG51bGx9XG4gICAgICovXG4gICAgZ2V0UGFyZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHJvb3RcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldFJvb3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMuZ2V0UGFyZW50KCksXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtdGhpcyAqL1xuICAgICAgICAgICAgY3VycmVudCA9IHRoaXM7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgY29uc2lzdGVudC10aGlzICovXG5cbiAgICAgICAgd2hpbGUgKG5leHQpIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgICAgICAgbmV4dCA9IGN1cnJlbnQuZ2V0UGFyZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvck1lc3NhZ2UgPSByZXF1aXJlKCcuLi9mYWN0b3J5L2Vycm9yTWVzc2FnZScpO1xuXG52YXIgY3JlYXRlTWVzc2FnZSA9IGVycm9yTWVzc2FnZS5jcmVhdGUsXG4gICAgZXJyb3JUeXBlcyA9IGVycm9yTWVzc2FnZS50eXBlcztcblxuLyoqXG4gKiBDb21tYW5kIGNsYXNzXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7e2V4ZWN1dGU6IGZ1bmN0aW9uLCB1bmRvOiBmdW5jdGlvbn19IGFjdGlvbnMgLSBDb21tYW5kIGFjdGlvbnNcbiAqL1xudmFyIENvbW1hbmQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENvbW1hbmQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGFjdGlvbnMpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4ZWN1dGUgZnVuY3Rpb25cbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leGVjdXRlID0gYWN0aW9ucy5leGVjdXRlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVbmRvIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kbyA9IGFjdGlvbnMudW5kbztcblxuICAgICAgICAvKipcbiAgICAgICAgICogZXhlY3V0ZUNhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leGVjdXRlQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1bmRvQ2FsbGJhY2tcbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG9DYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICdleGVjdXRlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvIGFjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAndW5kbycpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV4ZWN1dGUgY2FsbGFiY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGFmdGVyIGV4ZWN1dGlvblxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kfSB0aGlzXG4gICAgICovXG4gICAgc2V0RXhlY3V0ZUNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmV4ZWN1dGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggdW5kbyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgYWZ0ZXIgdW5kb1xuICAgICAqIEByZXR1cm5zIHtDb21tYW5kfSB0aGlzXG4gICAgICovXG4gICAgc2V0VW5kb0NhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnVuZG9DYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbWFnZUxvYWRlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ltYWdlTG9hZGVyJyk7XG52YXIgQ3JvcHBlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2Nyb3BwZXInKTtcbnZhciBNYWluQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQvbWFpbicpO1xudmFyIEZsaXAgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mbGlwJyk7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbnZva2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVkb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbXBvbmVudCBtYXBcbiAgICAgICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXAgPSB7fTtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb21wb25lbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjb21wb25lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtYWluID0gbmV3IE1haW5Db21wb25lbnQoKTtcblxuICAgICAgICB0aGlzLl9yZWdpc3RlcihtYWluKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEltYWdlTG9hZGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IENyb3BwZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRmxpcChtYWluKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgLSBDb21wb25lbnQgaGFuZGxpbmcgdGhlIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXBbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBnZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLmNvbXBvbmVudE1hcCkpXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGVDYWxsYmFjaylcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb1N0YWNrLnB1c2goY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgc2VsZi5jbGVhclJlZG9TdGFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy51bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyICRkZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgJGRlZmVyID0gJC53aGVuKGNvbW1hbmQudW5kbyh0aGlzLmNvbXBvbmVudE1hcCkpXG4gICAgICAgICAgICAgICAgLmRvbmUoY29tbWFuZC51bmRvQ2FsbGJhY2spXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVkb1N0YWNrLnB1c2goY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkZGVmZXIgPSAkLkRlZmVycmVkKCkucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJGRlZmVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWRvIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWFuZCA9IHRoaXMucmVkb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciAkZGVmZXI7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgICRkZWZlciA9ICQud2hlbihjb21tYW5kLmV4ZWN1dGUodGhpcy5jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgICAgIC5kb25lKGNvbW1hbmQuZXhlY3V0ZUNhbGxiYWNrKVxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGRlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRkZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID09PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgdW5kb1N0YWNrIGlzIGVtcHR5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNFbXB0eVVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51bmRvU3RhY2sgPSBbXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlZG9TdGFjayA9IFtdO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludm9rZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW4gPSBNYXRoLm1pbixcbiAgICBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQ2xhbXAgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5WYWx1ZSAtIE1pbmltdW0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4VmFsdWUgLSBNYXhpbXVtIHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gY2xhbXBlZCB2YWx1ZVxuICAgICAqL1xuICAgIGNsYW1wOiBmdW5jdGlvbih2YWx1ZSwgbWluVmFsdWUsIG1heFZhbHVlKSB7XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICBpZiAobWluVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgdGVtcCA9IG1pblZhbHVlO1xuICAgICAgICAgICAgbWluVmFsdWUgPSBtYXhWYWx1ZTtcbiAgICAgICAgICAgIG1heFZhbHVlID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXgobWluVmFsdWUsIG1pbih2YWx1ZSwgbWF4VmFsdWUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBrZXktdmFsdWUgb2JqZWN0IGZyb20gYXJndW1lbnRzXG4gICAgICogQHJldHVybnMge29iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGtleU1pcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmogPSB7fTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IGtleTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG59O1xuIl19
