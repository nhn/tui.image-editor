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
     * @param {{flipX: Boolean, flipY: Boolean}} newSetting - Flip setting
     * @returns {jQuery.Deferred}
     */
    set: function(newSetting) {
        var setting = this.getCurrentSetting();
        var jqDefer = $.Deferred();
        var isChangingFlipX = (setting.flipX !== newSetting.flipX);
        var isChangingFlipY = (setting.flipY !== newSetting.flipY);

        if (!isChangingFlipX && !isChangingFlipY) {
            return jqDefer.reject();
        }

        tui.util.extend(setting, newSetting);
        this.setImageProperties(setting, true);
        this._invertAngle(isChangingFlipX, isChangingFlipY);
        this._flipObjects(isChangingFlipX, isChangingFlipY);

        return jqDefer.resolve(setting, this.getCanvasImage().angle);
    },

    /**
     * Invert image angle for flip
     * @param {boolean} isChangingFlipX - Change flipX
     * @param {boolean} isChangingFlipY - Change flipY
     */
    _invertAngle: function(isChangingFlipX, isChangingFlipY) {
        var canvasImage = this.getCanvasImage();
        var angle = canvasImage.angle;

        if (isChangingFlipX) {
            angle *= -1;
        }
        if (isChangingFlipY) {
            angle *= -1;
        }
        canvasImage.setAngle(parseFloat(angle)).setCoords();// parseFloat for -0 to 0
    },

    /**
     * Flip objects
     * @param {boolean} isChangingFlipX - Change flipX
     * @param {boolean} isChangingFlipY - Change flipY
     * @private
     */
    _flipObjects: function(isChangingFlipX, isChangingFlipY) {
        var canvas = this.getCanvas();

        if (isChangingFlipX) {
            canvas.forEachObject(function(obj) {
                obj.set({
                    angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
                    flipX: !obj.flipX,
                    left: canvas.width - obj.left
                }).setCoords();
            });
        }
        if (isChangingFlipY) {
            canvas.forEachObject(function(obj) {
                obj.set({
                    angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
                    flipY: !obj.flipY,
                    top: canvas.height - obj.top
                }).setCoords();
            });
        }
        canvas.renderAll();
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
        var current = this.getCurrentSetting();

        return this.set({
            flipX: !current.flipX,
            flipY: current.flipY
        });
    },

    /**
     * Flip y
     * @returns {jQuery.Deferred}
     */
    flipY: function() {
        var current = this.getCurrentSetting();

        return this.set({
            flipX: current.flipX,
            flipY: !current.flipY
        });
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
// var rColorValues = /(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0.\d+|1)/;

/**
 * FreeDrawing
 * @class FreeDrawing
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var FreeDrawing = tui.util.defineClass(Component, /** @lends FreeDrawing.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Brush width
         * @type {number}
         */
        this.width = 12;

        /**
         * Brush color
         * @type {string} - RGBa
         */
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
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    setBrush: function(setting) {
        var brush = this.getCanvas().freeDrawingBrush;

        setting = setting || {};
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
    }
});

