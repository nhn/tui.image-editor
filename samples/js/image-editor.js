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
            containerClass: 'tui-imageEditor-canvasContainer'
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
     * Get max dimension of canvas
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
        'ADD_OBJECT',
        'REMOVE_OBJECT'
    ),

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
    }
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
            cornerSize: 6
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
     * Clear all objects
     * @api
     * @example
     * imageEditor.clear();
     */
    clear: function() {
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
     * @example
     * imageEditor.loadImageFromFile(file);
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
     * @api
     * @param {string} imageName - imageName
     * @param {string} url - File url
     * @example
     * imageEditor.loadImageFromURL('lena', 'http://url/testImage.png')
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
        var cropper = this._getComponent(compList.CROPPER);

        this.endAll();
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
        var cropper = this._getComponent(compList.CROPPER);
        var data = cropper.end(isApplying);

        /**
         * @api
         * @event ImageEditor#endCropping
         */
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
        this.endAll();
        this._getComponent(compList.FREE_DRAWING).start(setting);

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
        this._getComponent(compList.FREE_DRAWING).end();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmxpcC5qcyIsInNyYy9qcy9jb21wb25lbnQvZnJlZURyYXdpbmcuanMiLCJzcmMvanMvY29tcG9uZW50L2ltYWdlTG9hZGVyLmpzIiwic3JjL2pzL2NvbXBvbmVudC9tYWluLmpzIiwic3JjL2pzL2NvbXBvbmVudC9yb3RhdGlvbi5qcyIsInNyYy9qcy9jb25zdHMuanMiLCJzcmMvanMvZXh0ZW5zaW9uL2Nyb3B6b25lLmpzIiwic3JjL2pzL2ZhY3RvcnkvY29tbWFuZC5qcyIsInNyYy9qcy9mYWN0b3J5L2Vycm9yTWVzc2FnZS5qcyIsInNyYy9qcy9pbWFnZUVkaXRvci5qcyIsInNyYy9qcy9pbnRlcmZhY2UvQ29tcG9uZW50LmpzIiwic3JjL2pzL2ludGVyZmFjZS9jb21tYW5kLmpzIiwic3JjL2pzL2ludm9rZXIuanMiLCJzcmMvanMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkltYWdlRWRpdG9yJywgcmVxdWlyZSgnLi9zcmMvanMvaW1hZ2VFZGl0b3InKSwgdHJ1ZSk7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBjcm9wIG1vZHVsZSAoc3RhcnQgY3JvcHBpbmcsIGVuZCBjcm9wcGluZylcbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBDcm9wem9uZSA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbi9jcm9wem9uZScpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBNT1VTRV9NT1ZFX1RIUkVTSE9MRCA9IDEwO1xuXG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgY2xhbXAgPSB1dGlsLmNsYW1wO1xuXG4vKipcbiAqIENyb3BwZXIgY29tcG9uZW50c1xuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgQ3JvcHBlclxuICovXG52YXIgQ3JvcHBlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBDcm9wcGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge0Nyb3B6b25lfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFggb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WSBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRZID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNlbW92ZTogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlTW92ZSwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZXVwOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VVcCwgdGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5DUk9QUEVSLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2Nyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7IC8vIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLk9iamVjdC5odG1sI2V2ZW50ZWR9XG4gICAgICAgICAgICBvYmouZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBuZXcgQ3JvcHpvbmUoe1xuICAgICAgICAgICAgbGVmdDogLTEwLFxuICAgICAgICAgICAgdG9wOiAtMTAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLCAvLyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2thbmdheC9mYWJyaWMuanMvaXNzdWVzLzI4NjB9XG4gICAgICAgICAgICBjb3JuZXJTaXplOiAxMCxcbiAgICAgICAgICAgIGNvcm5lckNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgIGhhc1JvdGF0aW5nUG9pbnQ6IGZhbHNlLFxuICAgICAgICAgICAgaGFzQm9yZGVyczogZmFsc2UsXG4gICAgICAgICAgICBsb2NrU2NhbGluZ0ZsaXA6IHRydWUsXG4gICAgICAgICAgICBsb2NrUm90YXRpb246IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbnZhcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgICAgIGNhbnZhcy5hZGQodGhpcy5fY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub24oJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IHRydWU7XG4gICAgICAgIGNhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICBjYW52YXMub2ZmKCdtb3VzZTpkb3duJywgdGhpcy5fbGlzdGVuZXJzLm1vdXNlZG93bik7XG4gICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgb2JqLmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlZG93biBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlRG93bjogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY29vcmQ7XG5cbiAgICAgICAgaWYgKGZFdmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgY29vcmQgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG5cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gY29vcmQueDtcbiAgICAgICAgdGhpcy5fc3RhcnRZID0gY29vcmQueTtcblxuICAgICAgICBjYW52YXMub24oe1xuICAgICAgICAgICAgJ21vdXNlOm1vdmUnOiB0aGlzLl9saXN0ZW5lcnMubW91c2Vtb3ZlLFxuICAgICAgICAgICAgJ21vdXNlOnVwJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNldXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vtb3ZlIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VNb3ZlOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuICAgICAgICB2YXIgeCA9IHBvaW50ZXIueDtcbiAgICAgICAgdmFyIHkgPSBwb2ludGVyLnk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuXG4gICAgICAgIGlmIChhYnMoeCAtIHRoaXMuX3N0YXJ0WCkgKyBhYnMoeSAtIHRoaXMuX3N0YXJ0WSkgPiBNT1VTRV9NT1ZFX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgY3JvcHpvbmUucmVtb3ZlKCk7XG4gICAgICAgICAgICBjcm9wem9uZS5zZXQodGhpcy5fY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQoeCwgeSkpO1xuXG4gICAgICAgICAgICBjYW52YXMuYWRkKGNyb3B6b25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVjdCBkaW1lbnNpb24gc2V0dGluZyBmcm9tIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbih4LCB5KVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciB3aWR0aCA9IGNhbnZhcy5nZXRXaWR0aCgpO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmdldEhlaWdodCgpO1xuICAgICAgICB2YXIgc3RhcnRYID0gdGhpcy5fc3RhcnRYO1xuICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5fc3RhcnRZO1xuICAgICAgICB2YXIgbGVmdCA9IGNsYW1wKHgsIDAsIHN0YXJ0WCk7XG4gICAgICAgIHZhciB0b3AgPSBjbGFtcCh5LCAwLCBzdGFydFkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICB3aWR0aDogY2xhbXAoeCwgc3RhcnRYLCB3aWR0aCkgLSBsZWZ0LCAvLyAoc3RhcnRYIDw9IHgobW91c2UpIDw9IGNhbnZhc1dpZHRoKSAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGNsYW1wKHksIHN0YXJ0WSwgaGVpZ2h0KSAtIHRvcCAvLyAoc3RhcnRZIDw9IHkobW91c2UpIDw9IGNhbnZhc0hlaWdodCkgLSB0b3BcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZXVwIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBjYW52YXMuc2V0QWN0aXZlT2JqZWN0KGNyb3B6b25lKTtcbiAgICAgICAgY2FudmFzLm9mZih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IGxpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiBsaXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNyb3BwZWQgaW1hZ2UgZGF0YVxuICAgICAqIEByZXR1cm5zIHs/e2ltYWdlTmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZ319IGNyb3BwZWQgSW1hZ2UgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENyb3BwZWRJbWFnZURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGNyb3BJbmZvO1xuXG4gICAgICAgIGlmICghY3JvcHpvbmUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyb3BJbmZvID0ge1xuICAgICAgICAgICAgbGVmdDogY3JvcHpvbmUuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wOiBjcm9wem9uZS5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoOiBjcm9wem9uZS5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBjcm9wem9uZS5nZXRIZWlnaHQoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbWFnZU5hbWU6IHRoaXMuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICB1cmw6IHRoaXMuZ2V0Q2FudmFzKCkudG9EYXRhVVJMKGNyb3BJbmZvKVxuICAgICAgICB9O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3BwZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBmbGlwIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogRmxpcFxuICogQGNsYXNzIEZsaXBcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRmxpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGbGlwLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GTElQLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHt7ZmxpcFg6IEJvb2xlYW4sIGZsaXBZOiBCb29sZWFufX1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50U2V0dGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmxpcFg6IGNhbnZhc0ltYWdlLmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6IGNhbnZhc0ltYWdlLmZsaXBZXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBmbGlwWCwgZmxpcFlcbiAgICAgKiBAcGFyYW0ge3tmbGlwWDogQm9vbGVhbiwgZmxpcFk6IEJvb2xlYW59fSBuZXdTZXR0aW5nIC0gRmxpcCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1NldHRpbmcpIHtcbiAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBYID0gKHNldHRpbmcuZmxpcFggIT09IG5ld1NldHRpbmcuZmxpcFgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBZID0gKHNldHRpbmcuZmxpcFkgIT09IG5ld1NldHRpbmcuZmxpcFkpO1xuXG4gICAgICAgIGlmICghaXNDaGFuZ2luZ0ZsaXBYICYmICFpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHNldHRpbmcsIG5ld1NldHRpbmcpO1xuICAgICAgICB0aGlzLnNldEltYWdlUHJvcGVydGllcyhzZXR0aW5nLCB0cnVlKTtcbiAgICAgICAgdGhpcy5faW52ZXJ0QW5nbGUoaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpO1xuICAgICAgICB0aGlzLl9mbGlwT2JqZWN0cyhpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShzZXR0aW5nLCB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZlcnQgaW1hZ2UgYW5nbGUgZm9yIGZsaXBcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbmdpbmdGbGlwWCAtIENoYW5nZSBmbGlwWFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBZIC0gQ2hhbmdlIGZsaXBZXG4gICAgICovXG4gICAgX2ludmVydEFuZ2xlOiBmdW5jdGlvbihpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG4gICAgICAgIHZhciBhbmdsZSA9IGNhbnZhc0ltYWdlLmFuZ2xlO1xuXG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFgpIHtcbiAgICAgICAgICAgIGFuZ2xlICo9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGFuZ2xlICo9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlLnNldEFuZ2xlKHBhcnNlRmxvYXQoYW5nbGUpKS5zZXRDb29yZHMoKTsvLyBwYXJzZUZsb2F0IGZvciAtMCB0byAwXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgb2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBYIC0gQ2hhbmdlIGZsaXBYXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW5naW5nRmxpcFkgLSBDaGFuZ2UgZmxpcFlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mbGlwT2JqZWN0czogZnVuY3Rpb24oaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWCkge1xuICAgICAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwYXJzZUZsb2F0KG9iai5hbmdsZSAqIC0xKSwgLy8gcGFyc2VGbG9hdCBmb3IgLTAgdG8gMFxuICAgICAgICAgICAgICAgICAgICBmbGlwWDogIW9iai5mbGlwWCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogY2FudmFzLndpZHRoIC0gb2JqLmxlZnRcbiAgICAgICAgICAgICAgICB9KS5zZXRDb29yZHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZTogcGFyc2VGbG9hdChvYmouYW5nbGUgKiAtMSksIC8vIHBhcnNlRmxvYXQgZm9yIC0wIHRvIDBcbiAgICAgICAgICAgICAgICAgICAgZmxpcFk6ICFvYmouZmxpcFksXG4gICAgICAgICAgICAgICAgICAgIHRvcDogY2FudmFzLmhlaWdodCAtIG9iai50b3BcbiAgICAgICAgICAgICAgICB9KS5zZXRDb29yZHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQoe1xuICAgICAgICAgICAgZmxpcFg6IGZhbHNlLFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiAhY3VycmVudC5mbGlwWCxcbiAgICAgICAgICAgIGZsaXBZOiBjdXJyZW50LmZsaXBZXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHlcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiBjdXJyZW50LmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6ICFjdXJyZW50LmZsaXBZXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaXA7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBGcmVlIGRyYXdpbmcgbW9kdWxlLCBTZXQgYnJ1c2hcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEZyZWVEcmF3aW5nXG4gKiBAY2xhc3MgRnJlZURyYXdpbmdcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRnJlZURyYXdpbmcgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRnJlZURyYXdpbmcucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCcnVzaCB3aWR0aFxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53aWR0aCA9IDEyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmYWJyaWMuQ29sb3IgaW5zdGFuY2UgZm9yIGJydXNoIGNvbG9yXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ29sb3J9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9Db2xvciA9IG5ldyBmYWJyaWMuQ29sb3IoJ3JnYmEoMCwgMCwgMCwgMC41KScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLkZSRUVfRFJBV0lORyxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGZyZWUgZHJhd2luZyBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5pc0RyYXdpbmdNb2RlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRCcnVzaChzZXR0aW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGJydXNoXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHNldEJydXNoOiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBicnVzaCA9IHRoaXMuZ2V0Q2FudmFzKCkuZnJlZURyYXdpbmdCcnVzaDtcblxuICAgICAgICBzZXR0aW5nID0gc2V0dGluZyB8fCB7fTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHNldHRpbmcud2lkdGggfHwgdGhpcy53aWR0aDtcbiAgICAgICAgaWYgKHNldHRpbmcuY29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMub0NvbG9yID0gbmV3IGZhYnJpYy5Db2xvcihzZXR0aW5nLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBicnVzaC53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGJydXNoLmNvbG9yID0gdGhpcy5vQ29sb3IudG9SZ2JhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBmcmVlIGRyYXdpbmcgbW9kZVxuICAgICAqL1xuICAgIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5pc0RyYXdpbmdNb2RlID0gZmFsc2U7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRnJlZURyYXdpbmc7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBsb2FkZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgaW1hZ2VPcHRpb24gPSB7XG4gICAgcGFkZGluZzogMCxcbiAgICBjcm9zc09yaWdpbjogJ2Fub255bW91cydcbn07XG5cbi8qKlxuICogSW1hZ2VMb2FkZXIgY29tcG9uZW50c1xuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBJbWFnZUxvYWRlclxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqL1xudmFyIEltYWdlTG9hZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEltYWdlTG9hZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVIsXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBpbWFnZU5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfHN0cmluZyl9IGltZyAtIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGpxRGVmZXIsIGNhbnZhcztcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7IC8vIEJhY2sgdG8gdGhlIGluaXRpYWwgc3RhdGUsIG5vdCBlcnJvci5cbiAgICAgICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICBjYW52YXMuYmFja2dyb3VuZEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZSgnJywgbnVsbCk7XG4gICAgICAgICAgICB9KS5yZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gdGhpcy5fc2V0QmFja2dyb3VuZEltYWdlKGltZykuZG9uZShmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldENhbnZhc0ltYWdlKGltYWdlTmFtZSwgb0ltYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGJhY2tncm91bmQgaW1hZ2VcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfFN0cmluZyl9IGltZyBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlIHRvIHNldCBiYWNrZ3JvdW5kIHRvXG4gICAgICogQHJldHVybnMgeyQuRGVmZXJyZWR9IGRlZmVycmVkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0QmFja2dyb3VuZEltYWdlOiBmdW5jdGlvbihpbWcpIHtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWcpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLnNldEJhY2tncm91bmRJbWFnZShpbWcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG9JbWFnZSA9IGNhbnZhcy5iYWNrZ3JvdW5kSW1hZ2U7XG5cbiAgICAgICAgICAgIGlmIChvSW1hZ2UuZ2V0RWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKG9JbWFnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGltYWdlT3B0aW9uKTtcblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUxvYWRlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IE1haW4gY29tcG9uZW50IGhhdmluZyBjYW52YXMgJiBpbWFnZSwgc2V0IGNzcy1tYXgtZGltZW5zaW9uIG9mIGNhbnZhc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBERUZBVUxUX0NTU19NQVhfV0lEVEggPSAxMDAwO1xudmFyIERFRkFVTFRfQ1NTX01BWF9IRUlHSFQgPSA4MDA7XG5cbnZhciBjc3NPbmx5ID0ge2Nzc09ubHk6IHRydWV9O1xudmFyIGJhY2tzdG9yZU9ubHkgPSB7YmFja3N0b3JlT25seTogdHJ1ZX07XG5cbi8qKlxuICogTWFpbiBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3NcbiAqL1xudmFyIE1haW4gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgTWFpbi5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgY2FudmFzIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ2FudmFzfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5JbWFnZX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FudmFzSW1hZ2UgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXggd2lkdGggb2YgY2FudmFzIGVsZW1lbnRzXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNzc01heFdpZHRoID0gREVGQVVMVF9DU1NfTUFYX1dJRFRIO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXggaGVpZ2h0IG9mIGNhbnZhcyBlbGVtZW50c1xuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jc3NNYXhIZWlnaHQgPSBERUZBVUxUX0NTU19NQVhfSEVJR0hUO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbWFnZSBuYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLk1BSU4sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkYXRhIHVybCBmcm9tIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyAmJiB0aGlzLmNhbnZhcy50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHs/ZmFicmljLkltYWdlfSBjYW52YXNJbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBjYW52YXNJbWFnZSkge1xuICAgICAgICBpZiAoY2FudmFzSW1hZ2UpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLnN0YW1wKGNhbnZhc0ltYWdlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmltYWdlTmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY2FudmFzSW1hZ2UgPSBjYW52YXNJbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNzcyBtYXggZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBtYXhEaW1lbnNpb24gLSBNYXggd2lkdGggJiBNYXggaGVpZ2h0XG4gICAgICovXG4gICAgc2V0Q3NzTWF4RGltZW5zaW9uOiBmdW5jdGlvbihtYXhEaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jc3NNYXhXaWR0aCA9IG1heERpbWVuc2lvbi53aWR0aCB8fCB0aGlzLmNzc01heFdpZHRoO1xuICAgICAgICB0aGlzLmNzc01heEhlaWdodCA9IG1heERpbWVuc2lvbi5oZWlnaHQgfHwgdGhpcy5jc3NNYXhIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZWxlbWVudCB0byBmYWJyaWMuQ2FudmFzXG4gICAgICogQHBhcmFtIHtqUXVlcnl8RWxlbWVudHxzdHJpbmd9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcygkKGNhbnZhc0VsZW1lbnQpWzBdLCB7XG4gICAgICAgICAgICBjb250YWluZXJDbGFzczogJ3R1aS1pbWFnZUVkaXRvci1jYW52YXNDb250YWluZXInXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiB3aXRoIHNjYWxpbmcgaW1hZ2VcbiAgICAgKi9cbiAgICBhZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmNhbnZhc0ltYWdlLnNjYWxlKDEpO1xuICAgICAgICB2YXIgYm91bmRpbmdSZWN0ID0gY2FudmFzSW1hZ2UuZ2V0Qm91bmRpbmdSZWN0KCk7XG4gICAgICAgIHZhciB3aWR0aCA9IGJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGJvdW5kaW5nUmVjdC5oZWlnaHQ7XG4gICAgICAgIHZhciBtYXhEaW1lbnNpb24gPSB0aGlzLl9jYWxjTWF4RGltZW5zaW9uKHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJywgLy8gU2V0IGhlaWdodCAnJyBmb3IgSUU5XG4gICAgICAgICAgICAnbWF4LXdpZHRoJzogbWF4RGltZW5zaW9uLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICdtYXgtaGVpZ2h0JzogbWF4RGltZW5zaW9uLmhlaWdodCArICdweCdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uKHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNhbnZhcy5jZW50ZXJPYmplY3QoY2FudmFzSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbWF4IGRpbWVuc2lvbiBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBDYW52YXMgd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gQ2FudmFzIGhlaWdodFxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSAtIE1heCB3aWR0aCAmIE1heCBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjTWF4RGltZW5zaW9uOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciB3U2NhbGVGYWN0b3IgPSB0aGlzLmNzc01heFdpZHRoIC8gd2lkdGg7XG4gICAgICAgIHZhciBoU2NhbGVGYWN0b3IgPSB0aGlzLmNzc01heEhlaWdodCAvIGhlaWdodDtcbiAgICAgICAgdmFyIGNzc01heFdpZHRoID0gTWF0aC5taW4od2lkdGgsIHRoaXMuY3NzTWF4V2lkdGgpO1xuICAgICAgICB2YXIgY3NzTWF4SGVpZ2h0ID0gTWF0aC5taW4oaGVpZ2h0LCB0aGlzLmNzc01heEhlaWdodCk7XG5cbiAgICAgICAgaWYgKHdTY2FsZUZhY3RvciA8IDEgJiYgd1NjYWxlRmFjdG9yIDwgaFNjYWxlRmFjdG9yKSB7XG4gICAgICAgICAgICBjc3NNYXhXaWR0aCA9IHdpZHRoICogd1NjYWxlRmFjdG9yO1xuICAgICAgICAgICAgY3NzTWF4SGVpZ2h0ID0gaGVpZ2h0ICogd1NjYWxlRmFjdG9yO1xuICAgICAgICB9IGVsc2UgaWYgKGhTY2FsZUZhY3RvciA8IDEgJiYgaFNjYWxlRmFjdG9yIDwgd1NjYWxlRmFjdG9yKSB7XG4gICAgICAgICAgICBjc3NNYXhXaWR0aCA9IHdpZHRoICogaFNjYWxlRmFjdG9yO1xuICAgICAgICAgICAgY3NzTWF4SGVpZ2h0ID0gaGVpZ2h0ICogaFNjYWxlRmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBNYXRoLmZsb29yKGNzc01heFdpZHRoKSxcbiAgICAgICAgICAgIGhlaWdodDogTWF0aC5mbG9vcihjc3NNYXhIZWlnaHQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiAge0BsaW5rIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuQ2FudmFzLmh0bWwjc2V0RGltZW5zaW9uc31cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGNzcyBkaW1lbnNpb25cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNDc3NEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmNhbnZhcy5zZXREaW1lbnNpb25zKGRpbWVuc2lvbiwgY3NzT25seSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gYmFja3N0b3JlIG9ubHlcbiAgICAgKiAge0BsaW5rIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuQ2FudmFzLmh0bWwjc2V0RGltZW5zaW9uc31cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGJhY2tzdG9yZSBkaW1lbnNpb25cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmNhbnZhcy5zZXREaW1lbnNpb25zKGRpbWVuc2lvbiwgYmFja3N0b3JlT25seSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbWFnZSBwcm9wZXJ0aWVzXG4gICAgICoge0BsaW5rIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuSW1hZ2UuaHRtbCNzZXR9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmcgLSBJbWFnZSBwcm9wZXJ0aWVzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbd2l0aFJlbmRlcmluZ10gLSBJZiB0cnVlLCBUaGUgY2hhbmdlZCBpbWFnZSB3aWxsIGJlIHJlZmxlY3RlZCBpbiB0aGUgY2FudmFzXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0SW1hZ2VQcm9wZXJ0aWVzOiBmdW5jdGlvbihzZXR0aW5nLCB3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuY2FudmFzSW1hZ2U7XG5cbiAgICAgICAgaWYgKCFjYW52YXNJbWFnZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzSW1hZ2Uuc2V0KHNldHRpbmcpLnNldENvb3JkcygpO1xuICAgICAgICBpZiAod2l0aFJlbmRlcmluZykge1xuICAgICAgICAgICAgdGhpcy5jYW52YXMucmVuZGVyQWxsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLmdldEVsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXNJbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlTmFtZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2Ugcm90YXRpb24gbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBJbWFnZSBSb3RhdGlvbiBjb21wb25lbnRcbiAqIEBjbGFzcyBSb3RhdGlvblxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBSb3RhdGlvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBSb3RhdGlvbi5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLlJPVEFUSU9OLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRBbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhbmdsZSBvZiB0aGUgaW1hZ2VcbiAgICAgKlxuICAgICAqICBEbyBub3QgY2FsbCBcInRoaXMuc2V0SW1hZ2VQcm9wZXJ0aWVzXCIgZm9yIHNldHRpbmcgYW5nbGUgZGlyZWN0bHkuXG4gICAgICogIEJlZm9yZSBzZXR0aW5nIGFuZ2xlLCBUaGUgb3JpZ2luWCxZIG9mIGltYWdlIHNob3VsZCBiZSBzZXQgdG8gY2VudGVyLlxuICAgICAqICAgICAgU2VlIFwiaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbCNzZXRBbmdsZVwiXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHZhciBvbGRBbmdsZSA9IHRoaXMuZ2V0Q3VycmVudEFuZ2xlKCkgJSAzNjA7IC8vVGhlIGFuZ2xlIGlzIGxvd2VyIHRoYW4gMipQSSg9PT0zNjAgZGVncmVlcylcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBvbGRJbWFnZUNlbnRlciwgbmV3SW1hZ2VDZW50ZXIsIGNhbnZhc0ltYWdlO1xuXG4gICAgICAgIGFuZ2xlICU9IDM2MDtcbiAgICAgICAgaWYgKGFuZ2xlID09PSBvbGRBbmdsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG5cbiAgICAgICAgb2xkSW1hZ2VDZW50ZXIgPSBjYW52YXNJbWFnZS5nZXRDZW50ZXJQb2ludCgpO1xuICAgICAgICBjYW52YXNJbWFnZS5zZXRBbmdsZShhbmdsZSkuc2V0Q29vcmRzKCk7XG4gICAgICAgIHRoaXMuYWRqdXN0Q2FudmFzRGltZW5zaW9uKCk7XG4gICAgICAgIG5ld0ltYWdlQ2VudGVyID0gY2FudmFzSW1hZ2UuZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgdGhpcy5fcm90YXRlRm9yRWFjaE9iamVjdChvbGRJbWFnZUNlbnRlciwgbmV3SW1hZ2VDZW50ZXIsIGFuZ2xlIC0gb2xkQW5nbGUpO1xuXG4gICAgICAgIHJldHVybiBqcURlZmVyLnJlc29sdmUoYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgZm9yIGVhY2ggb2JqZWN0XG4gICAgICogQHBhcmFtIHtmYWJyaWMuUG9pbnR9IG9sZEltYWdlQ2VudGVyIC0gSW1hZ2UgY2VudGVyIHBvaW50IGJlZm9yZSByb3RhdGlvblxuICAgICAqIEBwYXJhbSB7ZmFicmljLlBvaW50fSBuZXdJbWFnZUNlbnRlciAtIEltYWdlIGNlbnRlciBwb2ludCBhZnRlciByb3RhdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZURpZmYgLSBJbWFnZSBhbmdsZSBkaWZmZXJlbmNlIGFmdGVyIHJvdGF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcm90YXRlRm9yRWFjaE9iamVjdDogZnVuY3Rpb24ob2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBhbmdsZURpZmYpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjZW50ZXJEaWZmID0ge1xuICAgICAgICAgICAgeDogb2xkSW1hZ2VDZW50ZXIueCAtIG5ld0ltYWdlQ2VudGVyLngsXG4gICAgICAgICAgICB5OiBvbGRJbWFnZUNlbnRlci55IC0gbmV3SW1hZ2VDZW50ZXIueVxuICAgICAgICB9O1xuXG4gICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgdmFyIG9iakNlbnRlciA9IG9iai5nZXRDZW50ZXJQb2ludCgpO1xuICAgICAgICAgICAgdmFyIHJhZGlhbiA9IGZhYnJpYy51dGlsLmRlZ3JlZXNUb1JhZGlhbnMoYW5nbGVEaWZmKTtcbiAgICAgICAgICAgIHZhciBuZXdPYmpDZW50ZXIgPSBmYWJyaWMudXRpbC5yb3RhdGVQb2ludChvYmpDZW50ZXIsIG9sZEltYWdlQ2VudGVyLCByYWRpYW4pO1xuXG4gICAgICAgICAgICBvYmouc2V0KHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBuZXdPYmpDZW50ZXIueCAtIGNlbnRlckRpZmYueCxcbiAgICAgICAgICAgICAgICB0b3A6IG5ld09iakNlbnRlci55IC0gY2VudGVyRGlmZi55LFxuICAgICAgICAgICAgICAgIGFuZ2xlOiAob2JqLmFuZ2xlICsgYW5nbGVEaWZmKSAlIDM2MFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYmouc2V0Q29vcmRzKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGUgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYWRkaXRpb25hbEFuZ2xlIC0gQWRkaXRpb25hbCBhbmdsZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcm90YXRlOiBmdW5jdGlvbihhZGRpdGlvbmFsQW5nbGUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRBbmdsZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnNldEFuZ2xlKGN1cnJlbnQgKyBhZGRpdGlvbmFsQW5nbGUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdGF0aW9uO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ29uc3RhbnRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29tcG9uZW50TmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTUFJTicsXG4gICAgICAgICdJTUFHRV9MT0FERVInLFxuICAgICAgICAnQ1JPUFBFUicsXG4gICAgICAgICdGTElQJyxcbiAgICAgICAgJ1JPVEFUSU9OJyxcbiAgICAgICAgJ0ZSRUVfRFJBV0lORydcbiAgICApLFxuXG4gICAgY29tbWFuZE5hbWVzOiB1dGlsLmtleU1pcnJvcihcbiAgICAgICAgJ0NMRUFSJyxcbiAgICAgICAgJ0xPQURfSU1BR0UnLFxuICAgICAgICAnRkxJUF9JTUFHRScsXG4gICAgICAgICdST1RBVEVfSU1BR0UnLFxuICAgICAgICAnQUREX09CSkVDVCcsXG4gICAgICAgICdSRU1PVkVfT0JKRUNUJ1xuICAgICksXG5cbiAgICBldmVudE5hbWVzOiB7XG4gICAgICAgIExPQURfSU1BR0U6ICdsb2FkSW1hZ2UnLFxuICAgICAgICBDTEVBUl9PQkpFQ1RTOiAnY2xlYXJPYmplY3RzJyxcbiAgICAgICAgQ0xFQVJfSU1BR0U6ICdjbGVhckltYWdlJyxcbiAgICAgICAgU1RBUlRfQ1JPUFBJTkc6ICdzdGFydENyb3BwaW5nJyxcbiAgICAgICAgRU5EX0NST1BQSU5HOiAnZW5kQ3JvcHBpbmcnLFxuICAgICAgICBGTElQX0lNQUdFOiAnZmxpcEltYWdlJyxcbiAgICAgICAgUk9UQVRFX0lNQUdFOiAncm90YXRlSW1hZ2UnLFxuICAgICAgICBBRERfT0JKRUNUOiAnYWRkT2JqZWN0JyxcbiAgICAgICAgUkVNT1ZFX09CSkVDVDogJ3JlbW92ZU9iamVjdCcsXG4gICAgICAgIFNUQVJUX0ZSRUVfRFJBV0lORzogJ3N0YXJ0RnJlZURyYXdpbmcnLFxuICAgICAgICBFTkRfRlJFRV9EUkFXSU5HOiAnZW5kRnJlZURyYXdpbmcnLFxuICAgICAgICBFTVBUWV9SRURPX1NUQUNLOiAnZW1wdHlSZWRvU3RhY2snLFxuICAgICAgICBFTVBUWV9VTkRPX1NUQUNLOiAnZW1wdHlVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1VORE9fU1RBQ0s6ICdwdXNoVW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9SRURPX1NUQUNLOiAncHVzaFJlZG9TdGFjaydcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ3JvcHpvbmUgZXh0ZW5kaW5nIGZhYnJpYy5SZWN0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGNsYW1wID0gcmVxdWlyZSgnLi4vdXRpbCcpLmNsYW1wO1xuXG52YXIgQ09STkVSX1RZUEVfVE9QX0xFRlQgPSAndGwnO1xudmFyIENPUk5FUl9UWVBFX1RPUF9SSUdIVCA9ICd0cic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1RPUCA9ICdtdCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0xFRlQgPSAnbWwnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVCA9ICdtcic7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX0JPVFRPTSA9ICdtYic7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQgPSAnYmwnO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9SSUdIVCA9ICdicic7XG5cbi8qKlxuICogQ3JvcHpvbmUgb2JqZWN0XG4gKiBJc3N1ZTogSUU3LCA4KHdpdGggZXhjYW52YXMpXG4gKiAgLSBDcm9wem9uZSBpcyBhIGJsYWNrIHpvbmUgd2l0aG91dCB0cmFuc3BhcmVuY3kuXG4gKiBAY2xhc3MgQ3JvcHpvbmVcbiAqIEBleHRlbmRzIHtmYWJyaWMuUmVjdH1cbiAqL1xudmFyIENyb3B6b25lID0gZmFicmljLnV0aWwuY3JlYXRlQ2xhc3MoZmFicmljLlJlY3QsIC8qKiBAbGVuZHMgQ3JvcHpvbmUucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ2luaXRpYWxpemUnLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAnbW92aW5nJzogdGhpcy5fb25Nb3ZpbmcsXG4gICAgICAgICAgICAnc2NhbGluZyc6IHRoaXMuX29uU2NhbGluZ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIENyb3Atem9uZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfcmVuZGVyOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRmxpcFgsIG9yaWdpbmFsRmxpcFksXG4gICAgICAgICAgICBvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVksXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lV2lkdGggPSA3LFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZU9mZnNldCA9IDc7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdfcmVuZGVyJywgY3R4KTtcblxuICAgICAgICAvLyBDYWxjIG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIG9yaWdpbmFsRmxpcFggPSB0aGlzLmZsaXBYID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbEZsaXBZID0gdGhpcy5mbGlwWSA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVggPSBvcmlnaW5hbEZsaXBYIC8gdGhpcy5zY2FsZVg7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVZID0gb3JpZ2luYWxGbGlwWSAvIHRoaXMuc2NhbGVZO1xuXG4gICAgICAgIC8vIFNldCBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUob3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZKTtcblxuICAgICAgICAvLyBSZW5kZXIgb3V0ZXIgcmVjdFxuICAgICAgICB0aGlzLl9maWxsT3V0ZXJSZWN0KGN0eCwgJ3JnYmEoMCwgMCwgMCwgMC41NSknKTtcblxuICAgICAgICAvLyBCbGFjayBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigwLCAwLCAwKScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCk7XG5cbiAgICAgICAgLy8gV2hpdGUgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMjU1LCAyNTUsIDI1NSknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgsIGNyb3B6b25lRGFzaExpbmVPZmZzZXQpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZSgxIC8gb3JpZ2luYWxTY2FsZVgsIDEgLyBvcmlnaW5hbFNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyb3B6b25lLWNvb3JkaW5hdGVzIHdpdGggb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICpcbiAgICAgKiAgICAgeDAgICAgIHgxICAgICAgICAgeDIgICAgICB4M1xuICAgICAqICB5MCArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3wgICAgLy8gPC0tLSBcIk91dGVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTEgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wgQ3JvcHpvbmUgfC8vLy8vLy98ICAgIENyb3B6b25lIGlzIHRoZSBcIklubmVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfCAgKDAsIDApICB8Ly8vLy8vL3wgICAgQ2VudGVyIHBvaW50ICgwLCAwKVxuICAgICAqICB5MiArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICpcbiAgICAgKiBAdHlwZWRlZiB7e3g6IEFycmF5PG51bWJlcj4sIHk6IEFycmF5PG51bWJlcj59fSBjcm9wem9uZUNvb3JkaW5hdGVzXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBGaWxsIG91dGVyIHJlY3RhbmdsZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gZmlsbFN0eWxlIC0gRmlsbC1zdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbGxPdXRlclJlY3Q6IGZ1bmN0aW9uKGN0eCwgZmlsbFN0eWxlKSB7XG4gICAgICAgIHZhciBjb29yZGluYXRlcyA9IHRoaXMuX2dldENvb3JkaW5hdGVzKGN0eCksXG4gICAgICAgICAgICB4ID0gY29vcmRpbmF0ZXMueCxcbiAgICAgICAgICAgIHkgPSBjb29yZGluYXRlcy55O1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyBPdXRlciByZWN0YW5nbGVcbiAgICAgICAgLy8gTnVtYmVycyBhcmUgKy8tMSBzbyB0aGF0IG92ZXJsYXkgZWRnZXMgZG9uJ3QgZ2V0IGJsdXJyeS5cbiAgICAgICAgY3R4Lm1vdmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbM10gKyAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVszXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICAvLyBJbm5lciByZWN0YW5nbGVcbiAgICAgICAgY3R4Lm1vdmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb29yZGluYXRlc1xuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHJldHVybnMge2Nyb3B6b25lQ29vcmRpbmF0ZXN9IC0ge0BsaW5rIGNyb3B6b25lQ29vcmRpbmF0ZXN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY2VpbCA9IE1hdGguY2VpbCxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSBoZWlnaHQgLyAyLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIGNhbnZhc0VsID0gY3R4LmNhbnZhczsgLy8gY2FudmFzIGVsZW1lbnQsIG5vdCBmYWJyaWMgb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGggKyBsZWZ0KSwgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MFxuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDFcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGgsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgyXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoICsgKGNhbnZhc0VsLndpZHRoIC0gbGVmdCAtIHdpZHRoKSAvLyB4M1xuICAgICAgICAgICAgXSwgY2VpbCksXG4gICAgICAgICAgICB5OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCArIHRvcCksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkwXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTFcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MlxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQgKyAoY2FudmFzRWwuaGVpZ2h0IC0gdG9wIC0gaGVpZ2h0KSAgIC8vIHkzXG4gICAgICAgICAgICBdLCBjZWlsKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdHJva2UgYm9yZGVyXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBzdHJva2VTdHlsZSAtIFN0cm9rZS1zdHlsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaFdpZHRoIC0gRGFzaCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbGluZURhc2hPZmZzZXRdIC0gRGFzaCBvZmZzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zdHJva2VCb3JkZXI6IGZ1bmN0aW9uKGN0eCwgc3Ryb2tlU3R5bGUsIGxpbmVEYXNoV2lkdGgsIGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgIHZhciBoYWxmV2lkdGggPSB0aGlzLmdldFdpZHRoKCkgLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgICBpZiAoY3R4LnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBjdHguc2V0TGluZURhc2goW2xpbmVEYXNoV2lkdGgsIGxpbmVEYXNoV2lkdGhdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgICAgIGN0eC5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW92aW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3Zpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgbWF4TGVmdCA9IGNhbnZhcy5nZXRXaWR0aCgpIC0gd2lkdGgsXG4gICAgICAgICAgICBtYXhUb3AgPSBjYW52YXMuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5zZXRMZWZ0KGNsYW1wKGxlZnQsIDAsIG1heExlZnQpKTtcbiAgICAgICAgdGhpcy5zZXRUb3AoY2xhbXAodG9wLCAwLCBtYXhUb3ApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TY2FsaW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHt7ZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU2NhbGluZzogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBwb2ludGVyID0gdGhpcy5jYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRoaXMuX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXIpO1xuXG4gICAgICAgIC8vIE9uIHNjYWxpbmcgY3JvcHpvbmUsXG4gICAgICAgIC8vIGNoYW5nZSByZWFsIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGZpeCBzY2FsZUZhY3RvciB0byAxXG4gICAgICAgIHRoaXMuc2NhbGUoMSkuc2V0KHNldHRpbmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsZWQgc2l6ZSBmcm9tIG1vdXNlIHBvaW50ZXIgd2l0aCBzZWxlY3RlZCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IHBvaW50ZXIgLSBNb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEhhdmluZyBsZWZ0IG9yKGFuZCkgdG9wIG9yKGFuZCkgd2lkdGggb3IoYW5kKSBoZWlnaHQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHBvaW50ZXIpIHtcbiAgICAgICAgdmFyIHBvaW50ZXJYID0gcG9pbnRlci54LFxuICAgICAgICAgICAgcG9pbnRlclkgPSBwb2ludGVyLnksXG4gICAgICAgICAgICB0bFNjYWxpbmdTaXplID0gdGhpcy5fY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSksXG4gICAgICAgICAgICBiclNjYWxpbmdTaXplID0gdGhpcy5fY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEB0b2RvOiDsnbzrsJgg6rCd7LK07JeQ7IScIHNoaWZ0IOyhsO2Vqe2CpOulvCDriITrpbTrqbQgZnJlZSBzaXplIHNjYWxpbmfsnbQg65CoIC0tPiDtmZXsnbjtlbTrs7zqsoNcbiAgICAgICAgICogICAgICBjYW52YXMuY2xhc3MuanMgLy8gX3NjYWxlT2JqZWN0OiBmdW5jdGlvbiguLi4pey4uLn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2NhbGluZ1NldHRpbmdzKHRsU2NhbGluZ1NpemUsIGJyU2NhbGluZ1NpemUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZShwb3NpdGlvbiArIGRpbWVuc2lvbikgZnJvbSBsZWZ0LXRvcCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRoaXMuZ2V0SGVpZ2h0KCkgKyB0aGlzLnRvcCxcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5nZXRXaWR0aCgpICsgdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gY2xhbXAoeSwgMCwgYm90dG9tIC0gMSksICAvLyAwIDw9IHRvcCA8PSAoYm90dG9tIC0gMSlcbiAgICAgICAgICAgIGxlZnQgPSBjbGFtcCh4LCAwLCByaWdodCAtIDEpOyAgLy8gMCA8PSBsZWZ0IDw9IChyaWdodCAtIDEpXG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiVG9wLUxlZnQgY29ybmVyXCI6IEl0IGZpeGVzIHJpZ2h0IGFuZCBib3R0b20gY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiByaWdodCAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdHRvbSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZSBmcm9tIHJpZ2h0LWJvdHRvbSBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIG1heFggPSBjYW52YXMud2lkdGgsXG4gICAgICAgICAgICBtYXhZID0gY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSB0aGlzLnRvcDtcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJCb3R0b20tUmlnaHQgY29ybmVyXCI6IEl0IGZpeGVzIGxlZnQgYW5kIHRvcCBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIChsZWZ0ICsgMSksIG1heFgpIC0gbGVmdCwgICAgLy8gKHdpZHRoID0geCAtIGxlZnQpLCAobGVmdCArIDEgPD0geCA8PSBtYXhYKVxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCAodG9wICsgMSksIG1heFkpIC0gdG9wICAgICAgLy8gKGhlaWdodCA9IHkgLSB0b3ApLCAodG9wICsgMSA8PSB5IDw9IG1heFkpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSovXG4gICAgLyoqXG4gICAgICogTWFrZSBzY2FsaW5nIHNldHRpbmdzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0bCAtIFRvcC1MZWZ0IHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJyIC0gQm90dG9tLVJpZ2h0IHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiA/bnVtYmVyLCBoZWlnaHQ6ID9udW1iZXIsIGxlZnQ6ID9udW1iZXIsIHRvcDogP251bWJlcn19IFBvc2l0aW9uIHNldHRpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2NhbGluZ1NldHRpbmdzOiBmdW5jdGlvbih0bCwgYnIpIHtcbiAgICAgICAgdmFyIHRsV2lkdGggPSB0bC53aWR0aCxcbiAgICAgICAgICAgIHRsSGVpZ2h0ID0gdGwuaGVpZ2h0LFxuICAgICAgICAgICAgYnJIZWlnaHQgPSBici5oZWlnaHQsXG4gICAgICAgICAgICBicldpZHRoID0gYnIud2lkdGgsXG4gICAgICAgICAgICB0bExlZnQgPSB0bC5sZWZ0LFxuICAgICAgICAgICAgdGxUb3AgPSB0bC50b3AsXG4gICAgICAgICAgICBzZXR0aW5ncztcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuX19jb3JuZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0bDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gYnI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1RPUDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfSwgLyplc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSB3aGV0aGVyIHRoaXMgY3JvcHpvbmUgaXMgdmFsaWRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMubGVmdCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLnRvcCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLndpZHRoID4gMCAmJlxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPiAwXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHpvbmU7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb21tYW5kIGZhY3RvcnlcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tbWFuZCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21tYW5kJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBjb21wb25lbnROYW1lcyA9IGNvbnN0cy5jb21wb25lbnROYW1lcztcbnZhciBjb21tYW5kTmFtZXMgPSBjb25zdHMuY29tbWFuZE5hbWVzO1xudmFyIGNyZWF0b3JzID0ge307XG5cbnZhciBNQUlOID0gY29tcG9uZW50TmFtZXMuTUFJTjtcbnZhciBJTUFHRV9MT0FERVIgPSBjb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVI7XG52YXIgRkxJUCA9IGNvbXBvbmVudE5hbWVzLkZMSVA7XG52YXIgUk9UQVRJT04gPSBjb21wb25lbnROYW1lcy5ST1RBVElPTjtcblxuLyoqXG4gKiBTZXQgbWFwcGluZyBjcmVhdG9yc1xuICovXG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuTE9BRF9JTUFHRV0gPSBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkZMSVBfSU1BR0VdID0gY3JlYXRlRmxpcEltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5ST1RBVEVfSU1BR0VdID0gY3JlYXRlUm90YXRpb25JbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQ0xFQVJfT0JKRUNUU10gPSBjcmVhdGVDbGVhckNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQUREX09CSkVDVF0gPSBjcmVhdGVBZGRPYmplY3RDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLlJFTU9WRV9PQkpFQ1RdID0gY3JlYXRlUmVtb3ZlQ29tbWFuZDtcblxuLyoqXG4gKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iamVjdCAtIEZhYnJpYyBvYmplY3RcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVBZGRPYmplY3RDb21tYW5kKG9iamVjdCkge1xuICAgIHR1aS51dGlsLnN0YW1wKG9iamVjdCk7XG5cbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAoIWNhbnZhcy5jb250YWlucyhvYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmFkZChvYmplY3QpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvYmplY3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKGNhbnZhcy5jb250YWlucyhvYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLnJlbW92ZShvYmplY3QpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvYmplY3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBJbWFnZSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWJyaWMuSW1hZ2V9IGltZyAtIEltYWdlKG9yIHVybClcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBsb2FkZXIuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB7XG4gICAgICAgICAgICAgICAgcHJldk5hbWU6IGxvYWRlci5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgICAgICBwcmV2SW1hZ2U6IGxvYWRlci5nZXRDYW52YXNJbWFnZSgpLFxuICAgICAgICAgICAgICAgIC8vIFNsaWNlOiBcImNhbnZhcy5jbGVhcigpXCIgY2xlYXJzIHRoZSBvYmplY3RzIGFycmF5LCBTbyBzaGFsbG93IGNvcHkgdGhlIGFycmF5XG4gICAgICAgICAgICAgICAgb2JqZWN0czogY2FudmFzLmdldE9iamVjdHMoKS5zbGljZSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChpbWFnZU5hbWUsIGltZyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gbG9hZGVyLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcblxuICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG4gICAgICAgICAgICBjYW52YXMuYWRkLmFwcGx5KGNhbnZhcywgc3RvcmUub2JqZWN0cyk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChzdG9yZS5wcmV2TmFtZSwgc3RvcmUucHJldkltYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAqIEByZXR1cm5zIHskLkRlZmVycmVkfVxuICovXG5mdW5jdGlvbiBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kKHR5cGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gZmxpcENvbXAuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZsaXBDb21wW3R5cGVdKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmbGlwQ29tcCA9IGNvbXBNYXBbRkxJUF07XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcC5zZXQodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdyb3RhdGUnIG9yICdzZXRBbmdsZSdcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGFuZ2xlIHZhbHVlIChkZWdyZWUpXG4gKiBAcmV0dXJucyB7JC5EZWZlcnJlZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUm90YXRpb25JbWFnZUNvbW1hbmQodHlwZSwgYW5nbGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSByb3RhdGlvbkNvbXAuZ2V0Q3VycmVudEFuZ2xlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXBbdHlwZV0oYW5nbGUpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXAuc2V0QW5nbGUodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDbGVhciBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2xlYXJDb21tYW5kKCkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIC8vIFNsaWNlOiBcImNhbnZhcy5jbGVhcigpXCIgY2xlYXJzIHRoZSBvYmplY3RzIGFycmF5LCBTbyBzaGFsbG93IGNvcHkgdGhlIGFycmF5XG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gY2FudmFzLmdldE9iamVjdHMoKS5zbGljZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZC5hcHBseShjYW52YXMsIHRoaXMuc3RvcmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIFJlbW92ZSBjb21tYW5kXG4gKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iaiAtIE9iamVjdCB0byByZW1vdmVcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVSZW1vdmVDb21tYW5kKG9iaikge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmIChjYW52YXMuY29udGFpbnMob2JqKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSBvYmo7XG4gICAgICAgICAgICAgICAgb2JqLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKGNhbnZhcy5jb250YWlucyh0aGlzLnN0b3JlKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQodGhpcy5zdG9yZSk7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGNvbW1hbmRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tbWFuZCBuYW1lXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBBcmd1bWVudHMgZm9yIGNyZWF0aW5nIGNvbW1hbmRcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGUobmFtZSwgYXJncykge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgcmV0dXJuIGNyZWF0b3JzW25hbWVdLmFwcGx5KG51bGwsIGFyZ3MpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNyZWF0ZTogY3JlYXRlXG59O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgRXJyb3ItbWVzc2FnZSBmYWN0b3J5XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGtleU1pcnJvciA9IHJlcXVpcmUoJy4uL3V0aWwnKS5rZXlNaXJyb3I7XG5cbnZhciB0eXBlcyA9IGtleU1pcnJvcihcbiAgICAnVU5fSU1QTEVNRU5UQVRJT04nLFxuICAgICdOT19DT01QT05FTlRfTkFNRSdcbik7XG5cbnZhciBtZXNzYWdlcyA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogJ1Nob3VsZCBpbXBsZW1lbnQgYSBtZXRob2Q6ICcsXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6ICdTaG91bGQgc2V0IGEgY29tcG9uZW50IG5hbWUnXG59O1xuXG52YXIgbWFwID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiBmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5VTl9JTVBMRU1FTlRBVElPTiArIG1ldGhvZE5hbWU7XG4gICAgfSxcbiAgICBOT19DT01QT05FTlRfTkFNRTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5OT19DT01QT05FTlRfTkFNRTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0eXBlczogdHVpLnV0aWwuZXh0ZW5kKHt9LCB0eXBlcyksXG5cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGZ1bmM7XG5cbiAgICAgICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZnVuYyA9IG1hcFt0eXBlXTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFyZ3VtZW50cyk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UtZWRpdG9yIGFwcGxpY2F0aW9uIGNsYXNzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIEludm9rZXIgPSByZXF1aXJlKCcuL2ludm9rZXInKTtcbnZhciBjb21tYW5kRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yeS9jb21tYW5kJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKTtcblxudmFyIGV2ZW50cyA9IGNvbnN0cy5ldmVudE5hbWVzO1xudmFyIGNvbW1hbmRzID0gY29uc3RzLmNvbW1hbmROYW1lcztcbnZhciBjb21wTGlzdCA9IGNvbnN0cy5jb21wb25lbnROYW1lcztcblxuLyoqXG4gKiBJbWFnZSBlZGl0b3JcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uXSAtIENhbnZhcyBtYXggd2lkdGggJiBoZWlnaHQgb2YgY3NzXG4gKiAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbi5jc3NNYXhXaWR0aCAtIENhbnZhcyBjc3MtbWF4LXdpZHRoXG4gKiAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbi5jc3NNYXhIZWlnaHQgLSBDYW52YXMgY3NzLW1heC1oZWlnaHRcbiAqL1xudmFyIEltYWdlRWRpdG9yID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbWFnZUVkaXRvci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCwgb3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9rZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0ludm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyID0gbmV3IEludm9rZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljLUNhbnZhcyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNhbnZhc31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fc2V0Q2FudmFzKGNhbnZhc0VsZW1lbnQsIG9wdGlvbi5jc3NNYXhXaWR0aCwgb3B0aW9uLmNzc01heEhlaWdodCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaEludm9rZXJFdmVudHMoKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoQ2FudmFzRXZlbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBpbnZva2VyIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEludm9rZXJFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgUFVTSF9VTkRPX1NUQUNLID0gZXZlbnRzLlBVU0hfVU5ET19TVEFDSztcbiAgICAgICAgdmFyIFBVU0hfUkVET19TVEFDSyA9IGV2ZW50cy5QVVNIX1JFRE9fU1RBQ0s7XG4gICAgICAgIHZhciBFTVBUWV9VTkRPX1NUQUNLID0gZXZlbnRzLkVNUFRZX1VORE9fU1RBQ0s7XG4gICAgICAgIHZhciBFTVBUWV9SRURPX1NUQUNLID0gZXZlbnRzLkVNUFRZX1JFRE9fU1RBQ0s7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3B1c2hVbmRvU3RhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oUFVTSF9VTkRPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgUFVTSF9VTkRPX1NUQUNLKSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNwdXNoUmVkb1N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKFBVU0hfUkVET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIFBVU0hfUkVET19TVEFDSykpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjZW1wdHlVbmRvU3RhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oRU1QVFlfVU5ET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIEVNUFRZX1VORE9fU1RBQ0spKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VtcHR5UmVkb1N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKEVNUFRZX1JFRE9fU1RBQ0ssICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBFTVBUWV9SRURPX1NUQUNLKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBjYW52YXMgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ2FudmFzRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLm9uKHtcbiAgICAgICAgICAgICdwYXRoOmNyZWF0ZWQnOiAkLnByb3h5KHRoaXMuX29uUGF0aENyZWF0ZWQsIHRoaXMpLFxuICAgICAgICAgICAgJ29iamVjdDphZGRlZCc6ICQucHJveHkoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIHZhciBjb21tYW5kO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0dWkudXRpbC5oYXNTdGFtcChvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuQUREX09CSkVDVCwgb2JqKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW52b2tlci5wdXNoVW5kb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2FkZE9iamVjdFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZmFicmljLk9iamVjdH0gb2JqIC0gaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbFxuICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2FkZE9iamVjdCcsIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhvYmopO1xuICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShldmVudHMuQUREX09CSkVDVCwgb2JqKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLFxuICAgICAgICAgICAgJ29iamVjdDpyZW1vdmVkJzogJC5wcm94eShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEBhcGlcbiAgICAgICAgICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjcmVtb3ZlT2JqZWN0XG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fSBvYmogLSBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLk9iamVjdC5odG1sXG4gICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAgKiBpbWFnZUVkaXRvci5vbigncmVtb3ZlT2JqZWN0JywgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5SRU1PVkVfT0JKRUNULCBldmVudC50YXJnZXQpO1xuICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50TGlzdGVuZXIgLSBcInBhdGg6Y3JlYXRlZFwiXG4gICAgICogIC0gRXZlbnRzOjogXCJvYmplY3Q6YWRkZWRcIiAtPiBcInBhdGg6Y3JlYXRlZFwiXG4gICAgICogQHBhcmFtIHt7cGF0aDogZmFicmljLlBhdGh9fSBvYmogLSBQYXRoIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uUGF0aENyZWF0ZWQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgcGF0aCA9IG9iai5wYXRoO1xuXG4gICAgICAgIHBhdGguc2V0KHtcbiAgICAgICAgICAgIHJvdGF0aW5nUG9pbnRPZmZzZXQ6IDMwLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZWQnLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnRDb3JuZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGNvcm5lckNvbG9yOiAnZ3JlZW4nLFxuICAgICAgICAgICAgY29ybmVyU2l6ZTogNlxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY3NzTWF4V2lkdGggLSBDYW52YXMgY3NzIG1heCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjc3NNYXhIZWlnaHQgLSBDYW52YXMgY3NzIG1heCBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDYW52YXM6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIGNzc01heFdpZHRoLCBjc3NNYXhIZWlnaHQpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQ7XG5cbiAgICAgICAgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2dldE1haW5Db21wb25lbnQoKTtcbiAgICAgICAgbWFpbkNvbXBvbmVudC5zZXRDYW52YXNFbGVtZW50KGNhbnZhc0VsZW1lbnQpO1xuICAgICAgICBtYWluQ29tcG9uZW50LnNldENzc01heERpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogY3NzTWF4V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNzc01heEhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY2FudmFzID0gbWFpbkNvbXBvbmVudC5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBtYWluIGNvbXBvbmVudFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9IE1haW4gY29tcG9uZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TWFpbkNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuTUFJTik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZXIuZ2V0Q29tcG9uZW50KG5hbWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgb2JqZWN0c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmNsZWFyKCk7XG4gICAgICovXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5DTEVBUl9PQkpFQ1RTKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5DTEVBUl9PQkpFQ1RTKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjY2xlYXJPYmplY3RzXG4gICAgICAgICAqL1xuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGN1cnJlbnQgYWN0aW9uICYgRGVhY3RpdmF0ZVxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0RnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVpZHRvci5lbmRBbGwoKTsgLy8gPT09IGltYWdlRWlkdG9yLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICpcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kQWxsKCk7IC8vID09PSBpbWFnZUVpZHRvci5lbmRDcm9wcGluZygpO1xuICAgICAqL1xuICAgIGVuZEFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kRnJlZURyYXdpbmcoKTtcbiAgICAgICAgdGhpcy5lbmRDcm9wcGluZygpO1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVhY3RpdmF0ZSBhbGwgb2JqZWN0c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgKi9cbiAgICBkZWFjdGl2YXRlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLmludm9rZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kb1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnVuZG8oKTtcbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci51bmRvKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG9cbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5yZWRvKCk7XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIucmVkbygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gZmlsZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge0ZpbGV9IGltZ0ZpbGUgLSBJbWFnZSBmaWxlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5sb2FkSW1hZ2VGcm9tRmlsZShmaWxlKTtcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tRmlsZTogZnVuY3Rpb24oaW1nRmlsZSkge1xuICAgICAgICBpZiAoIWltZ0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChcbiAgICAgICAgICAgIGltZ0ZpbGUubmFtZSxcbiAgICAgICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwoaW1nRmlsZSlcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gaW1hZ2VOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEZpbGUgdXJsXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5sb2FkSW1hZ2VGcm9tVVJMKCdsZW5hJywgJ2h0dHA6Ly91cmwvdGVzdEltYWdlLnBuZycpXG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbVVSTDogZnVuY3Rpb24oaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgfHwgIXVybCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmcsIHRoaXMpO1xuICAgICAgICBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkxPQURfSU1BR0UsIGltYWdlTmFtZSwgdXJsKTtcbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sob0ltYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjY2xlYXJJbWFnZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50cy5DTEVBUl9JTUFHRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYWZ0ZXIgaW1hZ2UgbG9hZGluZ1xuICAgICAqIEBwYXJhbSB7P2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gSW1hZ2UgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nOiBmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQgPSB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCk7XG4gICAgICAgIHZhciAkY2FudmFzRWxlbWVudCA9ICQobWFpbkNvbXBvbmVudC5nZXRDYW52YXNFbGVtZW50KCkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNsb2FkSW1hZ2VcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvblxuICAgICAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbi5vcmlnaW5hbFdpZHRoIC0gb3JpZ2luYWwgaW1hZ2Ugd2lkdGhcbiAgICAgICAgICogIEBwYXJhbSB7bnVtYmVyfSBkaW1lbnNpb24ub3JpZ2luYWxIZWlnaHQgLSBvcmlnaW5hbCBpbWFnZSBoZWlnaHRcbiAgICAgICAgICogIEBwYXJhbSB7bnVtYmVyfSBkaW1lbnNpb24uY3VycmVudFdpZHRoIC0gY3VycmVudCB3aWR0aCAoY3NzKVxuICAgICAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbi5jdXJyZW50IC0gY3VycmVudCBoZWlnaHQgKGNzcylcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2xvYWRJbWFnZScsIGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLm9yaWdpbmFsV2lkdGgpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLm9yaWdpbmFsSGVpZ2h0KTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRpbWVuc2lvbi5jdXJyZW50V2lkdGgpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLmN1cnJlbnRIZWlnaHQpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuTE9BRF9JTUFHRSwge1xuICAgICAgICAgICAgb3JpZ2luYWxXaWR0aDogb0ltYWdlLndpZHRoLFxuICAgICAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IG9JbWFnZS5oZWlnaHQsXG4gICAgICAgICAgICBjdXJyZW50V2lkdGg6ICRjYW52YXNFbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgICBjdXJyZW50SGVpZ2h0OiAkY2FudmFzRWxlbWVudC5oZWlnaHQoKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICovXG4gICAgc3RhcnRDcm9wcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuXG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIGNyb3BwZXIuc3RhcnQoKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3N0YXJ0Q3JvcHBpbmdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuU1RBUlRfQ1JPUFBJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjcm9wcGluZ1xuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0FwcGx5aW5nXSAtIFdoZXRoZXIgdGhlIGNyb3BwaW5nIGlzIGFwcGxpZWQgb3IgY2FuY2VsZWRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0Q3JvcHBpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRDcm9wcGluZyhmYWxzZSk7IC8vIGNhbmNlbCBjcm9wcGluZ1xuICAgICAqXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRDcm9wcGluZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZENyb3BwaW5nKHRydWUpOyAvLyBhcHBseSBjcm9wcGluZ1xuICAgICAqL1xuICAgIGVuZENyb3BwaW5nOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuICAgICAgICB2YXIgZGF0YSA9IGNyb3BwZXIuZW5kKGlzQXBwbHlpbmcpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNlbmRDcm9wcGluZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5FTkRfQ1JPUFBJTkcpO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGcm9tVVJMKGRhdGEuaW1hZ2VOYW1lLCBkYXRhLnVybCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mbGlwOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBldmVudHMuRkxJUF9JTUFHRSk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkZMSVBfSU1BR0UsIHR5cGUpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNmbGlwSW1hZ2VcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGZsaXBTZXR0aW5nXG4gICAgICAgICAqICBAcGFyYW0ge2Jvb2xlYW59IGZsaXBTZXR0aW5nLmZsaXBYIC0gaW1hZ2UuZmxpcFhcbiAgICAgICAgICogIEBwYXJhbSB7Ym9vbGVhbn0gZmxpcFNldHRpbmcuZmxpcFkgLSBpbWFnZS5mbGlwWVxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBpbWFnZS5hbmdsZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpbWFnZUVkaXRvci5vbignZmxpcEltYWdlJywgZnVuY3Rpb24oZmxpcFNldHRpbmcsIGFuZ2xlKSB7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZmxpcFg6ICcsIHNldHRpbmcuZmxpcFgpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZsaXBZOiAnLCBzZXR0aW5nLmZsaXBZKTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdhbmdsZTogJywgYW5nbGUpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB4XG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuZmxpcFgoKTtcbiAgICAgKi9cbiAgICBmbGlwWDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ2ZsaXBYJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeVxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmZsaXBZKCk7XG4gICAgICovXG4gICAgZmxpcFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdmbGlwWScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IucmVzZXRGbGlwKCk7XG4gICAgICovXG4gICAgcmVzZXRGbGlwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgncmVzZXQnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAncm90YXRlJyBvciAnc2V0QW5nbGUnXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gYW5nbGUgdmFsdWUgKGRlZ3JlZSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKHR5cGUsIGFuZ2xlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9ICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBldmVudHMuUk9UQVRFX0lNQUdFKTtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuUk9UQVRFX0lNQUdFLCB0eXBlLCBhbmdsZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3JvdGF0ZUltYWdlXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50QW5nbGUgLSBpbWFnZS5hbmdsZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpbWFnZUVkaXRvci5vbigncm90YXRlSW1hZ2UnLCBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2FuZ2xlOiAnLCBhbmdsZSk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgaW1hZ2VcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQWRkaXRpb25hbCBhbmdsZSB0byByb3RhdGUgaW1hZ2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnNldEFuZ2xlKDEwKTsgLy8gYW5nbGUgPSAxMFxuICAgICAqIGltYWdlRWRpdG9yLnJvdGF0ZSgxMCk7IC8vIGFuZ2xlID0gMjBcbiAgICAgKiBpbWFnZUVpZHRvci5zZXRBbmdsZSg1KTsgLy8gYW5nbGUgPSA1XG4gICAgICogaW1hZ2VFaWR0b3Iucm90YXRlKC05NSk7IC8vIGFuZ2xlID0gLTkwXG4gICAgICovXG4gICAgcm90YXRlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB0aGlzLl9yb3RhdGUoJ3JvdGF0ZScsIGFuZ2xlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGFuZ2xlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIEFuZ2xlIG9mIGltYWdlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zZXRBbmdsZSgxMCk7IC8vIGFuZ2xlID0gMTBcbiAgICAgKiBpbWFnZUVkaXRvci5yb3RhdGUoMTApOyAvLyBhbmdsZSA9IDIwXG4gICAgICogaW1hZ2VFaWR0b3Iuc2V0QW5nbGUoNSk7IC8vIGFuZ2xlID0gNVxuICAgICAqIGltYWdlRWlkdG9yLnJvdGF0ZSg1MCk7IC8vIGFuZ2xlID0gNTVcbiAgICAgKiBpbWFnZUVpZHRvci5zZXRBbmdsZSgtNDApOyAvLyBhbmdsZSA9IC00MFxuICAgICAqL1xuICAgIHNldEFuZ2xlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB0aGlzLl9yb3RhdGUoJ3NldEFuZ2xlJywgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBmcmVlLWRyYXdpbmcgbW9kZVxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGNvbG9yOiBzdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZEZyZWVEYXJ3aW5nKCk7XG4gICAgICogaW1hZ2VFaWR0b3Iuc3RhcnRGcmVlRHJhd2luZyh7XG4gICAgICogICAgIHdpZHRoOiAxMixcbiAgICAgKiAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNSknXG4gICAgICogfSk7XG4gICAgICovXG4gICAgc3RhcnRGcmVlRHJhd2luZzogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuRlJFRV9EUkFXSU5HKS5zdGFydChzZXR0aW5nKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3Ijc3RhcnRGcmVlRHJhd2luZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5TVEFSVF9GUkVFX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZHJhd2luZyBicnVzaFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGNvbG9yOiBzdHJpbmd9fSBzZXR0aW5nIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0RnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5zZXRCcnVzaCh7XG4gICAgICogICAgIHdpZHRoOiAxMixcbiAgICAgKiAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNSknXG4gICAgICogfSk7XG4gICAgICogaW1hZ2VFZGl0b3Iuc2V0QnJ1c2goe1xuICAgICAqICAgICB3aWR0aDogOCxcbiAgICAgKiAgICAgY29sb3I6ICdGRkZGRkYnXG4gICAgICogfSk7XG4gICAgICovXG4gICAgc2V0QnJ1c2g6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkZSRUVfRFJBV0lORykuc2V0QnJ1c2goc2V0dGluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBmcmVlLWRyYXdpbmcgbW9kZVxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0RnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRGcmVlRHJhd2luZygpO1xuICAgICAqL1xuICAgIGVuZEZyZWVEcmF3aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkZSRUVfRFJBV0lORykuZW5kKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VuZEZyZWVEcmF3aW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9GUkVFX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWN0aXZlIG9iamVjdFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnJlbW92ZUFjdGl2ZU9iamVjdCgpO1xuICAgICAqL1xuICAgIHJlbW92ZUFjdGl2ZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmogPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJFTU9WRV9PQkpFQ1QsIG9iaik7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSB1cmxcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1nRWwuc3JjID0gaW1hZ2VFZGl0b3IudG9EYXRhVVJMKCk7XG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbWFnZSBuYW1lXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyhpbWFnZUVkaXRvci5nZXRJbWFnZU5hbWUoKSk7XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJVbmRvU3RhY2soKTtcbiAgICAgKi9cbiAgICBjbGVhclVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJVbmRvU3RhY2soKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJSZWRvU3RhY2soKTtcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEltYWdlRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb21wb25lbnQgaW50ZXJmYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb21wb25lbnQgaW50ZXJmYWNlXG4gKiBAY2xhc3NcbiAqL1xudmFyIENvbXBvbmVudCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tcG9uZW50LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNJbWFnZShuYW1lLCBvSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzRWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNJbWFnZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgZWRpdG9yXG4gICAgICogQHJldHVybnMge0ltYWdlRWRpdG9yfVxuICAgICAqL1xuICAgIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRFZGl0b3IoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKGRpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGJhY2tzdG9yZSBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBzZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb24oZGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHBhcmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fG51bGx9IHBhcmVudCAtIFBhcmVudFxuICAgICAqL1xuICAgIHNldFBhcmVudDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudCB8fCBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiB3aXRoIHNjYWxpbmcgaW1hZ2VcbiAgICAgKi9cbiAgICBhZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKTtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuXG4gICAgICAgIHdoaWxlIChuZXh0KSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICAgICAgICAgIG5leHQgPSBjdXJyZW50LmdldFBhcmVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ29tbWFuZCBpbnRlcmZhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXJyb3JNZXNzYWdlID0gcmVxdWlyZSgnLi4vZmFjdG9yeS9lcnJvck1lc3NhZ2UnKTtcblxudmFyIGNyZWF0ZU1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UuY3JlYXRlLFxuICAgIGVycm9yVHlwZXMgPSBlcnJvck1lc3NhZ2UudHlwZXM7XG5cbi8qKlxuICogQ29tbWFuZCBjbGFzc1xuICogQGNsYXNzXG4gKiBAcGFyYW0ge3tleGVjdXRlOiBmdW5jdGlvbiwgdW5kbzogZnVuY3Rpb259fSBhY3Rpb25zIC0gQ29tbWFuZCBhY3Rpb25zXG4gKi9cbnZhciBDb21tYW5kID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDb21tYW5kLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhY3Rpb25zKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeGVjdXRlIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZSA9IGFjdGlvbnMuZXhlY3V0ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG8gPSBhY3Rpb25zLnVuZG87XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGV4ZWN1dGVDYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZUNhbGxiYWNrID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdW5kb0NhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvQ2FsbGJhY2sgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAnZXhlY3V0ZScpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBhY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoZXJyb3JUeXBlcy5VTl9JTVBMRU1FTlRBVElPTiwgJ3VuZG8nKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBleGVjdXRlIGNhbGxhYmNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBhZnRlciBleGVjdXRpb25cbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldEV4ZWN1dGVDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5leGVjdXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIHVuZG8gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGFmdGVyIHVuZG9cbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldFVuZG9DYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy51bmRvQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW52b2tlciAtIGludm9rZSBjb21tYW5kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbWFnZUxvYWRlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ltYWdlTG9hZGVyJyk7XG52YXIgQ3JvcHBlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2Nyb3BwZXInKTtcbnZhciBNYWluQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQvbWFpbicpO1xudmFyIEZsaXAgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mbGlwJyk7XG52YXIgUm90YXRpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudC9yb3RhdGlvbicpO1xudmFyIEZyZWVEcmF3aW5nID0gcmVxdWlyZSgnLi9jb21wb25lbnQvZnJlZURyYXdpbmcnKTtcbnZhciBldmVudE5hbWVzID0gcmVxdWlyZSgnLi9jb25zdHMnKS5ldmVudE5hbWVzO1xuXG4vKipcbiAqIEludm9rZXJcbiAqIEBjbGFzc1xuICovXG52YXIgSW52b2tlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW52b2tlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDdXN0b20gRXZlbnRzXG4gICAgICAgICAqIEB0eXBlIHt0dWkudXRpbC5DdXN0b21FdmVudHN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jdXN0b21FdmVudHMgPSBuZXcgdHVpLnV0aWwuQ3VzdG9tRXZlbnRzKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3VuZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWRvIHN0YWNrXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48Q29tbWFuZD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tcG9uZW50IG1hcFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jb21wb25lbnRNYXAgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTG9jay1mbGFnIGZvciBleGVjdXRpbmcgY29tbWFuZFxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzTG9ja2VkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlQ29tcG9uZW50cygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY29tcG9uZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWFpbiA9IG5ldyBNYWluQ29tcG9uZW50KCk7XG5cbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobWFpbik7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBJbWFnZUxvYWRlcihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBDcm9wcGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEZsaXAobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgUm90YXRpb24obWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRnJlZURyYXdpbmcobWFpbikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IC0gQ29tcG9uZW50IGhhbmRsaW5nIHRoZSBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZWdpc3RlcjogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudE1hcFtjb21wb25lbnQuZ2V0TmFtZSgpXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmQgZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW52b2tlRXhlY3V0aW9uOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmxvY2soKTtcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoVW5kb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQuZXhlY3V0ZUNhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVubG9jaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kIHVuZG9cbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbnZva2VVbmRvOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmxvY2soKTtcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQudW5kbyh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoUmVkb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQudW5kb0NhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVubG9jaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUuZmlyZX1cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cyAtIEFyZ3VtZW50cyB0byBmaXJlIGEgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5maXJlLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUub259XG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMgLSBBcmd1bWVudHMgdG8gYXR0YWNoIGV2ZW50c1xuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2NrIHRoaXMgaW52b2tlclxuICAgICAqL1xuICAgIGxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9jayB0aGlzIGludm9rZXJcbiAgICAgKi9cbiAgICB1bmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlRXhlY3V0aW9uKGNvbW1hbmQpXG4gICAgICAgICAgICAuZG9uZSgkLnByb3h5KHRoaXMuY2xlYXJSZWRvU3RhY2ssIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLl91bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBqcURlZmVyO1xuXG4gICAgICAgIGlmIChjb21tYW5kICYmIHRoaXMuX2lzTG9ja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2hVbmRvU3RhY2soY29tbWFuZCwgdHJ1ZSk7XG4gICAgICAgICAgICBjb21tYW5kID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX2ludm9rZVVuZG8oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5fcmVkb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCAmJiB0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoUmVkb1N0YWNrKGNvbW1hbmQsIHRydWUpO1xuICAgICAgICAgICAgY29tbWFuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW1wdHlSZWRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpxRGVmZXIgPSB0aGlzLl9pbnZva2VFeGVjdXRpb24oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1c2ggdW5kbyBzdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NpbGVudF0gLSBGaXJlIGV2ZW50IG9yIG5vdFxuICAgICAqL1xuICAgIHB1c2hVbmRvU3RhY2s6IGZ1bmN0aW9uKGNvbW1hbmQsIGlzU2lsZW50KSB7XG4gICAgICAgIHRoaXMuX3VuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIWlzU2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuUFVTSF9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXNoIHJlZG8gc3RhY2tcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaWxlbnRdIC0gRmlyZSBldmVudCBvciBub3RcbiAgICAgKi9cbiAgICBwdXNoUmVkb1N0YWNrOiBmdW5jdGlvbihjb21tYW5kLCBpc1NpbGVudCkge1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFpc1NpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLlBVU0hfUkVET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVkb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHVuZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5kb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICB0aGlzLl91bmRvU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52b2tlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWxcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluID0gTWF0aC5taW4sXG4gICAgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIENsYW1wIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluVmFsdWUgLSBNaW5pbXVtIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heFZhbHVlIC0gTWF4aW11bSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGNsYW1wZWQgdmFsdWVcbiAgICAgKi9cbiAgICBjbGFtcDogZnVuY3Rpb24odmFsdWUsIG1pblZhbHVlLCBtYXhWYWx1ZSkge1xuICAgICAgICB2YXIgdGVtcDtcbiAgICAgICAgaWYgKG1pblZhbHVlID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIHRlbXAgPSBtaW5WYWx1ZTtcbiAgICAgICAgICAgIG1pblZhbHVlID0gbWF4VmFsdWU7XG4gICAgICAgICAgICBtYXhWYWx1ZSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF4KG1pblZhbHVlLCBtaW4odmFsdWUsIG1heFZhbHVlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2Uga2V5LXZhbHVlIG9iamVjdCBmcm9tIGFyZ3VtZW50c1xuICAgICAqIEByZXR1cm5zIHtvYmplY3QuPHN0cmluZywgc3RyaW5nPn1cbiAgICAgKi9cbiAgICBrZXlNaXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb2JqID0ge307XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChhcmd1bWVudHMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgb2JqW2tleV0gPSBrZXk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxufTtcbiJdfQ==
