(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":12}],2:[function(require,module,exports){
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
            strokeWidth: 0, // {@link https://github.com/kangax/fabric.js/issues/2860}
            cornerSize: 10,
            cornerColor: 'black',
            fill: 'transparent',
            hasRotatingPoint: false,
            hasBorders: false,
            lockScalingFlip: true,
            lockRotation: true
        });
        canvas = this.getCanvas();
        canvas.deactivateAll();
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

},{"../consts":8,"../extension/cropzone":9,"../interface/component":15,"../util":17}],3:[function(require,module,exports){
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

},{"../consts":8,"../interface/Component":13}],4:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Free drawing module, Set brush
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * FreeDrawing
 * @class FreeDrawing
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var FreeDrawing = tui.util.defineClass(Component, /** @lends FreeDrawing.prototype */{
    init: function(parent) {
        this.setParent(parent);

        this.width = 12;
        this.color = 'rgba(0, 0, 0, 0.5)';
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
        this.setBrush(setting);
    },

    /**
     * Set brush
     * @param {{width: ?number, color: ?string}} setting - Brush width & color
     */
    setBrush: function(setting) {
        var brush = this.getCanvas().freeDrawingBrush;

        if (!setting) {
            return;
        }

        this.width = setting.width || this.width;
        this.color = setting.color || this.color;
        brush.width = this.width;
        brush.color = this.color;
    },

    /**
     * End free drawing mode
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.isDrawingMode = false;
    }
});

module.exports = FreeDrawing;

},{"../consts":8,"../interface/Component":13}],5:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var imageOption = {
    padding: 0,
    crossOrigin: 'anonymous'
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
                self.setCanvasImage(imageName, oImage);
                self.adjustCanvasDimension();
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
        var boundingRect = oImage.getBoundingRect();
        var width = boundingRect.width;
        var height = boundingRect.height;

        this.setCanvasCssDimension({
            width: '100%',
            height: '',  // No inline-css "height" for IE9
            'max-width': width + 'px'
        });
        this.setCanvasBackstoreDimension({
            width: width,
            height: height
        });
    }
});

module.exports = ImageLoader;

},{"../consts":8,"../interface/component":15}],6:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var DEFAULT_MAX_WIDTH = 1000;
var DEFAULT_MAX_HEIGHT = 700;

var cssOnly = {cssOnly: true};
var backstoreOnly = {backstoreOnly: true};
/**
 * Main component
 * @extends {Component}
 * @class
 * @param {{maxWidth: number, maxHeight: number}} option - Option
 */
var Main = tui.util.defineClass(Component, /** @lends Main.prototype */{
    init: function(option) {
        option = option || {};

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

        this.maxWidth = DEFAULT_MAX_WIDTH || option.maxWidth;

        this.maxHeight = DEFAULT_MAX_HEIGHT || option.maxHeight;

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
        tui.util.stamp(oImage);
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
            containerClass: 'tui-imageEditor-canvasContainer'
        });
    },

    /**
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension: function() {
        var canvasImage = this.getCanvasImage().scale(1);
        var boundingRect = canvasImage.getBoundingRect();
        var width = boundingRect.width;
        var height = boundingRect.height;
        var wScaleFactor = this.maxWidth / width;
        var hScaleFactor = this.maxHeight / height;
        var maxWidth = Math.min(width, this.maxWidth);
        var maxHeight = Math.min(height, this.maxHeight);

        if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
            maxWidth = width * wScaleFactor;
            maxHeight = height * wScaleFactor;
        } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
            maxWidth = width * hScaleFactor;
            maxHeight = height * hScaleFactor;
        }

        this.setCanvasCssDimension({
            width: '100%',
            height: '', // Set height '' for IE9
            'max-width': maxWidth + 'px',
            'max-height': maxHeight + 'px'
        });
        this.setCanvasBackstoreDimension({
            width: width,
            height: height
        });
        this.getCanvas().centerObject(canvasImage);
    },

    /**
     * Set canvas dimension - css only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas css dimension
     * @override
     */
    setCanvasCssDimension: function(dimension) {
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

},{"../consts":8,"../interface/component":15}],7:[function(require,module,exports){
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
     *
     *  Do not call "this.setImageProperties" for setting angle directly.
     *  Before setting angle, The originX,Y of image should be set to center.
     *      See "http://fabricjs.com/docs/fabric.Object.html#setAngle"
     *
     * @param {number} angle - Angle value
     * @returns {jQuery.Deferred}
     */
    setAngle: function(angle) {
        var current = this.getCurrentAngle() % 360;
        var jqDefer = $.Deferred();
        var canvas = this.getCanvas();
        var canvasImage;

        angle %= 360;
        if (angle === current) {
            return jqDefer.reject();
        }
        canvasImage = this.getCanvasImage();
        canvasImage.setAngle(angle).setCoords();
        canvas.getObjects().forEach(function(obj) {
            obj.setAngle(angle).setCoords();
        });
        this.adjustCanvasDimension();

        return jqDefer.resolve(angle);
    },

    /**
     * Rotate the image
     * @param {number} additionalAngle - Additional angle
     * @returns {jQuery.Deferred}
     */
    rotate: function(additionalAngle) {
        var current = this.getCurrentAngle();

        // The angle is lower than 2*PI(===360 degrees)
        return this.setAngle((current + additionalAngle) % 360);
    }
});

module.exports = Rotation;

},{"../consts":8,"../interface/Component":13}],8:[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = {
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER',
        'FLIP',
        'ROTATION',
        'FREE_DRAWING'
    ),

    commandNames: util.keyMirror(
        'CLEAR',
        'LOAD_IMAGE',
        'FLIP_IMAGE',
        'ROTATE_IMAGE',
        'ADD_OBJECT'
    ),

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_OBJECTS: 'clear',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        FLIP_IMAGE: 'flipImage',
        ROTATE_IMAGE: 'rotateImage',
        ADD_OBJECT: 'addObject',
        REMOVE_OBJECT: 'removeObject',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};

},{"./util":17}],9:[function(require,module,exports){
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

},{"../util":17}],10:[function(require,module,exports){
'use strict';

var Command = require('../interface/command');
var consts = require('../consts');

var componentNames = consts.componentNames;
var commandNames = consts.commandNames;
var creators = {};

var MAIN = componentNames.MAIN;
var IMAGE_LOADER = componentNames.IMAGE_LOADER;
var FLIP = componentNames.FLIP;
var ROTATION = componentNames.ROTATION;

/**
 * Set mapping creators
 */
creators[commandNames.LOAD_IMAGE] = createLoadImageCommand;
creators[commandNames.FLIP_IMAGE] = createFlipImageCommand;
creators[commandNames.ROTATE_IMAGE] = createRotationImageCommand;
creators[commandNames.CLEAR_OBJECTS] = createClearCommand;
creators[commandNames.ADD_OBJECT] = createAddObjectCommand;

/**
 * @param {fabric.Object} object - Fabric object
 * @returns {Command}
 */
function createAddObjectCommand(object) {
    tui.util.stamp(object);

    return new Command({
        execute: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();

            if (!canvas.contains(object)) {
                canvas.add(object);
                jqDefer.resolve(object);
            } else {
                jqDefer.reject();
            }

            return jqDefer;
        },
        undo: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();

            if (canvas.contains(object)) {
                canvas.remove(object);
            } else {
                jqDefer.reject();
            }

            return jqDefer.resolve(object);
        }
    });
}

/**
 * @param {string} imageName - Image name
 * @param {string} url - Image url
 * @returns {Command}
 */
