(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.ImageEditor', require('./src/js/imageEditor'), true);

},{"./src/js/imageEditor":17}],2:[function(require,module,exports){
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
var keyCodes = consts.keyCodes;

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
         * State whether shortcut key is pressed or not
         * @type {boolean}
         * @private
         */
        this._withShiftKey = false;

        /**
         * Listeners
         * @type {object.<string, function>}
         * @private
         */
        this._listeners = {
            keydown: $.proxy(this._onKeyDown, this),
            keyup: $.proxy(this._onKeyUp, this),
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

        fabric.util.addListener(document, 'keydown', this._listeners.keydown);
        fabric.util.addListener(document, 'keyup', this._listeners.keyup);
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

        fabric.util.removeListener(document, 'keydown', this._listeners.keydown);
        fabric.util.removeListener(document, 'keyup', this._listeners.keyup);

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
        var canvasWidth = canvas.getWidth();
        var canvasHeight = canvas.getHeight();
        var startX = this._startX;
        var startY = this._startY;
        var left = clamp(x, 0, startX);
        var top = clamp(y, 0, startY);
        var width = clamp(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
        var height = clamp(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

        if (this._withShiftKey) { // make fixed ratio cropzone
            if (width > height) {
                height = width;
            } else if (height > width) {
                width = height;
            }

            if (startX >= x) {
                left = startX - width;
            }

            if (startY >= y) {
                top = startY - height;
            }
        }

        return {
            left: left,
            top: top,
            width: width,
            height: height
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
    },

    /**
     * Keydown event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown: function(e) {
        if (e.keyCode === keyCodes.SHIFT) {
            this._withShiftKey = true;
        }
    },

    /**
     * Keyup event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyUp: function(e) {
        if (e.keyCode === keyCodes.SHIFT) {
            this._withShiftKey = false;
        }
    }
});

module.exports = Cropper;

},{"../consts":12,"../extension/cropzone":13,"../interface/component":20,"../util":22}],3:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add filter module
 */
'use strict';

var Component = require('../interface/component');
var Mask = require('../extension/mask');
var consts = require('../consts');

/**
 * Filter
 * @class Filter
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Filter = tui.util.defineClass(Component, /** @lends Filter.prototype */{
    init: function(parent) {
        this.setParent(parent);
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.FILTER,

    /**
     * Add filter to source image (a specific filter is added on fabric.js)
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {jQuery.Deferred}
     */
    add: function(type, options) {
        var jqDefer = $.Deferred();
        var filter = this._createFilter(type, options);
        var sourceImg = this._getSourceImage();
        var canvas = this.getCanvas();

        if (!filter) {
            jqDefer.reject();
        }

        sourceImg.filters.push(filter);

        this._apply(sourceImg, function() {
            canvas.renderAll();
            jqDefer.resolve(type, 'add');
        });

        return jqDefer;
    },

    /**
     * Remove filter to source image
     * @param {string} type - Filter type
     * @returns {jQuery.Deferred}
     */
    remove: function(type) {
        var jqDefer = $.Deferred();
        var sourceImg = this._getSourceImage();
        var canvas = this.getCanvas();

        if (!sourceImg.filters.length) {
            jqDefer.reject();
        }

        sourceImg.filters.pop();

        this._apply(sourceImg, function() {
            canvas.renderAll();
            jqDefer.resolve(type, 'remove');
        });

        return jqDefer;
    },

    /**
     * Apply filter
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {function} callback - Executed function after applying filter
     * @private
     */
    _apply: function(sourceImg, callback) {
        sourceImg.applyFilters(callback);
    },

    /**
     * Get source image on canvas
     * @returns {fabric.Image} Current source image on canvas
     * @private
     */
    _getSourceImage: function() {
        return this.getCanvasImage();
    },

    /**
     * Create filter instance
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {object} Fabric object of filter
     * @private
     */
    _createFilter: function(type, options) {
        var filterObj;

        switch (type) {
            case 'mask':
                filterObj = new Mask(options);
                break;
            default:
                filterObj = null;
        }

        return filterObj;
    }
});

module.exports = Filter;

},{"../consts":12,"../extension/mask":14,"../interface/component":20}],4:[function(require,module,exports){
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

},{"../consts":12,"../interface/Component":18}],5:[function(require,module,exports){
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

},{"../consts":12,"../interface/Component":18}],6:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add icon module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var pathMap = {
    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' +
            'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
};

/**
 * Icon
 * @class Icon
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Icon = tui.util.defineClass(Component, /** @lends Icon.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Default icon color
         * @type {string}
         */
        this._oColor = '#000000';

        /**
         * Path value of each icon type
         * @type {object}
         */
        this._pathMap = pathMap;
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.ICON,

    /**
     * Add icon
     * @param {string} type - Icon type
     */
    add: function(type) {
        var canvas = this.getCanvas();
        var centerPos = this.getCanvasImage().getCenterPoint();
        var path = this._pathMap[type];
        var icon;

        if (!path) {
            return;
        }

        icon = this._createIcon(path);

        icon.set(consts.fObjectOptions.SELECTION_STYLE);
        icon.set({
            fill: this._oColor,
            left: centerPos.x,
            top: centerPos.y,
            type: 'icon'
        });

        canvas.add(icon).setActiveObject(icon);
    },

    /**
     * Register icon paths
     * @param {{key: string, value: string}} pathInfos - Path infos
     */
    registerPaths: function(pathInfos) {
        tui.util.forEach(pathInfos, function(path, type) {
            this._pathMap[type] = path;
        }, this);
    },

    /**
     * Set icon object color
     * @param {strign} color - Color to set
     * @param {fabric.Path}[obj] - Current activated path object
     */
    setColor: function(color, obj) {
        this._oColor = color;

        if (obj && obj.get('type') === 'icon') {
            obj.setFill(this._oColor);
            this.getCanvas().renderAll();
        }
    },

    /**
     * Create icon object
     * @param {string} path - Path value to create icon
     * @returns {fabric.Path} Path object
     */
    _createIcon: function(path) {
        return new fabric.Path(path);
    }
});

module.exports = Icon;

},{"../consts":12,"../interface/component":20}],7:[function(require,module,exports){
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

},{"../consts":12,"../interface/component":20}],8:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Free drawing module, Set brush
 */
'use strict';

var Component = require('../interface/Component');
var consts = require('../consts');

/**
 * Line
 * @class Line
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Line = tui.util.defineClass(Component, /** @lends FreeDrawing.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Brush width
         * @type {number}
         * @private
         */
        this._width = 12;

        /**
         * fabric.Color instance for brush color
         * @type {fabric.Color}
         * @private
         */
        this._oColor = new fabric.Color('rgba(0, 0, 0, 0.5)');

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
    name: consts.componentNames.LINE,

    /**
     * Start drawing line mode
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    start: function(setting) {
        var canvas = this.getCanvas();

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;

        this.setBrush(setting);

        canvas.forEachObject(function(obj) {
            obj.set({
                evented: false
            });
        });

        canvas.on({
            'mouse:down': this._listeners.mousedown
        });
    },

    /**
     * Set brush
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    setBrush: function(setting) {
        var brush = this.getCanvas().freeDrawingBrush;

        setting = setting || {};
        this._width = setting.width || this._width;

        if (setting.color) {
            this._oColor = new fabric.Color(setting.color);
        }
        brush.width = this._width;
        brush.color = this._oColor.toRgba();
    },

    /**
     * End drawing line mode
     */
    end: function() {
        var canvas = this.getCanvas();

        canvas.defaultCursor = 'default';
        canvas.selection = true;

        canvas.forEachObject(function(obj) {
            obj.set({
                evented: true
            });
        });

        canvas.off('mouse:down', this._listeners.mousedown);
    },

    /**
     * Mousedown event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];

        this._line = new fabric.Line(points, {
            stroke: this._oColor.toRgba(),
            strokeWidth: this._width,
            evented: false
        });

        this._line.set(consts.fObjectOptions.SELECTION_STYLE);

        canvas.add(this._line);

        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    },

    /**
     * Mousemove event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseMove: function(fEvent) {
        var canvas = this.getCanvas();
        var pointer = canvas.getPointer(fEvent.e);

        this._line.set({
            x2: pointer.x,
            y2: pointer.y
        });

        this._line.setCoords();

        canvas.renderAll();
    },

    /**
     * Mouseup event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseUp: function() {
        var canvas = this.getCanvas();

        this._line = null;

        canvas.off({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }
});

module.exports = Line;

},{"../consts":12,"../interface/Component":18}],9:[function(require,module,exports){
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

},{"../consts":12,"../interface/component":20}],10:[function(require,module,exports){
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

},{"../consts":12,"../interface/Component":18}],11:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Text module
 */
'use strict';

var Component = require('../interface/component');
var consts = require('../consts');

var defaultStyles = {
    fill: '#000000',
    left: 0,
    top: 0,
    padding: 20
};
var resetStyles = {
    fill: '#000000',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'left',
    textDecoraiton: ''
};

/**
 * Text
 * @class Text
 * @param {Component} parent - parent component
 * @extends {Component}
 */
var Text = tui.util.defineClass(Component, /** @lends Text.prototype */{
    init: function(parent) {
        this.setParent(parent);

        /**
         * Default text style
         * @type {object}
         */
        this._defaultStyles = defaultStyles;
    },

    /**
     * Component name
     * @type {string}
     */
    name: consts.componentNames.TEXT,

    /**
     * Add new text on canvas image
     * @param {string} text - Initial input text
     * @param {object} options - Options for generating text
     *     @param {object} [options.styles] Initial styles
     *         @param {string} [options.styles.fill] Color
     *         @param {string} [options.styles.fontFamily] Font type for text
     *         @param {number} [options.styles.fontSize] Size
     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [options.position] - Initial position
     */
    add: function(text, options) {
        var canvas = this.getCanvas();
        var styles = this._defaultStyles;
        var newText;

        if (options.styles) {
            styles = tui.util.extend(options.styles, styles);
        }

        this._setInitPos(options.position);

        newText = new fabric.Text(text, styles);

        newText.set(consts.fObjectOptions.SELECTION_STYLE);

        canvas.add(newText);

        if (!canvas.getActiveObject()) {
            canvas.setActiveObject(newText);
        }
    },

    /**
     * Change text of activate object on canvas image
     * @param {object} activeObj - Current selected text object
     * @param {string} text - Chaging text
     */
    change: function(activeObj, text) {
        activeObj.set('text', text);

        this.getCanvas().renderAll();
    },

    /**
     * Set style
     * @param {object} activeObj - Current selected text object
     * @param {object} styleObj - Initial styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     */
    setStyle: function(activeObj, styleObj) {
        tui.util.forEach(styleObj, function(val, key) {
            if (activeObj[key] === val) {
                styleObj[key] = resetStyles[key] || '';
            }
        }, this);

        activeObj.set(styleObj);

        this.getCanvas().renderAll();
    },

    /**
     * Set initial position on canvas image
     * @param {{x: number, y: number}} [position] - Selected position
     */
    _setInitPos: function(position) {
        position = position || this.getCanvasImage().getCenterPoint();

        this._defaultStyles.left = position.x;
        this._defaultStyles.top = position.y;
    }
});

