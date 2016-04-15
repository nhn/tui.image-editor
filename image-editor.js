(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":11}],2:[function(require,module,exports){
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

},{"../consts":7,"../extension/cropzone":8,"../interface/component":14,"../util":16}],3:[function(require,module,exports){
/**
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
        var jqDefer = $.Deferred();

        flipSetting.flipX = !!(flipSetting.flipX);
        flipSetting.flipY = !!(flipSetting.flipY);
        if (flipSetting.flipX === current.flipX && flipSetting.flipY === current.flipY) {
            jqDefer.reject();
        } else {
            flipSetting = tui.util.extend(current, flipSetting);
            this.setImageProperties(flipSetting, true);
            jqDefer.resolve(flipSetting);
        }

        return jqDefer;
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

},{"../consts":7,"../interface/Component":12}],4:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var imageOption = {
    padding: 0,
    crossOrigin: ''
};

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
        var jqDefer, canvas;

        if (!imageName && !img) { // Back to the initial state, not error.
            canvas = this.getCanvas();
            canvas.backgroundImage = null;
            canvas.renderAll();

            jqDefer = $.Deferred(function() {
                self.setCanvasImage('', null);
            }).resolve();
        } else {
            jqDefer = this._setBackgroundImage(img).done(function(oImage) {
                self._onSuccessImageLoad(oImage);
                self.setCanvasImage(imageName, oImage);
            });
        }

        return jqDefer;
    },

    /**
     * Set background image
     * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
     * @returns {$.Deferred} deferred
     * @private
     */
    _setBackgroundImage: function(img) {
        var jqDefer = $.Deferred();
        var canvas;

        if (!img) {
            return jqDefer.reject();
        }

        canvas = this.getCanvas();
        canvas.setBackgroundImage(img, function() {
            var oImage = canvas.backgroundImage;

            if (oImage.getElement()) {
                jqDefer.resolve(oImage);
            } else {
                jqDefer.reject();
            }
        }, imageOption);

        return jqDefer;
    },

    /**
     * onSuccess callback
     * @param {fabric.Image} oImage - Fabric image instance
     * @private
     */
    _onSuccessImageLoad: function(oImage) {
        this.setCanvasCssDimension({
            margin: 'auto',
            width: '100%',
            height: '',  // No inline-css "height" for IE9
            'max-width': oImage.width + 'px'
        });

        this.setCanvasBackstoreDimension({
            width: oImage.width,
            height: oImage.height
        });
    }
});

module.exports = ImageLoader;

},{"../consts":7,"../interface/component":14}],5:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var DEFAULT_MAX_WIDTH = 1000;

var cssOnly = {cssOnly: true};
var backstoreOnly = {backstoreOnly: true};
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
     * Set canvas dimension - css only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas css dimension
     * @override
     */
    setCanvasCssDimension: function(dimension) {
        var maxWidth = parseInt(dimension['max-width'], 10);
        if (maxWidth) {
            dimension['max-width'] = Math.min(maxWidth, DEFAULT_MAX_WIDTH) + 'px';
        }

        this.canvas.setDimensions(dimension, cssOnly);
    },

    /**
     * Set canvas dimension - css only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas backstore dimension
     * @override
     */
    setCanvasBackstoreDimension: function(dimension) {
        this.canvas.setDimensions(dimension, backstoreOnly);
    },

    /**
     * Set image properties
     * {@link http://fabricjs.com/docs/fabric.Image.html#set}
     * @param {object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     * @override
     */
    setImageProperties: function(setting, withRendering) {
        var oImage = this.oImage;

        if (!oImage) {
            return;
        }

        oImage.set(setting).setCoords();
        if (withRendering) {
            this.canvas.renderAll();
        }
    },

    /**
     * Toggle properties of the image
     * {@link http://fabricjs.com/docs/fabric.Image.html#toggle}
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

},{"../consts":7,"../interface/component":14}],6:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image rotation module
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * Image Rotation component
 * @class Rotation
 * @extends {Component}
 * @param {Component} parent - parent component
 */
var Rotation = tui.util.defineClass(Component, /** @lends Rotation.prototype */ {
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.ROTATION,

    /**
     * Get current angle
     * @returns {Number}
     */
    getCurrentAngle: function() {
        return this.getCanvasImage().angle;
    },

    /**
     * Set angle of the image
     * @param {number} angle - Angle value
     * @returns {jQuery.Deferred}
     */
    setAngle: function(angle) {
        var current = this.getCurrentAngle();
        var jqDefer = $.Deferred();

        if (angle === current) {
            return jqDefer.reject();
        }

        /**
         * Do not call "this.setImageProperties" for setting angle directly.
         * Before setting angle, The originX,Y of image should be set to center.
         *  See "http://fabricjs.com/docs/fabric.Object.html#setAngle"
         */
        this.getCanvasImage()
            .setAngle(angle)
            .setCoords();
        this._adjustCanvasDimension();

        return jqDefer.resolve(angle);
    },

    /**
     * Adjust canvas dimension from image-rotation
     * @private
     */
    _adjustCanvasDimension: function() {
        var canvasImage = this.getCanvasImage(),
            boundingRect = canvasImage.getBoundingRect();

        // BoundingRect dimensions +1, so that don't get blurry image.
        boundingRect.width = Math.floor(boundingRect.width) + 1;
        boundingRect.height = Math.floor(boundingRect.height) + 1;

        this.setCanvasCssDimension({
            'max-width': boundingRect.width + 'px'
        });
        this.setCanvasBackstoreDimension({
            width: boundingRect.width,
            height: boundingRect.height
        });
        this.getCanvas().centerObject(canvasImage);
    },

    /**
     * Rotate the image
     * @param {number} additionalAngle - Additional angle
     * @returns {jQuery.Deferred}
     */
    rotate: function(additionalAngle) {
        var current = this.getCanvasImage().angle;

        // The angle is lower than 2*PI(===360 degrees)
        return this.setAngle((current + additionalAngle) % 360);
    }
});