module.exports = ImageLoader;

},{"../consts":8,"../interface/component":15}],6:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var DEFAULT_MAX_WIDTH = 1000;
var DEFAULT_MAX_HEIGHT = 800;

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

        /**
         * Max width of canvas elements
         * @type {number}
         */
        this.maxWidth = DEFAULT_MAX_WIDTH || option.maxWidth;

        /**
         * Max height of canvas elements
         * @type {number}
         */
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
            'max-width': Math.floor(maxWidth) + 'px',
            'max-height': Math.floor(maxHeight) + 'px'
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
        var oldAngle = this.getCurrentAngle() % 360; //The angle is lower than 2*PI(===360 degrees)
        var jqDefer = $.Deferred();
        var oldImageCenter, newImageCenter, canvasImage;

        angle %= 360;
        if (angle === oldAngle) {
            return jqDefer.reject();
        }
        canvasImage = this.getCanvasImage();

        oldImageCenter = canvasImage.getCenterPoint();
        canvasImage.setAngle(angle).setCoords();
        this.adjustCanvasDimension();
        newImageCenter = canvasImage.getCenterPoint();
        this._rotateForEachObject(oldImageCenter, newImageCenter, angle - oldAngle);

        return jqDefer.resolve(angle);
    },

    /**
     * Rotate for each object
     * @param {fabric.Point} oldImageCenter - Image center point before rotation
     * @param {fabric.Point} newImageCenter - Image center point after rotation
     * @param {number} angleDiff - Image angle difference after rotation
     * @private
     */
    _rotateForEachObject: function(oldImageCenter, newImageCenter, angleDiff) {
        var canvas = this.getCanvas();
        var centerDiff = {
            x: oldImageCenter.x - newImageCenter.x,
            y: oldImageCenter.y - newImageCenter.y
        };

        canvas.forEachObject(function(obj) {
            var objCenter = obj.getCenterPoint();
            var radian = fabric.util.degreesToRadians(angleDiff);
            var newObjCenter = fabric.util.rotatePoint(objCenter, oldImageCenter, radian);

            obj.set({
                left: newObjCenter.x - centerDiff.x,
                top: newObjCenter.y - centerDiff.y,
                angle: (obj.angle + angleDiff) % 360
            });
            obj.setCoords();
        });
        canvas.renderAll();
    },

    /**
     * Rotate the image
     * @param {number} additionalAngle - Additional angle
     * @returns {jQuery.Deferred}
     */
    rotate: function(additionalAngle) {
        var current = this.getCurrentAngle();

        return this.setAngle(current + additionalAngle);
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
        START_FREE_DRAWING: 'startFreeDrawing',
        END_FREE_DRAWING: 'endFreeDrawing',
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
        this.fire(events.START_FREE_DRAWING);
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
        this.fire(events.END_FREE_DRAWING);
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
        var next = this.getParent();
        var current = this; // eslint-disable-line consistent-this

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvZnJlZURyYXdpbmcuanMiLCJzcmMvanMvY29tcG9uZW50L2ltYWdlTG9hZGVyLmpzIiwic3JjL2pzL2NvbXBvbmVudC9tYWluLmpzIiwic3JjL2pzL2NvbXBvbmVudC9yb3RhdGlvbi5qcyIsInNyYy9qcy9jb25zdHMuanMiLCJzcmMvanMvZXh0ZW5zaW9uL2Nyb3B6b25lLmpzIiwic3JjL2pzL2ZhY3RvcnkvY29tbWFuZC5qcyIsInNyYy9qcy9mYWN0b3J5L2Vycm9yTWVzc2FnZS5qcyIsInNyYy9qcy9pbWFnZUVkaXRvci5qcyIsInNyYy9qcy9pbnRlcmZhY2UvQ29tcG9uZW50LmpzIiwic3JjL2pzL2ludGVyZmFjZS9jb21tYW5kLmpzIiwic3JjL2pzL2ludm9rZXIuanMiLCJzcmMvanMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkltYWdlRWRpdG9yJywgcmVxdWlyZSgnLi9zcmMvanMvaW1hZ2VFZGl0b3InKSwgdHJ1ZSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIENyb3B6b25lID0gcmVxdWlyZSgnLi4vZXh0ZW5zaW9uL2Nyb3B6b25lJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIE1PVVNFX01PVkVfVEhSRVNIT0xEID0gMTA7XG5cbnZhciBhYnMgPSBNYXRoLmFicztcbnZhciBjbGFtcCA9IHV0aWwuY2xhbXA7XG5cbi8qKlxuICogQ3JvcHBlciBjb21wb25lbnRzXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBDcm9wcGVyXG4gKi9cbnZhciBDcm9wcGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIENyb3BwZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7Q3JvcHpvbmV9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WCBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnRZIG9mIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBsaXN0ZW5lcnNcbiAgICAgICAgICogQHR5cGUge29iamVjdC48c3RyaW5nLCBmdW5jdGlvbj59IEhhbmRsZXIgaGFzaCBmb3IgZmFicmljIGNhbnZhc1xuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNlbW92ZTogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlTW92ZSwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZXVwOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VVcCwgdGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5DUk9QUEVSLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2Nyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG5ldyBDcm9wem9uZSh7XG4gICAgICAgICAgICBsZWZ0OiAtMTAsXG4gICAgICAgICAgICB0b3A6IC0xMCxcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsIC8vIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20va2FuZ2F4L2ZhYnJpYy5qcy9pc3N1ZXMvMjg2MH1cbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcblxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlZG93biBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlRG93bjogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY29vcmQ7XG5cbiAgICAgICAgaWYgKGZFdmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgY29vcmQgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG5cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gY29vcmQueDtcbiAgICAgICAgdGhpcy5fc3RhcnRZID0gY29vcmQueTtcblxuICAgICAgICBjYW52YXMub24oe1xuICAgICAgICAgICAgJ21vdXNlOm1vdmUnOiB0aGlzLl9saXN0ZW5lcnMubW91c2Vtb3ZlLFxuICAgICAgICAgICAgJ21vdXNlOnVwJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNldXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vtb3ZlIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VNb3ZlOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuICAgICAgICB2YXIgeCA9IHBvaW50ZXIueDtcbiAgICAgICAgdmFyIHkgPSBwb2ludGVyLnk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuXG4gICAgICAgIGlmIChhYnMoeCAtIHRoaXMuX3N0YXJ0WCkgKyBhYnMoeSAtIHRoaXMuX3N0YXJ0WSkgPiBNT1VTRV9NT1ZFX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgY3JvcHpvbmUucmVtb3ZlKCk7XG4gICAgICAgICAgICBjcm9wem9uZS5zZXQodGhpcy5fY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQoeCwgeSkpO1xuXG4gICAgICAgICAgICBjYW52YXMuYWRkKGNyb3B6b25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVjdCBkaW1lbnNpb24gc2V0dGluZyBmcm9tIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbih4LCB5KVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciB3aWR0aCA9IGNhbnZhcy5nZXRXaWR0aCgpO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmdldEhlaWdodCgpO1xuICAgICAgICB2YXIgc3RhcnRYID0gdGhpcy5fc3RhcnRYO1xuICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5fc3RhcnRZO1xuICAgICAgICB2YXIgbGVmdCA9IGNsYW1wKHgsIDAsIHN0YXJ0WCk7XG4gICAgICAgIHZhciB0b3AgPSBjbGFtcCh5LCAwLCBzdGFydFkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICB3aWR0aDogY2xhbXAoeCwgc3RhcnRYLCB3aWR0aCkgLSBsZWZ0LCAvLyAoc3RhcnRYIDw9IHgobW91c2UpIDw9IGNhbnZhc1dpZHRoKSAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGNsYW1wKHksIHN0YXJ0WSwgaGVpZ2h0KSAtIHRvcCAvLyAoc3RhcnRZIDw9IHkobW91c2UpIDw9IGNhbnZhc0hlaWdodCkgLSB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZXVwIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBjYW52YXMuc2V0QWN0aXZlT2JqZWN0KGNyb3B6b25lKTtcbiAgICAgICAgY2FudmFzLm9mZih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IGxpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiBsaXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNyb3BwZWQgaW1hZ2UgZGF0YVxuICAgICAqIEByZXR1cm5zIHs/e2ltYWdlTmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZ319IGNyb3BwZWQgSW1hZ2UgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENyb3BwZWRJbWFnZURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGNyb3BJbmZvO1xuXG4gICAgICAgIGlmICghY3JvcHpvbmUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyb3BJbmZvID0ge1xuICAgICAgICAgICAgbGVmdDogY3JvcHpvbmUuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wOiBjcm9wem9uZS5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoOiBjcm9wem9uZS5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBjcm9wem9uZS5nZXRIZWlnaHQoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbWFnZU5hbWU6IHRoaXMuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICB1cmw6IHRoaXMuZ2V0Q2FudmFzKCkudG9EYXRhVVJMKGNyb3BJbmZvKVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3BwZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBmbGlwIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogRmxpcFxuICogQGNsYXNzIEZsaXBcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRmxpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGbGlwLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GTElQLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHt7ZmxpcFg6IEJvb2xlYW4sIGZsaXBZOiBCb29sZWFufX1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50U2V0dGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmxpcFg6IGNhbnZhc0ltYWdlLmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6IGNhbnZhc0ltYWdlLmZsaXBZXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBmbGlwWCwgZmxpcFlcbiAgICAgKiBAcGFyYW0ge3tmbGlwWDogQm9vbGVhbiwgZmxpcFk6IEJvb2xlYW59fSBuZXdTZXR0aW5nIC0gRmxpcCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1NldHRpbmcpIHtcbiAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBYID0gKHNldHRpbmcuZmxpcFggIT09IG5ld1NldHRpbmcuZmxpcFgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBZID0gKHNldHRpbmcuZmxpcFkgIT09IG5ld1NldHRpbmcuZmxpcFkpO1xuXG4gICAgICAgIGlmICghaXNDaGFuZ2luZ0ZsaXBYICYmICFpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHNldHRpbmcsIG5ld1NldHRpbmcpO1xuICAgICAgICB0aGlzLnNldEltYWdlUHJvcGVydGllcyhzZXR0aW5nLCB0cnVlKTtcbiAgICAgICAgdGhpcy5faW52ZXJ0QW5nbGUoaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpO1xuICAgICAgICB0aGlzLl9mbGlwT2JqZWN0cyhpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShzZXR0aW5nLCB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZlcnQgaW1hZ2UgYW5nbGUgZm9yIGZsaXBcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbmdpbmdGbGlwWCAtIENoYW5nZSBmbGlwWFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBZIC0gQ2hhbmdlIGZsaXBZXG4gICAgICovXG4gICAgX2ludmVydEFuZ2xlOiBmdW5jdGlvbihpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG4gICAgICAgIHZhciBhbmdsZSA9IGNhbnZhc0ltYWdlLmFuZ2xlO1xuXG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFgpIHtcbiAgICAgICAgICAgIGFuZ2xlICo9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGFuZ2xlICo9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlLnNldEFuZ2xlKHBhcnNlRmxvYXQoYW5nbGUpKS5zZXRDb29yZHMoKTsvLyBwYXJzZUZsb2F0IGZvciAtMCB0byAwXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgb2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBYIC0gQ2hhbmdlIGZsaXBYXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW5naW5nRmxpcFkgLSBDaGFuZ2UgZmxpcFlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mbGlwT2JqZWN0czogZnVuY3Rpb24oaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWCkge1xuICAgICAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwYXJzZUZsb2F0KG9iai5hbmdsZSAqIC0xKSwgLy8gcGFyc2VGbG9hdCBmb3IgLTAgdG8gMFxuICAgICAgICAgICAgICAgICAgICBmbGlwWDogIW9iai5mbGlwWCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogY2FudmFzLndpZHRoIC0gb2JqLmxlZnRcbiAgICAgICAgICAgICAgICB9KS5zZXRDb29yZHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZTogcGFyc2VGbG9hdChvYmouYW5nbGUgKiAtMSksIC8vIHBhcnNlRmxvYXQgZm9yIC0wIHRvIDBcbiAgICAgICAgICAgICAgICAgICAgZmxpcFk6ICFvYmouZmxpcFksXG4gICAgICAgICAgICAgICAgICAgIHRvcDogY2FudmFzLmhlaWdodCAtIG9iai50b3BcbiAgICAgICAgICAgICAgICB9KS5zZXRDb29yZHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQoe1xuICAgICAgICAgICAgZmxpcFg6IGZhbHNlLFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiAhY3VycmVudC5mbGlwWCxcbiAgICAgICAgICAgIGZsaXBZOiBjdXJyZW50LmZsaXBZXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHlcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiBjdXJyZW50LmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6ICFjdXJyZW50LmZsaXBZXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaXA7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBGcmVlIGRyYXdpbmcgbW9kdWxlLCBTZXQgYnJ1c2hcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuLy8gdmFyIHJDb2xvclZhbHVlcyA9IC8oXFxkezEsM30pLFxccyooXFxkezEsM30pLFxccyooXFxkezEsM30pLFxccyooMC5cXGQrfDEpLztcblxuLyoqXG4gKiBGcmVlRHJhd2luZ1xuICogQGNsYXNzIEZyZWVEcmF3aW5nXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqL1xudmFyIEZyZWVEcmF3aW5nID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEZyZWVEcmF3aW5nLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQnJ1c2ggd2lkdGhcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2lkdGggPSAxMjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQnJ1c2ggY29sb3JcbiAgICAgICAgICogQHR5cGUge3N0cmluZ30gLSBSR0JhXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbG9yID0gJ3JnYmEoMCwgMCwgMCwgMC41KSc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuRlJFRV9EUkFXSU5HLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgZnJlZSBkcmF3aW5nIG1vZGVcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogP251bWJlciwgY29sb3I6ID9zdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmlzRHJhd2luZ01vZGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNldEJydXNoKHNldHRpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYnJ1c2hcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogP251bWJlciwgY29sb3I6ID9zdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc2V0QnJ1c2g6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdmFyIGJydXNoID0gdGhpcy5nZXRDYW52YXMoKS5mcmVlRHJhd2luZ0JydXNoO1xuXG4gICAgICAgIHNldHRpbmcgPSBzZXR0aW5nIHx8IHt9O1xuICAgICAgICB0aGlzLndpZHRoID0gc2V0dGluZy53aWR0aCB8fCB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmNvbG9yID0gc2V0dGluZy5jb2xvciB8fCB0aGlzLmNvbG9yO1xuICAgICAgICBicnVzaC53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGJydXNoLmNvbG9yID0gdGhpcy5jb2xvcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGZyZWUgZHJhd2luZyBtb2RlXG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmlzRHJhd2luZ01vZGUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGcmVlRHJhd2luZztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGltYWdlT3B0aW9uID0ge1xuICAgIHBhZGRpbmc6IDAsXG4gICAgY3Jvc3NPcmlnaW46ICdhbm9ueW1vdXMnXG59O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBJbWFnZUxvYWRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSLFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gaW1hZ2VOYW1lIC0gRmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxzdHJpbmcpfSBpbWcgLSBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH0gZGVmZXJyZWRcbiAgICAgKi9cbiAgICBsb2FkOiBmdW5jdGlvbihpbWFnZU5hbWUsIGltZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBqcURlZmVyLCBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgJiYgIWltZykgeyAvLyBCYWNrIHRvIHRoZSBpbml0aWFsIHN0YXRlLCBub3QgZXJyb3IuXG4gICAgICAgICAgICBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICAgICAgY2FudmFzLmJhY2tncm91bmRJbWFnZSA9IG51bGw7XG4gICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLkRlZmVycmVkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FudmFzSW1hZ2UoJycsIG51bGwpO1xuICAgICAgICAgICAgfSkucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX3NldEJhY2tncm91bmRJbWFnZShpbWcpLmRvbmUoZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZShpbWFnZU5hbWUsIG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvSW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpbWFnZU9wdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VMb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBERUZBVUxUX01BWF9XSURUSCA9IDEwMDA7XG52YXIgREVGQVVMVF9NQVhfSEVJR0hUID0gODAwO1xuXG52YXIgY3NzT25seSA9IHtjc3NPbmx5OiB0cnVlfTtcbnZhciBiYWNrc3RvcmVPbmx5ID0ge2JhY2tzdG9yZU9ubHk6IHRydWV9O1xuXG4vKipcbiAqIE1haW4gY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3ttYXhXaWR0aDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlcn19IG9wdGlvbiAtIE9wdGlvblxuICovXG52YXIgTWFpbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBNYWluLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgY2FudmFzIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ2FudmFzfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5JbWFnZX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub0ltYWdlID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWF4IHdpZHRoIG9mIGNhbnZhcyBlbGVtZW50c1xuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tYXhXaWR0aCA9IERFRkFVTFRfTUFYX1dJRFRIIHx8IG9wdGlvbi5tYXhXaWR0aDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWF4IGhlaWdodCBvZiBjYW52YXMgZWxlbWVudHNcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gREVGQVVMVF9NQVhfSEVJR0hUIHx8IG9wdGlvbi5tYXhIZWlnaHQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltYWdlIG5hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuTUFJTixcblxuICAgIC8qKlxuICAgICAqIFRvIGRhdGEgdXJsIGZyb20gY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzICYmIHRoaXMuY2FudmFzLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0dWkudXRpbC5zdGFtcChvSW1hZ2UpO1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMub0ltYWdlID0gb0ltYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnQgdG8gZmFicmljLkNhbnZhc1xuICAgICAqIEBwYXJhbSB7alF1ZXJ5fEVsZW1lbnR8c3RyaW5nfSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbihjYW52YXNFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXMoJChjYW52YXNFbGVtZW50KVswXSwge1xuICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICd0dWktaW1hZ2VFZGl0b3ItY2FudmFzQ29udGFpbmVyJ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRqdXN0IGNhbnZhcyBkaW1lbnNpb24gd2l0aCBzY2FsaW5nIGltYWdlXG4gICAgICovXG4gICAgYWRqdXN0Q2FudmFzRGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpLnNjYWxlKDEpO1xuICAgICAgICB2YXIgYm91bmRpbmdSZWN0ID0gY2FudmFzSW1hZ2UuZ2V0Qm91bmRpbmdSZWN0KCk7XG4gICAgICAgIHZhciB3aWR0aCA9IGJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGJvdW5kaW5nUmVjdC5oZWlnaHQ7XG4gICAgICAgIHZhciB3U2NhbGVGYWN0b3IgPSB0aGlzLm1heFdpZHRoIC8gd2lkdGg7XG4gICAgICAgIHZhciBoU2NhbGVGYWN0b3IgPSB0aGlzLm1heEhlaWdodCAvIGhlaWdodDtcbiAgICAgICAgdmFyIG1heFdpZHRoID0gTWF0aC5taW4od2lkdGgsIHRoaXMubWF4V2lkdGgpO1xuICAgICAgICB2YXIgbWF4SGVpZ2h0ID0gTWF0aC5taW4oaGVpZ2h0LCB0aGlzLm1heEhlaWdodCk7XG5cbiAgICAgICAgaWYgKHdTY2FsZUZhY3RvciA8IDEgJiYgd1NjYWxlRmFjdG9yIDwgaFNjYWxlRmFjdG9yKSB7XG4gICAgICAgICAgICBtYXhXaWR0aCA9IHdpZHRoICogd1NjYWxlRmFjdG9yO1xuICAgICAgICAgICAgbWF4SGVpZ2h0ID0gaGVpZ2h0ICogd1NjYWxlRmFjdG9yO1xuICAgICAgICB9IGVsc2UgaWYgKGhTY2FsZUZhY3RvciA8IDEgJiYgaFNjYWxlRmFjdG9yIDwgd1NjYWxlRmFjdG9yKSB7XG4gICAgICAgICAgICBtYXhXaWR0aCA9IHdpZHRoICogaFNjYWxlRmFjdG9yO1xuICAgICAgICAgICAgbWF4SGVpZ2h0ID0gaGVpZ2h0ICogaFNjYWxlRmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRDYW52YXNDc3NEaW1lbnNpb24oe1xuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJycsIC8vIFNldCBoZWlnaHQgJycgZm9yIElFOVxuICAgICAgICAgICAgJ21heC13aWR0aCc6IE1hdGguZmxvb3IobWF4V2lkdGgpICsgJ3B4JyxcbiAgICAgICAgICAgICdtYXgtaGVpZ2h0JzogTWF0aC5mbG9vcihtYXhIZWlnaHQpICsgJ3B4J1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb24oe1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ2V0Q2FudmFzKCkuY2VudGVyT2JqZWN0KGNhbnZhc0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBjc3Mgb25seVxuICAgICAqICB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5DYW52YXMuaHRtbCNzZXREaW1lbnNpb25zfVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgY3NzIGRpbWVuc2lvblxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0Nzc0RpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnNldERpbWVuc2lvbnMoZGltZW5zaW9uLCBjc3NPbmx5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBiYWNrc3RvcmUgb25seVxuICAgICAqICB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5DYW52YXMuaHRtbCNzZXREaW1lbnNpb25zfVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgYmFja3N0b3JlIGRpbWVuc2lvblxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnNldERpbWVuc2lvbnMoZGltZW5zaW9uLCBiYWNrc3RvcmVPbmx5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5JbWFnZS5odG1sI3NldH1cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdmFyIG9JbWFnZSA9IHRoaXMub0ltYWdlO1xuXG4gICAgICAgIGlmICghb0ltYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvSW1hZ2Uuc2V0KHNldHRpbmcpLnNldENvb3JkcygpO1xuICAgICAgICBpZiAod2l0aFJlbmRlcmluZykge1xuICAgICAgICAgICAgdGhpcy5jYW52YXMucmVuZGVyQWxsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLmdldEVsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vSW1hZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZU5hbWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlIHJvdGF0aW9uIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogSW1hZ2UgUm90YXRpb24gY29tcG9uZW50XG4gKiBAY2xhc3MgUm90YXRpb25cbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICovXG52YXIgUm90YXRpb24gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgUm90YXRpb24ucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5ST1RBVElPTixcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGFuZ2xlXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50QW5nbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYW52YXNJbWFnZSgpLmFuZ2xlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5nbGUgb2YgdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiAgRG8gbm90IGNhbGwgXCJ0aGlzLnNldEltYWdlUHJvcGVydGllc1wiIGZvciBzZXR0aW5nIGFuZ2xlIGRpcmVjdGx5LlxuICAgICAqICBCZWZvcmUgc2V0dGluZyBhbmdsZSwgVGhlIG9yaWdpblgsWSBvZiBpbWFnZSBzaG91bGQgYmUgc2V0IHRvIGNlbnRlci5cbiAgICAgKiAgICAgIFNlZSBcImh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWwjc2V0QW5nbGVcIlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHNldEFuZ2xlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgb2xkQW5nbGUgPSB0aGlzLmdldEN1cnJlbnRBbmdsZSgpICUgMzYwOyAvL1RoZSBhbmdsZSBpcyBsb3dlciB0aGFuIDIqUEkoPT09MzYwIGRlZ3JlZXMpXG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgb2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBjYW52YXNJbWFnZTtcblxuICAgICAgICBhbmdsZSAlPSAzNjA7XG4gICAgICAgIGlmIChhbmdsZSA9PT0gb2xkQW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuXG4gICAgICAgIG9sZEltYWdlQ2VudGVyID0gY2FudmFzSW1hZ2UuZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgY2FudmFzSW1hZ2Uuc2V0QW5nbGUoYW5nbGUpLnNldENvb3JkcygpO1xuICAgICAgICB0aGlzLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuICAgICAgICBuZXdJbWFnZUNlbnRlciA9IGNhbnZhc0ltYWdlLmdldENlbnRlclBvaW50KCk7XG4gICAgICAgIHRoaXMuX3JvdGF0ZUZvckVhY2hPYmplY3Qob2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBhbmdsZSAtIG9sZEFuZ2xlKTtcblxuICAgICAgICByZXR1cm4ganFEZWZlci5yZXNvbHZlKGFuZ2xlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGZvciBlYWNoIG9iamVjdFxuICAgICAqIEBwYXJhbSB7ZmFicmljLlBvaW50fSBvbGRJbWFnZUNlbnRlciAtIEltYWdlIGNlbnRlciBwb2ludCBiZWZvcmUgcm90YXRpb25cbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5Qb2ludH0gbmV3SW1hZ2VDZW50ZXIgLSBJbWFnZSBjZW50ZXIgcG9pbnQgYWZ0ZXIgcm90YXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVEaWZmIC0gSW1hZ2UgYW5nbGUgZGlmZmVyZW5jZSBhZnRlciByb3RhdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JvdGF0ZUZvckVhY2hPYmplY3Q6IGZ1bmN0aW9uKG9sZEltYWdlQ2VudGVyLCBuZXdJbWFnZUNlbnRlciwgYW5nbGVEaWZmKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY2VudGVyRGlmZiA9IHtcbiAgICAgICAgICAgIHg6IG9sZEltYWdlQ2VudGVyLnggLSBuZXdJbWFnZUNlbnRlci54LFxuICAgICAgICAgICAgeTogb2xkSW1hZ2VDZW50ZXIueSAtIG5ld0ltYWdlQ2VudGVyLnlcbiAgICAgICAgfTtcblxuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHZhciBvYmpDZW50ZXIgPSBvYmouZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgICAgIHZhciByYWRpYW4gPSBmYWJyaWMudXRpbC5kZWdyZWVzVG9SYWRpYW5zKGFuZ2xlRGlmZik7XG4gICAgICAgICAgICB2YXIgbmV3T2JqQ2VudGVyID0gZmFicmljLnV0aWwucm90YXRlUG9pbnQob2JqQ2VudGVyLCBvbGRJbWFnZUNlbnRlciwgcmFkaWFuKTtcblxuICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgbGVmdDogbmV3T2JqQ2VudGVyLnggLSBjZW50ZXJEaWZmLngsXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdPYmpDZW50ZXIueSAtIGNlbnRlckRpZmYueSxcbiAgICAgICAgICAgICAgICBhbmdsZTogKG9iai5hbmdsZSArIGFuZ2xlRGlmZikgJSAzNjBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLnNldENvb3JkcygpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFkZGl0aW9uYWxBbmdsZSAtIEFkZGl0aW9uYWwgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24oYWRkaXRpb25hbEFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBbmdsZShjdXJyZW50ICsgYWRkaXRpb25hbEFuZ2xlKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3RhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29tcG9uZW50TmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTUFJTicsXG4gICAgICAgICdJTUFHRV9MT0FERVInLFxuICAgICAgICAnQ1JPUFBFUicsXG4gICAgICAgICdGTElQJyxcbiAgICAgICAgJ1JPVEFUSU9OJyxcbiAgICAgICAgJ0ZSRUVfRFJBV0lORydcbiAgICApLFxuXG4gICAgY29tbWFuZE5hbWVzOiB1dGlsLmtleU1pcnJvcihcbiAgICAgICAgJ0NMRUFSJyxcbiAgICAgICAgJ0xPQURfSU1BR0UnLFxuICAgICAgICAnRkxJUF9JTUFHRScsXG4gICAgICAgICdST1RBVEVfSU1BR0UnLFxuICAgICAgICAnQUREX09CSkVDVCdcbiAgICApLFxuXG4gICAgZXZlbnROYW1lczoge1xuICAgICAgICBMT0FEX0lNQUdFOiAnbG9hZEltYWdlJyxcbiAgICAgICAgQ0xFQVJfT0JKRUNUUzogJ2NsZWFyJyxcbiAgICAgICAgQ0xFQVJfSU1BR0U6ICdjbGVhckltYWdlJyxcbiAgICAgICAgU1RBUlRfQ1JPUFBJTkc6ICdzdGFydENyb3BwaW5nJyxcbiAgICAgICAgRU5EX0NST1BQSU5HOiAnZW5kQ3JvcHBpbmcnLFxuICAgICAgICBGTElQX0lNQUdFOiAnZmxpcEltYWdlJyxcbiAgICAgICAgUk9UQVRFX0lNQUdFOiAncm90YXRlSW1hZ2UnLFxuICAgICAgICBBRERfT0JKRUNUOiAnYWRkT2JqZWN0JyxcbiAgICAgICAgUkVNT1ZFX09CSkVDVDogJ3JlbW92ZU9iamVjdCcsXG4gICAgICAgIFNUQVJUX0ZSRUVfRFJBV0lORzogJ3N0YXJ0RnJlZURyYXdpbmcnLFxuICAgICAgICBFTkRfRlJFRV9EUkFXSU5HOiAnZW5kRnJlZURyYXdpbmcnLFxuICAgICAgICBFTVBUWV9SRURPX1NUQUNLOiAnZW1wdHlSZWRvU3RhY2snLFxuICAgICAgICBFTVBUWV9VTkRPX1NUQUNLOiAnZW1wdHlVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1VORE9fU1RBQ0s6ICdwdXNoVW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9SRURPX1NUQUNLOiAncHVzaFJlZG9TdGFjaydcbiAgICB9LFxuXG4gICAgSVNfU1VQUE9SVF9GSUxFX0FQSTogISEod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5GaWxlUmVhZGVyKVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYW1wID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNsYW1wO1xuXG52YXIgQ09STkVSX1RZUEVfVE9QX0xFRlQgPSAndGwnO1xudmFyIENPUk5FUl9UWVBFX1RPUF9SSUdIVCA9ICd0cic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1RPUCA9ICdtdCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0xFRlQgPSAnbWwnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVCA9ICdtcic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTSA9ICdtYic7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQgPSAnYmwnO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVCA9ICdicic7XG5cbi8qKlxuICogQ3JvcHpvbmUgb2JqZWN0XG4gKiBJc3N1ZTogSUU3LCA4KHdpdGggZXhjYW52YXMpXG4gKiAgLSBDcm9wem9uZSBpcyBhIGJsYWNrIHpvbmUgd2l0aG91dCB0cmFuc3BhcmVuY3kuXG4gKiBAY2xhc3MgQ3JvcHpvbmVcbiAqIEBleHRlbmRzIHtmYWJyaWMuUmVjdH1cbiAqL1xudmFyIENyb3B6b25lID0gZmFicmljLnV0aWwuY3JlYXRlQ2xhc3MoZmFicmljLlJlY3QsIC8qKiBAbGVuZHMgQ3JvcHpvbmUucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ2luaXRpYWxpemUnLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAnbW92aW5nJzogdGhpcy5fb25Nb3ZpbmcsXG4gICAgICAgICAgICAnc2NhbGluZyc6IHRoaXMuX29uU2NhbGluZ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIENyb3Atem9uZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfcmVuZGVyOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRmxpcFgsIG9yaWdpbmFsRmxpcFksXG4gICAgICAgICAgICBvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVksXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lV2lkdGggPSA3LFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZU9mZnNldCA9IDc7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdfcmVuZGVyJywgY3R4KTtcblxuICAgICAgICAvLyBDYWxjIG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIG9yaWdpbmFsRmxpcFggPSB0aGlzLmZsaXBYID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbEZsaXBZID0gdGhpcy5mbGlwWSA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVggPSBvcmlnaW5hbEZsaXBYIC8gdGhpcy5zY2FsZVg7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVZID0gb3JpZ2luYWxGbGlwWSAvIHRoaXMuc2NhbGVZO1xuXG4gICAgICAgIC8vIFNldCBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUob3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZKTtcblxuICAgICAgICAvLyBSZW5kZXIgb3V0ZXIgcmVjdFxuICAgICAgICB0aGlzLl9maWxsT3V0ZXJSZWN0KGN0eCwgJ3JnYmEoMCwgMCwgMCwgMC41NSknKTtcblxuICAgICAgICAvLyBCbGFjayBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigwLCAwLCAwKScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCk7XG5cbiAgICAgICAgLy8gV2hpdGUgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMjU1LCAyNTUsIDI1NSknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgsIGNyb3B6b25lRGFzaExpbmVPZmZzZXQpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZSgxIC8gb3JpZ2luYWxTY2FsZVgsIDEgLyBvcmlnaW5hbFNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyb3B6b25lLWNvb3JkaW5hdGVzIHdpdGggb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICpcbiAgICAgKiAgICAgeDAgICAgIHgxICAgICAgICAgeDIgICAgICB4M1xuICAgICAqICB5MCArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3wgICAgLy8gPC0tLSBcIk91dGVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTEgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wgQ3JvcHpvbmUgfC8vLy8vLy98ICAgIENyb3B6b25lIGlzIHRoZSBcIklubmVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfCAgKDAsIDApICB8Ly8vLy8vL3wgICAgQ2VudGVyIHBvaW50ICgwLCAwKVxuICAgICAqICB5MiArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICpcbiAgICAgKiBAdHlwZWRlZiB7e3g6IEFycmF5PG51bWJlcj4sIHk6IEFycmF5PG51bWJlcj59fSBjcm9wem9uZUNvb3JkaW5hdGVzXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBGaWxsIG91dGVyIHJlY3RhbmdsZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gZmlsbFN0eWxlIC0gRmlsbC1zdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbGxPdXRlclJlY3Q6IGZ1bmN0aW9uKGN0eCwgZmlsbFN0eWxlKSB7XG4gICAgICAgIHZhciBjb29yZGluYXRlcyA9IHRoaXMuX2dldENvb3JkaW5hdGVzKGN0eCksXG4gICAgICAgICAgICB4ID0gY29vcmRpbmF0ZXMueCxcbiAgICAgICAgICAgIHkgPSBjb29yZGluYXRlcy55O1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyBPdXRlciByZWN0YW5nbGVcbiAgICAgICAgLy8gTnVtYmVycyBhcmUgKy8tMSBzbyB0aGF0IG92ZXJsYXkgZWRnZXMgZG9uJ3QgZ2V0IGJsdXJyeS5cbiAgICAgICAgY3R4Lm1vdmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbM10gKyAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVszXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICAvLyBJbm5lciByZWN0YW5nbGVcbiAgICAgICAgY3R4Lm1vdmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb29yZGluYXRlc1xuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHJldHVybnMge2Nyb3B6b25lQ29vcmRpbmF0ZXN9IC0ge0BsaW5rIGNyb3B6b25lQ29vcmRpbmF0ZXN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY2VpbCA9IE1hdGguY2VpbCxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSBoZWlnaHQgLyAyLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIGNhbnZhc0VsID0gY3R4LmNhbnZhczsgLy8gY2FudmFzIGVsZW1lbnQsIG5vdCBmYWJyaWMgb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGggKyBsZWZ0KSwgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MFxuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDFcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGgsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgyXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoICsgKGNhbnZhc0VsLndpZHRoIC0gbGVmdCAtIHdpZHRoKSAvLyB4M1xuICAgICAgICAgICAgXSwgY2VpbCksXG4gICAgICAgICAgICB5OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCArIHRvcCksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkwXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTFcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MlxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQgKyAoY2FudmFzRWwuaGVpZ2h0IC0gdG9wIC0gaGVpZ2h0KSAgIC8vIHkzXG4gICAgICAgICAgICBdLCBjZWlsKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdHJva2UgYm9yZGVyXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBzdHJva2VTdHlsZSAtIFN0cm9rZS1zdHlsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaFdpZHRoIC0gRGFzaCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbGluZURhc2hPZmZzZXRdIC0gRGFzaCBvZmZzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zdHJva2VCb3JkZXI6IGZ1bmN0aW9uKGN0eCwgc3Ryb2tlU3R5bGUsIGxpbmVEYXNoV2lkdGgsIGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgIHZhciBoYWxmV2lkdGggPSB0aGlzLmdldFdpZHRoKCkgLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgICBpZiAoY3R4LnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBjdHguc2V0TGluZURhc2goW2xpbmVEYXNoV2lkdGgsIGxpbmVEYXNoV2lkdGhdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgICAgIGN0eC5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW92aW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3Zpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgbWF4TGVmdCA9IGNhbnZhcy5nZXRXaWR0aCgpIC0gd2lkdGgsXG4gICAgICAgICAgICBtYXhUb3AgPSBjYW52YXMuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5zZXRMZWZ0KGNsYW1wKGxlZnQsIDAsIG1heExlZnQpKTtcbiAgICAgICAgdGhpcy5zZXRUb3AoY2xhbXAodG9wLCAwLCBtYXhUb3ApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TY2FsaW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHt7ZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU2NhbGluZzogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBwb2ludGVyID0gdGhpcy5jYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRoaXMuX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXIpO1xuXG4gICAgICAgIC8vIE9uIHNjYWxpbmcgY3JvcHpvbmUsXG4gICAgICAgIC8vIGNoYW5nZSByZWFsIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGZpeCBzY2FsZUZhY3RvciB0byAxXG4gICAgICAgIHRoaXMuc2NhbGUoMSkuc2V0KHNldHRpbmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsZWQgc2l6ZSBmcm9tIG1vdXNlIHBvaW50ZXIgd2l0aCBzZWxlY3RlZCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IHBvaW50ZXIgLSBNb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEhhdmluZyBsZWZ0IG9yKGFuZCkgdG9wIG9yKGFuZCkgd2lkdGggb3IoYW5kKSBoZWlnaHQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHBvaW50ZXIpIHtcbiAgICAgICAgdmFyIHBvaW50ZXJYID0gcG9pbnRlci54LFxuICAgICAgICAgICAgcG9pbnRlclkgPSBwb2ludGVyLnksXG4gICAgICAgICAgICB0bFNjYWxpbmdTaXplID0gdGhpcy5fY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSksXG4gICAgICAgICAgICBiclNjYWxpbmdTaXplID0gdGhpcy5fY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEB0b2RvOiDsnbzrsJgg6rCd7LK07JeQ7IScIHNoaWZ0IOyhsO2Vqe2CpOulvCDriITrpbTrqbQgZnJlZSBzaXplIHNjYWxpbmfsnbQg65CoIC0tPiDtmZXsnbjtlbTrs7zqsoNcbiAgICAgICAgICogICAgICBjYW52YXMuY2xhc3MuanMgLy8gX3NjYWxlT2JqZWN0OiBmdW5jdGlvbiguLi4pey4uLn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2NhbGluZ1NldHRpbmdzKHRsU2NhbGluZ1NpemUsIGJyU2NhbGluZ1NpemUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZShwb3NpdGlvbiArIGRpbWVuc2lvbikgZnJvbSBsZWZ0LXRvcCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRoaXMuZ2V0SGVpZ2h0KCkgKyB0aGlzLnRvcCxcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5nZXRXaWR0aCgpICsgdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gY2xhbXAoeSwgMCwgYm90dG9tIC0gMSksICAvLyAwIDw9IHRvcCA8PSAoYm90dG9tIC0gMSlcbiAgICAgICAgICAgIGxlZnQgPSBjbGFtcCh4LCAwLCByaWdodCAtIDEpOyAgLy8gMCA8PSBsZWZ0IDw9IChyaWdodCAtIDEpXG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiVG9wLUxlZnQgY29ybmVyXCI6IEl0IGZpeGVzIHJpZ2h0IGFuZCBib3R0b20gY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiByaWdodCAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdHRvbSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZSBmcm9tIHJpZ2h0LWJvdHRvbSBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIG1heFggPSBjYW52YXMud2lkdGgsXG4gICAgICAgICAgICBtYXhZID0gY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSB0aGlzLnRvcDtcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJCb3R0b20tUmlnaHQgY29ybmVyXCI6IEl0IGZpeGVzIGxlZnQgYW5kIHRvcCBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIChsZWZ0ICsgMSksIG1heFgpIC0gbGVmdCwgICAgLy8gKHdpZHRoID0geCAtIGxlZnQpLCAobGVmdCArIDEgPD0geCA8PSBtYXhYKVxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCAodG9wICsgMSksIG1heFkpIC0gdG9wICAgICAgLy8gKGhlaWdodCA9IHkgLSB0b3ApLCAodG9wICsgMSA8PSB5IDw9IG1heFkpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSovXG4gICAgLyoqXG4gICAgICogTWFrZSBzY2FsaW5nIHNldHRpbmdzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0bCAtIFRvcC1MZWZ0IHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJyIC0gQm90dG9tLVJpZ2h0IHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiA/bnVtYmVyLCBoZWlnaHQ6ID9udW1iZXIsIGxlZnQ6ID9udW1iZXIsIHRvcDogP251bWJlcn19IFBvc2l0aW9uIHNldHRpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2NhbGluZ1NldHRpbmdzOiBmdW5jdGlvbih0bCwgYnIpIHtcbiAgICAgICAgdmFyIHRsV2lkdGggPSB0bC53aWR0aCxcbiAgICAgICAgICAgIHRsSGVpZ2h0ID0gdGwuaGVpZ2h0LFxuICAgICAgICAgICAgYnJIZWlnaHQgPSBici5oZWlnaHQsXG4gICAgICAgICAgICBicldpZHRoID0gYnIud2lkdGgsXG4gICAgICAgICAgICB0bExlZnQgPSB0bC5sZWZ0LFxuICAgICAgICAgICAgdGxUb3AgPSB0bC50b3AsXG4gICAgICAgICAgICBzZXR0aW5ncztcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuX19jb3JuZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0bDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gYnI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1RPUDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfSwgLyplc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSB3aGV0aGVyIHRoaXMgY3JvcHpvbmUgaXMgdmFsaWRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMubGVmdCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLnRvcCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLndpZHRoID4gMCAmJlxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPiAwXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHpvbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21tYW5kID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGNvbXBvbmVudE5hbWVzID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xudmFyIGNvbW1hbmROYW1lcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY3JlYXRvcnMgPSB7fTtcblxudmFyIE1BSU4gPSBjb21wb25lbnROYW1lcy5NQUlOO1xudmFyIElNQUdFX0xPQURFUiA9IGNvbXBvbmVudE5hbWVzLklNQUdFX0xPQURFUjtcbnZhciBGTElQID0gY29tcG9uZW50TmFtZXMuRkxJUDtcbnZhciBST1RBVElPTiA9IGNvbXBvbmVudE5hbWVzLlJPVEFUSU9OO1xuXG4vKipcbiAqIFNldCBtYXBwaW5nIGNyZWF0b3JzXG4gKi9cbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5MT0FEX0lNQUdFXSA9IGNyZWF0ZUxvYWRJbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuRkxJUF9JTUFHRV0gPSBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLlJPVEFURV9JTUFHRV0gPSBjcmVhdGVSb3RhdGlvbkltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5DTEVBUl9PQkpFQ1RTXSA9IGNyZWF0ZUNsZWFyQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5BRERfT0JKRUNUXSA9IGNyZWF0ZUFkZE9iamVjdENvbW1hbmQ7XG5cbi8qKlxuICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fSBvYmplY3QgLSBGYWJyaWMgb2JqZWN0XG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQWRkT2JqZWN0Q29tbWFuZChvYmplY3QpIHtcbiAgICB0dWkudXRpbC5zdGFtcChvYmplY3QpO1xuXG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKCFjYW52YXMuY29udGFpbnMob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQob2JqZWN0KTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmIChjYW52YXMuY29udGFpbnMob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5yZW1vdmUob2JqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShvYmplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGltYWdlTmFtZSAtIEltYWdlIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBJbWFnZSB1cmxcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kKGltYWdlTmFtZSwgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBsb2FkZXIuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB7XG4gICAgICAgICAgICAgICAgcHJldk5hbWU6IGxvYWRlci5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgICAgICBwcmV2SW1hZ2U6IGxvYWRlci5nZXRDYW52YXNJbWFnZSgpLFxuICAgICAgICAgICAgICAgIC8vIFNsaWNlOiBcImNhbnZhcy5jbGVhcigpXCIgY2xlYXJzIHRoZSBvYmplY3RzIGFycmF5LCBTbyBzaGFsbG93IGNvcHkgdGhlIGFycmF5XG4gICAgICAgICAgICAgICAgb2JqZWN0czogY2FudmFzLmdldE9iamVjdHMoKS5zbGljZSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChpbWFnZU5hbWUsIHVybCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gbG9hZGVyLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcblxuICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG4gICAgICAgICAgICBjYW52YXMuYWRkLmFwcGx5KGNhbnZhcywgc3RvcmUub2JqZWN0cyk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChzdG9yZS5wcmV2TmFtZSwgc3RvcmUucHJldkltYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAqIEByZXR1cm5zIHskLkRlZmVycmVkfVxuICovXG5mdW5jdGlvbiBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kKHR5cGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gZmxpcENvbXAuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZsaXBDb21wW3R5cGVdKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmbGlwQ29tcCA9IGNvbXBNYXBbRkxJUF07XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcC5zZXQodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdyb3RhdGUnIG9yICdzZXRBbmdsZSdcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGFuZ2xlIHZhbHVlIChkZWdyZWUpXG4gKiBAcmV0dXJucyB7JC5EZWZlcnJlZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUm90YXRpb25JbWFnZUNvbW1hbmQodHlwZSwgYW5nbGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSByb3RhdGlvbkNvbXAuZ2V0Q3VycmVudEFuZ2xlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXBbdHlwZV0oYW5nbGUpO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXAuc2V0QW5nbGUodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2xlYXJDb21tYW5kKCkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIC8vIFNsaWNlOiBcImNhbnZhcy5jbGVhcigpXCIgY2xlYXJzIHRoZSBvYmplY3RzIGFycmF5LCBTbyBzaGFsbG93IGNvcHkgdGhlIGFycmF5XG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gY2FudmFzLmdldE9iamVjdHMoKS5zbGljZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgICAgICB9LFxuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZC5hcHBseShjYW52YXMsIHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGNvbW1hbmRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tbWFuZCBuYW1lXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBBcmd1bWVudHMgZm9yIGNyZWF0aW5nIGNvbW1hbmRcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGUobmFtZSwgYXJncykge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgcmV0dXJuIGNyZWF0b3JzW25hbWVdLmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNyZWF0ZTogY3JlYXRlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5TWlycm9yID0gcmVxdWlyZSgnLi4vdXRpbCcpLmtleU1pcnJvcjtcblxudmFyIHR5cGVzID0ga2V5TWlycm9yKFxuICAgICdVTl9JTVBMRU1FTlRBVElPTicsXG4gICAgJ05PX0NPTVBPTkVOVF9OQU1FJ1xuKTtcblxudmFyIG1lc3NhZ2VzID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiAnU2hvdWxkIGltcGxlbWVudCBhIG1ldGhvZDogJyxcbiAgICBOT19DT01QT05FTlRfTkFNRTogJ1Nob3VsZCBzZXQgYSBjb21wb25lbnQgbmFtZSdcbn07XG5cbnZhciBtYXAgPSB7XG4gICAgVU5fSU1QTEVNRU5UQVRJT046IGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLlVOX0lNUExFTUVOVEFUSU9OICsgbWV0aG9kTmFtZTtcbiAgICB9LFxuICAgIE5PX0NPTVBPTkVOVF9OQU1FOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLk5PX0NPTVBPTkVOVF9OQU1FO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHR5cGVzOiB0dWkudXRpbC5leHRlbmQoe30sIHR5cGVzKSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgZnVuYztcblxuICAgICAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBmdW5jID0gbWFwW3R5cGVdO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcblxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbnZva2VyID0gcmVxdWlyZSgnLi9pbnZva2VyJyk7XG52YXIgY29tbWFuZEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnkvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciBldmVudHMgPSBjb25zdHMuZXZlbnROYW1lcztcbnZhciBjb21tYW5kcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY29tcExpc3QgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG5cbi8qKlxuICogSW1hZ2UgZWRpdG9yXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfGpRdWVyeXxIVE1MRWxlbWVudH0gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gKi9cbnZhciBJbWFnZUVkaXRvciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW1hZ2VFZGl0b3IucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9rZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0ludm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyID0gbmV3IEludm9rZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljLUNhbnZhcyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNhbnZhc31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fc2V0Q2FudmFzKGNhbnZhc0VsZW1lbnQpO1xuICAgICAgICB0aGlzLl9hdHRhY2hJbnZva2VyRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaENhbnZhc0V2ZW50cygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggaW52b2tlciBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hJbnZva2VyRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIFBVU0hfVU5ET19TVEFDSyA9IGV2ZW50cy5QVVNIX1VORE9fU1RBQ0s7XG4gICAgICAgIHZhciBQVVNIX1JFRE9fU1RBQ0sgPSBldmVudHMuUFVTSF9SRURPX1NUQUNLO1xuICAgICAgICB2YXIgRU1QVFlfVU5ET19TVEFDSyA9IGV2ZW50cy5FTVBUWV9VTkRPX1NUQUNLO1xuICAgICAgICB2YXIgRU1QVFlfUkVET19TVEFDSyA9IGV2ZW50cy5FTVBUWV9SRURPX1NUQUNLO1xuXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oUFVTSF9VTkRPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgUFVTSF9VTkRPX1NUQUNLKSk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oUFVTSF9SRURPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgUFVTSF9SRURPX1NUQUNLKSk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oRU1QVFlfVU5ET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIEVNUFRZX1VORE9fU1RBQ0spKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5vbihFTVBUWV9SRURPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgRU1QVFlfUkVET19TVEFDSykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY2FudmFzIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaENhbnZhc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5vbih7XG4gICAgICAgICAgICAncGF0aDpjcmVhdGVkJzogJC5wcm94eSh0aGlzLl9vblBhdGhDcmVhdGVkLCB0aGlzKSxcbiAgICAgICAgICAgICdvYmplY3Q6YWRkZWQnOiAkLnByb3h5KGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICB2YXIgY29tbWFuZDtcbiAgICAgICAgICAgICAgICBpZiAoIXR1aS51dGlsLmhhc1N0YW1wKG9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5BRERfT0JKRUNULCBvYmopO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkFERF9PQkpFQ1QsIG9iaik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludm9rZXIucHVzaFVuZG9TdGFjayhjb21tYW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgICdvYmplY3Q6cmVtb3ZlZCc6ICQucHJveHkoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLlJFTU9WRV9PQkpFQ1QsIGV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnRMaXN0ZW5lciAtIFwicGF0aDpjcmVhdGVkXCJcbiAgICAgKiAgLSBFdmVudHM6OiBcIm9iamVjdDphZGRlZFwiIC0+IFwicGF0aDpjcmVhdGVkXCJcbiAgICAgKiBAcGFyYW0ge3twYXRoOiBmYWJyaWMuUGF0aH19IG9iaiAtIFBhdGggb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25QYXRoQ3JlYXRlZDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciBwYXRoID0gb2JqLnBhdGg7XG5cbiAgICAgICAgcGF0aC5zZXQoe1xuICAgICAgICAgICAgcm90YXRpbmdQb2ludE9mZnNldDogMzAsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogJ3JlZCcsXG4gICAgICAgICAgICB0cmFuc3BhcmVudENvcm5lcnM6IGZhbHNlLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdncmVlbicsXG4gICAgICAgICAgICBjb3JuZXJTaXplOiA2XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xqUXVlcnl8SFRNTEVsZW1lbnR9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldENhbnZhczogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudDtcblxuICAgICAgICBtYWluQ29tcG9uZW50ID0gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpO1xuICAgICAgICBtYWluQ29tcG9uZW50LnNldENhbnZhc0VsZW1lbnQoY2FudmFzRWxlbWVudCk7XG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG1haW5Db21wb25lbnQuZ2V0Q2FudmFzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBldmVudCBuYW1lc1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RXZlbnROYW1lczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5leHRlbmQoe30sIGV2ZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgbWFpbiBjb21wb25lbnRcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fSBNYWluIGNvbXBvbmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE1haW5Db21wb25lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0Lk1BSU4pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcG9uZW50OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2VyLmdldENvbXBvbmVudChuYW1lKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG9iamVjdHNcbiAgICAgKi9cbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkNMRUFSX09CSkVDVFMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLkNMRUFSX09CSkVDVFMpO1xuXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3VycmVudCBhY3Rpb25cbiAgICAgKi9cbiAgICBlbmRBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICAgIHRoaXMuZW5kQ3JvcHBpbmcoKTtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlYWN0aXZhdGUgYWxsIG9iamVjdHNcbiAgICAgKi9cbiAgICBkZWFjdGl2YXRlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLmludm9rZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLnVuZG8oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkb1xuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLnJlZG8oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIGZpbGVcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltZ0ZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbUZpbGU6IGZ1bmN0aW9uKGltZ0ZpbGUpIHtcbiAgICAgICAgaWYgKCFpbWdGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoXG4gICAgICAgICAgICBpbWdGaWxlLm5hbWUsXG4gICAgICAgICAgICBVUkwuY3JlYXRlT2JqZWN0VVJMKGltZ0ZpbGUpXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gaW1hZ2VOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEZpbGUgdXJsXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbVVSTDogZnVuY3Rpb24oaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgfHwgIXVybCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmcsIHRoaXMpO1xuICAgICAgICBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkxPQURfSU1BR0UsIGltYWdlTmFtZSwgdXJsKTtcblxuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhvSW1hZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuQ0xFQVJfSU1BR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIGltYWdlIGxvYWRpbmdcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmc6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2dldE1haW5Db21wb25lbnQoKTtcbiAgICAgICAgdmFyICRjYW52YXNFbGVtZW50ID0gJChtYWluQ29tcG9uZW50LmdldENhbnZhc0VsZW1lbnQoKSk7XG5cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5MT0FEX0lNQUdFLCB7XG4gICAgICAgICAgICBvcmlnaW5hbFdpZHRoOiBvSW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBvcmlnaW5hbEhlaWdodDogb0ltYWdlLmhlaWdodCxcbiAgICAgICAgICAgIGN1cnJlbnRXaWR0aDogJGNhbnZhc0VsZW1lbnQud2lkdGgoKSxcbiAgICAgICAgICAgIGN1cnJlbnRIZWlnaHQ6ICRjYW52YXNFbGVtZW50LmhlaWdodCgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBjcm9wcGluZ1xuICAgICAqL1xuICAgIHN0YXJ0Q3JvcHBpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHBlciA9IHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5DUk9QUEVSKTtcblxuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICBjcm9wcGVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuU1RBUlRfQ1JPUFBJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjcm9wcGluZ1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQXBwbHlpbmddIC0gV2hldGhlciB0aGUgY3JvcHBpbmcgaXMgYXBwbGllZCBvciBjYW5jZWxlZFxuICAgICAqL1xuICAgIGVuZENyb3BwaW5nOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuICAgICAgICB2YXIgZGF0YSA9IGNyb3BwZXIuZW5kKGlzQXBwbHlpbmcpO1xuXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuRU5EX0NST1BQSU5HKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChkYXRhLmltYWdlTmFtZSwgZGF0YS51cmwpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdmbGlwWCcgb3IgJ2ZsaXBZJyBvciAncmVzZXQnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmxpcDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLkZMSVBfSU1BR0UpO1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5GTElQX0lNQUdFLCB0eXBlKTtcblxuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICovXG4gICAgZmxpcFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdmbGlwWScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwXG4gICAgICovXG4gICAgcmVzZXRGbGlwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgncmVzZXQnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAncm90YXRlJyBvciAnc2V0QW5nbGUnXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gYW5nbGUgdmFsdWUgKGRlZ3JlZSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKHR5cGUsIGFuZ2xlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBldmVudHMuUk9UQVRFX0lNQUdFKTtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuUk9UQVRFX0lNQUdFLCB0eXBlLCBhbmdsZSk7XG5cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBZGRpdGlvbmFsIGFuZ2xlIHRvIHJvdGF0ZSBpbWFnZVxuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgdGhpcy5fcm90YXRlKCdyb3RhdGUnLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhbmdsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIEFuZ2xlIG9mIGltYWdlXG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHRoaXMuX3JvdGF0ZSgnc2V0QW5nbGUnLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGZyZWUtZHJhd2luZyBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgY29sb3I6IHN0cmluZ319IHNldHRpbmcgLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc3RhcnRGcmVlRHJhd2luZzogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuRlJFRV9EUkFXSU5HKS5zdGFydChzZXR0aW5nKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5TVEFSVF9GUkVFX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZHJhd2luZyBicnVzaFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGNvbG9yOiBzdHJpbmd9fSBzZXR0aW5nIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHNldEJydXNoOiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5GUkVFX0RSQVdJTkcpLnNldEJydXNoKHNldHRpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgZnJlZS1kcmF3aW5nIG1vZGVcbiAgICAgKi9cbiAgICBlbmRGcmVlRHJhd2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5GUkVFX0RSQVdJTkcpLmVuZCgpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9GUkVFX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEEgRE9NU3RyaW5nIGluZGljYXRpbmcgdGhlIGltYWdlIGZvcm1hdC4gVGhlIGRlZmF1bHQgdHlwZSBpcyBpbWFnZS9wbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQSBET01TdHJpbmcgY29udGFpbmluZyB0aGUgcmVxdWVzdGVkIGRhdGEgVVJJLlxuICAgICAqL1xuICAgIHRvRGF0YVVSTDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkuZ2V0SW1hZ2VOYW1lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclVuZG9TdGFjaygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEltYWdlRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29tcG9uZW50IGludGVyZmFjZVxuICogQGNsYXNzXG4gKi9cbnZhciBDb21wb25lbnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENvbXBvbmVudC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzSW1hZ2UobmFtZSwgb0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhc0VsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIGVkaXRvclxuICAgICAqIEByZXR1cm5zIHtJbWFnZUVkaXRvcn1cbiAgICAgKi9cbiAgICBnZXRFZGl0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0RWRpdG9yKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBjb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbWFnZSBwcm9wZXJ0aWVzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmcgLSBJbWFnZSBwcm9wZXJ0aWVzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbd2l0aFJlbmRlcmluZ10gLSBJZiB0cnVlLCBUaGUgY2hhbmdlZCBpbWFnZSB3aWxsIGJlIHJlZmxlY3RlZCBpbiB0aGUgY2FudmFzXG4gICAgICovXG4gICAgc2V0SW1hZ2VQcm9wZXJ0aWVzOiBmdW5jdGlvbihzZXR0aW5nLCB3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldEltYWdlUHJvcGVydGllcyhzZXR0aW5nLCB3aXRoUmVuZGVyaW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBjc3Mgb25seVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgY3NzIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHNldENhbnZhc0Nzc0RpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldENhbnZhc0Nzc0RpbWVuc2lvbihkaW1lbnNpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKGRpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudHxudWxsfSBwYXJlbnQgLSBQYXJlbnRcbiAgICAgKi9cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRqdXN0IGNhbnZhcyBkaW1lbnNpb24gd2l0aCBzY2FsaW5nIGltYWdlXG4gICAgICovXG4gICAgYWRqdXN0Q2FudmFzRGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuYWRqdXN0Q2FudmFzRGltZW5zaW9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBwYXJlbnQuXG4gICAgICogSWYgdGhlIHZpZXcgaXMgcm9vdCwgcmV0dXJuIG51bGxcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fG51bGx9XG4gICAgICovXG4gICAgZ2V0UGFyZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHJvb3RcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldFJvb3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMuZ2V0UGFyZW50KCk7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXNcblxuICAgICAgICB3aGlsZSAobmV4dCkge1xuICAgICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVycm9yTWVzc2FnZSA9IHJlcXVpcmUoJy4uL2ZhY3RvcnkvZXJyb3JNZXNzYWdlJyk7XG5cbnZhciBjcmVhdGVNZXNzYWdlID0gZXJyb3JNZXNzYWdlLmNyZWF0ZSxcbiAgICBlcnJvclR5cGVzID0gZXJyb3JNZXNzYWdlLnR5cGVzO1xuXG4vKipcbiAqIENvbW1hbmQgY2xhc3NcbiAqIEBjbGFzc1xuICogQHBhcmFtIHt7ZXhlY3V0ZTogZnVuY3Rpb24sIHVuZG86IGZ1bmN0aW9ufX0gYWN0aW9ucyAtIENvbW1hbmQgYWN0aW9uc1xuICovXG52YXIgQ29tbWFuZCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tbWFuZC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oYWN0aW9ucykge1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhlY3V0ZSBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4ZWN1dGUgPSBhY3Rpb25zLmV4ZWN1dGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gZnVuY3Rpb25cbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvID0gYWN0aW9ucy51bmRvO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBleGVjdXRlQ2FsbGJhY2tcbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4ZWN1dGVDYWxsYmFjayA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHVuZG9DYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kb0NhbGxiYWNrID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhY3Rpb25cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICBleGVjdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoZXJyb3JUeXBlcy5VTl9JTVBMRU1FTlRBVElPTiwgJ2V4ZWN1dGUnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG8gYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICd1bmRvJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXhlY3V0ZSBjYWxsYWJja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgYWZ0ZXIgZXhlY3V0aW9uXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRFeGVjdXRlQ2FsbGJhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZXhlY3V0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCB1bmRvIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBhZnRlciB1bmRvXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRVbmRvQ2FsbGJhY2s6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMudW5kb0NhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaW1hZ2VMb2FkZXInKTtcbnZhciBDcm9wcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvY3JvcHBlcicpO1xudmFyIE1haW5Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9tYWluJyk7XG52YXIgRmxpcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ZsaXAnKTtcbnZhciBSb3RhdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50L3JvdGF0aW9uJyk7XG52YXIgRnJlZURyYXdpbmcgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mcmVlRHJhd2luZycpO1xudmFyIGV2ZW50TmFtZXMgPSByZXF1aXJlKCcuL2NvbnN0cycpLmV2ZW50TmFtZXM7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbnZva2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEN1c3RvbSBFdmVudHNcbiAgICAgICAgICogQHR5cGUge3R1aS51dGlsLkN1c3RvbUV2ZW50c31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2N1c3RvbUV2ZW50cyA9IG5ldyB0dWkudXRpbC5DdXN0b21FdmVudHMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdW5kb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21wb25lbnQgbWFwXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudE1hcCA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2NrLWZsYWcgZm9yIGV4ZWN1dGluZyBjb21tYW5kXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faXNMb2NrZWQgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQm91bmQgbWV0aG9kIHRvIGxvY2tcbiAgICAgICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2NrID0gJC5wcm94eSh0aGlzLmxvY2ssIHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCb3VuZCBtZXRob2QgdG8gdW5sb2NrXG4gICAgICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5sb2NrID0gJC5wcm94eSh0aGlzLnVubG9jaywgdGhpcyk7XG5cblxuICAgICAgICB0aGlzLl9jcmVhdGVDb21wb25lbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjb21wb25lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtYWluID0gbmV3IE1haW5Db21wb25lbnQoKTtcblxuICAgICAgICB0aGlzLl9yZWdpc3RlcihtYWluKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEltYWdlTG9hZGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IENyb3BwZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRmxpcChtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBSb3RhdGlvbihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBGcmVlRHJhd2luZyhtYWluKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgLSBDb21wb25lbnQgaGFuZGxpbmcgdGhlIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50TWFwW2NvbXBvbmVudC5nZXROYW1lKCldID0gY29tcG9uZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZCBleGVjdXRpb25cbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbnZva2VFeGVjdXRpb246IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiAkLndoZW4odGhpcy5sb2NrLCBjb21tYW5kLmV4ZWN1dGUodGhpcy5fY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucHVzaFVuZG9TdGFjayhjb21tYW5kKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGVDYWxsYmFjaylcbiAgICAgICAgICAgIC5hbHdheXModGhpcy51bmxvY2spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZCB1bmRvXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW52b2tlVW5kbzogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuICQud2hlbih0aGlzLmxvY2ssIGNvbW1hbmQudW5kbyh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoUmVkb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQudW5kb0NhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyh0aGlzLnVubG9jayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUuZmlyZX1cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cyAtIEFyZ3VtZW50cyB0byBmaXJlIGEgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5maXJlLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUub259XG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMgLSBBcmd1bWVudHMgdG8gYXR0YWNoIGV2ZW50c1xuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2NrIHRoaXMgaW52b2tlclxuICAgICAqL1xuICAgIGxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9jayB0aGlzIGludm9rZXJcbiAgICAgKi9cbiAgICB1bmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlRXhlY3V0aW9uKGNvbW1hbmQpXG4gICAgICAgICAgICAuZG9uZSgkLnByb3h5KHRoaXMuY2xlYXJSZWRvU3RhY2ssIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLl91bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBqcURlZmVyO1xuXG4gICAgICAgIGlmIChjb21tYW5kICYmIHRoaXMuX2lzTG9ja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2hVbmRvU3RhY2soY29tbWFuZCwgdHJ1ZSk7XG4gICAgICAgICAgICBjb21tYW5kID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX2ludm9rZVVuZG8oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5fcmVkb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCAmJiB0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoUmVkb1N0YWNrKGNvbW1hbmQsIHRydWUpO1xuICAgICAgICAgICAgY29tbWFuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW1wdHlSZWRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpxRGVmZXIgPSB0aGlzLl9pbnZva2VFeGVjdXRpb24oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1c2ggdW5kbyBzdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NpbGVudF0gLSBGaXJlIGV2ZW50IG9yIG5vdFxuICAgICAqL1xuICAgIHB1c2hVbmRvU3RhY2s6IGZ1bmN0aW9uKGNvbW1hbmQsIGlzU2lsZW50KSB7XG4gICAgICAgIHRoaXMuX3VuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIWlzU2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuUFVTSF9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXNoIHJlZG8gc3RhY2tcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaWxlbnRdIC0gRmlyZSBldmVudCBvciBub3RcbiAgICAgKi9cbiAgICBwdXNoUmVkb1N0YWNrOiBmdW5jdGlvbihjb21tYW5kLCBpc1NpbGVudCkge1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFpc1NpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLlBVU0hfUkVET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVkb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHVuZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5kb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICB0aGlzLl91bmRvU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52b2tlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbiA9IE1hdGgubWluLFxuICAgIG1heCA9IE1hdGgubWF4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBDbGFtcCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pblZhbHVlIC0gTWluaW11bSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhWYWx1ZSAtIE1heGltdW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjbGFtcGVkIHZhbHVlXG4gICAgICovXG4gICAgY2xhbXA6IGZ1bmN0aW9uKHZhbHVlLCBtaW5WYWx1ZSwgbWF4VmFsdWUpIHtcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIGlmIChtaW5WYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICB0ZW1wID0gbWluVmFsdWU7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IG1heFZhbHVlO1xuICAgICAgICAgICAgbWF4VmFsdWUgPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1heChtaW5WYWx1ZSwgbWluKHZhbHVlLCBtYXhWYWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGtleS12YWx1ZSBvYmplY3QgZnJvbSBhcmd1bWVudHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAga2V5TWlycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIG9ialtrZXldID0ga2V5O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbn07XG4iXX0=
