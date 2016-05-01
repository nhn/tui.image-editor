(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":12}],2:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image crop module (start cropping, end cropping)
 */
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
         * Listeners
         * @type {object.<string, function>}
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
        canvas = this.getCanvas();
        canvas.forEachObject(function(obj) { // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
            obj.evented = false;
        });
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
        canvas.deactivateAll();
        canvas.add(this._cropzone);
        canvas.on('mouse:down', this._listeners.mousedown);
        canvas.selection = false;
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
        cropzone.remove();
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.off('mouse:down', this._listeners.mousedown);
        canvas.forEachObject(function(obj) {
            obj.evented = true;
        });
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
         * fabric.Color instance for brush color
         * @type {fabric.Color}
         */
        this.oColor = new fabric.Color('rgba(0, 0, 0, 0.5)');
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
        if (setting.color) {
            this.oColor = new fabric.Color(setting.color);
        }
        brush.width = this.width;
        brush.color = this.oColor.toRgba();
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image loader
 */
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Main component having canvas & image, set css-max-dimension of canvas
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var DEFAULT_CSS_MAX_WIDTH = 1000;
var DEFAULT_CSS_MAX_HEIGHT = 800;

var cssOnly = {
    cssOnly: true
};
var backstoreOnly = {
    backstoreOnly: true
};

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
        this.canvasImage = null;

        /**
         * Max width of canvas elements
         * @type {number}
         */
        this.cssMaxWidth = DEFAULT_CSS_MAX_WIDTH;

        /**
         * Max height of canvas elements
         * @type {number}
         */
        this.cssMaxHeight = DEFAULT_CSS_MAX_HEIGHT;

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
     * @param {?fabric.Image} canvasImage - Fabric image instance
     * @override
     */
    setCanvasImage: function(name, canvasImage) {
        if (canvasImage) {
            tui.util.stamp(canvasImage);
        }
        this.imageName = name;
        this.canvasImage = canvasImage;
    },

    /**
     * Set css max dimension
     * @param {{width: number, height: number}} maxDimension - Max width & Max height
     */
    setCssMaxDimension: function(maxDimension) {
        this.cssMaxWidth = maxDimension.width || this.cssMaxWidth;
        this.cssMaxHeight = maxDimension.height || this.cssMaxHeight;
    },

    /**
     * Set canvas element to fabric.Canvas
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     * @override
     */
    setCanvasElement: function(canvasElement) {
        this.canvas = new fabric.Canvas($(canvasElement)[0], {
            containerClass: 'tui-image-editor-canvas-container'
        });
    },

    /**
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension: function() {
        var canvasImage = this.canvasImage.scale(1);
        var boundingRect = canvasImage.getBoundingRect();
        var width = boundingRect.width;
        var height = boundingRect.height;
        var maxDimension = this._calcMaxDimension(width, height);

        this.setCanvasCssDimension({
            width: '100%',
            height: '100%', // Set height '' for IE9
            'max-width': maxDimension.width + 'px',
            'max-height': maxDimension.height + 'px'
        });
        this.setCanvasBackstoreDimension({
            width: width,
            height: height
        });
        this.canvas.centerObject(canvasImage);
    },

    /**
     * Calculate max dimension of canvas
     * The css-max dimension is dynamically decided with maintaining image ratio
     * The css-max dimension is lower than canvas dimension (attribute of canvas, not css)
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {{width: number, height: number}} - Max width & Max height
     * @private
     */
    _calcMaxDimension: function(width, height) {
        var wScaleFactor = this.cssMaxWidth / width;
        var hScaleFactor = this.cssMaxHeight / height;
        var cssMaxWidth = Math.min(width, this.cssMaxWidth);
        var cssMaxHeight = Math.min(height, this.cssMaxHeight);

        if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
            cssMaxWidth = width * wScaleFactor;
            cssMaxHeight = height * wScaleFactor;
        } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
            cssMaxWidth = width * hScaleFactor;
            cssMaxHeight = height * hScaleFactor;
        }

        return {
            width: Math.floor(cssMaxWidth),
            height: Math.floor(cssMaxHeight)
        };
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
        var canvasImage = this.canvasImage;

        if (!canvasImage) {
            return;
        }

        canvasImage.set(setting).setCoords();
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
        return this.canvasImage;
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Constants
 */
'use strict';

var util = require('./util');

module.exports = {
    /**
     * Component names
     * @type {Object.<string, string>}
     */
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER',
        'FLIP',
        'ROTATION',
        'FREE_DRAWING'
    ),

    /**
     * Command names
     * @type {Object.<string, string>}
     */
    commandNames: util.keyMirror(
        'CLEAR',
        'LOAD_IMAGE',
        'FLIP_IMAGE',
        'ROTATE_IMAGE',
        'ADD_OBJECT',
        'REMOVE_OBJECT'
    ),

    /**
     * Event names
     * @type {Object.<string, string>}
     */
    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_OBJECTS: 'clearObjects',
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

    /**
     * Editor states
     * @type {Object.<string, string>}
     */
    states: util.keyMirror(
        'NORMAL',
        'CROP',
        'FREE_DRAWING'
    )
};

},{"./util":17}],9:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Cropzone extending fabric.Rect
 */
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
     * @param {Object} options Options object
     * @override
     */
    initialize: function(options) {
        options.type = 'cropzone';
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Command factory
 */
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
creators[commandNames.REMOVE_OBJECT] = createRemoveCommand;

/**
 * @param {fabric.Object} object - Fabric object
 * @returns {Command}
 */
function createAddObjectCommand(object) {
    tui.util.stamp(object);

    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
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
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        undo: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();

            if (canvas.contains(object)) {
                canvas.remove(object);
                jqDefer.resolve(object);
            } else {
                jqDefer.reject();
            }

            return jqDefer;
        }
    });
}

/**
 * @param {string} imageName - Image name
 * @param {string|fabric.Image} img - Image(or url)
 * @returns {Command}
 */
function createLoadImageCommand(imageName, img) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
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

            return loader.load(imageName, img);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
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
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        execute: function(compMap) {
            var flipComp = compMap[FLIP];

            this.store = flipComp.getCurrentSetting();

            return flipComp[type]();
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
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
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        execute: function(compMap) {
            var rotationComp = compMap[ROTATION];

            this.store = rotationComp.getCurrentAngle();

            return rotationComp[type](angle);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        undo: function(compMap) {
            var rotationComp = compMap[ROTATION];

            return rotationComp.setAngle(this.store);
        }
    });
}

/**
 * Clear command
 * @returns {Command}
 */
function createClearCommand() {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
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
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        undo: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();

            canvas.add.apply(canvas, this.store);

            return $.Deferred().resolve();
        }
    });
}

/**
 * Remove command
 * @param {fabric.Object} obj - Object to remove
 * @returns {Command}
 */
function createRemoveCommand(obj) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        execute: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();

            if (canvas.contains(obj)) {
                this.store = obj;
                obj.remove();
                jqDefer.resolve();
            } else {
                jqDefer.reject();
            }

            return jqDefer;
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        undo: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();

            if (canvas.contains(this.store)) {
                jqDefer.reject();
            } else {
                canvas.add(this.store);
                jqDefer.resolve();
            }

            return $.Deferred().resolve();
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Error-message factory
 */
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image-editor application class
 */
'use strict';

var Invoker = require('./invoker');
var commandFactory = require('./factory/command');
var consts = require('./consts');

var events = consts.eventNames;
var commands = consts.commandNames;
var compList = consts.componentNames;
var states = consts.states;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
 * @param {object} [option] - Canvas max width & height of css
 *  @param {number} option.cssMaxWidth - Canvas css-max-width
 *  @param {number} option.cssMaxHeight - Canvas css-max-height
 */