module.exports = Rotation;

},{"../consts":7,"../interface/Component":12}],7:[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = {
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER',
        'FLIP',
        'ROTATION'
    ),

    commandNames: util.keyMirror(
        'LOAD_IMAGE',
        'FLIP_IMAGE',
        'ROTATE_IMAGE'
    ),

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        FLIP_IMAGE: 'flipImage',
        ROTATE_IMAGE: 'rotateImage',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};

},{"./util":16}],8:[function(require,module,exports){
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

},{"../util":16}],9:[function(require,module,exports){
'use strict';

var Command = require('../interface/command');
var consts = require('../consts');

var componentNames = consts.componentNames;
var commandNames = consts.commandNames;
var creators = {};

var IMAGE_LOADER = componentNames.IMAGE_LOADER;
var FLIP = componentNames.FLIP;
var ROTATION = componentNames.ROTATION;

/**
 * Set mapping creators
 */
creators[commandNames.LOAD_IMAGE] = createLoadImageCommand;
creators[commandNames.FLIP_IMAGE] = createFlipImageCommand;
creators[commandNames.ROTATE_IMAGE] = createRotationImageCommand;

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
 * @param {number} angle - Angle value to rotate
 * @returns {$.Deferred}
 */
function createRotationImageCommand(angle) {
    return new Command({
        execute: function(compMap) {
            var rotationComp = compMap[ROTATION];

            this.store = rotationComp.getCurrentAngle();

            return rotationComp.rotate(angle);
        },
        undo: function(compMap) {
            var rotationComp = compMap[ROTATION];

            return rotationComp.setAngle(this.store);
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

},{"../consts":7,"../interface/command":13}],10:[function(require,module,exports){
'use strict';

var keyMirror = require('../util').keyMirror;

var types = keyMirror(
    'UN_IMPLEMENTATION',
    'NO_COMPONENT_NAME'
);

var messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_COMPONENT_NAME: 'Should set a component name'
};

var map = {
    UN_IMPLEMENTATION: function(methodName) {
        return messages.UN_IMPLEMENTATION + methodName;
    },
    NO_COMPONENT_NAME: function() {
        return messages.NO_COMPONENT_NAME;
    }
};

module.exports = {
    types: tui.util.extend({}, types),

    create: function(type) {
        var func;

        type = type.toLowerCase();
        func = map[type];
        Array.prototype.shift.apply(arguments);

        return func.apply(null, arguments);
    }
};

},{"../util":16}],11:[function(require,module,exports){
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

        this._getMainComponent().setCanvasElement(canvasElement);
    },

    /**
     * Return event names
     * @returns {Object}
     */
    getEventNames: function() {
        return tui.util.extend({}, events);
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
            if (!self._invoker.isEmptyUndoStack()) {
                self.fire(events.PUSH_UNDO_STACK);
            }
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
     * Rotate image
     * @param {number} angle - Angle to rotate image
     */
    rotate: function(angle) {
        var callback = $.proxy(this.fire, this, events.ROTATE_IMAGE);
        var command = commandFactory.create(commands.ROTATE_IMAGE, angle)
            .setExecuteCallback(callback)
            .setUndoCallback(callback);

        this.execute(command);
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

},{"./consts":7,"./factory/command":9,"./invoker":15}],12:[function(require,module,exports){
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
     * Set canvas dimension - css only
     * @param {object} dimension - Canvas css dimension
     */
    setCanvasCssDimension: function(dimension) {
        this.getRoot().setCanvasCssDimension(dimension);
    },

    /**
     * Set canvas dimension - css only
     * @param {object} dimension - Canvas backstore dimension
     */
    setCanvasBackstoreDimension: function(dimension) {
        this.getRoot().setCanvasBackstoreDimension(dimension);
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

},{}],13:[function(require,module,exports){
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

},{"../factory/errorMessage":10}],14:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],15:[function(require,module,exports){
'use strict';

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');
var MainComponent = require('./component/main');
var Flip = require('./component/flip');
var Rotation = require('./component/rotation');

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
        this._register(new Rotation(main));
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
            .done(function() {
                self.undoStack.push(command);
                self.clearRedoStack();
            })
            .done(command.executeCallback);
    },

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo: function() {
        var command = this.undoStack.pop();
        var self = this;
        var jqDefer;

        if (command) {
            jqDefer = $.when(command.undo(this.componentMap))
                .done(function() {
                    self.redoStack.push(command);
                })
                .done(command.undoCallback);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
    },

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo: function() {
        var command = this.redoStack.pop();
        var self = this;
        var jqDefer;

        if (command) {
            jqDefer = $.when(command.execute(this.componentMap))
                .done(function() {
                    self.undoStack.push(command);
                })
                .done(command.executeCallback);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
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

},{"./component/cropper":2,"./component/flip":3,"./component/imageLoader":4,"./component/main":5,"./component/rotation":6}],16:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29tcG9uZW50L3JvdGF0aW9uLmpzIiwic3JjL2pzL2NvbnN0cy5qcyIsInNyYy9qcy9leHRlbnNpb24vY3JvcHpvbmUuanMiLCJzcmMvanMvZmFjdG9yeS9jb21tYW5kLmpzIiwic3JjL2pzL2ZhY3RvcnkvZXJyb3JNZXNzYWdlLmpzIiwic3JjL2pzL2ltYWdlRWRpdG9yLmpzIiwic3JjL2pzL2ludGVyZmFjZS9Db21wb25lbnQuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbW1hbmQuanMiLCJzcmMvanMvaW52b2tlci5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5JbWFnZUVkaXRvcicsIHJlcXVpcmUoJy4vc3JjL2pzL2ltYWdlRWRpdG9yJyksIHRydWUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBDcm9wem9uZSA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbi9jcm9wem9uZScpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBNT1VTRV9NT1ZFX1RIUkVTSE9MRCA9IDEwO1xuXG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgY2xhbXAgPSB1dGlsLmNsYW1wO1xuXG4vKipcbiAqIENyb3BwZXIgY29tcG9uZW50c1xuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgQ3JvcHBlclxuICovXG52YXIgQ3JvcHBlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBDcm9wcGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge0Nyb3B6b25lfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFggb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WSBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRZID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogbGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBIYW5kbGVyIGhhc2ggZm9yIGZhYnJpYyBjYW52YXNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZW1vdmU6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZU1vdmUsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2V1cDogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlVXAsIHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuQ1JPUFBFUixcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICh0aGlzLl9jcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBuZXcgQ3JvcHpvbmUoe1xuICAgICAgICAgICAgbGVmdDogLTEwLFxuICAgICAgICAgICAgdG9wOiAtMTAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcblxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vkb3duIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VEb3duOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjb29yZDtcblxuICAgICAgICBpZiAoZkV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBjb29yZCA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcblxuICAgICAgICB0aGlzLl9zdGFydFggPSBjb29yZC54O1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBjb29yZC55O1xuXG4gICAgICAgIGNhbnZhcy5vbih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiB0aGlzLl9saXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZW1vdmUgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZU1vdmU6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG4gICAgICAgIHZhciB4ID0gcG9pbnRlci54O1xuICAgICAgICB2YXIgeSA9IHBvaW50ZXIueTtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG5cbiAgICAgICAgaWYgKGFicyh4IC0gdGhpcy5fc3RhcnRYKSArIGFicyh5IC0gdGhpcy5fc3RhcnRZKSA+IE1PVVNFX01PVkVfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNyb3B6b25lLnNldCh0aGlzLl9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludCh4LCB5KSk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQoY3JvcHpvbmUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZWN0IGRpbWVuc2lvbiBzZXR0aW5nIGZyb20gQ2FudmFzLU1vdXNlLVBvc2l0aW9uKHgsIHkpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBDYW52YXMtTW91c2UtUG9zaXRpb24geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHdpZHRoID0gY2FudmFzLmdldFdpZHRoKCk7XG4gICAgICAgIHZhciBoZWlnaHQgPSBjYW52YXMuZ2V0SGVpZ2h0KCk7XG4gICAgICAgIHZhciBzdGFydFggPSB0aGlzLl9zdGFydFg7XG4gICAgICAgIHZhciBzdGFydFkgPSB0aGlzLl9zdGFydFk7XG4gICAgICAgIHZhciBsZWZ0ID0gY2xhbXAoeCwgMCwgc3RhcnRYKTtcbiAgICAgICAgdmFyIHRvcCA9IGNsYW1wKHksIDAsIHN0YXJ0WSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCBzdGFydFgsIHdpZHRoKSAtIGxlZnQsIC8vIChzdGFydFggPD0geChtb3VzZSkgPD0gY2FudmFzV2lkdGgpIC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgc3RhcnRZLCBoZWlnaHQpIC0gdG9wIC8vIChzdGFydFkgPD0geShtb3VzZSkgPD0gY2FudmFzSGVpZ2h0KSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNldXAgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QoY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub2ZmKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IGxpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3JvcHBlZCBpbWFnZSBkYXRhXG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q3JvcHBlZEltYWdlRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgY3JvcEluZm87XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JvcEluZm8gPSB7XG4gICAgICAgICAgICBsZWZ0OiBjcm9wem9uZS5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3A6IGNyb3B6b25lLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGg6IGNyb3B6b25lLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGNyb3B6b25lLmdldEhlaWdodCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlTmFtZTogdGhpcy5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgIHVybDogdGhpcy5nZXRDYW52YXMoKS50b0RhdGFVUkwoY3JvcEluZm8pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlIGZsaXAgbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBGbGlwXG4gKiBAY2xhc3MgRmxpcFxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKi9cbnZhciBGbGlwID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEZsaXAucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLkZMSVAsXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBmbGlwIHNldHRpbmdzXG4gICAgICogQHJldHVybnMge3tmbGlwWDogQm9vbGVhbiwgZmxpcFk6IEJvb2xlYW59fVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRTZXR0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmbGlwWDogY2FudmFzSW1hZ2UuZmxpcFgsXG4gICAgICAgICAgICBmbGlwWTogY2FudmFzSW1hZ2UuZmxpcFlcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGZsaXBYLCBmbGlwWVxuICAgICAqIEBwYXJhbSB7e2ZsaXBYOiA/Qm9vbGVhbiwgZmxpcFk6ID9Cb29sZWFufX0gZmxpcFNldHRpbmcgLSBGbGlwIHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24oZmxpcFNldHRpbmcpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgIGZsaXBTZXR0aW5nLmZsaXBYID0gISEoZmxpcFNldHRpbmcuZmxpcFgpO1xuICAgICAgICBmbGlwU2V0dGluZy5mbGlwWSA9ICEhKGZsaXBTZXR0aW5nLmZsaXBZKTtcbiAgICAgICAgaWYgKGZsaXBTZXR0aW5nLmZsaXBYID09PSBjdXJyZW50LmZsaXBYICYmIGZsaXBTZXR0aW5nLmZsaXBZID09PSBjdXJyZW50LmZsaXBZKSB7XG4gICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmxpcFNldHRpbmcgPSB0dWkudXRpbC5leHRlbmQoY3VycmVudCwgZmxpcFNldHRpbmcpO1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZVByb3BlcnRpZXMoZmxpcFNldHRpbmcsIHRydWUpO1xuICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKGZsaXBTZXR0aW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwIHNldHRpbmdzXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh7XG4gICAgICAgICAgICBmbGlwWDogZmFsc2UsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgZmxpcFg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnRvZ2dsZUltYWdlUHJvcGVydGllcyhbJ2ZsaXBYJ10sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZSh0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHlcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy50b2dnbGVJbWFnZVByb3BlcnRpZXMoWydmbGlwWSddLCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUodGhpcy5nZXRDdXJyZW50U2V0dGluZygpKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbGlwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgaW1hZ2VPcHRpb24gPSB7XG4gICAgcGFkZGluZzogMCxcbiAgICBjcm9zc09yaWdpbjogJydcbn07XG5cbi8qKlxuICogSW1hZ2VMb2FkZXIgY29tcG9uZW50c1xuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBJbWFnZUxvYWRlclxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqL1xudmFyIEltYWdlTG9hZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEltYWdlTG9hZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVIsXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBpbWFnZU5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfHN0cmluZyl9IGltZyAtIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGpxRGVmZXIsIGNhbnZhcztcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7IC8vIEJhY2sgdG8gdGhlIGluaXRpYWwgc3RhdGUsIG5vdCBlcnJvci5cbiAgICAgICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICBjYW52YXMuYmFja2dyb3VuZEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZSgnJywgbnVsbCk7XG4gICAgICAgICAgICB9KS5yZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gdGhpcy5fc2V0QmFja2dyb3VuZEltYWdlKGltZykuZG9uZShmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vblN1Y2Nlc3NJbWFnZUxvYWQob0ltYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldENhbnZhc0ltYWdlKGltYWdlTmFtZSwgb0ltYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvSW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpbWFnZU9wdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU3VjY2VzcyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblN1Y2Nlc3NJbWFnZUxvYWQ6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB0aGlzLnNldENhbnZhc0Nzc0RpbWVuc2lvbih7XG4gICAgICAgICAgICBtYXJnaW46ICdhdXRvJyxcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcnLCAgLy8gTm8gaW5saW5lLWNzcyBcImhlaWdodFwiIGZvciBJRTlcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiBvSW1hZ2Uud2lkdGggKyAncHgnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiBvSW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG9JbWFnZS5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBERUZBVUxUX01BWF9XSURUSCA9IDEwMDA7XG5cbnZhciBjc3NPbmx5ID0ge2Nzc09ubHk6IHRydWV9O1xudmFyIGJhY2tzdG9yZU9ubHkgPSB7YmFja3N0b3JlT25seTogdHJ1ZX07XG4vKipcbiAqIE1haW4gY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzXG4gKi9cbnZhciBNYWluID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIE1haW4ucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljIGNhbnZhcyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNhbnZhc31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuSW1hZ2V9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9JbWFnZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltYWdlIG5hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuTUFJTixcblxuICAgIC8qKlxuICAgICAqIFRvIGRhdGEgdXJsIGZyb20gY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzICYmIHRoaXMuY2FudmFzLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMub0ltYWdlID0gb0ltYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnQgdG8gZmFicmljLkNhbnZhc1xuICAgICAqIEBwYXJhbSB7alF1ZXJ5fEVsZW1lbnR8c3RyaW5nfSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbihjYW52YXNFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXMoJChjYW52YXNFbGVtZW50KVswXSwge1xuICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICd0dWktY29tcG9uZW50LWltYWdlRWRpdG9yLWNhbnZhc0NvbnRhaW5lcidcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiAge0BsaW5rIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuQ2FudmFzLmh0bWwjc2V0RGltZW5zaW9uc31cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGNzcyBkaW1lbnNpb25cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNDc3NEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgbWF4V2lkdGggPSBwYXJzZUludChkaW1lbnNpb25bJ21heC13aWR0aCddLCAxMCk7XG4gICAgICAgIGlmIChtYXhXaWR0aCkge1xuICAgICAgICAgICAgZGltZW5zaW9uWydtYXgtd2lkdGgnXSA9IE1hdGgubWluKG1heFdpZHRoLCBERUZBVUxUX01BWF9XSURUSCkgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGNzc09ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGJhY2tzdG9yZU9ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkltYWdlLmh0bWwjc2V0fVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB2YXIgb0ltYWdlID0gdGhpcy5vSW1hZ2U7XG5cbiAgICAgICAgaWYgKCFvSW1hZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9JbWFnZS5zZXQoc2V0dGluZykuc2V0Q29vcmRzKCk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgcHJvcGVydGllcyBvZiB0aGUgaW1hZ2VcbiAgICAgKiB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5JbWFnZS5odG1sI3RvZ2dsZX1cbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwcm9wZXJ0aWVzIC0gSW1hZ2UgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICB0b2dnbGVJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdmFyIG9JbWFnZSA9IHRoaXMub0ltYWdlO1xuXG4gICAgICAgIGlmICghb0ltYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvSW1hZ2UudG9nZ2xlLmFwcGx5KG9JbWFnZSwgcHJvcGVydGllcyk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlTmFtZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2Ugcm90YXRpb24gbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBJbWFnZSBSb3RhdGlvbiBjb21wb25lbnRcbiAqIEBjbGFzcyBSb3RhdGlvblxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBSb3RhdGlvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBSb3RhdGlvbi5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLlJPVEFUSU9OLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRBbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhbmdsZSBvZiB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKTtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgaWYgKGFuZ2xlID09PSBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEbyBub3QgY2FsbCBcInRoaXMuc2V0SW1hZ2VQcm9wZXJ0aWVzXCIgZm9yIHNldHRpbmcgYW5nbGUgZGlyZWN0bHkuXG4gICAgICAgICAqIEJlZm9yZSBzZXR0aW5nIGFuZ2xlLCBUaGUgb3JpZ2luWCxZIG9mIGltYWdlIHNob3VsZCBiZSBzZXQgdG8gY2VudGVyLlxuICAgICAgICAgKiAgU2VlIFwiaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbCNzZXRBbmdsZVwiXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldENhbnZhc0ltYWdlKClcbiAgICAgICAgICAgIC5zZXRBbmdsZShhbmdsZSlcbiAgICAgICAgICAgIC5zZXRDb29yZHMoKTtcbiAgICAgICAgdGhpcy5fYWRqdXN0Q2FudmFzRGltZW5zaW9uKCk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkanVzdCBjYW52YXMgZGltZW5zaW9uIGZyb20gaW1hZ2Utcm90YXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCksXG4gICAgICAgICAgICBib3VuZGluZ1JlY3QgPSBjYW52YXNJbWFnZS5nZXRCb3VuZGluZ1JlY3QoKTtcblxuICAgICAgICAvLyBCb3VuZGluZ1JlY3QgZGltZW5zaW9ucyArMSwgc28gdGhhdCBkb24ndCBnZXQgYmx1cnJ5IGltYWdlLlxuICAgICAgICBib3VuZGluZ1JlY3Qud2lkdGggPSBNYXRoLmZsb29yKGJvdW5kaW5nUmVjdC53aWR0aCkgKyAxO1xuICAgICAgICBib3VuZGluZ1JlY3QuaGVpZ2h0ID0gTWF0aC5mbG9vcihib3VuZGluZ1JlY3QuaGVpZ2h0KSArIDE7XG5cbiAgICAgICAgdGhpcy5zZXRDYW52YXNDc3NEaW1lbnNpb24oe1xuICAgICAgICAgICAgJ21heC13aWR0aCc6IGJvdW5kaW5nUmVjdC53aWR0aCArICdweCdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiBib3VuZGluZ1JlY3Qud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdW5kaW5nUmVjdC5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ2V0Q2FudmFzKCkuY2VudGVyT2JqZWN0KGNhbnZhc0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoZSBpbWFnZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhZGRpdGlvbmFsQW5nbGUgLSBBZGRpdGlvbmFsIGFuZ2xlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByb3RhdGU6IGZ1bmN0aW9uKGFkZGl0aW9uYWxBbmdsZSkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKS5hbmdsZTtcblxuICAgICAgICAvLyBUaGUgYW5nbGUgaXMgbG93ZXIgdGhhbiAyKlBJKD09PTM2MCBkZWdyZWVzKVxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBbmdsZSgoY3VycmVudCArIGFkZGl0aW9uYWxBbmdsZSkgJSAzNjApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdGF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb21wb25lbnROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdNQUlOJyxcbiAgICAgICAgJ0lNQUdFX0xPQURFUicsXG4gICAgICAgICdDUk9QUEVSJyxcbiAgICAgICAgJ0ZMSVAnLFxuICAgICAgICAnUk9UQVRJT04nXG4gICAgKSxcblxuICAgIGNvbW1hbmROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdMT0FEX0lNQUdFJyxcbiAgICAgICAgJ0ZMSVBfSU1BR0UnLFxuICAgICAgICAnUk9UQVRFX0lNQUdFJ1xuICAgICksXG5cbiAgICBldmVudE5hbWVzOiB7XG4gICAgICAgIExPQURfSU1BR0U6ICdsb2FkSW1hZ2UnLFxuICAgICAgICBDTEVBUl9JTUFHRTogJ2NsZWFySW1hZ2UnLFxuICAgICAgICBTVEFSVF9DUk9QUElORzogJ3N0YXJ0Q3JvcHBpbmcnLFxuICAgICAgICBFTkRfQ1JPUFBJTkc6ICdlbmRDcm9wcGluZycsXG4gICAgICAgIEZMSVBfSU1BR0U6ICdmbGlwSW1hZ2UnLFxuICAgICAgICBST1RBVEVfSU1BR0U6ICdyb3RhdGVJbWFnZScsXG4gICAgICAgIEVNUFRZX1JFRE9fU1RBQ0s6ICdlbXB0eVJlZG9TdGFjaycsXG4gICAgICAgIEVNUFRZX1VORE9fU1RBQ0s6ICdlbXB0eVVuZG9TdGFjaycsXG4gICAgICAgIFBVU0hfVU5ET19TVEFDSzogJ3B1c2hVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1JFRE9fU1RBQ0s6ICdwdXNoUmVkb1N0YWNrJ1xuICAgIH0sXG5cbiAgICBJU19TVVBQT1JUX0ZJTEVfQVBJOiAhISh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkZpbGVSZWFkZXIpXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2xhbXAgPSByZXF1aXJlKCcuLi91dGlsJykuY2xhbXA7XG5cbnZhciBDT1JORVJfVFlQRV9UT1BfTEVGVCA9ICd0bCc7XG52YXIgQ09STkVSX1RZUEVfVE9QX1JJR0hUID0gJ3RyJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfVE9QID0gJ210JztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfTEVGVCA9ICdtbCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUID0gJ21yJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NID0gJ21iJztcbnZhciBDT1JORVJfVFlQRV9CT1RUT01fTEVGVCA9ICdibCc7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUID0gJ2JyJztcblxuLyoqXG4gKiBDcm9wem9uZSBvYmplY3RcbiAqIElzc3VlOiBJRTcsIDgod2l0aCBleGNhbnZhcylcbiAqICAtIENyb3B6b25lIGlzIGEgYmxhY2sgem9uZSB3aXRob3V0IHRyYW5zcGFyZW5jeS5cbiAqIEBjbGFzcyBDcm9wem9uZVxuICogQGV4dGVuZHMge2ZhYnJpYy5SZWN0fVxuICovXG52YXIgQ3JvcHpvbmUgPSBmYWJyaWMudXRpbC5jcmVhdGVDbGFzcyhmYWJyaWMuUmVjdCwgLyoqIEBsZW5kcyBDcm9wem9uZS5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLmNhbGxTdXBlcignaW5pdGlhbGl6ZScsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9uKHtcbiAgICAgICAgICAgICdtb3ZpbmcnOiB0aGlzLl9vbk1vdmluZyxcbiAgICAgICAgICAgICdzY2FsaW5nJzogdGhpcy5fb25TY2FsaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgQ3JvcC16b25lXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9yZW5kZXI6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxGbGlwWCwgb3JpZ2luYWxGbGlwWSxcbiAgICAgICAgICAgIG9yaWdpbmFsU2NhbGVYLCBvcmlnaW5hbFNjYWxlWSxcbiAgICAgICAgICAgIGNyb3B6b25lRGFzaExpbmVXaWR0aCA9IDcsXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lT2Zmc2V0ID0gNztcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ19yZW5kZXInLCBjdHgpO1xuXG4gICAgICAgIC8vIENhbGMgb3JpZ2luYWwgc2NhbGVcbiAgICAgICAgb3JpZ2luYWxGbGlwWCA9IHRoaXMuZmxpcFggPyAtMSA6IDE7XG4gICAgICAgIG9yaWdpbmFsRmxpcFkgPSB0aGlzLmZsaXBZID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbFNjYWxlWCA9IG9yaWdpbmFsRmxpcFggLyB0aGlzLnNjYWxlWDtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVkgPSBvcmlnaW5hbEZsaXBZIC8gdGhpcy5zY2FsZVk7XG5cbiAgICAgICAgLy8gU2V0IG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZShvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVkpO1xuXG4gICAgICAgIC8vIFJlbmRlciBvdXRlciByZWN0XG4gICAgICAgIHRoaXMuX2ZpbGxPdXRlclJlY3QoY3R4LCAncmdiYSgwLCAwLCAwLCAwLjU1KScpO1xuXG4gICAgICAgIC8vIEJsYWNrIGRhc2ggbGluZVxuICAgICAgICB0aGlzLl9zdHJva2VCb3JkZXIoY3R4LCAncmdiKDAsIDAsIDApJywgY3JvcHpvbmVEYXNoTGluZVdpZHRoKTtcblxuICAgICAgICAvLyBXaGl0ZSBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigyNTUsIDI1NSwgMjU1KScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCwgY3JvcHpvbmVEYXNoTGluZU9mZnNldCk7XG5cbiAgICAgICAgLy8gUmVzZXQgc2NhbGVcbiAgICAgICAgY3R4LnNjYWxlKDEgLyBvcmlnaW5hbFNjYWxlWCwgMSAvIG9yaWdpbmFsU2NhbGVZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JvcHpvbmUtY29vcmRpbmF0ZXMgd2l0aCBvdXRlciByZWN0YW5nbGVcbiAgICAgKlxuICAgICAqICAgICB4MCAgICAgeDEgICAgICAgICB4MiAgICAgIHgzXG4gICAgICogIHkwICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfCAgICAvLyA8LS0tIFwiT3V0ZXItcmVjdGFuZ2xlXCJcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MSArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfCBDcm9wem9uZSB8Ly8vLy8vL3wgICAgQ3JvcHpvbmUgaXMgdGhlIFwiSW5uZXItcmVjdGFuZ2xlXCJcbiAgICAgKiAgICAgfC8vLy8vLy98ICAoMCwgMCkgIHwvLy8vLy8vfCAgICBDZW50ZXIgcG9pbnQgKDAsIDApXG4gICAgICogIHkyICstLS0tLS0tKy0tLS0tLS0tLS0rLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogIHkzICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAgICAgKlxuICAgICAqIEB0eXBlZGVmIHt7eDogQXJyYXk8bnVtYmVyPiwgeTogQXJyYXk8bnVtYmVyPn19IGNyb3B6b25lQ29vcmRpbmF0ZXNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEZpbGwgb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBmaWxsU3R5bGUgLSBGaWxsLXN0eWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsbE91dGVyUmVjdDogZnVuY3Rpb24oY3R4LCBmaWxsU3R5bGUpIHtcbiAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gdGhpcy5fZ2V0Q29vcmRpbmF0ZXMoY3R4KSxcbiAgICAgICAgICAgIHggPSBjb29yZGluYXRlcy54LFxuICAgICAgICAgICAgeSA9IGNvb3JkaW5hdGVzLnk7XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZTtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIC8vIE91dGVyIHJlY3RhbmdsZVxuICAgICAgICAvLyBOdW1iZXJzIGFyZSArLy0xIHNvIHRoYXQgb3ZlcmxheSBlZGdlcyBkb24ndCBnZXQgYmx1cnJ5LlxuICAgICAgICBjdHgubW92ZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzNdICsgMSwgeVszXSArIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzNdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFswXSAtIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIC8vIElubmVyIHJlY3RhbmdsZVxuICAgICAgICBjdHgubW92ZVRvKHhbMV0sIHlbMV0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMV0sIHlbMl0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMl0sIHlbMl0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMl0sIHlbMV0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMV0sIHlbMV0pO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvb3JkaW5hdGVzXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcmV0dXJucyB7Y3JvcHpvbmVDb29yZGluYXRlc30gLSB7QGxpbmsgY3JvcHpvbmVDb29yZGluYXRlc31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb29yZGluYXRlczogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBjZWlsID0gTWF0aC5jZWlsLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgaGFsZldpZHRoID0gd2lkdGggLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IGhlaWdodCAvIDIsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgY2FudmFzRWwgPSBjdHguY2FudmFzOyAvLyBjYW52YXMgZWxlbWVudCwgbm90IGZhYnJpYyBvYmplY3RcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogdHVpLnV0aWwubWFwKFtcbiAgICAgICAgICAgICAgICAtKGhhbGZXaWR0aCArIGxlZnQpLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgwXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGgpLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MVxuICAgICAgICAgICAgICAgIGhhbGZXaWR0aCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDJcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGggKyAoY2FudmFzRWwud2lkdGggLSBsZWZ0IC0gd2lkdGgpIC8vIHgzXG4gICAgICAgICAgICBdLCBjZWlsKSxcbiAgICAgICAgICAgIHk6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0ICsgdG9wKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTBcbiAgICAgICAgICAgICAgICAtKGhhbGZIZWlnaHQpLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MVxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkyXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCArIChjYW52YXNFbC5oZWlnaHQgLSB0b3AgLSBoZWlnaHQpICAgLy8geTNcbiAgICAgICAgICAgIF0sIGNlaWwpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0cm9rZSBib3JkZXJcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59IHN0cm9rZVN0eWxlIC0gU3Ryb2tlLXN0eWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVEYXNoV2lkdGggLSBEYXNoIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtsaW5lRGFzaE9mZnNldF0gLSBEYXNoIG9mZnNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3N0cm9rZUJvcmRlcjogZnVuY3Rpb24oY3R4LCBzdHJva2VTdHlsZSwgbGluZURhc2hXaWR0aCwgbGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgdmFyIGhhbGZXaWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSAvIDI7XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGU7XG4gICAgICAgIGlmIChjdHguc2V0TGluZURhc2gpIHtcbiAgICAgICAgICAgIGN0eC5zZXRMaW5lRGFzaChbbGluZURhc2hXaWR0aCwgbGluZURhc2hXaWR0aF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lRGFzaE9mZnNldCkge1xuICAgICAgICAgICAgY3R4LmxpbmVEYXNoT2Zmc2V0ID0gbGluZURhc2hPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oLWhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3ZpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMuZ2V0VG9wKCksXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCksXG4gICAgICAgICAgICBtYXhMZWZ0ID0gY2FudmFzLmdldFdpZHRoKCkgLSB3aWR0aCxcbiAgICAgICAgICAgIG1heFRvcCA9IGNhbnZhcy5nZXRIZWlnaHQoKSAtIGhlaWdodDtcblxuICAgICAgICB0aGlzLnNldExlZnQoY2xhbXAobGVmdCwgMCwgbWF4TGVmdCkpO1xuICAgICAgICB0aGlzLnNldFRvcChjbGFtcCh0b3AsIDAsIG1heFRvcCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvblNjYWxpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3tlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25TY2FsaW5nOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSB0aGlzLmNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdGhpcy5fY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlcik7XG5cbiAgICAgICAgLy8gT24gc2NhbGluZyBjcm9wem9uZSxcbiAgICAgICAgLy8gY2hhbmdlIHJlYWwgd2lkdGggYW5kIGhlaWdodCBhbmQgZml4IHNjYWxlRmFjdG9yIHRvIDFcbiAgICAgICAgdGhpcy5zY2FsZSgxKS5zZXQoc2V0dGluZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxlZCBzaXplIGZyb20gbW91c2UgcG9pbnRlciB3aXRoIHNlbGVjdGVkIGNvcm5lclxuICAgICAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gcG9pbnRlciAtIE1vdXNlIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gSGF2aW5nIGxlZnQgb3IoYW5kKSB0b3Agb3IoYW5kKSB3aWR0aCBvcihhbmQpIGhlaWdodC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjU2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24ocG9pbnRlcikge1xuICAgICAgICB2YXIgcG9pbnRlclggPSBwb2ludGVyLngsXG4gICAgICAgICAgICBwb2ludGVyWSA9IHBvaW50ZXIueSxcbiAgICAgICAgICAgIHRsU2NhbGluZ1NpemUgPSB0aGlzLl9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlclgsIHBvaW50ZXJZKSxcbiAgICAgICAgICAgIGJyU2NhbGluZ1NpemUgPSB0aGlzLl9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogQHRvZG86IOydvOuwmCDqsJ3ssrTsl5DshJwgc2hpZnQg7KGw7ZWp7YKk66W8IOuIhOultOuptCBmcmVlIHNpemUgc2NhbGluZ+ydtCDrkKggLS0+IO2ZleyduO2VtOuzvOqyg1xuICAgICAgICAgKiAgICAgIGNhbnZhcy5jbGFzcy5qcyAvLyBfc2NhbGVPYmplY3Q6IGZ1bmN0aW9uKC4uLil7Li4ufVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTY2FsaW5nU2V0dGluZ3ModGxTY2FsaW5nU2l6ZSwgYnJTY2FsaW5nU2l6ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGluZyBzaXplKHBvc2l0aW9uICsgZGltZW5zaW9uKSBmcm9tIGxlZnQtdG9wIGNvcm5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gTW91c2UgcG9zaXRpb24gWFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gTW91c2UgcG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNUb3BMZWZ0U2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgYm90dG9tID0gdGhpcy5nZXRIZWlnaHQoKSArIHRoaXMudG9wLFxuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLmdldFdpZHRoKCkgKyB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSBjbGFtcCh5LCAwLCBib3R0b20gLSAxKSwgIC8vIDAgPD0gdG9wIDw9IChib3R0b20gLSAxKVxuICAgICAgICAgICAgbGVmdCA9IGNsYW1wKHgsIDAsIHJpZ2h0IC0gMSk7ICAvLyAwIDw9IGxlZnQgPD0gKHJpZ2h0IC0gMSlcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJUb3AtTGVmdCBjb3JuZXJcIjogSXQgZml4ZXMgcmlnaHQgYW5kIGJvdHRvbSBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgd2lkdGg6IHJpZ2h0IC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogYm90dG9tIC0gdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGluZyBzaXplIGZyb20gcmlnaHQtYm90dG9tIGNvcm5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gTW91c2UgcG9zaXRpb24gWFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gTW91c2UgcG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNCb3R0b21SaWdodFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgbWF4WCA9IGNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIG1heFkgPSBjYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMudG9wO1xuXG4gICAgICAgIC8vIFdoZW4gc2NhbGluZyBcIkJvdHRvbS1SaWdodCBjb3JuZXJcIjogSXQgZml4ZXMgbGVmdCBhbmQgdG9wIGNvb3JkaW5hdGVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogY2xhbXAoeCwgKGxlZnQgKyAxKSwgbWF4WCkgLSBsZWZ0LCAgICAvLyAod2lkdGggPSB4IC0gbGVmdCksIChsZWZ0ICsgMSA8PSB4IDw9IG1heFgpXG4gICAgICAgICAgICBoZWlnaHQ6IGNsYW1wKHksICh0b3AgKyAxKSwgbWF4WSkgLSB0b3AgICAgICAvLyAoaGVpZ2h0ID0geSAtIHRvcCksICh0b3AgKyAxIDw9IHkgPD0gbWF4WSlcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyplc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5Ki9cbiAgICAvKipcbiAgICAgKiBNYWtlIHNjYWxpbmcgc2V0dGluZ3NcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRsIC0gVG9wLUxlZnQgc2V0dGluZ1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYnIgLSBCb3R0b20tUmlnaHQgc2V0dGluZ1xuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6ID9udW1iZXIsIGhlaWdodDogP251bWJlciwgbGVmdDogP251bWJlciwgdG9wOiA/bnVtYmVyfX0gUG9zaXRpb24gc2V0dGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTY2FsaW5nU2V0dGluZ3M6IGZ1bmN0aW9uKHRsLCBicikge1xuICAgICAgICB2YXIgdGxXaWR0aCA9IHRsLndpZHRoLFxuICAgICAgICAgICAgdGxIZWlnaHQgPSB0bC5oZWlnaHQsXG4gICAgICAgICAgICBickhlaWdodCA9IGJyLmhlaWdodCxcbiAgICAgICAgICAgIGJyV2lkdGggPSBici53aWR0aCxcbiAgICAgICAgICAgIHRsTGVmdCA9IHRsLmxlZnQsXG4gICAgICAgICAgICB0bFRvcCA9IHRsLnRvcCxcbiAgICAgICAgICAgIHNldHRpbmdzO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5fX2Nvcm5lcikge1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9UT1BfTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9UT1BfUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBicldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRsVG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0bFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0bExlZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9CT1RUT01fUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSBicjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0bFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0bExlZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfVE9QOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRsVG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9CT1RUT006XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYnJIZWlnaHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9LCAvKmVzbGludC1lbmFibGUgY29tcGxleGl0eSovXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHdoZXRoZXIgdGhpcyBjcm9wem9uZSBpcyB2YWxpZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzVmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy5sZWZ0ID49IDAgJiZcbiAgICAgICAgICAgIHRoaXMudG9wID49IDAgJiZcbiAgICAgICAgICAgIHRoaXMud2lkdGggPiAwICYmXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA+IDBcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wem9uZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbW1hbmQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgY29tcG9uZW50TmFtZXMgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG52YXIgY29tbWFuZE5hbWVzID0gY29uc3RzLmNvbW1hbmROYW1lcztcbnZhciBjcmVhdG9ycyA9IHt9O1xuXG52YXIgSU1BR0VfTE9BREVSID0gY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSO1xudmFyIEZMSVAgPSBjb21wb25lbnROYW1lcy5GTElQO1xudmFyIFJPVEFUSU9OID0gY29tcG9uZW50TmFtZXMuUk9UQVRJT047XG5cbi8qKlxuICogU2V0IG1hcHBpbmcgY3JlYXRvcnNcbiAqL1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkxPQURfSU1BR0VdID0gY3JlYXRlTG9hZEltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5GTElQX0lNQUdFXSA9IGNyZWF0ZUZsaXBJbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuUk9UQVRFX0lNQUdFXSA9IGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBJbWFnZSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gSW1hZ2UgdXJsXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9hZEltYWdlQ29tbWFuZChpbWFnZU5hbWUsIHVybCkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB7XG4gICAgICAgICAgICAgICAgcHJldk5hbWU6IGxvYWRlci5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgICAgICBwcmV2SW1hZ2U6IGxvYWRlci5nZXRDYW52YXNJbWFnZSgpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoaW1hZ2VOYW1lLCB1cmwpO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcblxuICAgICAgICAgICAgcmV0dXJuIGxvYWRlci5sb2FkKHN0b3JlLnByZXZOYW1lLCBzdG9yZS5wcmV2SW1hZ2UpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAnZmxpcFgnIG9yICdmbGlwWScgb3IgJ3Jlc2V0J1xuICogQHJldHVybnMgeyQuRGVmZXJyZWR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZsaXBJbWFnZUNvbW1hbmQodHlwZSkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmbGlwQ29tcCA9IGNvbXBNYXBbRkxJUF07XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSBmbGlwQ29tcC5nZXRDdXJyZW50U2V0dGluZygpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmxpcENvbXBbdHlwZV0oKTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGZsaXBDb21wID0gY29tcE1hcFtGTElQXTtcblxuICAgICAgICAgICAgcmV0dXJuIGZsaXBDb21wLnNldCh0aGlzLnN0b3JlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIEFuZ2xlIHZhbHVlIHRvIHJvdGF0ZVxuICogQHJldHVybnMgeyQuRGVmZXJyZWR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kKGFuZ2xlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gcm90YXRpb25Db21wLmdldEN1cnJlbnRBbmdsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wLnJvdGF0ZShhbmdsZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciByb3RhdGlvbkNvbXAgPSBjb21wTWFwW1JPVEFUSU9OXTtcblxuICAgICAgICAgICAgcmV0dXJuIHJvdGF0aW9uQ29tcC5zZXRBbmdsZSh0aGlzLnN0b3JlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBjb21tYW5kXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbW1hbmQgbmFtZVxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gQXJndW1lbnRzIGZvciBjcmVhdGluZyBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIGFyZ3MpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHJldHVybiBjcmVhdG9yc1tuYW1lXS5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleU1pcnJvciA9IHJlcXVpcmUoJy4uL3V0aWwnKS5rZXlNaXJyb3I7XG5cbnZhciB0eXBlcyA9IGtleU1pcnJvcihcbiAgICAnVU5fSU1QTEVNRU5UQVRJT04nLFxuICAgICdOT19DT01QT05FTlRfTkFNRSdcbik7XG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogJ1Nob3VsZCBpbXBsZW1lbnQgYSBtZXRob2Q6ICcsXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6ICdTaG91bGQgc2V0IGEgY29tcG9uZW50IG5hbWUnXG59O1xuXG52YXIgbWFwID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiBmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5VTl9JTVBMRU1FTlRBVElPTiArIG1ldGhvZE5hbWU7XG4gICAgfSxcbiAgICBOT19DT01QT05FTlRfTkFNRTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5OT19DT01QT05FTlRfTkFNRTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0eXBlczogdHVpLnV0aWwuZXh0ZW5kKHt9LCB0eXBlcyksXG5cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGZ1bmM7XG5cbiAgICAgICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZnVuYyA9IG1hcFt0eXBlXTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFyZ3VtZW50cyk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW52b2tlciA9IHJlcXVpcmUoJy4vaW52b2tlcicpO1xudmFyIGNvbW1hbmRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5L2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgZXZlbnRzID0gY29uc3RzLmV2ZW50TmFtZXM7XG52YXIgY29tbWFuZHMgPSBjb25zdHMuY29tbWFuZE5hbWVzO1xudmFyIGNvbXBMaXN0ID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xuXG4vKipcbiAqIEltYWdlIGVkaXRvclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ3xqUXVlcnl8SFRNTEVsZW1lbnR9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICovXG52YXIgSW1hZ2VFZGl0b3IgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEltYWdlRWRpdG9yLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXNFbGVtZW50KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbm92a2VyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtJbnZva2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlciA9IG5ldyBJbnZva2VyKCk7XG5cbiAgICAgICAgdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpLnNldENhbnZhc0VsZW1lbnQoY2FudmFzRWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBldmVudCBuYW1lc1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RXZlbnROYW1lczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5leHRlbmQoe30sIGV2ZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgbWFpbiBjb21wb25lbnRcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fSBNYWluIGNvbXBvbmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE1haW5Db21wb25lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0Lk1BSU4pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcG9uZW50OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2VyLmdldENvbXBvbmVudChuYW1lKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIGFjdGlvbnNcbiAgICAgKi9cbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kQ3JvcHBpbmcoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLmludm9rZShjb21tYW5kKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLl9pbnZva2VyLmlzRW1wdHlVbmRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuUFVTSF9VTkRPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuRU1QVFlfUkVET19TVEFDSyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnZva2VyID0gdGhpcy5faW52b2tlcjtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgaW52b2tlci51bmRvKCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChpbnZva2VyLmlzRW1wdHlVbmRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuRU1QVFlfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLlBVU0hfUkVET19TVEFDSyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWRvXG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnZva2VyID0gdGhpcy5faW52b2tlcjtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgaW52b2tlci5yZWRvKCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChpbnZva2VyLmlzRW1wdHlSZWRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuRU1QVFlfUkVET19TVEFDSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gZmlsZVxuICAgICAqIEBwYXJhbSB7RmlsZX0gaW1nRmlsZSAtIEltYWdlIGZpbGVcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tRmlsZTogZnVuY3Rpb24oaW1nRmlsZSkge1xuICAgICAgICBpZiAoIWltZ0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChcbiAgICAgICAgICAgIGltZ0ZpbGUubmFtZSxcbiAgICAgICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwoaW1nRmlsZSlcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBpbWFnZU5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gRmlsZSB1cmxcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tVVJMOiBmdW5jdGlvbihpbWFnZU5hbWUsIHVybCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjYWxsYmFjaywgY29tbWFuZDtcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSB8fCAhdXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayA9ICQucHJveHkodGhpcy5fY2FsbGJhY2tBZnRlckltYWdlTG9hZGluZywgdGhpcyk7XG4gICAgICAgIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuTE9BRF9JTUFHRSwgaW1hZ2VOYW1lLCB1cmwpXG4gICAgICAgICAgICAuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuQ0xFQVJfSU1BR0UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBhZnRlciBpbWFnZSBsb2FkaW5nXG4gICAgICogQHBhcmFtIHs/ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBJbWFnZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIF9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nOiBmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQgPSB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCk7XG4gICAgICAgIHZhciAkY2FudmFzRWxlbWVudCA9ICQobWFpbkNvbXBvbmVudC5nZXRDYW52YXNFbGVtZW50KCkpO1xuXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuTE9BRF9JTUFHRSwge1xuICAgICAgICAgICAgb3JpZ2luYWxXaWR0aDogb0ltYWdlLndpZHRoLFxuICAgICAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IG9JbWFnZS5oZWlnaHQsXG4gICAgICAgICAgICBjdXJyZW50V2lkdGg6ICRjYW52YXNFbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgICBjdXJyZW50SGVpZ2h0OiAkY2FudmFzRWxlbWVudC5oZWlnaHQoKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydENyb3BwaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3BwZXIgPSB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuQ1JPUFBFUik7XG5cbiAgICAgICAgY3JvcHBlci5zdGFydCgpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLlNUQVJUX0NST1BQSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0FwcGx5aW5nXSAtIFdoZXRoZXIgdGhlIGNyb3BwaW5nIGlzIGFwcGxpZWQgb3IgY2FuY2VsZWRcbiAgICAgKi9cbiAgICBlbmRDcm9wcGluZzogZnVuY3Rpb24oaXNBcHBseWluZykge1xuICAgICAgICB2YXIgY3JvcHBlciA9IHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5DUk9QUEVSKTtcbiAgICAgICAgdmFyIGRhdGEgPSBjcm9wcGVyLmVuZChpc0FwcGx5aW5nKTtcblxuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9DUk9QUElORyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoZGF0YS5pbWFnZU5hbWUsIGRhdGEudXJsKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAnZmxpcFgnIG9yICdmbGlwWScgb3IgJ3Jlc2V0J1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZsaXA6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5GTElQX0lNQUdFKTtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuRkxJUF9JTUFHRSwgdHlwZSlcbiAgICAgICAgICAgIC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICovXG4gICAgZmxpcFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdmbGlwWScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwXG4gICAgICovXG4gICAgcmVzZXRGbGlwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgncmVzZXQnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgdG8gcm90YXRlIGltYWdlXG4gICAgICovXG4gICAgcm90YXRlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLlJPVEFURV9JTUFHRSk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJPVEFURV9JTUFHRSwgYW5nbGUpXG4gICAgICAgICAgICAuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEEgRE9NU3RyaW5nIGluZGljYXRpbmcgdGhlIGltYWdlIGZvcm1hdC4gVGhlIGRlZmF1bHQgdHlwZSBpcyBpbWFnZS9wbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQSBET01TdHJpbmcgY29udGFpbmluZyB0aGUgcmVxdWVzdGVkIGRhdGEgVVJJLlxuICAgICAqL1xuICAgIHRvRGF0YVVSTDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkuZ2V0SW1hZ2VOYW1lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclVuZG9TdGFjaygpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEltYWdlRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29tcG9uZW50IGludGVyZmFjZVxuICogQGNsYXNzXG4gKi9cbnZhciBDb21wb25lbnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENvbXBvbmVudC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzSW1hZ2UobmFtZSwgb0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhc0VsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIGVkaXRvclxuICAgICAqIEByZXR1cm5zIHtJbWFnZUVkaXRvcn1cbiAgICAgKi9cbiAgICBnZXRFZGl0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0RWRpdG9yKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBjb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbWFnZSBwcm9wZXJ0aWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmcgLSBJbWFnZSBwcm9wZXJ0aWVzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbd2l0aFJlbmRlcmluZ10gLSBJZiB0cnVlLCBUaGUgY2hhbmdlZCBpbWFnZSB3aWxsIGJlIHJlZmxlY3RlZCBpbiB0aGUgY2FudmFzXG4gICAgICovXG4gICAgc2V0SW1hZ2VQcm9wZXJ0aWVzOiBmdW5jdGlvbihzZXR0aW5nLCB3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldEltYWdlUHJvcGVydGllcyhzZXR0aW5nLCB3aXRoUmVuZGVyaW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIHByb3BlcnRpZXMgb2YgdGhlIGltYWdlXG4gICAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcHJvcGVydGllcyAtIEltYWdlIHByb3BlcnR5IG5hbWVzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbd2l0aFJlbmRlcmluZ10gLSBJZiB0cnVlLCBUaGUgY2hhbmdlZCBpbWFnZSB3aWxsIGJlIHJlZmxlY3RlZCBpbiB0aGUgY2FudmFzXG4gICAgICovXG4gICAgdG9nZ2xlSW1hZ2VQcm9wZXJ0aWVzOiBmdW5jdGlvbihwcm9wZXJ0aWVzLCB3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnRvZ2dsZUltYWdlUHJvcGVydGllcyhwcm9wZXJ0aWVzLCB3aXRoUmVuZGVyaW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBjc3Mgb25seVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgY3NzIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHNldENhbnZhc0Nzc0RpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldENhbnZhc0Nzc0RpbWVuc2lvbihkaW1lbnNpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKGRpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudHxudWxsfSBwYXJlbnQgLSBQYXJlbnRcbiAgICAgKi9cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKSxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cblxuICAgICAgICB3aGlsZSAobmV4dCkge1xuICAgICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVycm9yTWVzc2FnZSA9IHJlcXVpcmUoJy4uL2ZhY3RvcnkvZXJyb3JNZXNzYWdlJyk7XG5cbnZhciBjcmVhdGVNZXNzYWdlID0gZXJyb3JNZXNzYWdlLmNyZWF0ZSxcbiAgICBlcnJvclR5cGVzID0gZXJyb3JNZXNzYWdlLnR5cGVzO1xuXG4vKipcbiAqIENvbW1hbmQgY2xhc3NcbiAqIEBjbGFzc1xuICogQHBhcmFtIHt7ZXhlY3V0ZTogZnVuY3Rpb24sIHVuZG86IGZ1bmN0aW9ufX0gYWN0aW9ucyAtIENvbW1hbmQgYWN0aW9uc1xuICovXG52YXIgQ29tbWFuZCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tbWFuZC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oYWN0aW9ucykge1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhlY3V0ZSBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4ZWN1dGUgPSBhY3Rpb25zLmV4ZWN1dGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gZnVuY3Rpb25cbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvID0gYWN0aW9ucy51bmRvO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBleGVjdXRlQ2FsbGJhY2tcbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4ZWN1dGVDYWxsYmFjayA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHVuZG9DYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kb0NhbGxiYWNrID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhY3Rpb25cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBleGVjdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoZXJyb3JUeXBlcy5VTl9JTVBMRU1FTlRBVElPTiwgJ2V4ZWN1dGUnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG8gYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICd1bmRvJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXhlY3V0ZSBjYWxsYWJja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgYWZ0ZXIgZXhlY3V0aW9uXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRFeGVjdXRlQ2FsbGJhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZXhlY3V0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCB1bmRvIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBhZnRlciB1bmRvXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRVbmRvQ2FsbGJhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMudW5kb0NhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaW1hZ2VMb2FkZXInKTtcbnZhciBDcm9wcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvY3JvcHBlcicpO1xudmFyIE1haW5Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9tYWluJyk7XG52YXIgRmxpcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ZsaXAnKTtcbnZhciBSb3RhdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50L3JvdGF0aW9uJyk7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbnZva2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVkb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbXBvbmVudCBtYXBcbiAgICAgICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXAgPSB7fTtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb21wb25lbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjb21wb25lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtYWluID0gbmV3IE1haW5Db21wb25lbnQoKTtcblxuICAgICAgICB0aGlzLl9yZWdpc3RlcihtYWluKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEltYWdlTG9hZGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IENyb3BwZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRmxpcChtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBSb3RhdGlvbihtYWluKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgLSBDb21wb25lbnQgaGFuZGxpbmcgdGhlIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXBbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBnZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLmNvbXBvbmVudE1hcCkpXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIHNlbGYuY2xlYXJSZWRvU3RhY2soKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGVDYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy51bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGpxRGVmZXI7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLndoZW4oY29tbWFuZC51bmRvKHRoaXMuY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgICAgICAuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKGNvbW1hbmQudW5kb0NhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLkRlZmVycmVkKCkucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLnJlZG9TdGFjay5wb3AoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAganFEZWZlciA9ICQud2hlbihjb21tYW5kLmV4ZWN1dGUodGhpcy5jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoY29tbWFuZC5leGVjdXRlQ2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoKS5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgcmVkb1N0YWNrIGlzIGVtcHR5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNFbXB0eVJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHRoZSB1bmRvU3RhY2sgaXMgZW1wdHlcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0VtcHR5VW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5kb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnVuZG9TdGFjayA9IFtdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVkb1N0YWNrID0gW107XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52b2tlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbiA9IE1hdGgubWluLFxuICAgIG1heCA9IE1hdGgubWF4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBDbGFtcCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pblZhbHVlIC0gTWluaW11bSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhWYWx1ZSAtIE1heGltdW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjbGFtcGVkIHZhbHVlXG4gICAgICovXG4gICAgY2xhbXA6IGZ1bmN0aW9uKHZhbHVlLCBtaW5WYWx1ZSwgbWF4VmFsdWUpIHtcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIGlmIChtaW5WYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICB0ZW1wID0gbWluVmFsdWU7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IG1heFZhbHVlO1xuICAgICAgICAgICAgbWF4VmFsdWUgPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1heChtaW5WYWx1ZSwgbWluKHZhbHVlLCBtYXhWYWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGtleS12YWx1ZSBvYmplY3QgZnJvbSBhcmd1bWVudHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAga2V5TWlycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIG9ialtrZXldID0ga2V5O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbn07XG4iXX0=
