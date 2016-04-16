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
     * @param {{flipX: ?Boolean, flipY: ?Boolean}} newSetting - Flip setting
     * @returns {jQuery.Deferred}
     */
    set: function(newSetting) {
        var setting = this.getCurrentSetting();
        var jqDefer = $.Deferred();
        var isChangingFlipX = (setting.flipX !== !!newSetting.flipX);
        var isChangingFlipY = (setting.flipY !== !!newSetting.flipY);
        var angle;

        if (!isChangingFlipX && !isChangingFlipY) {
            return jqDefer.reject();
        }

        if (isChangingFlipX) {
            angle = this._negateAngle();
        }
        if (isChangingFlipY) {
            angle = this._negateAngle();
        }
        tui.util.extend(setting, newSetting);
        this.setImageProperties(setting, true);

        return jqDefer.resolve(setting, angle);
    },

    /**
     * Negate angle for flip
     * @returns {number} Negated angle
     * @private
     */
    _negateAngle: function() {
        var canvasImage = this.getCanvasImage();
        var angle = parseFloat(canvasImage.angle * -1); // parseFloat for -0 to 0

        canvasImage.setAngle(angle);

        return angle;
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
        var angle = this._negateAngle();

        this.toggleImageProperties(['flipX'], true);

        return $.Deferred().resolve(this.getCurrentSetting(), angle);
    },

    /**
     * Flip y
     * @returns {jQuery.Deferred}
     */
    flipY: function() {
        var angle = this._negateAngle();

        this.toggleImageProperties(['flipY'], true);

        return $.Deferred().resolve(this.getCurrentSetting(), angle);
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
     * Set canvas dimension - backstore only
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
        var canvasImage;

        if (angle === current) {
            return jqDefer.reject();
        }

        /**
         * Do not call "this.setImageProperties" for setting angle directly.
         * Before setting angle, The originX,Y of image should be set to center.
         *  See "http://fabricjs.com/docs/fabric.Object.html#setAngle"
         */
        canvasImage = this.getCanvasImage();
        canvasImage.setAngle(angle).setCoords();
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
        command = commandFactory.create(commands.LOAD_IMAGE, imageName, url);

        command.setExecuteCallback(callback)
            .setUndoCallback(function(oImage) {
                if (oImage) {
                    callback(oImage);
                } else {
                    self.fire(events.CLEAR_IMAGE);
                }
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
        var command = commandFactory.create(commands.FLIP_IMAGE, type);

        command.setExecuteCallback(callback)
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
        var command = commandFactory.create(commands.ROTATE_IMAGE, angle);

        command.setExecuteCallback(callback)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29tcG9uZW50L3JvdGF0aW9uLmpzIiwic3JjL2pzL2NvbnN0cy5qcyIsInNyYy9qcy9leHRlbnNpb24vY3JvcHpvbmUuanMiLCJzcmMvanMvZmFjdG9yeS9jb21tYW5kLmpzIiwic3JjL2pzL2ZhY3RvcnkvZXJyb3JNZXNzYWdlLmpzIiwic3JjL2pzL2ltYWdlRWRpdG9yLmpzIiwic3JjL2pzL2ludGVyZmFjZS9Db21wb25lbnQuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbW1hbmQuanMiLCJzcmMvanMvaW52b2tlci5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25SQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkltYWdlRWRpdG9yJywgcmVxdWlyZSgnLi9zcmMvanMvaW1hZ2VFZGl0b3InKSwgdHJ1ZSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIENyb3B6b25lID0gcmVxdWlyZSgnLi4vZXh0ZW5zaW9uL2Nyb3B6b25lJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIE1PVVNFX01PVkVfVEhSRVNIT0xEID0gMTA7XG5cbnZhciBhYnMgPSBNYXRoLmFicztcbnZhciBjbGFtcCA9IHV0aWwuY2xhbXA7XG5cbi8qKlxuICogQ3JvcHBlciBjb21wb25lbnRzXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBDcm9wcGVyXG4gKi9cbnZhciBDcm9wcGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIENyb3BwZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7Q3JvcHpvbmV9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WCBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnRZIG9mIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsaXN0ZW5lcnNcbiAgICAgICAgICogQHR5cGUge29iamVjdC48c3RyaW5nLCBmdW5jdGlvbj59IEhhbmRsZXIgaGFzaCBmb3IgZmFicmljIGNhbnZhc1xuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNlbW92ZTogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlTW92ZSwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZXVwOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VVcCwgdGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5DUk9QUEVSLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2Nyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG5ldyBDcm9wem9uZSh7XG4gICAgICAgICAgICBsZWZ0OiAtMTAsXG4gICAgICAgICAgICB0b3A6IC0xMCxcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgY29ybmVyU2l6ZTogMTAsXG4gICAgICAgICAgICBjb3JuZXJDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICBoYXNSb3RhdGluZ1BvaW50OiBmYWxzZSxcbiAgICAgICAgICAgIGhhc0JvcmRlcnM6IGZhbHNlLFxuICAgICAgICAgICAgbG9ja1NjYWxpbmdGbGlwOiB0cnVlLFxuICAgICAgICAgICAgbG9ja1JvdGF0aW9uOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICBjYW52YXMuYWRkKHRoaXMuX2Nyb3B6b25lKTtcbiAgICAgICAgY2FudmFzLm9uKCdtb3VzZTpkb3duJywgdGhpcy5fbGlzdGVuZXJzLm1vdXNlZG93bik7XG4gICAgICAgIGNhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2Nyb3NzaGFpcic7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBjcm9wcGluZ1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBcHBseWluZyAtIElzIGFwcGx5aW5nIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHs/e2ltYWdlTmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZ319IGNyb3BwZWQgSW1hZ2UgZGF0YVxuICAgICAqL1xuICAgIGVuZDogZnVuY3Rpb24oaXNBcHBseWluZykge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBkYXRhO1xuXG4gICAgICAgIGlmICghY3JvcHpvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSB0cnVlO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdkZWZhdWx0JztcbiAgICAgICAgY2FudmFzLmRpc2NhcmRBY3RpdmVPYmplY3QoKTtcbiAgICAgICAgY2FudmFzLm9mZignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuXG4gICAgICAgIGNyb3B6b25lLnJlbW92ZSgpO1xuICAgICAgICBpZiAoaXNBcHBseWluZykge1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2dldENyb3BwZWRJbWFnZURhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZWRvd24gaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZURvd246IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNvb3JkO1xuXG4gICAgICAgIGlmIChmRXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIGNvb3JkID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IGNvb3JkLng7XG4gICAgICAgIHRoaXMuX3N0YXJ0WSA9IGNvb3JkLnk7XG5cbiAgICAgICAgY2FudmFzLm9uKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlbW92ZSBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlTW92ZTogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcbiAgICAgICAgdmFyIHggPSBwb2ludGVyLng7XG4gICAgICAgIHZhciB5ID0gcG9pbnRlci55O1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcblxuICAgICAgICBpZiAoYWJzKHggLSB0aGlzLl9zdGFydFgpICsgYWJzKHkgLSB0aGlzLl9zdGFydFkpID4gTU9VU0VfTU9WRV9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIGNyb3B6b25lLnJlbW92ZSgpO1xuICAgICAgICAgICAgY3JvcHpvbmUuc2V0KHRoaXMuX2NhbGNSZWN0RGltZW5zaW9uRnJvbVBvaW50KHgsIHkpKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZChjcm9wem9uZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlY3QgZGltZW5zaW9uIHNldHRpbmcgZnJvbSBDYW52YXMtTW91c2UtUG9zaXRpb24oeCwgeSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBDYW52YXMtTW91c2UtUG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNSZWN0RGltZW5zaW9uRnJvbVBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgd2lkdGggPSBjYW52YXMuZ2V0V2lkdGgoKTtcbiAgICAgICAgdmFyIGhlaWdodCA9IGNhbnZhcy5nZXRIZWlnaHQoKTtcbiAgICAgICAgdmFyIHN0YXJ0WCA9IHRoaXMuX3N0YXJ0WDtcbiAgICAgICAgdmFyIHN0YXJ0WSA9IHRoaXMuX3N0YXJ0WTtcbiAgICAgICAgdmFyIGxlZnQgPSBjbGFtcCh4LCAwLCBzdGFydFgpO1xuICAgICAgICB2YXIgdG9wID0gY2xhbXAoeSwgMCwgc3RhcnRZKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIHN0YXJ0WCwgd2lkdGgpIC0gbGVmdCwgLy8gKHN0YXJ0WCA8PSB4KG1vdXNlKSA8PSBjYW52YXNXaWR0aCkgLSBsZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCBzdGFydFksIGhlaWdodCkgLSB0b3AgLy8gKHN0YXJ0WSA8PSB5KG1vdXNlKSA8PSBjYW52YXNIZWlnaHQpIC0gdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW91c2V1cCBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLnNldEFjdGl2ZU9iamVjdChjcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vZmYoe1xuICAgICAgICAgICAgJ21vdXNlOm1vdmUnOiBsaXN0ZW5lcnMubW91c2Vtb3ZlLFxuICAgICAgICAgICAgJ21vdXNlOnVwJzogbGlzdGVuZXJzLm1vdXNldXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjcm9wcGVkIGltYWdlIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDcm9wcGVkSW1hZ2VEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBjcm9wSW5mbztcblxuICAgICAgICBpZiAoIWNyb3B6b25lLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjcm9wSW5mbyA9IHtcbiAgICAgICAgICAgIGxlZnQ6IGNyb3B6b25lLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcDogY3JvcHpvbmUuZ2V0VG9wKCksXG4gICAgICAgICAgICB3aWR0aDogY3JvcHpvbmUuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodDogY3JvcHpvbmUuZ2V0SGVpZ2h0KClcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW1hZ2VOYW1lOiB0aGlzLmdldEltYWdlTmFtZSgpLFxuICAgICAgICAgICAgdXJsOiB0aGlzLmdldENhbnZhcygpLnRvRGF0YVVSTChjcm9wSW5mbylcbiAgICAgICAgfTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wcGVyO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UgZmxpcCBtb2R1bGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEZsaXBcbiAqIEBjbGFzcyBGbGlwXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqL1xudmFyIEZsaXAgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRmxpcC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuRkxJUCxcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGZsaXAgc2V0dGluZ3NcbiAgICAgKiBAcmV0dXJucyB7e2ZsaXBYOiBCb29sZWFuLCBmbGlwWTogQm9vbGVhbn19XG4gICAgICovXG4gICAgZ2V0Q3VycmVudFNldHRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZsaXBYOiBjYW52YXNJbWFnZS5mbGlwWCxcbiAgICAgICAgICAgIGZsaXBZOiBjYW52YXNJbWFnZS5mbGlwWVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZmxpcFgsIGZsaXBZXG4gICAgICogQHBhcmFtIHt7ZmxpcFg6ID9Cb29sZWFuLCBmbGlwWTogP0Jvb2xlYW59fSBuZXdTZXR0aW5nIC0gRmxpcCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1NldHRpbmcpIHtcbiAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBYID0gKHNldHRpbmcuZmxpcFggIT09ICEhbmV3U2V0dGluZy5mbGlwWCk7XG4gICAgICAgIHZhciBpc0NoYW5naW5nRmxpcFkgPSAoc2V0dGluZy5mbGlwWSAhPT0gISFuZXdTZXR0aW5nLmZsaXBZKTtcbiAgICAgICAgdmFyIGFuZ2xlO1xuXG4gICAgICAgIGlmICghaXNDaGFuZ2luZ0ZsaXBYICYmICFpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWCkge1xuICAgICAgICAgICAgYW5nbGUgPSB0aGlzLl9uZWdhdGVBbmdsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGFuZ2xlID0gdGhpcy5fbmVnYXRlQW5nbGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0dWkudXRpbC5leHRlbmQoc2V0dGluZywgbmV3U2V0dGluZyk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBqcURlZmVyLnJlc29sdmUoc2V0dGluZywgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBOZWdhdGUgYW5nbGUgZm9yIGZsaXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBOZWdhdGVkIGFuZ2xlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbmVnYXRlQW5nbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG4gICAgICAgIHZhciBhbmdsZSA9IHBhcnNlRmxvYXQoY2FudmFzSW1hZ2UuYW5nbGUgKiAtMSk7IC8vIHBhcnNlRmxvYXQgZm9yIC0wIHRvIDBcblxuICAgICAgICBjYW52YXNJbWFnZS5zZXRBbmdsZShhbmdsZSk7XG5cbiAgICAgICAgcmV0dXJuIGFuZ2xlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwIHNldHRpbmdzXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh7XG4gICAgICAgICAgICBmbGlwWDogZmFsc2UsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgZmxpcFg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYW5nbGUgPSB0aGlzLl9uZWdhdGVBbmdsZSgpO1xuXG4gICAgICAgIHRoaXMudG9nZ2xlSW1hZ2VQcm9wZXJ0aWVzKFsnZmxpcFgnXSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKSwgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHlcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFuZ2xlID0gdGhpcy5fbmVnYXRlQW5nbGUoKTtcblxuICAgICAgICB0aGlzLnRvZ2dsZUltYWdlUHJvcGVydGllcyhbJ2ZsaXBZJ10sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZSh0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCksIGFuZ2xlKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbGlwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgaW1hZ2VPcHRpb24gPSB7XG4gICAgcGFkZGluZzogMCxcbiAgICBjcm9zc09yaWdpbjogJydcbn07XG5cbi8qKlxuICogSW1hZ2VMb2FkZXIgY29tcG9uZW50c1xuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBJbWFnZUxvYWRlclxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqL1xudmFyIEltYWdlTG9hZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEltYWdlTG9hZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVIsXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBpbWFnZU5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfHN0cmluZyl9IGltZyAtIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGpxRGVmZXIsIGNhbnZhcztcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7IC8vIEJhY2sgdG8gdGhlIGluaXRpYWwgc3RhdGUsIG5vdCBlcnJvci5cbiAgICAgICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICBjYW52YXMuYmFja2dyb3VuZEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZSgnJywgbnVsbCk7XG4gICAgICAgICAgICB9KS5yZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gdGhpcy5fc2V0QmFja2dyb3VuZEltYWdlKGltZykuZG9uZShmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vblN1Y2Nlc3NJbWFnZUxvYWQob0ltYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldENhbnZhc0ltYWdlKGltYWdlTmFtZSwgb0ltYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvSW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpbWFnZU9wdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU3VjY2VzcyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblN1Y2Nlc3NJbWFnZUxvYWQ6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB0aGlzLnNldENhbnZhc0Nzc0RpbWVuc2lvbih7XG4gICAgICAgICAgICBtYXJnaW46ICdhdXRvJyxcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcnLCAgLy8gTm8gaW5saW5lLWNzcyBcImhlaWdodFwiIGZvciBJRTlcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiBvSW1hZ2Uud2lkdGggKyAncHgnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiBvSW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG9JbWFnZS5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBERUZBVUxUX01BWF9XSURUSCA9IDEwMDA7XG5cbnZhciBjc3NPbmx5ID0ge2Nzc09ubHk6IHRydWV9O1xudmFyIGJhY2tzdG9yZU9ubHkgPSB7YmFja3N0b3JlT25seTogdHJ1ZX07XG4vKipcbiAqIE1haW4gY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzXG4gKi9cbnZhciBNYWluID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIE1haW4ucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljIGNhbnZhcyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNhbnZhc31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FudmFzID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuSW1hZ2V9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9JbWFnZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltYWdlIG5hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuTUFJTixcblxuICAgIC8qKlxuICAgICAqIFRvIGRhdGEgdXJsIGZyb20gY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzICYmIHRoaXMuY2FudmFzLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMub0ltYWdlID0gb0ltYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnQgdG8gZmFicmljLkNhbnZhc1xuICAgICAqIEBwYXJhbSB7alF1ZXJ5fEVsZW1lbnR8c3RyaW5nfSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbihjYW52YXNFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXMoJChjYW52YXNFbGVtZW50KVswXSwge1xuICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICd0dWktY29tcG9uZW50LWltYWdlRWRpdG9yLWNhbnZhc0NvbnRhaW5lcidcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiAge0BsaW5rIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuQ2FudmFzLmh0bWwjc2V0RGltZW5zaW9uc31cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGNzcyBkaW1lbnNpb25cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNDc3NEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB2YXIgbWF4V2lkdGggPSBwYXJzZUludChkaW1lbnNpb25bJ21heC13aWR0aCddLCAxMCk7XG4gICAgICAgIGlmIChtYXhXaWR0aCkge1xuICAgICAgICAgICAgZGltZW5zaW9uWydtYXgtd2lkdGgnXSA9IE1hdGgubWluKG1heFdpZHRoLCBERUZBVUxUX01BWF9XSURUSCkgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGNzc09ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGJhY2tzdG9yZSBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGJhY2tzdG9yZU9ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkltYWdlLmh0bWwjc2V0fVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB2YXIgb0ltYWdlID0gdGhpcy5vSW1hZ2U7XG5cbiAgICAgICAgaWYgKCFvSW1hZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9JbWFnZS5zZXQoc2V0dGluZykuc2V0Q29vcmRzKCk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgcHJvcGVydGllcyBvZiB0aGUgaW1hZ2VcbiAgICAgKiB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5JbWFnZS5odG1sI3RvZ2dsZX1cbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwcm9wZXJ0aWVzIC0gSW1hZ2UgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICB0b2dnbGVJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdmFyIG9JbWFnZSA9IHRoaXMub0ltYWdlO1xuXG4gICAgICAgIGlmICghb0ltYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvSW1hZ2UudG9nZ2xlLmFwcGx5KG9JbWFnZSwgcHJvcGVydGllcyk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlTmFtZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2Ugcm90YXRpb24gbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBJbWFnZSBSb3RhdGlvbiBjb21wb25lbnRcbiAqIEBjbGFzcyBSb3RhdGlvblxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBSb3RhdGlvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBSb3RhdGlvbi5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLlJPVEFUSU9OLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRBbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhbmdsZSBvZiB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKTtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZTtcblxuICAgICAgICBpZiAoYW5nbGUgPT09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERvIG5vdCBjYWxsIFwidGhpcy5zZXRJbWFnZVByb3BlcnRpZXNcIiBmb3Igc2V0dGluZyBhbmdsZSBkaXJlY3RseS5cbiAgICAgICAgICogQmVmb3JlIHNldHRpbmcgYW5nbGUsIFRoZSBvcmlnaW5YLFkgb2YgaW1hZ2Ugc2hvdWxkIGJlIHNldCB0byBjZW50ZXIuXG4gICAgICAgICAqICBTZWUgXCJodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLk9iamVjdC5odG1sI3NldEFuZ2xlXCJcbiAgICAgICAgICovXG4gICAgICAgIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuICAgICAgICBjYW52YXNJbWFnZS5zZXRBbmdsZShhbmdsZSkuc2V0Q29vcmRzKCk7XG4gICAgICAgIHRoaXMuX2FkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuXG4gICAgICAgIHJldHVybiBqcURlZmVyLnJlc29sdmUoYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiBmcm9tIGltYWdlLXJvdGF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRqdXN0Q2FudmFzRGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpLFxuICAgICAgICAgICAgYm91bmRpbmdSZWN0ID0gY2FudmFzSW1hZ2UuZ2V0Qm91bmRpbmdSZWN0KCk7XG5cbiAgICAgICAgLy8gQm91bmRpbmdSZWN0IGRpbWVuc2lvbnMgKzEsIHNvIHRoYXQgZG9uJ3QgZ2V0IGJsdXJyeSBpbWFnZS5cbiAgICAgICAgYm91bmRpbmdSZWN0LndpZHRoID0gTWF0aC5mbG9vcihib3VuZGluZ1JlY3Qud2lkdGgpICsgMTtcbiAgICAgICAgYm91bmRpbmdSZWN0LmhlaWdodCA9IE1hdGguZmxvb3IoYm91bmRpbmdSZWN0LmhlaWdodCkgKyAxO1xuXG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKHtcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiBib3VuZGluZ1JlY3Qud2lkdGggKyAncHgnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogYm91bmRpbmdSZWN0LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBib3VuZGluZ1JlY3QuaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdldENhbnZhcygpLmNlbnRlck9iamVjdChjYW52YXNJbWFnZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYWRkaXRpb25hbEFuZ2xlIC0gQWRkaXRpb25hbCBhbmdsZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcm90YXRlOiBmdW5jdGlvbihhZGRpdGlvbmFsQW5nbGUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGU7XG5cbiAgICAgICAgLy8gVGhlIGFuZ2xlIGlzIGxvd2VyIHRoYW4gMipQSSg9PT0zNjAgZGVncmVlcylcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QW5nbGUoKGN1cnJlbnQgKyBhZGRpdGlvbmFsQW5nbGUpICUgMzYwKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3RhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29tcG9uZW50TmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTUFJTicsXG4gICAgICAgICdJTUFHRV9MT0FERVInLFxuICAgICAgICAnQ1JPUFBFUicsXG4gICAgICAgICdGTElQJyxcbiAgICAgICAgJ1JPVEFUSU9OJ1xuICAgICksXG5cbiAgICBjb21tYW5kTmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTE9BRF9JTUFHRScsXG4gICAgICAgICdGTElQX0lNQUdFJyxcbiAgICAgICAgJ1JPVEFURV9JTUFHRSdcbiAgICApLFxuXG4gICAgZXZlbnROYW1lczoge1xuICAgICAgICBMT0FEX0lNQUdFOiAnbG9hZEltYWdlJyxcbiAgICAgICAgQ0xFQVJfSU1BR0U6ICdjbGVhckltYWdlJyxcbiAgICAgICAgU1RBUlRfQ1JPUFBJTkc6ICdzdGFydENyb3BwaW5nJyxcbiAgICAgICAgRU5EX0NST1BQSU5HOiAnZW5kQ3JvcHBpbmcnLFxuICAgICAgICBGTElQX0lNQUdFOiAnZmxpcEltYWdlJyxcbiAgICAgICAgUk9UQVRFX0lNQUdFOiAncm90YXRlSW1hZ2UnLFxuICAgICAgICBFTVBUWV9SRURPX1NUQUNLOiAnZW1wdHlSZWRvU3RhY2snLFxuICAgICAgICBFTVBUWV9VTkRPX1NUQUNLOiAnZW1wdHlVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1VORE9fU1RBQ0s6ICdwdXNoVW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9SRURPX1NUQUNLOiAncHVzaFJlZG9TdGFjaydcbiAgICB9LFxuXG4gICAgSVNfU1VQUE9SVF9GSUxFX0FQSTogISEod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5GaWxlUmVhZGVyKVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYW1wID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNsYW1wO1xuXG52YXIgQ09STkVSX1RZUEVfVE9QX0xFRlQgPSAndGwnO1xudmFyIENPUk5FUl9UWVBFX1RPUF9SSUdIVCA9ICd0cic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1RPUCA9ICdtdCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0xFRlQgPSAnbWwnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVCA9ICdtcic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTSA9ICdtYic7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQgPSAnYmwnO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVCA9ICdicic7XG5cbi8qKlxuICogQ3JvcHpvbmUgb2JqZWN0XG4gKiBJc3N1ZTogSUU3LCA4KHdpdGggZXhjYW52YXMpXG4gKiAgLSBDcm9wem9uZSBpcyBhIGJsYWNrIHpvbmUgd2l0aG91dCB0cmFuc3BhcmVuY3kuXG4gKiBAY2xhc3MgQ3JvcHpvbmVcbiAqIEBleHRlbmRzIHtmYWJyaWMuUmVjdH1cbiAqL1xudmFyIENyb3B6b25lID0gZmFicmljLnV0aWwuY3JlYXRlQ2xhc3MoZmFicmljLlJlY3QsIC8qKiBAbGVuZHMgQ3JvcHpvbmUucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ2luaXRpYWxpemUnLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAnbW92aW5nJzogdGhpcy5fb25Nb3ZpbmcsXG4gICAgICAgICAgICAnc2NhbGluZyc6IHRoaXMuX29uU2NhbGluZ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIENyb3Atem9uZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfcmVuZGVyOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRmxpcFgsIG9yaWdpbmFsRmxpcFksXG4gICAgICAgICAgICBvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVksXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lV2lkdGggPSA3LFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZU9mZnNldCA9IDc7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdfcmVuZGVyJywgY3R4KTtcblxuICAgICAgICAvLyBDYWxjIG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIG9yaWdpbmFsRmxpcFggPSB0aGlzLmZsaXBYID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbEZsaXBZID0gdGhpcy5mbGlwWSA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVggPSBvcmlnaW5hbEZsaXBYIC8gdGhpcy5zY2FsZVg7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVZID0gb3JpZ2luYWxGbGlwWSAvIHRoaXMuc2NhbGVZO1xuXG4gICAgICAgIC8vIFNldCBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUob3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZKTtcblxuICAgICAgICAvLyBSZW5kZXIgb3V0ZXIgcmVjdFxuICAgICAgICB0aGlzLl9maWxsT3V0ZXJSZWN0KGN0eCwgJ3JnYmEoMCwgMCwgMCwgMC41NSknKTtcblxuICAgICAgICAvLyBCbGFjayBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigwLCAwLCAwKScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCk7XG5cbiAgICAgICAgLy8gV2hpdGUgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMjU1LCAyNTUsIDI1NSknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgsIGNyb3B6b25lRGFzaExpbmVPZmZzZXQpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZSgxIC8gb3JpZ2luYWxTY2FsZVgsIDEgLyBvcmlnaW5hbFNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyb3B6b25lLWNvb3JkaW5hdGVzIHdpdGggb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICpcbiAgICAgKiAgICAgeDAgICAgIHgxICAgICAgICAgeDIgICAgICB4M1xuICAgICAqICB5MCArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3wgICAgLy8gPC0tLSBcIk91dGVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTEgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wgQ3JvcHpvbmUgfC8vLy8vLy98ICAgIENyb3B6b25lIGlzIHRoZSBcIklubmVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfCAgKDAsIDApICB8Ly8vLy8vL3wgICAgQ2VudGVyIHBvaW50ICgwLCAwKVxuICAgICAqICB5MiArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICpcbiAgICAgKiBAdHlwZWRlZiB7e3g6IEFycmF5PG51bWJlcj4sIHk6IEFycmF5PG51bWJlcj59fSBjcm9wem9uZUNvb3JkaW5hdGVzXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBGaWxsIG91dGVyIHJlY3RhbmdsZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gZmlsbFN0eWxlIC0gRmlsbC1zdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbGxPdXRlclJlY3Q6IGZ1bmN0aW9uKGN0eCwgZmlsbFN0eWxlKSB7XG4gICAgICAgIHZhciBjb29yZGluYXRlcyA9IHRoaXMuX2dldENvb3JkaW5hdGVzKGN0eCksXG4gICAgICAgICAgICB4ID0gY29vcmRpbmF0ZXMueCxcbiAgICAgICAgICAgIHkgPSBjb29yZGluYXRlcy55O1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyBPdXRlciByZWN0YW5nbGVcbiAgICAgICAgLy8gTnVtYmVycyBhcmUgKy8tMSBzbyB0aGF0IG92ZXJsYXkgZWRnZXMgZG9uJ3QgZ2V0IGJsdXJyeS5cbiAgICAgICAgY3R4Lm1vdmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbM10gKyAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVszXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICAvLyBJbm5lciByZWN0YW5nbGVcbiAgICAgICAgY3R4Lm1vdmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb29yZGluYXRlc1xuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHJldHVybnMge2Nyb3B6b25lQ29vcmRpbmF0ZXN9IC0ge0BsaW5rIGNyb3B6b25lQ29vcmRpbmF0ZXN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY2VpbCA9IE1hdGguY2VpbCxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSBoZWlnaHQgLyAyLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIGNhbnZhc0VsID0gY3R4LmNhbnZhczsgLy8gY2FudmFzIGVsZW1lbnQsIG5vdCBmYWJyaWMgb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGggKyBsZWZ0KSwgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MFxuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDFcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGgsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgyXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoICsgKGNhbnZhc0VsLndpZHRoIC0gbGVmdCAtIHdpZHRoKSAvLyB4M1xuICAgICAgICAgICAgXSwgY2VpbCksXG4gICAgICAgICAgICB5OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCArIHRvcCksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkwXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTFcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MlxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQgKyAoY2FudmFzRWwuaGVpZ2h0IC0gdG9wIC0gaGVpZ2h0KSAgIC8vIHkzXG4gICAgICAgICAgICBdLCBjZWlsKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdHJva2UgYm9yZGVyXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBzdHJva2VTdHlsZSAtIFN0cm9rZS1zdHlsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaFdpZHRoIC0gRGFzaCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbGluZURhc2hPZmZzZXRdIC0gRGFzaCBvZmZzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zdHJva2VCb3JkZXI6IGZ1bmN0aW9uKGN0eCwgc3Ryb2tlU3R5bGUsIGxpbmVEYXNoV2lkdGgsIGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgIHZhciBoYWxmV2lkdGggPSB0aGlzLmdldFdpZHRoKCkgLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgICBpZiAoY3R4LnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBjdHguc2V0TGluZURhc2goW2xpbmVEYXNoV2lkdGgsIGxpbmVEYXNoV2lkdGhdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgICAgIGN0eC5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW92aW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3Zpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgbWF4TGVmdCA9IGNhbnZhcy5nZXRXaWR0aCgpIC0gd2lkdGgsXG4gICAgICAgICAgICBtYXhUb3AgPSBjYW52YXMuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5zZXRMZWZ0KGNsYW1wKGxlZnQsIDAsIG1heExlZnQpKTtcbiAgICAgICAgdGhpcy5zZXRUb3AoY2xhbXAodG9wLCAwLCBtYXhUb3ApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TY2FsaW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHt7ZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU2NhbGluZzogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBwb2ludGVyID0gdGhpcy5jYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRoaXMuX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXIpO1xuXG4gICAgICAgIC8vIE9uIHNjYWxpbmcgY3JvcHpvbmUsXG4gICAgICAgIC8vIGNoYW5nZSByZWFsIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGZpeCBzY2FsZUZhY3RvciB0byAxXG4gICAgICAgIHRoaXMuc2NhbGUoMSkuc2V0KHNldHRpbmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsZWQgc2l6ZSBmcm9tIG1vdXNlIHBvaW50ZXIgd2l0aCBzZWxlY3RlZCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IHBvaW50ZXIgLSBNb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEhhdmluZyBsZWZ0IG9yKGFuZCkgdG9wIG9yKGFuZCkgd2lkdGggb3IoYW5kKSBoZWlnaHQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHBvaW50ZXIpIHtcbiAgICAgICAgdmFyIHBvaW50ZXJYID0gcG9pbnRlci54LFxuICAgICAgICAgICAgcG9pbnRlclkgPSBwb2ludGVyLnksXG4gICAgICAgICAgICB0bFNjYWxpbmdTaXplID0gdGhpcy5fY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSksXG4gICAgICAgICAgICBiclNjYWxpbmdTaXplID0gdGhpcy5fY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEB0b2RvOiDsnbzrsJgg6rCd7LK07JeQ7IScIHNoaWZ0IOyhsO2Vqe2CpOulvCDriITrpbTrqbQgZnJlZSBzaXplIHNjYWxpbmfsnbQg65CoIC0tPiDtmZXsnbjtlbTrs7zqsoNcbiAgICAgICAgICogICAgICBjYW52YXMuY2xhc3MuanMgLy8gX3NjYWxlT2JqZWN0OiBmdW5jdGlvbiguLi4pey4uLn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2NhbGluZ1NldHRpbmdzKHRsU2NhbGluZ1NpemUsIGJyU2NhbGluZ1NpemUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZShwb3NpdGlvbiArIGRpbWVuc2lvbikgZnJvbSBsZWZ0LXRvcCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRoaXMuZ2V0SGVpZ2h0KCkgKyB0aGlzLnRvcCxcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5nZXRXaWR0aCgpICsgdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gY2xhbXAoeSwgMCwgYm90dG9tIC0gMSksICAvLyAwIDw9IHRvcCA8PSAoYm90dG9tIC0gMSlcbiAgICAgICAgICAgIGxlZnQgPSBjbGFtcCh4LCAwLCByaWdodCAtIDEpOyAgLy8gMCA8PSBsZWZ0IDw9IChyaWdodCAtIDEpXG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiVG9wLUxlZnQgY29ybmVyXCI6IEl0IGZpeGVzIHJpZ2h0IGFuZCBib3R0b20gY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiByaWdodCAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdHRvbSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZSBmcm9tIHJpZ2h0LWJvdHRvbSBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIG1heFggPSBjYW52YXMud2lkdGgsXG4gICAgICAgICAgICBtYXhZID0gY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSB0aGlzLnRvcDtcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJCb3R0b20tUmlnaHQgY29ybmVyXCI6IEl0IGZpeGVzIGxlZnQgYW5kIHRvcCBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIChsZWZ0ICsgMSksIG1heFgpIC0gbGVmdCwgICAgLy8gKHdpZHRoID0geCAtIGxlZnQpLCAobGVmdCArIDEgPD0geCA8PSBtYXhYKVxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCAodG9wICsgMSksIG1heFkpIC0gdG9wICAgICAgLy8gKGhlaWdodCA9IHkgLSB0b3ApLCAodG9wICsgMSA8PSB5IDw9IG1heFkpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSovXG4gICAgLyoqXG4gICAgICogTWFrZSBzY2FsaW5nIHNldHRpbmdzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0bCAtIFRvcC1MZWZ0IHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJyIC0gQm90dG9tLVJpZ2h0IHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiA/bnVtYmVyLCBoZWlnaHQ6ID9udW1iZXIsIGxlZnQ6ID9udW1iZXIsIHRvcDogP251bWJlcn19IFBvc2l0aW9uIHNldHRpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2NhbGluZ1NldHRpbmdzOiBmdW5jdGlvbih0bCwgYnIpIHtcbiAgICAgICAgdmFyIHRsV2lkdGggPSB0bC53aWR0aCxcbiAgICAgICAgICAgIHRsSGVpZ2h0ID0gdGwuaGVpZ2h0LFxuICAgICAgICAgICAgYnJIZWlnaHQgPSBici5oZWlnaHQsXG4gICAgICAgICAgICBicldpZHRoID0gYnIud2lkdGgsXG4gICAgICAgICAgICB0bExlZnQgPSB0bC5sZWZ0LFxuICAgICAgICAgICAgdGxUb3AgPSB0bC50b3AsXG4gICAgICAgICAgICBzZXR0aW5ncztcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuX19jb3JuZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0bDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gYnI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1RPUDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfSwgLyplc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSB3aGV0aGVyIHRoaXMgY3JvcHpvbmUgaXMgdmFsaWRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMubGVmdCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLnRvcCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLndpZHRoID4gMCAmJlxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPiAwXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHpvbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21tYW5kID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGNvbXBvbmVudE5hbWVzID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xudmFyIGNvbW1hbmROYW1lcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY3JlYXRvcnMgPSB7fTtcblxudmFyIElNQUdFX0xPQURFUiA9IGNvbXBvbmVudE5hbWVzLklNQUdFX0xPQURFUjtcbnZhciBGTElQID0gY29tcG9uZW50TmFtZXMuRkxJUDtcbnZhciBST1RBVElPTiA9IGNvbXBvbmVudE5hbWVzLlJPVEFUSU9OO1xuXG4vKipcbiAqIFNldCBtYXBwaW5nIGNyZWF0b3JzXG4gKi9cbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5MT0FEX0lNQUdFXSA9IGNyZWF0ZUxvYWRJbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuRkxJUF9JTUFHRV0gPSBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLlJPVEFURV9JTUFHRV0gPSBjcmVhdGVSb3RhdGlvbkltYWdlQ29tbWFuZDtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gSW1hZ2UgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEltYWdlIHVybFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxvYWRJbWFnZUNvbW1hbmQoaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgICAgIHByZXZOYW1lOiBsb2FkZXIuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICAgICAgcHJldkltYWdlOiBsb2FkZXIuZ2V0Q2FudmFzSW1hZ2UoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGxvYWRlci5sb2FkKGltYWdlTmFtZSwgdXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChzdG9yZS5wcmV2TmFtZSwgc3RvcmUucHJldkltYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAqIEByZXR1cm5zIHskLkRlZmVycmVkfVxuICovXG5mdW5jdGlvbiBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kKHR5cGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gZmxpcENvbXAuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZsaXBDb21wW3R5cGVdKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmbGlwQ29tcCA9IGNvbXBNYXBbRkxJUF07XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcC5zZXQodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSB2YWx1ZSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHskLkRlZmVycmVkfVxuICovXG5mdW5jdGlvbiBjcmVhdGVSb3RhdGlvbkltYWdlQ29tbWFuZChhbmdsZSkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciByb3RhdGlvbkNvbXAgPSBjb21wTWFwW1JPVEFUSU9OXTtcblxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IHJvdGF0aW9uQ29tcC5nZXRDdXJyZW50QW5nbGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJvdGF0aW9uQ29tcC5yb3RhdGUoYW5nbGUpO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXAuc2V0QW5nbGUodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgY29tbWFuZFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21tYW5kIG5hbWVcbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIEFyZ3VtZW50cyBmb3IgY3JlYXRpbmcgY29tbWFuZFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZShuYW1lLCBhcmdzKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICByZXR1cm4gY3JlYXRvcnNbbmFtZV0uYXBwbHkobnVsbCwgYXJncyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBjcmVhdGVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlNaXJyb3IgPSByZXF1aXJlKCcuLi91dGlsJykua2V5TWlycm9yO1xuXG52YXIgdHlwZXMgPSBrZXlNaXJyb3IoXG4gICAgJ1VOX0lNUExFTUVOVEFUSU9OJyxcbiAgICAnTk9fQ09NUE9ORU5UX05BTUUnXG4pO1xuXG52YXIgbWVzc2FnZXMgPSB7XG4gICAgVU5fSU1QTEVNRU5UQVRJT046ICdTaG91bGQgaW1wbGVtZW50IGEgbWV0aG9kOiAnLFxuICAgIE5PX0NPTVBPTkVOVF9OQU1FOiAnU2hvdWxkIHNldCBhIGNvbXBvbmVudCBuYW1lJ1xufTtcblxudmFyIG1hcCA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuVU5fSU1QTEVNRU5UQVRJT04gKyBtZXRob2ROYW1lO1xuICAgIH0sXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuTk9fQ09NUE9ORU5UX05BTUU7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHlwZXM6IHR1aS51dGlsLmV4dGVuZCh7fSwgdHlwZXMpLFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBmdW5jO1xuXG4gICAgICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGZ1bmMgPSBtYXBbdHlwZV07XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuXG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEludm9rZXIgPSByZXF1aXJlKCcuL2ludm9rZXInKTtcbnZhciBjb21tYW5kRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yeS9jb21tYW5kJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKTtcblxudmFyIGV2ZW50cyA9IGNvbnN0cy5ldmVudE5hbWVzO1xudmFyIGNvbW1hbmRzID0gY29uc3RzLmNvbW1hbmROYW1lcztcbnZhciBjb21wTGlzdCA9IGNvbnN0cy5jb21wb25lbnROYW1lcztcblxuLyoqXG4gKiBJbWFnZSBlZGl0b3JcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAqL1xudmFyIEltYWdlRWRpdG9yID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbWFnZUVkaXRvci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogSW5vdmtlclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAdHlwZSB7SW52b2tlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIgPSBuZXcgSW52b2tlcigpO1xuXG4gICAgICAgIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS5zZXRDYW52YXNFbGVtZW50KGNhbnZhc0VsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZXZlbnQgbmFtZXNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEV2ZW50TmFtZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZXh0ZW5kKHt9LCBldmVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIG1haW4gY29tcG9uZW50XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH0gTWFpbiBjb21wb25lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRNYWluQ29tcG9uZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5NQUlOKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlci5nZXRDb21wb25lbnQobmFtZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBhY3Rpb25zXG4gICAgICovXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZENyb3BwaW5nKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5pbnZva2UoY29tbWFuZCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5faW52b2tlci5pc0VtcHR5VW5kb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW52b2tlciA9IHRoaXMuX2ludm9rZXI7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGludm9rZXIudW5kbygpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW52b2tlci5pc0VtcHR5VW5kb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50cy5QVVNIX1JFRE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkb1xuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW52b2tlciA9IHRoaXMuX2ludm9rZXI7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGludm9rZXIucmVkbygpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW52b2tlci5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50cy5QVVNIX1VORE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIGZpbGVcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltZ0ZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbUZpbGU6IGZ1bmN0aW9uKGltZ0ZpbGUpIHtcbiAgICAgICAgaWYgKCFpbWdGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoXG4gICAgICAgICAgICBpbWdGaWxlLm5hbWUsXG4gICAgICAgICAgICBVUkwuY3JlYXRlT2JqZWN0VVJMKGltZ0ZpbGUpXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gaW1hZ2VOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEZpbGUgdXJsXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbVVSTDogZnVuY3Rpb24oaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgfHwgIXVybCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmcsIHRoaXMpO1xuICAgICAgICBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkxPQURfSU1BR0UsIGltYWdlTmFtZSwgdXJsKTtcblxuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhvSW1hZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuQ0xFQVJfSU1BR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIGltYWdlIGxvYWRpbmdcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmc6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2dldE1haW5Db21wb25lbnQoKTtcbiAgICAgICAgdmFyICRjYW52YXNFbGVtZW50ID0gJChtYWluQ29tcG9uZW50LmdldENhbnZhc0VsZW1lbnQoKSk7XG5cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5MT0FEX0lNQUdFLCB7XG4gICAgICAgICAgICBvcmlnaW5hbFdpZHRoOiBvSW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBvcmlnaW5hbEhlaWdodDogb0ltYWdlLmhlaWdodCxcbiAgICAgICAgICAgIGN1cnJlbnRXaWR0aDogJGNhbnZhc0VsZW1lbnQud2lkdGgoKSxcbiAgICAgICAgICAgIGN1cnJlbnRIZWlnaHQ6ICRjYW52YXNFbGVtZW50LmhlaWdodCgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBjcm9wcGluZ1xuICAgICAqL1xuICAgIHN0YXJ0Q3JvcHBpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHBlciA9IHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5DUk9QUEVSKTtcblxuICAgICAgICBjcm9wcGVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuU1RBUlRfQ1JPUFBJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjcm9wcGluZ1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQXBwbHlpbmddIC0gV2hldGhlciB0aGUgY3JvcHBpbmcgaXMgYXBwbGllZCBvciBjYW5jZWxlZFxuICAgICAqL1xuICAgIGVuZENyb3BwaW5nOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuICAgICAgICB2YXIgZGF0YSA9IGNyb3BwZXIuZW5kKGlzQXBwbHlpbmcpO1xuXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuRU5EX0NST1BQSU5HKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChkYXRhLmltYWdlTmFtZSwgZGF0YS51cmwpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdmbGlwWCcgb3IgJ2ZsaXBZJyBvciAncmVzZXQnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmxpcDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLkZMSVBfSU1BR0UpO1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5GTElQX0lNQUdFLCB0eXBlKTtcblxuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICovXG4gICAgZmxpcFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdmbGlwWScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwXG4gICAgICovXG4gICAgcmVzZXRGbGlwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgncmVzZXQnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgdG8gcm90YXRlIGltYWdlXG4gICAgICovXG4gICAgcm90YXRlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLlJPVEFURV9JTUFHRSk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJPVEFURV9JTUFHRSwgYW5nbGUpO1xuXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGEgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB1bmRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJVbmRvU3RhY2soKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pbnZva2VyLmNsZWFyUmVkb1N0YWNrKCk7XG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuRU1QVFlfUkVET19TVEFDSyk7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihJbWFnZUVkaXRvcik7XG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlRWRpdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbXBvbmVudCBpbnRlcmZhY2VcbiAqIEBjbGFzc1xuICovXG52YXIgQ29tcG9uZW50ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDb21wb25lbnQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGltYWdlKGJhY2tncm91bmQpIG9mIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBpbWFnZVxuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBzZXRDYW52YXNJbWFnZTogZnVuY3Rpb24obmFtZSwgb0ltYWdlKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldENhbnZhc0ltYWdlKG5hbWUsIG9JbWFnZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY2FudmFzIGVsZW1lbnQgb2YgZmFicmljLkNhbnZhc1tbbG93ZXItY2FudmFzXV1cbiAgICAgKiBAcmV0dXJucyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNFbGVtZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBmYWJyaWMuQ2FudmFzIGluc3RhbmNlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5DYW52YXN9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FudmFzSW1hZ2UgKGZhYnJpYy5JbWFnZSBpbnN0YW5jZSlcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkltYWdlfVxuICAgICAqL1xuICAgIGdldENhbnZhc0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhc0ltYWdlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0SW1hZ2VOYW1lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBlZGl0b3JcbiAgICAgKiBAcmV0dXJucyB7SW1hZ2VFZGl0b3J9XG4gICAgICovXG4gICAgZ2V0RWRpdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEVkaXRvcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gY29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRJbWFnZVByb3BlcnRpZXMoc2V0dGluZywgd2l0aFJlbmRlcmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBwcm9wZXJ0aWVzIG9mIHRoZSBpbWFnZVxuICAgICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHByb3BlcnRpZXMgLSBJbWFnZSBwcm9wZXJ0eSBuYW1lc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqL1xuICAgIHRvZ2dsZUltYWdlUHJvcGVydGllczogZnVuY3Rpb24ocHJvcGVydGllcywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS50b2dnbGVJbWFnZVByb3BlcnRpZXMocHJvcGVydGllcywgd2l0aFJlbmRlcmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGNzcyBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBzZXRDYW52YXNDc3NEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNDc3NEaW1lbnNpb24oZGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBjc3Mgb25seVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgYmFja3N0b3JlIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbihkaW1lbnNpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcGFyZW50XG4gICAgICogQHBhcmFtIHtDb21wb25lbnR8bnVsbH0gcGFyZW50IC0gUGFyZW50XG4gICAgICovXG4gICAgc2V0UGFyZW50OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50IHx8IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwYXJlbnQuXG4gICAgICogSWYgdGhlIHZpZXcgaXMgcm9vdCwgcmV0dXJuIG51bGxcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fG51bGx9XG4gICAgICovXG4gICAgZ2V0UGFyZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHJvb3RcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldFJvb3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMuZ2V0UGFyZW50KCksXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtdGhpcyAqL1xuICAgICAgICAgICAgY3VycmVudCA9IHRoaXM7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgY29uc2lzdGVudC10aGlzICovXG5cbiAgICAgICAgd2hpbGUgKG5leHQpIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgICAgICAgbmV4dCA9IGN1cnJlbnQuZ2V0UGFyZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvck1lc3NhZ2UgPSByZXF1aXJlKCcuLi9mYWN0b3J5L2Vycm9yTWVzc2FnZScpO1xuXG52YXIgY3JlYXRlTWVzc2FnZSA9IGVycm9yTWVzc2FnZS5jcmVhdGUsXG4gICAgZXJyb3JUeXBlcyA9IGVycm9yTWVzc2FnZS50eXBlcztcblxuLyoqXG4gKiBDb21tYW5kIGNsYXNzXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7e2V4ZWN1dGU6IGZ1bmN0aW9uLCB1bmRvOiBmdW5jdGlvbn19IGFjdGlvbnMgLSBDb21tYW5kIGFjdGlvbnNcbiAqL1xudmFyIENvbW1hbmQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENvbW1hbmQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGFjdGlvbnMpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4ZWN1dGUgZnVuY3Rpb25cbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leGVjdXRlID0gYWN0aW9ucy5leGVjdXRlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVbmRvIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kbyA9IGFjdGlvbnMudW5kbztcblxuICAgICAgICAvKipcbiAgICAgICAgICogZXhlY3V0ZUNhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leGVjdXRlQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1bmRvQ2FsbGJhY2tcbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG9DYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICdleGVjdXRlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvIGFjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAndW5kbycpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV4ZWN1dGUgY2FsbGFiY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGFmdGVyIGV4ZWN1dGlvblxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kfSB0aGlzXG4gICAgICovXG4gICAgc2V0RXhlY3V0ZUNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmV4ZWN1dGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggdW5kbyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgYWZ0ZXIgdW5kb1xuICAgICAqIEByZXR1cm5zIHtDb21tYW5kfSB0aGlzXG4gICAgICovXG4gICAgc2V0VW5kb0NhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnVuZG9DYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbWFnZUxvYWRlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ltYWdlTG9hZGVyJyk7XG52YXIgQ3JvcHBlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2Nyb3BwZXInKTtcbnZhciBNYWluQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQvbWFpbicpO1xudmFyIEZsaXAgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mbGlwJyk7XG52YXIgUm90YXRpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudC9yb3RhdGlvbicpO1xuXG4vKipcbiAqIEludm9rZXJcbiAqIEBjbGFzc1xuICovXG52YXIgSW52b2tlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW52b2tlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVbmRvIHN0YWNrXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48Q29tbWFuZD59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWRvIHN0YWNrXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48Q29tbWFuZD59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21wb25lbnQgbWFwXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwID0ge307XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlQ29tcG9uZW50cygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY29tcG9uZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWFpbiA9IG5ldyBNYWluQ29tcG9uZW50KCk7XG5cbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobWFpbik7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBJbWFnZUxvYWRlcihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBDcm9wcGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEZsaXAobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgUm90YXRpb24obWFpbikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IC0gQ29tcG9uZW50IGhhbmRsaW5nIHRoZSBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZWdpc3RlcjogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50TWFwW2NvbXBvbmVudC5nZXROYW1lKCldID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Q29tcG9uZW50OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudE1hcFtuYW1lXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmRcbiAgICAgKiBTdG9yZSB0aGUgY29tbWFuZCB0byB0aGUgdW5kb1N0YWNrXG4gICAgICogQ2xlYXIgdGhlIHJlZG9TdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIENvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGludm9rZTogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuICQud2hlbihjb21tYW5kLmV4ZWN1dGUodGhpcy5jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bmRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgICAgICAgICBzZWxmLmNsZWFyUmVkb1N0YWNrKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmRvbmUoY29tbWFuZC5leGVjdXRlQ2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWFuZCA9IHRoaXMudW5kb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBqcURlZmVyO1xuXG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC53aGVuKGNvbW1hbmQudW5kbyh0aGlzLmNvbXBvbmVudE1hcCkpXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVkb1N0YWNrLnB1c2goY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZShjb21tYW5kLnVuZG9DYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5yZWRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGpxRGVmZXI7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLndoZW4oY29tbWFuZC5leGVjdXRlKHRoaXMuY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgICAgICAuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi51bmRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKGNvbW1hbmQuZXhlY3V0ZUNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLkRlZmVycmVkKCkucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID09PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgdW5kb1N0YWNrIGlzIGVtcHR5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNFbXB0eVVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51bmRvU3RhY2sgPSBbXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlZG9TdGFjayA9IFtdO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludm9rZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW4gPSBNYXRoLm1pbixcbiAgICBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQ2xhbXAgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5WYWx1ZSAtIE1pbmltdW0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4VmFsdWUgLSBNYXhpbXVtIHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gY2xhbXBlZCB2YWx1ZVxuICAgICAqL1xuICAgIGNsYW1wOiBmdW5jdGlvbih2YWx1ZSwgbWluVmFsdWUsIG1heFZhbHVlKSB7XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICBpZiAobWluVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgdGVtcCA9IG1pblZhbHVlO1xuICAgICAgICAgICAgbWluVmFsdWUgPSBtYXhWYWx1ZTtcbiAgICAgICAgICAgIG1heFZhbHVlID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXgobWluVmFsdWUsIG1pbih2YWx1ZSwgbWF4VmFsdWUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBrZXktdmFsdWUgb2JqZWN0IGZyb20gYXJndW1lbnRzXG4gICAgICogQHJldHVybnMge29iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGtleU1pcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmogPSB7fTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IGtleTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG59O1xuIl19