module.exports = Text;

},{"../consts":12,"../interface/component":20}],12:[function(require,module,exports){
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
        'FREE_DRAWING',
        'LINE',
        'TEXT',
        'ICON',
        'FILTER'
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
        'REMOVE_OBJECT',
        'APPLY_FILTER'
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
        ADJUST_OBJECT: 'adjustObject',
        START_FREE_DRAWING: 'startFreeDrawing',
        END_FREE_DRAWING: 'endFreeDrawing',
        START_LINE_DRAWING: 'startLineDrawing',
        END_LINE_DRAWING: 'endLineDrawing',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack',
        ACTIVATE_TEXT: 'activateText',
        APPLY_FILTER: 'applyFilter'
    },

    /**
     * Editor states
     * @type {Object.<string, string>}
     */
    states: util.keyMirror(
        'NORMAL',
        'CROP',
        'FREE_DRAWING',
        'LINE',
        'TEXT'
    ),

    /**
     * Shortcut key values
     * @type {Object.<string, number>}
     */
    keyCodes: {
        Z: 90,
        Y: 89,
        SHIFT: 16
    },

    /**
     * Fabric object options
     * @type {Object.<string, Object>}
     */
    fObjectOptions: {
        SELECTION_STYLE: {
            borderColor: 'red',
            cornerColor: 'green',
            cornerSize: 10,
            originX: 'center',
            originY: 'center',
            transparentCorners: false,
            rotatingPointOffset: 30
        }
    }
};

},{"./util":22}],13:[function(require,module,exports){
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

},{"../util":22}],14:[function(require,module,exports){
/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Mask extending fabric.Image.filters.Mask
 */
'use strict';

/**
 * Mask object
 * @class Mask
 * @extends {fabric.Image.filters.Mask}
 */
var Mask = fabric.util.createClass(fabric.Image.filters.Mask, /** @lends Mask.prototype */{
    /**
     * Apply filter to canvas element
     * @param {object} canvasEl - Canvas element to apply filter
     * @override
     */
    applyTo: function(canvasEl) {
        var maskCanvasEl, ctx, maskCtx, imageData;
        var width, height;

        if (!this.mask) {
            return;
        }

        width = canvasEl.width;
        height = canvasEl.height;

        maskCanvasEl = this._createCanvasOfMask(width, height);

        ctx = canvasEl.getContext('2d');
        maskCtx = maskCanvasEl.getContext('2d');

        imageData = ctx.getImageData(0, 0, width, height);

        this._drawMask(maskCtx);
        this._mapData(maskCtx, imageData, width, height);

        ctx.putImageData(imageData, 0, 0);
    },

    /**
     * Create canvas of mask image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @returns {HTMLElement} Canvas element
     * @private
     */
    _createCanvasOfMask: function(width, height) {
        var maskCanvasEl = fabric.util.createCanvasElement();

        maskCanvasEl.width = width;
        maskCanvasEl.height = height;

        return maskCanvasEl;
    },

    /**
     * Draw mask image on canvas element
     * @param {object} maskCtx - Context of mask canvas
     * @private
     */
    _drawMask: function(maskCtx) {
        var width, height, left, top;
        var mask = this.mask;

        width = mask.getWidth();
        height = mask.getHeight();
        left = mask.getLeft() - (width / 2);
        top = mask.getTop() - (height / 2);

        maskCtx.drawImage(mask.getElement(), left, top, width, height);
    },

    /**
     * Map mask image data to source image data
     * @param {object} maskCtx - Context of mask canvas
     * @param {object} imageData - Data of source image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @private
     */
    _mapData: function(maskCtx, imageData, width, height) {
        var sourceData = imageData.data;
        var maskData = maskCtx.getImageData(0, 0, width, height).data;
        var channel = this.channel;
        var i = 0;
        var len = imageData.width * imageData.height * 4;

        for (; i < len; i += 4) {
            sourceData[i + 3] = maskData[i + channel]; // adjust value of alpha data
        }
    }
});

module.exports = Mask;

},{}],15:[function(require,module,exports){
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
var FILTER = componentNames.FILTER;

/**
 * Set mapping creators
 */
creators[commandNames.LOAD_IMAGE] = createLoadImageCommand;
creators[commandNames.FLIP_IMAGE] = createFlipImageCommand;
creators[commandNames.ROTATE_IMAGE] = createRotationImageCommand;
creators[commandNames.CLEAR_OBJECTS] = createClearCommand;
creators[commandNames.ADD_OBJECT] = createAddObjectCommand;
creators[commandNames.REMOVE_OBJECT] = createRemoveCommand;
creators[commandNames.APPLY_FILTER] = createFilterCommand;

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
 * @param {fabric.Object|fabric.Group} target - Object(s) to remove
 * @returns {Command}
 */
function createRemoveCommand(target) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        execute: function(compMap) {
            var canvas = compMap[MAIN].getCanvas();
            var jqDefer = $.Deferred();
            var isValidGroup = target && target.isType('group') && !target.isEmpty();

            if (isValidGroup) {
                canvas.discardActiveGroup(); // restore states for each objects
                this.store = target.getObjects();
                target.forEachObject(function(obj) {
                    obj.remove();
                });
                jqDefer.resolve();
            } else if (canvas.contains(target)) {
                this.store = [target];
                target.remove();
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
 * Filter command
 * @param {string} type - Filter type
 * @param {object} options - Filter options
 * @returns {Command}
 */
function createFilterCommand(type, options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        execute: function(compMap) {
            var filterComp = compMap[FILTER];

            if (type === 'mask') {
                this.store = options.mask;
                options.mask.remove();
            }

            return filterComp.add(type, options);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {jQuery.Deferred}
         */
        undo: function(compMap) {
            var filterComp = compMap[FILTER];

            if (type === 'mask') {
                filterComp.getCanvas().add(this.store);
            }

            return filterComp.remove(type);
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

},{"../consts":12,"../interface/command":19}],16:[function(require,module,exports){
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

},{"../util":22}],17:[function(require,module,exports){
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
var keyCodes = consts.keyCodes;

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
        this._attachDomEvents();
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
            'path:created': this._onPathCreated,
            'object:added': $.proxy(function(event) {
                var obj = event.target;
                var command;

                if (obj.isType('cropzone')) {
                    return;
                }

                if (!tui.util.hasStamp(obj)) {
                    command = commandFactory.create(commands.ADD_OBJECT, obj);
                    this._invoker.pushUndoStack(command);
                    this._invoker.clearRedoStack();
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
            }, this),
            'object:moving': $.proxy(function(event) {
                this._invoker.clearRedoStack();

                /**
                 * @api
                 * @event ImageEditor#adjustObject
                 * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
                 * @param {string} Action type (move / scale)
                 * @example
                 * imageEditor.on('adjustObject', function(obj, type) {
                 *     console.log(obj);
                 *     console.log(type);
                 * });
                 */
                this.fire(events.ADJUST_OBJECT, event.target, 'move');
            }, this),
            'object:scaling': $.proxy(function(event) {
                this._invoker.clearRedoStack();

                /**
                 * @event ImageEditor#adjustObject
                 * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
                 * @param {string} Action type (scale / scale)
                 * @example
                 * imageEditor.on('adjustObject', function(obj, type) {
                 *     console.log(obj);
                 *     console.log(type);
                 * });
                 */
                this.fire(events.ADJUST_OBJECT, event.target, 'scale');
            }, this)
        });
    },

    /**
     * Attach dom events
     * @private
     */
    _attachDomEvents: function() {
        fabric.util.addListener(document, 'keydown', $.proxy(this._onKeyDown, this));
    },

    /**
     * Keydown event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown: function(e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Z) {
            this.undo();
        }

        if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Y) {
            this.redo();
        }
    },

    /**
     * EventListener - "path:created"
     *  - Events:: "object:added" -> "path:created"
     * @param {{path: fabric.Path}} obj - Path object
     * @private
     */
    _onPathCreated: function(obj) {
        obj.path.set(consts.fObjectOptions.SELECTION_STYLE);
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
     * //    TEXT: 'TEXT'
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
        this.endTextMode();
        this.endFreeDrawing();
        this.endLineDrawing();
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
        this._canvas.renderAll();
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
     * Add image object on canvas
     * @param {string} imgUrl - Image url to make object
     * @api
     * @example
     * imageEditor.addImageObject('path/fileName.jpg');
     */
    addImageObject: function(imgUrl) {
        if (!imgUrl) {
            return;
        }

        fabric.Image.fromURL(imgUrl,
            $.proxy(this._callbackAfterLoadingImageObject, this),
            {
                crossOrigin: 'Anonymous'
            }
        );
    },

    /**
     * Callback function after loading image
     * @param {fabric.Image} obj - Fabric image object
     * @private
     */
    _callbackAfterLoadingImageObject: function(obj) {
        var mainComp = this._getMainComponent();
        var centerPos = mainComp.getCanvasImage().getCenterPoint();

        obj.set(consts.fObjectOptions.SELECTION_STYLE);
        obj.set({
            left: centerPos.x,
            top: centerPos.y,
            crossOrigin: 'anonymous'
        });

        this._canvas.add(obj).setActiveObject(obj);
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
     * imageEditor.endFreeDrawing();
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
        var state = this._state;
        var compName;

        switch (state) {
            case states.LINE:
                compName = compList.LINE;
                break;
            default:
                compName = compList.FREE_DRAWING;
        }

        this._getComponent(compName).setBrush(setting);
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
     * Start line-drawing mode
     * @param {{width: number, color: string}} [setting] - Brush width & color
     * @api
     * @example
     * imageEditor.startLineDrawing();
     * imageEditor.endLineDrawing();
     * imageEidtor.startLineDrawing({
     *     width: 12,
     *     color: 'rgba(0, 0, 0, 0.5)'
     * });
     */
    startLineDrawing: function(setting) {
        if (this.getCurrentState() === states.LINE) {
            return;
        }

        this.endAll();
        this._getComponent(compList.LINE).start(setting);
        this._state = states.LINE;

        /**
         * @api
         * @event ImageEditor#startLineDrawing
         */
        this.fire(events.START_LINE_DRAWING);
    },

    /**
     * End line-drawing mode
     * @api
     * @example
     * imageEditor.startLineDrawing();
     * imageEditor.endLineDrawing();
     */
    endLineDrawing: function() {
        if (this.getCurrentState() !== states.LINE) {
            return;
        }
        this._getComponent(compList.LINE).end();
        this._state = states.NORMAL;

        /**
         * @api
         * @event ImageEditor#endLineDrawing
         */
        this.fire(events.END_LINE_DRAWING);
    },

    /**
     * Start text input mode
     * @api
     * @example
     * imageEditor.endTextMode();
     * imageEditor.startTextMode();
     */
    startTextMode: function() {
        this.endAll();

        if (this.getCurrentState() === states.TEXT) {
            return;
        }

        this._state = states.TEXT;

        this._listener = $.proxy(this._onFabricMouseDown, this);

        this._canvas.forEachObject(function(obj) {
            if (!obj.isType('text')) {
                obj.evented = false;
            }
        });

        this._canvas.selection = false;
        this._canvas.defaultCursor = 'text';
        this._canvas.on('mouse:down', this._listener);
    },

    /**
     * Add text on image
     * @api
     * @param {string} text - Initial input text
     * @param {object} [options] Options for generating text
     *     @param {object} [options.styles] Initial styles
     *         @param {string} [options.styles.fill] Color
     *         @param {string} [options.styles.fontFamily] Font type for text
     *         @param {number} [options.styles.fontSize] Size
     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [options.position] - Initial position
     * @example
     * imageEditor.addText();
     * imageEditor.addText('init text', {
     *     styles: {
     *     fill: '#000',
     *         fontSize: '20',
     *         fontWeight: 'bold'
     *     },
     *     position: {
     *         x: 10,
     *         y: 10
     *     }
     * });
     */
    addText: function(text, options) {
        if (this.getCurrentState() !== states.TEXT) {
            this._state = states.TEXT;
        }

        this._getComponent(compList.TEXT).add(text || '', options || {});
    },

    /**
     * Change contents of selected text object on image
     * @api
     * @param {string} text - Changing text
     * @example
     * imageEditor.changeText('change text');
     */
    changeText: function(text) {
        var activeObj = this._canvas.getActiveObject();

        if (this.getCurrentState() !== states.TEXT ||
            !activeObj) {
            return;
        }

        this._getComponent(compList.TEXT).change(activeObj, text);
    },

    /**
     * Set style
     * @api
     * @param {object} styleObj - Initial styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     * @example
     * imageEditor.changeTextStyle({
     *     fontStyle: 'italic'
     * });
     */
    changeTextStyle: function(styleObj) {
        var activeObj = this._canvas.getActiveObject();

        if (this.getCurrentState() !== states.TEXT ||
            !activeObj) {
            return;
        }

        this._getComponent(compList.TEXT).setStyle(activeObj, styleObj);
    },

    /**
     * End text input mode
     * @api
     * @example
     * imageEditor.startTextMode();
     * imageEditor.endTextMode();
     */
    endTextMode: function() {
        if (this.getCurrentState() === states.TEXT) {
            this._state = states.NORMAL;
        }

        this._canvas.forEachObject(function(obj) {
            if (obj.isType('text') && obj.text === '') {
                obj.remove();
            } else {
                obj.evented = true;
            }
        });

        this._canvas.selection = true;
        this._canvas.defaultCursor = 'default';
        this._canvas.off('mouse:down', this._listener);
    },

     /**
      * Mousedown event handler
      * @param {fabric.Event} event - Current mousedown event object
      */
    _onFabricMouseDown: function(event) {
        var obj = event.target;
        var e = event.e;
        var originPointer = this._canvas.getPointer(e);

        if (obj && !obj.isType('text')) {
            return;
        }

        /**
         * @api
         * @event ImageEditor#activateText
         * @param {object} options
         *     @param {boolean} options.type - Type of text object (new / select)
         *     @param {string} options.text - Current text
         *     @param {object} options.styles - Current styles
         *         @param {string} options.styles.fill - Color
         *         @param {string} options.styles.fontFamily - Font type for text
         *         @param {number} options.styles.fontSize - Size
         *         @param {string} options.styles.fontStyle - Type of inclination (normal / italic)
         *         @param {string} options.styles.fontWeight - Type of thicker or thinner looking (normal / bold)
         *         @param {string} options.styles.textAlign - Type of text align (left / center / right)
         *         @param {string} options.styles.textDecoraiton - Type of line (underline / line-throgh / overline)
         *     @param {{x: number, y: number}} options.originPosition - Current position on origin canvas
         *     @param {{x: number, y: number}} options.clientPosition - Current position on client area
         * @example
         * imageEditor.on('activateText', function(obj) {
         *     console.log('text object type: ' + obj.type);
         *     console.log('text contents: ' + obj.text);
         *     console.log('text styles: ' + obj.styles);
         *     console.log('text position on canvas: ' + obj.originPosition);
         *     console.log('text position on brwoser: ' + obj.clientPosition);
         * });
         */
        this.fire(events.ACTIVATE_TEXT, {
            type: obj ? 'select' : 'new',
            text: obj ? obj.text : '',
            styles: obj ? {
                fill: obj.fill,
                fontFamily: obj.fontFamily,
                fontSize: obj.fontSize,
                fontStyle: obj.fontStyle,
                textAlign: obj.textAlign,
                textDecoration: obj.textDecoration
            } : {},
            originPosition: {
                x: originPointer.x,
                y: originPointer.y
            },
            clientPosition: {
                x: e.clientX,
                y: e.clientY
            }
        });
    },

    /**
     * Register custom icons
     * @api
     * @param {{iconType: string, pathValue: string}} infos - Infos to register icons
     * @example
     * imageEditor.registerIcons({
     *     customIcon: 'M 0 0 L 20 20 L 10 10 Z',
     *     customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
     * });
     */
    registerIcons: function(infos) {
        this._getComponent(compList.ICON).registerPaths(infos);
    },

    /**
     * Add icon on canvas
     * @api
     * @param {string} type - Icon type (arrow / cancel)
     * @example
     * imageEditor.addIcon('arrow');
     */
    addIcon: function(type) {
        this._getComponent(compList.ICON).add(type);
    },

    /**
     * Change icon color
     * @api
     * @param {string} color - Color for icon
     * @example
     * imageEditor.changeIconColor('#000000');
     */
    changeIconColor: function(color) {
        var activeObj = this._canvas.getActiveObject();

        this._getComponent(compList.ICON).setColor(color, activeObj);
    },

    /**
     * Remove active object or group
     * @api
     * @example
     * imageEditor.removeActiveObject();
     */
    removeActiveObject: function() {
        var canvas = this._canvas;
        var target = canvas.getActiveObject() || canvas.getActiveGroup();
        var command = commandFactory.create(commands.REMOVE_OBJECT, target);
        this.execute(command);
    },

    /**
     * Apply filter on canvas image
     * @api
     * @param {string} type - Filter type (current filter type is only 'mask')
     * @param {options} options - Options to apply filter
     * @example
     * imageEditor.applyFilter('mask');
     * imageEditor.applyFilter('mask', {
     *     mask: fabricImgObj
     * });
     */
    applyFilter: function(type, options) {
        var command, callback, activeObj;

        if (type === 'mask' && !options) {
            activeObj = this._canvas.getActiveObject();

            if (!(activeObj && activeObj.isType('image'))) {
                return;
            }

            options = {
                mask: activeObj
            };
        }

        callback = $.proxy(this.fire, this, events.APPLY_FILTER);
        command = commandFactory.create(commands.APPLY_FILTER, type, options);

        /**
         * @api
         * @event ImageEditor#applyFilter
         * @param {string} filterType - Applied filter
         * @param {string} actType - Action type (add / remove)
         * @example
         * imageEditor.on('applyFilter', function(filterType, actType) {
         *     console.log('filterType: ', filterType);
         *     console.log('actType: ', actType);
         * });
         */
        command.setExecuteCallback(callback)
            .setUndoCallback(callback);

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

},{"./consts":12,"./factory/command":15,"./invoker":21}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"../factory/errorMessage":16}],20:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18}],21:[function(require,module,exports){
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
var Line = require('./component/line');
var Text = require('./component/text');
var Icon = require('./component/icon');
var Filter = require('./component/filter');
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
        this._register(new Line(main));
        this._register(new Text(main));
        this._register(new Icon(main));
        this._register(new Filter(main));
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

},{"./component/cropper":2,"./component/filter":3,"./component/flip":4,"./component/freeDrawing":5,"./component/icon":6,"./component/imageLoader":7,"./component/line":8,"./component/main":9,"./component/rotation":10,"./component/text":11,"./consts":12}],22:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmlsdGVyLmpzIiwic3JjL2pzL2NvbXBvbmVudC9mbGlwLmpzIiwic3JjL2pzL2NvbXBvbmVudC9mcmVlRHJhd2luZy5qcyIsInNyYy9qcy9jb21wb25lbnQvaWNvbi5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L2xpbmUuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29tcG9uZW50L3JvdGF0aW9uLmpzIiwic3JjL2pzL2NvbXBvbmVudC90ZXh0LmpzIiwic3JjL2pzL2NvbnN0cy5qcyIsInNyYy9qcy9leHRlbnNpb24vY3JvcHpvbmUuanMiLCJzcmMvanMvZXh0ZW5zaW9uL21hc2suanMiLCJzcmMvanMvZmFjdG9yeS9jb21tYW5kLmpzIiwic3JjL2pzL2ZhY3RvcnkvZXJyb3JNZXNzYWdlLmpzIiwic3JjL2pzL2ltYWdlRWRpdG9yLmpzIiwic3JjL2pzL2ludGVyZmFjZS9Db21wb25lbnQuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbW1hbmQuanMiLCJzcmMvanMvaW52b2tlci5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9XQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamtDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkltYWdlRWRpdG9yJywgcmVxdWlyZSgnLi9zcmMvanMvaW1hZ2VFZGl0b3InKSwgdHJ1ZSk7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBjcm9wIG1vZHVsZSAoc3RhcnQgY3JvcHBpbmcsIGVuZCBjcm9wcGluZylcbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBDcm9wem9uZSA9IHJlcXVpcmUoJy4uL2V4dGVuc2lvbi9jcm9wem9uZScpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBNT1VTRV9NT1ZFX1RIUkVTSE9MRCA9IDEwO1xuXG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgY2xhbXAgPSB1dGlsLmNsYW1wO1xudmFyIGtleUNvZGVzID0gY29uc3RzLmtleUNvZGVzO1xuXG4vKipcbiAqIENyb3BwZXIgY29tcG9uZW50c1xuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgQ3JvcHBlclxuICovXG52YXIgQ3JvcHBlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBDcm9wcGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge0Nyb3B6b25lfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFggb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0WSBvZiBDcm9wem9uZVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRZID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhdGUgd2hldGhlciBzaG9ydGN1dCBrZXkgaXMgcHJlc3NlZCBvciBub3RcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl93aXRoU2hpZnRLZXkgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge1xuICAgICAgICAgICAga2V5ZG93bjogJC5wcm94eSh0aGlzLl9vbktleURvd24sIHRoaXMpLFxuICAgICAgICAgICAga2V5dXA6ICQucHJveHkodGhpcy5fb25LZXlVcCwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZWRvd246ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZURvd24sIHRoaXMpLFxuICAgICAgICAgICAgbW91c2Vtb3ZlOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VNb3ZlLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNldXA6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZVVwLCB0aGlzKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLkNST1BQRVIsXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBjcm9wcGluZ1xuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcztcblxuICAgICAgICBpZiAodGhpcy5fY3JvcHpvbmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHsgLy8ge0BsaW5rIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWwjZXZlbnRlZH1cbiAgICAgICAgICAgIG9iai5ldmVudGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG5ldyBDcm9wem9uZSh7XG4gICAgICAgICAgICBsZWZ0OiAtMTAsXG4gICAgICAgICAgICB0b3A6IC0xMCxcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsIC8vIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20va2FuZ2F4L2ZhYnJpYy5qcy9pc3N1ZXMvMjg2MH1cbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBoYXNCb3JkZXJzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgICAgIGxvY2tSb3RhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgICAgY2FudmFzLmFkZCh0aGlzLl9jcm9wem9uZSk7XG4gICAgICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIGNhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2Nyb3NzaGFpcic7XG5cbiAgICAgICAgZmFicmljLnV0aWwuYWRkTGlzdGVuZXIoZG9jdW1lbnQsICdrZXlkb3duJywgdGhpcy5fbGlzdGVuZXJzLmtleWRvd24pO1xuICAgICAgICBmYWJyaWMudXRpbC5hZGRMaXN0ZW5lcihkb2N1bWVudCwgJ2tleXVwJywgdGhpcy5fbGlzdGVuZXJzLmtleXVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGNyb3BwaW5nXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0FwcGx5aW5nIC0gSXMgYXBwbHlpbmcgb3Igbm90XG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbihpc0FwcGx5aW5nKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGRhdGE7XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY3JvcHpvbmUucmVtb3ZlKCk7XG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSB0cnVlO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdkZWZhdWx0JztcbiAgICAgICAgY2FudmFzLm9mZignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd24pO1xuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIG9iai5ldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc0FwcGx5aW5nKSB7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fZ2V0Q3JvcHBlZEltYWdlRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Nyb3B6b25lID0gbnVsbDtcblxuICAgICAgICBmYWJyaWMudXRpbC5yZW1vdmVMaXN0ZW5lcihkb2N1bWVudCwgJ2tleWRvd24nLCB0aGlzLl9saXN0ZW5lcnMua2V5ZG93bik7XG4gICAgICAgIGZhYnJpYy51dGlsLnJlbW92ZUxpc3RlbmVyKGRvY3VtZW50LCAna2V5dXAnLCB0aGlzLl9saXN0ZW5lcnMua2V5dXApO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlZG93biBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlRG93bjogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY29vcmQ7XG5cbiAgICAgICAgaWYgKGZFdmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgY29vcmQgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG5cbiAgICAgICAgdGhpcy5fc3RhcnRYID0gY29vcmQueDtcbiAgICAgICAgdGhpcy5fc3RhcnRZID0gY29vcmQueTtcblxuICAgICAgICBjYW52YXMub24oe1xuICAgICAgICAgICAgJ21vdXNlOm1vdmUnOiB0aGlzLl9saXN0ZW5lcnMubW91c2Vtb3ZlLFxuICAgICAgICAgICAgJ21vdXNlOnVwJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNldXBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW91c2Vtb3ZlIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VNb3ZlOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuICAgICAgICB2YXIgeCA9IHBvaW50ZXIueDtcbiAgICAgICAgdmFyIHkgPSBwb2ludGVyLnk7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuXG4gICAgICAgIGlmIChhYnMoeCAtIHRoaXMuX3N0YXJ0WCkgKyBhYnMoeSAtIHRoaXMuX3N0YXJ0WSkgPiBNT1VTRV9NT1ZFX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgY3JvcHpvbmUucmVtb3ZlKCk7XG4gICAgICAgICAgICBjcm9wem9uZS5zZXQodGhpcy5fY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQoeCwgeSkpO1xuXG4gICAgICAgICAgICBjYW52YXMuYWRkKGNyb3B6b25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVjdCBkaW1lbnNpb24gc2V0dGluZyBmcm9tIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbih4LCB5KVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gQ2FudmFzLU1vdXNlLVBvc2l0aW9uIHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiBZXG4gICAgICogQHJldHVybnMge3tsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1JlY3REaW1lbnNpb25Gcm9tUG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBjYW52YXNXaWR0aCA9IGNhbnZhcy5nZXRXaWR0aCgpO1xuICAgICAgICB2YXIgY2FudmFzSGVpZ2h0ID0gY2FudmFzLmdldEhlaWdodCgpO1xuICAgICAgICB2YXIgc3RhcnRYID0gdGhpcy5fc3RhcnRYO1xuICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5fc3RhcnRZO1xuICAgICAgICB2YXIgbGVmdCA9IGNsYW1wKHgsIDAsIHN0YXJ0WCk7XG4gICAgICAgIHZhciB0b3AgPSBjbGFtcCh5LCAwLCBzdGFydFkpO1xuICAgICAgICB2YXIgd2lkdGggPSBjbGFtcCh4LCBzdGFydFgsIGNhbnZhc1dpZHRoKSAtIGxlZnQ7IC8vIChzdGFydFggPD0geChtb3VzZSkgPD0gY2FudmFzV2lkdGgpIC0gbGVmdFxuICAgICAgICB2YXIgaGVpZ2h0ID0gY2xhbXAoeSwgc3RhcnRZLCBjYW52YXNIZWlnaHQpIC0gdG9wOyAvLyAoc3RhcnRZIDw9IHkobW91c2UpIDw9IGNhbnZhc0hlaWdodCkgLSB0b3BcblxuICAgICAgICBpZiAodGhpcy5fd2l0aFNoaWZ0S2V5KSB7IC8vIG1ha2UgZml4ZWQgcmF0aW8gY3JvcHpvbmVcbiAgICAgICAgICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IHdpZHRoO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoZWlnaHQgPiB3aWR0aCkge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhcnRYID49IHgpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gc3RhcnRYIC0gd2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGFydFkgPj0geSkge1xuICAgICAgICAgICAgICAgIHRvcCA9IHN0YXJ0WSAtIGhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNldXAgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QoY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub2ZmKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IGxpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3JvcHBlZCBpbWFnZSBkYXRhXG4gICAgICogQHJldHVybnMgez97aW1hZ2VOYW1lOiBzdHJpbmcsIHVybDogc3RyaW5nfX0gY3JvcHBlZCBJbWFnZSBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q3JvcHBlZEltYWdlRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgY3JvcEluZm87XG5cbiAgICAgICAgaWYgKCFjcm9wem9uZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JvcEluZm8gPSB7XG4gICAgICAgICAgICBsZWZ0OiBjcm9wem9uZS5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3A6IGNyb3B6b25lLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGg6IGNyb3B6b25lLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGNyb3B6b25lLmdldEhlaWdodCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlTmFtZTogdGhpcy5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgIHVybDogdGhpcy5nZXRDYW52YXMoKS50b0RhdGFVUkwoY3JvcEluZm8pXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEtleWRvd24gZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZSAtIEV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5TSElGVCkge1xuICAgICAgICAgICAgdGhpcy5fd2l0aFNoaWZ0S2V5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBLZXl1cCBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBlIC0gRXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlVcDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5TSElGVCkge1xuICAgICAgICAgICAgdGhpcy5fd2l0aFNoaWZ0S2V5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wcGVyO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQWRkIGZpbHRlciBtb2R1bGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIE1hc2sgPSByZXF1aXJlKCcuLi9leHRlbnNpb24vbWFzaycpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEZpbHRlclxuICogQGNsYXNzIEZpbHRlclxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKi9cbnZhciBGaWx0ZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRmlsdGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GSUxURVIsXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZmlsdGVyIHRvIHNvdXJjZSBpbWFnZSAoYSBzcGVjaWZpYyBmaWx0ZXIgaXMgYWRkZWQgb24gZmFicmljLmpzKVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gRmlsdGVyIHR5cGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9ucyBvZiBmaWx0ZXJcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgdmFyIGZpbHRlciA9IHRoaXMuX2NyZWF0ZUZpbHRlcih0eXBlLCBvcHRpb25zKTtcbiAgICAgICAgdmFyIHNvdXJjZUltZyA9IHRoaXMuX2dldFNvdXJjZUltYWdlKCk7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGlmICghZmlsdGVyKSB7XG4gICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc291cmNlSW1nLmZpbHRlcnMucHVzaChmaWx0ZXIpO1xuXG4gICAgICAgIHRoaXMuX2FwcGx5KHNvdXJjZUltZywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG4gICAgICAgICAgICBqcURlZmVyLnJlc29sdmUodHlwZSwgJ2FkZCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGZpbHRlciB0byBzb3VyY2UgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEZpbHRlciB0eXBlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBzb3VyY2VJbWcgPSB0aGlzLl9nZXRTb3VyY2VJbWFnZSgpO1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBpZiAoIXNvdXJjZUltZy5maWx0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNvdXJjZUltZy5maWx0ZXJzLnBvcCgpO1xuXG4gICAgICAgIHRoaXMuX2FwcGx5KHNvdXJjZUltZywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG4gICAgICAgICAgICBqcURlZmVyLnJlc29sdmUodHlwZSwgJ3JlbW92ZScpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgZmlsdGVyXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IHNvdXJjZUltZyAtIFNvdXJjZSBpbWFnZSB0byBhcHBseSBmaWx0ZXJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIEV4ZWN1dGVkIGZ1bmN0aW9uIGFmdGVyIGFwcGx5aW5nIGZpbHRlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FwcGx5OiBmdW5jdGlvbihzb3VyY2VJbWcsIGNhbGxiYWNrKSB7XG4gICAgICAgIHNvdXJjZUltZy5hcHBseUZpbHRlcnMoY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgc291cmNlIGltYWdlIG9uIGNhbnZhc1xuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuSW1hZ2V9IEN1cnJlbnQgc291cmNlIGltYWdlIG9uIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFNvdXJjZUltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGZpbHRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gRmlsdGVyIHR5cGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9ucyBvZiBmaWx0ZXJcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBGYWJyaWMgb2JqZWN0IG9mIGZpbHRlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZUZpbHRlcjogZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgZmlsdGVyT2JqO1xuXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbWFzayc6XG4gICAgICAgICAgICAgICAgZmlsdGVyT2JqID0gbmV3IE1hc2sob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGZpbHRlck9iaiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlsdGVyT2JqO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbHRlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlIGZsaXAgbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9Db21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBGbGlwXG4gKiBAY2xhc3MgRmxpcFxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKi9cbnZhciBGbGlwID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEZsaXAucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLkZMSVAsXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBmbGlwIHNldHRpbmdzXG4gICAgICogQHJldHVybnMge3tmbGlwWDogQm9vbGVhbiwgZmxpcFk6IEJvb2xlYW59fVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRTZXR0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmbGlwWDogY2FudmFzSW1hZ2UuZmxpcFgsXG4gICAgICAgICAgICBmbGlwWTogY2FudmFzSW1hZ2UuZmxpcFlcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGZsaXBYLCBmbGlwWVxuICAgICAqIEBwYXJhbSB7e2ZsaXBYOiBCb29sZWFuLCBmbGlwWTogQm9vbGVhbn19IG5ld1NldHRpbmcgLSBGbGlwIHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24obmV3U2V0dGluZykge1xuICAgICAgICB2YXIgc2V0dGluZyA9IHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKTtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBpc0NoYW5naW5nRmxpcFggPSAoc2V0dGluZy5mbGlwWCAhPT0gbmV3U2V0dGluZy5mbGlwWCk7XG4gICAgICAgIHZhciBpc0NoYW5naW5nRmxpcFkgPSAoc2V0dGluZy5mbGlwWSAhPT0gbmV3U2V0dGluZy5mbGlwWSk7XG5cbiAgICAgICAgaWYgKCFpc0NoYW5naW5nRmxpcFggJiYgIWlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5leHRlbmQoc2V0dGluZywgbmV3U2V0dGluZyk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHRydWUpO1xuICAgICAgICB0aGlzLl9pbnZlcnRBbmdsZShpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSk7XG4gICAgICAgIHRoaXMuX2ZsaXBPYmplY3RzKGlzQ2hhbmdpbmdGbGlwWCwgaXNDaGFuZ2luZ0ZsaXBZKTtcblxuICAgICAgICByZXR1cm4ganFEZWZlci5yZXNvbHZlKHNldHRpbmcsIHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKS5hbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludmVydCBpbWFnZSBhbmdsZSBmb3IgZmxpcFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBYIC0gQ2hhbmdlIGZsaXBYXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW5naW5nRmxpcFkgLSBDaGFuZ2UgZmxpcFlcbiAgICAgKi9cbiAgICBfaW52ZXJ0QW5nbGU6IGZ1bmN0aW9uKGlzQ2hhbmdpbmdGbGlwWCwgaXNDaGFuZ2luZ0ZsaXBZKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcbiAgICAgICAgdmFyIGFuZ2xlID0gY2FudmFzSW1hZ2UuYW5nbGU7XG5cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWCkge1xuICAgICAgICAgICAgYW5nbGUgKj0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICAgICAgYW5nbGUgKj0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzSW1hZ2Uuc2V0QW5nbGUocGFyc2VGbG9hdChhbmdsZSkpLnNldENvb3JkcygpOy8vIHBhcnNlRmxvYXQgZm9yIC0wIHRvIDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCBvYmplY3RzXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW5naW5nRmxpcFggLSBDaGFuZ2UgZmxpcFhcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbmdpbmdGbGlwWSAtIENoYW5nZSBmbGlwWVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZsaXBPYmplY3RzOiBmdW5jdGlvbihpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBpZiAoaXNDaGFuZ2luZ0ZsaXBYKSB7XG4gICAgICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICBvYmouc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGU6IHBhcnNlRmxvYXQob2JqLmFuZ2xlICogLTEpLCAvLyBwYXJzZUZsb2F0IGZvciAtMCB0byAwXG4gICAgICAgICAgICAgICAgICAgIGZsaXBYOiAhb2JqLmZsaXBYLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBjYW52YXMud2lkdGggLSBvYmoubGVmdFxuICAgICAgICAgICAgICAgIH0pLnNldENvb3JkcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwYXJzZUZsb2F0KG9iai5hbmdsZSAqIC0xKSwgLy8gcGFyc2VGbG9hdCBmb3IgLTAgdG8gMFxuICAgICAgICAgICAgICAgICAgICBmbGlwWTogIW9iai5mbGlwWSxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBjYW52YXMuaGVpZ2h0IC0gb2JqLnRvcFxuICAgICAgICAgICAgICAgIH0pLnNldENvb3JkcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBmbGlwIHNldHRpbmdzXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh7XG4gICAgICAgICAgICBmbGlwWDogZmFsc2UsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgZmxpcFg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZXQoe1xuICAgICAgICAgICAgZmxpcFg6ICFjdXJyZW50LmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6IGN1cnJlbnQuZmxpcFlcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgZmxpcFk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZXQoe1xuICAgICAgICAgICAgZmxpcFg6IGN1cnJlbnQuZmxpcFgsXG4gICAgICAgICAgICBmbGlwWTogIWN1cnJlbnQuZmxpcFlcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmxpcDtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEZyZWUgZHJhd2luZyBtb2R1bGUsIFNldCBicnVzaFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogRnJlZURyYXdpbmdcbiAqIEBjbGFzcyBGcmVlRHJhd2luZ1xuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKi9cbnZhciBGcmVlRHJhd2luZyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGcmVlRHJhd2luZy5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJydXNoIHdpZHRoXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndpZHRoID0gMTI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGZhYnJpYy5Db2xvciBpbnN0YW5jZSBmb3IgYnJ1c2ggY29sb3JcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5Db2xvcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub0NvbG9yID0gbmV3IGZhYnJpYy5Db2xvcigncmdiYSgwLCAwLCAwLCAwLjUpJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuRlJFRV9EUkFXSU5HLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgZnJlZSBkcmF3aW5nIG1vZGVcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogP251bWJlciwgY29sb3I6ID9zdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmlzRHJhd2luZ01vZGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNldEJydXNoKHNldHRpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYnJ1c2hcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogP251bWJlciwgY29sb3I6ID9zdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc2V0QnJ1c2g6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdmFyIGJydXNoID0gdGhpcy5nZXRDYW52YXMoKS5mcmVlRHJhd2luZ0JydXNoO1xuXG4gICAgICAgIHNldHRpbmcgPSBzZXR0aW5nIHx8IHt9O1xuICAgICAgICB0aGlzLndpZHRoID0gc2V0dGluZy53aWR0aCB8fCB0aGlzLndpZHRoO1xuICAgICAgICBpZiAoc2V0dGluZy5jb2xvcikge1xuICAgICAgICAgICAgdGhpcy5vQ29sb3IgPSBuZXcgZmFicmljLkNvbG9yKHNldHRpbmcuY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGJydXNoLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgYnJ1c2guY29sb3IgPSB0aGlzLm9Db2xvci50b1JnYmEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGZyZWUgZHJhd2luZyBtb2RlXG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmlzRHJhd2luZ01vZGUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGcmVlRHJhd2luZztcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEFkZCBpY29uIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBwYXRoTWFwID0ge1xuICAgIGFycm93OiAnTSAwIDkwIEggMTA1IFYgMTIwIEwgMTYwIDYwIEwgMTA1IDAgViAzMCBIIDAgWicsXG4gICAgY2FuY2VsOiAnTSAwIDMwIEwgMzAgNjAgTCAwIDkwIEwgMzAgMTIwIEwgNjAgOTAgTCA5MCAxMjAgTCAxMjAgOTAgJyArXG4gICAgICAgICAgICAnTCA5MCA2MCBMIDEyMCAzMCBMIDkwIDAgTCA2MCAzMCBMIDMwIDAgWidcbn07XG5cbi8qKlxuICogSWNvblxuICogQGNsYXNzIEljb25cbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgSWNvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBJY29uLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVmYXVsdCBpY29uIGNvbG9yXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vQ29sb3IgPSAnIzAwMDAwMCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhdGggdmFsdWUgb2YgZWFjaCBpY29uIHR5cGVcbiAgICAgICAgICogQHR5cGUge29iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BhdGhNYXAgPSBwYXRoTWFwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLklDT04sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgaWNvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gSWNvbiB0eXBlXG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY2VudGVyUG9zID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpLmdldENlbnRlclBvaW50KCk7XG4gICAgICAgIHZhciBwYXRoID0gdGhpcy5fcGF0aE1hcFt0eXBlXTtcbiAgICAgICAgdmFyIGljb247XG5cbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpY29uID0gdGhpcy5fY3JlYXRlSWNvbihwYXRoKTtcblxuICAgICAgICBpY29uLnNldChjb25zdHMuZk9iamVjdE9wdGlvbnMuU0VMRUNUSU9OX1NUWUxFKTtcbiAgICAgICAgaWNvbi5zZXQoe1xuICAgICAgICAgICAgZmlsbDogdGhpcy5fb0NvbG9yLFxuICAgICAgICAgICAgbGVmdDogY2VudGVyUG9zLngsXG4gICAgICAgICAgICB0b3A6IGNlbnRlclBvcy55LFxuICAgICAgICAgICAgdHlwZTogJ2ljb24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhcy5hZGQoaWNvbikuc2V0QWN0aXZlT2JqZWN0KGljb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBpY29uIHBhdGhzXG4gICAgICogQHBhcmFtIHt7a2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmd9fSBwYXRoSW5mb3MgLSBQYXRoIGluZm9zXG4gICAgICovXG4gICAgcmVnaXN0ZXJQYXRoczogZnVuY3Rpb24ocGF0aEluZm9zKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocGF0aEluZm9zLCBmdW5jdGlvbihwYXRoLCB0eXBlKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXRoTWFwW3R5cGVdID0gcGF0aDtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpY29uIG9iamVjdCBjb2xvclxuICAgICAqIEBwYXJhbSB7c3RyaWdufSBjb2xvciAtIENvbG9yIHRvIHNldFxuICAgICAqIEBwYXJhbSB7ZmFicmljLlBhdGh9W29ial0gLSBDdXJyZW50IGFjdGl2YXRlZCBwYXRoIG9iamVjdFxuICAgICAqL1xuICAgIHNldENvbG9yOiBmdW5jdGlvbihjb2xvciwgb2JqKSB7XG4gICAgICAgIHRoaXMuX29Db2xvciA9IGNvbG9yO1xuXG4gICAgICAgIGlmIChvYmogJiYgb2JqLmdldCgndHlwZScpID09PSAnaWNvbicpIHtcbiAgICAgICAgICAgIG9iai5zZXRGaWxsKHRoaXMuX29Db2xvcik7XG4gICAgICAgICAgICB0aGlzLmdldENhbnZhcygpLnJlbmRlckFsbCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpY29uIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gUGF0aCB2YWx1ZSB0byBjcmVhdGUgaWNvblxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuUGF0aH0gUGF0aCBvYmplY3RcbiAgICAgKi9cbiAgICBfY3JlYXRlSWNvbjogZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICByZXR1cm4gbmV3IGZhYnJpYy5QYXRoKHBhdGgpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEljb247XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBsb2FkZXJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgaW1hZ2VPcHRpb24gPSB7XG4gICAgcGFkZGluZzogMCxcbiAgICBjcm9zc09yaWdpbjogJ2Fub255bW91cydcbn07XG5cbi8qKlxuICogSW1hZ2VMb2FkZXIgY29tcG9uZW50c1xuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzcyBJbWFnZUxvYWRlclxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqL1xudmFyIEltYWdlTG9hZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEltYWdlTG9hZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVIsXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQHBhcmFtIHs/c3RyaW5nfSBpbWFnZU5hbWUgLSBGaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfHN0cmluZyl9IGltZyAtIGZhYnJpYy5JbWFnZSBpbnN0YW5jZSBvciBVUkwgb2YgYW4gaW1hZ2VcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGpxRGVmZXIsIGNhbnZhcztcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSAmJiAhaW1nKSB7IC8vIEJhY2sgdG8gdGhlIGluaXRpYWwgc3RhdGUsIG5vdCBlcnJvci5cbiAgICAgICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICBjYW52YXMuYmFja2dyb3VuZEltYWdlID0gbnVsbDtcbiAgICAgICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcblxuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZSgnJywgbnVsbCk7XG4gICAgICAgICAgICB9KS5yZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gdGhpcy5fc2V0QmFja2dyb3VuZEltYWdlKGltZykuZG9uZShmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldENhbnZhc0ltYWdlKGltYWdlTmFtZSwgb0ltYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGJhY2tncm91bmQgaW1hZ2VcbiAgICAgKiBAcGFyYW0gez8oZmFicmljLkltYWdlfFN0cmluZyl9IGltZyBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlIHRvIHNldCBiYWNrZ3JvdW5kIHRvXG4gICAgICogQHJldHVybnMgeyQuRGVmZXJyZWR9IGRlZmVycmVkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0QmFja2dyb3VuZEltYWdlOiBmdW5jdGlvbihpbWcpIHtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWcpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLnNldEJhY2tncm91bmRJbWFnZShpbWcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG9JbWFnZSA9IGNhbnZhcy5iYWNrZ3JvdW5kSW1hZ2U7XG5cbiAgICAgICAgICAgIGlmIChvSW1hZ2UuZ2V0RWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKG9JbWFnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGltYWdlT3B0aW9uKTtcblxuICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUxvYWRlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEZyZWUgZHJhd2luZyBtb2R1bGUsIFNldCBicnVzaFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogTGluZVxuICogQGNsYXNzIExpbmVcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgTGluZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGcmVlRHJhd2luZy5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJydXNoIHdpZHRoXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl93aWR0aCA9IDEyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmYWJyaWMuQ29sb3IgaW5zdGFuY2UgZm9yIGJydXNoIGNvbG9yXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ29sb3J9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vQ29sb3IgPSBuZXcgZmFicmljLkNvbG9yKCdyZ2JhKDAsIDAsIDAsIDAuNSknKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTGlzdGVuZXJzXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNlbW92ZTogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlTW92ZSwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZXVwOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VVcCwgdGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5MSU5FLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgZHJhd2luZyBsaW5lIG1vZGVcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogP251bWJlciwgY29sb3I6ID9zdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnY3Jvc3NoYWlyJztcbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc2V0QnJ1c2goc2V0dGluZyk7XG5cbiAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICBvYmouc2V0KHtcbiAgICAgICAgICAgICAgICBldmVudGVkOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhcy5vbih7XG4gICAgICAgICAgICAnbW91c2U6ZG93bic6IHRoaXMuX2xpc3RlbmVycy5tb3VzZWRvd25cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBicnVzaFxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiA/bnVtYmVyLCBjb2xvcjogP3N0cmluZ319IFtzZXR0aW5nXSAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKi9cbiAgICBzZXRCcnVzaDogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB2YXIgYnJ1c2ggPSB0aGlzLmdldENhbnZhcygpLmZyZWVEcmF3aW5nQnJ1c2g7XG5cbiAgICAgICAgc2V0dGluZyA9IHNldHRpbmcgfHwge307XG4gICAgICAgIHRoaXMuX3dpZHRoID0gc2V0dGluZy53aWR0aCB8fCB0aGlzLl93aWR0aDtcblxuICAgICAgICBpZiAoc2V0dGluZy5jb2xvcikge1xuICAgICAgICAgICAgdGhpcy5fb0NvbG9yID0gbmV3IGZhYnJpYy5Db2xvcihzZXR0aW5nLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBicnVzaC53aWR0aCA9IHRoaXMuX3dpZHRoO1xuICAgICAgICBicnVzaC5jb2xvciA9IHRoaXMuX29Db2xvci50b1JnYmEoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGRyYXdpbmcgbGluZSBtb2RlXG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSB0cnVlO1xuXG4gICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgZXZlbnRlZDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW91c2Vkb3duIGV2ZW50IGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlRG93bjogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcbiAgICAgICAgdmFyIHBvaW50cyA9IFtwb2ludGVyLngsIHBvaW50ZXIueSwgcG9pbnRlci54LCBwb2ludGVyLnldO1xuXG4gICAgICAgIHRoaXMuX2xpbmUgPSBuZXcgZmFicmljLkxpbmUocG9pbnRzLCB7XG4gICAgICAgICAgICBzdHJva2U6IHRoaXMuX29Db2xvci50b1JnYmEoKSxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiB0aGlzLl93aWR0aCxcbiAgICAgICAgICAgIGV2ZW50ZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2xpbmUuc2V0KGNvbnN0cy5mT2JqZWN0T3B0aW9ucy5TRUxFQ1RJT05fU1RZTEUpO1xuXG4gICAgICAgIGNhbnZhcy5hZGQodGhpcy5fbGluZSk7XG5cbiAgICAgICAgY2FudmFzLm9uKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3VzZW1vdmUgZXZlbnQgaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VNb3ZlOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIHZhciBwb2ludGVyID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuXG4gICAgICAgIHRoaXMuX2xpbmUuc2V0KHtcbiAgICAgICAgICAgIHgyOiBwb2ludGVyLngsXG4gICAgICAgICAgICB5MjogcG9pbnRlci55XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2xpbmUuc2V0Q29vcmRzKCk7XG5cbiAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3VzZXVwIGV2ZW50IGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlVXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICB0aGlzLl9saW5lID0gbnVsbDtcblxuICAgICAgICBjYW52YXMub2ZmKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmU7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBNYWluIGNvbXBvbmVudCBoYXZpbmcgY2FudmFzICYgaW1hZ2UsIHNldCBjc3MtbWF4LWRpbWVuc2lvbiBvZiBjYW52YXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgREVGQVVMVF9DU1NfTUFYX1dJRFRIID0gMTAwMDtcbnZhciBERUZBVUxUX0NTU19NQVhfSEVJR0hUID0gODAwO1xuXG52YXIgY3NzT25seSA9IHtcbiAgICBjc3NPbmx5OiB0cnVlXG59O1xudmFyIGJhY2tzdG9yZU9ubHkgPSB7XG4gICAgYmFja3N0b3JlT25seTogdHJ1ZVxufTtcblxuLyoqXG4gKiBNYWluIGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqIEBjbGFzc1xuICovXG52YXIgTWFpbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBNYWluLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBjYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkltYWdlfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW52YXNJbWFnZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1heCB3aWR0aCBvZiBjYW52YXMgZWxlbWVudHNcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3NzTWF4V2lkdGggPSBERUZBVUxUX0NTU19NQVhfV0lEVEg7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1heCBoZWlnaHQgb2YgY2FudmFzIGVsZW1lbnRzXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNzc01heEhlaWdodCA9IERFRkFVTFRfQ1NTX01BWF9IRUlHSFQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltYWdlIG5hbWVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuTUFJTixcblxuICAgIC8qKlxuICAgICAqIFRvIGRhdGEgdXJsIGZyb20gY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSS5cbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzICYmIHRoaXMuY2FudmFzLnRvRGF0YVVSTCh0eXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IGNhbnZhc0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIGNhbnZhc0ltYWdlKSB7XG4gICAgICAgIGlmIChjYW52YXNJbWFnZSkge1xuICAgICAgICAgICAgdHVpLnV0aWwuc3RhbXAoY2FudmFzSW1hZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VOYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jYW52YXNJbWFnZSA9IGNhbnZhc0ltYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY3NzIG1heCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IG1heERpbWVuc2lvbiAtIE1heCB3aWR0aCAmIE1heCBoZWlnaHRcbiAgICAgKi9cbiAgICBzZXRDc3NNYXhEaW1lbnNpb246IGZ1bmN0aW9uKG1heERpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmNzc01heFdpZHRoID0gbWF4RGltZW5zaW9uLndpZHRoIHx8IHRoaXMuY3NzTWF4V2lkdGg7XG4gICAgICAgIHRoaXMuY3NzTWF4SGVpZ2h0ID0gbWF4RGltZW5zaW9uLmhlaWdodCB8fCB0aGlzLmNzc01heEhlaWdodDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50IHRvIGZhYnJpYy5DYW52YXNcbiAgICAgKiBAcGFyYW0ge2pRdWVyeXxFbGVtZW50fHN0cmluZ30gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCkge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCQoY2FudmFzRWxlbWVudClbMF0sIHtcbiAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAndHVpLWltYWdlLWVkaXRvci1jYW52YXMtY29udGFpbmVyJ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRqdXN0IGNhbnZhcyBkaW1lbnNpb24gd2l0aCBzY2FsaW5nIGltYWdlXG4gICAgICovXG4gICAgYWRqdXN0Q2FudmFzRGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5jYW52YXNJbWFnZS5zY2FsZSgxKTtcbiAgICAgICAgdmFyIGJvdW5kaW5nUmVjdCA9IGNhbnZhc0ltYWdlLmdldEJvdW5kaW5nUmVjdCgpO1xuICAgICAgICB2YXIgd2lkdGggPSBib3VuZGluZ1JlY3Qud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSBib3VuZGluZ1JlY3QuaGVpZ2h0O1xuICAgICAgICB2YXIgbWF4RGltZW5zaW9uID0gdGhpcy5fY2FsY01heERpbWVuc2lvbih3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLnNldENhbnZhc0Nzc0RpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsIC8vIFNldCBoZWlnaHQgJycgZm9yIElFOVxuICAgICAgICAgICAgJ21heC13aWR0aCc6IG1heERpbWVuc2lvbi53aWR0aCArICdweCcsXG4gICAgICAgICAgICAnbWF4LWhlaWdodCc6IG1heERpbWVuc2lvbi5oZWlnaHQgKyAncHgnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYW52YXMuY2VudGVyT2JqZWN0KGNhbnZhc0ltYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIG1heCBkaW1lbnNpb24gb2YgY2FudmFzXG4gICAgICogVGhlIGNzcy1tYXggZGltZW5zaW9uIGlzIGR5bmFtaWNhbGx5IGRlY2lkZWQgd2l0aCBtYWludGFpbmluZyBpbWFnZSByYXRpb1xuICAgICAqIFRoZSBjc3MtbWF4IGRpbWVuc2lvbiBpcyBsb3dlciB0aGFuIGNhbnZhcyBkaW1lbnNpb24gKGF0dHJpYnV0ZSBvZiBjYW52YXMsIG5vdCBjc3MpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gQ2FudmFzIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIENhbnZhcyBoZWlnaHRcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gLSBNYXggd2lkdGggJiBNYXggaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY01heERpbWVuc2lvbjogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICB2YXIgd1NjYWxlRmFjdG9yID0gdGhpcy5jc3NNYXhXaWR0aCAvIHdpZHRoO1xuICAgICAgICB2YXIgaFNjYWxlRmFjdG9yID0gdGhpcy5jc3NNYXhIZWlnaHQgLyBoZWlnaHQ7XG4gICAgICAgIHZhciBjc3NNYXhXaWR0aCA9IE1hdGgubWluKHdpZHRoLCB0aGlzLmNzc01heFdpZHRoKTtcbiAgICAgICAgdmFyIGNzc01heEhlaWdodCA9IE1hdGgubWluKGhlaWdodCwgdGhpcy5jc3NNYXhIZWlnaHQpO1xuXG4gICAgICAgIGlmICh3U2NhbGVGYWN0b3IgPCAxICYmIHdTY2FsZUZhY3RvciA8IGhTY2FsZUZhY3Rvcikge1xuICAgICAgICAgICAgY3NzTWF4V2lkdGggPSB3aWR0aCAqIHdTY2FsZUZhY3RvcjtcbiAgICAgICAgICAgIGNzc01heEhlaWdodCA9IGhlaWdodCAqIHdTY2FsZUZhY3RvcjtcbiAgICAgICAgfSBlbHNlIGlmIChoU2NhbGVGYWN0b3IgPCAxICYmIGhTY2FsZUZhY3RvciA8IHdTY2FsZUZhY3Rvcikge1xuICAgICAgICAgICAgY3NzTWF4V2lkdGggPSB3aWR0aCAqIGhTY2FsZUZhY3RvcjtcbiAgICAgICAgICAgIGNzc01heEhlaWdodCA9IGhlaWdodCAqIGhTY2FsZUZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogTWF0aC5mbG9vcihjc3NNYXhXaWR0aCksXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGguZmxvb3IoY3NzTWF4SGVpZ2h0KVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGNzc09ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGJhY2tzdG9yZSBvbmx5XG4gICAgICogIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkNhbnZhcy5odG1sI3NldERpbWVuc2lvbnN9XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBiYWNrc3RvcmUgZGltZW5zaW9uXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgc2V0Q2FudmFzQmFja3N0b3JlRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0RGltZW5zaW9ucyhkaW1lbnNpb24sIGJhY2tzdG9yZU9ubHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLkltYWdlLmh0bWwjc2V0fVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmNhbnZhc0ltYWdlO1xuXG4gICAgICAgIGlmICghY2FudmFzSW1hZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhc0ltYWdlLnNldChzZXR0aW5nKS5zZXRDb29yZHMoKTtcbiAgICAgICAgaWYgKHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnJlbmRlckFsbCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY2FudmFzIGVsZW1lbnQgb2YgZmFicmljLkNhbnZhc1tbbG93ZXItY2FudmFzXV1cbiAgICAgKiBAcmV0dXJucyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgZ2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcy5nZXRFbGVtZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBmYWJyaWMuQ2FudmFzIGluc3RhbmNlXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5DYW52YXN9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FudmFzSW1hZ2UgKGZhYnJpYy5JbWFnZSBpbnN0YW5jZSlcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkltYWdlfVxuICAgICAqL1xuICAgIGdldENhbnZhc0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzSW1hZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZU5hbWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFpbjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlIHJvdGF0aW9uIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogSW1hZ2UgUm90YXRpb24gY29tcG9uZW50XG4gKiBAY2xhc3MgUm90YXRpb25cbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICovXG52YXIgUm90YXRpb24gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgUm90YXRpb24ucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5ST1RBVElPTixcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGFuZ2xlXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50QW5nbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYW52YXNJbWFnZSgpLmFuZ2xlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5nbGUgb2YgdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiAgRG8gbm90IGNhbGwgXCJ0aGlzLnNldEltYWdlUHJvcGVydGllc1wiIGZvciBzZXR0aW5nIGFuZ2xlIGRpcmVjdGx5LlxuICAgICAqICBCZWZvcmUgc2V0dGluZyBhbmdsZSwgVGhlIG9yaWdpblgsWSBvZiBpbWFnZSBzaG91bGQgYmUgc2V0IHRvIGNlbnRlci5cbiAgICAgKiAgICAgIFNlZSBcImh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWwjc2V0QW5nbGVcIlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHNldEFuZ2xlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgb2xkQW5nbGUgPSB0aGlzLmdldEN1cnJlbnRBbmdsZSgpICUgMzYwOyAvL1RoZSBhbmdsZSBpcyBsb3dlciB0aGFuIDIqUEkoPT09MzYwIGRlZ3JlZXMpXG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgb2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBjYW52YXNJbWFnZTtcblxuICAgICAgICBhbmdsZSAlPSAzNjA7XG4gICAgICAgIGlmIChhbmdsZSA9PT0gb2xkQW5nbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlID0gdGhpcy5nZXRDYW52YXNJbWFnZSgpO1xuXG4gICAgICAgIG9sZEltYWdlQ2VudGVyID0gY2FudmFzSW1hZ2UuZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgY2FudmFzSW1hZ2Uuc2V0QW5nbGUoYW5nbGUpLnNldENvb3JkcygpO1xuICAgICAgICB0aGlzLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuICAgICAgICBuZXdJbWFnZUNlbnRlciA9IGNhbnZhc0ltYWdlLmdldENlbnRlclBvaW50KCk7XG4gICAgICAgIHRoaXMuX3JvdGF0ZUZvckVhY2hPYmplY3Qob2xkSW1hZ2VDZW50ZXIsIG5ld0ltYWdlQ2VudGVyLCBhbmdsZSAtIG9sZEFuZ2xlKTtcblxuICAgICAgICByZXR1cm4ganFEZWZlci5yZXNvbHZlKGFuZ2xlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGZvciBlYWNoIG9iamVjdFxuICAgICAqIEBwYXJhbSB7ZmFicmljLlBvaW50fSBvbGRJbWFnZUNlbnRlciAtIEltYWdlIGNlbnRlciBwb2ludCBiZWZvcmUgcm90YXRpb25cbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5Qb2ludH0gbmV3SW1hZ2VDZW50ZXIgLSBJbWFnZSBjZW50ZXIgcG9pbnQgYWZ0ZXIgcm90YXRpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVEaWZmIC0gSW1hZ2UgYW5nbGUgZGlmZmVyZW5jZSBhZnRlciByb3RhdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JvdGF0ZUZvckVhY2hPYmplY3Q6IGZ1bmN0aW9uKG9sZEltYWdlQ2VudGVyLCBuZXdJbWFnZUNlbnRlciwgYW5nbGVEaWZmKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY2VudGVyRGlmZiA9IHtcbiAgICAgICAgICAgIHg6IG9sZEltYWdlQ2VudGVyLnggLSBuZXdJbWFnZUNlbnRlci54LFxuICAgICAgICAgICAgeTogb2xkSW1hZ2VDZW50ZXIueSAtIG5ld0ltYWdlQ2VudGVyLnlcbiAgICAgICAgfTtcblxuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHZhciBvYmpDZW50ZXIgPSBvYmouZ2V0Q2VudGVyUG9pbnQoKTtcbiAgICAgICAgICAgIHZhciByYWRpYW4gPSBmYWJyaWMudXRpbC5kZWdyZWVzVG9SYWRpYW5zKGFuZ2xlRGlmZik7XG4gICAgICAgICAgICB2YXIgbmV3T2JqQ2VudGVyID0gZmFicmljLnV0aWwucm90YXRlUG9pbnQob2JqQ2VudGVyLCBvbGRJbWFnZUNlbnRlciwgcmFkaWFuKTtcblxuICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgbGVmdDogbmV3T2JqQ2VudGVyLnggLSBjZW50ZXJEaWZmLngsXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdPYmpDZW50ZXIueSAtIGNlbnRlckRpZmYueSxcbiAgICAgICAgICAgICAgICBhbmdsZTogKG9iai5hbmdsZSArIGFuZ2xlRGlmZikgJSAzNjBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLnNldENvb3JkcygpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFkZGl0aW9uYWxBbmdsZSAtIEFkZGl0aW9uYWwgYW5nbGVcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24oYWRkaXRpb25hbEFuZ2xlKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBbmdsZShjdXJyZW50ICsgYWRkaXRpb25hbEFuZ2xlKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3RhdGlvbjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IFRleHQgbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGRlZmF1bHRTdHlsZXMgPSB7XG4gICAgZmlsbDogJyMwMDAwMDAnLFxuICAgIGxlZnQ6IDAsXG4gICAgdG9wOiAwLFxuICAgIHBhZGRpbmc6IDIwXG59O1xudmFyIHJlc2V0U3R5bGVzID0ge1xuICAgIGZpbGw6ICcjMDAwMDAwJyxcbiAgICBmb250U3R5bGU6ICdub3JtYWwnLFxuICAgIGZvbnRXZWlnaHQ6ICdub3JtYWwnLFxuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHREZWNvcmFpdG9uOiAnJ1xufTtcblxuLyoqXG4gKiBUZXh0XG4gKiBAY2xhc3MgVGV4dFxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKi9cbnZhciBUZXh0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIFRleHQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWZhdWx0IHRleHQgc3R5bGVcbiAgICAgICAgICogQHR5cGUge29iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RlZmF1bHRTdHlsZXMgPSBkZWZhdWx0U3R5bGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLlRFWFQsXG5cbiAgICAvKipcbiAgICAgKiBBZGQgbmV3IHRleHQgb24gY2FudmFzIGltYWdlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBJbml0aWFsIGlucHV0IHRleHRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgdGV4dFxuICAgICAqICAgICBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuc3R5bGVzXSBJbml0aWFsIHN0eWxlc1xuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnN0eWxlcy5maWxsXSBDb2xvclxuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnN0eWxlcy5mb250RmFtaWx5XSBGb250IHR5cGUgZm9yIHRleHRcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdHlsZXMuZm9udFNpemVdIFNpemVcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zdHlsZXMuZm9udFN0eWxlXSBUeXBlIG9mIGluY2xpbmF0aW9uIChub3JtYWwgLyBpdGFsaWMpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc3R5bGVzLmZvbnRXZWlnaHRdIFR5cGUgb2YgdGhpY2tlciBvciB0aGlubmVyIGxvb2tpbmcgKG5vcm1hbCAvIGJvbGQpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc3R5bGVzLnRleHRBbGlnbl0gVHlwZSBvZiB0ZXh0IGFsaWduIChsZWZ0IC8gY2VudGVyIC8gcmlnaHQpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc3R5bGVzLnRleHREZWNvcmFpdG9uXSBUeXBlIG9mIGxpbmUgKHVuZGVybGluZSAvIGxpbmUtdGhyb2doIC8gb3ZlcmxpbmUpXG4gICAgICogICAgIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gW29wdGlvbnMucG9zaXRpb25dIC0gSW5pdGlhbCBwb3NpdGlvblxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24odGV4dCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHN0eWxlcyA9IHRoaXMuX2RlZmF1bHRTdHlsZXM7XG4gICAgICAgIHZhciBuZXdUZXh0O1xuXG4gICAgICAgIGlmIChvcHRpb25zLnN0eWxlcykge1xuICAgICAgICAgICAgc3R5bGVzID0gdHVpLnV0aWwuZXh0ZW5kKG9wdGlvbnMuc3R5bGVzLCBzdHlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0SW5pdFBvcyhvcHRpb25zLnBvc2l0aW9uKTtcblxuICAgICAgICBuZXdUZXh0ID0gbmV3IGZhYnJpYy5UZXh0KHRleHQsIHN0eWxlcyk7XG5cbiAgICAgICAgbmV3VGV4dC5zZXQoY29uc3RzLmZPYmplY3RPcHRpb25zLlNFTEVDVElPTl9TVFlMRSk7XG5cbiAgICAgICAgY2FudmFzLmFkZChuZXdUZXh0KTtcblxuICAgICAgICBpZiAoIWNhbnZhcy5nZXRBY3RpdmVPYmplY3QoKSkge1xuICAgICAgICAgICAgY2FudmFzLnNldEFjdGl2ZU9iamVjdChuZXdUZXh0KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGV4dCBvZiBhY3RpdmF0ZSBvYmplY3Qgb24gY2FudmFzIGltYWdlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGFjdGl2ZU9iaiAtIEN1cnJlbnQgc2VsZWN0ZWQgdGV4dCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIENoYWdpbmcgdGV4dFxuICAgICAqL1xuICAgIGNoYW5nZTogZnVuY3Rpb24oYWN0aXZlT2JqLCB0ZXh0KSB7XG4gICAgICAgIGFjdGl2ZU9iai5zZXQoJ3RleHQnLCB0ZXh0KTtcblxuICAgICAgICB0aGlzLmdldENhbnZhcygpLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3R5bGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYWN0aXZlT2JqIC0gQ3VycmVudCBzZWxlY3RlZCB0ZXh0IG9iamVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzdHlsZU9iaiAtIEluaXRpYWwgc3R5bGVzXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZmlsbF0gQ29sb3JcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai5mb250RmFtaWx5XSBGb250IHR5cGUgZm9yIHRleHRcbiAgICAgKiAgICAgQHBhcmFtIHtudW1iZXJ9IFtzdHlsZU9iai5mb250U2l6ZV0gU2l6ZVxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLmZvbnRTdHlsZV0gVHlwZSBvZiBpbmNsaW5hdGlvbiAobm9ybWFsIC8gaXRhbGljKVxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLmZvbnRXZWlnaHRdIFR5cGUgb2YgdGhpY2tlciBvciB0aGlubmVyIGxvb2tpbmcgKG5vcm1hbCAvIGJvbGQpXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmoudGV4dEFsaWduXSBUeXBlIG9mIHRleHQgYWxpZ24gKGxlZnQgLyBjZW50ZXIgLyByaWdodClcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai50ZXh0RGVjb3JhaXRvbl0gVHlwZSBvZiBsaW5lICh1bmRlcmxpbmUgLyBsaW5lLXRocm9naCAvIG92ZXJsaW5lKVxuICAgICAqL1xuICAgIHNldFN0eWxlOiBmdW5jdGlvbihhY3RpdmVPYmosIHN0eWxlT2JqKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc3R5bGVPYmosIGZ1bmN0aW9uKHZhbCwga2V5KSB7XG4gICAgICAgICAgICBpZiAoYWN0aXZlT2JqW2tleV0gPT09IHZhbCkge1xuICAgICAgICAgICAgICAgIHN0eWxlT2JqW2tleV0gPSByZXNldFN0eWxlc1trZXldIHx8ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBhY3RpdmVPYmouc2V0KHN0eWxlT2JqKTtcblxuICAgICAgICB0aGlzLmdldENhbnZhcygpLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5pdGlhbCBwb3NpdGlvbiBvbiBjYW52YXMgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IFtwb3NpdGlvbl0gLSBTZWxlY3RlZCBwb3NpdGlvblxuICAgICAqL1xuICAgIF9zZXRJbml0UG9zOiBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKS5nZXRDZW50ZXJQb2ludCgpO1xuXG4gICAgICAgIHRoaXMuX2RlZmF1bHRTdHlsZXMubGVmdCA9IHBvc2l0aW9uLng7XG4gICAgICAgIHRoaXMuX2RlZmF1bHRTdHlsZXMudG9wID0gcG9zaXRpb24ueTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXh0O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ29uc3RhbnRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVzXG4gICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGNvbXBvbmVudE5hbWVzOiB1dGlsLmtleU1pcnJvcihcbiAgICAgICAgJ01BSU4nLFxuICAgICAgICAnSU1BR0VfTE9BREVSJyxcbiAgICAgICAgJ0NST1BQRVInLFxuICAgICAgICAnRkxJUCcsXG4gICAgICAgICdST1RBVElPTicsXG4gICAgICAgICdGUkVFX0RSQVdJTkcnLFxuICAgICAgICAnTElORScsXG4gICAgICAgICdURVhUJyxcbiAgICAgICAgJ0lDT04nLFxuICAgICAgICAnRklMVEVSJ1xuICAgICksXG5cbiAgICAvKipcbiAgICAgKiBDb21tYW5kIG5hbWVzXG4gICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGNvbW1hbmROYW1lczogdXRpbC5rZXlNaXJyb3IoXG4gICAgICAgICdDTEVBUicsXG4gICAgICAgICdMT0FEX0lNQUdFJyxcbiAgICAgICAgJ0ZMSVBfSU1BR0UnLFxuICAgICAgICAnUk9UQVRFX0lNQUdFJyxcbiAgICAgICAgJ0FERF9PQkpFQ1QnLFxuICAgICAgICAnUkVNT1ZFX09CSkVDVCcsXG4gICAgICAgICdBUFBMWV9GSUxURVInXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IG5hbWVzXG4gICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fVxuICAgICAqL1xuICAgIGV2ZW50TmFtZXM6IHtcbiAgICAgICAgTE9BRF9JTUFHRTogJ2xvYWRJbWFnZScsXG4gICAgICAgIENMRUFSX09CSkVDVFM6ICdjbGVhck9iamVjdHMnLFxuICAgICAgICBDTEVBUl9JTUFHRTogJ2NsZWFySW1hZ2UnLFxuICAgICAgICBTVEFSVF9DUk9QUElORzogJ3N0YXJ0Q3JvcHBpbmcnLFxuICAgICAgICBFTkRfQ1JPUFBJTkc6ICdlbmRDcm9wcGluZycsXG4gICAgICAgIEZMSVBfSU1BR0U6ICdmbGlwSW1hZ2UnLFxuICAgICAgICBST1RBVEVfSU1BR0U6ICdyb3RhdGVJbWFnZScsXG4gICAgICAgIEFERF9PQkpFQ1Q6ICdhZGRPYmplY3QnLFxuICAgICAgICBSRU1PVkVfT0JKRUNUOiAncmVtb3ZlT2JqZWN0JyxcbiAgICAgICAgQURKVVNUX09CSkVDVDogJ2FkanVzdE9iamVjdCcsXG4gICAgICAgIFNUQVJUX0ZSRUVfRFJBV0lORzogJ3N0YXJ0RnJlZURyYXdpbmcnLFxuICAgICAgICBFTkRfRlJFRV9EUkFXSU5HOiAnZW5kRnJlZURyYXdpbmcnLFxuICAgICAgICBTVEFSVF9MSU5FX0RSQVdJTkc6ICdzdGFydExpbmVEcmF3aW5nJyxcbiAgICAgICAgRU5EX0xJTkVfRFJBV0lORzogJ2VuZExpbmVEcmF3aW5nJyxcbiAgICAgICAgRU1QVFlfUkVET19TVEFDSzogJ2VtcHR5UmVkb1N0YWNrJyxcbiAgICAgICAgRU1QVFlfVU5ET19TVEFDSzogJ2VtcHR5VW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9VTkRPX1NUQUNLOiAncHVzaFVuZG9TdGFjaycsXG4gICAgICAgIFBVU0hfUkVET19TVEFDSzogJ3B1c2hSZWRvU3RhY2snLFxuICAgICAgICBBQ1RJVkFURV9URVhUOiAnYWN0aXZhdGVUZXh0JyxcbiAgICAgICAgQVBQTFlfRklMVEVSOiAnYXBwbHlGaWx0ZXInXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVkaXRvciBzdGF0ZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgc3RhdGVzOiB1dGlsLmtleU1pcnJvcihcbiAgICAgICAgJ05PUk1BTCcsXG4gICAgICAgICdDUk9QJyxcbiAgICAgICAgJ0ZSRUVfRFJBV0lORycsXG4gICAgICAgICdMSU5FJyxcbiAgICAgICAgJ1RFWFQnXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIFNob3J0Y3V0IGtleSB2YWx1ZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIG51bWJlcj59XG4gICAgICovXG4gICAga2V5Q29kZXM6IHtcbiAgICAgICAgWjogOTAsXG4gICAgICAgIFk6IDg5LFxuICAgICAgICBTSElGVDogMTZcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmFicmljIG9iamVjdCBvcHRpb25zXG4gICAgICogQHR5cGUge09iamVjdC48c3RyaW5nLCBPYmplY3Q+fVxuICAgICAqL1xuICAgIGZPYmplY3RPcHRpb25zOiB7XG4gICAgICAgIFNFTEVDVElPTl9TVFlMRToge1xuICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZWQnLFxuICAgICAgICAgICAgY29ybmVyQ29sb3I6ICdncmVlbicsXG4gICAgICAgICAgICBjb3JuZXJTaXplOiAxMCxcbiAgICAgICAgICAgIG9yaWdpblg6ICdjZW50ZXInLFxuICAgICAgICAgICAgb3JpZ2luWTogJ2NlbnRlcicsXG4gICAgICAgICAgICB0cmFuc3BhcmVudENvcm5lcnM6IGZhbHNlLFxuICAgICAgICAgICAgcm90YXRpbmdQb2ludE9mZnNldDogMzBcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDcm9wem9uZSBleHRlbmRpbmcgZmFicmljLlJlY3RcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2xhbXAgPSByZXF1aXJlKCcuLi91dGlsJykuY2xhbXA7XG5cbnZhciBDT1JORVJfVFlQRV9UT1BfTEVGVCA9ICd0bCc7XG52YXIgQ09STkVSX1RZUEVfVE9QX1JJR0hUID0gJ3RyJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfVE9QID0gJ210JztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfTEVGVCA9ICdtbCc7XG52YXIgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUID0gJ21yJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NID0gJ21iJztcbnZhciBDT1JORVJfVFlQRV9CT1RUT01fTEVGVCA9ICdibCc7XG52YXIgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUID0gJ2JyJztcblxuLyoqXG4gKiBDcm9wem9uZSBvYmplY3RcbiAqIElzc3VlOiBJRTcsIDgod2l0aCBleGNhbnZhcylcbiAqICAtIENyb3B6b25lIGlzIGEgYmxhY2sgem9uZSB3aXRob3V0IHRyYW5zcGFyZW5jeS5cbiAqIEBjbGFzcyBDcm9wem9uZVxuICogQGV4dGVuZHMge2ZhYnJpYy5SZWN0fVxuICovXG52YXIgQ3JvcHpvbmUgPSBmYWJyaWMudXRpbC5jcmVhdGVDbGFzcyhmYWJyaWMuUmVjdCwgLyoqIEBsZW5kcyBDcm9wem9uZS5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdFxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucy50eXBlID0gJ2Nyb3B6b25lJztcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ2luaXRpYWxpemUnLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbih7XG4gICAgICAgICAgICAnbW92aW5nJzogdGhpcy5fb25Nb3ZpbmcsXG4gICAgICAgICAgICAnc2NhbGluZyc6IHRoaXMuX29uU2NhbGluZ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIENyb3Atem9uZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBfcmVuZGVyOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRmxpcFgsIG9yaWdpbmFsRmxpcFksXG4gICAgICAgICAgICBvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVksXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lV2lkdGggPSA3LFxuICAgICAgICAgICAgY3JvcHpvbmVEYXNoTGluZU9mZnNldCA9IDc7XG4gICAgICAgIHRoaXMuY2FsbFN1cGVyKCdfcmVuZGVyJywgY3R4KTtcblxuICAgICAgICAvLyBDYWxjIG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIG9yaWdpbmFsRmxpcFggPSB0aGlzLmZsaXBYID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbEZsaXBZID0gdGhpcy5mbGlwWSA/IC0xIDogMTtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVggPSBvcmlnaW5hbEZsaXBYIC8gdGhpcy5zY2FsZVg7XG4gICAgICAgIG9yaWdpbmFsU2NhbGVZID0gb3JpZ2luYWxGbGlwWSAvIHRoaXMuc2NhbGVZO1xuXG4gICAgICAgIC8vIFNldCBvcmlnaW5hbCBzY2FsZVxuICAgICAgICBjdHguc2NhbGUob3JpZ2luYWxTY2FsZVgsIG9yaWdpbmFsU2NhbGVZKTtcblxuICAgICAgICAvLyBSZW5kZXIgb3V0ZXIgcmVjdFxuICAgICAgICB0aGlzLl9maWxsT3V0ZXJSZWN0KGN0eCwgJ3JnYmEoMCwgMCwgMCwgMC41NSknKTtcblxuICAgICAgICAvLyBCbGFjayBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigwLCAwLCAwKScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCk7XG5cbiAgICAgICAgLy8gV2hpdGUgZGFzaCBsaW5lXG4gICAgICAgIHRoaXMuX3N0cm9rZUJvcmRlcihjdHgsICdyZ2IoMjU1LCAyNTUsIDI1NSknLCBjcm9wem9uZURhc2hMaW5lV2lkdGgsIGNyb3B6b25lRGFzaExpbmVPZmZzZXQpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZSgxIC8gb3JpZ2luYWxTY2FsZVgsIDEgLyBvcmlnaW5hbFNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyb3B6b25lLWNvb3JkaW5hdGVzIHdpdGggb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICpcbiAgICAgKiAgICAgeDAgICAgIHgxICAgICAgICAgeDIgICAgICB4M1xuICAgICAqICB5MCArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3wgICAgLy8gPC0tLSBcIk91dGVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgeTEgKy0tLS0tLS0rLS0tLS0tLS0tLSstLS0tLS0tK1xuICAgICAqICAgICB8Ly8vLy8vL3wgQ3JvcHpvbmUgfC8vLy8vLy98ICAgIENyb3B6b25lIGlzIHRoZSBcIklubmVyLXJlY3RhbmdsZVwiXG4gICAgICogICAgIHwvLy8vLy8vfCAgKDAsIDApICB8Ly8vLy8vL3wgICAgQ2VudGVyIHBvaW50ICgwLCAwKVxuICAgICAqICB5MiArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfC8vLy8vLy8vLy98Ly8vLy8vL3xcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4gICAgICpcbiAgICAgKiBAdHlwZWRlZiB7e3g6IEFycmF5PG51bWJlcj4sIHk6IEFycmF5PG51bWJlcj59fSBjcm9wem9uZUNvb3JkaW5hdGVzXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBGaWxsIG91dGVyIHJlY3RhbmdsZVxuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHBhcmFtIHtzdHJpbmd8Q2FudmFzR3JhZGllbnR8Q2FudmFzUGF0dGVybn0gZmlsbFN0eWxlIC0gRmlsbC1zdHlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpbGxPdXRlclJlY3Q6IGZ1bmN0aW9uKGN0eCwgZmlsbFN0eWxlKSB7XG4gICAgICAgIHZhciBjb29yZGluYXRlcyA9IHRoaXMuX2dldENvb3JkaW5hdGVzKGN0eCksXG4gICAgICAgICAgICB4ID0gY29vcmRpbmF0ZXMueCxcbiAgICAgICAgICAgIHkgPSBjb29yZGluYXRlcy55O1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyBPdXRlciByZWN0YW5nbGVcbiAgICAgICAgLy8gTnVtYmVycyBhcmUgKy8tMSBzbyB0aGF0IG92ZXJsYXkgZWRnZXMgZG9uJ3QgZ2V0IGJsdXJyeS5cbiAgICAgICAgY3R4Lm1vdmVUbyh4WzBdIC0gMSwgeVswXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbM10gKyAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbM10gKyAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzBdIC0gMSwgeVszXSAtIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgICAvLyBJbm5lciByZWN0YW5nbGVcbiAgICAgICAgY3R4Lm1vdmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzJdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzJdLCB5WzFdKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb29yZGluYXRlc1xuICAgICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjdHggLSBDb250ZXh0XG4gICAgICogQHJldHVybnMge2Nyb3B6b25lQ29vcmRpbmF0ZXN9IC0ge0BsaW5rIGNyb3B6b25lQ29vcmRpbmF0ZXN9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29vcmRpbmF0ZXM6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgY2VpbCA9IE1hdGguY2VpbCxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSxcbiAgICAgICAgICAgIGhhbGZXaWR0aCA9IHdpZHRoIC8gMixcbiAgICAgICAgICAgIGhhbGZIZWlnaHQgPSBoZWlnaHQgLyAyLFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy5nZXRUb3AoKSxcbiAgICAgICAgICAgIGNhbnZhc0VsID0gY3R4LmNhbnZhczsgLy8gY2FudmFzIGVsZW1lbnQsIG5vdCBmYWJyaWMgb2JqZWN0XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGggKyBsZWZ0KSwgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MFxuICAgICAgICAgICAgICAgIC0oaGFsZldpZHRoKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDFcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGgsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgyXG4gICAgICAgICAgICAgICAgaGFsZldpZHRoICsgKGNhbnZhc0VsLndpZHRoIC0gbGVmdCAtIHdpZHRoKSAvLyB4M1xuICAgICAgICAgICAgXSwgY2VpbCksXG4gICAgICAgICAgICB5OiB0dWkudXRpbC5tYXAoW1xuICAgICAgICAgICAgICAgIC0oaGFsZkhlaWdodCArIHRvcCksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkwXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0KSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTFcbiAgICAgICAgICAgICAgICBoYWxmSGVpZ2h0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MlxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQgKyAoY2FudmFzRWwuaGVpZ2h0IC0gdG9wIC0gaGVpZ2h0KSAgIC8vIHkzXG4gICAgICAgICAgICBdLCBjZWlsKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdHJva2UgYm9yZGVyXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBzdHJva2VTdHlsZSAtIFN0cm9rZS1zdHlsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lRGFzaFdpZHRoIC0gRGFzaCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbGluZURhc2hPZmZzZXRdIC0gRGFzaCBvZmZzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zdHJva2VCb3JkZXI6IGZ1bmN0aW9uKGN0eCwgc3Ryb2tlU3R5bGUsIGxpbmVEYXNoV2lkdGgsIGxpbmVEYXNoT2Zmc2V0KSB7XG4gICAgICAgIHZhciBoYWxmV2lkdGggPSB0aGlzLmdldFdpZHRoKCkgLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCkgLyAyO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgICBpZiAoY3R4LnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBjdHguc2V0TGluZURhc2goW2xpbmVEYXNoV2lkdGgsIGxpbmVEYXNoV2lkdGhdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgICAgIGN0eC5saW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LmxpbmVUbyhoYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIGhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKC1oYWxmV2lkdGgsIC1oYWxmSGVpZ2h0KTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTW92aW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3Zpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgbWF4TGVmdCA9IGNhbnZhcy5nZXRXaWR0aCgpIC0gd2lkdGgsXG4gICAgICAgICAgICBtYXhUb3AgPSBjYW52YXMuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5zZXRMZWZ0KGNsYW1wKGxlZnQsIDAsIG1heExlZnQpKTtcbiAgICAgICAgdGhpcy5zZXRUb3AoY2xhbXAodG9wLCAwLCBtYXhUb3ApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25TY2FsaW5nIGV2ZW50IGxpc3RlbmVyXG4gICAgICogQHBhcmFtIHt7ZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uU2NhbGluZzogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBwb2ludGVyID0gdGhpcy5jYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IHRoaXMuX2NhbGNTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXIpO1xuXG4gICAgICAgIC8vIE9uIHNjYWxpbmcgY3JvcHpvbmUsXG4gICAgICAgIC8vIGNoYW5nZSByZWFsIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGZpeCBzY2FsZUZhY3RvciB0byAxXG4gICAgICAgIHRoaXMuc2NhbGUoMSkuc2V0KHNldHRpbmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsYyBzY2FsZWQgc2l6ZSBmcm9tIG1vdXNlIHBvaW50ZXIgd2l0aCBzZWxlY3RlZCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IHBvaW50ZXIgLSBNb3VzZSBwb3NpdGlvblxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEhhdmluZyBsZWZ0IG9yKGFuZCkgdG9wIG9yKGFuZCkgd2lkdGggb3IoYW5kKSBoZWlnaHQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHBvaW50ZXIpIHtcbiAgICAgICAgdmFyIHBvaW50ZXJYID0gcG9pbnRlci54LFxuICAgICAgICAgICAgcG9pbnRlclkgPSBwb2ludGVyLnksXG4gICAgICAgICAgICB0bFNjYWxpbmdTaXplID0gdGhpcy5fY2FsY1RvcExlZnRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSksXG4gICAgICAgICAgICBiclNjYWxpbmdTaXplID0gdGhpcy5fY2FsY0JvdHRvbVJpZ2h0U2NhbGluZ1NpemVGcm9tUG9pbnRlcihwb2ludGVyWCwgcG9pbnRlclkpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEB0b2RvOiDsnbzrsJgg6rCd7LK07JeQ7IScIHNoaWZ0IOyhsO2Vqe2CpOulvCDriITrpbTrqbQgZnJlZSBzaXplIHNjYWxpbmfsnbQg65CoIC0tPiDtmZXsnbjtlbTrs7zqsoNcbiAgICAgICAgICogICAgICBjYW52YXMuY2xhc3MuanMgLy8gX3NjYWxlT2JqZWN0OiBmdW5jdGlvbiguLi4pey4uLn1cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlU2NhbGluZ1NldHRpbmdzKHRsU2NhbGluZ1NpemUsIGJyU2NhbGluZ1NpemUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZShwb3NpdGlvbiArIGRpbWVuc2lvbikgZnJvbSBsZWZ0LXRvcCBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHRoaXMuZ2V0SGVpZ2h0KCkgKyB0aGlzLnRvcCxcbiAgICAgICAgICAgIHJpZ2h0ID0gdGhpcy5nZXRXaWR0aCgpICsgdGhpcy5sZWZ0LFxuICAgICAgICAgICAgdG9wID0gY2xhbXAoeSwgMCwgYm90dG9tIC0gMSksICAvLyAwIDw9IHRvcCA8PSAoYm90dG9tIC0gMSlcbiAgICAgICAgICAgIGxlZnQgPSBjbGFtcCh4LCAwLCByaWdodCAtIDEpOyAgLy8gMCA8PSBsZWZ0IDw9IChyaWdodCAtIDEpXG5cbiAgICAgICAgLy8gV2hlbiBzY2FsaW5nIFwiVG9wLUxlZnQgY29ybmVyXCI6IEl0IGZpeGVzIHJpZ2h0IGFuZCBib3R0b20gY29vcmRpbmF0ZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiByaWdodCAtIGxlZnQsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvdHRvbSAtIHRvcFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxpbmcgc2l6ZSBmcm9tIHJpZ2h0LWJvdHRvbSBjb3JuZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIE1vdXNlIHBvc2l0aW9uIFhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIE1vdXNlIHBvc2l0aW9uIFlcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIG1heFggPSBjYW52YXMud2lkdGgsXG4gICAgICAgICAgICBtYXhZID0gY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSB0aGlzLnRvcDtcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJCb3R0b20tUmlnaHQgY29ybmVyXCI6IEl0IGZpeGVzIGxlZnQgYW5kIHRvcCBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IGNsYW1wKHgsIChsZWZ0ICsgMSksIG1heFgpIC0gbGVmdCwgICAgLy8gKHdpZHRoID0geCAtIGxlZnQpLCAobGVmdCArIDEgPD0geCA8PSBtYXhYKVxuICAgICAgICAgICAgaGVpZ2h0OiBjbGFtcCh5LCAodG9wICsgMSksIG1heFkpIC0gdG9wICAgICAgLy8gKGhlaWdodCA9IHkgLSB0b3ApLCAodG9wICsgMSA8PSB5IDw9IG1heFkpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSovXG4gICAgLyoqXG4gICAgICogTWFrZSBzY2FsaW5nIHNldHRpbmdzXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGxlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9fSB0bCAtIFRvcC1MZWZ0IHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGJyIC0gQm90dG9tLVJpZ2h0IHNldHRpbmdcbiAgICAgKiBAcmV0dXJucyB7e3dpZHRoOiA/bnVtYmVyLCBoZWlnaHQ6ID9udW1iZXIsIGxlZnQ6ID9udW1iZXIsIHRvcDogP251bWJlcn19IFBvc2l0aW9uIHNldHRpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU2NhbGluZ1NldHRpbmdzOiBmdW5jdGlvbih0bCwgYnIpIHtcbiAgICAgICAgdmFyIHRsV2lkdGggPSB0bC53aWR0aCxcbiAgICAgICAgICAgIHRsSGVpZ2h0ID0gdGwuaGVpZ2h0LFxuICAgICAgICAgICAgYnJIZWlnaHQgPSBici5oZWlnaHQsXG4gICAgICAgICAgICBicldpZHRoID0gYnIud2lkdGgsXG4gICAgICAgICAgICB0bExlZnQgPSB0bC5sZWZ0LFxuICAgICAgICAgICAgdGxUb3AgPSB0bC50b3AsXG4gICAgICAgICAgICBzZXR0aW5ncztcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuX19jb3JuZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB0bDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfVE9QX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBickhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0gYnI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9MRUZUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGxXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGxMZWZ0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1RPUDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0bEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0bFRvcFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9SSUdIVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGJyV2lkdGhcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfQk9UVE9NOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgfSwgLyplc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSB3aGV0aGVyIHRoaXMgY3JvcHpvbmUgaXMgdmFsaWRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMubGVmdCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLnRvcCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLndpZHRoID4gMCAmJlxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPiAwXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHpvbmU7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBNYXNrIGV4dGVuZGluZyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5NYXNrXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYXNrIG9iamVjdFxuICogQGNsYXNzIE1hc2tcbiAqIEBleHRlbmRzIHtmYWJyaWMuSW1hZ2UuZmlsdGVycy5NYXNrfVxuICovXG52YXIgTWFzayA9IGZhYnJpYy51dGlsLmNyZWF0ZUNsYXNzKGZhYnJpYy5JbWFnZS5maWx0ZXJzLk1hc2ssIC8qKiBAbGVuZHMgTWFzay5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogQXBwbHkgZmlsdGVyIHRvIGNhbnZhcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNhbnZhc0VsIC0gQ2FudmFzIGVsZW1lbnQgdG8gYXBwbHkgZmlsdGVyXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgYXBwbHlUbzogZnVuY3Rpb24oY2FudmFzRWwpIHtcbiAgICAgICAgdmFyIG1hc2tDYW52YXNFbCwgY3R4LCBtYXNrQ3R4LCBpbWFnZURhdGE7XG4gICAgICAgIHZhciB3aWR0aCwgaGVpZ2h0O1xuXG4gICAgICAgIGlmICghdGhpcy5tYXNrKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aWR0aCA9IGNhbnZhc0VsLndpZHRoO1xuICAgICAgICBoZWlnaHQgPSBjYW52YXNFbC5oZWlnaHQ7XG5cbiAgICAgICAgbWFza0NhbnZhc0VsID0gdGhpcy5fY3JlYXRlQ2FudmFzT2ZNYXNrKHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIGN0eCA9IGNhbnZhc0VsLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIG1hc2tDdHggPSBtYXNrQ2FudmFzRWwuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuX2RyYXdNYXNrKG1hc2tDdHgpO1xuICAgICAgICB0aGlzLl9tYXBEYXRhKG1hc2tDdHgsIGltYWdlRGF0YSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY2FudmFzIG9mIG1hc2sgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBXaWR0aCBvZiBtYWluIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBIZWlnaHQgb2YgbWFpbiBjYW52YXNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IENhbnZhcyBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlQ2FudmFzT2ZNYXNrOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBtYXNrQ2FudmFzRWwgPSBmYWJyaWMudXRpbC5jcmVhdGVDYW52YXNFbGVtZW50KCk7XG5cbiAgICAgICAgbWFza0NhbnZhc0VsLndpZHRoID0gd2lkdGg7XG4gICAgICAgIG1hc2tDYW52YXNFbC5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgcmV0dXJuIG1hc2tDYW52YXNFbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRHJhdyBtYXNrIGltYWdlIG9uIGNhbnZhcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1hc2tDdHggLSBDb250ZXh0IG9mIG1hc2sgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZHJhd01hc2s6IGZ1bmN0aW9uKG1hc2tDdHgpIHtcbiAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQsIGxlZnQsIHRvcDtcbiAgICAgICAgdmFyIG1hc2sgPSB0aGlzLm1hc2s7XG5cbiAgICAgICAgd2lkdGggPSBtYXNrLmdldFdpZHRoKCk7XG4gICAgICAgIGhlaWdodCA9IG1hc2suZ2V0SGVpZ2h0KCk7XG4gICAgICAgIGxlZnQgPSBtYXNrLmdldExlZnQoKSAtICh3aWR0aCAvIDIpO1xuICAgICAgICB0b3AgPSBtYXNrLmdldFRvcCgpIC0gKGhlaWdodCAvIDIpO1xuXG4gICAgICAgIG1hc2tDdHguZHJhd0ltYWdlKG1hc2suZ2V0RWxlbWVudCgpLCBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYXAgbWFzayBpbWFnZSBkYXRhIHRvIHNvdXJjZSBpbWFnZSBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1hc2tDdHggLSBDb250ZXh0IG9mIG1hc2sgY2FudmFzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGltYWdlRGF0YSAtIERhdGEgb2Ygc291cmNlIGltYWdlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gV2lkdGggb2YgbWFpbiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gSGVpZ2h0IG9mIG1haW4gY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFwRGF0YTogZnVuY3Rpb24obWFza0N0eCwgaW1hZ2VEYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBzb3VyY2VEYXRhID0gaW1hZ2VEYXRhLmRhdGE7XG4gICAgICAgIHZhciBtYXNrRGF0YSA9IG1hc2tDdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpLmRhdGE7XG4gICAgICAgIHZhciBjaGFubmVsID0gdGhpcy5jaGFubmVsO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBsZW4gPSBpbWFnZURhdGEud2lkdGggKiBpbWFnZURhdGEuaGVpZ2h0ICogNDtcblxuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgICAgICAgICBzb3VyY2VEYXRhW2kgKyAzXSA9IG1hc2tEYXRhW2kgKyBjaGFubmVsXTsgLy8gYWRqdXN0IHZhbHVlIG9mIGFscGhhIGRhdGFcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc2s7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb21tYW5kIGZhY3RvcnlcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tbWFuZCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21tYW5kJyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBjb21wb25lbnROYW1lcyA9IGNvbnN0cy5jb21wb25lbnROYW1lcztcbnZhciBjb21tYW5kTmFtZXMgPSBjb25zdHMuY29tbWFuZE5hbWVzO1xudmFyIGNyZWF0b3JzID0ge307XG5cbnZhciBNQUlOID0gY29tcG9uZW50TmFtZXMuTUFJTjtcbnZhciBJTUFHRV9MT0FERVIgPSBjb21wb25lbnROYW1lcy5JTUFHRV9MT0FERVI7XG52YXIgRkxJUCA9IGNvbXBvbmVudE5hbWVzLkZMSVA7XG52YXIgUk9UQVRJT04gPSBjb21wb25lbnROYW1lcy5ST1RBVElPTjtcbnZhciBGSUxURVIgPSBjb21wb25lbnROYW1lcy5GSUxURVI7XG5cbi8qKlxuICogU2V0IG1hcHBpbmcgY3JlYXRvcnNcbiAqL1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkxPQURfSU1BR0VdID0gY3JlYXRlTG9hZEltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5GTElQX0lNQUdFXSA9IGNyZWF0ZUZsaXBJbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuUk9UQVRFX0lNQUdFXSA9IGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkNMRUFSX09CSkVDVFNdID0gY3JlYXRlQ2xlYXJDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkFERF9PQkpFQ1RdID0gY3JlYXRlQWRkT2JqZWN0Q29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5SRU1PVkVfT0JKRUNUXSA9IGNyZWF0ZVJlbW92ZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQVBQTFlfRklMVEVSXSA9IGNyZWF0ZUZpbHRlckNvbW1hbmQ7XG5cbi8qKlxuICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fSBvYmplY3QgLSBGYWJyaWMgb2JqZWN0XG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQWRkT2JqZWN0Q29tbWFuZChvYmplY3QpIHtcbiAgICB0dWkudXRpbC5zdGFtcChvYmplY3QpO1xuXG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKCFjYW52YXMuY29udGFpbnMob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5hZGQob2JqZWN0KTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmIChjYW52YXMuY29udGFpbnMob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5yZW1vdmUob2JqZWN0KTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUob2JqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VOYW1lIC0gSW1hZ2UgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd8ZmFicmljLkltYWdlfSBpbWcgLSBJbWFnZShvciB1cmwpXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9hZEltYWdlQ29tbWFuZChpbWFnZU5hbWUsIGltZykge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gbG9hZGVyLmdldENhbnZhcygpO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgICAgIHByZXZOYW1lOiBsb2FkZXIuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICAgICAgcHJldkltYWdlOiBsb2FkZXIuZ2V0Q2FudmFzSW1hZ2UoKSxcbiAgICAgICAgICAgICAgICAvLyBTbGljZTogXCJjYW52YXMuY2xlYXIoKVwiIGNsZWFycyB0aGUgb2JqZWN0cyBhcnJheSwgU28gc2hhbGxvdyBjb3B5IHRoZSBhcnJheVxuICAgICAgICAgICAgICAgIG9iamVjdHM6IGNhbnZhcy5nZXRPYmplY3RzKCkuc2xpY2UoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoaW1hZ2VOYW1lLCBpbWcpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gY29tcE1hcFtJTUFHRV9MT0FERVJdO1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGxvYWRlci5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG5cbiAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuICAgICAgICAgICAgY2FudmFzLmFkZC5hcHBseShjYW52YXMsIHN0b3JlLm9iamVjdHMpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9hZGVyLmxvYWQoc3RvcmUucHJldk5hbWUsIHN0b3JlLnByZXZJbWFnZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdmbGlwWCcgb3IgJ2ZsaXBZJyBvciAncmVzZXQnXG4gKiBAcmV0dXJucyB7JC5EZWZlcnJlZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRmxpcEltYWdlQ29tbWFuZCh0eXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGZsaXBDb21wID0gY29tcE1hcFtGTElQXTtcblxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IGZsaXBDb21wLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcFt0eXBlXSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICByZXR1cm4gZmxpcENvbXAuc2V0KHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAncm90YXRlJyBvciAnc2V0QW5nbGUnXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBhbmdsZSB2YWx1ZSAoZGVncmVlKVxuICogQHJldHVybnMgeyQuRGVmZXJyZWR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJvdGF0aW9uSW1hZ2VDb21tYW5kKHR5cGUsIGFuZ2xlKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gcm90YXRpb25Db21wLmdldEN1cnJlbnRBbmdsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wW3R5cGVdKGFuZ2xlKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIHJvdGF0aW9uQ29tcCA9IGNvbXBNYXBbUk9UQVRJT05dO1xuXG4gICAgICAgICAgICByZXR1cm4gcm90YXRpb25Db21wLnNldEFuZ2xlKHRoaXMuc3RvcmUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2xlYXIgY29tbWFuZFxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsZWFyQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICAvLyBTbGljZTogXCJjYW52YXMuY2xlYXIoKVwiIGNsZWFycyB0aGUgb2JqZWN0cyBhcnJheSwgU28gc2hhbGxvdyBjb3B5IHRoZSBhcnJheVxuICAgICAgICAgICAgdGhpcy5zdG9yZSA9IGNhbnZhcy5nZXRPYmplY3RzKCkuc2xpY2UoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3JlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQuYXBwbHkoY2FudmFzLCB0aGlzLnN0b3JlKTtcblxuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgY29tbWFuZFxuICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fGZhYnJpYy5Hcm91cH0gdGFyZ2V0IC0gT2JqZWN0KHMpIHRvIHJlbW92ZVxuICogQHJldHVybnMge0NvbW1hbmR9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJlbW92ZUNvbW1hbmQodGFyZ2V0KSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciBpc1ZhbGlkR3JvdXAgPSB0YXJnZXQgJiYgdGFyZ2V0LmlzVHlwZSgnZ3JvdXAnKSAmJiAhdGFyZ2V0LmlzRW1wdHkoKTtcblxuICAgICAgICAgICAgaWYgKGlzVmFsaWRHcm91cCkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5kaXNjYXJkQWN0aXZlR3JvdXAoKTsgLy8gcmVzdG9yZSBzdGF0ZXMgZm9yIGVhY2ggb2JqZWN0c1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB0YXJnZXQuZ2V0T2JqZWN0cygpO1xuICAgICAgICAgICAgICAgIHRhcmdldC5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAgICBvYmoucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNhbnZhcy5jb250YWlucyh0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yZSA9IFt0YXJnZXRdO1xuICAgICAgICAgICAgICAgIHRhcmdldC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuXG4gICAgICAgICAgICBjYW52YXMuYWRkLmFwcGx5KGNhbnZhcywgdGhpcy5zdG9yZSk7XG5cbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogRmlsdGVyIGNvbW1hbmRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gRmlsdGVyIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gRmlsdGVyIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJDb21tYW5kKHR5cGUsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyQ29tcCA9IGNvbXBNYXBbRklMVEVSXTtcblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdtYXNrJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSBvcHRpb25zLm1hc2s7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tYXNrLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQ29tcC5hZGQodHlwZSwgb3B0aW9ucyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXJDb21wID0gY29tcE1hcFtGSUxURVJdO1xuXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ21hc2snKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyQ29tcC5nZXRDYW52YXMoKS5hZGQodGhpcy5zdG9yZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJDb21wLnJlbW92ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBjb21tYW5kXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbW1hbmQgbmFtZVxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gQXJndW1lbnRzIGZvciBjcmVhdGluZyBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIGFyZ3MpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHJldHVybiBjcmVhdG9yc1tuYW1lXS5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEVycm9yLW1lc3NhZ2UgZmFjdG9yeVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBrZXlNaXJyb3IgPSByZXF1aXJlKCcuLi91dGlsJykua2V5TWlycm9yO1xuXG52YXIgdHlwZXMgPSBrZXlNaXJyb3IoXG4gICAgJ1VOX0lNUExFTUVOVEFUSU9OJyxcbiAgICAnTk9fQ09NUE9ORU5UX05BTUUnXG4pO1xuXG52YXIgbWVzc2FnZXMgPSB7XG4gICAgVU5fSU1QTEVNRU5UQVRJT046ICdTaG91bGQgaW1wbGVtZW50IGEgbWV0aG9kOiAnLFxuICAgIE5PX0NPTVBPTkVOVF9OQU1FOiAnU2hvdWxkIHNldCBhIGNvbXBvbmVudCBuYW1lJ1xufTtcblxudmFyIG1hcCA9IHtcbiAgICBVTl9JTVBMRU1FTlRBVElPTjogZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuVU5fSU1QTEVNRU5UQVRJT04gKyBtZXRob2ROYW1lO1xuICAgIH0sXG4gICAgTk9fQ09NUE9ORU5UX05BTUU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZXMuTk9fQ09NUE9ORU5UX05BTUU7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHlwZXM6IHR1aS51dGlsLmV4dGVuZCh7fSwgdHlwZXMpLFxuXG4gICAgY3JlYXRlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBmdW5jO1xuXG4gICAgICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGZ1bmMgPSBtYXBbdHlwZV07XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuXG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEltYWdlLWVkaXRvciBhcHBsaWNhdGlvbiBjbGFzc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbnZva2VyID0gcmVxdWlyZSgnLi9pbnZva2VyJyk7XG52YXIgY29tbWFuZEZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnkvY29tbWFuZCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciBldmVudHMgPSBjb25zdHMuZXZlbnROYW1lcztcbnZhciBjb21tYW5kcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY29tcExpc3QgPSBjb25zdHMuY29tcG9uZW50TmFtZXM7XG52YXIgc3RhdGVzID0gY29uc3RzLnN0YXRlcztcbnZhciBrZXlDb2RlcyA9IGNvbnN0cy5rZXlDb2RlcztcblxuLyoqXG4gKiBJbWFnZSBlZGl0b3JcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uXSAtIENhbnZhcyBtYXggd2lkdGggJiBoZWlnaHQgb2YgY3NzXG4gKiAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbi5jc3NNYXhXaWR0aCAtIENhbnZhcyBjc3MtbWF4LXdpZHRoXG4gKiAgQHBhcmFtIHtudW1iZXJ9IG9wdGlvbi5jc3NNYXhIZWlnaHQgLSBDYW52YXMgY3NzLW1heC1oZWlnaHRcbiAqL1xudmFyIEltYWdlRWRpdG9yID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbWFnZUVkaXRvci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzRWxlbWVudCwgb3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCB7fTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9rZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge0ludm9rZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyID0gbmV3IEludm9rZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmFicmljLUNhbnZhcyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNhbnZhc31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVkaXRvciBjdXJyZW50IHN0YXRlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5OT1JNQUw7XG5cbiAgICAgICAgdGhpcy5fc2V0Q2FudmFzKGNhbnZhc0VsZW1lbnQsIG9wdGlvbi5jc3NNYXhXaWR0aCwgb3B0aW9uLmNzc01heEhlaWdodCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaEludm9rZXJFdmVudHMoKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoQ2FudmFzRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaERvbUV2ZW50cygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggaW52b2tlciBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hJbnZva2VyRXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIFBVU0hfVU5ET19TVEFDSyA9IGV2ZW50cy5QVVNIX1VORE9fU1RBQ0s7XG4gICAgICAgIHZhciBQVVNIX1JFRE9fU1RBQ0sgPSBldmVudHMuUFVTSF9SRURPX1NUQUNLO1xuICAgICAgICB2YXIgRU1QVFlfVU5ET19TVEFDSyA9IGV2ZW50cy5FTVBUWV9VTkRPX1NUQUNLO1xuICAgICAgICB2YXIgRU1QVFlfUkVET19TVEFDSyA9IGV2ZW50cy5FTVBUWV9SRURPX1NUQUNLO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNwdXNoVW5kb1N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKFBVU0hfVU5ET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIFBVU0hfVU5ET19TVEFDSykpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjcHVzaFJlZG9TdGFja1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlci5vbihQVVNIX1JFRE9fU1RBQ0ssICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBQVVNIX1JFRE9fU1RBQ0spKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VtcHR5VW5kb1N0YWNrXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnZva2VyLm9uKEVNUFRZX1VORE9fU1RBQ0ssICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBFTVBUWV9VTkRPX1NUQUNLKSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNlbXB0eVJlZG9TdGFja1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlci5vbihFTVBUWV9SRURPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgRU1QVFlfUkVET19TVEFDSykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY2FudmFzIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaENhbnZhc0V2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5vbih7XG4gICAgICAgICAgICAncGF0aDpjcmVhdGVkJzogdGhpcy5fb25QYXRoQ3JlYXRlZCxcbiAgICAgICAgICAgICdvYmplY3Q6YWRkZWQnOiAkLnByb3h5KGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICB2YXIgY29tbWFuZDtcblxuICAgICAgICAgICAgICAgIGlmIChvYmouaXNUeXBlKCdjcm9wem9uZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXR1aS51dGlsLmhhc1N0YW1wKG9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5BRERfT0JKRUNULCBvYmopO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnZva2VyLnB1c2hVbmRvU3RhY2soY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2FkZE9iamVjdFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZmFicmljLk9iamVjdH0gb2JqIC0gaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbFxuICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2FkZE9iamVjdCcsIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhvYmopO1xuICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShldmVudHMuQUREX09CSkVDVCwgb2JqKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLFxuICAgICAgICAgICAgJ29iamVjdDpyZW1vdmVkJzogJC5wcm94eShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEBhcGlcbiAgICAgICAgICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjcmVtb3ZlT2JqZWN0XG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtmYWJyaWMuT2JqZWN0fSBvYmogLSBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLk9iamVjdC5odG1sXG4gICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAgKiBpbWFnZUVkaXRvci5vbigncmVtb3ZlT2JqZWN0JywgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5SRU1PVkVfT0JKRUNULCBldmVudC50YXJnZXQpO1xuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICAnb2JqZWN0Om1vdmluZyc6ICQucHJveHkoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnZva2VyLmNsZWFyUmVkb1N0YWNrKCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2FkanVzdE9iamVjdFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZmFicmljLk9iamVjdH0gb2JqIC0gaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBBY3Rpb24gdHlwZSAobW92ZSAvIHNjYWxlKVxuICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2FkanVzdE9iamVjdCcsIGZ1bmN0aW9uKG9iaiwgdHlwZSkge1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhvYmopO1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkFESlVTVF9PQkpFQ1QsIGV2ZW50LnRhcmdldCwgJ21vdmUnKTtcbiAgICAgICAgICAgIH0sIHRoaXMpLFxuICAgICAgICAgICAgJ29iamVjdDpzY2FsaW5nJzogJC5wcm94eShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhZGp1c3RPYmplY3RcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iaiAtIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gQWN0aW9uIHR5cGUgKHNjYWxlIC8gc2NhbGUpXG4gICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAgKiBpbWFnZUVkaXRvci5vbignYWRqdXN0T2JqZWN0JywgZnVuY3Rpb24ob2JqLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShldmVudHMuQURKVVNUX09CSkVDVCwgZXZlbnQudGFyZ2V0LCAnc2NhbGUnKTtcbiAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZG9tIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaERvbUV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIGZhYnJpYy51dGlsLmFkZExpc3RlbmVyKGRvY3VtZW50LCAna2V5ZG93bicsICQucHJveHkodGhpcy5fb25LZXlEb3duLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEtleWRvd24gZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZSAtIEV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoKGUuY3RybEtleSB8fCBlLm1ldGFLZXkpICYmIGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuWikge1xuICAgICAgICAgICAgdGhpcy51bmRvKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGUuY3RybEtleSB8fCBlLm1ldGFLZXkpICYmIGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuWSkge1xuICAgICAgICAgICAgdGhpcy5yZWRvKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnRMaXN0ZW5lciAtIFwicGF0aDpjcmVhdGVkXCJcbiAgICAgKiAgLSBFdmVudHM6OiBcIm9iamVjdDphZGRlZFwiIC0+IFwicGF0aDpjcmVhdGVkXCJcbiAgICAgKiBAcGFyYW0ge3twYXRoOiBmYWJyaWMuUGF0aH19IG9iaiAtIFBhdGggb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25QYXRoQ3JlYXRlZDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIG9iai5wYXRoLnNldChjb25zdHMuZk9iamVjdE9wdGlvbnMuU0VMRUNUSU9OX1NUWUxFKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd8alF1ZXJ5fEhUTUxFbGVtZW50fSBjYW52YXNFbGVtZW50IC0gQ2FudmFzIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY3NzTWF4V2lkdGggLSBDYW52YXMgY3NzIG1heCB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjc3NNYXhIZWlnaHQgLSBDYW52YXMgY3NzIG1heCBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDYW52YXM6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIGNzc01heFdpZHRoLCBjc3NNYXhIZWlnaHQpIHtcbiAgICAgICAgdmFyIG1haW5Db21wb25lbnQ7XG5cbiAgICAgICAgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2dldE1haW5Db21wb25lbnQoKTtcbiAgICAgICAgbWFpbkNvbXBvbmVudC5zZXRDYW52YXNFbGVtZW50KGNhbnZhc0VsZW1lbnQpO1xuICAgICAgICBtYWluQ29tcG9uZW50LnNldENzc01heERpbWVuc2lvbih7XG4gICAgICAgICAgICB3aWR0aDogY3NzTWF4V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNzc01heEhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY2FudmFzID0gbWFpbkNvbXBvbmVudC5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBtYWluIGNvbXBvbmVudFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9IE1haW4gY29tcG9uZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TWFpbkNvbXBvbmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuTUFJTik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZXIuZ2V0Q29tcG9uZW50KG5hbWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBzdGF0ZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gSW1hZ2UgZWRpdG9yIHN0YXRlc1xuICAgICAqIC8vXG4gICAgICogLy8gICAgTk9STUFMOiAnTk9STUFMJ1xuICAgICAqIC8vICAgIENST1A6ICdDUk9QJ1xuICAgICAqIC8vICAgIEZSRUVfRFJBV0lORzogJ0ZSRUVfRFJBV0lORydcbiAgICAgKiAvLyAgICBURVhUOiAnVEVYVCdcbiAgICAgKiAvL1xuICAgICAqIGlmIChpbWFnZUVkaXRvci5nZXRDdXJyZW50U3RhdGUoKSA9PT0gJ0ZSRUVfRFJBV0lORycpIHtcbiAgICAgKiAgICAgaW1hZ2VFZGl0b3IuZW5kRnJlZURyYXdpbmcoKTtcbiAgICAgKiB9XG4gICAgICovXG4gICAgZ2V0Q3VycmVudFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgb2JqZWN0c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmNsZWFyT2JqZWN0cygpO1xuICAgICAqL1xuICAgIGNsZWFyT2JqZWN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLkNMRUFSX09CSkVDVFMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLkNMRUFSX09CSkVDVFMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNjbGVhck9iamVjdHNcbiAgICAgICAgICovXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgY3VycmVudCBhY3Rpb24gJiBEZWFjdGl2YXRlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWlkdG9yLmVuZEFsbCgpOyAvLyA9PT0gaW1hZ2VFaWR0b3IuZW5kRnJlZURyYXdpbmcoKTtcbiAgICAgKlxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0Q3JvcHBpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRBbGwoKTsgLy8gPT09IGltYWdlRWlkdG9yLmVuZENyb3BwaW5nKCk7XG4gICAgICovXG4gICAgZW5kQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRUZXh0TW9kZSgpO1xuICAgICAgICB0aGlzLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICAgIHRoaXMuZW5kTGluZURyYXdpbmcoKTtcbiAgICAgICAgdGhpcy5lbmRDcm9wcGluZygpO1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuTk9STUFMO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWFjdGl2YXRlIGFsbCBvYmplY3RzXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuZGVhY3RpdmF0ZUFsbCgpO1xuICAgICAqL1xuICAgIGRlYWN0aXZhdGVBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jYW52YXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgICAgICB0aGlzLl9jYW52YXMucmVuZGVyQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbW1hbmQpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5pbnZva2UoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG9cbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci51bmRvKCk7XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIudW5kbygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWRvXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IucmVkbygpO1xuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLnJlZG8oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIGZpbGVcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtGaWxlfSBpbWdGaWxlIC0gSW1hZ2UgZmlsZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbaW1hZ2VOYW1lXSAtIGltYWdlTmFtZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IubG9hZEltYWdlRnJvbUZpbGUoZmlsZSk7XG4gICAgICovXG4gICAgbG9hZEltYWdlRnJvbUZpbGU6IGZ1bmN0aW9uKGltZ0ZpbGUsIGltYWdlTmFtZSkge1xuICAgICAgICBpZiAoIWltZ0ZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChcbiAgICAgICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwoaW1nRmlsZSksXG4gICAgICAgICAgICBpbWFnZU5hbWUgfHwgaW1nRmlsZS5uYW1lXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSB1cmxcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIEZpbGUgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGltYWdlTmFtZSAtIGltYWdlTmFtZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IubG9hZEltYWdlRnJvbVVSTCgnaHR0cDovL3VybC90ZXN0SW1hZ2UucG5nJywgJ2xlbmEnKVxuICAgICAqL1xuICAgIGxvYWRJbWFnZUZyb21VUkw6IGZ1bmN0aW9uKHVybCwgaW1hZ2VOYW1lKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNhbGxiYWNrLCBjb21tYW5kO1xuXG4gICAgICAgIGlmICghaW1hZ2VOYW1lIHx8ICF1cmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLl9jYWxsYmFja0FmdGVySW1hZ2VMb2FkaW5nLCB0aGlzKTtcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5MT0FEX0lNQUdFLCBpbWFnZU5hbWUsIHVybCk7XG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhmdW5jdGlvbihvSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEBhcGlcbiAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2NsZWFySW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZmlyZShldmVudHMuQ0xFQVJfSU1BR0UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIGltYWdlIGxvYWRpbmdcbiAgICAgKiBAcGFyYW0gez9mYWJyaWMuSW1hZ2V9IG9JbWFnZSAtIEltYWdlIGluc3RhbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2FsbGJhY2tBZnRlckltYWdlTG9hZGluZzogZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgIHZhciBtYWluQ29tcG9uZW50ID0gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpO1xuICAgICAgICB2YXIgJGNhbnZhc0VsZW1lbnQgPSAkKG1haW5Db21wb25lbnQuZ2V0Q2FudmFzRWxlbWVudCgpKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjbG9hZEltYWdlXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb25cbiAgICAgICAgICogIEBwYXJhbSB7bnVtYmVyfSBkaW1lbnNpb24ub3JpZ2luYWxXaWR0aCAtIG9yaWdpbmFsIGltYWdlIHdpZHRoXG4gICAgICAgICAqICBAcGFyYW0ge251bWJlcn0gZGltZW5zaW9uLm9yaWdpbmFsSGVpZ2h0IC0gb3JpZ2luYWwgaW1hZ2UgaGVpZ2h0XG4gICAgICAgICAqICBAcGFyYW0ge251bWJlcn0gZGltZW5zaW9uLmN1cnJlbnRXaWR0aCAtIGN1cnJlbnQgd2lkdGggKGNzcylcbiAgICAgICAgICogIEBwYXJhbSB7bnVtYmVyfSBkaW1lbnNpb24uY3VycmVudCAtIGN1cnJlbnQgaGVpZ2h0IChjc3MpXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdsb2FkSW1hZ2UnLCBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRpbWVuc2lvbi5vcmlnaW5hbFdpZHRoKTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRpbWVuc2lvbi5vcmlnaW5hbEhlaWdodCk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZyhkaW1lbnNpb24uY3VycmVudFdpZHRoKTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRpbWVuc2lvbi5jdXJyZW50SGVpZ2h0KTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkxPQURfSU1BR0UsIHtcbiAgICAgICAgICAgIG9yaWdpbmFsV2lkdGg6IG9JbWFnZS53aWR0aCxcbiAgICAgICAgICAgIG9yaWdpbmFsSGVpZ2h0OiBvSW1hZ2UuaGVpZ2h0LFxuICAgICAgICAgICAgY3VycmVudFdpZHRoOiAkY2FudmFzRWxlbWVudC53aWR0aCgpLFxuICAgICAgICAgICAgY3VycmVudEhlaWdodDogJGNhbnZhc0VsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBpbWFnZSBvYmplY3Qgb24gY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGltZ1VybCAtIEltYWdlIHVybCB0byBtYWtlIG9iamVjdFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmFkZEltYWdlT2JqZWN0KCdwYXRoL2ZpbGVOYW1lLmpwZycpO1xuICAgICAqL1xuICAgIGFkZEltYWdlT2JqZWN0OiBmdW5jdGlvbihpbWdVcmwpIHtcbiAgICAgICAgaWYgKCFpbWdVcmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKGltZ1VybCxcbiAgICAgICAgICAgICQucHJveHkodGhpcy5fY2FsbGJhY2tBZnRlckxvYWRpbmdJbWFnZU9iamVjdCwgdGhpcyksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3Jvc3NPcmlnaW46ICdBbm9ueW1vdXMnXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIGxvYWRpbmcgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb2JqIC0gRmFicmljIGltYWdlIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGxiYWNrQWZ0ZXJMb2FkaW5nSW1hZ2VPYmplY3Q6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgbWFpbkNvbXAgPSB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCk7XG4gICAgICAgIHZhciBjZW50ZXJQb3MgPSBtYWluQ29tcC5nZXRDYW52YXNJbWFnZSgpLmdldENlbnRlclBvaW50KCk7XG5cbiAgICAgICAgb2JqLnNldChjb25zdHMuZk9iamVjdE9wdGlvbnMuU0VMRUNUSU9OX1NUWUxFKTtcbiAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICBsZWZ0OiBjZW50ZXJQb3MueCxcbiAgICAgICAgICAgIHRvcDogY2VudGVyUG9zLnksXG4gICAgICAgICAgICBjcm9zc09yaWdpbjogJ2Fub255bW91cydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzLmFkZChvYmopLnNldEFjdGl2ZU9iamVjdChvYmopO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBjcm9wcGluZ1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0Q3JvcHBpbmcoKTtcbiAgICAgKi9cbiAgICBzdGFydENyb3BwaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNyb3BwZXI7XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT09IHN0YXRlcy5DUk9QKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5DUk9QO1xuICAgICAgICBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuICAgICAgICBjcm9wcGVyLnN0YXJ0KCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNzdGFydENyb3BwaW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLlNUQVJUX0NST1BQSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgY3JvcHBpbmdcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNBcHBseWluZ10gLSBXaGV0aGVyIHRoZSBjcm9wcGluZyBpcyBhcHBsaWVkIG9yIGNhbmNlbGVkXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kQ3JvcHBpbmcoZmFsc2UpOyAvLyBjYW5jZWwgY3JvcHBpbmdcbiAgICAgKlxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0Q3JvcHBpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRDcm9wcGluZyh0cnVlKTsgLy8gYXBwbHkgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBlbmRDcm9wcGluZzogZnVuY3Rpb24oaXNBcHBseWluZykge1xuICAgICAgICB2YXIgY3JvcHBlciwgZGF0YTtcblxuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSAhPT0gc3RhdGVzLkNST1ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyb3BwZXIgPSB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuQ1JPUFBFUik7XG4gICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLk5PUk1BTDtcbiAgICAgICAgZGF0YSA9IGNyb3BwZXIuZW5kKGlzQXBwbHlpbmcpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjZW5kQ3JvcHBpbmdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuRU5EX0NST1BQSU5HKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRnJvbVVSTChkYXRhLnVybCwgZGF0YS5pbWFnZU5hbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdmbGlwWCcgb3IgJ2ZsaXBZJyBvciAncmVzZXQnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmxpcDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLkZMSVBfSU1BR0UpO1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5GTElQX0lNQUdFLCB0eXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjZmxpcEltYWdlXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmbGlwU2V0dGluZ1xuICAgICAgICAgKiAgQHBhcmFtIHtib29sZWFufSBmbGlwU2V0dGluZy5mbGlwWCAtIGltYWdlLmZsaXBYXG4gICAgICAgICAqICBAcGFyYW0ge2Jvb2xlYW59IGZsaXBTZXR0aW5nLmZsaXBZIC0gaW1hZ2UuZmxpcFlcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW1hZ2UuYW5nbGVcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2ZsaXBJbWFnZScsIGZ1bmN0aW9uKGZsaXBTZXR0aW5nLCBhbmdsZSkge1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZsaXBYOiAnLCBzZXR0aW5nLmZsaXBYKTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdmbGlwWTogJywgc2V0dGluZy5mbGlwWSk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnYW5nbGU6ICcsIGFuZ2xlKTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgeFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmZsaXBYKCk7XG4gICAgICovXG4gICAgZmxpcFg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdmbGlwWCcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHlcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5mbGlwWSgpO1xuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFknKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnJlc2V0RmxpcCgpO1xuICAgICAqL1xuICAgIHJlc2V0RmxpcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ3Jlc2V0Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ3JvdGF0ZScgb3IgJ3NldEFuZ2xlJ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGFuZ2xlIHZhbHVlIChkZWdyZWUpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcm90YXRlOiBmdW5jdGlvbih0eXBlLCBhbmdsZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLlJPVEFURV9JTUFHRSk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJPVEFURV9JTUFHRSwgdHlwZSwgYW5nbGUpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNyb3RhdGVJbWFnZVxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudEFuZ2xlIC0gaW1hZ2UuYW5nbGVcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ3JvdGF0ZUltYWdlJywgZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdhbmdsZTogJywgYW5nbGUpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIGltYWdlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIEFkZGl0aW9uYWwgYW5nbGUgdG8gcm90YXRlIGltYWdlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zZXRBbmdsZSgxMCk7IC8vIGFuZ2xlID0gMTBcbiAgICAgKiBpbWFnZUVkaXRvci5yb3RhdGUoMTApOyAvLyBhbmdsZSA9IDIwXG4gICAgICogaW1hZ2VFaWR0b3Iuc2V0QW5nbGUoNSk7IC8vIGFuZ2xlID0gNVxuICAgICAqIGltYWdlRWlkdG9yLnJvdGF0ZSgtOTUpOyAvLyBhbmdsZSA9IC05MFxuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgdGhpcy5fcm90YXRlKCdyb3RhdGUnLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhbmdsZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBbmdsZSBvZiBpbWFnZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc2V0QW5nbGUoMTApOyAvLyBhbmdsZSA9IDEwXG4gICAgICogaW1hZ2VFZGl0b3Iucm90YXRlKDEwKTsgLy8gYW5nbGUgPSAyMFxuICAgICAqIGltYWdlRWlkdG9yLnNldEFuZ2xlKDUpOyAvLyBhbmdsZSA9IDVcbiAgICAgKiBpbWFnZUVpZHRvci5yb3RhdGUoNTApOyAvLyBhbmdsZSA9IDU1XG4gICAgICogaW1hZ2VFaWR0b3Iuc2V0QW5nbGUoLTQwKTsgLy8gYW5nbGUgPSAtNDBcbiAgICAgKi9cbiAgICBzZXRBbmdsZTogZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgdGhpcy5fcm90YXRlKCdzZXRBbmdsZScsIGFuZ2xlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgZnJlZS1kcmF3aW5nIG1vZGVcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBjb2xvcjogc3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0RnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWlkdG9yLnN0YXJ0RnJlZURyYXdpbmcoe1xuICAgICAqICAgICB3aWR0aDogMTIsXG4gICAgICogICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJ1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHN0YXJ0RnJlZURyYXdpbmc6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT09IHN0YXRlcy5GUkVFX0RSQVdJTkcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5GUkVFX0RSQVdJTkcpLnN0YXJ0KHNldHRpbmcpO1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5GUkVFX0RSQVdJTkc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3N0YXJ0RnJlZURyYXdpbmdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuU1RBUlRfRlJFRV9EUkFXSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRyYXdpbmcgYnJ1c2hcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBjb2xvcjogc3RyaW5nfX0gc2V0dGluZyAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydEZyZWVEcmF3aW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3Iuc2V0QnJ1c2goe1xuICAgICAqICAgICB3aWR0aDogMTIsXG4gICAgICogICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJ1xuICAgICAqIH0pO1xuICAgICAqIGltYWdlRWRpdG9yLnNldEJydXNoKHtcbiAgICAgKiAgICAgd2lkdGg6IDgsXG4gICAgICogICAgIGNvbG9yOiAnRkZGRkZGJ1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHNldEJydXNoOiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuX3N0YXRlO1xuICAgICAgICB2YXIgY29tcE5hbWU7XG5cbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBzdGF0ZXMuTElORTpcbiAgICAgICAgICAgICAgICBjb21wTmFtZSA9IGNvbXBMaXN0LkxJTkU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbXBOYW1lID0gY29tcExpc3QuRlJFRV9EUkFXSU5HO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBOYW1lKS5zZXRCcnVzaChzZXR0aW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGZyZWUtZHJhd2luZyBtb2RlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICovXG4gICAgZW5kRnJlZURyYXdpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSAhPT0gc3RhdGVzLkZSRUVfRFJBV0lORykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5GUkVFX0RSQVdJTkcpLmVuZCgpO1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5OT1JNQUw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VuZEZyZWVEcmF3aW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9GUkVFX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaW5lLWRyYXdpbmcgbW9kZVxuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGNvbG9yOiBzdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRMaW5lRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZExpbmVEcmF3aW5nKCk7XG4gICAgICogaW1hZ2VFaWR0b3Iuc3RhcnRMaW5lRHJhd2luZyh7XG4gICAgICogICAgIHdpZHRoOiAxMixcbiAgICAgKiAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNSknXG4gICAgICogfSk7XG4gICAgICovXG4gICAgc3RhcnRMaW5lRHJhd2luZzogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSA9PT0gc3RhdGVzLkxJTkUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5MSU5FKS5zdGFydChzZXR0aW5nKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuTElORTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3Ijc3RhcnRMaW5lRHJhd2luZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5TVEFSVF9MSU5FX0RSQVdJTkcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgbGluZS1kcmF3aW5nIG1vZGVcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydExpbmVEcmF3aW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kTGluZURyYXdpbmcoKTtcbiAgICAgKi9cbiAgICBlbmRMaW5lRHJhd2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpICE9PSBzdGF0ZXMuTElORSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5MSU5FKS5lbmQoKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuTk9STUFMO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNlbmRMaW5lRHJhd2luZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5FTkRfTElORV9EUkFXSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgdGV4dCBpbnB1dCBtb2RlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuZW5kVGV4dE1vZGUoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydFRleHRNb2RlKCk7XG4gICAgICovXG4gICAgc3RhcnRUZXh0TW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT09IHN0YXRlcy5URVhUKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5URVhUO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyID0gJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICBpZiAoIW9iai5pc1R5cGUoJ3RleHQnKSkge1xuICAgICAgICAgICAgICAgIG9iai5ldmVudGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2NhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAndGV4dCc7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5vbignbW91c2U6ZG93bicsIHRoaXMuX2xpc3RlbmVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHRleHQgb24gaW1hZ2VcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBJbml0aWFsIGlucHV0IHRleHRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgZm9yIGdlbmVyYXRpbmcgdGV4dFxuICAgICAqICAgICBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuc3R5bGVzXSBJbml0aWFsIHN0eWxlc1xuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnN0eWxlcy5maWxsXSBDb2xvclxuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnN0eWxlcy5mb250RmFtaWx5XSBGb250IHR5cGUgZm9yIHRleHRcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdHlsZXMuZm9udFNpemVdIFNpemVcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zdHlsZXMuZm9udFN0eWxlXSBUeXBlIG9mIGluY2xpbmF0aW9uIChub3JtYWwgLyBpdGFsaWMpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc3R5bGVzLmZvbnRXZWlnaHRdIFR5cGUgb2YgdGhpY2tlciBvciB0aGlubmVyIGxvb2tpbmcgKG5vcm1hbCAvIGJvbGQpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc3R5bGVzLnRleHRBbGlnbl0gVHlwZSBvZiB0ZXh0IGFsaWduIChsZWZ0IC8gY2VudGVyIC8gcmlnaHQpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc3R5bGVzLnRleHREZWNvcmFpdG9uXSBUeXBlIG9mIGxpbmUgKHVuZGVybGluZSAvIGxpbmUtdGhyb2doIC8gb3ZlcmxpbmUpXG4gICAgICogICAgIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gW29wdGlvbnMucG9zaXRpb25dIC0gSW5pdGlhbCBwb3NpdGlvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuYWRkVGV4dCgpO1xuICAgICAqIGltYWdlRWRpdG9yLmFkZFRleHQoJ2luaXQgdGV4dCcsIHtcbiAgICAgKiAgICAgc3R5bGVzOiB7XG4gICAgICogICAgIGZpbGw6ICcjMDAwJyxcbiAgICAgKiAgICAgICAgIGZvbnRTaXplOiAnMjAnLFxuICAgICAqICAgICAgICAgZm9udFdlaWdodDogJ2JvbGQnXG4gICAgICogICAgIH0sXG4gICAgICogICAgIHBvc2l0aW9uOiB7XG4gICAgICogICAgICAgICB4OiAxMCxcbiAgICAgKiAgICAgICAgIHk6IDEwXG4gICAgICogICAgIH1cbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBhZGRUZXh0OiBmdW5jdGlvbih0ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpICE9PSBzdGF0ZXMuVEVYVCkge1xuICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuVEVYVDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5URVhUKS5hZGQodGV4dCB8fCAnJywgb3B0aW9ucyB8fCB7fSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBjb250ZW50cyBvZiBzZWxlY3RlZCB0ZXh0IG9iamVjdCBvbiBpbWFnZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIENoYW5naW5nIHRleHRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmNoYW5nZVRleHQoJ2NoYW5nZSB0ZXh0Jyk7XG4gICAgICovXG4gICAgY2hhbmdlVGV4dDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgYWN0aXZlT2JqID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpICE9PSBzdGF0ZXMuVEVYVCB8fFxuICAgICAgICAgICAgIWFjdGl2ZU9iaikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LlRFWFQpLmNoYW5nZShhY3RpdmVPYmosIHRleHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3R5bGVcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHN0eWxlT2JqIC0gSW5pdGlhbCBzdHlsZXNcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai5maWxsXSBDb2xvclxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLmZvbnRGYW1pbHldIEZvbnQgdHlwZSBmb3IgdGV4dFxuICAgICAqICAgICBAcGFyYW0ge251bWJlcn0gW3N0eWxlT2JqLmZvbnRTaXplXSBTaXplXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZm9udFN0eWxlXSBUeXBlIG9mIGluY2xpbmF0aW9uIChub3JtYWwgLyBpdGFsaWMpXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZm9udFdlaWdodF0gVHlwZSBvZiB0aGlja2VyIG9yIHRoaW5uZXIgbG9va2luZyAobm9ybWFsIC8gYm9sZClcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai50ZXh0QWxpZ25dIFR5cGUgb2YgdGV4dCBhbGlnbiAobGVmdCAvIGNlbnRlciAvIHJpZ2h0KVxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLnRleHREZWNvcmFpdG9uXSBUeXBlIG9mIGxpbmUgKHVuZGVybGluZSAvIGxpbmUtdGhyb2doIC8gb3ZlcmxpbmUpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5jaGFuZ2VUZXh0U3R5bGUoe1xuICAgICAqICAgICBmb250U3R5bGU6ICdpdGFsaWMnXG4gICAgICogfSk7XG4gICAgICovXG4gICAgY2hhbmdlVGV4dFN0eWxlOiBmdW5jdGlvbihzdHlsZU9iaikge1xuICAgICAgICB2YXIgYWN0aXZlT2JqID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpICE9PSBzdGF0ZXMuVEVYVCB8fFxuICAgICAgICAgICAgIWFjdGl2ZU9iaikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LlRFWFQpLnNldFN0eWxlKGFjdGl2ZU9iaiwgc3R5bGVPYmopO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgdGV4dCBpbnB1dCBtb2RlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRUZXh0TW9kZSgpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZFRleHRNb2RlKCk7XG4gICAgICovXG4gICAgZW5kVGV4dE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSA9PT0gc3RhdGVzLlRFWFQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLk5PUk1BTDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5pc1R5cGUoJ3RleHQnKSAmJiBvYmoudGV4dCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICBvYmoucmVtb3ZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9iai5ldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzLnNlbGVjdGlvbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLl9jYW52YXMub2ZmKCdtb3VzZTpkb3duJywgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIE1vdXNlZG93biBldmVudCBoYW5kbGVyXG4gICAgICAqIEBwYXJhbSB7ZmFicmljLkV2ZW50fSBldmVudCAtIEN1cnJlbnQgbW91c2Vkb3duIGV2ZW50IG9iamVjdFxuICAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBvYmogPSBldmVudC50YXJnZXQ7XG4gICAgICAgIHZhciBlID0gZXZlbnQuZTtcbiAgICAgICAgdmFyIG9yaWdpblBvaW50ZXIgPSB0aGlzLl9jYW52YXMuZ2V0UG9pbnRlcihlKTtcblxuICAgICAgICBpZiAob2JqICYmICFvYmouaXNUeXBlKCd0ZXh0JykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhY3RpdmF0ZVRleHRcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgICAgICAgICogICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50eXBlIC0gVHlwZSBvZiB0ZXh0IG9iamVjdCAobmV3IC8gc2VsZWN0KVxuICAgICAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudGV4dCAtIEN1cnJlbnQgdGV4dFxuICAgICAgICAgKiAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuc3R5bGVzIC0gQ3VycmVudCBzdHlsZXNcbiAgICAgICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zdHlsZXMuZmlsbCAtIENvbG9yXG4gICAgICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc3R5bGVzLmZvbnRGYW1pbHkgLSBGb250IHR5cGUgZm9yIHRleHRcbiAgICAgICAgICogICAgICAgICBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5zdHlsZXMuZm9udFNpemUgLSBTaXplXG4gICAgICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc3R5bGVzLmZvbnRTdHlsZSAtIFR5cGUgb2YgaW5jbGluYXRpb24gKG5vcm1hbCAvIGl0YWxpYylcbiAgICAgICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zdHlsZXMuZm9udFdlaWdodCAtIFR5cGUgb2YgdGhpY2tlciBvciB0aGlubmVyIGxvb2tpbmcgKG5vcm1hbCAvIGJvbGQpXG4gICAgICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc3R5bGVzLnRleHRBbGlnbiAtIFR5cGUgb2YgdGV4dCBhbGlnbiAobGVmdCAvIGNlbnRlciAvIHJpZ2h0KVxuICAgICAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnN0eWxlcy50ZXh0RGVjb3JhaXRvbiAtIFR5cGUgb2YgbGluZSAodW5kZXJsaW5lIC8gbGluZS10aHJvZ2ggLyBvdmVybGluZSlcbiAgICAgICAgICogICAgIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gb3B0aW9ucy5vcmlnaW5Qb3NpdGlvbiAtIEN1cnJlbnQgcG9zaXRpb24gb24gb3JpZ2luIGNhbnZhc1xuICAgICAgICAgKiAgICAgQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBvcHRpb25zLmNsaWVudFBvc2l0aW9uIC0gQ3VycmVudCBwb3NpdGlvbiBvbiBjbGllbnQgYXJlYVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpbWFnZUVkaXRvci5vbignYWN0aXZhdGVUZXh0JywgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygndGV4dCBvYmplY3QgdHlwZTogJyArIG9iai50eXBlKTtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCd0ZXh0IGNvbnRlbnRzOiAnICsgb2JqLnRleHQpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ3RleHQgc3R5bGVzOiAnICsgb2JqLnN0eWxlcyk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygndGV4dCBwb3NpdGlvbiBvbiBjYW52YXM6ICcgKyBvYmoub3JpZ2luUG9zaXRpb24pO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ3RleHQgcG9zaXRpb24gb24gYnJ3b3NlcjogJyArIG9iai5jbGllbnRQb3NpdGlvbik7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5BQ1RJVkFURV9URVhULCB7XG4gICAgICAgICAgICB0eXBlOiBvYmogPyAnc2VsZWN0JyA6ICduZXcnLFxuICAgICAgICAgICAgdGV4dDogb2JqID8gb2JqLnRleHQgOiAnJyxcbiAgICAgICAgICAgIHN0eWxlczogb2JqID8ge1xuICAgICAgICAgICAgICAgIGZpbGw6IG9iai5maWxsLFxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IG9iai5mb250RmFtaWx5LFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiBvYmouZm9udFNpemUsXG4gICAgICAgICAgICAgICAgZm9udFN0eWxlOiBvYmouZm9udFN0eWxlLFxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogb2JqLnRleHRBbGlnbixcbiAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogb2JqLnRleHREZWNvcmF0aW9uXG4gICAgICAgICAgICB9IDoge30sXG4gICAgICAgICAgICBvcmlnaW5Qb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHg6IG9yaWdpblBvaW50ZXIueCxcbiAgICAgICAgICAgICAgICB5OiBvcmlnaW5Qb2ludGVyLnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGllbnRQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGN1c3RvbSBpY29uc1xuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3tpY29uVHlwZTogc3RyaW5nLCBwYXRoVmFsdWU6IHN0cmluZ319IGluZm9zIC0gSW5mb3MgdG8gcmVnaXN0ZXIgaWNvbnNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnJlZ2lzdGVySWNvbnMoe1xuICAgICAqICAgICBjdXN0b21JY29uOiAnTSAwIDAgTCAyMCAyMCBMIDEwIDEwIFonLFxuICAgICAqICAgICBjdXN0b21BcnJvdzogJ00gNjAgMCBMIDEyMCA2MCBIIDkwIEwgNzUgNDUgViAxODAgSCA0NSBWIDQ1IEwgMzAgNjAgSCAwIFonXG4gICAgICogfSk7XG4gICAgICovXG4gICAgcmVnaXN0ZXJJY29uczogZnVuY3Rpb24oaW5mb3MpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LklDT04pLnJlZ2lzdGVyUGF0aHMoaW5mb3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgaWNvbiBvbiBjYW52YXNcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBJY29uIHR5cGUgKGFycm93IC8gY2FuY2VsKVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuYWRkSWNvbignYXJyb3cnKTtcbiAgICAgKi9cbiAgICBhZGRJY29uOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5JQ09OKS5hZGQodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBpY29uIGNvbG9yXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIENvbG9yIGZvciBpY29uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5jaGFuZ2VJY29uQ29sb3IoJyMwMDAwMDAnKTtcbiAgICAgKi9cbiAgICBjaGFuZ2VJY29uQ29sb3I6IGZ1bmN0aW9uKGNvbG9yKSB7XG4gICAgICAgIHZhciBhY3RpdmVPYmogPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LklDT04pLnNldENvbG9yKGNvbG9yLCBhY3RpdmVPYmopO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWN0aXZlIG9iamVjdCBvciBncm91cFxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnJlbW92ZUFjdGl2ZU9iamVjdCgpO1xuICAgICAqL1xuICAgIHJlbW92ZUFjdGl2ZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLl9jYW52YXM7XG4gICAgICAgIHZhciB0YXJnZXQgPSBjYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCkgfHwgY2FudmFzLmdldEFjdGl2ZUdyb3VwKCk7XG4gICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZEZhY3RvcnkuY3JlYXRlKGNvbW1hbmRzLlJFTU9WRV9PQkpFQ1QsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgZmlsdGVyIG9uIGNhbnZhcyBpbWFnZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEZpbHRlciB0eXBlIChjdXJyZW50IGZpbHRlciB0eXBlIGlzIG9ubHkgJ21hc2snKVxuICAgICAqIEBwYXJhbSB7b3B0aW9uc30gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYXBwbHkgZmlsdGVyXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5hcHBseUZpbHRlcignbWFzaycpO1xuICAgICAqIGltYWdlRWRpdG9yLmFwcGx5RmlsdGVyKCdtYXNrJywge1xuICAgICAqICAgICBtYXNrOiBmYWJyaWNJbWdPYmpcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBhcHBseUZpbHRlcjogZnVuY3Rpb24odHlwZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgY29tbWFuZCwgY2FsbGJhY2ssIGFjdGl2ZU9iajtcblxuICAgICAgICBpZiAodHlwZSA9PT0gJ21hc2snICYmICFvcHRpb25zKSB7XG4gICAgICAgICAgICBhY3RpdmVPYmogPSB0aGlzLl9jYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICghKGFjdGl2ZU9iaiAmJiBhY3RpdmVPYmouaXNUeXBlKCdpbWFnZScpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBtYXNrOiBhY3RpdmVPYmpcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayA9ICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBldmVudHMuQVBQTFlfRklMVEVSKTtcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5BUFBMWV9GSUxURVIsIHR5cGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhcHBseUZpbHRlclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsdGVyVHlwZSAtIEFwcGxpZWQgZmlsdGVyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY3RUeXBlIC0gQWN0aW9uIHR5cGUgKGFkZCAvIHJlbW92ZSlcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2FwcGx5RmlsdGVyJywgZnVuY3Rpb24oZmlsdGVyVHlwZSwgYWN0VHlwZSkge1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZpbHRlclR5cGU6ICcsIGZpbHRlclR5cGUpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2FjdFR5cGU6ICcsIGFjdFR5cGUpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIGNvbW1hbmQuc2V0RXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKVxuICAgICAgICAgICAgLnNldFVuZG9DYWxsYmFjayhjYWxsYmFjayk7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSB1cmxcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBBIERPTVN0cmluZyBpbmRpY2F0aW5nIHRoZSBpbWFnZSBmb3JtYXQuIFRoZSBkZWZhdWx0IHR5cGUgaXMgaW1hZ2UvcG5nLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgRE9NU3RyaW5nIGNvbnRhaW5pbmcgdGhlIHJlcXVlc3RlZCBkYXRhIFVSSVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1nRWwuc3JjID0gaW1hZ2VFZGl0b3IudG9EYXRhVVJMKCk7XG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCkudG9EYXRhVVJMKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbWFnZSBuYW1lXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyhpbWFnZUVkaXRvci5nZXRJbWFnZU5hbWUoKSk7XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS5nZXRJbWFnZU5hbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJVbmRvU3RhY2soKTtcbiAgICAgKi9cbiAgICBjbGVhclVuZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJVbmRvU3RhY2soKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2xlYXJSZWRvU3RhY2soKTtcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuY2xlYXJSZWRvU3RhY2soKTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEltYWdlRWRpdG9yKTtcbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VFZGl0b3I7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb21wb25lbnQgaW50ZXJmYWNlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb21wb25lbnQgaW50ZXJmYWNlXG4gKiBAY2xhc3NcbiAqL1xudmFyIENvbXBvbmVudCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgQ29tcG9uZW50LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBpbWFnZShiYWNrZ3JvdW5kKSBvZiBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5JbWFnZX0gb0ltYWdlIC0gRmFicmljIGltYWdlIGluc3RhbmNlXG4gICAgICovXG4gICAgc2V0Q2FudmFzSW1hZ2U6IGZ1bmN0aW9uKG5hbWUsIG9JbWFnZSkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNJbWFnZShuYW1lLCBvSW1hZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0Q2FudmFzRWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNJbWFnZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgZWRpdG9yXG4gICAgICogQHJldHVybnMge0ltYWdlRWRpdG9yfVxuICAgICAqL1xuICAgIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRFZGl0b3IoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0SW1hZ2VQcm9wZXJ0aWVzKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2FudmFzIGRpbWVuc2lvbiAtIGNzcyBvbmx5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRpbWVuc2lvbiAtIENhbnZhcyBjc3MgZGltZW5zaW9uXG4gICAgICovXG4gICAgc2V0Q2FudmFzQ3NzRGltZW5zaW9uOiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5nZXRSb290KCkuc2V0Q2FudmFzQ3NzRGltZW5zaW9uKGRpbWVuc2lvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGJhY2tzdG9yZSBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBzZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb24oZGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHBhcmVudFxuICAgICAqIEBwYXJhbSB7Q29tcG9uZW50fG51bGx9IHBhcmVudCAtIFBhcmVudFxuICAgICAqL1xuICAgIHNldFBhcmVudDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudCB8fCBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGp1c3QgY2FudmFzIGRpbWVuc2lvbiB3aXRoIHNjYWxpbmcgaW1hZ2VcbiAgICAgKi9cbiAgICBhZGp1c3RDYW52YXNEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHBhcmVudC5cbiAgICAgKiBJZiB0aGUgdmlldyBpcyByb290LCByZXR1cm4gbnVsbFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRQYXJlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcm9vdFxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5nZXRQYXJlbnQoKTtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuXG4gICAgICAgIHdoaWxlIChuZXh0KSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICAgICAgICAgIG5leHQgPSBjdXJyZW50LmdldFBhcmVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgQ29tbWFuZCBpbnRlcmZhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXJyb3JNZXNzYWdlID0gcmVxdWlyZSgnLi4vZmFjdG9yeS9lcnJvck1lc3NhZ2UnKTtcblxudmFyIGNyZWF0ZU1lc3NhZ2UgPSBlcnJvck1lc3NhZ2UuY3JlYXRlLFxuICAgIGVycm9yVHlwZXMgPSBlcnJvck1lc3NhZ2UudHlwZXM7XG5cbi8qKlxuICogQ29tbWFuZCBjbGFzc1xuICogQGNsYXNzXG4gKiBAcGFyYW0ge3tleGVjdXRlOiBmdW5jdGlvbiwgdW5kbzogZnVuY3Rpb259fSBhY3Rpb25zIC0gQ29tbWFuZCBhY3Rpb25zXG4gKi9cbnZhciBDb21tYW5kID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDb21tYW5kLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihhY3Rpb25zKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeGVjdXRlIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZSA9IGFjdGlvbnMuZXhlY3V0ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBmdW5jdGlvblxuICAgICAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG8gPSBhY3Rpb25zLnVuZG87XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGV4ZWN1dGVDYWxsYmFja1xuICAgICAgICAgKiBAdHlwZSB7bnVsbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhlY3V0ZUNhbGxiYWNrID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdW5kb0NhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51bmRvQ2FsbGJhY2sgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAnZXhlY3V0ZScpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBhY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNyZWF0ZU1lc3NhZ2UoZXJyb3JUeXBlcy5VTl9JTVBMRU1FTlRBVElPTiwgJ3VuZG8nKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBleGVjdXRlIGNhbGxhYmNrXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayBhZnRlciBleGVjdXRpb25cbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldEV4ZWN1dGVDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5leGVjdXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIHVuZG8gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGFmdGVyIHVuZG9cbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZH0gdGhpc1xuICAgICAqL1xuICAgIHNldFVuZG9DYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy51bmRvQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW52b2tlciAtIGludm9rZSBjb21tYW5kc1xuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbWFnZUxvYWRlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ltYWdlTG9hZGVyJyk7XG52YXIgQ3JvcHBlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2Nyb3BwZXInKTtcbnZhciBNYWluQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQvbWFpbicpO1xudmFyIEZsaXAgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mbGlwJyk7XG52YXIgUm90YXRpb24gPSByZXF1aXJlKCcuL2NvbXBvbmVudC9yb3RhdGlvbicpO1xudmFyIEZyZWVEcmF3aW5nID0gcmVxdWlyZSgnLi9jb21wb25lbnQvZnJlZURyYXdpbmcnKTtcbnZhciBMaW5lID0gcmVxdWlyZSgnLi9jb21wb25lbnQvbGluZScpO1xudmFyIFRleHQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC90ZXh0Jyk7XG52YXIgSWNvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ljb24nKTtcbnZhciBGaWx0ZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9maWx0ZXInKTtcbnZhciBldmVudE5hbWVzID0gcmVxdWlyZSgnLi9jb25zdHMnKS5ldmVudE5hbWVzO1xuXG4vKipcbiAqIEludm9rZXJcbiAqIEBjbGFzc1xuICovXG52YXIgSW52b2tlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW52b2tlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDdXN0b20gRXZlbnRzXG4gICAgICAgICAqIEB0eXBlIHt0dWkudXRpbC5DdXN0b21FdmVudHN9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jdXN0b21FdmVudHMgPSBuZXcgdHVpLnV0aWwuQ3VzdG9tRXZlbnRzKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVuZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3VuZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWRvIHN0YWNrXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48Q29tbWFuZD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tcG9uZW50IG1hcFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jb21wb25lbnRNYXAgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTG9jay1mbGFnIGZvciBleGVjdXRpbmcgY29tbWFuZFxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzTG9ja2VkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlQ29tcG9uZW50cygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY29tcG9uZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NyZWF0ZUNvbXBvbmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWFpbiA9IG5ldyBNYWluQ29tcG9uZW50KCk7XG5cbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobWFpbik7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBJbWFnZUxvYWRlcihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBDcm9wcGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEZsaXAobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgUm90YXRpb24obWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRnJlZURyYXdpbmcobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgTGluZShtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBUZXh0KG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEljb24obWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRmlsdGVyKG1haW4pKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudCAtIENvbXBvbmVudCBoYW5kbGluZyB0aGUgY2FudmFzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVnaXN0ZXI6IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICB0aGlzLl9jb21wb25lbnRNYXBbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kIGV4ZWN1dGlvblxuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIENvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ludm9rZUV4ZWN1dGlvbjogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5sb2NrKCk7XG5cbiAgICAgICAgcmV0dXJuICQud2hlbihjb21tYW5kLmV4ZWN1dGUodGhpcy5fY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucHVzaFVuZG9TdGFjayhjb21tYW5kKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLmV4ZWN1dGVDYWxsYmFjaylcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bmxvY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZCB1bmRvXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW52b2tlVW5kbzogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5sb2NrKCk7XG5cbiAgICAgICAgcmV0dXJuICQud2hlbihjb21tYW5kLnVuZG8odGhpcy5fY29tcG9uZW50TWFwKSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucHVzaFJlZG9TdGFjayhjb21tYW5kKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZG9uZShjb21tYW5kLnVuZG9DYWxsYmFjaylcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51bmxvY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlIGN1c3RvbSBldmVudHNcbiAgICAgKiBAc2VlIHtAbGluayB0dWkudXRpbC5DdXN0b21FdmVudHMucHJvdG90eXBlLmZpcmV9XG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMgLSBBcmd1bWVudHMgdG8gZmlyZSBhIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudCA9IHRoaXMuX2N1c3RvbUV2ZW50cztcbiAgICAgICAgZXZlbnQuZmlyZS5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGN1c3RvbSBldmVudHNcbiAgICAgKiBAc2VlIHtAbGluayB0dWkudXRpbC5DdXN0b21FdmVudHMucHJvdG90eXBlLm9ufVxuICAgICAqIEBwYXJhbSB7Li4uKn0gYXJndW1lbnRzIC0gQXJndW1lbnRzIHRvIGF0dGFjaCBldmVudHNcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudCA9IHRoaXMuX2N1c3RvbUV2ZW50cztcbiAgICAgICAgZXZlbnQub24uYXBwbHkoZXZlbnQsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbXBvbmVudCBuYW1lXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBnZXRDb21wb25lbnQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudE1hcFtuYW1lXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9jayB0aGlzIGludm9rZXJcbiAgICAgKi9cbiAgICBsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNMb2NrZWQgPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmxvY2sgdGhpcyBpbnZva2VyXG4gICAgICovXG4gICAgdW5sb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNMb2NrZWQgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmRcbiAgICAgKiBTdG9yZSB0aGUgY29tbWFuZCB0byB0aGUgdW5kb1N0YWNrXG4gICAgICogQ2xlYXIgdGhlIHJlZG9TdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIENvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGludm9rZTogZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgICBpZiAodGhpcy5faXNMb2NrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkLkRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZUV4ZWN1dGlvbihjb21tYW5kKVxuICAgICAgICAgICAgLmRvbmUoJC5wcm94eSh0aGlzLmNsZWFyUmVkb1N0YWNrLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5fdW5kb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCAmJiB0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoVW5kb1N0YWNrKGNvbW1hbmQsIHRydWUpO1xuICAgICAgICAgICAgY29tbWFuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW1wdHlVbmRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpxRGVmZXIgPSB0aGlzLl9pbnZva2VVbmRvKGNvbW1hbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoKS5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWRvIGNvbW1hbmRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWFuZCA9IHRoaXMuX3JlZG9TdGFjay5wb3AoKTtcbiAgICAgICAgdmFyIGpxRGVmZXI7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQgJiYgdGhpcy5faXNMb2NrZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaFJlZG9TdGFjayhjb21tYW5kLCB0cnVlKTtcbiAgICAgICAgICAgIGNvbW1hbmQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuRU1QVFlfUkVET19TVEFDSyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqcURlZmVyID0gdGhpcy5faW52b2tlRXhlY3V0aW9uKGNvbW1hbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9ICQuRGVmZXJyZWQoKS5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXNoIHVuZG8gc3RhY2tcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaWxlbnRdIC0gRmlyZSBldmVudCBvciBub3RcbiAgICAgKi9cbiAgICBwdXNoVW5kb1N0YWNrOiBmdW5jdGlvbihjb21tYW5kLCBpc1NpbGVudCkge1xuICAgICAgICB0aGlzLl91bmRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFpc1NpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLlBVU0hfVU5ET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHVzaCByZWRvIHN0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gY29tbWFuZFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU2lsZW50XSAtIEZpcmUgZXZlbnQgb3Igbm90XG4gICAgICovXG4gICAgcHVzaFJlZG9TdGFjazogZnVuY3Rpb24oY29tbWFuZCwgaXNTaWxlbnQpIHtcbiAgICAgICAgdGhpcy5fcmVkb1N0YWNrLnB1c2goY29tbWFuZCk7XG4gICAgICAgIGlmICghaXNTaWxlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5QVVNIX1JFRE9fU1RBQ0spO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHRoZSByZWRvU3RhY2sgaXMgZW1wdHlcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0VtcHR5UmVkb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHRoZSB1bmRvU3RhY2sgaXMgZW1wdHlcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0VtcHR5VW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuZG9TdGFjay5sZW5ndGggPT09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIHVuZG9TdGFja1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRW1wdHlVbmRvU3RhY2soKSkge1xuICAgICAgICAgICAgdGhpcy5fdW5kb1N0YWNrID0gW107XG4gICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuRU1QVFlfVU5ET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgcmVkb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eVJlZG9TdGFjaygpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWRvU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludm9rZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBVdGlsXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1pbiA9IE1hdGgubWluLFxuICAgIG1heCA9IE1hdGgubWF4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBDbGFtcCB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pblZhbHVlIC0gTWluaW11bSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhWYWx1ZSAtIE1heGltdW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBjbGFtcGVkIHZhbHVlXG4gICAgICovXG4gICAgY2xhbXA6IGZ1bmN0aW9uKHZhbHVlLCBtaW5WYWx1ZSwgbWF4VmFsdWUpIHtcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIGlmIChtaW5WYWx1ZSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICB0ZW1wID0gbWluVmFsdWU7XG4gICAgICAgICAgICBtaW5WYWx1ZSA9IG1heFZhbHVlO1xuICAgICAgICAgICAgbWF4VmFsdWUgPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1heChtaW5WYWx1ZSwgbWluKHZhbHVlLCBtYXhWYWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIGtleS12YWx1ZSBvYmplY3QgZnJvbSBhcmd1bWVudHNcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAga2V5TWlycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIG9ialtrZXldID0ga2V5O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbn07XG4iXX0=