var ImageEditor = tui.util.defineClass(/** @lends ImageEditor.prototype */{
    init: function(canvasElement, option) {
        option = option || {};
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

        /**
         * Editor current state
         * @private
         * @type {string}
         */
        this._state = states.NORMAL;

        this._setCanvas(canvasElement, option.cssMaxWidth, option.cssMaxHeight);
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

        /**
         * @api
         * @event ImageEditor#pushUndoStack
         */
        this._invoker.on(PUSH_UNDO_STACK, $.proxy(this.fire, this, PUSH_UNDO_STACK));
        /**
         * @api
         * @event ImageEditor#pushRedoStack
         */
        this._invoker.on(PUSH_REDO_STACK, $.proxy(this.fire, this, PUSH_REDO_STACK));
        /**
         * @api
         * @event ImageEditor#emptyUndoStack
         */
        this._invoker.on(EMPTY_UNDO_STACK, $.proxy(this.fire, this, EMPTY_UNDO_STACK));
        /**
         * @api
         * @event ImageEditor#emptyRedoStack
         */
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

                if (obj.isType('cropzone')) {
                    return;
                }

                if (!tui.util.hasStamp(obj)) {
                    command = commandFactory.create(commands.ADD_OBJECT, obj);
                    this._invoker.pushUndoStack(command);
                }
                /**
                 * @api
                 * @event ImageEditor#addObject
                 * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
                 * @example
                 * imageEditor.on('addObject', function(obj) {
                 *     console.log(obj);
                 * });
                 */
                this.fire(events.ADD_OBJECT, obj);
            }, this),
            'object:removed': $.proxy(function(event) {
                /**
                 * @api
                 * @event ImageEditor#removeObject
                 * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
                 * @example
                 * imageEditor.on('removeObject', function(obj) {
                 *     console.log(obj);
                 * });
                 */
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
            cornerSize: 10
        });
    },

    /**
     * Set canvas element
     * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
     * @param {number} cssMaxWidth - Canvas css max width
     * @param {number} cssMaxHeight - Canvas css max height
     * @private
     */
    _setCanvas: function(canvasElement, cssMaxWidth, cssMaxHeight) {
        var mainComponent;

        mainComponent = this._getMainComponent();
        mainComponent.setCanvasElement(canvasElement);
        mainComponent.setCssMaxDimension({
            width: cssMaxWidth,
            height: cssMaxHeight
        });
        this._canvas = mainComponent.getCanvas();
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
     * Get current state
     * @api
     * @returns {string}
     * @example
     * // Image editor states
     * //
     * //    NORMAL: 'NORMAL'
     * //    CROP: 'CROP'
     * //    FREE_DRAWING: 'FREE_DRAWING'
     * //
     * if (imageEditor.getCurrentState() === 'FREE_DRAWING') {
     *     imageEditor.endFreeDrawing();
     * }
     */
    getCurrentState: function() {
        return this._state;
    },

    /**
     * Clear all objects
     * @api
     * @example
     * imageEditor.clearObjects();
     */
    clearObjects: function() {
        var command = commandFactory.create(commands.CLEAR_OBJECTS);
        var callback = $.proxy(this.fire, this, events.CLEAR_OBJECTS);

        /**
         * @api
         * @event ImageEditor#clearObjects
         */
        command.setExecuteCallback(callback);
        this.execute(command);
    },

    /**
     * End current action & Deactivate
     * @api
     * @example
     * imageEditor.startFreeDrawing();
     * imageEidtor.endAll(); // === imageEidtor.endFreeDrawing();
     *
     * imageEditor.startCropping();
     * imageEditor.endAll(); // === imageEidtor.endCropping();
     */
    endAll: function() {
        this.endFreeDrawing();
        this.endCropping();
        this.deactivateAll();
        this._state = states.NORMAL;
    },

    /**
     * Deactivate all objects
     * @api
     * @example
     * imageEditor.deactivateAll();
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
     * @api
     * @example
     * imageEditor.undo();
     */
    undo: function() {
        this.endAll();
        this._invoker.undo();
    },

    /**
     * Redo
     * @api
     * @example
     * imageEditor.redo();
     */
    redo: function() {
        this.endAll();
        this._invoker.redo();
    },

    /**
     * Load image from file
     * @api
     * @param {File} imgFile - Image file
     * @param {string} [imageName] - imageName
     * @example
     * imageEditor.loadImageFromFile(file);
     */
    loadImageFromFile: function(imgFile, imageName) {
        if (!imgFile) {
            return;
        }

        this.loadImageFromURL(
            URL.createObjectURL(imgFile),
            imageName || imgFile.name
        );
    },

    /**
     * Load image from url
     * @api
     * @param {string} url - File url
     * @param {string} imageName - imageName
     * @example
     * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena')
     */
    loadImageFromURL: function(url, imageName) {
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
                    /**
                     * @api
                     * @event ImageEditor#clearImage
                     */
                    self.fire(events.CLEAR_IMAGE);
                }
            });
        this.execute(command);
    },

    /**
     * Callback after image loading
     * @param {?fabric.Image} oImage - Image instance
     * @private
     */
    _callbackAfterImageLoading: function(oImage) {
        var mainComponent = this._getMainComponent();
        var $canvasElement = $(mainComponent.getCanvasElement());

        /**
         * @api
         * @event ImageEditor#loadImage
         * @param {object} dimension
         *  @param {number} dimension.originalWidth - original image width
         *  @param {number} dimension.originalHeight - original image height
         *  @param {number} dimension.currentWidth - current width (css)
         *  @param {number} dimension.current - current height (css)
         * @example
         * imageEditor.on('loadImage', function(dimension) {
         *     console.log(dimension.originalWidth);
         *     console.log(dimension.originalHeight);
         *     console.log(dimension.currentWidth);
         *     console.log(dimension.currentHeight);
         * });
         */
        this.fire(events.LOAD_IMAGE, {
            originalWidth: oImage.width,
            originalHeight: oImage.height,
            currentWidth: $canvasElement.width(),
            currentHeight: $canvasElement.height()
        });
    },

    /**
     * Start cropping
     * @api
     * @example
     * imageEditor.startCropping();
     */
    startCropping: function() {
        var cropper;

        if (this.getCurrentState() === states.CROP) {
            return;
        }

        this.endAll();
        this._state = states.CROP;
        cropper = this._getComponent(compList.CROPPER);
        cropper.start();
        /**
         * @api
         * @event ImageEditor#startCropping
         */
        this.fire(events.START_CROPPING);
    },

    /**
     * Apply cropping
     * @api
     * @param {boolean} [isApplying] - Whether the cropping is applied or canceled
     * @example
     * imageEditor.startCropping();
     * imageEditor.endCropping(false); // cancel cropping
     *
     * imageEditor.startCropping();
     * imageEditor.endCropping(true); // apply cropping
     */
    endCropping: function(isApplying) {
        var cropper, data;

        if (this.getCurrentState() !== states.CROP) {
            return;
        }

        cropper = this._getComponent(compList.CROPPER);
        this._state = states.NORMAL;
        data = cropper.end(isApplying);
        /**
         * @api
         * @event ImageEditor#endCropping
         */
        this.fire(events.END_CROPPING);
        if (data) {
            this.loadImageFromURL(data.url, data.imageName);
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

        /**
         * @api
         * @event ImageEditor#flipImage
         * @param {object} flipSetting
         *  @param {boolean} flipSetting.flipX - image.flipX
         *  @param {boolean} flipSetting.flipY - image.flipY
         * @param {number} angle - image.angle
         * @example
         * imageEditor.on('flipImage', function(flipSetting, angle) {
         *     console.log('flipX: ', setting.flipX);
         *     console.log('flipY: ', setting.flipY);
         *     console.log('angle: ', angle);
         * });
         */
        command.setExecuteCallback(callback)
            .setUndoCallback(callback);
        this.execute(command);
    },

    /**
     * Flip x
     * @api
     * @example
     * imageEditor.flipX();
     */
    flipX: function() {
        this._flip('flipX');
    },

    /**
     * Flip y
     * @api
     * @example
     * imageEditor.flipY();
     */
    flipY: function() {
        this._flip('flipY');
    },

    /**
     * Reset flip
     * @api
     * @example
     * imageEditor.resetFlip();
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

        /**
         * @api
         * @event ImageEditor#rotateImage
         * @param {number} currentAngle - image.angle
         * @example
         * imageEditor.on('rotateImage', function(angle) {
         *     console.log('angle: ', angle);
         * });
         */
        command.setExecuteCallback(callback)
            .setUndoCallback(callback);
        this.execute(command);
    },

    /**
     * Rotate image
     * @api
     * @param {number} angle - Additional angle to rotate image
     * @example
     * imageEditor.setAngle(10); // angle = 10
     * imageEditor.rotate(10); // angle = 20
     * imageEidtor.setAngle(5); // angle = 5
     * imageEidtor.rotate(-95); // angle = -90
     */
    rotate: function(angle) {
        this._rotate('rotate', angle);
    },

    /**
     * Set angle
     * @api
     * @param {number} angle - Angle of image
     * @example
     * imageEditor.setAngle(10); // angle = 10
     * imageEditor.rotate(10); // angle = 20
     * imageEidtor.setAngle(5); // angle = 5
     * imageEidtor.rotate(50); // angle = 55
     * imageEidtor.setAngle(-40); // angle = -40
     */
    setAngle: function(angle) {
        this._rotate('setAngle', angle);
    },

    /**
     * Start free-drawing mode
     * @param {{width: number, color: string}} [setting] - Brush width & color
     * @api
     * @example
     * imageEditor.startFreeDrawing();
     * imageEditor.endFreeDarwing();
     * imageEidtor.startFreeDrawing({
     *     width: 12,
     *     color: 'rgba(0, 0, 0, 0.5)'
     * });
     */
    startFreeDrawing: function(setting) {
        if (this.getCurrentState() === states.FREE_DRAWING) {
            return;
        }

        this.endAll();
        this._getComponent(compList.FREE_DRAWING).start(setting);
        this._state = states.FREE_DRAWING;

        /**
         * @api
         * @event ImageEditor#startFreeDrawing
         */
        this.fire(events.START_FREE_DRAWING);
    },

    /**
     * Set drawing brush
     * @param {{width: number, color: string}} setting - Brush width & color
     * @api
     * @example
     * imageEditor.startFreeDrawing();
     * imageEditor.setBrush({
     *     width: 12,
     *     color: 'rgba(0, 0, 0, 0.5)'
     * });
     * imageEditor.setBrush({
     *     width: 8,
     *     color: 'FFFFFF'
     * });
     */
    setBrush: function(setting) {
        this._getComponent(compList.FREE_DRAWING).setBrush(setting);
    },

    /**
     * End free-drawing mode
     * @api
     * @example
     * imageEditor.startFreeDrawing();
     * imageEditor.endFreeDrawing();
     */
    endFreeDrawing: function() {
        if (this.getCurrentState() !== states.FREE_DRAWING) {
            return;
        }
        this._getComponent(compList.FREE_DRAWING).end();
        this._state = states.NORMAL;

        /**
         * @api
         * @event ImageEditor#endFreeDrawing
         */
        this.fire(events.END_FREE_DRAWING);
    },

    /**
     * Remove active object
     * @api
     * @example
     * imageEditor.removeActiveObject();
     */
    removeActiveObject: function() {
        var obj = this._canvas.getActiveObject();
        var command = commandFactory.create(commands.REMOVE_OBJECT, obj);

        this.execute(command);
    },

    /**
     * Get data url
     * @api
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI
     * @example
     * imgEl.src = imageEditor.toDataURL();
     */
    toDataURL: function(type) {
        return this._getMainComponent().toDataURL(type);
    },

    /**
     * Get image name
     * @api
     * @returns {string} image name
     * @example
     * console.log(imageEditor.getImageName());
     */
    getImageName: function() {
        return this._getMainComponent().getImageName();
    },

    /**
     * Clear undoStack
     * @api
     * @example
     * imageEditor.clearUndoStack();
     */
    clearUndoStack: function() {
        this._invoker.clearUndoStack();
    },

    /**
     * Clear redoStack
     * @api
     * @example
     * imageEditor.clearRedoStack();
     */
    clearRedoStack: function() {
        this._invoker.clearRedoStack();
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;

},{"./consts":8,"./factory/command":10,"./invoker":16}],13:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Component interface
 */
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Command interface
 */
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
     * @param {Object.<string, Component>} compMap - Components injection
     * @abstract
     */
    execute: function() {
        throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
    },

    /**
     * Undo action
     * @param {Object.<string, Component>} compMap - Components injection
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Invoker - invoke commands
 */
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

        this.lock();

        return $.when(command.execute(this._componentMap))
            .done(function() {
                self.pushUndoStack(command);
            })
            .done(command.executeCallback)
            .always(function() {
                self.unlock();
            });
    },

    /**
     * Invoke command undo
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     * @private
     */
    _invokeUndo: function(command) {
        var self = this;

        this.lock();

        return $.when(command.undo(this._componentMap))
            .done(function() {
                self.pushRedoStack(command);
            })
            .done(command.undoCallback)
            .always(function() {
                self.unlock();
            });
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
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Util
 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvZnJlZURyYXdpbmcuanMiLCJzcmMvanMvY29tcG9uZW50L2ltYWdlTG9hZGVyLmpzIiwic3JjL2pzL2NvbXBvbmVudC9tYWluLmpzIiwic3JjL2pzL2NvbXBvbmVudC9yb3RhdGlvbi5qcyIsInNyYy9qcy9jb25zdHMuanMiLCJzcmMvanMvZXh0ZW5zaW9uL2Nyb3B6b25lLmpzIiwic3JjL2pzL2ZhY3RvcnkvY29tbWFuZC5qcyIsInNyYy9qcy9mYWN0b3J5L2Vycm9yTWVzc2FnZS5qcyIsInNyYy9qcy9pbWFnZUVkaXRvci5qcyIsInNyYy9qcy9pbnRlcmZhY2UvQ29tcG9uZW50LmpzIiwic3JjL2pzL2ludGVyZmFjZS9jb21tYW5kLmpzIiwic3JjL2pzL2ludm9rZXIuanMiLCJzcmMvanMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9XQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5JbWFnZUVkaXRvcicsIHJlcXVpcmUoJy4vc3JjL2pzL2ltYWdlRWRpdG9yJyksIHRydWUpO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UgY3JvcCBtb2R1bGUgKHN0YXJ0IGNyb3BwaW5nLCBlbmQgY3JvcHBpbmcpXG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgQ3JvcHpvbmUgPSByZXF1aXJlKCcuLi9leHRlbnNpb24vY3JvcHpvbmUnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgTU9VU0VfTU9WRV9USFJFU0hPTEQgPSAxMDtcblxudmFyIGFicyA9IE1hdGguYWJzO1xudmFyIGNsYW1wID0gdXRpbC5jbGFtcDtcblxuLyoqXG4gKiBDcm9wcGVyIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzIENyb3BwZXJcbiAqL1xudmFyIENyb3BwZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgQ3JvcHBlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtDcm9wem9uZX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Nyb3B6b25lID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnRYIG9mIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFggPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFkgb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpc3RlbmVyc1xuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZW1vdmU6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZU1vdmUsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2V1cDogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlVXAsIHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuQ1JPUFBFUixcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICh0aGlzLl9jcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikgeyAvLyB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbCNldmVudGVkfVxuICAgICAgICAgICAgb2JqLmV2ZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2Nyb3B6b25lID0gbmV3IENyb3B6b25lKHtcbiAgICAgICAgICAgIGxlZnQ6IC0xMCxcbiAgICAgICAgICAgIHRvcDogLTEwLFxuICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMCwgLy8ge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9rYW5nYXgvZmFicmljLmpzL2lzc3Vlcy8yODYwfVxuICAgICAgICAgICAgY29ybmVyU2l6ZTogMTAsXG4gICAgICAgICAgICBjb3JuZXJDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICBoYXNSb3RhdGluZ1BvaW50OiBmYWxzZSxcbiAgICAgICAgICAgIGhhc0JvcmRlcnM6IGZhbHNlLFxuICAgICAgICAgICAgbG9ja1NjYWxpbmdGbGlwOiB0cnVlLFxuICAgICAgICAgICAgbG9ja1JvdGF0aW9uOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjYW52YXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgICAgICBjYW52YXMuYWRkKHRoaXMuX2Nyb3B6b25lKTtcbiAgICAgICAgY2FudmFzLm9uKCdtb3VzZTpkb3duJywgdGhpcy5fbGlzdGVuZXJzLm1vdXNlZG93bik7XG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnY3Jvc3NoYWlyJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGNyb3BwaW5nXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0FwcGx5aW5nIC0gSXMgYXBwbHlpbmcgb3Igbm90XG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGRhdGE7XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY3JvcHpvbmUucmVtb3ZlKCk7XG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSB0cnVlO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdkZWZhdWx0JztcbiAgICAgICAgY2FudmFzLm9mZignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIG9iai5ldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc0FwcGx5aW5nKSB7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fZ2V0Q3JvcHBlZEltYWdlRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Nyb3B6b25lID0gbnVsbDtcblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZWRvd24gaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZURvd246IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNvb3JkO1xuXG4gICAgICAgIGlmIChmRXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIGNvb3JkID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IGNvb3JkLng7XG4gICAgICAgIHRoaXMuX3N0YXJ0WSA9IGNvb3JkLnk7XG5cbiAgICAgICAgY2FudmFzLm9uKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlbW92ZSBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlTW92ZTogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcbiAgICAgICAgdmFyIHggPSBwb2ludGVyLng7XG4gICAgICAgIHZhciB5ID0gcG9pbnRlci55O1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcblxuICAgICAgICBpZiAoYWJzKHggLSB0aGlzLl9zdGFydFgpICsgYWJzKHkgLSB0aGlzLl9zdGFydFkpID4gTU9VU0VfTU9WRV9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIGNyb3B6b25lLnJlbW92ZSgpO1xuICAgICAgICAgICAgY3JvcHpvbmUuc2V0KHRoaXMuX2NhbGNSZWN0RGltZW5zaW9uRnJvbVBvaW50KHgsIHkpKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZChjcm9wem9uZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlY3QgZGltZW5zaW9uIHNldHRpbmcgZnJvbSBDYW52YXMtTW91c2UtUG9zaXRpb24oeCwgeSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBDYW52YXMtTW91c2UtUG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNSZWN0RGltZW5zaW9uRnJvbVBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgd2lkdGggPSBjYW52YXMuZ2V0V2lkdGgoKTtcbiAgICAgICAgdmFyIGhlaWdodCA9IGNhbnZhcy5nZXRIZWlnaHQoKTtcbiAgICAgICAgdmFyIHN0YXJ0WCA9IHRoaXMuX3N0YXJ0WDtcbiAgICAgICAgdmFyIHN0YXJ0WSA9IHRoaXMuX3N0YXJ0WTtcbiAgICAgICAgdmFyIGxlZnQgPSBjbGFtcCh4LCAwLCBzdGFydFgpO1xuICAgICAgICB2YXIgdG9wID0gY2xhbXAoeSwgMCwgc3RhcnRZKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIHN0YXJ0WCwgd2lkdGgpIC0gbGVmdCwgLy8gKHN0YXJ0WCA8PSB4KG1vdXNlKSA8PSBjYW52YXNXaWR0aCkgLSBsZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCBzdGFydFksIGhlaWdodCkgLSB0b3AgLy8gKHN0YXJ0WSA8PSB5KG1vdXNlKSA8PSBjYW52YXNIZWlnaHQpIC0gdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW91c2V1cCBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLnNldEFjdGl2ZU9iamVjdChjcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vZmYoe1xuICAgICAgICAgICAgJ21vdXNlOm1vdmUnOiBsaXN0ZW5lcnMubW91c2Vtb3ZlLFxuICAgICAgICAgICAgJ21vdXNlOnVwJzogbGlzdGVuZXJzLm1vdXNldXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjcm9wcGVkIGltYWdlIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDcm9wcGVkSW1hZ2VEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBjcm9wSW5mbztcblxuICAgICAgICBpZiAoIWNyb3B6b25lLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjcm9wSW5mbyA9IHtcbiAgICAgICAgICAgIGxlZnQ6IGNyb3B6b25lLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcDogY3JvcHpvbmUuZ2V0VG9wKCksXG4gICAgICAgICAgICB3aWR0aDogY3JvcHpvbmUuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodDogY3JvcHpvbmUuZ2V0SGVpZ2h0KClcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW1hZ2VOYW1lOiB0aGlzLmdldEltYWdlTmFtZSgpLFxuICAgICAgICAgICAgdXJsOiB0aGlzLmdldENhbnZhcygpLnRvRGF0YVVSTChjcm9wSW5mbylcbiAgICAgICAgfTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wcGVyO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UgZmxpcCBtb2R1bGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEZsaXBcbiAqIEBjbGFzcyBGbGlwXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqL1xudmFyIEZsaXAgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRmxpcC5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuRkxJUCxcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGZsaXAgc2V0dGluZ3NcbiAgICAgKiBAcmV0dXJucyB7e2ZsaXBYOiBCb29sZWFuLCBmbGlwWTogQm9vbGVhbn19XG4gICAgICovXG4gICAgZ2V0Q3VycmVudFNldHRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZsaXBYOiBjYW52YXNJbWFnZS5mbGlwWCxcbiAgICAgICAgICAgIGZsaXBZOiBjYW52YXNJbWFnZS5mbGlwWVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZmxpcFgsIGZsaXBZXG4gICAgICogQHBhcmFtIHt7ZmxpcFg6IEJvb2xlYW4sIGZsaXBZOiBCb29sZWFufX0gbmV3U2V0dGluZyAtIEZsaXAgc2V0dGluZ1xuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihuZXdTZXR0aW5nKSB7XG4gICAgICAgIHZhciBzZXR0aW5nID0gdGhpcy5nZXRDdXJyZW50U2V0dGluZygpO1xuICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgdmFyIGlzQ2hhbmdpbmdGbGlwWCA9IChzZXR0aW5nLmZsaXBYICE9PSBuZXdTZXR0aW5nLmZsaXBYKTtcbiAgICAgICAgdmFyIGlzQ2hhbmdpbmdGbGlwWSA9IChzZXR0aW5nLmZsaXBZICE9PSBuZXdTZXR0aW5nLmZsaXBZKTtcblxuICAgICAgICBpZiAoIWlzQ2hhbmdpbmdGbGlwWCAmJiAhaXNDaGFuZ2luZ0ZsaXBZKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChzZXR0aW5nLCBuZXdTZXR0aW5nKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVByb3BlcnRpZXMoc2V0dGluZywgdHJ1ZSk7XG4gICAgICAgIHRoaXMuX2ludmVydEFuZ2xlKGlzQ2hhbmdpbmdGbGlwWCwgaXNDaGFuZ2luZ0ZsaXBZKTtcbiAgICAgICAgdGhpcy5fZmxpcE9iamVjdHMoaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpO1xuXG4gICAgICAgIHJldHVybiBqcURlZmVyLnJlc29sdmUoc2V0dGluZywgdGhpcy5nZXRDYW52YXNJbWFnZSgpLmFuZ2xlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52ZXJ0IGltYWdlIGFuZ2xlIGZvciBmbGlwXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW5naW5nRmxpcFggLSBDaGFuZ2UgZmxpcFhcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbmdpbmdGbGlwWSAtIENoYW5nZSBmbGlwWVxuICAgICAqL1xuICAgIF9pbnZlcnRBbmdsZTogZnVuY3Rpb24oaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuICAgICAgICB2YXIgYW5nbGUgPSBjYW52YXNJbWFnZS5hbmdsZTtcblxuICAgICAgICBpZiAoaXNDaGFuZ2luZ0ZsaXBYKSB7XG4gICAgICAgICAgICBhbmdsZSAqPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDaGFuZ2luZ0ZsaXBZKSB7XG4gICAgICAgICAgICBhbmdsZSAqPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXNJbWFnZS5zZXRBbmdsZShwYXJzZUZsb2F0KGFuZ2xlKSkuc2V0Q29vcmRzKCk7Ly8gcGFyc2VGbG9hdCBmb3IgLTAgdG8gMFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIG9iamVjdHNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbmdpbmdGbGlwWCAtIENoYW5nZSBmbGlwWFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBZIC0gQ2hhbmdlIGZsaXBZXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmxpcE9iamVjdHM6IGZ1bmN0aW9uKGlzQ2hhbmdpbmdGbGlwWCwgaXNDaGFuZ2luZ0ZsaXBZKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFgpIHtcbiAgICAgICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZTogcGFyc2VGbG9hdChvYmouYW5nbGUgKiAtMSksIC8vIHBhcnNlRmxvYXQgZm9yIC0wIHRvIDBcbiAgICAgICAgICAgICAgICAgICAgZmxpcFg6ICFvYmouZmxpcFgsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGNhbnZhcy53aWR0aCAtIG9iai5sZWZ0XG4gICAgICAgICAgICAgICAgfSkuc2V0Q29vcmRzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDaGFuZ2luZ0ZsaXBZKSB7XG4gICAgICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICBvYmouc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGU6IHBhcnNlRmxvYXQob2JqLmFuZ2xlICogLTEpLCAvLyBwYXJzZUZsb2F0IGZvciAtMCB0byAwXG4gICAgICAgICAgICAgICAgICAgIGZsaXBZOiAhb2JqLmZsaXBZLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGNhbnZhcy5oZWlnaHQgLSBvYmoudG9wXG4gICAgICAgICAgICAgICAgfSkuc2V0Q29vcmRzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGZsaXAgc2V0dGluZ3NcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiBmYWxzZSxcbiAgICAgICAgICAgIGZsaXBZOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB4XG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBmbGlwWDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50U2V0dGluZygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnNldCh7XG4gICAgICAgICAgICBmbGlwWDogIWN1cnJlbnQuZmxpcFgsXG4gICAgICAgICAgICBmbGlwWTogY3VycmVudC5mbGlwWVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBmbGlwWTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50U2V0dGluZygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnNldCh7XG4gICAgICAgICAgICBmbGlwWDogY3VycmVudC5mbGlwWCxcbiAgICAgICAgICAgIGZsaXBZOiAhY3VycmVudC5mbGlwWVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbGlwO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgRnJlZSBkcmF3aW5nIG1vZHVsZSwgU2V0IGJydXNoXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBGcmVlRHJhd2luZ1xuICogQGNsYXNzIEZyZWVEcmF3aW5nXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqL1xudmFyIEZyZWVEcmF3aW5nID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEZyZWVEcmF3aW5nLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQnJ1c2ggd2lkdGhcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2lkdGggPSAxMjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogZmFicmljLkNvbG9yIGluc3RhbmNlIGZvciBicnVzaCBjb2xvclxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNvbG9yfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vQ29sb3IgPSBuZXcgZmFicmljLkNvbG9yKCdyZ2JhKDAsIDAsIDAsIDAuNSknKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GUkVFX0RSQVdJTkcsXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBmcmVlIGRyYXdpbmcgbW9kZVxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiA/bnVtYmVyLCBjb2xvcjogP3N0cmluZ319IFtzZXR0aW5nXSAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBjYW52YXMuaXNEcmF3aW5nTW9kZSA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0QnJ1c2goc2V0dGluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBicnVzaFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiA/bnVtYmVyLCBjb2xvcjogP3N0cmluZ319IFtzZXR0aW5nXSAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKi9cbiAgICBzZXRCcnVzaDogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB2YXIgYnJ1c2ggPSB0aGlzLmdldENhbnZhcygpLmZyZWVEcmF3aW5nQnJ1c2g7XG5cbiAgICAgICAgc2V0dGluZyA9IHNldHRpbmcgfHwge307XG4gICAgICAgIHRoaXMud2lkdGggPSBzZXR0aW5nLndpZHRoIHx8IHRoaXMud2lkdGg7XG4gICAgICAgIGlmIChzZXR0aW5nLmNvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLm9Db2xvciA9IG5ldyBmYWJyaWMuQ29sb3Ioc2V0dGluZy5jb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJ1c2gud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBicnVzaC5jb2xvciA9IHRoaXMub0NvbG9yLnRvUmdiYSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgZnJlZSBkcmF3aW5nIG1vZGVcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBjYW52YXMuaXNEcmF3aW5nTW9kZSA9IGZhbHNlO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZyZWVEcmF3aW5nO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UgbG9hZGVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGltYWdlT3B0aW9uID0ge1xuICAgIHBhZGRpbmc6IDAsXG4gICAgY3Jvc3NPcmlnaW46ICdhbm9ueW1vdXMnXG59O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBJbWFnZUxvYWRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSLFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gaW1hZ2VOYW1lIC0gRmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxzdHJpbmcpfSBpbWcgLSBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH0gZGVmZXJyZWRcbiAgICAgKi9cbiAgICBsb2FkOiBmdW5jdGlvbihpbWFnZU5hbWUsIGltZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBqcURlZmVyLCBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgJiYgIWltZykgeyAvLyBCYWNrIHRvIHRoZSBpbml0aWFsIHN0YXRlLCBub3QgZXJyb3IuXG4gICAgICAgICAgICBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICAgICAgY2FudmFzLmJhY2tncm91bmRJbWFnZSA9IG51bGw7XG4gICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLkRlZmVycmVkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FudmFzSW1hZ2UoJycsIG51bGwpO1xuICAgICAgICAgICAgfSkucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX3NldEJhY2tncm91bmRJbWFnZShpbWcpLmRvbmUoZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZShpbWFnZU5hbWUsIG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvSW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpbWFnZU9wdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VMb2FkZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBNYWluIGNvbXBvbmVudCBoYXZpbmcgY2FudmFzICYgaW1hZ2UsIHNldCBjc3MtbWF4LWRpbWVuc2lvbiBvZiBjYW52YXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgREVGQVVMVF9DU1NfTUFYX1dJRFRIID0gMTAwMDtcbnZhciBERUZBVUxUX0NTU19NQVhfSEVJR0hUID0gODAwO1xuXG52YXIgY3NzT25seSA9IHtcbiAgICBjc3NPbmx5OiB0cnVlXG59O1xudmFyIGJhY2tzdG9yZU9ubHkgPSB7XG4gICAgYmFja3N0b3JlT25seTogdHJ1ZVxufTtcblxuLyoqXG4gKiBNYWluIGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzc1xuICovXG52YXIgTWFpbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBNYWluLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBjYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkltYWdlfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW52YXNJbWFnZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1heCB3aWR0aCBvZiBjYW52YXMgZWxlbWVudHNcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3NzTWF4V2lkdGggPSBERUZBVUxUX0NTU19NQVhfV0lEVEg7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1heCBoZWlnaHQgb2YgY2FudmFzIGVsZW1lbnRzXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNzc01heEhlaWdodCA9IERFRkFVTFRfQ1NTX01BWF9IRUlHSFQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltYWdlIG5hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuTUFJTixcblxuICAgIC8qKlxuICAgICAqIFRvIGRhdGEgdXJsIGZyb20gY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzICYmIHRoaXMuY2FudmFzLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IGNhbnZhc0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIGNhbnZhc0ltYWdlKSB7XG4gICAgICAgIGlmIChjYW52YXNJbWFnZSkge1xuICAgICAgICAgICAgdHVpLnV0aWwuc3RhbXAoY2FudmFzSW1hZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jYW52YXNJbWFnZSA9IGNhbnZhc0ltYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY3NzIG1heCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IG1heERpbWVuc2lvbiAtIE1heCB3aWR0aCAmIE1heCBoZWlnaHRcbiAgICAgKi9cbiAgICBzZXRDc3NNYXhEaW1lbnNpb246IGZ1bmN0aW9uKG1heERpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmNzc01heFdpZHRoID0gbWF4RGltZW5zaW9uLndpZHRoIHx8IHRoaXMuY3NzTWF4V2lkdGg7XG4gICAgICAgIHRoaXMuY3NzTWF4SGVpZ2h0ID0gbWF4RGltZW5zaW9uLmhlaWdodCB8fCB0aGlzLmNzc01heEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50IHRvIGZhYnJpYy5DYW52YXNcbiAgICAgKiBAcGFyYW0ge2pRdWVyeXxFbGVtZW50fHN0cmluZ30gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCQoY2FudmFzRWxlbWVudClbMF0sIHtcbiAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAndHVpLWltYWdlLWVkaXRvci1jYW52YXMtY29udGFpbmVyJ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRqdXN0IGNhbnZhcyBkaW1lbnNpb24gd2l0aCBzY2FsaW5nIGltYWdlXG4gICAgICovXG4gICAgYWRqdXN0Q2FudmFzRGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5jYW52YXNJbWFnZS5zY2FsZSgxKTtcbiAgICAgICAgdmFyIGJvdW5kaW5nUmVjdCA9IGNhbnZhc0ltYWdlLmdldEJvdW5kaW5nUmVjdCgpO1xuICAgICAgICB2YXIgd2lkdGggPSBib3VuZGluZ1JlY3Qud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSBib3VuZGluZ1JlY3QuaGVpZ2h0O1xuICAgICAgICB2YXIgbWF4RGltZW5zaW9uID0gdGhpcy5fY2FsY01heERpbWVuc2lvbih3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLnNldENhbnZhc0Nzc0RpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsIC8vIFNldCBoZWlnaHQgJycgZm9yIElFOVxuICAgICAgICAgICAgJ21heC13aWR0aCc6IG1heERpbWVuc2lvbi53aWR0aCArICdweCcsXG4gICAgICAgICAgICAnbWF4LWhlaWdodCc6IG1heERpbWVuc2lvbi5oZWlnaHQgKyAncHgnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYW52YXMuY2VudGVyT2JqZWN0KGNhbnZhc0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIG1heCBkaW1lbnNpb24gb2YgY2FudmFzXG4gICAgICogVGhlIGNzcy1tYXggZGltZW5zaW9uIGlzIGR5bmFtaWNhbGx5IGRlY2lkZWQgd2l0aCBtYWludGFpbmluZyBpbWFnZSByYXRpb1xuICAgICAqIFRoZSBjc3MtbWF4IGRpbWVuc2lvbiBpcyBsb3dlciB0aGFuIGNhbnZhcyBkaW1lbnNpb24gKGF0dHJpYnV0ZSBvZiBjYW52YXMsIG5vdCBjc3MpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gQ2FudmFzIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIENhbnZhcyBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gLSBNYXggd2lkdGggJiBNYXggaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY01heERpbWVuc2lvbjogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICB2YXIgd1NjYWxlRmFjdG9yID0gdGhpcy5jc3NNYXhXaWR0aCAvIHdpZHRoO1xuICAgICAgICB2YXIgaFNjYWxlRmFjdG9yID0gdGhpcy5jc3NNYXhIZWlnaHQgLyBoZWlnaHQ7XG4gICAgICAgIHZhciBjc3NNYXhXaWR0aCA9IE1hdGgubWluKHdpZHRoLCB0aGlzLmNzc01heFdpZHRoKTtcbiAgICAgICAgdmFyIGNzc01heEhlaWdodCA9IE1hdGgubWluKGhlaWdodCwgdGhpcy5jc3NNYXhIZWlnaHQpO1xuXG4gICAgICAgIGlmICh3U2NhbGVGYWN0b3IgPCAxICYmIHdTY2FsZUZhY3RvciA8IGhTY2FsZUZhY3Rvcikge1xuICAgICAgICAgICAgY3NzTWF4V2lkdGggPSB3aWR0aCAqIHdTY2FsZUZhY3RvcjtcbiAgICAgICAgICAgIGNzc01heEhlaWdodCA9IGhlaWdodCAqIHdTY2FsZUZhY3RvcjtcbiAgICAgICAgfSBlbHNlIGlmIChoU2NhbGVGYWN0b3IgPCAxICYmIGhTY2FsZUZhY3RvciA8IHdTY2FsZUZhY3Rvcikge1xuICAgICAgICAgICAgY3NzTWF4V2lkdGggPSB3aWR0aCAqIGhTY2FsZUZhY3RvcjtcbiAgICAgICAgICAgIGNzc01heEhlaWdodCA9IGhlaWdodCAqIGhTY2FsZUZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogTWF0aC5mbG9vcihjc3NNYXhXaWR0aCksXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGguZmxvb3IoY3NzTWF4SGVpZ2h0KVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGNzc09ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGJhY2tzdG9yZSBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGJhY2tzdG9yZU9ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkltYWdlLmh0bWwjc2V0fVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmNhbnZhc0ltYWdlO1xuXG4gICAgICAgIGlmICghY2FudmFzSW1hZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhc0ltYWdlLnNldChzZXR0aW5nKS5zZXRDb29yZHMoKTtcbiAgICAgICAgaWYgKHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnJlbmRlckFsbCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY2FudmFzIGVsZW1lbnQgb2YgZmFicmljLkNhbnZhc1tbbG93ZXItY2FudmFzXV1cbiAgICAgKiBAcmV0dXJucyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgZ2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcy5nZXRFbGVtZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBmYWJyaWMuQ2FudmFzIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5DYW52YXN9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FudmFzSW1hZ2UgKGZhYnJpYy5JbWFnZSBpbnN0YW5jZSlcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkltYWdlfVxuICAgICAqL1xuICAgIGdldENhbnZhc0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzSW1hZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZU5hbWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlIHJvdGF0aW9uIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogSW1hZ2UgUm90YXRpb24gY29tcG9uZW50XG4gKiBAY2xhc3MgUm90YXRpb25cbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICovXG52YXIgUm90YXRpb24gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgUm90YXRpb24ucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5ST1RBVElPTixcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGFuZ2xlXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50QW5nbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYW52YXNJbWFnZSgpLmFuZ2xlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5nbGUgb2YgdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiAgRG8gbm90IGNhbGwgXCJ0aGlzLnNldEltYWdlUHJvcGVydGllc1wiIGZvciBzZXR0aW5nIGFuZ2xlIGRpcmVjdGx5LlxuICAgICAqICBCZWZvcmUgc2V0dGluZyBhbmdsZSwgVGhlIG9yaWdpblgsWSBvZiBpbWFnZSBzaG91bGQgYmUgc2V0IHRvIGNlbnRlci5cbiAgICAgKiAgICAgIFNlZSBcImh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWwjc2V0QW5nbGVcIlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHNldEFuZ2xlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgb2xkQW5nbGUgPSB0aGlzLmdldEN1cnJlbnRBbmdsZSgpICUgMzYwOyAvL1RoZSBhbmdsZSBpcyBsb3dlciB0aGFuIDIqUEkoPT09MzYwIGRlZ3JlZXMpXG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgb2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBjYW52YXNJbWFnZTtcblxuICAgICAgICBhbmdsZSAlPSAzNjA7XG4gICAgICAgIGlmIChhbmdsZSA9PT0gb2xkQW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuXG4gICAgICAgIG9sZEltYWdlQ2VudGVyID0gY2FudmFzSW1hZ2UuZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgY2FudmFzSW1hZ2Uuc2V0QW5nbGUoYW5nbGUpLnNldENvb3JkcygpO1xuICAgICAgICB0aGlzLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuICAgICAgICBuZXdJbWFnZUNlbnRlciA9IGNhbnZhc0ltYWdlLmdldENlbnRlclBvaW50KCk7XG4gICAgICAgIHRoaXMuX3JvdGF0ZUZvckVhY2hPYmplY3Qob2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBhbmdsZSAtIG9sZEFuZ2xlKTtcblxuICAgICAgICByZXR1cm4ganFEZWZlci5yZXNvbHZlKGFuZ2xlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGZvciBlYWNoIG9iamVjdFxuICAgICAqIEBwYXJhbSB7ZmFicmljLlBvaW50fSBvbGRJbWFnZUNlbnRlciAtIEltYWdlIGNlbnRlciBwb2ludCBiZWZvcmUgcm90YXRpb25cbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5Qb2ludH0gbmV3SW1hZ2VDZW50ZXIgLSBJbWFnZSBjZW50ZXIgcG9pbnQgYWZ0ZXIgcm90YXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVEaWZmIC0gSW1hZ2UgYW5nbGUgZGlmZmVyZW5jZSBhZnRlciByb3RhdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JvdGF0ZUZvckVhY2hPYmplY3Q6IGZ1bmN0aW9uKG9sZEltYWdlQ2VudGVyLCBuZXdJbWFnZUNlbnRlciwgYW5nbGVEaWZmKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY2VudGVyRGlmZiA9IHtcbiAgICAgICAgICAgIHg6IG9sZEltYWdlQ2VudGVyLnggLSBuZXdJbWFnZUNlbnRlci54LFxuICAgICAgICAgICAgeTogb2xkSW1hZ2VDZW50ZXIueSAtIG5ld0ltYWdlQ2VudGVyLnlcbiAgICAgICAgfTtcblxuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHZhciBvYmpDZW50ZXIgPSBvYmouZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgICAgIHZhciByYWRpYW4gPSBmYWJyaWMudXRpbC5kZWdyZWVzVG9SYWRpYW5zKGFuZ2xlRGlmZik7XG4gICAgICAgICAgICB2YXIgbmV3T2JqQ2VudGVyID0gZmFicmljLnV0aWwucm90YXRlUG9pbnQob2JqQ2VudGVyLCBvbGRJbWFnZUNlbnRlciwgcmFkaWFuKTtcblxuICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgbGVmdDogbmV3T2JqQ2VudGVyLnggLSBjZW50ZXJEaWZmLngsXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdPYmpDZW50ZXIueSAtIGNlbnRlckRpZmYueSxcbiAgICAgICAgICAgICAgICBhbmdsZTogKG9iai5hbmdsZSArIGFuZ2xlRGlmZikgJSAzNjBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLnNldENvb3JkcygpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFkZGl0aW9uYWxBbmdsZSAtIEFkZGl0aW9uYWwgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24oYWRkaXRpb25hbEFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBbmdsZShjdXJyZW50ICsgYWRkaXRpb25hbEFuZ2xlKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3RhdGlvbjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IENvbnN0YW50c1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lc1xuICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn1cbiAgICAgKi9cbiAgICBjb21wb25lbnROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdNQUlOJyxcbiAgICAgICAgJ0lNQUdFX0xPQURFUicsXG4gICAgICAgICdDUk9QUEVSJyxcbiAgICAgICAgJ0ZMSVAnLFxuICAgICAgICAnUk9UQVRJT04nLFxuICAgICAgICAnRlJFRV9EUkFXSU5HJ1xuICAgICksXG5cbiAgICAvKipcbiAgICAgKiBDb21tYW5kIG5hbWVzXG4gICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGNvbW1hbmROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdDTEVBUicsXG4gICAgICAgICdMT0FEX0lNQUdFJyxcbiAgICAgICAgJ0ZMSVBfSU1BR0UnLFxuICAgICAgICAnUk9UQVRFX0lNQUdFJyxcbiAgICAgICAgJ0FERF9PQkpFQ1QnLFxuICAgICAgICAnUkVNT1ZFX09CSkVDVCdcbiAgICApLFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgbmFtZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgZXZlbnROYW1lczoge1xuICAgICAgICBMT0FEX0lNQUdFOiAnbG9hZEltYWdlJyxcbiAgICAgICAgQ0xFQVJfT0JKRUNUUzogJ2NsZWFyT2JqZWN0cycsXG4gICAgICAgIENMRUFSX0lNQUdFOiAnY2xlYXJJbWFnZScsXG4gICAgICAgIFNUQVJUX0NST1BQSU5HOiAnc3RhcnRDcm9wcGluZycsXG4gICAgICAgIEVORF9DUk9QUElORzogJ2VuZENyb3BwaW5nJyxcbiAgICAgICAgRkxJUF9JTUFHRTogJ2ZsaXBJbWFnZScsXG4gICAgICAgIFJPVEFURV9JTUFHRTogJ3JvdGF0ZUltYWdlJyxcbiAgICAgICAgQUREX09CSkVDVDogJ2FkZE9iamVjdCcsXG4gICAgICAgIFJFTU9WRV9PQkpFQ1Q6ICdyZW1vdmVPYmplY3QnLFxuICAgICAgICBTVEFSVF9GUkVFX0RSQVdJTkc6ICdzdGFydEZyZWVEcmF3aW5nJyxcbiAgICAgICAgRU5EX0ZSRUVfRFJBV0lORzogJ2VuZEZyZWVEcmF3aW5nJyxcbiAgICAgICAgRU1QVFlfUkVET19TVEFDSzogJ2VtcHR5UmVkb1N0YWNrJyxcbiAgICAgICAgRU1QVFlfVU5ET19TVEFDSzogJ2VtcHR5VW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9VTkRPX1NUQUNLOiAncHVzaFVuZG9TdGFjaycsXG4gICAgICAgIFBVU0hfUkVET19TVEFDSzogJ3B1c2hSZWRvU3RhY2snXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVkaXRvciBzdGF0ZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgc3RhdGVzOiB1dGlsLmtleU1pcnJvcihcbiAgICAgICAgJ05PUk1BTCcsXG4gICAgICAgICdDUk9QJyxcbiAgICAgICAgJ0ZSRUVfRFJBV0lORydcbiAgICApXG59O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ3JvcHpvbmUgZXh0ZW5kaW5nIGZhYnJpYy5SZWN0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGNsYW1wID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNsYW1wO1xuXG52YXIgQ09STkVSX1RZUEVfVE9QX0xFRlQgPSAndGwnO1xudmFyIENPUk5FUl9UWVBFX1RPUF9SSUdIVCA9ICd0cic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1RPUCA9ICdtdCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0xFRlQgPSAnbWwnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVCA9ICdtcic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTSA9ICdtYic7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQgPSAnYmwnO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVCA9ICdicic7XG5cbi8qKlxuICogQ3JvcHpvbmUgb2JqZWN0XG4gKiBJc3N1ZTogSUU3LCA4KHdpdGggZXhjYW52YXMpXG4gKiAgLSBDcm9wem9uZSBpcyBhIGJsYWNrIHpvbmUgd2l0aG91dCB0cmFuc3BhcmVuY3kuXG4gKiBAY2xhc3MgQ3JvcHpvbmVcbiAqIEBleHRlbmRzIHtmYWJyaWMuUmVjdH1cbiAqL1xudmFyIENyb3B6b25lID0gZmFicmljLnV0aWwuY3JlYXRlQ2xhc3MoZmFicmljLlJlY3QsIC8qKiBAbGVuZHMgQ3JvcHpvbmUucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBvYmplY3RcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMudHlwZSA9ICdjcm9wem9uZSc7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdpbml0aWFsaXplJywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub24oe1xuICAgICAgICAgICAgJ21vdmluZyc6IHRoaXMuX29uTW92aW5nLFxuICAgICAgICAgICAgJ3NjYWxpbmcnOiB0aGlzLl9vblNjYWxpbmdcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBDcm9wLXpvbmVcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgX3JlbmRlcjogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBvcmlnaW5hbEZsaXBYLCBvcmlnaW5hbEZsaXBZLFxuICAgICAgICAgICAgb3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZLFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZVdpZHRoID0gNyxcbiAgICAgICAgICAgIGNyb3B6b25lRGFzaExpbmVPZmZzZXQgPSA3O1xuICAgICAgICB0aGlzLmNhbGxTdXBlcignX3JlbmRlcicsIGN0eCk7XG5cbiAgICAgICAgLy8gQ2FsYyBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBvcmlnaW5hbEZsaXBYID0gdGhpcy5mbGlwWCA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxGbGlwWSA9IHRoaXMuZmxpcFkgPyAtMSA6IDE7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVYID0gb3JpZ2luYWxGbGlwWCAvIHRoaXMuc2NhbGVYO1xuICAgICAgICBvcmlnaW5hbFNjYWxlWSA9IG9yaWdpbmFsRmxpcFkgLyB0aGlzLnNjYWxlWTtcblxuICAgICAgICAvLyBTZXQgb3JpZ2luYWwgc2NhbGVcbiAgICAgICAgY3R4LnNjYWxlKG9yaWdpbmFsU2NhbGVYLCBvcmlnaW5hbFNjYWxlWSk7XG5cbiAgICAgICAgLy8gUmVuZGVyIG91dGVyIHJlY3RcbiAgICAgICAgdGhpcy5fZmlsbE91dGVyUmVjdChjdHgsICdyZ2JhKDAsIDAsIDAsIDAuNTUpJyk7XG5cbiAgICAgICAgLy8gQmxhY2sgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMCwgMCwgMCknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgpO1xuXG4gICAgICAgIC8vIFdoaXRlIGRhc2ggbGluZVxuICAgICAgICB0aGlzLl9zdHJva2VCb3JkZXIoY3R4LCAncmdiKDI1NSwgMjU1LCAyNTUpJywgY3JvcHpvbmVEYXNoTGluZVdpZHRoLCBjcm9wem9uZURhc2hMaW5lT2Zmc2V0KTtcblxuICAgICAgICAvLyBSZXNldCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUoMSAvIG9yaWdpbmFsU2NhbGVYLCAxIC8gb3JpZ2luYWxTY2FsZVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcm9wem9uZS1jb29yZGluYXRlcyB3aXRoIG91dGVyIHJlY3RhbmdsZVxuICAgICAqXG4gICAgICogICAgIHgwICAgICB4MSAgICAgICAgIHgyICAgICAgeDNcbiAgICAgKiAgeTAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98ICAgIC8vIDwtLS0gXCJPdXRlci1yZWN0YW5nbGVcIlxuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogIHkxICstLS0tLS0tKy0tLS0tLS0tLS0rLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98IENyb3B6b25lIHwvLy8vLy8vfCAgICBDcm9wem9uZSBpcyB0aGUgXCJJbm5lci1yZWN0YW5nbGVcIlxuICAgICAqICAgICB8Ly8vLy8vL3wgICgwLCAwKSAgfC8vLy8vLy98ICAgIENlbnRlciBwb2ludCAoMCwgMClcbiAgICAgKiAgeTIgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgICAqXG4gICAgICogQHR5cGVkZWYge3t4OiBBcnJheTxudW1iZXI+LCB5OiBBcnJheTxudW1iZXI+fX0gY3JvcHpvbmVDb29yZGluYXRlc1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRmlsbCBvdXRlciByZWN0YW5nbGVcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59IGZpbGxTdHlsZSAtIEZpbGwtc3R5bGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maWxsT3V0ZXJSZWN0OiBmdW5jdGlvbihjdHgsIGZpbGxTdHlsZSkge1xuICAgICAgICB2YXIgY29vcmRpbmF0ZXMgPSB0aGlzLl9nZXRDb29yZGluYXRlcyhjdHgpLFxuICAgICAgICAgICAgeCA9IGNvb3JkaW5hdGVzLngsXG4gICAgICAgICAgICB5ID0gY29vcmRpbmF0ZXMueTtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbFN0eWxlO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgLy8gT3V0ZXIgcmVjdGFuZ2xlXG4gICAgICAgIC8vIE51bWJlcnMgYXJlICsvLTEgc28gdGhhdCBvdmVybGF5IGVkZ2VzIGRvbid0IGdldCBibHVycnkuXG4gICAgICAgIGN0eC5tb3ZlVG8oeFswXSAtIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzNdICsgMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzNdICsgMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFswXSAtIDEsIHlbM10gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgLy8gSW5uZXIgcmVjdGFuZ2xlXG4gICAgICAgIGN0eC5tb3ZlVG8oeFsxXSwgeVsxXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsxXSwgeVsyXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsyXSwgeVsyXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsyXSwgeVsxXSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFsxXSwgeVsxXSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29vcmRpbmF0ZXNcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEByZXR1cm5zIHtjcm9wem9uZUNvb3JkaW5hdGVzfSAtIHtAbGluayBjcm9wem9uZUNvb3JkaW5hdGVzfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvb3JkaW5hdGVzOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIGNlaWwgPSBNYXRoLmNlaWwsXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCksXG4gICAgICAgICAgICBoYWxmV2lkdGggPSB3aWR0aCAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gaGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMuZ2V0VG9wKCksXG4gICAgICAgICAgICBjYW52YXNFbCA9IGN0eC5jYW52YXM7IC8vIGNhbnZhcyBlbGVtZW50LCBub3QgZmFicmljIG9iamVjdFxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoICsgbGVmdCksICAgICAgICAgICAgICAgICAgICAgICAgLy8geDBcbiAgICAgICAgICAgICAgICAtKGhhbGZXaWR0aCksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgxXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MlxuICAgICAgICAgICAgICAgIGhhbGZXaWR0aCArIChjYW52YXNFbC53aWR0aCAtIGxlZnQgLSB3aWR0aCkgLy8geDNcbiAgICAgICAgICAgIF0sIGNlaWwpLFxuICAgICAgICAgICAgeTogdHVpLnV0aWwubWFwKFtcbiAgICAgICAgICAgICAgICAtKGhhbGZIZWlnaHQgKyB0b3ApLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MFxuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkxXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTJcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0ICsgKGNhbnZhc0VsLmhlaWdodCAtIHRvcCAtIGhlaWdodCkgICAvLyB5M1xuICAgICAgICAgICAgXSwgY2VpbClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3Ryb2tlIGJvcmRlclxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gc3Ryb2tlU3R5bGUgLSBTdHJva2Utc3R5bGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZURhc2hXaWR0aCAtIERhc2ggd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2xpbmVEYXNoT2Zmc2V0XSAtIERhc2ggb2Zmc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc3Ryb2tlQm9yZGVyOiBmdW5jdGlvbihjdHgsIHN0cm9rZVN0eWxlLCBsaW5lRGFzaFdpZHRoLCBsaW5lRGFzaE9mZnNldCkge1xuICAgICAgICB2YXIgaGFsZldpZHRoID0gdGhpcy5nZXRXaWR0aCgpIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpIC8gMjtcblxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VTdHlsZTtcbiAgICAgICAgaWYgKGN0eC5zZXRMaW5lRGFzaCkge1xuICAgICAgICAgICAgY3R4LnNldExpbmVEYXNoKFtsaW5lRGFzaFdpZHRoLCBsaW5lRGFzaFdpZHRoXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgICAgICBjdHgubGluZURhc2hPZmZzZXQgPSBsaW5lRGFzaE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygtaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbygtaGFsZldpZHRoLCBoYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbygtaGFsZldpZHRoLCAtaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdmluZyBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW92aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIG1heExlZnQgPSBjYW52YXMuZ2V0V2lkdGgoKSAtIHdpZHRoLFxuICAgICAgICAgICAgbWF4VG9wID0gY2FudmFzLmdldEhlaWdodCgpIC0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuc2V0TGVmdChjbGFtcChsZWZ0LCAwLCBtYXhMZWZ0KSk7XG4gICAgICAgIHRoaXMuc2V0VG9wKGNsYW1wKHRvcCwgMCwgbWF4VG9wKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uU2NhbGluZyBldmVudCBsaXN0ZW5lclxuICAgICAqIEBwYXJhbSB7e2U6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblNjYWxpbmc6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgcG9pbnRlciA9IHRoaXMuY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpLFxuICAgICAgICAgICAgc2V0dGluZ3MgPSB0aGlzLl9jYWxjU2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyKTtcblxuICAgICAgICAvLyBPbiBzY2FsaW5nIGNyb3B6b25lLFxuICAgICAgICAvLyBjaGFuZ2UgcmVhbCB3aWR0aCBhbmQgaGVpZ2h0IGFuZCBmaXggc2NhbGVGYWN0b3IgdG8gMVxuICAgICAgICB0aGlzLnNjYWxlKDEpLnNldChzZXR0aW5ncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGVkIHNpemUgZnJvbSBtb3VzZSBwb2ludGVyIHdpdGggc2VsZWN0ZWQgY29ybmVyXG4gICAgICogQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBwb2ludGVyIC0gTW91c2UgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBIYXZpbmcgbGVmdCBvcihhbmQpIHRvcCBvcihhbmQpIHdpZHRoIG9yKGFuZCkgaGVpZ2h0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbihwb2ludGVyKSB7XG4gICAgICAgIHZhciBwb2ludGVyWCA9IHBvaW50ZXIueCxcbiAgICAgICAgICAgIHBvaW50ZXJZID0gcG9pbnRlci55LFxuICAgICAgICAgICAgdGxTY2FsaW5nU2l6ZSA9IHRoaXMuX2NhbGNUb3BMZWZ0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpLFxuICAgICAgICAgICAgYnJTY2FsaW5nU2l6ZSA9IHRoaXMuX2NhbGNCb3R0b21SaWdodFNjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlclgsIHBvaW50ZXJZKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBAdG9kbzog7J2867CYIOqwneyytOyXkOyEnCBzaGlmdCDsobDtlantgqTrpbwg64iE66W066m0IGZyZWUgc2l6ZSBzY2FsaW5n7J20IOuQqCAtLT4g7ZmV7J247ZW067O86rKDXG4gICAgICAgICAqICAgICAgY2FudmFzLmNsYXNzLmpzIC8vIF9zY2FsZU9iamVjdDogZnVuY3Rpb24oLi4uKXsuLi59XG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZVNjYWxpbmdTZXR0aW5ncyh0bFNjYWxpbmdTaXplLCBiclNjYWxpbmdTaXplKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsaW5nIHNpemUocG9zaXRpb24gKyBkaW1lbnNpb24pIGZyb20gbGVmdC10b3AgY29ybmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBNb3VzZSBwb3NpdGlvbiBYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBNb3VzZSBwb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3t0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBib3R0b20gPSB0aGlzLmdldEhlaWdodCgpICsgdGhpcy50b3AsXG4gICAgICAgICAgICByaWdodCA9IHRoaXMuZ2V0V2lkdGgoKSArIHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IGNsYW1wKHksIDAsIGJvdHRvbSAtIDEpLCAgLy8gMCA8PSB0b3AgPD0gKGJvdHRvbSAtIDEpXG4gICAgICAgICAgICBsZWZ0ID0gY2xhbXAoeCwgMCwgcmlnaHQgLSAxKTsgIC8vIDAgPD0gbGVmdCA8PSAocmlnaHQgLSAxKVxuXG4gICAgICAgIC8vIFdoZW4gc2NhbGluZyBcIlRvcC1MZWZ0IGNvcm5lclwiOiBJdCBmaXhlcyByaWdodCBhbmQgYm90dG9tIGNvb3JkaW5hdGVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB3aWR0aDogcmlnaHQgLSBsZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0OiBib3R0b20gLSB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsaW5nIHNpemUgZnJvbSByaWdodC1ib3R0b20gY29ybmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBNb3VzZSBwb3NpdGlvbiBYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBNb3VzZSBwb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBtYXhYID0gY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgbWF4WSA9IGNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gdGhpcy50b3A7XG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiQm90dG9tLVJpZ2h0IGNvcm5lclwiOiBJdCBmaXhlcyBsZWZ0IGFuZCB0b3AgY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCAobGVmdCArIDEpLCBtYXhYKSAtIGxlZnQsICAgIC8vICh3aWR0aCA9IHggLSBsZWZ0KSwgKGxlZnQgKyAxIDw9IHggPD0gbWF4WClcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgKHRvcCArIDEpLCBtYXhZKSAtIHRvcCAgICAgIC8vIChoZWlnaHQgPSB5IC0gdG9wKSwgKHRvcCArIDEgPD0geSA8PSBtYXhZKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKmVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkqL1xuICAgIC8qKlxuICAgICAqIE1ha2Ugc2NhbGluZyBzZXR0aW5nc1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfX0gdGwgLSBUb3AtTGVmdCBzZXR0aW5nXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBiciAtIEJvdHRvbS1SaWdodCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge3t3aWR0aDogP251bWJlciwgaGVpZ2h0OiA/bnVtYmVyLCBsZWZ0OiA/bnVtYmVyLCB0b3A6ID9udW1iZXJ9fSBQb3NpdGlvbiBzZXR0aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNjYWxpbmdTZXR0aW5nczogZnVuY3Rpb24odGwsIGJyKSB7XG4gICAgICAgIHZhciB0bFdpZHRoID0gdGwud2lkdGgsXG4gICAgICAgICAgICB0bEhlaWdodCA9IHRsLmhlaWdodCxcbiAgICAgICAgICAgIGJySGVpZ2h0ID0gYnIuaGVpZ2h0LFxuICAgICAgICAgICAgYnJXaWR0aCA9IGJyLndpZHRoLFxuICAgICAgICAgICAgdGxMZWZ0ID0gdGwubGVmdCxcbiAgICAgICAgICAgIHRsVG9wID0gdGwudG9wLFxuICAgICAgICAgICAgc2V0dGluZ3M7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLl9fY29ybmVyKSB7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX1RPUF9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gdGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX1RPUF9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGxUb3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9CT1RUT01fTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYnJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRsTGVmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IGJyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRsV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRsTGVmdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9UT1A6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGxIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGxUb3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBicldpZHRoXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTTpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xuICAgIH0sIC8qZXNsaW50LWVuYWJsZSBjb21wbGV4aXR5Ki9cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgd2hldGhlciB0aGlzIGNyb3B6b25lIGlzIHZhbGlkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNWYWxpZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLmxlZnQgPj0gMCAmJlxuICAgICAgICAgICAgdGhpcy50b3AgPj0gMCAmJlxuICAgICAgICAgICAgdGhpcy53aWR0aCA+IDAgJiZcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID4gMFxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3B6b25lO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ29tbWFuZCBmYWN0b3J5XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbW1hbmQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgY29tcG9uZW50TmFtZXMgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG52YXIgY29tbWFuZE5hbWVzID0gY29uc3RzLmNvbW1hbmROYW1lcztcbnZhciBjcmVhdG9ycyA9IHt9O1xuXG52YXIgTUFJTiA9IGNvbXBvbmVudE5hbWVzLk1BSU47XG52YXIgSU1BR0VfTE9BREVSID0gY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSO1xudmFyIEZMSVAgPSBjb21wb25lbnROYW1lcy5GTElQO1xudmFyIFJPVEFUSU9OID0gY29tcG9uZW50TmFtZXMuUk9UQVRJT047XG5cbi8qKlxuICogU2V0IG1hcHBpbmcgY3JlYXRvcnNcbiAqL1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkxPQURfSU1BR0VdID0gY3JlYXRlTG9hZEltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5GTElQX0lNQUdFXSA9IGNyZWF0ZUZsaXBJbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuUk9UQVRFX0lNQUdFXSA9IGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkNMRUFSX09CSkVDVFNdID0gY3JlYXRlQ2xlYXJDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkFERF9PQkpFQ1RdID0gY3JlYXRlQWRkT2JqZWN0Q29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5SRU1PVkVfT0JKRUNUXSA9IGNyZWF0ZVJlbW92ZUNvbW1hbmQ7XG5cbi8qKlxuICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fSBvYmplY3QgLSBGYWJyaWMgb2JqZWN0XG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQWRkT2JqZWN0Q29tbWFuZChvYmplY3QpIHtcbiAgICB0dWkudXRpbC5zdGFtcChvYmplY3QpO1xuXG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKCFjYW52YXMuY29udGFpbnMob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQob2JqZWN0KTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmIChjYW52YXMuY29udGFpbnMob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5yZW1vdmUob2JqZWN0KTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gSW1hZ2UgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd8ZmFicmljLkltYWdlfSBpbWcgLSBJbWFnZShvciB1cmwpXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9hZEltYWdlQ29tbWFuZChpbWFnZU5hbWUsIGltZykge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gbG9hZGVyLmdldENhbnZhcygpO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgICAgIHByZXZOYW1lOiBsb2FkZXIuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICAgICAgcHJldkltYWdlOiBsb2FkZXIuZ2V0Q2FudmFzSW1hZ2UoKSxcbiAgICAgICAgICAgICAgICAvLyBTbGljZTogXCJjYW52YXMuY2xlYXIoKVwiIGNsZWFycyB0aGUgb2JqZWN0cyBhcnJheSwgU28gc2hhbGxvdyBjb3B5IHRoZSBhcnJheVxuICAgICAgICAgICAgICAgIG9iamVjdHM6IGNhbnZhcy5nZXRPYmplY3RzKCkuc2xpY2UoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoaW1hZ2VOYW1lLCBpbWcpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGxvYWRlci5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuICAgICAgICAgICAgY2FudmFzLmFkZC5hcHBseShjYW52YXMsIHN0b3JlLm9iamVjdHMpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoc3RvcmUucHJldk5hbWUsIHN0b3JlLnByZXZJbWFnZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdmbGlwWCcgb3IgJ2ZsaXBZJyBvciAncmVzZXQnXG4gKiBAcmV0dXJucyB7JC5EZWZlcnJlZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmxpcEltYWdlQ29tbWFuZCh0eXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGZsaXBDb21wID0gY29tcE1hcFtGTElQXTtcblxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IGZsaXBDb21wLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcFt0eXBlXSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICByZXR1cm4gZmxpcENvbXAuc2V0KHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAncm90YXRlJyBvciAnc2V0QW5nbGUnXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBhbmdsZSB2YWx1ZSAoZGVncmVlKVxuICogQHJldHVybnMgeyQuRGVmZXJyZWR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kKHR5cGUsIGFuZ2xlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gcm90YXRpb25Db21wLmdldEN1cnJlbnRBbmdsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wW3R5cGVdKGFuZ2xlKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wLnNldEFuZ2xlKHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2xlYXIgY29tbWFuZFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsZWFyQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICAvLyBTbGljZTogXCJjYW52YXMuY2xlYXIoKVwiIGNsZWFycyB0aGUgb2JqZWN0cyBhcnJheSwgU28gc2hhbGxvdyBjb3B5IHRoZSBhcnJheVxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IGNhbnZhcy5nZXRPYmplY3RzKCkuc2xpY2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3JlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQuYXBwbHkoY2FudmFzLCB0aGlzLnN0b3JlKTtcblxuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgY29tbWFuZFxuICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fSBvYmogLSBPYmplY3QgdG8gcmVtb3ZlXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmVtb3ZlQ29tbWFuZChvYmopIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAoY2FudmFzLmNvbnRhaW5zKG9iaikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JlID0gb2JqO1xuICAgICAgICAgICAgICAgIG9iai5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmIChjYW52YXMuY29udGFpbnModGhpcy5zdG9yZSkpIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYW52YXMuYWRkKHRoaXMuc3RvcmUpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBjb21tYW5kXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbW1hbmQgbmFtZVxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gQXJndW1lbnRzIGZvciBjcmVhdGluZyBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIGFyZ3MpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHJldHVybiBjcmVhdG9yc1tuYW1lXS5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEVycm9yLW1lc3NhZ2UgZmFjdG9yeVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBrZXlNaXJyb3IgPSByZXF1aXJlKCcuLi91dGlsJykua2V5TWlycm9yO1xuXG52YXIgdHlwZXMgPSBrZXlNaXJyb3IoXG4gICAgJ1VOX0lNUExFTUVOVEFUSU9OJyxcbiAgICAnTk9fQ09NUE9ORU5UX05BTUUnXG4pO1xuXG52YXIgbWVzc2FnZXMgPSB7XG4gICAgVU5fSU1QTEVNRU5UQVRJT046ICdTaG91bGQgaW1wbGVtZW50IGEgbWV0aG9kOiAnLFxuICAgIE5PX0NPTVBPTkVOVF9OQU1FOiAnU2hvdWxkIHNldCBhIGNvbXBvbmVudCBuYW1lJ1xufTtcblxudmFyIG1hcCA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuVU5fSU1QTEVNRU5UQVRJT04gKyBtZXRob2ROYW1lO1xuICAgIH0sXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuTk9fQ09NUE9ORU5UX05BTUU7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHlwZXM6IHR1aS51dGlsLmV4dGVuZCh7fSwgdHlwZXMpLFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBmdW5jO1xuXG4gICAgICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGZ1bmMgPSBtYXBbdHlwZV07XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuXG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlLWVkaXRvciBhcHBsaWNhdGlvbiBjbGFzc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbnZva2VyID0gcmVxdWlyZSgnLi9pbnZva2VyJyk7XG52YXIgY29tbWFuZEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnkvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciBldmVudHMgPSBjb25zdHMuZXZlbnROYW1lcztcbnZhciBjb21tYW5kcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY29tcExpc3QgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG52YXIgc3RhdGVzID0gY29uc3RzLnN0YXRlcztcblxuLyoqXG4gKiBJbWFnZSBlZGl0b3JcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uXSAtIENhbnZhcyBtYXggd2lkdGggJiBoZWlnaHQgb2YgY3NzXG4gKiAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbi5jc3NNYXhXaWR0aCAtIENhbnZhcyBjc3MtbWF4LXdpZHRoXG4gKiAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbi5jc3NNYXhIZWlnaHQgLSBDYW52YXMgY3NzLW1heC1oZWlnaHRcbiAqL1xudmFyIEltYWdlRWRpdG9yID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbWFnZUVkaXRvci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCwgb3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9rZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0ludm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyID0gbmV3IEludm9rZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljLUNhbnZhcyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNhbnZhc31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVkaXRvciBjdXJyZW50IHN0YXRlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5OT1JNQUw7XG5cbiAgICAgICAgdGhpcy5fc2V0Q2FudmFzKGNhbnZhc0VsZW1lbnQsIG9wdGlvbi5jc3NNYXhXaWR0aCwgb3B0aW9uLmNzc01heEhlaWdodCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaEludm9rZXJFdmVudHMoKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoQ2FudmFzRXZlbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBpbnZva2VyIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEludm9rZXJFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgUFVTSF9VTkRPX1NUQUNLID0gZXZlbnRzLlBVU0hfVU5ET19TVEFDSztcbiAgICAgICAgdmFyIFBVU0hfUkVET19TVEFDSyA9IGV2ZW50cy5QVVNIX1JFRE9fU1RBQ0s7XG4gICAgICAgIHZhciBFTVBUWV9VTkRPX1NUQUNLID0gZXZlbnRzLkVNUFRZX1VORE9fU1RBQ0s7XG4gICAgICAgIHZhciBFTVBUWV9SRURPX1NUQUNLID0gZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0s7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3B1c2hVbmRvU3RhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oUFVTSF9VTkRPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgUFVTSF9VTkRPX1NUQUNLKSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNwdXNoUmVkb1N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKFBVU0hfUkVET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIFBVU0hfUkVET19TVEFDSykpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjZW1wdHlVbmRvU3RhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oRU1QVFlfVU5ET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIEVNUFRZX1VORE9fU1RBQ0spKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VtcHR5UmVkb1N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKEVNUFRZX1JFRE9fU1RBQ0ssICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBFTVBUWV9SRURPX1NUQUNLKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBjYW52YXMgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ2FudmFzRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLm9uKHtcbiAgICAgICAgICAgICdwYXRoOmNyZWF0ZWQnOiAkLnByb3h5KHRoaXMuX29uUGF0aENyZWF0ZWQsIHRoaXMpLFxuICAgICAgICAgICAgJ29iamVjdDphZGRlZCc6ICQucHJveHkoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIHZhciBjb21tYW5kO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9iai5pc1R5cGUoJ2Nyb3B6b25lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghdHVpLnV0aWwuaGFzU3RhbXAob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkFERF9PQkpFQ1QsIG9iaik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludm9rZXIucHVzaFVuZG9TdGFjayhjb21tYW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhZGRPYmplY3RcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iaiAtIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdhZGRPYmplY3QnLCBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2cob2JqKTtcbiAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkFERF9PQkpFQ1QsIG9iaik7XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgICdvYmplY3Q6cmVtb3ZlZCc6ICQucHJveHkoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3JlbW92ZU9iamVjdFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZmFicmljLk9iamVjdH0gb2JqIC0gaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbFxuICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ3JlbW92ZU9iamVjdCcsIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhvYmopO1xuICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShldmVudHMuUkVNT1ZFX09CSkVDVCwgZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudExpc3RlbmVyIC0gXCJwYXRoOmNyZWF0ZWRcIlxuICAgICAqICAtIEV2ZW50czo6IFwib2JqZWN0OmFkZGVkXCIgLT4gXCJwYXRoOmNyZWF0ZWRcIlxuICAgICAqIEBwYXJhbSB7e3BhdGg6IGZhYnJpYy5QYXRofX0gb2JqIC0gUGF0aCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblBhdGhDcmVhdGVkOiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIHBhdGggPSBvYmoucGF0aDtcblxuICAgICAgICBwYXRoLnNldCh7XG4gICAgICAgICAgICByb3RhdGluZ1BvaW50T2Zmc2V0OiAzMCxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmVkJyxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50Q29ybmVyczogZmFsc2UsXG4gICAgICAgICAgICBjb3JuZXJDb2xvcjogJ2dyZWVuJyxcbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xqUXVlcnl8SFRNTEVsZW1lbnR9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjc3NNYXhXaWR0aCAtIENhbnZhcyBjc3MgbWF4IHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNzc01heEhlaWdodCAtIENhbnZhcyBjc3MgbWF4IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldENhbnZhczogZnVuY3Rpb24oY2FudmFzRWxlbWVudCwgY3NzTWF4V2lkdGgsIGNzc01heEhlaWdodCkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudDtcblxuICAgICAgICBtYWluQ29tcG9uZW50ID0gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpO1xuICAgICAgICBtYWluQ29tcG9uZW50LnNldENhbnZhc0VsZW1lbnQoY2FudmFzRWxlbWVudCk7XG4gICAgICAgIG1haW5Db21wb25lbnQuc2V0Q3NzTWF4RGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiBjc3NNYXhXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogY3NzTWF4SGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBtYWluQ29tcG9uZW50LmdldENhbnZhcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIG1haW4gY29tcG9uZW50XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH0gTWFpbiBjb21wb25lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRNYWluQ29tcG9uZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5NQUlOKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlci5nZXRDb21wb25lbnQobmFtZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHN0YXRlXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyBJbWFnZSBlZGl0b3Igc3RhdGVzXG4gICAgICogLy9cbiAgICAgKiAvLyAgICBOT1JNQUw6ICdOT1JNQUwnXG4gICAgICogLy8gICAgQ1JPUDogJ0NST1AnXG4gICAgICogLy8gICAgRlJFRV9EUkFXSU5HOiAnRlJFRV9EUkFXSU5HJ1xuICAgICAqIC8vXG4gICAgICogaWYgKGltYWdlRWRpdG9yLmdldEN1cnJlbnRTdGF0ZSgpID09PSAnRlJFRV9EUkFXSU5HJykge1xuICAgICAqICAgICBpbWFnZUVkaXRvci5lbmRGcmVlRHJhd2luZygpO1xuICAgICAqIH1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50U3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBvYmplY3RzXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJPYmplY3RzKCk7XG4gICAgICovXG4gICAgY2xlYXJPYmplY3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuQ0xFQVJfT0JKRUNUUyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBldmVudHMuQ0xFQVJfT0JKRUNUUyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2NsZWFyT2JqZWN0c1xuICAgICAgICAgKi9cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBjdXJyZW50IGFjdGlvbiAmIERlYWN0aXZhdGVcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydEZyZWVEcmF3aW5nKCk7XG4gICAgICogaW1hZ2VFaWR0b3IuZW5kQWxsKCk7IC8vID09PSBpbWFnZUVpZHRvci5lbmRGcmVlRHJhd2luZygpO1xuICAgICAqXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRDcm9wcGluZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZEFsbCgpOyAvLyA9PT0gaW1hZ2VFaWR0b3IuZW5kQ3JvcHBpbmcoKTtcbiAgICAgKi9cbiAgICBlbmRBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICAgIHRoaXMuZW5kQ3JvcHBpbmcoKTtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLk5PUk1BTDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVhY3RpdmF0ZSBhbGwgb2JqZWN0c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgKi9cbiAgICBkZWFjdGl2YXRlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLmludm9rZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnVuZG8oKTtcbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci51bmRvKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG9cbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5yZWRvKCk7XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIucmVkbygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gZmlsZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltZ0ZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtpbWFnZU5hbWVdIC0gaW1hZ2VOYW1lXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5sb2FkSW1hZ2VGcm9tRmlsZShmaWxlKTtcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tRmlsZTogZnVuY3Rpb24oaW1nRmlsZSwgaW1hZ2VOYW1lKSB7XG4gICAgICAgIGlmICghaW1nRmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2FkSW1hZ2VGcm9tVVJMKFxuICAgICAgICAgICAgVVJMLmNyZWF0ZU9iamVjdFVSTChpbWdGaWxlKSxcbiAgICAgICAgICAgIGltYWdlTmFtZSB8fCBpbWdGaWxlLm5hbWVcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gRmlsZSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gaW1hZ2VOYW1lXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5sb2FkSW1hZ2VGcm9tVVJMKCdodHRwOi8vdXJsL3Rlc3RJbWFnZS5wbmcnLCAnbGVuYScpXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbVVSTDogZnVuY3Rpb24odXJsLCBpbWFnZU5hbWUpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgfHwgIXVybCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmcsIHRoaXMpO1xuICAgICAgICBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkxPQURfSU1BR0UsIGltYWdlTmFtZSwgdXJsKTtcbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sob0ltYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjY2xlYXJJbWFnZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50cy5DTEVBUl9JTUFHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYWZ0ZXIgaW1hZ2UgbG9hZGluZ1xuICAgICAqIEBwYXJhbSB7P2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gSW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nOiBmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQgPSB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCk7XG4gICAgICAgIHZhciAkY2FudmFzRWxlbWVudCA9ICQobWFpbkNvbXBvbmVudC5nZXRDYW52YXNFbGVtZW50KCkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNsb2FkSW1hZ2VcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvblxuICAgICAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbi5vcmlnaW5hbFdpZHRoIC0gb3JpZ2luYWwgaW1hZ2Ugd2lkdGhcbiAgICAgICAgICogIEBwYXJhbSB7bnVtYmVyfSBkaW1lbnNpb24ub3JpZ2luYWxIZWlnaHQgLSBvcmlnaW5hbCBpbWFnZSBoZWlnaHRcbiAgICAgICAgICogIEBwYXJhbSB7bnVtYmVyfSBkaW1lbnNpb24uY3VycmVudFdpZHRoIC0gY3VycmVudCB3aWR0aCAoY3NzKVxuICAgICAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbi5jdXJyZW50IC0gY3VycmVudCBoZWlnaHQgKGNzcylcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2xvYWRJbWFnZScsIGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLm9yaWdpbmFsV2lkdGgpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLm9yaWdpbmFsSGVpZ2h0KTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRpbWVuc2lvbi5jdXJyZW50V2lkdGgpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLmN1cnJlbnRIZWlnaHQpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuTE9BRF9JTUFHRSwge1xuICAgICAgICAgICAgb3JpZ2luYWxXaWR0aDogb0ltYWdlLndpZHRoLFxuICAgICAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IG9JbWFnZS5oZWlnaHQsXG4gICAgICAgICAgICBjdXJyZW50V2lkdGg6ICRjYW52YXNFbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgICBjdXJyZW50SGVpZ2h0OiAkY2FudmFzRWxlbWVudC5oZWlnaHQoKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICovXG4gICAgc3RhcnRDcm9wcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wcGVyO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09PSBzdGF0ZXMuQ1JPUCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuQ1JPUDtcbiAgICAgICAgY3JvcHBlciA9IHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5DUk9QUEVSKTtcbiAgICAgICAgY3JvcHBlci5zdGFydCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3Ijc3RhcnRDcm9wcGluZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5TVEFSVF9DUk9QUElORyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IGNyb3BwaW5nXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQXBwbHlpbmddIC0gV2hldGhlciB0aGUgY3JvcHBpbmcgaXMgYXBwbGllZCBvciBjYW5jZWxlZFxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRDcm9wcGluZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZENyb3BwaW5nKGZhbHNlKTsgLy8gY2FuY2VsIGNyb3BwaW5nXG4gICAgICpcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kQ3JvcHBpbmcodHJ1ZSk7IC8vIGFwcGx5IGNyb3BwaW5nXG4gICAgICovXG4gICAgZW5kQ3JvcHBpbmc6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNyb3BwZXIsIGRhdGE7XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgIT09IHN0YXRlcy5DUk9QKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5OT1JNQUw7XG4gICAgICAgIGRhdGEgPSBjcm9wcGVyLmVuZChpc0FwcGx5aW5nKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VuZENyb3BwaW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9DUk9QUElORyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoZGF0YS51cmwsIGRhdGEuaW1hZ2VOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAnZmxpcFgnIG9yICdmbGlwWScgb3IgJ3Jlc2V0J1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZsaXA6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5GTElQX0lNQUdFKTtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuRkxJUF9JTUFHRSwgdHlwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2ZsaXBJbWFnZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZmxpcFNldHRpbmdcbiAgICAgICAgICogIEBwYXJhbSB7Ym9vbGVhbn0gZmxpcFNldHRpbmcuZmxpcFggLSBpbWFnZS5mbGlwWFxuICAgICAgICAgKiAgQHBhcmFtIHtib29sZWFufSBmbGlwU2V0dGluZy5mbGlwWSAtIGltYWdlLmZsaXBZXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGltYWdlLmFuZ2xlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdmbGlwSW1hZ2UnLCBmdW5jdGlvbihmbGlwU2V0dGluZywgYW5nbGUpIHtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdmbGlwWDogJywgc2V0dGluZy5mbGlwWCk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZmxpcFk6ICcsIHNldHRpbmcuZmxpcFkpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2FuZ2xlOiAnLCBhbmdsZSk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5mbGlwWCgpO1xuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuZmxpcFkoKTtcbiAgICAgKi9cbiAgICBmbGlwWTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ2ZsaXBZJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGZsaXBcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5yZXNldEZsaXAoKTtcbiAgICAgKi9cbiAgICByZXNldEZsaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdyZXNldCcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdyb3RhdGUnIG9yICdzZXRBbmdsZSdcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBhbmdsZSB2YWx1ZSAoZGVncmVlKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24odHlwZSwgYW5nbGUpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5ST1RBVEVfSU1BR0UpO1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5ST1RBVEVfSU1BR0UsIHR5cGUsIGFuZ2xlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3Ijcm90YXRlSW1hZ2VcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRBbmdsZSAtIGltYWdlLmFuZ2xlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdyb3RhdGVJbWFnZScsIGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnYW5nbGU6ICcsIGFuZ2xlKTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSBpbWFnZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBZGRpdGlvbmFsIGFuZ2xlIHRvIHJvdGF0ZSBpbWFnZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc2V0QW5nbGUoMTApOyAvLyBhbmdsZSA9IDEwXG4gICAgICogaW1hZ2VFZGl0b3Iucm90YXRlKDEwKTsgLy8gYW5nbGUgPSAyMFxuICAgICAqIGltYWdlRWlkdG9yLnNldEFuZ2xlKDUpOyAvLyBhbmdsZSA9IDVcbiAgICAgKiBpbWFnZUVpZHRvci5yb3RhdGUoLTk1KTsgLy8gYW5nbGUgPSAtOTBcbiAgICAgKi9cbiAgICByb3RhdGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHRoaXMuX3JvdGF0ZSgncm90YXRlJywgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5nbGVcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgb2YgaW1hZ2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnNldEFuZ2xlKDEwKTsgLy8gYW5nbGUgPSAxMFxuICAgICAqIGltYWdlRWRpdG9yLnJvdGF0ZSgxMCk7IC8vIGFuZ2xlID0gMjBcbiAgICAgKiBpbWFnZUVpZHRvci5zZXRBbmdsZSg1KTsgLy8gYW5nbGUgPSA1XG4gICAgICogaW1hZ2VFaWR0b3Iucm90YXRlKDUwKTsgLy8gYW5nbGUgPSA1NVxuICAgICAqIGltYWdlRWlkdG9yLnNldEFuZ2xlKC00MCk7IC8vIGFuZ2xlID0gLTQwXG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHRoaXMuX3JvdGF0ZSgnc2V0QW5nbGUnLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGZyZWUtZHJhd2luZyBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgY29sb3I6IHN0cmluZ319IFtzZXR0aW5nXSAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydEZyZWVEcmF3aW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kRnJlZURhcndpbmcoKTtcbiAgICAgKiBpbWFnZUVpZHRvci5zdGFydEZyZWVEcmF3aW5nKHtcbiAgICAgKiAgICAgd2lkdGg6IDEyLFxuICAgICAqICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC41KSdcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBzdGFydEZyZWVEcmF3aW5nOiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09PSBzdGF0ZXMuRlJFRV9EUkFXSU5HKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuRlJFRV9EUkFXSU5HKS5zdGFydChzZXR0aW5nKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuRlJFRV9EUkFXSU5HO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNzdGFydEZyZWVEcmF3aW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLlNUQVJUX0ZSRUVfRFJBV0lORyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkcmF3aW5nIGJydXNoXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgY29sb3I6IHN0cmluZ319IHNldHRpbmcgLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLnNldEJydXNoKHtcbiAgICAgKiAgICAgd2lkdGg6IDEyLFxuICAgICAqICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC41KSdcbiAgICAgKiB9KTtcbiAgICAgKiBpbWFnZUVkaXRvci5zZXRCcnVzaCh7XG4gICAgICogICAgIHdpZHRoOiA4LFxuICAgICAqICAgICBjb2xvcjogJ0ZGRkZGRidcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBzZXRCcnVzaDogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuRlJFRV9EUkFXSU5HKS5zZXRCcnVzaChzZXR0aW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGZyZWUtZHJhd2luZyBtb2RlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICovXG4gICAgZW5kRnJlZURyYXdpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSAhPT0gc3RhdGVzLkZSRUVfRFJBV0lORykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5GUkVFX0RSQVdJTkcpLmVuZCgpO1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5OT1JNQUw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VuZEZyZWVEcmF3aW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9GUkVFX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWN0aXZlIG9iamVjdFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnJlbW92ZUFjdGl2ZU9iamVjdCgpO1xuICAgICAqL1xuICAgIHJlbW92ZUFjdGl2ZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmogPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJFTU9WRV9PQkpFQ1QsIG9iaik7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSB1cmxcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1nRWwuc3JjID0gaW1hZ2VFZGl0b3IudG9EYXRhVVJMKCk7XG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbWFnZSBuYW1lXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyhpbWFnZUVkaXRvci5nZXRJbWFnZU5hbWUoKSk7XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJVbmRvU3RhY2soKTtcbiAgICAgKi9cbiAgICBjbGVhclVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJVbmRvU3RhY2soKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJSZWRvU3RhY2soKTtcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEltYWdlRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb21wb25lbnQgaW50ZXJmYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb21wb25lbnQgaW50ZXJmYWNlXG4gKiBAY2xhc3NcbiAqL1xudmFyIENvbXBvbmVudCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tcG9uZW50LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNJbWFnZShuYW1lLCBvSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzRWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNJbWFnZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgZWRpdG9yXG4gICAgICogQHJldHVybnMge0ltYWdlRWRpdG9yfVxuICAgICAqL1xuICAgIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRFZGl0b3IoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKGRpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGJhY2tzdG9yZSBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBzZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb24oZGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHBhcmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fG51bGx9IHBhcmVudCAtIFBhcmVudFxuICAgICAqL1xuICAgIHNldFBhcmVudDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudCB8fCBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiB3aXRoIHNjYWxpbmcgaW1hZ2VcbiAgICAgKi9cbiAgICBhZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKTtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuXG4gICAgICAgIHdoaWxlIChuZXh0KSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICAgICAgICAgIG5leHQgPSBjdXJyZW50LmdldFBhcmVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ29tbWFuZCBpbnRlcmZhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXJyb3JNZXNzYWdlID0gcmVxdWlyZSgnLi4vZmFjdG9yeS9lcnJvck1lc3NhZ2UnKTtcblxudmFyIGNyZWF0ZU1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UuY3JlYXRlLFxuICAgIGVycm9yVHlwZXMgPSBlcnJvck1lc3NhZ2UudHlwZXM7XG5cbi8qKlxuICogQ29tbWFuZCBjbGFzc1xuICogQGNsYXNzXG4gKiBAcGFyYW0ge3tleGVjdXRlOiBmdW5jdGlvbiwgdW5kbzogZnVuY3Rpb259fSBhY3Rpb25zIC0gQ29tbWFuZCBhY3Rpb25zXG4gKi9cbnZhciBDb21tYW5kID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDb21tYW5kLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhY3Rpb25zKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeGVjdXRlIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZSA9IGFjdGlvbnMuZXhlY3V0ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG8gPSBhY3Rpb25zLnVuZG87XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGV4ZWN1dGVDYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZUNhbGxiYWNrID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdW5kb0NhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvQ2FsbGJhY2sgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAnZXhlY3V0ZScpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBhY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoZXJyb3JUeXBlcy5VTl9JTVBMRU1FTlRBVElPTiwgJ3VuZG8nKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBleGVjdXRlIGNhbGxhYmNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBhZnRlciBleGVjdXRpb25cbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldEV4ZWN1dGVDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5leGVjdXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIHVuZG8gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGFmdGVyIHVuZG9cbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldFVuZG9DYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy51bmRvQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW52b2tlciAtIGludm9rZSBjb21tYW5kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbWFnZUxvYWRlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ltYWdlTG9hZGVyJyk7XG52YXIgQ3JvcHBlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2Nyb3BwZXInKTtcbnZhciBNYWluQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQvbWFpbicpO1xudmFyIEZsaXAgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mbGlwJyk7XG52YXIgUm90YXRpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudC9yb3RhdGlvbicpO1xudmFyIEZyZWVEcmF3aW5nID0gcmVxdWlyZSgnLi9jb21wb25lbnQvZnJlZURyYXdpbmcnKTtcbnZhciBldmVudE5hbWVzID0gcmVxdWlyZSgnLi9jb25zdHMnKS5ldmVudE5hbWVzO1xuXG4vKipcbiAqIEludm9rZXJcbiAqIEBjbGFzc1xuICovXG52YXIgSW52b2tlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW52b2tlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDdXN0b20gRXZlbnRzXG4gICAgICAgICAqIEB0eXBlIHt0dWkudXRpbC5DdXN0b21FdmVudHN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jdXN0b21FdmVudHMgPSBuZXcgdHVpLnV0aWwuQ3VzdG9tRXZlbnRzKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3VuZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWRvIHN0YWNrXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48Q29tbWFuZD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tcG9uZW50IG1hcFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jb21wb25lbnRNYXAgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTG9jay1mbGFnIGZvciBleGVjdXRpbmcgY29tbWFuZFxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzTG9ja2VkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlQ29tcG9uZW50cygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY29tcG9uZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWFpbiA9IG5ldyBNYWluQ29tcG9uZW50KCk7XG5cbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobWFpbik7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBJbWFnZUxvYWRlcihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBDcm9wcGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEZsaXAobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgUm90YXRpb24obWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRnJlZURyYXdpbmcobWFpbikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IC0gQ29tcG9uZW50IGhhbmRsaW5nIHRoZSBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZWdpc3RlcjogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudE1hcFtjb21wb25lbnQuZ2V0TmFtZSgpXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmQgZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW52b2tlRXhlY3V0aW9uOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmxvY2soKTtcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoVW5kb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQuZXhlY3V0ZUNhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVubG9jaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kIHVuZG9cbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbnZva2VVbmRvOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmxvY2soKTtcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQudW5kbyh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoUmVkb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQudW5kb0NhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVubG9jaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUuZmlyZX1cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cyAtIEFyZ3VtZW50cyB0byBmaXJlIGEgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5maXJlLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUub259XG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMgLSBBcmd1bWVudHMgdG8gYXR0YWNoIGV2ZW50c1xuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2NrIHRoaXMgaW52b2tlclxuICAgICAqL1xuICAgIGxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9jayB0aGlzIGludm9rZXJcbiAgICAgKi9cbiAgICB1bmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlRXhlY3V0aW9uKGNvbW1hbmQpXG4gICAgICAgICAgICAuZG9uZSgkLnByb3h5KHRoaXMuY2xlYXJSZWRvU3RhY2ssIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLl91bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBqcURlZmVyO1xuXG4gICAgICAgIGlmIChjb21tYW5kICYmIHRoaXMuX2lzTG9ja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2hVbmRvU3RhY2soY29tbWFuZCwgdHJ1ZSk7XG4gICAgICAgICAgICBjb21tYW5kID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX2ludm9rZVVuZG8oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5fcmVkb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCAmJiB0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoUmVkb1N0YWNrKGNvbW1hbmQsIHRydWUpO1xuICAgICAgICAgICAgY29tbWFuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW1wdHlSZWRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpxRGVmZXIgPSB0aGlzLl9pbnZva2VFeGVjdXRpb24oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1c2ggdW5kbyBzdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NpbGVudF0gLSBGaXJlIGV2ZW50IG9yIG5vdFxuICAgICAqL1xuICAgIHB1c2hVbmRvU3RhY2s6IGZ1bmN0aW9uKGNvbW1hbmQsIGlzU2lsZW50KSB7XG4gICAgICAgIHRoaXMuX3VuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIWlzU2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuUFVTSF9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXNoIHJlZG8gc3RhY2tcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaWxlbnRdIC0gRmlyZSBldmVudCBvciBub3RcbiAgICAgKi9cbiAgICBwdXNoUmVkb1N0YWNrOiBmdW5jdGlvbihjb21tYW5kLCBpc1NpbGVudCkge1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFpc1NpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLlBVU0hfUkVET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVkb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHVuZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5kb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICB0aGlzLl91bmRvU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52b2tlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWxcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluID0gTWF0aC5taW4sXG4gICAgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIENsYW1wIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluVmFsdWUgLSBNaW5pbXVtIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heFZhbHVlIC0gTWF4aW11bSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGNsYW1wZWQgdmFsdWVcbiAgICAgKi9cbiAgICBjbGFtcDogZnVuY3Rpb24odmFsdWUsIG1pblZhbHVlLCBtYXhWYWx1ZSkge1xuICAgICAgICB2YXIgdGVtcDtcbiAgICAgICAgaWYgKG1pblZhbHVlID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIHRlbXAgPSBtaW5WYWx1ZTtcbiAgICAgICAgICAgIG1pblZhbHVlID0gbWF4VmFsdWU7XG4gICAgICAgICAgICBtYXhWYWx1ZSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF4KG1pblZhbHVlLCBtaW4odmFsdWUsIG1heFZhbHVlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2Uga2V5LXZhbHVlIG9iamVjdCBmcm9tIGFyZ3VtZW50c1xuICAgICAqIEByZXR1cm5zIHtvYmplY3QuPHN0cmluZywgc3RyaW5nPn1cbiAgICAgKi9cbiAgICBrZXlNaXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb2JqID0ge307XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChhcmd1bWVudHMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgb2JqW2tleV0gPSBrZXk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxufTtcbiJdfQ==