function createLoadImageCommand(imageName, url) {
    return new Command({
        execute: function(compMap) {
            var loader = compMap[IMAGE_LOADER];
            var canvas = loader.getCanvas();

            this.store = {
                prevName: loader.getImageName(),
                prevImage: loader.getCanvasImage(),
                // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
                objects: canvas.getObjects().slice()
            };
            canvas.clear();

            return loader.load(imageName, url);
        },
        undo: function(compMap) {
            var loader = compMap[IMAGE_LOADER];
            var canvas = loader.getCanvas();
            var store = this.store;

            canvas.clear();
            canvas.add.apply(canvas, store.objects);

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
 * @param {string} type - 'rotate' or 'setAngle'
 * @param {number} angle - angle value (degree)
 * @returns {$.Deferred}
 */
function createRotationImageCommand(type, angle) {
    return new Command({
        execute: function(compMap) {
            var rotationComp = compMap[ROTATION];

            this.store = rotationComp.getCurrentAngle();

            return rotationComp[type](angle);
        },
        undo: function(compMap) {
            var rotationComp = compMap[ROTATION];

            return rotationComp.setAngle(this.store);
        }
    });
}

/**
 * @returns {Command}
 */
function createClearCommand() {
    return new Command({
        execute: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();

            // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
            this.store = canvas.getObjects().slice();
            if (this.store.length) {
                canvas.clear();
                jqDefer.resolve();
            } else {
                jqDefer.reject();
            }

            return jqDefer;
        },
        undo: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();

            canvas.add.apply(canvas, this.store);
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

},{"../consts":8,"../interface/command":14}],11:[function(require,module,exports){
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

},{"../util":17}],12:[function(require,module,exports){
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
         * Invoker
         * @private
         * @type {Invoker}
         */
        this._invoker = new Invoker();

        /**
         * Fabric-Canvas instance
         * @type {fabric.Canvas}
         * @private
         */
        this._canvas = null;

        this._setCanvas(canvasElement);
        this._attachInvokerEvents();
        this._attachCanvasEvents();
    },

    /**
     * Attach invoker events
     * @private
     */
    _attachInvokerEvents: function() {
        var PUSH_UNDO_STACK = events.PUSH_UNDO_STACK;
        var PUSH_REDO_STACK = events.PUSH_REDO_STACK;
        var EMPTY_UNDO_STACK = events.EMPTY_UNDO_STACK;
        var EMPTY_REDO_STACK = events.EMPTY_REDO_STACK;

        this._invoker.on(PUSH_UNDO_STACK, $.proxy(this.fire, this, PUSH_UNDO_STACK));
        this._invoker.on(PUSH_REDO_STACK, $.proxy(this.fire, this, PUSH_REDO_STACK));
        this._invoker.on(EMPTY_UNDO_STACK, $.proxy(this.fire, this, EMPTY_UNDO_STACK));
        this._invoker.on(EMPTY_REDO_STACK, $.proxy(this.fire, this, EMPTY_REDO_STACK));
    },

    /**
     * Attach canvas events
     * @private
     */
    _attachCanvasEvents: function() {
        this._canvas.on({
            'path:created': $.proxy(this._onPathCreated, this),
            'object:added': $.proxy(function(event) {
                var obj = event.target;
                var command;
                if (!tui.util.hasStamp(obj)) {
                    command = commandFactory.create(commands.ADD_OBJECT, obj);
                    this.fire(events.ADD_OBJECT, obj);
                    this._invoker.pushUndoStack(command);
                }
            }, this),
            'object:removed': $.proxy(function(event) {
                this.fire(events.REMOVE_OBJECT, event.target);
            }, this)
        });
    },

    /**
     * EventListener - "path:created"
     *  - Events:: "object:added" -> "path:created"
     * @param {{path: fabric.Path}} obj - Path object
     * @private
     */
    _onPathCreated: function(obj) {
        var path = obj.path;

        path.set({
            rotatingPointOffset: 30,
            borderColor: 'red',
            transparentCorners: false,
            cornerColor: 'green',
            cornerSize: 6
        });
    },

    /**
     * Set canvas element
     * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
     * @private
     */
    _setCanvas: function(canvasElement) {
        var mainComponent;

        mainComponent = this._getMainComponent();
        mainComponent.setCanvasElement(canvasElement);
        this._canvas = mainComponent.getCanvas();
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
     * Clear all objects
     */
    clear: function() {
        var command = commandFactory.create(commands.CLEAR_OBJECTS);
        var callback = $.proxy(this.fire, this, events.CLEAR_OBJECTS);

        command.setExecuteCallback(callback);
        this.execute(command);
    },

    /**
     * End current action
     */
    endAll: function() {
        this.endFreeDrawing();
        this.endCropping();
        this.deactivateAll();
    },

    /**
     * Deactivate all objects
     */
    deactivateAll: function() {
        this._canvas.deactivateAll();
    },

    /**
     * Invoke command
     * @param {Command} command - Command
     */
    execute: function(command) {
        this.endAll();
        this._invoker.invoke(command);
    },

    /**
     * Undo
     */
    undo: function() {
        this.endAll();
        this._invoker.undo();
    },

    /**
     * Redo
     */
    redo: function() {
        this.endAll();
        this._invoker.redo();
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

        this.endAll();
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
     * @param {string} type - 'rotate' or 'setAngle'
     * @param {number} angle - angle value (degree)
     * @private
     */
    _rotate: function(type, angle) {
        var callback = $.proxy(this.fire, this, events.ROTATE_IMAGE);
        var command = commandFactory.create(commands.ROTATE_IMAGE, type, angle);

        command.setExecuteCallback(callback)
            .setUndoCallback(callback);
        this.execute(command);
    },

    /**
     * Rotate image
     * @param {number} angle - Additional angle to rotate image
     */
    rotate: function(angle) {
        this._rotate('rotate', angle);
    },

    /**
     * Set angle
     * @param {number} angle - Angle of image
     */
    setAngle: function(angle) {
        this._rotate('setAngle', angle);
    },

    /**
     * Start free-drawing mode
     * @param {{width: number, color: string}} setting - Brush width & color
     */
    startFreeDrawing: function(setting) {
        this.endAll();
        this._getComponent(compList.FREE_DRAWING).start(setting);
    },

    /**
     * Set drawing brush
     * @param {{width: number, color: string}} setting - Brush width & color
     */
    setBrush: function(setting) {
        this._getComponent(compList.FREE_DRAWING).setBrush(setting);
    },

    /**
     * End free-drawing mode
     */
    endFreeDrawing: function() {
        this._getComponent(compList.FREE_DRAWING).end();
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
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this._invoker.clearRedoStack();
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;

},{"./consts":8,"./factory/command":10,"./invoker":16}],13:[function(require,module,exports){
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
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension: function() {
        this.getRoot().adjustCanvasDimension();
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

},{}],14:[function(require,module,exports){
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

},{"../factory/errorMessage":11}],15:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],16:[function(require,module,exports){
'use strict';

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');
var MainComponent = require('./component/main');
var Flip = require('./component/flip');
var Rotation = require('./component/rotation');
var FreeDrawing = require('./component/freeDrawing');
var eventNames = require('./consts').eventNames;

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/** @lends Invoker.prototype */{
    init: function() {
        /**
         * Custom Events
         * @type {tui.util.CustomEvents}
         */
        this._customEvents = new tui.util.CustomEvents();

        /**
         * Undo stack
         * @type {Array.<Command>}
         * @private
         */
        this._undoStack = [];

        /**
         * Redo stack
         * @type {Array.<Command>}
         * @private
         */
        this._redoStack = [];

        /**
         * Component map
         * @type {Object.<string, Component>}
         * @private
         */
        this._componentMap = {};

        /**
         * Lock-flag for executing command
         * @type {boolean}
         * @private
         */
        this._isLocked = false;

        /**
         * Bound method to lock
         * @type {Function}
         */
        this.lock = $.proxy(this.lock, this);

        /**
         * Bound method to unlock
         * @type {Function}
         */
        this.unlock = $.proxy(this.unlock, this);


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
        this._register(new FreeDrawing(main));
    },

    /**
     * Register component
     * @param {Component} component - Component handling the canvas
     * @private
     */
    _register: function(component) {
        this._componentMap[component.getName()] = component;
    },

    /**
     * Invoke command execution
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     * @private
     */
    _invokeExecution: function(command) {
        var self = this;

        return $.when(this.lock, command.execute(this._componentMap))
            .done(function() {
                self.pushUndoStack(command);
            })
            .done(command.executeCallback)
            .always(this.unlock);
    },

    /**
     * Invoke command undo
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     * @private
     */
    _invokeUndo: function(command) {
        var self = this;

        return $.when(this.lock, command.undo(this._componentMap))
            .done(function() {
                self.pushRedoStack(command);
            })
            .done(command.undoCallback)
            .always(this.unlock);
    },

    /**
     * Fire custom events
     * @see {@link tui.util.CustomEvents.prototype.fire}
     * @param {...*} arguments - Arguments to fire a event
     * @private
     */
    _fire: function() {
        var event = this._customEvents;
        event.fire.apply(event, arguments);
    },

    /**
     * Attach custom events
     * @see {@link tui.util.CustomEvents.prototype.on}
     * @param {...*} arguments - Arguments to attach events
     */
    on: function() {
        var event = this._customEvents;
        event.on.apply(event, arguments);
    },

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    getComponent: function(name) {
        return this._componentMap[name];
    },

    /**
     * Lock this invoker
     */
    lock: function() {
        this._isLocked = true;
    },

    /**
     * Unlock this invoker
     */
    unlock: function() {
        this._isLocked = false;
    },

    /**
     * Invoke command
     * Store the command to the undoStack
     * Clear the redoStack
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     */
    invoke: function(command) {
        if (this._isLocked) {
            return $.Deferred.reject();
        }

        return this._invokeExecution(command)
            .done($.proxy(this.clearRedoStack, this));
    },

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo: function() {
        var command = this._undoStack.pop();
        var jqDefer;

        if (command && this._isLocked) {
            this.pushUndoStack(command, true);
            command = null;
        }
        if (command) {
            if (this.isEmptyUndoStack()) {
                this._fire(eventNames.EMPTY_UNDO_STACK);
            }
            jqDefer = this._invokeUndo(command);
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
        var command = this._redoStack.pop();
        var jqDefer;

        if (command && this._isLocked) {
            this.pushRedoStack(command, true);
            command = null;
        }
        if (command) {
            if (this.isEmptyRedoStack()) {
                this._fire(eventNames.EMPTY_REDO_STACK);
            }
            jqDefer = this._invokeExecution(command);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
    },

    /**
     * Push undo stack
     * @param {Command} command - command
     * @param {boolean} [isSilent] - Fire event or not
     */
    pushUndoStack: function(command, isSilent) {
        this._undoStack.push(command);
        if (!isSilent) {
            this._fire(eventNames.PUSH_UNDO_STACK);
        }
    },

    /**
     * Push redo stack
     * @param {Command} command - command
     * @param {boolean} [isSilent] - Fire event or not
     */
    pushRedoStack: function(command, isSilent) {
        this._redoStack.push(command);
        if (!isSilent) {
            this._fire(eventNames.PUSH_REDO_STACK);
        }
    },

    /**
     * Return whether the redoStack is empty
     * @returns {boolean}
     */
    isEmptyRedoStack: function() {
        return this._redoStack.length === 0;
    },

    /**
     * Return whether the undoStack is empty
     * @returns {boolean}
     */
    isEmptyUndoStack: function() {
        return this._undoStack.length === 0;
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        if (!this.isEmptyUndoStack()) {
            this._undoStack = [];
            this._fire(eventNames.EMPTY_UNDO_STACK);
        }
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        if (!this.isEmptyRedoStack()) {
            this._redoStack = [];
            this._fire(eventNames.EMPTY_REDO_STACK);
        }
    }
});

module.exports = Invoker;

},{"./component/cropper":2,"./component/flip":3,"./component/freeDrawing":4,"./component/imageLoader":5,"./component/main":6,"./component/rotation":7,"./consts":8}],17:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvZnJlZURyYXdpbmcuanMiLCJzcmMvanMvY29tcG9uZW50L2ltYWdlTG9hZGVyLmpzIiwic3JjL2pzL2NvbXBvbmVudC9tYWluLmpzIiwic3JjL2pzL2NvbXBvbmVudC9yb3RhdGlvbi5qcyIsInNyYy9qcy9jb25zdHMuanMiLCJzcmMvanMvZXh0ZW5zaW9uL2Nyb3B6b25lLmpzIiwic3JjL2pzL2ZhY3RvcnkvY29tbWFuZC5qcyIsInNyYy9qcy9mYWN0b3J5L2Vycm9yTWVzc2FnZS5qcyIsInNyYy9qcy9pbWFnZUVkaXRvci5qcyIsInNyYy9qcy9pbnRlcmZhY2UvQ29tcG9uZW50LmpzIiwic3JjL2pzL2ludGVyZmFjZS9jb21tYW5kLmpzIiwic3JjL2pzL2ludm9rZXIuanMiLCJzcmMvanMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkltYWdlRWRpdG9yJywgcmVxdWlyZSgnLi9zcmMvanMvaW1hZ2VFZGl0b3InKSwgdHJ1ZSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIENyb3B6b25lID0gcmVxdWlyZSgnLi4vZXh0ZW5zaW9uL2Nyb3B6b25lJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIE1PVVNFX01PVkVfVEhSRVNIT0xEID0gMTA7XG5cbnZhciBhYnMgPSBNYXRoLmFicztcbnZhciBjbGFtcCA9IHV0aWwuY2xhbXA7XG5cbi8qKlxuICogQ3JvcHBlciBjb21wb25lbnRzXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBDcm9wcGVyXG4gKi9cbnZhciBDcm9wcGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIENyb3BwZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7Q3JvcHpvbmV9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WCBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnRZIG9mIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsaXN0ZW5lcnNcbiAgICAgICAgICogQHR5cGUge29iamVjdC48c3RyaW5nLCBmdW5jdGlvbj59IEhhbmRsZXIgaGFzaCBmb3IgZmFicmljIGNhbnZhc1xuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNlbW92ZTogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlTW92ZSwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZXVwOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VVcCwgdGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5DUk9QUEVSLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2Nyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG5ldyBDcm9wem9uZSh7XG4gICAgICAgICAgICBsZWZ0OiAtMTAsXG4gICAgICAgICAgICB0b3A6IC0xMCxcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsIC8vIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20va2FuZ2F4L2ZhYnJpYy5qcy9pc3N1ZXMvMjg2MH1cbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcblxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlZG93biBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlRG93bjogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY29vcmQ7XG5cbiAgICAgICAgaWYgKGZFdmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgY29vcmQgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG5cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gY29vcmQueDtcbiAgICAgICAgdGhpcy5fc3RhcnRZID0gY29vcmQueTtcblxuICAgICAgICBjYW52YXMub24oe1xuICAgICAgICAgICAgJ21vdXNlOm1vdmUnOiB0aGlzLl9saXN0ZW5lcnMubW91c2Vtb3ZlLFxuICAgICAgICAgICAgJ21vdXNlOnVwJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNldXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vtb3ZlIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VNb3ZlOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuICAgICAgICB2YXIgeCA9IHBvaW50ZXIueDtcbiAgICAgICAgdmFyIHkgPSBwb2ludGVyLnk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuXG4gICAgICAgIGlmIChhYnMoeCAtIHRoaXMuX3N0YXJ0WCkgKyBhYnMoeSAtIHRoaXMuX3N0YXJ0WSkgPiBNT1VTRV9NT1ZFX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgY3JvcHpvbmUucmVtb3ZlKCk7XG4gICAgICAgICAgICBjcm9wem9uZS5zZXQodGhpcy5fY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQoeCwgeSkpO1xuXG4gICAgICAgICAgICBjYW52YXMuYWRkKGNyb3B6b25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVjdCBkaW1lbnNpb24gc2V0dGluZyBmcm9tIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbih4LCB5KVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciB3aWR0aCA9IGNhbnZhcy5nZXRXaWR0aCgpO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmdldEhlaWdodCgpO1xuICAgICAgICB2YXIgc3RhcnRYID0gdGhpcy5fc3RhcnRYO1xuICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5fc3RhcnRZO1xuICAgICAgICB2YXIgbGVmdCA9IGNsYW1wKHgsIDAsIHN0YXJ0WCk7XG4gICAgICAgIHZhciB0b3AgPSBjbGFtcCh5LCAwLCBzdGFydFkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICB3aWR0aDogY2xhbXAoeCwgc3RhcnRYLCB3aWR0aCkgLSBsZWZ0LCAvLyAoc3RhcnRYIDw9IHgobW91c2UpIDw9IGNhbnZhc1dpZHRoKSAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGNsYW1wKHksIHN0YXJ0WSwgaGVpZ2h0KSAtIHRvcCAvLyAoc3RhcnRZIDw9IHkobW91c2UpIDw9IGNhbnZhc0hlaWdodCkgLSB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZXVwIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBjYW52YXMuc2V0QWN0aXZlT2JqZWN0KGNyb3B6b25lKTtcbiAgICAgICAgY2FudmFzLm9mZih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IGxpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiBsaXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNyb3BwZWQgaW1hZ2UgZGF0YVxuICAgICAqIEByZXR1cm5zIHs/e2ltYWdlTmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZ319IGNyb3BwZWQgSW1hZ2UgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENyb3BwZWRJbWFnZURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGNyb3BJbmZvO1xuXG4gICAgICAgIGlmICghY3JvcHpvbmUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyb3BJbmZvID0ge1xuICAgICAgICAgICAgbGVmdDogY3JvcHpvbmUuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wOiBjcm9wem9uZS5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoOiBjcm9wem9uZS5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBjcm9wem9uZS5nZXRIZWlnaHQoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbWFnZU5hbWU6IHRoaXMuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICB1cmw6IHRoaXMuZ2V0Q2FudmFzKCkudG9EYXRhVVJMKGNyb3BJbmZvKVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3BwZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBmbGlwIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogRmxpcFxuICogQGNsYXNzIEZsaXBcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRmxpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGbGlwLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GTElQLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHt7ZmxpcFg6IEJvb2xlYW4sIGZsaXBZOiBCb29sZWFufX1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50U2V0dGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmxpcFg6IGNhbnZhc0ltYWdlLmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6IGNhbnZhc0ltYWdlLmZsaXBZXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBmbGlwWCwgZmxpcFlcbiAgICAgKiBAcGFyYW0ge3tmbGlwWDogP0Jvb2xlYW4sIGZsaXBZOiA/Qm9vbGVhbn19IG5ld1NldHRpbmcgLSBGbGlwIHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24obmV3U2V0dGluZykge1xuICAgICAgICB2YXIgc2V0dGluZyA9IHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKTtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBpc0NoYW5naW5nRmxpcFggPSAoc2V0dGluZy5mbGlwWCAhPT0gISFuZXdTZXR0aW5nLmZsaXBYKTtcbiAgICAgICAgdmFyIGlzQ2hhbmdpbmdGbGlwWSA9IChzZXR0aW5nLmZsaXBZICE9PSAhIW5ld1NldHRpbmcuZmxpcFkpO1xuICAgICAgICB2YXIgYW5nbGU7XG5cbiAgICAgICAgaWYgKCFpc0NoYW5naW5nRmxpcFggJiYgIWlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNDaGFuZ2luZ0ZsaXBYKSB7XG4gICAgICAgICAgICBhbmdsZSA9IHRoaXMuX25lZ2F0ZUFuZ2xlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICAgICAgYW5nbGUgPSB0aGlzLl9uZWdhdGVBbmdsZSgpO1xuICAgICAgICB9XG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChzZXR0aW5nLCBuZXdTZXR0aW5nKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVByb3BlcnRpZXMoc2V0dGluZywgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShzZXR0aW5nLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5lZ2F0ZSBhbmdsZSBmb3IgZmxpcFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IE5lZ2F0ZWQgYW5nbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9uZWdhdGVBbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICAgICAgdmFyIGFuZ2xlID0gcGFyc2VGbG9hdChjYW52YXNJbWFnZS5hbmdsZSAqIC0xKTsgLy8gcGFyc2VGbG9hdCBmb3IgLTAgdG8gMFxuXG4gICAgICAgIGNhbnZhc0ltYWdlLnNldEFuZ2xlKGFuZ2xlKTtcblxuICAgICAgICByZXR1cm4gYW5nbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGZsaXAgc2V0dGluZ3NcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiBmYWxzZSxcbiAgICAgICAgICAgIGZsaXBZOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB4XG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBmbGlwWDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhbmdsZSA9IHRoaXMuX25lZ2F0ZUFuZ2xlKCk7XG5cbiAgICAgICAgdGhpcy50b2dnbGVJbWFnZVByb3BlcnRpZXMoWydmbGlwWCddLCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUodGhpcy5nZXRDdXJyZW50U2V0dGluZygpLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgZmxpcFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYW5nbGUgPSB0aGlzLl9uZWdhdGVBbmdsZSgpO1xuXG4gICAgICAgIHRoaXMudG9nZ2xlSW1hZ2VQcm9wZXJ0aWVzKFsnZmxpcFknXSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKSwgYW5nbGUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaXA7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBGcmVlIGRyYXdpbmcgbW9kdWxlLCBTZXQgYnJ1c2hcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEZyZWVEcmF3aW5nXG4gKiBAY2xhc3MgRnJlZURyYXdpbmdcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRnJlZURyYXdpbmcgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRnJlZURyYXdpbmcucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSAxMjtcbiAgICAgICAgdGhpcy5jb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuNSknO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLkZSRUVfRFJBV0lORyxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGZyZWUgZHJhd2luZyBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5pc0RyYXdpbmdNb2RlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRCcnVzaChzZXR0aW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGJydXNoXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gc2V0dGluZyAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKi9cbiAgICBzZXRCcnVzaDogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB2YXIgYnJ1c2ggPSB0aGlzLmdldENhbnZhcygpLmZyZWVEcmF3aW5nQnJ1c2g7XG5cbiAgICAgICAgaWYgKCFzZXR0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndpZHRoID0gc2V0dGluZy53aWR0aCB8fCB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmNvbG9yID0gc2V0dGluZy5jb2xvciB8fCB0aGlzLmNvbG9yO1xuICAgICAgICBicnVzaC53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGJydXNoLmNvbG9yID0gdGhpcy5jb2xvcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGZyZWUgZHJhd2luZyBtb2RlXG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmlzRHJhd2luZ01vZGUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGcmVlRHJhd2luZztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGltYWdlT3B0aW9uID0ge1xuICAgIHBhZGRpbmc6IDAsXG4gICAgY3Jvc3NPcmlnaW46ICdhbm9ueW1vdXMnXG59O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBJbWFnZUxvYWRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSLFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gaW1hZ2VOYW1lIC0gRmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxzdHJpbmcpfSBpbWcgLSBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH0gZGVmZXJyZWRcbiAgICAgKi9cbiAgICBsb2FkOiBmdW5jdGlvbihpbWFnZU5hbWUsIGltZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBqcURlZmVyLCBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgJiYgIWltZykgeyAvLyBCYWNrIHRvIHRoZSBpbml0aWFsIHN0YXRlLCBub3QgZXJyb3IuXG4gICAgICAgICAgICBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICAgICAgY2FudmFzLmJhY2tncm91bmRJbWFnZSA9IG51bGw7XG4gICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLkRlZmVycmVkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FudmFzSW1hZ2UoJycsIG51bGwpO1xuICAgICAgICAgICAgfSkucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX3NldEJhY2tncm91bmRJbWFnZShpbWcpLmRvbmUoZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZShpbWFnZU5hbWUsIG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvSW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpbWFnZU9wdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU3VjY2VzcyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblN1Y2Nlc3NJbWFnZUxvYWQ6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgYm91bmRpbmdSZWN0ID0gb0ltYWdlLmdldEJvdW5kaW5nUmVjdCgpO1xuICAgICAgICB2YXIgd2lkdGggPSBib3VuZGluZ1JlY3Qud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSBib3VuZGluZ1JlY3QuaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcnLCAgLy8gTm8gaW5saW5lLWNzcyBcImhlaWdodFwiIGZvciBJRTlcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiB3aWR0aCArICdweCdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlTG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgREVGQVVMVF9NQVhfV0lEVEggPSAxMDAwO1xudmFyIERFRkFVTFRfTUFYX0hFSUdIVCA9IDcwMDtcblxudmFyIGNzc09ubHkgPSB7Y3NzT25seTogdHJ1ZX07XG52YXIgYmFja3N0b3JlT25seSA9IHtiYWNrc3RvcmVPbmx5OiB0cnVlfTtcbi8qKlxuICogTWFpbiBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7e21heFdpZHRoOiBudW1iZXIsIG1heEhlaWdodDogbnVtYmVyfX0gb3B0aW9uIC0gT3B0aW9uXG4gKi9cbnZhciBNYWluID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIE1haW4ucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBjYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkltYWdlfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vSW1hZ2UgPSBudWxsO1xuXG4gICAgICAgIHRoaXMubWF4V2lkdGggPSBERUZBVUxUX01BWF9XSURUSCB8fCBvcHRpb24ubWF4V2lkdGg7XG5cbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSBERUZBVUxUX01BWF9IRUlHSFQgfHwgb3B0aW9uLm1heEhlaWdodDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW1hZ2UgbmFtZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbWFnZU5hbWUgPSAnJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5NQUlOLFxuXG4gICAgLyoqXG4gICAgICogVG8gZGF0YSB1cmwgZnJvbSBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEEgRE9NU3RyaW5nIGluZGljYXRpbmcgdGhlIGltYWdlIGZvcm1hdC4gVGhlIGRlZmF1bHQgdHlwZSBpcyBpbWFnZS9wbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQSBET01TdHJpbmcgY29udGFpbmluZyB0aGUgcmVxdWVzdGVkIGRhdGEgVVJJLlxuICAgICAqL1xuICAgIHRvRGF0YVVSTDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMgJiYgdGhpcy5jYW52YXMudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGltYWdlKGJhY2tncm91bmQpIG9mIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBpbWFnZVxuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNJbWFnZTogZnVuY3Rpb24obmFtZSwgb0ltYWdlKSB7XG4gICAgICAgIHR1aS51dGlsLnN0YW1wKG9JbWFnZSk7XG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5vSW1hZ2UgPSBvSW1hZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZWxlbWVudCB0byBmYWJyaWMuQ2FudmFzXG4gICAgICogQHBhcmFtIHtqUXVlcnl8RWxlbWVudHxzdHJpbmd9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcygkKGNhbnZhc0VsZW1lbnQpWzBdLCB7XG4gICAgICAgICAgICBjb250YWluZXJDbGFzczogJ3R1aS1pbWFnZUVkaXRvci1jYW52YXNDb250YWluZXInXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiB3aXRoIHNjYWxpbmcgaW1hZ2VcbiAgICAgKi9cbiAgICBhZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCkuc2NhbGUoMSk7XG4gICAgICAgIHZhciBib3VuZGluZ1JlY3QgPSBjYW52YXNJbWFnZS5nZXRCb3VuZGluZ1JlY3QoKTtcbiAgICAgICAgdmFyIHdpZHRoID0gYm91bmRpbmdSZWN0LndpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gYm91bmRpbmdSZWN0LmhlaWdodDtcbiAgICAgICAgdmFyIHdTY2FsZUZhY3RvciA9IHRoaXMubWF4V2lkdGggLyB3aWR0aDtcbiAgICAgICAgdmFyIGhTY2FsZUZhY3RvciA9IHRoaXMubWF4SGVpZ2h0IC8gaGVpZ2h0O1xuICAgICAgICB2YXIgbWF4V2lkdGggPSBNYXRoLm1pbih3aWR0aCwgdGhpcy5tYXhXaWR0aCk7XG4gICAgICAgIHZhciBtYXhIZWlnaHQgPSBNYXRoLm1pbihoZWlnaHQsIHRoaXMubWF4SGVpZ2h0KTtcblxuICAgICAgICBpZiAod1NjYWxlRmFjdG9yIDwgMSAmJiB3U2NhbGVGYWN0b3IgPCBoU2NhbGVGYWN0b3IpIHtcbiAgICAgICAgICAgIG1heFdpZHRoID0gd2lkdGggKiB3U2NhbGVGYWN0b3I7XG4gICAgICAgICAgICBtYXhIZWlnaHQgPSBoZWlnaHQgKiB3U2NhbGVGYWN0b3I7XG4gICAgICAgIH0gZWxzZSBpZiAoaFNjYWxlRmFjdG9yIDwgMSAmJiBoU2NhbGVGYWN0b3IgPCB3U2NhbGVGYWN0b3IpIHtcbiAgICAgICAgICAgIG1heFdpZHRoID0gd2lkdGggKiBoU2NhbGVGYWN0b3I7XG4gICAgICAgICAgICBtYXhIZWlnaHQgPSBoZWlnaHQgKiBoU2NhbGVGYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldENhbnZhc0Nzc0RpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnJywgLy8gU2V0IGhlaWdodCAnJyBmb3IgSUU5XG4gICAgICAgICAgICAnbWF4LXdpZHRoJzogbWF4V2lkdGggKyAncHgnLFxuICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBtYXhIZWlnaHQgKyAncHgnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5nZXRDYW52YXMoKS5jZW50ZXJPYmplY3QoY2FudmFzSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGNzc09ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGJhY2tzdG9yZSBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGJhY2tzdG9yZU9ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkltYWdlLmh0bWwjc2V0fVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB2YXIgb0ltYWdlID0gdGhpcy5vSW1hZ2U7XG5cbiAgICAgICAgaWYgKCFvSW1hZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9JbWFnZS5zZXQoc2V0dGluZykuc2V0Q29vcmRzKCk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgcHJvcGVydGllcyBvZiB0aGUgaW1hZ2VcbiAgICAgKiB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5JbWFnZS5odG1sI3RvZ2dsZX1cbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwcm9wZXJ0aWVzIC0gSW1hZ2UgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICB0b2dnbGVJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdmFyIG9JbWFnZSA9IHRoaXMub0ltYWdlO1xuXG4gICAgICAgIGlmICghb0ltYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvSW1hZ2UudG9nZ2xlLmFwcGx5KG9JbWFnZSwgcHJvcGVydGllcyk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlTmFtZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2Ugcm90YXRpb24gbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBJbWFnZSBSb3RhdGlvbiBjb21wb25lbnRcbiAqIEBjbGFzcyBSb3RhdGlvblxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBSb3RhdGlvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBSb3RhdGlvbi5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLlJPVEFUSU9OLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRBbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhbmdsZSBvZiB0aGUgaW1hZ2VcbiAgICAgKlxuICAgICAqICBEbyBub3QgY2FsbCBcInRoaXMuc2V0SW1hZ2VQcm9wZXJ0aWVzXCIgZm9yIHNldHRpbmcgYW5nbGUgZGlyZWN0bHkuXG4gICAgICogIEJlZm9yZSBzZXR0aW5nIGFuZ2xlLCBUaGUgb3JpZ2luWCxZIG9mIGltYWdlIHNob3VsZCBiZSBzZXQgdG8gY2VudGVyLlxuICAgICAqICAgICAgU2VlIFwiaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbCNzZXRBbmdsZVwiXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKSAlIDM2MDtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2U7XG5cbiAgICAgICAgYW5nbGUgJT0gMzYwO1xuICAgICAgICBpZiAoYW5nbGUgPT09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuICAgICAgICBjYW52YXNJbWFnZS5zZXRBbmdsZShhbmdsZSkuc2V0Q29vcmRzKCk7XG4gICAgICAgIGNhbnZhcy5nZXRPYmplY3RzKCkuZm9yRWFjaChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIG9iai5zZXRBbmdsZShhbmdsZSkuc2V0Q29vcmRzKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuXG4gICAgICAgIHJldHVybiBqcURlZmVyLnJlc29sdmUoYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFkZGl0aW9uYWxBbmdsZSAtIEFkZGl0aW9uYWwgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24oYWRkaXRpb25hbEFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKTtcblxuICAgICAgICAvLyBUaGUgYW5nbGUgaXMgbG93ZXIgdGhhbiAyKlBJKD09PTM2MCBkZWdyZWVzKVxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBbmdsZSgoY3VycmVudCArIGFkZGl0aW9uYWxBbmdsZSkgJSAzNjApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdGF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb21wb25lbnROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdNQUlOJyxcbiAgICAgICAgJ0lNQUdFX0xPQURFUicsXG4gICAgICAgICdDUk9QUEVSJyxcbiAgICAgICAgJ0ZMSVAnLFxuICAgICAgICAnUk9UQVRJT04nLFxuICAgICAgICAnRlJFRV9EUkFXSU5HJ1xuICAgICksXG5cbiAgICBjb21tYW5kTmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnQ0xFQVInLFxuICAgICAgICAnTE9BRF9JTUFHRScsXG4gICAgICAgICdGTElQX0lNQUdFJyxcbiAgICAgICAgJ1JPVEFURV9JTUFHRScsXG4gICAgICAgICdBRERfT0JKRUNUJ1xuICAgICksXG5cbiAgICBldmVudE5hbWVzOiB7XG4gICAgICAgIExPQURfSU1BR0U6ICdsb2FkSW1hZ2UnLFxuICAgICAgICBDTEVBUl9PQkpFQ1RTOiAnY2xlYXInLFxuICAgICAgICBDTEVBUl9JTUFHRTogJ2NsZWFySW1hZ2UnLFxuICAgICAgICBTVEFSVF9DUk9QUElORzogJ3N0YXJ0Q3JvcHBpbmcnLFxuICAgICAgICBFTkRfQ1JPUFBJTkc6ICdlbmRDcm9wcGluZycsXG4gICAgICAgIEZMSVBfSU1BR0U6ICdmbGlwSW1hZ2UnLFxuICAgICAgICBST1RBVEVfSU1BR0U6ICdyb3RhdGVJbWFnZScsXG4gICAgICAgIEFERF9PQkpFQ1Q6ICdhZGRPYmplY3QnLFxuICAgICAgICBSRU1PVkVfT0JKRUNUOiAncmVtb3ZlT2JqZWN0JyxcbiAgICAgICAgRU1QVFlfUkVET19TVEFDSzogJ2VtcHR5UmVkb1N0YWNrJyxcbiAgICAgICAgRU1QVFlfVU5ET19TVEFDSzogJ2VtcHR5VW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9VTkRPX1NUQUNLOiAncHVzaFVuZG9TdGFjaycsXG4gICAgICAgIFBVU0hfUkVET19TVEFDSzogJ3B1c2hSZWRvU3RhY2snXG4gICAgfSxcblxuICAgIElTX1NVUFBPUlRfRklMRV9BUEk6ICEhKHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuRmlsZVJlYWRlcilcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjbGFtcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS5jbGFtcDtcblxudmFyIENPUk5FUl9UWVBFX1RPUF9MRUZUID0gJ3RsJztcbnZhciBDT1JORVJfVFlQRV9UT1BfUklHSFQgPSAndHInO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9UT1AgPSAnbXQnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9MRUZUID0gJ21sJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfUklHSFQgPSAnbXInO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9CT1RUT00gPSAnbWInO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUID0gJ2JsJztcbnZhciBDT1JORVJfVFlQRV9CT1RUT01fUklHSFQgPSAnYnInO1xuXG4vKipcbiAqIENyb3B6b25lIG9iamVjdFxuICogSXNzdWU6IElFNywgOCh3aXRoIGV4Y2FudmFzKVxuICogIC0gQ3JvcHpvbmUgaXMgYSBibGFjayB6b25lIHdpdGhvdXQgdHJhbnNwYXJlbmN5LlxuICogQGNsYXNzIENyb3B6b25lXG4gKiBAZXh0ZW5kcyB7ZmFicmljLlJlY3R9XG4gKi9cbnZhciBDcm9wem9uZSA9IGZhYnJpYy51dGlsLmNyZWF0ZUNsYXNzKGZhYnJpYy5SZWN0LCAvKiogQGxlbmRzIENyb3B6b25lLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBvYmplY3RcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdpbml0aWFsaXplJywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub24oe1xuICAgICAgICAgICAgJ21vdmluZyc6IHRoaXMuX29uTW92aW5nLFxuICAgICAgICAgICAgJ3NjYWxpbmcnOiB0aGlzLl9vblNjYWxpbmdcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBDcm9wLXpvbmVcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3JlbmRlcjogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBvcmlnaW5hbEZsaXBYLCBvcmlnaW5hbEZsaXBZLFxuICAgICAgICAgICAgb3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZLFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZVdpZHRoID0gNyxcbiAgICAgICAgICAgIGNyb3B6b25lRGFzaExpbmVPZmZzZXQgPSA3O1xuICAgICAgICB0aGlzLmNhbGxTdXBlcignX3JlbmRlcicsIGN0eCk7XG5cbiAgICAgICAgLy8gQ2FsYyBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBvcmlnaW5hbEZsaXBYID0gdGhpcy5mbGlwWCA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxGbGlwWSA9IHRoaXMuZmxpcFkgPyAtMSA6IDE7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVYID0gb3JpZ2luYWxGbGlwWCAvIHRoaXMuc2NhbGVYO1xuICAgICAgICBvcmlnaW5hbFNjYWxlWSA9IG9yaWdpbmFsRmxpcFkgLyB0aGlzLnNjYWxlWTtcblxuICAgICAgICAvLyBTZXQgb3JpZ2luYWwgc2NhbGVcbiAgICAgICAgY3R4LnNjYWxlKG9yaWdpbmFsU2NhbGVYLCBvcmlnaW5hbFNjYWxlWSk7XG5cbiAgICAgICAgLy8gUmVuZGVyIG91dGVyIHJlY3RcbiAgICAgICAgdGhpcy5fZmlsbE91dGVyUmVjdChjdHgsICdyZ2JhKDAsIDAsIDAsIDAuNTUpJyk7XG5cbiAgICAgICAgLy8gQmxhY2sgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMCwgMCwgMCknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgpO1xuXG4gICAgICAgIC8vIFdoaXRlIGRhc2ggbGluZVxuICAgICAgICB0aGlzLl9zdHJva2VCb3JkZXIoY3R4LCAncmdiKDI1NSwgMjU1LCAyNTUpJywgY3JvcHpvbmVEYXNoTGluZVdpZHRoLCBjcm9wem9uZURhc2hMaW5lT2Zmc2V0KTtcblxuICAgICAgICAvLyBSZXNldCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUoMSAvIG9yaWdpbmFsU2NhbGVYLCAxIC8gb3JpZ2luYWxTY2FsZVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcm9wem9uZS1jb29yZGluYXRlcyB3aXRoIG91dGVyIHJlY3RhbmdsZVxuICAgICAqXG4gICAgICogICAgIHgwICAgICB4MSAgICAgICAgIHgyICAgICAgeDNcbiAgICAgKiAgeTAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98ICAgIC8vIDwtLS0gXCJPdXRlci1yZWN0YW5nbGVcIlxuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogIHkxICstLS0tLS0tKy0tLS0tLS0tLS0rLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98IENyb3B6b25lIHwvLy8vLy8vfCAgICBDcm9wem9uZSBpcyB0aGUgXCJJbm5lci1yZWN0YW5nbGVcIlxuICAgICAqICAgICB8Ly8vLy8vL3wgICgwLCAwKSAgfC8vLy8vLy98ICAgIENlbnRlciBwb2ludCAoMCwgMClcbiAgICAgKiAgeTIgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgICAqXG4gICAgICogQHR5cGVkZWYge3t4OiBBcnJheTxudW1iZXI+LCB5OiBBcnJheTxudW1iZXI+fX0gY3JvcHpvbmVDb29yZGluYXRlc1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlsbCBvdXRlciByZWN0YW5nbGVcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59IGZpbGxTdHlsZSAtIEZpbGwtc3R5bGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWxsT3V0ZXJSZWN0OiBmdW5jdGlvbihjdHgsIGZpbGxTdHlsZSkge1xuICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSB0aGlzLl9nZXRDb29yZGluYXRlcyhjdHgpLFxuICAgICAgICAgICAgeCA9IGNvb3JkaW5hdGVzLngsXG4gICAgICAgICAgICB5ID0gY29vcmRpbmF0ZXMueTtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbFN0eWxlO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgLy8gT3V0ZXIgcmVjdGFuZ2xlXG4gICAgICAgIC8vIE51bWJlcnMgYXJlICsvLTEgc28gdGhhdCBvdmVybGF5IGVkZ2VzIGRvbid0IGdldCBibHVycnkuXG4gICAgICAgIGN0eC5tb3ZlVG8oeFswXSAtIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzNdICsgMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzNdICsgMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFswXSAtIDEsIHlbM10gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgLy8gSW5uZXIgcmVjdGFuZ2xlXG4gICAgICAgIGN0eC5tb3ZlVG8oeFsxXSwgeVsxXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsxXSwgeVsyXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsyXSwgeVsyXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsyXSwgeVsxXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsxXSwgeVsxXSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29vcmRpbmF0ZXNcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEByZXR1cm5zIHtjcm9wem9uZUNvb3JkaW5hdGVzfSAtIHtAbGluayBjcm9wem9uZUNvb3JkaW5hdGVzfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvb3JkaW5hdGVzOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIGNlaWwgPSBNYXRoLmNlaWwsXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCksXG4gICAgICAgICAgICBoYWxmV2lkdGggPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gaGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMuZ2V0VG9wKCksXG4gICAgICAgICAgICBjYW52YXNFbCA9IGN0eC5jYW52YXM7IC8vIGNhbnZhcyBlbGVtZW50LCBub3QgZmFicmljIG9iamVjdFxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoICsgbGVmdCksICAgICAgICAgICAgICAgICAgICAgICAgLy8geDBcbiAgICAgICAgICAgICAgICAtKGhhbGZXaWR0aCksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgxXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MlxuICAgICAgICAgICAgICAgIGhhbGZXaWR0aCArIChjYW52YXNFbC53aWR0aCAtIGxlZnQgLSB3aWR0aCkgLy8geDNcbiAgICAgICAgICAgIF0sIGNlaWwpLFxuICAgICAgICAgICAgeTogdHVpLnV0aWwubWFwKFtcbiAgICAgICAgICAgICAgICAtKGhhbGZIZWlnaHQgKyB0b3ApLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MFxuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkxXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTJcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0ICsgKGNhbnZhc0VsLmhlaWdodCAtIHRvcCAtIGhlaWdodCkgICAvLyB5M1xuICAgICAgICAgICAgXSwgY2VpbClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3Ryb2tlIGJvcmRlclxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gc3Ryb2tlU3R5bGUgLSBTdHJva2Utc3R5bGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZURhc2hXaWR0aCAtIERhc2ggd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2xpbmVEYXNoT2Zmc2V0XSAtIERhc2ggb2Zmc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc3Ryb2tlQm9yZGVyOiBmdW5jdGlvbihjdHgsIHN0cm9rZVN0eWxlLCBsaW5lRGFzaFdpZHRoLCBsaW5lRGFzaE9mZnNldCkge1xuICAgICAgICB2YXIgaGFsZldpZHRoID0gdGhpcy5nZXRXaWR0aCgpIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpIC8gMjtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VTdHlsZTtcbiAgICAgICAgaWYgKGN0eC5zZXRMaW5lRGFzaCkge1xuICAgICAgICAgICAgY3R4LnNldExpbmVEYXNoKFtsaW5lRGFzaFdpZHRoLCBsaW5lRGFzaFdpZHRoXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgICAgICBjdHgubGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygtaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbygtaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbygtaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdmluZyBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW92aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIG1heExlZnQgPSBjYW52YXMuZ2V0V2lkdGgoKSAtIHdpZHRoLFxuICAgICAgICAgICAgbWF4VG9wID0gY2FudmFzLmdldEhlaWdodCgpIC0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuc2V0TGVmdChjbGFtcChsZWZ0LCAwLCBtYXhMZWZ0KSk7XG4gICAgICAgIHRoaXMuc2V0VG9wKGNsYW1wKHRvcCwgMCwgbWF4VG9wKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU2NhbGluZyBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7e2U6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblNjYWxpbmc6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgcG9pbnRlciA9IHRoaXMuY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpLFxuICAgICAgICAgICAgc2V0dGluZ3MgPSB0aGlzLl9jYWxjU2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyKTtcblxuICAgICAgICAvLyBPbiBzY2FsaW5nIGNyb3B6b25lLFxuICAgICAgICAvLyBjaGFuZ2UgcmVhbCB3aWR0aCBhbmQgaGVpZ2h0IGFuZCBmaXggc2NhbGVGYWN0b3IgdG8gMVxuICAgICAgICB0aGlzLnNjYWxlKDEpLnNldChzZXR0aW5ncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGVkIHNpemUgZnJvbSBtb3VzZSBwb2ludGVyIHdpdGggc2VsZWN0ZWQgY29ybmVyXG4gICAgICogQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBwb2ludGVyIC0gTW91c2UgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBIYXZpbmcgbGVmdCBvcihhbmQpIHRvcCBvcihhbmQpIHdpZHRoIG9yKGFuZCkgaGVpZ2h0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgICAgIHZhciBwb2ludGVyWCA9IHBvaW50ZXIueCxcbiAgICAgICAgICAgIHBvaW50ZXJZID0gcG9pbnRlci55LFxuICAgICAgICAgICAgdGxTY2FsaW5nU2l6ZSA9IHRoaXMuX2NhbGNUb3BMZWZ0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpLFxuICAgICAgICAgICAgYnJTY2FsaW5nU2l6ZSA9IHRoaXMuX2NhbGNCb3R0b21SaWdodFNjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlclgsIHBvaW50ZXJZKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBAdG9kbzog7J2867CYIOqwneyytOyXkOyEnCBzaGlmdCDsobDtlantgqTrpbwg64iE66W066m0IGZyZWUgc2l6ZSBzY2FsaW5n7J20IOuQqCAtLT4g7ZmV7J247ZW067O86rKDXG4gICAgICAgICAqICAgICAgY2FudmFzLmNsYXNzLmpzIC8vIF9zY2FsZU9iamVjdDogZnVuY3Rpb24oLi4uKXsuLi59XG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVNjYWxpbmdTZXR0aW5ncyh0bFNjYWxpbmdTaXplLCBiclNjYWxpbmdTaXplKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsaW5nIHNpemUocG9zaXRpb24gKyBkaW1lbnNpb24pIGZyb20gbGVmdC10b3AgY29ybmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBNb3VzZSBwb3NpdGlvbiBYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBNb3VzZSBwb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBib3R0b20gPSB0aGlzLmdldEhlaWdodCgpICsgdGhpcy50b3AsXG4gICAgICAgICAgICByaWdodCA9IHRoaXMuZ2V0V2lkdGgoKSArIHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IGNsYW1wKHksIDAsIGJvdHRvbSAtIDEpLCAgLy8gMCA8PSB0b3AgPD0gKGJvdHRvbSAtIDEpXG4gICAgICAgICAgICBsZWZ0ID0gY2xhbXAoeCwgMCwgcmlnaHQgLSAxKTsgIC8vIDAgPD0gbGVmdCA8PSAocmlnaHQgLSAxKVxuXG4gICAgICAgIC8vIFdoZW4gc2NhbGluZyBcIlRvcC1MZWZ0IGNvcm5lclwiOiBJdCBmaXhlcyByaWdodCBhbmQgYm90dG9tIGNvb3JkaW5hdGVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB3aWR0aDogcmlnaHQgLSBsZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0OiBib3R0b20gLSB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsaW5nIHNpemUgZnJvbSByaWdodC1ib3R0b20gY29ybmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBNb3VzZSBwb3NpdGlvbiBYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBNb3VzZSBwb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBtYXhYID0gY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgbWF4WSA9IGNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gdGhpcy50b3A7XG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiQm90dG9tLVJpZ2h0IGNvcm5lclwiOiBJdCBmaXhlcyBsZWZ0IGFuZCB0b3AgY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCAobGVmdCArIDEpLCBtYXhYKSAtIGxlZnQsICAgIC8vICh3aWR0aCA9IHggLSBsZWZ0KSwgKGxlZnQgKyAxIDw9IHggPD0gbWF4WClcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgKHRvcCArIDEpLCBtYXhZKSAtIHRvcCAgICAgIC8vIChoZWlnaHQgPSB5IC0gdG9wKSwgKHRvcCArIDEgPD0geSA8PSBtYXhZKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKmVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkqL1xuICAgIC8qKlxuICAgICAqIE1ha2Ugc2NhbGluZyBzZXR0aW5nc1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdGwgLSBUb3AtTGVmdCBzZXR0aW5nXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBiciAtIEJvdHRvbS1SaWdodCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge3t3aWR0aDogP251bWJlciwgaGVpZ2h0OiA/bnVtYmVyLCBsZWZ0OiA/bnVtYmVyLCB0b3A6ID9udW1iZXJ9fSBQb3NpdGlvbiBzZXR0aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNjYWxpbmdTZXR0aW5nczogZnVuY3Rpb24odGwsIGJyKSB7XG4gICAgICAgIHZhciB0bFdpZHRoID0gdGwud2lkdGgsXG4gICAgICAgICAgICB0bEhlaWdodCA9IHRsLmhlaWdodCxcbiAgICAgICAgICAgIGJySGVpZ2h0ID0gYnIuaGVpZ2h0LFxuICAgICAgICAgICAgYnJXaWR0aCA9IGJyLndpZHRoLFxuICAgICAgICAgICAgdGxMZWZ0ID0gdGwubGVmdCxcbiAgICAgICAgICAgIHRsVG9wID0gdGwudG9wLFxuICAgICAgICAgICAgc2V0dGluZ3M7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLl9fY29ybmVyKSB7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX1RPUF9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gdGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX1RPUF9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGxUb3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9CT1RUT01fTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYnJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRsTGVmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IGJyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRsTGVmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9UT1A6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGxUb3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBicldpZHRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTTpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xuICAgIH0sIC8qZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5Ki9cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgd2hldGhlciB0aGlzIGNyb3B6b25lIGlzIHZhbGlkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNWYWxpZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLmxlZnQgPj0gMCAmJlxuICAgICAgICAgICAgdGhpcy50b3AgPj0gMCAmJlxuICAgICAgICAgICAgdGhpcy53aWR0aCA+IDAgJiZcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID4gMFxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3B6b25lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tbWFuZCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21tYW5kJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBjb21wb25lbnROYW1lcyA9IGNvbnN0cy5jb21wb25lbnROYW1lcztcbnZhciBjb21tYW5kTmFtZXMgPSBjb25zdHMuY29tbWFuZE5hbWVzO1xudmFyIGNyZWF0b3JzID0ge307XG5cbnZhciBNQUlOID0gY29tcG9uZW50TmFtZXMuTUFJTjtcbnZhciBJTUFHRV9MT0FERVIgPSBjb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVI7XG52YXIgRkxJUCA9IGNvbXBvbmVudE5hbWVzLkZMSVA7XG52YXIgUk9UQVRJT04gPSBjb21wb25lbnROYW1lcy5ST1RBVElPTjtcblxuLyoqXG4gKiBTZXQgbWFwcGluZyBjcmVhdG9yc1xuICovXG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuTE9BRF9JTUFHRV0gPSBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkZMSVBfSU1BR0VdID0gY3JlYXRlRmxpcEltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5ST1RBVEVfSU1BR0VdID0gY3JlYXRlUm90YXRpb25JbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQ0xFQVJfT0JKRUNUU10gPSBjcmVhdGVDbGVhckNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQUREX09CSkVDVF0gPSBjcmVhdGVBZGRPYmplY3RDb21tYW5kO1xuXG4vKipcbiAqIEBwYXJhbSB7ZmFicmljLk9iamVjdH0gb2JqZWN0IC0gRmFicmljIG9iamVjdFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFkZE9iamVjdENvbW1hbmQob2JqZWN0KSB7XG4gICAgdHVpLnV0aWwuc3RhbXAob2JqZWN0KTtcblxuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmICghY2FudmFzLmNvbnRhaW5zKG9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMuYWRkKG9iamVjdCk7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKG9iamVjdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAoY2FudmFzLmNvbnRhaW5zKG9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMucmVtb3ZlKG9iamVjdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBJbWFnZSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gSW1hZ2UgdXJsXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9hZEltYWdlQ29tbWFuZChpbWFnZU5hbWUsIHVybCkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gbG9hZGVyLmdldENhbnZhcygpO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgICAgIHByZXZOYW1lOiBsb2FkZXIuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICAgICAgcHJldkltYWdlOiBsb2FkZXIuZ2V0Q2FudmFzSW1hZ2UoKSxcbiAgICAgICAgICAgICAgICAvLyBTbGljZTogXCJjYW52YXMuY2xlYXIoKVwiIGNsZWFycyB0aGUgb2JqZWN0cyBhcnJheSwgU28gc2hhbGxvdyBjb3B5IHRoZSBhcnJheVxuICAgICAgICAgICAgICAgIG9iamVjdHM6IGNhbnZhcy5nZXRPYmplY3RzKCkuc2xpY2UoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoaW1hZ2VOYW1lLCB1cmwpO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGxvYWRlci5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuICAgICAgICAgICAgY2FudmFzLmFkZC5hcHBseShjYW52YXMsIHN0b3JlLm9iamVjdHMpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoc3RvcmUucHJldk5hbWUsIHN0b3JlLnByZXZJbWFnZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdmbGlwWCcgb3IgJ2ZsaXBZJyBvciAncmVzZXQnXG4gKiBAcmV0dXJucyB7JC5EZWZlcnJlZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmxpcEltYWdlQ29tbWFuZCh0eXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGZsaXBDb21wID0gY29tcE1hcFtGTElQXTtcblxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IGZsaXBDb21wLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcFt0eXBlXSgpO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICByZXR1cm4gZmxpcENvbXAuc2V0KHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAncm90YXRlJyBvciAnc2V0QW5nbGUnXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBhbmdsZSB2YWx1ZSAoZGVncmVlKVxuICogQHJldHVybnMgeyQuRGVmZXJyZWR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kKHR5cGUsIGFuZ2xlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gcm90YXRpb25Db21wLmdldEN1cnJlbnRBbmdsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wW3R5cGVdKGFuZ2xlKTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wLnNldEFuZ2xlKHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsZWFyQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICAvLyBTbGljZTogXCJjYW52YXMuY2xlYXIoKVwiIGNsZWFycyB0aGUgb2JqZWN0cyBhcnJheSwgU28gc2hhbGxvdyBjb3B5IHRoZSBhcnJheVxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IGNhbnZhcy5nZXRPYmplY3RzKCkuc2xpY2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3JlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQuYXBwbHkoY2FudmFzLCB0aGlzLnN0b3JlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBjb21tYW5kXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbW1hbmQgbmFtZVxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gQXJndW1lbnRzIGZvciBjcmVhdGluZyBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIGFyZ3MpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHJldHVybiBjcmVhdG9yc1tuYW1lXS5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGtleU1pcnJvciA9IHJlcXVpcmUoJy4uL3V0aWwnKS5rZXlNaXJyb3I7XG5cbnZhciB0eXBlcyA9IGtleU1pcnJvcihcbiAgICAnVU5fSU1QTEVNRU5UQVRJT04nLFxuICAgICdOT19DT01QT05FTlRfTkFNRSdcbik7XG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogJ1Nob3VsZCBpbXBsZW1lbnQgYSBtZXRob2Q6ICcsXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6ICdTaG91bGQgc2V0IGEgY29tcG9uZW50IG5hbWUnXG59O1xuXG52YXIgbWFwID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiBmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5VTl9JTVBMRU1FTlRBVElPTiArIG1ldGhvZE5hbWU7XG4gICAgfSxcbiAgICBOT19DT01QT05FTlRfTkFNRTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5OT19DT01QT05FTlRfTkFNRTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0eXBlczogdHVpLnV0aWwuZXh0ZW5kKHt9LCB0eXBlcyksXG5cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGZ1bmM7XG5cbiAgICAgICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZnVuYyA9IG1hcFt0eXBlXTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFyZ3VtZW50cyk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW52b2tlciA9IHJlcXVpcmUoJy4vaW52b2tlcicpO1xudmFyIGNvbW1hbmRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5L2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgZXZlbnRzID0gY29uc3RzLmV2ZW50TmFtZXM7XG52YXIgY29tbWFuZHMgPSBjb25zdHMuY29tbWFuZE5hbWVzO1xudmFyIGNvbXBMaXN0ID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xuXG4vKipcbiAqIEltYWdlIGVkaXRvclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ3xqUXVlcnl8SFRNTEVsZW1lbnR9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICovXG52YXIgSW1hZ2VFZGl0b3IgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEltYWdlRWRpdG9yLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXNFbGVtZW50KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZva2VyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtJbnZva2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlciA9IG5ldyBJbnZva2VyKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYy1DYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX3NldENhbnZhcyhjYW52YXNFbGVtZW50KTtcbiAgICAgICAgdGhpcy5fYXR0YWNoSW52b2tlckV2ZW50cygpO1xuICAgICAgICB0aGlzLl9hdHRhY2hDYW52YXNFdmVudHMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGludm9rZXIgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoSW52b2tlckV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBQVVNIX1VORE9fU1RBQ0sgPSBldmVudHMuUFVTSF9VTkRPX1NUQUNLO1xuICAgICAgICB2YXIgUFVTSF9SRURPX1NUQUNLID0gZXZlbnRzLlBVU0hfUkVET19TVEFDSztcbiAgICAgICAgdmFyIEVNUFRZX1VORE9fU1RBQ0sgPSBldmVudHMuRU1QVFlfVU5ET19TVEFDSztcbiAgICAgICAgdmFyIEVNUFRZX1JFRE9fU1RBQ0sgPSBldmVudHMuRU1QVFlfUkVET19TVEFDSztcblxuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKFBVU0hfVU5ET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIFBVU0hfVU5ET19TVEFDSykpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKFBVU0hfUkVET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIFBVU0hfUkVET19TVEFDSykpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKEVNUFRZX1VORE9fU1RBQ0ssICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBFTVBUWV9VTkRPX1NUQUNLKSk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oRU1QVFlfUkVET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIEVNUFRZX1JFRE9fU1RBQ0spKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGNhbnZhcyBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDYW52YXNFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jYW52YXMub24oe1xuICAgICAgICAgICAgJ3BhdGg6Y3JlYXRlZCc6ICQucHJveHkodGhpcy5fb25QYXRoQ3JlYXRlZCwgdGhpcyksXG4gICAgICAgICAgICAnb2JqZWN0OmFkZGVkJzogJC5wcm94eShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvbW1hbmQ7XG4gICAgICAgICAgICAgICAgaWYgKCF0dWkudXRpbC5oYXNTdGFtcChvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuQUREX09CSkVDVCwgb2JqKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5BRERfT0JKRUNULCBvYmopO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnZva2VyLnB1c2hVbmRvU3RhY2soY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICAnb2JqZWN0OnJlbW92ZWQnOiAkLnByb3h5KGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5SRU1PVkVfT0JKRUNULCBldmVudC50YXJnZXQpO1xuICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50TGlzdGVuZXIgLSBcInBhdGg6Y3JlYXRlZFwiXG4gICAgICogIC0gRXZlbnRzOjogXCJvYmplY3Q6YWRkZWRcIiAtPiBcInBhdGg6Y3JlYXRlZFwiXG4gICAgICogQHBhcmFtIHt7cGF0aDogZmFicmljLlBhdGh9fSBvYmogLSBQYXRoIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uUGF0aENyZWF0ZWQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgcGF0aCA9IG9iai5wYXRoO1xuXG4gICAgICAgIHBhdGguc2V0KHtcbiAgICAgICAgICAgIHJvdGF0aW5nUG9pbnRPZmZzZXQ6IDMwLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZWQnLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnRDb3JuZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGNvcm5lckNvbG9yOiAnZ3JlZW4nLFxuICAgICAgICAgICAgY29ybmVyU2l6ZTogNlxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDYW52YXM6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQ7XG5cbiAgICAgICAgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2dldE1haW5Db21wb25lbnQoKTtcbiAgICAgICAgbWFpbkNvbXBvbmVudC5zZXRDYW52YXNFbGVtZW50KGNhbnZhc0VsZW1lbnQpO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBtYWluQ29tcG9uZW50LmdldENhbnZhcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZXZlbnQgbmFtZXNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEV2ZW50TmFtZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZXh0ZW5kKHt9LCBldmVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIG1haW4gY29tcG9uZW50XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH0gTWFpbiBjb21wb25lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRNYWluQ29tcG9uZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5NQUlOKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlci5nZXRDb21wb25lbnQobmFtZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBvYmplY3RzXG4gICAgICovXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5DTEVBUl9PQkpFQ1RTKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5DTEVBUl9PQkpFQ1RTKTtcblxuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGN1cnJlbnQgYWN0aW9uXG4gICAgICovXG4gICAgZW5kQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRGcmVlRHJhd2luZygpO1xuICAgICAgICB0aGlzLmVuZENyb3BwaW5nKCk7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWFjdGl2YXRlIGFsbCBvYmplY3RzXG4gICAgICovXG4gICAgZGVhY3RpdmF0ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5pbnZva2UoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci51bmRvKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG9cbiAgICAgKi9cbiAgICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5yZWRvKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSBmaWxlXG4gICAgICogQHBhcmFtIHtGaWxlfSBpbWdGaWxlIC0gSW1hZ2UgZmlsZVxuICAgICAqL1xuICAgIGxvYWRJbWFnZUZyb21GaWxlOiBmdW5jdGlvbihpbWdGaWxlKSB7XG4gICAgICAgIGlmICghaW1nRmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2FkSW1hZ2VGcm9tVVJMKFxuICAgICAgICAgICAgaW1nRmlsZS5uYW1lLFxuICAgICAgICAgICAgVVJMLmNyZWF0ZU9iamVjdFVSTChpbWdGaWxlKVxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGltYWdlTmFtZSAtIGltYWdlTmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBGaWxlIHVybFxuICAgICAqL1xuICAgIGxvYWRJbWFnZUZyb21VUkw6IGZ1bmN0aW9uKGltYWdlTmFtZSwgdXJsKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNhbGxiYWNrLCBjb21tYW5kO1xuXG4gICAgICAgIGlmICghaW1hZ2VOYW1lIHx8ICF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLl9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nLCB0aGlzKTtcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5MT0FEX0lNQUdFLCBpbWFnZU5hbWUsIHVybCk7XG5cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sob0ltYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkNMRUFSX0lNQUdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBhZnRlciBpbWFnZSBsb2FkaW5nXG4gICAgICogQHBhcmFtIHs/ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBJbWFnZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIF9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nOiBmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQgPSB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCk7XG4gICAgICAgIHZhciAkY2FudmFzRWxlbWVudCA9ICQobWFpbkNvbXBvbmVudC5nZXRDYW52YXNFbGVtZW50KCkpO1xuXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuTE9BRF9JTUFHRSwge1xuICAgICAgICAgICAgb3JpZ2luYWxXaWR0aDogb0ltYWdlLndpZHRoLFxuICAgICAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IG9JbWFnZS5oZWlnaHQsXG4gICAgICAgICAgICBjdXJyZW50V2lkdGg6ICRjYW52YXNFbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgICBjdXJyZW50SGVpZ2h0OiAkY2FudmFzRWxlbWVudC5oZWlnaHQoKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydENyb3BwaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3BwZXIgPSB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuQ1JPUFBFUik7XG5cbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgY3JvcHBlci5zdGFydCgpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLlNUQVJUX0NST1BQSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0FwcGx5aW5nXSAtIFdoZXRoZXIgdGhlIGNyb3BwaW5nIGlzIGFwcGxpZWQgb3IgY2FuY2VsZWRcbiAgICAgKi9cbiAgICBlbmRDcm9wcGluZzogZnVuY3Rpb24oaXNBcHBseWluZykge1xuICAgICAgICB2YXIgY3JvcHBlciA9IHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5DUk9QUEVSKTtcbiAgICAgICAgdmFyIGRhdGEgPSBjcm9wcGVyLmVuZChpc0FwcGx5aW5nKTtcblxuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9DUk9QUElORyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoZGF0YS5pbWFnZU5hbWUsIGRhdGEudXJsKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAnZmxpcFgnIG9yICdmbGlwWScgb3IgJ3Jlc2V0J1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZsaXA6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5GTElQX0lNQUdFKTtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuRkxJUF9JTUFHRSwgdHlwZSk7XG5cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKi9cbiAgICBmbGlwWDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ2ZsaXBYJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFknKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcFxuICAgICAqL1xuICAgIHJlc2V0RmxpcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ3Jlc2V0Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ3JvdGF0ZScgb3IgJ3NldEFuZ2xlJ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGFuZ2xlIHZhbHVlIChkZWdyZWUpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcm90YXRlOiBmdW5jdGlvbih0eXBlLCBhbmdsZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLlJPVEFURV9JTUFHRSk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJPVEFURV9JTUFHRSwgdHlwZSwgYW5nbGUpO1xuXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQWRkaXRpb25hbCBhbmdsZSB0byByb3RhdGUgaW1hZ2VcbiAgICAgKi9cbiAgICByb3RhdGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHRoaXMuX3JvdGF0ZSgncm90YXRlJywgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5nbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSBvZiBpbWFnZVxuICAgICAqL1xuICAgIHNldEFuZ2xlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB0aGlzLl9yb3RhdGUoJ3NldEFuZ2xlJywgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBmcmVlLWRyYXdpbmcgbW9kZVxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGNvbG9yOiBzdHJpbmd9fSBzZXR0aW5nIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHN0YXJ0RnJlZURyYXdpbmc6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkZSRUVfRFJBV0lORykuc3RhcnQoc2V0dGluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkcmF3aW5nIGJydXNoXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgY29sb3I6IHN0cmluZ319IHNldHRpbmcgLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc2V0QnJ1c2g6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkZSRUVfRFJBV0lORykuc2V0QnJ1c2goc2V0dGluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBmcmVlLWRyYXdpbmcgbW9kZVxuICAgICAqL1xuICAgIGVuZEZyZWVEcmF3aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkZSRUVfRFJBV0lORykuZW5kKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRhIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pbnZva2VyLmNsZWFyVW5kb1N0YWNrKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHJlZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyUmVkb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclJlZG9TdGFjaygpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oSW1hZ2VFZGl0b3IpO1xubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb21wb25lbnQgaW50ZXJmYWNlXG4gKiBAY2xhc3NcbiAqL1xudmFyIENvbXBvbmVudCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tcG9uZW50LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNJbWFnZShuYW1lLCBvSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzRWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNJbWFnZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgZWRpdG9yXG4gICAgICogQHJldHVybnMge0ltYWdlRWRpdG9yfVxuICAgICAqL1xuICAgIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRFZGl0b3IoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgcHJvcGVydGllcyBvZiB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwcm9wZXJ0aWVzIC0gSW1hZ2UgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICB0b2dnbGVJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkudG9nZ2xlSW1hZ2VQcm9wZXJ0aWVzKHByb3BlcnRpZXMsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKGRpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGJhY2tzdG9yZSBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBzZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb24oZGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHBhcmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fG51bGx9IHBhcmVudCAtIFBhcmVudFxuICAgICAqL1xuICAgIHNldFBhcmVudDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudCB8fCBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiB3aXRoIHNjYWxpbmcgaW1hZ2VcbiAgICAgKi9cbiAgICBhZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKSxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cblxuICAgICAgICB3aGlsZSAobmV4dCkge1xuICAgICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVycm9yTWVzc2FnZSA9IHJlcXVpcmUoJy4uL2ZhY3RvcnkvZXJyb3JNZXNzYWdlJyk7XG5cbnZhciBjcmVhdGVNZXNzYWdlID0gZXJyb3JNZXNzYWdlLmNyZWF0ZSxcbiAgICBlcnJvclR5cGVzID0gZXJyb3JNZXNzYWdlLnR5cGVzO1xuXG4vKipcbiAqIENvbW1hbmQgY2xhc3NcbiAqIEBjbGFzc1xuICogQHBhcmFtIHt7ZXhlY3V0ZTogZnVuY3Rpb24sIHVuZG86IGZ1bmN0aW9ufX0gYWN0aW9ucyAtIENvbW1hbmQgYWN0aW9uc1xuICovXG52YXIgQ29tbWFuZCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tbWFuZC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oYWN0aW9ucykge1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhlY3V0ZSBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4ZWN1dGUgPSBhY3Rpb25zLmV4ZWN1dGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gZnVuY3Rpb25cbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvID0gYWN0aW9ucy51bmRvO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBleGVjdXRlQ2FsbGJhY2tcbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4ZWN1dGVDYWxsYmFjayA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHVuZG9DYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kb0NhbGxiYWNrID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhY3Rpb25cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBleGVjdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoZXJyb3JUeXBlcy5VTl9JTVBMRU1FTlRBVElPTiwgJ2V4ZWN1dGUnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG8gYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICd1bmRvJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXhlY3V0ZSBjYWxsYWJja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgYWZ0ZXIgZXhlY3V0aW9uXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRFeGVjdXRlQ2FsbGJhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZXhlY3V0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCB1bmRvIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBhZnRlciB1bmRvXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRVbmRvQ2FsbGJhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMudW5kb0NhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaW1hZ2VMb2FkZXInKTtcbnZhciBDcm9wcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvY3JvcHBlcicpO1xudmFyIE1haW5Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9tYWluJyk7XG52YXIgRmxpcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ZsaXAnKTtcbnZhciBSb3RhdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50L3JvdGF0aW9uJyk7XG52YXIgRnJlZURyYXdpbmcgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mcmVlRHJhd2luZycpO1xudmFyIGV2ZW50TmFtZXMgPSByZXF1aXJlKCcuL2NvbnN0cycpLmV2ZW50TmFtZXM7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbnZva2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEN1c3RvbSBFdmVudHNcbiAgICAgICAgICogQHR5cGUge3R1aS51dGlsLkN1c3RvbUV2ZW50c31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2N1c3RvbUV2ZW50cyA9IG5ldyB0dWkudXRpbC5DdXN0b21FdmVudHMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdW5kb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21wb25lbnQgbWFwXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudE1hcCA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2NrLWZsYWcgZm9yIGV4ZWN1dGluZyBjb21tYW5kXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faXNMb2NrZWQgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQm91bmQgbWV0aG9kIHRvIGxvY2tcbiAgICAgICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2NrID0gJC5wcm94eSh0aGlzLmxvY2ssIHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCb3VuZCBtZXRob2QgdG8gdW5sb2NrXG4gICAgICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5sb2NrID0gJC5wcm94eSh0aGlzLnVubG9jaywgdGhpcyk7XG5cblxuICAgICAgICB0aGlzLl9jcmVhdGVDb21wb25lbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjb21wb25lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtYWluID0gbmV3IE1haW5Db21wb25lbnQoKTtcblxuICAgICAgICB0aGlzLl9yZWdpc3RlcihtYWluKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEltYWdlTG9hZGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IENyb3BwZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRmxpcChtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBSb3RhdGlvbihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBGcmVlRHJhd2luZyhtYWluKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgLSBDb21wb25lbnQgaGFuZGxpbmcgdGhlIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50TWFwW2NvbXBvbmVudC5nZXROYW1lKCldID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZCBleGVjdXRpb25cbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbnZva2VFeGVjdXRpb246IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiAkLndoZW4odGhpcy5sb2NrLCBjb21tYW5kLmV4ZWN1dGUodGhpcy5fY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucHVzaFVuZG9TdGFjayhjb21tYW5kKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGVDYWxsYmFjaylcbiAgICAgICAgICAgIC5hbHdheXModGhpcy51bmxvY2spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZCB1bmRvXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW52b2tlVW5kbzogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuICQud2hlbih0aGlzLmxvY2ssIGNvbW1hbmQudW5kbyh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoUmVkb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQudW5kb0NhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyh0aGlzLnVubG9jayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUuZmlyZX1cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cyAtIEFyZ3VtZW50cyB0byBmaXJlIGEgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5maXJlLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUub259XG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMgLSBBcmd1bWVudHMgdG8gYXR0YWNoIGV2ZW50c1xuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2NrIHRoaXMgaW52b2tlclxuICAgICAqL1xuICAgIGxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9jayB0aGlzIGludm9rZXJcbiAgICAgKi9cbiAgICB1bmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlRXhlY3V0aW9uKGNvbW1hbmQpXG4gICAgICAgICAgICAuZG9uZSgkLnByb3h5KHRoaXMuY2xlYXJSZWRvU3RhY2ssIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLl91bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBqcURlZmVyO1xuXG4gICAgICAgIGlmIChjb21tYW5kICYmIHRoaXMuX2lzTG9ja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2hVbmRvU3RhY2soY29tbWFuZCwgdHJ1ZSk7XG4gICAgICAgICAgICBjb21tYW5kID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX2ludm9rZVVuZG8oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5fcmVkb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCAmJiB0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoUmVkb1N0YWNrKGNvbW1hbmQsIHRydWUpO1xuICAgICAgICAgICAgY29tbWFuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW1wdHlSZWRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpxRGVmZXIgPSB0aGlzLl9pbnZva2VFeGVjdXRpb24oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1c2ggdW5kbyBzdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NpbGVudF0gLSBGaXJlIGV2ZW50IG9yIG5vdFxuICAgICAqL1xuICAgIHB1c2hVbmRvU3RhY2s6IGZ1bmN0aW9uKGNvbW1hbmQsIGlzU2lsZW50KSB7XG4gICAgICAgIHRoaXMuX3VuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIWlzU2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuUFVTSF9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXNoIHJlZG8gc3RhY2tcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaWxlbnRdIC0gRmlyZSBldmVudCBvciBub3RcbiAgICAgKi9cbiAgICBwdXNoUmVkb1N0YWNrOiBmdW5jdGlvbihjb21tYW5kLCBpc1NpbGVudCkge1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFpc1NpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLlBVU0hfUkVET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVkb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHVuZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5kb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICB0aGlzLl91bmRvU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52b2tlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbiA9IE1hdGgubWluLFxuICAgIG1heCA9IE1hdGgubWF4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBDbGFtcCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pblZhbHVlIC0gTWluaW11bSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhWYWx1ZSAtIE1heGltdW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjbGFtcGVkIHZhbHVlXG4gICAgICovXG4gICAgY2xhbXA6IGZ1bmN0aW9uKHZhbHVlLCBtaW5WYWx1ZSwgbWF4VmFsdWUpIHtcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIGlmIChtaW5WYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICB0ZW1wID0gbWluVmFsdWU7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IG1heFZhbHVlO1xuICAgICAgICAgICAgbWF4VmFsdWUgPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1heChtaW5WYWx1ZSwgbWluKHZhbHVlLCBtYXhWYWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGtleS12YWx1ZSBvYmplY3QgZnJvbSBhcmd1bWVudHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAga2V5TWlycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIG9ialtrZXldID0ga2V5O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbn07XG4iXX0=
