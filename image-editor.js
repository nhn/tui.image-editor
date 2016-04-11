(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":9}],2:[function(require,module,exports){
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
var Cropper = tui.util.defineClass(Component, /* @lends Cropper.prototype */{
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

},{"../consts":5,"../extension/cropzone":6,"../interface/component":11,"../util":13}],3:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var crossOrigin = {crossOrigin: ''};
var cssOnly = {cssOnly: true};
var backstoreOnly = {backstoreOnly: true};

/**
 * ImageLoader components
 * @param {Component} parent - parent component
 * @extends {Component}
 * @class ImageLoader
 */
var ImageLoader = tui.util.defineClass(Component, /* @lends ImageLoader.prototype */{
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
        var dfd;

        if (!imageName && !img) {
            this.getCanvas().backgroundImage = null;
            this.getCanvas().renderAll();

            dfd = $.Deferred(function() {
                self.setCanvasImage('', null);
            }).resolve();
        } else {
            dfd = this._setBackgroundImage(img).done(function(oImage) {
                self.setCanvasImage(imageName, oImage);
            });
        }

        return dfd;
    },

    /**
     * Set background image
     * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
     * @returns {*}
     * @private
     */
    _setBackgroundImage: function(img) {
        var dfd = $.Deferred();
        var canvas, self;
        if (!img) {
            return dfd.reject();
        }

        self = this;
        canvas = this.getCanvas();
        canvas.setBackgroundImage(img, function() {
            var oImage = canvas.backgroundImage;

            if (oImage.getElement()) {
                self._onSuccessImageLoad(oImage);
                dfd.resolve(oImage);
            } else {
                dfd.reject();
            }
        }, crossOrigin);

        return dfd;
    },

    /**
     * onSuccess callback
     * @param {fabric.Image} oImage - Fabric image instance
     * @private
     */
    _onSuccessImageLoad: function(oImage) {
        var canvas = this.getCanvas();
        var maxWidth = Math.min(
            Math.floor(1000),
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

},{"../consts":5,"../interface/component":11}],4:[function(require,module,exports){
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

/**
 * Main component
 * @extends Component
 * @class
 */
var Main = tui.util.defineClass(Component, {
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
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    getComponent: function(name) {
        return this.children[name];
    },

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

},{"../consts":5,"../interface/component":11}],5:[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = {
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER'
    ),

    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack'
    },

    IS_SUPPORT_FILE_API: !!(window.File && window.FileList && window.FileReader)
};

},{"./util":13}],6:[function(require,module,exports){
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
var Cropzone = fabric.util.createClass(fabric.Rect, {
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

},{"../util":13}],7:[function(require,module,exports){
'use strict';

var Command = require('../interface/command');
var componentNames = require('../consts').componentNames;

var IMAGE_LOADER = componentNames.IMAGE_LOADER;

/**
 * @param {string} imageName - Image name
 * @param {string} url - Image url
 * @returns {Command}
 */
function createLoadCommand(imageName, url) {
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

module.exports = {
    createLoadCommand: createLoadCommand
};

},{"../consts":5,"../interface/command":10}],8:[function(require,module,exports){
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

},{"../util":13}],9:[function(require,module,exports){
'use strict';

var Invoker = require('./invoker');
var commandFactory = require('./factory/command');
var consts = require('./consts');

var eventNames = consts.eventNames;
var compNames = consts.componentNames;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} canvasElement - Canvas element or selector
 */
var ImageEditor = tui.util.defineClass(/* @lends ImageEditor.prototype */{
    static: {
        eventNames: tui.util.extend({}, eventNames)
    },

    init: function(canvasElement) {
        /**
         * Inovker
         * @private
         * @type {Invoker}
         */
        this._invoker = new Invoker();

        this.setCanvasElement($(canvasElement)[0]);
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
            self.fire(eventNames.PUSH_UNDO_STACK);
            self.fire(eventNames.EMPTY_REDO_STACK);
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
                self.fire(eventNames.EMPTY_UNDO_STACK);
            }
            self.fire(eventNames.PUSH_REDO_STACK);
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
                self.fire(eventNames.EMPTY_REDO_STACK);
            }
            self.fire(eventNames.PUSH_UNDO_STACK);
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
        var callback, command;
        if (!imageName || !url) {
            return;
        }

        callback = $.proxy(this._callbackAfterImageLoading, this);
        command = commandFactory.createLoadCommand(imageName, url)
            .setExecutionCallback(callback)
            .setUndoerCallback(callback);

        this.execute(command);
    },

    /**
     * Callback after image loading
     * @param {?fabric.Image} oImage - Image instance
     */
    _callbackAfterImageLoading: function(oImage) {
        var mainComponent = this._invoker.get(compNames.MAIN);
        var $canvasElement = $(mainComponent.getCanvasElement());

        if (oImage) {
            this.fire(eventNames.LOAD_IMAGE, {
                originalWidth: oImage.width,
                originalHeight: oImage.height,
                currentWidth: $canvasElement.width(),
                currentHeight: $canvasElement.height()
            });
        } else {
            this.fire(eventNames.CLEAR_IMAGE);
        }
    },

    /**
     * Start cropping
     */
    startCropping: function() {
        var cropper = this._invoker.get(compNames.CROPPER);

        cropper.start();
        this.fire(eventNames.START_CROPPING);
    },

    /**
     * Apply cropping
     * @param {boolean} [isApplying] - Whether the cropping is applied or canceled
     */
    endCropping: function(isApplying) {
        var cropper = this._invoker.get(compNames.CROPPER);
        var data = cropper.end(isApplying);

        this.fire(eventNames.END_CROPPING);
        if (data) {
            this.loadImageFromURL(data.imageName, data.url);
        }
    },

    /**
     * Set canvas element
     * @param {jQuery|Element|string} canvasElement - Canvas element or selector
     */
    setCanvasElement: function(canvasElement) {
        this._invoker.get(compNames.MAIN).setCanvasElement(canvasElement);
    },

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL: function(type) {
        return this._invoker.get(compNames.MAIN).toDataURL(type);
    },

    /**
     * Get image name
     * @returns {string}
     */
    getImageName: function() {
        return this._invoker.get(compNames.MAIN).getImageName();
    },

    /**
     * Clear undoStack
     */
    clearUndoStack: function() {
        this._invoker.clearUndoStack();
        this.fire(eventNames.EMPTY_UNDO_STACK);
    },

    /**
     * Clear redoStack
     */
    clearRedoStack: function() {
        this._invoker.clearRedoStack();
        this.fire(eventNames.EMPTY_REDO_STACK);
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;

},{"./consts":5,"./factory/command":7,"./invoker":12}],10:[function(require,module,exports){
'use strict';

var errorMessage = require('../factory/errorMessage');

var createMessage = errorMessage.create,
    errorTypes = errorMessage.types;

/**
 * Command class
 * @class
 * @param {{name: string, execute: function, undo: function}} actions - Command actions
 */
var Command = tui.util.defineClass({
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
         * After execution callback
         * @type {null}
         */
        this.executionCallback = null;

        /**
         * After undo callback
         * @type {null}
         */
        this.undoerCallback = null;
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
     * Attach after execute callback
     * @param {function} callback - Execute callback
     * @returns {Command} this
     */
    setExecutionCallback: function(callback) {
        this.executionCallback = callback;

        return this;
    },

    /**
     * Attach after undo callback
     * @param {function} callback - Execute callback
     * @returns {Command} this
     */
    setUndoerCallback: function(callback) {
        this.undoerCallback = callback;

        return this;
    }
});

module.exports = Command;

},{"../factory/errorMessage":8}],11:[function(require,module,exports){
'use strict';

/**
 * Component interface
 * @class
 */
var Component = tui.util.defineClass({
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

var ImageLoader = require('./component/imageLoader');
var Cropper = require('./component/cropper');
var MainComponent = require('./component/main');

/**
 * Invoker
 * @class
 */
var Invoker = tui.util.defineClass(/* @lends Invoker.prototype */{
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
    get: function(name) {
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
            .done(command.executionCallback)
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
        var dfd;

        if (command) {
            dfd = $.when(command.undo(this.componentMap))
                .done(command.undoerCallback)
                .done(function() {
                    self.redoStack.push(command);
                });
        } else {
            dfd = $.Deferred().reject();
        }

        return dfd;
    },

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo: function() {
        var command = this.redoStack.pop();
        var self = this;
        var dfd;

        if (command) {
            dfd = $.when(command.execute(this.componentMap))
                .done(command.executionCallback)
                .done(function() {
                    self.undoStack.push(command);
                });
        } else {
            dfd = $.Deferred().reject();
        }

        return dfd;
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

},{"./component/cropper":2,"./component/imageLoader":3,"./component/main":4}],13:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29uc3RzLmpzIiwic3JjL2pzL2V4dGVuc2lvbi9jcm9wem9uZS5qcyIsInNyYy9qcy9mYWN0b3J5L2NvbW1hbmQuanMiLCJzcmMvanMvZmFjdG9yeS9lcnJvck1lc3NhZ2UuanMiLCJzcmMvanMvaW1hZ2VFZGl0b3IuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbW1hbmQuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbXBvbmVudC5qcyIsInNyYy9qcy9pbnZva2VyLmpzIiwic3JjL2pzL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuSW1hZ2VFZGl0b3InLCByZXF1aXJlKCcuL3NyYy9qcy9pbWFnZUVkaXRvcicpLCB0cnVlKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgQ3JvcHpvbmUgPSByZXF1aXJlKCcuLi9leHRlbnNpb24vY3JvcHpvbmUnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgTU9VU0VfTU9WRV9USFJFU0hPTEQgPSAxMDtcblxudmFyIGFicyA9IE1hdGguYWJzO1xudmFyIGNsYW1wID0gdXRpbC5jbGFtcDtcblxuLyoqXG4gKiBDcm9wcGVyIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzIENyb3BwZXJcbiAqL1xudmFyIENyb3BwZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qIEBsZW5kcyBDcm9wcGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge0Nyb3B6b25lfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFggb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WSBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRZID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogbGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBIYW5kbGVyIGhhc2ggZm9yIGZhYnJpYyBjYW52YXNcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZW1vdmU6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZU1vdmUsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2V1cDogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlVXAsIHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuQ1JPUFBFUixcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICh0aGlzLl9jcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBuZXcgQ3JvcHpvbmUoe1xuICAgICAgICAgICAgbGVmdDogLTEwLFxuICAgICAgICAgICAgdG9wOiAtMTAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3JvcHBpbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQXBwbHlpbmcgLSBJcyBhcHBseWluZyBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7P3tpbWFnZU5hbWU6IHN0cmluZywgdXJsOiBzdHJpbmd9fSBjcm9wcGVkIEltYWdlIGRhdGFcbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgZGF0YTtcblxuICAgICAgICBpZiAoIWNyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlT2JqZWN0KCk7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcblxuICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgaWYgKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9nZXRDcm9wcGVkSW1hZ2VEYXRhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vkb3duIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VEb3duOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjb29yZDtcblxuICAgICAgICBpZiAoZkV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBjb29yZCA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcblxuICAgICAgICB0aGlzLl9zdGFydFggPSBjb29yZC54O1xuICAgICAgICB0aGlzLl9zdGFydFkgPSBjb29yZC55O1xuXG4gICAgICAgIGNhbnZhcy5vbih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiB0aGlzLl9saXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZW1vdmUgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZU1vdmU6IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG4gICAgICAgIHZhciB4ID0gcG9pbnRlci54O1xuICAgICAgICB2YXIgeSA9IHBvaW50ZXIueTtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG5cbiAgICAgICAgaWYgKGFicyh4IC0gdGhpcy5fc3RhcnRYKSArIGFicyh5IC0gdGhpcy5fc3RhcnRZKSA+IE1PVVNFX01PVkVfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICBjcm9wem9uZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNyb3B6b25lLnNldCh0aGlzLl9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludCh4LCB5KSk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQoY3JvcHpvbmUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZWN0IGRpbWVuc2lvbiBzZXR0aW5nIGZyb20gQ2FudmFzLU1vdXNlLVBvc2l0aW9uKHgsIHkpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBDYW52YXMtTW91c2UtUG9zaXRpb24geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjUmVjdERpbWVuc2lvbkZyb21Qb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHdpZHRoID0gY2FudmFzLmdldFdpZHRoKCk7XG4gICAgICAgIHZhciBoZWlnaHQgPSBjYW52YXMuZ2V0SGVpZ2h0KCk7XG4gICAgICAgIHZhciBzdGFydFggPSB0aGlzLl9zdGFydFg7XG4gICAgICAgIHZhciBzdGFydFkgPSB0aGlzLl9zdGFydFk7XG4gICAgICAgIHZhciBsZWZ0ID0gY2xhbXAoeCwgMCwgc3RhcnRYKTtcbiAgICAgICAgdmFyIHRvcCA9IGNsYW1wKHksIDAsIHN0YXJ0WSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiBjbGFtcCh4LCBzdGFydFgsIHdpZHRoKSAtIGxlZnQsIC8vIChzdGFydFggPD0geChtb3VzZSkgPD0gY2FudmFzV2lkdGgpIC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogY2xhbXAoeSwgc3RhcnRZLCBoZWlnaHQpIC0gdG9wIC8vIChzdGFydFkgPD0geShtb3VzZSkgPD0gY2FudmFzSGVpZ2h0KSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNldXAgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QoY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub2ZmKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IGxpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3JvcHBlZCBpbWFnZSBkYXRhXG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q3JvcHBlZEltYWdlRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgY3JvcEluZm87XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JvcEluZm8gPSB7XG4gICAgICAgICAgICBsZWZ0OiBjcm9wem9uZS5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3A6IGNyb3B6b25lLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGg6IGNyb3B6b25lLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGNyb3B6b25lLmdldEhlaWdodCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlTmFtZTogdGhpcy5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgIHVybDogdGhpcy5nZXRDYW52YXMoKS50b0RhdGFVUkwoY3JvcEluZm8pXG4gICAgICAgIH07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGNyb3NzT3JpZ2luID0ge2Nyb3NzT3JpZ2luOiAnJ307XG52YXIgY3NzT25seSA9IHtjc3NPbmx5OiB0cnVlfTtcbnZhciBiYWNrc3RvcmVPbmx5ID0ge2JhY2tzdG9yZU9ubHk6IHRydWV9O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzIEltYWdlTG9hZGVyXG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyogQGxlbmRzIEltYWdlTG9hZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVIsXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBpbWFnZU5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfHN0cmluZyl9IGltZyAtIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGRmZDtcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7XG4gICAgICAgICAgICB0aGlzLmdldENhbnZhcygpLmJhY2tncm91bmRJbWFnZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmdldENhbnZhcygpLnJlbmRlckFsbCgpO1xuXG4gICAgICAgICAgICBkZmQgPSAkLkRlZmVycmVkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FudmFzSW1hZ2UoJycsIG51bGwpO1xuICAgICAgICAgICAgfSkucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGZkID0gdGhpcy5fc2V0QmFja2dyb3VuZEltYWdlKGltZykuZG9uZShmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldENhbnZhc0ltYWdlKGltYWdlTmFtZSwgb0ltYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRmZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGJhY2tncm91bmQgaW1hZ2VcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfFN0cmluZyl9IGltZyBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlIHRvIHNldCBiYWNrZ3JvdW5kIHRvXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0QmFja2dyb3VuZEltYWdlOiBmdW5jdGlvbihpbWcpIHtcbiAgICAgICAgdmFyIGRmZCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgdmFyIGNhbnZhcywgc2VsZjtcbiAgICAgICAgaWYgKCFpbWcpIHtcbiAgICAgICAgICAgIHJldHVybiBkZmQucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLnNldEJhY2tncm91bmRJbWFnZShpbWcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG9JbWFnZSA9IGNhbnZhcy5iYWNrZ3JvdW5kSW1hZ2U7XG5cbiAgICAgICAgICAgIGlmIChvSW1hZ2UuZ2V0RWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25TdWNjZXNzSW1hZ2VMb2FkKG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgZGZkLnJlc29sdmUob0ltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGZkLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBjcm9zc09yaWdpbik7XG5cbiAgICAgICAgcmV0dXJuIGRmZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TdWNjZXNzIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU3VjY2Vzc0ltYWdlTG9hZDogZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgbWF4V2lkdGggPSBNYXRoLm1pbihcbiAgICAgICAgICAgIE1hdGguZmxvb3IoMTAwMCksXG4gICAgICAgICAgICBvSW1hZ2Uud2lkdGhcbiAgICAgICAgKTtcblxuICAgICAgICBjYW52YXMuc2V0RGltZW5zaW9ucyh7XG4gICAgICAgICAgICBtYXJnaW46ICdhdXRvJyxcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcnLCAgLy8gTm8gaW5saW5lLWNzcyBcImhlaWdodFwiIGZvciBJRTlcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiBtYXhXaWR0aCArICdweCdcbiAgICAgICAgfSwgY3NzT25seSk7XG5cbiAgICAgICAgY2FudmFzLnNldERpbWVuc2lvbnMoe1xuICAgICAgICAgICAgd2lkdGg6IG9JbWFnZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogb0ltYWdlLmhlaWdodFxuICAgICAgICB9LCBiYWNrc3RvcmVPbmx5KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUxvYWRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBNYWluIGNvbXBvbmVudFxuICogQGV4dGVuZHMgQ29tcG9uZW50XG4gKiBAY2xhc3NcbiAqL1xudmFyIE1haW4gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIHtcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBjYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkltYWdlfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vSW1hZ2UgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbWFnZSBuYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLk1BSU4sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Q29tcG9uZW50OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkYXRhIHVybCBmcm9tIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyAmJiB0aGlzLmNhbnZhcy50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5pbWFnZU5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm9JbWFnZSA9IG9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50IHRvIGZhYnJpYy5DYW52YXNcbiAgICAgKiBAcGFyYW0ge2pRdWVyeXxFbGVtZW50fHN0cmluZ30gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCQoY2FudmFzRWxlbWVudClbMF0sIHtcbiAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAndHVpLWNvbXBvbmVudC1pbWFnZUVkaXRvci1jYW52YXNDb250YWluZXInXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9JbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmltYWdlTmFtZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb21wb25lbnROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdNQUlOJyxcbiAgICAgICAgJ0lNQUdFX0xPQURFUicsXG4gICAgICAgICdDUk9QUEVSJ1xuICAgICksXG5cbiAgICBldmVudE5hbWVzOiB7XG4gICAgICAgIExPQURfSU1BR0U6ICdsb2FkSW1hZ2UnLFxuICAgICAgICBDTEVBUl9JTUFHRTogJ2NsZWFySW1hZ2UnLFxuICAgICAgICBTVEFSVF9DUk9QUElORzogJ3N0YXJ0Q3JvcHBpbmcnLFxuICAgICAgICBFTkRfQ1JPUFBJTkc6ICdlbmRDcm9wcGluZycsXG4gICAgICAgIEVNUFRZX1JFRE9fU1RBQ0s6ICdlbXB0eVJlZG9TdGFjaycsXG4gICAgICAgIEVNUFRZX1VORE9fU1RBQ0s6ICdlbXB0eVVuZG9TdGFjaycsXG4gICAgICAgIFBVU0hfVU5ET19TVEFDSzogJ3B1c2hVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1JFRE9fU1RBQ0s6ICdwdXNoUmVkb1N0YWNrJ1xuICAgIH0sXG5cbiAgICBJU19TVVBQT1JUX0ZJTEVfQVBJOiAhISh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkZpbGVSZWFkZXIpXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2xhbXAgPSByZXF1aXJlKCcuLi91dGlsJykuY2xhbXA7XG5cbnZhciBDT1JORVJfVFlQRV9UT1BfTEVGVCA9ICd0bCc7XG52YXIgQ09STkVSX1RZUEVfVE9QX1JJR0hUID0gJ3RyJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfVE9QID0gJ210JztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfTEVGVCA9ICdtbCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUID0gJ21yJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NID0gJ21iJztcbnZhciBDT1JORVJfVFlQRV9CT1RUT01fTEVGVCA9ICdibCc7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUID0gJ2JyJztcblxuLyoqXG4gKiBDcm9wem9uZSBvYmplY3RcbiAqIElzc3VlOiBJRTcsIDgod2l0aCBleGNhbnZhcylcbiAqICAtIENyb3B6b25lIGlzIGEgYmxhY2sgem9uZSB3aXRob3V0IHRyYW5zcGFyZW5jeS5cbiAqIEBjbGFzcyBDcm9wem9uZVxuICogQGV4dGVuZHMge2ZhYnJpYy5SZWN0fVxuICovXG52YXIgQ3JvcHpvbmUgPSBmYWJyaWMudXRpbC5jcmVhdGVDbGFzcyhmYWJyaWMuUmVjdCwge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ2luaXRpYWxpemUnLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAnbW92aW5nJzogdGhpcy5fb25Nb3ZpbmcsXG4gICAgICAgICAgICAnc2NhbGluZyc6IHRoaXMuX29uU2NhbGluZ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIENyb3Atem9uZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfcmVuZGVyOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRmxpcFgsIG9yaWdpbmFsRmxpcFksXG4gICAgICAgICAgICBvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVksXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lV2lkdGggPSA3LFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZU9mZnNldCA9IDc7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdfcmVuZGVyJywgY3R4KTtcblxuICAgICAgICAvLyBDYWxjIG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIG9yaWdpbmFsRmxpcFggPSB0aGlzLmZsaXBYID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbEZsaXBZID0gdGhpcy5mbGlwWSA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVggPSBvcmlnaW5hbEZsaXBYIC8gdGhpcy5zY2FsZVg7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVZID0gb3JpZ2luYWxGbGlwWSAvIHRoaXMuc2NhbGVZO1xuXG4gICAgICAgIC8vIFNldCBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUob3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZKTtcblxuICAgICAgICAvLyBSZW5kZXIgb3V0ZXIgcmVjdFxuICAgICAgICB0aGlzLl9maWxsT3V0ZXJSZWN0KGN0eCwgJ3JnYmEoMCwgMCwgMCwgMC41NSknKTtcblxuICAgICAgICAvLyBCbGFjayBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigwLCAwLCAwKScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCk7XG5cbiAgICAgICAgLy8gV2hpdGUgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMjU1LCAyNTUsIDI1NSknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgsIGNyb3B6b25lRGFzaExpbmVPZmZzZXQpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZSgxIC8gb3JpZ2luYWxTY2FsZVgsIDEgLyBvcmlnaW5hbFNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyb3B6b25lLWNvb3JkaW5hdGVzIHdpdGggb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICpcbiAgICAgKiAgICAgeDAgICAgIHgxICAgICAgICAgeDIgICAgICB4M1xuICAgICAqICB5MCArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3wgICAgLy8gPC0tLSBcIk91dGVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTEgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wgQ3JvcHpvbmUgfC8vLy8vLy98ICAgIENyb3B6b25lIGlzIHRoZSBcIklubmVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfCAgKDAsIDApICB8Ly8vLy8vL3wgICAgQ2VudGVyIHBvaW50ICgwLCAwKVxuICAgICAqICB5MiArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICpcbiAgICAgKiBAdHlwZWRlZiB7e3g6IEFycmF5PG51bWJlcj4sIHk6IEFycmF5PG51bWJlcj59fSBjcm9wem9uZUNvb3JkaW5hdGVzXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBGaWxsIG91dGVyIHJlY3RhbmdsZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gZmlsbFN0eWxlIC0gRmlsbC1zdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbGxPdXRlclJlY3Q6IGZ1bmN0aW9uKGN0eCwgZmlsbFN0eWxlKSB7XG4gICAgICAgIHZhciBjb29yZGluYXRlcyA9IHRoaXMuX2dldENvb3JkaW5hdGVzKGN0eCksXG4gICAgICAgICAgICB4ID0gY29vcmRpbmF0ZXMueCxcbiAgICAgICAgICAgIHkgPSBjb29yZGluYXRlcy55O1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyBPdXRlciByZWN0YW5nbGVcbiAgICAgICAgLy8gTnVtYmVycyBhcmUgKy8tMSBzbyB0aGF0IG92ZXJsYXkgZWRnZXMgZG9uJ3QgZ2V0IGJsdXJyeS5cbiAgICAgICAgY3R4Lm1vdmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbM10gKyAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVszXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICAvLyBJbm5lciByZWN0YW5nbGVcbiAgICAgICAgY3R4Lm1vdmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb29yZGluYXRlc1xuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHJldHVybnMge2Nyb3B6b25lQ29vcmRpbmF0ZXN9IC0ge0BsaW5rIGNyb3B6b25lQ29vcmRpbmF0ZXN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY2VpbCA9IE1hdGguY2VpbCxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSBoZWlnaHQgLyAyLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIGNhbnZhc0VsID0gY3R4LmNhbnZhczsgLy8gY2FudmFzIGVsZW1lbnQsIG5vdCBmYWJyaWMgb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGggKyBsZWZ0KSwgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MFxuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDFcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGgsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgyXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoICsgKGNhbnZhc0VsLndpZHRoIC0gbGVmdCAtIHdpZHRoKSAvLyB4M1xuICAgICAgICAgICAgXSwgY2VpbCksXG4gICAgICAgICAgICB5OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCArIHRvcCksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkwXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTFcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MlxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQgKyAoY2FudmFzRWwuaGVpZ2h0IC0gdG9wIC0gaGVpZ2h0KSAgIC8vIHkzXG4gICAgICAgICAgICBdLCBjZWlsKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdHJva2UgYm9yZGVyXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBzdHJva2VTdHlsZSAtIFN0cm9rZS1zdHlsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaFdpZHRoIC0gRGFzaCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbGluZURhc2hPZmZzZXRdIC0gRGFzaCBvZmZzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zdHJva2VCb3JkZXI6IGZ1bmN0aW9uKGN0eCwgc3Ryb2tlU3R5bGUsIGxpbmVEYXNoV2lkdGgsIGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgIHZhciBoYWxmV2lkdGggPSB0aGlzLmdldFdpZHRoKCkgLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgICBpZiAoY3R4LnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBjdHguc2V0TGluZURhc2goW2xpbmVEYXNoV2lkdGgsIGxpbmVEYXNoV2lkdGhdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgICAgIGN0eC5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW92aW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3Zpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgbWF4TGVmdCA9IGNhbnZhcy5nZXRXaWR0aCgpIC0gd2lkdGgsXG4gICAgICAgICAgICBtYXhUb3AgPSBjYW52YXMuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5zZXRMZWZ0KGNsYW1wKGxlZnQsIDAsIG1heExlZnQpKTtcbiAgICAgICAgdGhpcy5zZXRUb3AoY2xhbXAodG9wLCAwLCBtYXhUb3ApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TY2FsaW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHt7ZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU2NhbGluZzogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBwb2ludGVyID0gdGhpcy5jYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRoaXMuX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXIpO1xuXG4gICAgICAgIC8vIE9uIHNjYWxpbmcgY3JvcHpvbmUsXG4gICAgICAgIC8vIGNoYW5nZSByZWFsIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGZpeCBzY2FsZUZhY3RvciB0byAxXG4gICAgICAgIHRoaXMuc2NhbGUoMSkuc2V0KHNldHRpbmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsZWQgc2l6ZSBmcm9tIG1vdXNlIHBvaW50ZXIgd2l0aCBzZWxlY3RlZCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IHBvaW50ZXIgLSBNb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEhhdmluZyBsZWZ0IG9yKGFuZCkgdG9wIG9yKGFuZCkgd2lkdGggb3IoYW5kKSBoZWlnaHQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHBvaW50ZXIpIHtcbiAgICAgICAgdmFyIHBvaW50ZXJYID0gcG9pbnRlci54LFxuICAgICAgICAgICAgcG9pbnRlclkgPSBwb2ludGVyLnksXG4gICAgICAgICAgICB0bFNjYWxpbmdTaXplID0gdGhpcy5fY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSksXG4gICAgICAgICAgICBiclNjYWxpbmdTaXplID0gdGhpcy5fY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEB0b2RvOiDsnbzrsJgg6rCd7LK07JeQ7IScIHNoaWZ0IOyhsO2Vqe2CpOulvCDriITrpbTrqbQgZnJlZSBzaXplIHNjYWxpbmfsnbQg65CoIC0tPiDtmZXsnbjtlbTrs7zqsoNcbiAgICAgICAgICogICAgICBjYW52YXMuY2xhc3MuanMgLy8gX3NjYWxlT2JqZWN0OiBmdW5jdGlvbiguLi4pey4uLn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2NhbGluZ1NldHRpbmdzKHRsU2NhbGluZ1NpemUsIGJyU2NhbGluZ1NpemUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZShwb3NpdGlvbiArIGRpbWVuc2lvbikgZnJvbSBsZWZ0LXRvcCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRoaXMuZ2V0SGVpZ2h0KCkgKyB0aGlzLnRvcCxcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5nZXRXaWR0aCgpICsgdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gY2xhbXAoeSwgMCwgYm90dG9tIC0gMSksICAvLyAwIDw9IHRvcCA8PSAoYm90dG9tIC0gMSlcbiAgICAgICAgICAgIGxlZnQgPSBjbGFtcCh4LCAwLCByaWdodCAtIDEpOyAgLy8gMCA8PSBsZWZ0IDw9IChyaWdodCAtIDEpXG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiVG9wLUxlZnQgY29ybmVyXCI6IEl0IGZpeGVzIHJpZ2h0IGFuZCBib3R0b20gY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiByaWdodCAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdHRvbSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZSBmcm9tIHJpZ2h0LWJvdHRvbSBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIG1heFggPSBjYW52YXMud2lkdGgsXG4gICAgICAgICAgICBtYXhZID0gY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSB0aGlzLnRvcDtcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJCb3R0b20tUmlnaHQgY29ybmVyXCI6IEl0IGZpeGVzIGxlZnQgYW5kIHRvcCBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIChsZWZ0ICsgMSksIG1heFgpIC0gbGVmdCwgICAgLy8gKHdpZHRoID0geCAtIGxlZnQpLCAobGVmdCArIDEgPD0geCA8PSBtYXhYKVxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCAodG9wICsgMSksIG1heFkpIC0gdG9wICAgICAgLy8gKGhlaWdodCA9IHkgLSB0b3ApLCAodG9wICsgMSA8PSB5IDw9IG1heFkpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSovXG4gICAgLyoqXG4gICAgICogTWFrZSBzY2FsaW5nIHNldHRpbmdzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0bCAtIFRvcC1MZWZ0IHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJyIC0gQm90dG9tLVJpZ2h0IHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiA/bnVtYmVyLCBoZWlnaHQ6ID9udW1iZXIsIGxlZnQ6ID9udW1iZXIsIHRvcDogP251bWJlcn19IFBvc2l0aW9uIHNldHRpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2NhbGluZ1NldHRpbmdzOiBmdW5jdGlvbih0bCwgYnIpIHtcbiAgICAgICAgdmFyIHRsV2lkdGggPSB0bC53aWR0aCxcbiAgICAgICAgICAgIHRsSGVpZ2h0ID0gdGwuaGVpZ2h0LFxuICAgICAgICAgICAgYnJIZWlnaHQgPSBici5oZWlnaHQsXG4gICAgICAgICAgICBicldpZHRoID0gYnIud2lkdGgsXG4gICAgICAgICAgICB0bExlZnQgPSB0bC5sZWZ0LFxuICAgICAgICAgICAgdGxUb3AgPSB0bC50b3AsXG4gICAgICAgICAgICBzZXR0aW5ncztcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuX19jb3JuZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0bDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gYnI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1RPUDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfSwgLyplc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSB3aGV0aGVyIHRoaXMgY3JvcHpvbmUgaXMgdmFsaWRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMubGVmdCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLnRvcCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLndpZHRoID4gMCAmJlxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPiAwXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHpvbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb21tYW5kID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbW1hbmQnKTtcbnZhciBjb21wb25lbnROYW1lcyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLmNvbXBvbmVudE5hbWVzO1xuXG52YXIgSU1BR0VfTE9BREVSID0gY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBJbWFnZSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gSW1hZ2UgdXJsXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9hZENvbW1hbmQoaW1hZ2VOYW1lLCB1cmwpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgICAgIHByZXZOYW1lOiBsb2FkZXIuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICAgICAgcHJldkltYWdlOiBsb2FkZXIuZ2V0Q2FudmFzSW1hZ2UoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGxvYWRlci5sb2FkKGltYWdlTmFtZSwgdXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChzdG9yZS5wcmV2TmFtZSwgc3RvcmUucHJldkltYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGVMb2FkQ29tbWFuZDogY3JlYXRlTG9hZENvbW1hbmRcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlNaXJyb3IgPSByZXF1aXJlKCcuLi91dGlsJykua2V5TWlycm9yO1xuXG52YXIgdHlwZXMgPSBrZXlNaXJyb3IoXG4gICAgJ1VOX0lNUExFTUVOVEFUSU9OJyxcbiAgICAnTk9fQ09NUE9ORU5UX05BTUUnLFxuICAgICdVTktOT1dOJ1xuKTtcblxudmFyIG1lc3NhZ2VzID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiAnU2hvdWxkIGltcGxlbWVudCBhIG1ldGhvZDogJyxcbiAgICBOT19DT01QT05FTlRfTkFNRTogJ1Nob3VsZCBzZXQgYSBjb21wb25lbnQgbmFtZScsXG4gICAgVU5LTk9XTjogJ1Vua25vd246ICdcbn07XG5cblxudmFyIG1hcCA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuVU5fSU1QTEVNRU5UQVRJT04gKyBtZXRob2ROYW1lO1xuICAgIH0sXG5cbiAgICBOT19DT01QT05FTlRfTkFNRTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5OT19DT01QT05FTlRfTkFNRTtcbiAgICB9LFxuXG4gICAgVU5LTk9XTjogZnVuY3Rpb24obXNnKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5VTktOT1dOICsgbXNnO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHR5cGVzOiB0dWkudXRpbC5leHRlbmQoe30sIHR5cGVzKSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgZnVuYztcblxuICAgICAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBmdW5jID0gbWFwW3R5cGVdIHx8IG1hcC51bmtub3duO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcblxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbnZva2VyID0gcmVxdWlyZSgnLi9pbnZva2VyJyk7XG52YXIgY29tbWFuZEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnkvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciBldmVudE5hbWVzID0gY29uc3RzLmV2ZW50TmFtZXM7XG52YXIgY29tcE5hbWVzID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xuXG4vKipcbiAqIEltYWdlIGVkaXRvclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ3xqUXVlcnl8SFRNTEVsZW1lbnR9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICovXG52YXIgSW1hZ2VFZGl0b3IgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiBAbGVuZHMgSW1hZ2VFZGl0b3IucHJvdG90eXBlICove1xuICAgIHN0YXRpYzoge1xuICAgICAgICBldmVudE5hbWVzOiB0dWkudXRpbC5leHRlbmQoe30sIGV2ZW50TmFtZXMpXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElub3ZrZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0ludm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyID0gbmV3IEludm9rZXIoKTtcblxuICAgICAgICB0aGlzLnNldENhbnZhc0VsZW1lbnQoJChjYW52YXNFbGVtZW50KVswXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBhY3Rpb25zXG4gICAgICovXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZENyb3BwaW5nKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5pbnZva2UoY29tbWFuZCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZmlyZShldmVudE5hbWVzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGludm9rZXIgPSB0aGlzLl9pbnZva2VyO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICBpbnZva2VyLnVuZG8oKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGludm9rZXIuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5maXJlKGV2ZW50TmFtZXMuRU1QVFlfVU5ET19TVEFDSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnROYW1lcy5QVVNIX1JFRE9fU1RBQ0spO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkb1xuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW52b2tlciA9IHRoaXMuX2ludm9rZXI7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGludm9rZXIucmVkbygpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW52b2tlci5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmlyZShldmVudE5hbWVzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gZmlsZVxuICAgICAqIEBwYXJhbSB7RmlsZX0gaW1nRmlsZSAtIEltYWdlIGZpbGVcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tRmlsZTogZnVuY3Rpb24oaW1nRmlsZSkge1xuICAgICAgICBpZiAoIWltZ0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChcbiAgICAgICAgICAgIGltZ0ZpbGUubmFtZSxcbiAgICAgICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwoaW1nRmlsZSlcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBpbWFnZU5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gRmlsZSB1cmxcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tVVJMOiBmdW5jdGlvbihpbWFnZU5hbWUsIHVybCkge1xuICAgICAgICB2YXIgY2FsbGJhY2ssIGNvbW1hbmQ7XG4gICAgICAgIGlmICghaW1hZ2VOYW1lIHx8ICF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLl9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nLCB0aGlzKTtcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZUxvYWRDb21tYW5kKGltYWdlTmFtZSwgdXJsKVxuICAgICAgICAgICAgLnNldEV4ZWN1dGlvbkNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9lckNhbGxiYWNrKGNhbGxiYWNrKTtcblxuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIGltYWdlIGxvYWRpbmdcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmc6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2ludm9rZXIuZ2V0KGNvbXBOYW1lcy5NQUlOKTtcbiAgICAgICAgdmFyICRjYW52YXNFbGVtZW50ID0gJChtYWluQ29tcG9uZW50LmdldENhbnZhc0VsZW1lbnQoKSk7XG5cbiAgICAgICAgaWYgKG9JbWFnZSkge1xuICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuTE9BRF9JTUFHRSwge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsV2lkdGg6IG9JbWFnZS53aWR0aCxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEhlaWdodDogb0ltYWdlLmhlaWdodCxcbiAgICAgICAgICAgICAgICBjdXJyZW50V2lkdGg6ICRjYW52YXNFbGVtZW50LndpZHRoKCksXG4gICAgICAgICAgICAgICAgY3VycmVudEhlaWdodDogJGNhbnZhc0VsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuQ0xFQVJfSU1BR0UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNyb3BwaW5nXG4gICAgICovXG4gICAgc3RhcnRDcm9wcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLkNST1BQRVIpO1xuXG4gICAgICAgIGNyb3BwZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuU1RBUlRfQ1JPUFBJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjcm9wcGluZ1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQXBwbHlpbmddIC0gV2hldGhlciB0aGUgY3JvcHBpbmcgaXMgYXBwbGllZCBvciBjYW5jZWxlZFxuICAgICAqL1xuICAgIGVuZENyb3BwaW5nOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjcm9wcGVyID0gdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLkNST1BQRVIpO1xuICAgICAgICB2YXIgZGF0YSA9IGNyb3BwZXIuZW5kKGlzQXBwbHlpbmcpO1xuXG4gICAgICAgIHRoaXMuZmlyZShldmVudE5hbWVzLkVORF9DUk9QUElORyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoZGF0YS5pbWFnZU5hbWUsIGRhdGEudXJsKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeXxFbGVtZW50fHN0cmluZ30gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICovXG4gICAgc2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9pbnZva2VyLmdldChjb21wTmFtZXMuTUFJTikuc2V0Q2FudmFzRWxlbWVudChjYW52YXNFbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGEgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZXIuZ2V0KGNvbXBOYW1lcy5NQUlOKS50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlci5nZXQoY29tcE5hbWVzLk1BSU4pLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB1bmRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJVbmRvU3RhY2soKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50TmFtZXMuRU1QVFlfVU5ET19TVEFDSyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHJlZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyUmVkb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclJlZG9TdGFjaygpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEltYWdlRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvck1lc3NhZ2UgPSByZXF1aXJlKCcuLi9mYWN0b3J5L2Vycm9yTWVzc2FnZScpO1xuXG52YXIgY3JlYXRlTWVzc2FnZSA9IGVycm9yTWVzc2FnZS5jcmVhdGUsXG4gICAgZXJyb3JUeXBlcyA9IGVycm9yTWVzc2FnZS50eXBlcztcblxuLyoqXG4gKiBDb21tYW5kIGNsYXNzXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7e25hbWU6IHN0cmluZywgZXhlY3V0ZTogZnVuY3Rpb24sIHVuZG86IGZ1bmN0aW9ufX0gYWN0aW9ucyAtIENvbW1hbmQgYWN0aW9uc1xuICovXG52YXIgQ29tbWFuZCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICBpbml0OiBmdW5jdGlvbihhY3Rpb25zKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeGVjdXRlIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZSA9IGFjdGlvbnMuZXhlY3V0ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG8gPSBhY3Rpb25zLnVuZG87XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFmdGVyIGV4ZWN1dGlvbiBjYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZnRlciB1bmRvIGNhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvZXJDYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICdleGVjdXRlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvIGFjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAndW5kbycpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFmdGVyIGV4ZWN1dGUgY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIEV4ZWN1dGUgY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldEV4ZWN1dGlvbkNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhZnRlciB1bmRvIGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBFeGVjdXRlIGNhbGxiYWNrXG4gICAgICogQHJldHVybnMge0NvbW1hbmR9IHRoaXNcbiAgICAgKi9cbiAgICBzZXRVbmRvZXJDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy51bmRvZXJDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29tcG9uZW50IGludGVyZmFjZVxuICogQGNsYXNzXG4gKi9cbnZhciBDb21wb25lbnQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7fSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBvSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzSW1hZ2UobmFtZSwgb0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjYW52YXMgZWxlbWVudCBvZiBmYWJyaWMuQ2FudmFzW1tsb3dlci1jYW52YXNdXVxuICAgICAqIEByZXR1cm5zIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhc0VsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGZhYnJpYy5DYW52YXMgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkNhbnZhc31cbiAgICAgKi9cbiAgICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjYW52YXNJbWFnZSAoZmFicmljLkltYWdlIGluc3RhbmNlKVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEltYWdlTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGltYWdlIGVkaXRvclxuICAgICAqIEByZXR1cm5zIHtJbWFnZUVkaXRvcn1cbiAgICAgKi9cbiAgICBnZXRFZGl0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0RWRpdG9yKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBjb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwYXJlbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudHxudWxsfSBwYXJlbnQgLSBQYXJlbnRcbiAgICAgKi9cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKSxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC10aGlzICovXG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjb25zaXN0ZW50LXRoaXMgKi9cblxuICAgICAgICB3aGlsZSAobmV4dCkge1xuICAgICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaW1hZ2VMb2FkZXInKTtcbnZhciBDcm9wcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvY3JvcHBlcicpO1xudmFyIE1haW5Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9tYWluJyk7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyogQGxlbmRzIEludm9rZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVkbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tcG9uZW50IG1hcFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbXBvbmVudE1hcCA9IHt9O1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNvbXBvbmVudHMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGNvbXBvbmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVDb21wb25lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1haW4gPSBuZXcgTWFpbkNvbXBvbmVudCgpO1xuXG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG1haW4pO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgSW1hZ2VMb2FkZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgQ3JvcHBlcihtYWluKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnQgLSBDb21wb25lbnQgaGFuZGxpbmcgdGhlIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRNYXBbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLmNvbXBvbmVudE1hcCkpXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGlvbkNhbGxiYWNrKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bmRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgICAgICAgICBzZWxmLmNsZWFyUmVkb1N0YWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLnVuZG9TdGFjay5wb3AoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgZGZkO1xuXG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBkZmQgPSAkLndoZW4oY29tbWFuZC51bmRvKHRoaXMuY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgICAgICAuZG9uZShjb21tYW5kLnVuZG9lckNhbGxiYWNrKVxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRmZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLnJlZG9TdGFjay5wb3AoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgZGZkO1xuXG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBkZmQgPSAkLndoZW4oY29tbWFuZC5leGVjdXRlKHRoaXMuY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGlvbkNhbGxiYWNrKVxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGZkID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRmZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID09PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgdW5kb1N0YWNrIGlzIGVtcHR5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNFbXB0eVVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51bmRvU3RhY2sgPSBbXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlZG9TdGFjayA9IFtdO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludm9rZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW4gPSBNYXRoLm1pbixcbiAgICBtYXggPSBNYXRoLm1heDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQ2xhbXAgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5WYWx1ZSAtIE1pbmltdW0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4VmFsdWUgLSBNYXhpbXVtIHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gY2xhbXBlZCB2YWx1ZVxuICAgICAqL1xuICAgIGNsYW1wOiBmdW5jdGlvbih2YWx1ZSwgbWluVmFsdWUsIG1heFZhbHVlKSB7XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICBpZiAobWluVmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgdGVtcCA9IG1pblZhbHVlO1xuICAgICAgICAgICAgbWluVmFsdWUgPSBtYXhWYWx1ZTtcbiAgICAgICAgICAgIG1heFZhbHVlID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtYXgobWluVmFsdWUsIG1pbih2YWx1ZSwgbWF4VmFsdWUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBrZXktdmFsdWUgb2JqZWN0IGZyb20gYXJndW1lbnRzXG4gICAgICogQHJldHVybnMge29iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGtleU1pcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmogPSB7fTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IGtleTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG59O1xuIl19
