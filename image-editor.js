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
     * @param {object} settings - Options for generating text
     *     @param {object} [settings.styles] Initial styles
     *         @param {string} [settings.styles.fill] Color
     *         @param {string} [settings.styles.fontFamily] Font type for text
     *         @param {number} [settings.styles.fontSize] Size
     *         @param {string} [settings.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [settings.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [settings.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [settings.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [setting.position] - Initial position
     */
    add: function(text, settings) {
        var canvas = this.getCanvas();
        var styles = this._defaultStyles;
        var newText;

        if (settings.styles) {
            styles = tui.util.extend(settings.styles, styles);
        }

        this._setInitPos(settings.position);

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

var consts = require('../consts');
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

},{"../consts":12,"../util":22}],14:[function(require,module,exports){
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
                 * @param {string} Action type (move)
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
                 * @api
                 * @event ImageEditor#adjustObject
                 * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
                 * @param {string} Action type (scale)
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
     * @param {object} [settings] Options for generating text
     *     @param {object} [settings.styles] Initial styles
     *         @param {string} [settings.styles.fill] Color
     *         @param {string} [settings.styles.fontFamily] Font type for text
     *         @param {number} [settings.styles.fontSize] Size
     *         @param {string} [settings.styles.fontStyle] Type of inclination (normal / italic)
     *         @param {string} [settings.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *         @param {string} [settings.styles.textAlign] Type of text align (left / center / right)
     *         @param {string} [settings.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     *     @param {{x: number, y: number}} [setting.position] - Initial position
     * @example
     * imageEditor.addText();
     * imageEditor.addText('init text', {
     * 		styles: {
     * 			fill: '#000',
     * 			fontSize: '20',
     * 			fontWeight: 'bold'
     * 		},
     * 		position: {
     * 			x: 10,
     * 			y: 10
     * 		}
     * });
     */
    addText: function(text, settings) {
        if (this.getCurrentState() !== states.TEXT) {
            this._state = states.TEXT;
        }

        this._getComponent(compList.TEXT).add(text || '', settings || {});
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
     * 		fontStyle: 'italic'
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
         * @param {object} settings
         *     @param {boolean} settings.type - Type of text object (new / select)
         *     @param {string} settings.text - Current text
         *     @param {object} settings.styles - Current styles
         *         @param {string} settings.styles.fill - Color
         *         @param {string} settings.styles.fontFamily - Font type for text
         *         @param {number} settings.styles.fontSize - Size
         *         @param {string} settings.styles.fontStyle - Type of inclination (normal / italic)
         *         @param {string} settings.styles.fontWeight - Type of thicker or thinner looking (normal / bold)
         *         @param {string} settings.styles.textAlign - Type of text align (left / center / right)
         *         @param {string} settings.styles.textDecoraiton - Type of line (underline / line-throgh / overline)
         *     @param {{x: number, y: number}} settings.originPosition - Current position on origin canvas
         *     @param {{x: number, y: number}} settings.clientPosition - Current position on client area
         * @example
         * imageEditor.on('activateText', function(obj) {
         * 		console.log('text object type: ' + obj.type);
         * 		console.log('text contents: ' + obj.text);
         * 		console.log('text styles: ' + obj.styles);
         * 		console.log('text position on canvas: ' + obj.originPosition);
         * 		console.log('text position on brwoser: ' + obj.clientPosition);
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
     * 		customIcon: 'M 0 0 L 20 20 L 10 10 Z',
     * 		customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
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
     * 		mask: fabricImgObj
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
         * @param {string} actType - Action type ("add" or "remove" filter)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9jb21wb25lbnQvY3JvcHBlci5qcyIsInNyYy9qcy9jb21wb25lbnQvZmlsdGVyLmpzIiwic3JjL2pzL2NvbXBvbmVudC9mbGlwLmpzIiwic3JjL2pzL2NvbXBvbmVudC9mcmVlRHJhd2luZy5qcyIsInNyYy9qcy9jb21wb25lbnQvaWNvbi5qcyIsInNyYy9qcy9jb21wb25lbnQvaW1hZ2VMb2FkZXIuanMiLCJzcmMvanMvY29tcG9uZW50L2xpbmUuanMiLCJzcmMvanMvY29tcG9uZW50L21haW4uanMiLCJzcmMvanMvY29tcG9uZW50L3JvdGF0aW9uLmpzIiwic3JjL2pzL2NvbXBvbmVudC90ZXh0LmpzIiwic3JjL2pzL2NvbnN0cy5qcyIsInNyYy9qcy9leHRlbnNpb24vY3JvcHpvbmUuanMiLCJzcmMvanMvZXh0ZW5zaW9uL21hc2suanMiLCJzcmMvanMvZmFjdG9yeS9jb21tYW5kLmpzIiwic3JjL2pzL2ZhY3RvcnkvZXJyb3JNZXNzYWdlLmpzIiwic3JjL2pzL2ltYWdlRWRpdG9yLmpzIiwic3JjL2pzL2ludGVyZmFjZS9Db21wb25lbnQuanMiLCJzcmMvanMvaW50ZXJmYWNlL2NvbW1hbmQuanMiLCJzcmMvanMvaW52b2tlci5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xrQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5JbWFnZUVkaXRvcicsIHJlcXVpcmUoJy4vc3JjL2pzL2ltYWdlRWRpdG9yJyksIHRydWUpO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UgY3JvcCBtb2R1bGUgKHN0YXJ0IGNyb3BwaW5nLCBlbmQgY3JvcHBpbmcpXG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgQ3JvcHpvbmUgPSByZXF1aXJlKCcuLi9leHRlbnNpb24vY3JvcHpvbmUnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgTU9VU0VfTU9WRV9USFJFU0hPTEQgPSAxMDtcblxudmFyIGFicyA9IE1hdGguYWJzO1xudmFyIGNsYW1wID0gdXRpbC5jbGFtcDtcbnZhciBrZXlDb2RlcyA9IGNvbnN0cy5rZXlDb2RlcztcblxuLyoqXG4gKiBDcm9wcGVyIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQGNsYXNzIENyb3BwZXJcbiAqL1xudmFyIENyb3BwZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgQ3JvcHBlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtDcm9wem9uZX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Nyb3B6b25lID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnRYIG9mIENyb3B6b25lXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFggPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydFkgb2YgQ3JvcHpvbmVcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0WSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXRlIHdoZXRoZXIgc2hvcnRjdXQga2V5IGlzIHByZXNzZWQgb3Igbm90XG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fd2l0aFNoaWZ0S2V5ID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpc3RlbmVyc1xuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIGtleWRvd246ICQucHJveHkodGhpcy5fb25LZXlEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIGtleXVwOiAkLnByb3h5KHRoaXMuX29uS2V5VXAsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2Vkb3duOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VEb3duLCB0aGlzKSxcbiAgICAgICAgICAgIG1vdXNlbW92ZTogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlTW92ZSwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZXVwOiAkLnByb3h5KHRoaXMuX29uRmFicmljTW91c2VVcCwgdGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5DUk9QUEVSLFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2Nyb3B6b25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7IC8vIHtAbGluayBodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLk9iamVjdC5odG1sI2V2ZW50ZWR9XG4gICAgICAgICAgICBvYmouZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY3JvcHpvbmUgPSBuZXcgQ3JvcHpvbmUoe1xuICAgICAgICAgICAgbGVmdDogLTEwLFxuICAgICAgICAgICAgdG9wOiAtMTAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLCAvLyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2thbmdheC9mYWJyaWMuanMvaXNzdWVzLzI4NjB9XG4gICAgICAgICAgICBjb3JuZXJTaXplOiAxMCxcbiAgICAgICAgICAgIGNvcm5lckNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgIGhhc1JvdGF0aW5nUG9pbnQ6IGZhbHNlLFxuICAgICAgICAgICAgaGFzQm9yZGVyczogZmFsc2UsXG4gICAgICAgICAgICBsb2NrU2NhbGluZ0ZsaXA6IHRydWUsXG4gICAgICAgICAgICBsb2NrUm90YXRpb246IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbnZhcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgICAgIGNhbnZhcy5hZGQodGhpcy5fY3JvcHpvbmUpO1xuICAgICAgICBjYW52YXMub24oJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcbiAgICAgICAgY2FudmFzLnNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICBjYW52YXMuZGVmYXVsdEN1cnNvciA9ICdjcm9zc2hhaXInO1xuXG4gICAgICAgIGZhYnJpYy51dGlsLmFkZExpc3RlbmVyKGRvY3VtZW50LCAna2V5ZG93bicsIHRoaXMuX2xpc3RlbmVycy5rZXlkb3duKTtcbiAgICAgICAgZmFicmljLnV0aWwuYWRkTGlzdGVuZXIoZG9jdW1lbnQsICdrZXl1cCcsIHRoaXMuX2xpc3RlbmVycy5rZXl1cCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBjcm9wcGluZ1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNBcHBseWluZyAtIElzIGFwcGx5aW5nIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHs/e2ltYWdlTmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZ319IGNyb3BwZWQgSW1hZ2UgZGF0YVxuICAgICAqL1xuICAgIGVuZDogZnVuY3Rpb24oaXNBcHBseWluZykge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNyb3B6b25lID0gdGhpcy5fY3JvcHpvbmU7XG4gICAgICAgIHZhciBkYXRhO1xuXG4gICAgICAgIGlmICghY3JvcHpvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNyb3B6b25lLnJlbW92ZSgpO1xuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgY2FudmFzLmRlZmF1bHRDdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIGNhbnZhcy5vZmYoJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duKTtcbiAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICBvYmouZXZlbnRlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNBcHBseWluZykge1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2dldENyb3BwZWRJbWFnZURhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jcm9wem9uZSA9IG51bGw7XG5cbiAgICAgICAgZmFicmljLnV0aWwucmVtb3ZlTGlzdGVuZXIoZG9jdW1lbnQsICdrZXlkb3duJywgdGhpcy5fbGlzdGVuZXJzLmtleWRvd24pO1xuICAgICAgICBmYWJyaWMudXRpbC5yZW1vdmVMaXN0ZW5lcihkb2N1bWVudCwgJ2tleXVwJywgdGhpcy5fbGlzdGVuZXJzLmtleXVwKTtcblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZWRvd24gaGFuZGxlciBpbiBmYWJyaWMgY2FudmFzXG4gICAgICogQHBhcmFtIHt7dGFyZ2V0OiBmYWJyaWMuT2JqZWN0LCBlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZURvd246IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNvb3JkO1xuXG4gICAgICAgIGlmIChmRXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIGNvb3JkID0gY2FudmFzLmdldFBvaW50ZXIoZkV2ZW50LmUpO1xuXG4gICAgICAgIHRoaXMuX3N0YXJ0WCA9IGNvb3JkLng7XG4gICAgICAgIHRoaXMuX3N0YXJ0WSA9IGNvb3JkLnk7XG5cbiAgICAgICAgY2FudmFzLm9uKHtcbiAgICAgICAgICAgICdtb3VzZTptb3ZlJzogdGhpcy5fbGlzdGVuZXJzLm1vdXNlbW92ZSxcbiAgICAgICAgICAgICdtb3VzZTp1cCc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZXVwXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1vdXNlbW92ZSBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlTW92ZTogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcbiAgICAgICAgdmFyIHggPSBwb2ludGVyLng7XG4gICAgICAgIHZhciB5ID0gcG9pbnRlci55O1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcblxuICAgICAgICBpZiAoYWJzKHggLSB0aGlzLl9zdGFydFgpICsgYWJzKHkgLSB0aGlzLl9zdGFydFkpID4gTU9VU0VfTU9WRV9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgIGNyb3B6b25lLnJlbW92ZSgpO1xuICAgICAgICAgICAgY3JvcHpvbmUuc2V0KHRoaXMuX2NhbGNSZWN0RGltZW5zaW9uRnJvbVBvaW50KHgsIHkpKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZChjcm9wem9uZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlY3QgZGltZW5zaW9uIHNldHRpbmcgZnJvbSBDYW52YXMtTW91c2UtUG9zaXRpb24oeCwgeSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIENhbnZhcy1Nb3VzZS1Qb3NpdGlvbiB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBDYW52YXMtTW91c2UtUG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNSZWN0RGltZW5zaW9uRnJvbVBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgY2FudmFzV2lkdGggPSBjYW52YXMuZ2V0V2lkdGgoKTtcbiAgICAgICAgdmFyIGNhbnZhc0hlaWdodCA9IGNhbnZhcy5nZXRIZWlnaHQoKTtcbiAgICAgICAgdmFyIHN0YXJ0WCA9IHRoaXMuX3N0YXJ0WDtcbiAgICAgICAgdmFyIHN0YXJ0WSA9IHRoaXMuX3N0YXJ0WTtcbiAgICAgICAgdmFyIGxlZnQgPSBjbGFtcCh4LCAwLCBzdGFydFgpO1xuICAgICAgICB2YXIgdG9wID0gY2xhbXAoeSwgMCwgc3RhcnRZKTtcbiAgICAgICAgdmFyIHdpZHRoID0gY2xhbXAoeCwgc3RhcnRYLCBjYW52YXNXaWR0aCkgLSBsZWZ0OyAvLyAoc3RhcnRYIDw9IHgobW91c2UpIDw9IGNhbnZhc1dpZHRoKSAtIGxlZnRcbiAgICAgICAgdmFyIGhlaWdodCA9IGNsYW1wKHksIHN0YXJ0WSwgY2FudmFzSGVpZ2h0KSAtIHRvcDsgLy8gKHN0YXJ0WSA8PSB5KG1vdXNlKSA8PSBjYW52YXNIZWlnaHQpIC0gdG9wXG5cbiAgICAgICAgaWYgKHRoaXMuX3dpdGhTaGlmdEtleSkgeyAvLyBtYWtlIGZpeGVkIHJhdGlvIGNyb3B6b25lXG4gICAgICAgICAgICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSB3aWR0aDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGVpZ2h0ID4gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0YXJ0WCA+PSB4KSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IHN0YXJ0WCAtIHdpZHRoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhcnRZID49IHkpIHtcbiAgICAgICAgICAgICAgICB0b3AgPSBzdGFydFkgLSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3VzZXVwIGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRmFicmljTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wem9uZSA9IHRoaXMuX2Nyb3B6b25lO1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBjYW52YXMuc2V0QWN0aXZlT2JqZWN0KGNyb3B6b25lKTtcbiAgICAgICAgY2FudmFzLm9mZih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IGxpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiBsaXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNyb3BwZWQgaW1hZ2UgZGF0YVxuICAgICAqIEByZXR1cm5zIHs/e2ltYWdlTmFtZTogc3RyaW5nLCB1cmw6IHN0cmluZ319IGNyb3BwZWQgSW1hZ2UgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENyb3BwZWRJbWFnZURhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3JvcHpvbmUgPSB0aGlzLl9jcm9wem9uZTtcbiAgICAgICAgdmFyIGNyb3BJbmZvO1xuXG4gICAgICAgIGlmICghY3JvcHpvbmUuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyb3BJbmZvID0ge1xuICAgICAgICAgICAgbGVmdDogY3JvcHpvbmUuZ2V0TGVmdCgpLFxuICAgICAgICAgICAgdG9wOiBjcm9wem9uZS5nZXRUb3AoKSxcbiAgICAgICAgICAgIHdpZHRoOiBjcm9wem9uZS5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBjcm9wem9uZS5nZXRIZWlnaHQoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbWFnZU5hbWU6IHRoaXMuZ2V0SW1hZ2VOYW1lKCksXG4gICAgICAgICAgICB1cmw6IHRoaXMuZ2V0Q2FudmFzKCkudG9EYXRhVVJMKGNyb3BJbmZvKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBLZXlkb3duIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGUgLSBFdmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuU0hJRlQpIHtcbiAgICAgICAgICAgIHRoaXMuX3dpdGhTaGlmdEtleSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogS2V5dXAgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZSAtIEV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5VXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuU0hJRlQpIHtcbiAgICAgICAgICAgIHRoaXMuX3dpdGhTaGlmdEtleSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IEFkZCBmaWx0ZXIgbW9kdWxlXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBNYXNrID0gcmVxdWlyZSgnLi4vZXh0ZW5zaW9uL21hc2snKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxuLyoqXG4gKiBGaWx0ZXJcbiAqIEBjbGFzcyBGaWx0ZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRmlsdGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIEZpbHRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuRklMVEVSLFxuXG4gICAgLyoqXG4gICAgICogQWRkIGZpbHRlciB0byBzb3VyY2UgaW1hZ2UgKGEgc3BlY2lmaWMgZmlsdGVyIGlzIGFkZGVkIG9uIGZhYnJpYy5qcylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEZpbHRlciB0eXBlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgb2YgZmlsdGVyXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgIHZhciBmaWx0ZXIgPSB0aGlzLl9jcmVhdGVGaWx0ZXIodHlwZSwgb3B0aW9ucyk7XG4gICAgICAgIHZhciBzb3VyY2VJbWcgPSB0aGlzLl9nZXRTb3VyY2VJbWFnZSgpO1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcblxuICAgICAgICBpZiAoIWZpbHRlcikge1xuICAgICAgICAgICAganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNvdXJjZUltZy5maWx0ZXJzLnB1c2goZmlsdGVyKTtcblxuICAgICAgICB0aGlzLl9hcHBseShzb3VyY2VJbWcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKHR5cGUsICdhZGQnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBmaWx0ZXIgdG8gc291cmNlIGltYWdlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBGaWx0ZXIgdHlwZVxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgc291cmNlSW1nID0gdGhpcy5fZ2V0U291cmNlSW1hZ2UoKTtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgaWYgKCFzb3VyY2VJbWcuZmlsdGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzb3VyY2VJbWcuZmlsdGVycy5wb3AoKTtcblxuICAgICAgICB0aGlzLl9hcHBseShzb3VyY2VJbWcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKHR5cGUsICdyZW1vdmUnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IGZpbHRlclxuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBzb3VyY2VJbWcgLSBTb3VyY2UgaW1hZ2UgdG8gYXBwbHkgZmlsdGVyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBFeGVjdXRlZCBmdW5jdGlvbiBhZnRlciBhcHBseWluZyBmaWx0ZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hcHBseTogZnVuY3Rpb24oc291cmNlSW1nLCBjYWxsYmFjaykge1xuICAgICAgICBzb3VyY2VJbWcuYXBwbHlGaWx0ZXJzKGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHNvdXJjZSBpbWFnZSBvbiBjYW52YXNcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkltYWdlfSBDdXJyZW50IHNvdXJjZSBpbWFnZSBvbiBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRTb3VyY2VJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBmaWx0ZXIgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEZpbHRlciB0eXBlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgb2YgZmlsdGVyXG4gICAgICogQHJldHVybnMge29iamVjdH0gRmFicmljIG9iamVjdCBvZiBmaWx0ZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVGaWx0ZXI6IGZ1bmN0aW9uKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGZpbHRlck9iajtcblxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ21hc2snOlxuICAgICAgICAgICAgICAgIGZpbHRlck9iaiA9IG5ldyBNYXNrKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBmaWx0ZXJPYmogPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlck9iajtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSBmbGlwIG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvQ29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbi8qKlxuICogRmxpcFxuICogQGNsYXNzIEZsaXBcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRmxpcCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBGbGlwLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5GTElQLFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHt7ZmxpcFg6IEJvb2xlYW4sIGZsaXBZOiBCb29sZWFufX1cbiAgICAgKi9cbiAgICBnZXRDdXJyZW50U2V0dGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmxpcFg6IGNhbnZhc0ltYWdlLmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6IGNhbnZhc0ltYWdlLmZsaXBZXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBmbGlwWCwgZmxpcFlcbiAgICAgKiBAcGFyYW0ge3tmbGlwWDogQm9vbGVhbiwgZmxpcFk6IEJvb2xlYW59fSBuZXdTZXR0aW5nIC0gRmxpcCBzZXR0aW5nXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKG5ld1NldHRpbmcpIHtcbiAgICAgICAgdmFyIHNldHRpbmcgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBYID0gKHNldHRpbmcuZmxpcFggIT09IG5ld1NldHRpbmcuZmxpcFgpO1xuICAgICAgICB2YXIgaXNDaGFuZ2luZ0ZsaXBZID0gKHNldHRpbmcuZmxpcFkgIT09IG5ld1NldHRpbmcuZmxpcFkpO1xuXG4gICAgICAgIGlmICghaXNDaGFuZ2luZ0ZsaXBYICYmICFpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHNldHRpbmcsIG5ld1NldHRpbmcpO1xuICAgICAgICB0aGlzLnNldEltYWdlUHJvcGVydGllcyhzZXR0aW5nLCB0cnVlKTtcbiAgICAgICAgdGhpcy5faW52ZXJ0QW5nbGUoaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpO1xuICAgICAgICB0aGlzLl9mbGlwT2JqZWN0cyhpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShzZXR0aW5nLCB0aGlzLmdldENhbnZhc0ltYWdlKCkuYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZlcnQgaW1hZ2UgYW5nbGUgZm9yIGZsaXBcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ2hhbmdpbmdGbGlwWCAtIENoYW5nZSBmbGlwWFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBZIC0gQ2hhbmdlIGZsaXBZXG4gICAgICovXG4gICAgX2ludmVydEFuZ2xlOiBmdW5jdGlvbihpc0NoYW5naW5nRmxpcFgsIGlzQ2hhbmdpbmdGbGlwWSkge1xuICAgICAgICB2YXIgY2FudmFzSW1hZ2UgPSB0aGlzLmdldENhbnZhc0ltYWdlKCk7XG4gICAgICAgIHZhciBhbmdsZSA9IGNhbnZhc0ltYWdlLmFuZ2xlO1xuXG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFgpIHtcbiAgICAgICAgICAgIGFuZ2xlICo9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGFuZ2xlICo9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhc0ltYWdlLnNldEFuZ2xlKHBhcnNlRmxvYXQoYW5nbGUpKS5zZXRDb29yZHMoKTsvLyBwYXJzZUZsb2F0IGZvciAtMCB0byAwXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZsaXAgb2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDaGFuZ2luZ0ZsaXBYIC0gQ2hhbmdlIGZsaXBYXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0NoYW5naW5nRmxpcFkgLSBDaGFuZ2UgZmxpcFlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mbGlwT2JqZWN0czogZnVuY3Rpb24oaXNDaGFuZ2luZ0ZsaXBYLCBpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgaWYgKGlzQ2hhbmdpbmdGbGlwWCkge1xuICAgICAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlOiBwYXJzZUZsb2F0KG9iai5hbmdsZSAqIC0xKSwgLy8gcGFyc2VGbG9hdCBmb3IgLTAgdG8gMFxuICAgICAgICAgICAgICAgICAgICBmbGlwWDogIW9iai5mbGlwWCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogY2FudmFzLndpZHRoIC0gb2JqLmxlZnRcbiAgICAgICAgICAgICAgICB9KS5zZXRDb29yZHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0NoYW5naW5nRmxpcFkpIHtcbiAgICAgICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZTogcGFyc2VGbG9hdChvYmouYW5nbGUgKiAtMSksIC8vIHBhcnNlRmxvYXQgZm9yIC0wIHRvIDBcbiAgICAgICAgICAgICAgICAgICAgZmxpcFk6ICFvYmouZmxpcFksXG4gICAgICAgICAgICAgICAgICAgIHRvcDogY2FudmFzLmhlaWdodCAtIG9iai50b3BcbiAgICAgICAgICAgICAgICB9KS5zZXRDb29yZHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgZmxpcCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQoe1xuICAgICAgICAgICAgZmxpcFg6IGZhbHNlLFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiAhY3VycmVudC5mbGlwWCxcbiAgICAgICAgICAgIGZsaXBZOiBjdXJyZW50LmZsaXBZXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHlcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAqL1xuICAgIGZsaXBZOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRTZXR0aW5nKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHtcbiAgICAgICAgICAgIGZsaXBYOiBjdXJyZW50LmZsaXBYLFxuICAgICAgICAgICAgZmxpcFk6ICFjdXJyZW50LmZsaXBZXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaXA7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBGcmVlIGRyYXdpbmcgbW9kdWxlLCBTZXQgYnJ1c2hcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEZyZWVEcmF3aW5nXG4gKiBAY2xhc3MgRnJlZURyYXdpbmdcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgRnJlZURyYXdpbmcgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRnJlZURyYXdpbmcucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCcnVzaCB3aWR0aFxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53aWR0aCA9IDEyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmYWJyaWMuQ29sb3IgaW5zdGFuY2UgZm9yIGJydXNoIGNvbG9yXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ29sb3J9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9Db2xvciA9IG5ldyBmYWJyaWMuQ29sb3IoJ3JnYmEoMCwgMCwgMCwgMC41KScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLkZSRUVfRFJBV0lORyxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGZyZWUgZHJhd2luZyBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5pc0RyYXdpbmdNb2RlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRCcnVzaChzZXR0aW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGJydXNoXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHNldEJydXNoOiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBicnVzaCA9IHRoaXMuZ2V0Q2FudmFzKCkuZnJlZURyYXdpbmdCcnVzaDtcblxuICAgICAgICBzZXR0aW5nID0gc2V0dGluZyB8fCB7fTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHNldHRpbmcud2lkdGggfHwgdGhpcy53aWR0aDtcbiAgICAgICAgaWYgKHNldHRpbmcuY29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMub0NvbG9yID0gbmV3IGZhYnJpYy5Db2xvcihzZXR0aW5nLmNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBicnVzaC53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGJydXNoLmNvbG9yID0gdGhpcy5vQ29sb3IudG9SZ2JhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBmcmVlIGRyYXdpbmcgbW9kZVxuICAgICAqL1xuICAgIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5pc0RyYXdpbmdNb2RlID0gZmFsc2U7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRnJlZURyYXdpbmc7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBBZGQgaWNvbiBtb2R1bGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG52YXIgcGF0aE1hcCA9IHtcbiAgICBhcnJvdzogJ00gMCA5MCBIIDEwNSBWIDEyMCBMIDE2MCA2MCBMIDEwNSAwIFYgMzAgSCAwIFonLFxuICAgIGNhbmNlbDogJ00gMCAzMCBMIDMwIDYwIEwgMCA5MCBMIDMwIDEyMCBMIDYwIDkwIEwgOTAgMTIwIEwgMTIwIDkwICcgK1xuICAgICAgICAgICAgJ0wgOTAgNjAgTCAxMjAgMzAgTCA5MCAwIEwgNjAgMzAgTCAzMCAwIFonXG59O1xuXG4vKipcbiAqIEljb25cbiAqIEBjbGFzcyBJY29uXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqL1xudmFyIEljb24gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgSWNvbi5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlZmF1bHQgaWNvbiBjb2xvclxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb0NvbG9yID0gJyMwMDAwMDAnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXRoIHZhbHVlIG9mIGVhY2ggaWNvbiB0eXBlXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wYXRoTWFwID0gcGF0aE1hcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5JQ09OLFxuXG4gICAgLyoqXG4gICAgICogQWRkIGljb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEljb24gdHlwZVxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNlbnRlclBvcyA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKS5nZXRDZW50ZXJQb2ludCgpO1xuICAgICAgICB2YXIgcGF0aCA9IHRoaXMuX3BhdGhNYXBbdHlwZV07XG4gICAgICAgIHZhciBpY29uO1xuXG4gICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWNvbiA9IHRoaXMuX2NyZWF0ZUljb24ocGF0aCk7XG5cbiAgICAgICAgaWNvbi5zZXQoY29uc3RzLmZPYmplY3RPcHRpb25zLlNFTEVDVElPTl9TVFlMRSk7XG4gICAgICAgIGljb24uc2V0KHtcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuX29Db2xvcixcbiAgICAgICAgICAgIGxlZnQ6IGNlbnRlclBvcy54LFxuICAgICAgICAgICAgdG9wOiBjZW50ZXJQb3MueSxcbiAgICAgICAgICAgIHR5cGU6ICdpY29uJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXMuYWRkKGljb24pLnNldEFjdGl2ZU9iamVjdChpY29uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgaWNvbiBwYXRoc1xuICAgICAqIEBwYXJhbSB7e2tleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfX0gcGF0aEluZm9zIC0gUGF0aCBpbmZvc1xuICAgICAqL1xuICAgIHJlZ2lzdGVyUGF0aHM6IGZ1bmN0aW9uKHBhdGhJbmZvcykge1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHBhdGhJbmZvcywgZnVuY3Rpb24ocGF0aCwgdHlwZSkge1xuICAgICAgICAgICAgdGhpcy5fcGF0aE1hcFt0eXBlXSA9IHBhdGg7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaWNvbiBvYmplY3QgY29sb3JcbiAgICAgKiBAcGFyYW0ge3N0cmlnbn0gY29sb3IgLSBDb2xvciB0byBzZXRcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5QYXRofVtvYmpdIC0gQ3VycmVudCBhY3RpdmF0ZWQgcGF0aCBvYmplY3RcbiAgICAgKi9cbiAgICBzZXRDb2xvcjogZnVuY3Rpb24oY29sb3IsIG9iaikge1xuICAgICAgICB0aGlzLl9vQ29sb3IgPSBjb2xvcjtcblxuICAgICAgICBpZiAob2JqICYmIG9iai5nZXQoJ3R5cGUnKSA9PT0gJ2ljb24nKSB7XG4gICAgICAgICAgICBvYmouc2V0RmlsbCh0aGlzLl9vQ29sb3IpO1xuICAgICAgICAgICAgdGhpcy5nZXRDYW52YXMoKS5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgaWNvbiBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIFBhdGggdmFsdWUgdG8gY3JlYXRlIGljb25cbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLlBhdGh9IFBhdGggb2JqZWN0XG4gICAgICovXG4gICAgX2NyZWF0ZUljb246IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBmYWJyaWMuUGF0aChwYXRoKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJY29uO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgSW1hZ2UgbG9hZGVyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGltYWdlT3B0aW9uID0ge1xuICAgIHBhZGRpbmc6IDAsXG4gICAgY3Jvc3NPcmlnaW46ICdhbm9ueW1vdXMnXG59O1xuXG4vKipcbiAqIEltYWdlTG9hZGVyIGNvbXBvbmVudHNcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3MgSW1hZ2VMb2FkZXJcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKi9cbnZhciBJbWFnZUxvYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBJbWFnZUxvYWRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuSU1BR0VfTE9BREVSLFxuXG4gICAgLyoqXG4gICAgICogTG9hZCBpbWFnZSBmcm9tIHVybFxuICAgICAqIEBwYXJhbSB7P3N0cmluZ30gaW1hZ2VOYW1lIC0gRmlsZSBuYW1lXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxzdHJpbmcpfSBpbWcgLSBmYWJyaWMuSW1hZ2UgaW5zdGFuY2Ugb3IgVVJMIG9mIGFuIGltYWdlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH0gZGVmZXJyZWRcbiAgICAgKi9cbiAgICBsb2FkOiBmdW5jdGlvbihpbWFnZU5hbWUsIGltZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBqcURlZmVyLCBjYW52YXM7XG5cbiAgICAgICAgaWYgKCFpbWFnZU5hbWUgJiYgIWltZykgeyAvLyBCYWNrIHRvIHRoZSBpbml0aWFsIHN0YXRlLCBub3QgZXJyb3IuXG4gICAgICAgICAgICBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICAgICAgY2FudmFzLmJhY2tncm91bmRJbWFnZSA9IG51bGw7XG4gICAgICAgICAgICBjYW52YXMucmVuZGVyQWxsKCk7XG5cbiAgICAgICAgICAgIGpxRGVmZXIgPSAkLkRlZmVycmVkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0Q2FudmFzSW1hZ2UoJycsIG51bGwpO1xuICAgICAgICAgICAgfSkucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX3NldEJhY2tncm91bmRJbWFnZShpbWcpLmRvbmUoZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRDYW52YXNJbWFnZShpbWFnZU5hbWUsIG9JbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICogQHBhcmFtIHs/KGZhYnJpYy5JbWFnZXxTdHJpbmcpfSBpbWcgZmFicmljLkltYWdlIGluc3RhbmNlIG9yIFVSTCBvZiBhbiBpbWFnZSB0byBzZXQgYmFja2dyb3VuZCB0b1xuICAgICAqIEByZXR1cm5zIHskLkRlZmVycmVkfSBkZWZlcnJlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEJhY2tncm91bmRJbWFnZTogZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICB2YXIgY2FudmFzO1xuXG4gICAgICAgIGlmICghaW1nKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgICAgIGNhbnZhcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoaW1nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBvSW1hZ2UgPSBjYW52YXMuYmFja2dyb3VuZEltYWdlO1xuXG4gICAgICAgICAgICBpZiAob0ltYWdlLmdldEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvSW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpbWFnZU9wdGlvbik7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VMb2FkZXI7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBGcmVlIGRyYXdpbmcgbW9kdWxlLCBTZXQgYnJ1c2hcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIExpbmVcbiAqIEBjbGFzcyBMaW5lXG4gKiBAcGFyYW0ge0NvbXBvbmVudH0gcGFyZW50IC0gcGFyZW50IGNvbXBvbmVudFxuICogQGV4dGVuZHMge0NvbXBvbmVudH1cbiAqL1xudmFyIExpbmUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgRnJlZURyYXdpbmcucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnNldFBhcmVudChwYXJlbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCcnVzaCB3aWR0aFxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fd2lkdGggPSAxMjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogZmFicmljLkNvbG9yIGluc3RhbmNlIGZvciBicnVzaCBjb2xvclxuICAgICAgICAgKiBAdHlwZSB7ZmFicmljLkNvbG9yfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb0NvbG9yID0gbmV3IGZhYnJpYy5Db2xvcigncmdiYSgwLCAwLCAwLCAwLjUpJyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpc3RlbmVyc1xuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlRG93biwgdGhpcyksXG4gICAgICAgICAgICBtb3VzZW1vdmU6ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZU1vdmUsIHRoaXMpLFxuICAgICAgICAgICAgbW91c2V1cDogJC5wcm94eSh0aGlzLl9vbkZhYnJpY01vdXNlVXAsIHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuTElORSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGRyYXdpbmcgbGluZSBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6ID9udW1iZXIsIGNvbG9yOiA/c3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2Nyb3NzaGFpcic7XG4gICAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNldEJydXNoKHNldHRpbmcpO1xuXG4gICAgICAgIGNhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgb2JqLnNldCh7XG4gICAgICAgICAgICAgICAgZXZlbnRlZDogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXMub24oe1xuICAgICAgICAgICAgJ21vdXNlOmRvd24nOiB0aGlzLl9saXN0ZW5lcnMubW91c2Vkb3duXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYnJ1c2hcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogP251bWJlciwgY29sb3I6ID9zdHJpbmd9fSBbc2V0dGluZ10gLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICovXG4gICAgc2V0QnJ1c2g6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgdmFyIGJydXNoID0gdGhpcy5nZXRDYW52YXMoKS5mcmVlRHJhd2luZ0JydXNoO1xuXG4gICAgICAgIHNldHRpbmcgPSBzZXR0aW5nIHx8IHt9O1xuICAgICAgICB0aGlzLl93aWR0aCA9IHNldHRpbmcud2lkdGggfHwgdGhpcy5fd2lkdGg7XG5cbiAgICAgICAgaWYgKHNldHRpbmcuY29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX29Db2xvciA9IG5ldyBmYWJyaWMuQ29sb3Ioc2V0dGluZy5jb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJ1c2gud2lkdGggPSB0aGlzLl93aWR0aDtcbiAgICAgICAgYnJ1c2guY29sb3IgPSB0aGlzLl9vQ29sb3IudG9SZ2JhKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBkcmF3aW5nIGxpbmUgbW9kZVxuICAgICAqL1xuICAgIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuXG4gICAgICAgIGNhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICBjYW52YXMuc2VsZWN0aW9uID0gdHJ1ZTtcblxuICAgICAgICBjYW52YXMuZm9yRWFjaE9iamVjdChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgICAgIGV2ZW50ZWQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXMub2ZmKCdtb3VzZTpkb3duJywgdGhpcy5fbGlzdGVuZXJzLm1vdXNlZG93bik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdXNlZG93biBldmVudCBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZURvd246IGZ1bmN0aW9uKGZFdmVudCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSBjYW52YXMuZ2V0UG9pbnRlcihmRXZlbnQuZSk7XG4gICAgICAgIHZhciBwb2ludHMgPSBbcG9pbnRlci54LCBwb2ludGVyLnksIHBvaW50ZXIueCwgcG9pbnRlci55XTtcblxuICAgICAgICB0aGlzLl9saW5lID0gbmV3IGZhYnJpYy5MaW5lKHBvaW50cywge1xuICAgICAgICAgICAgc3Ryb2tlOiB0aGlzLl9vQ29sb3IudG9SZ2JhKCksXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogdGhpcy5fd2lkdGgsXG4gICAgICAgICAgICBldmVudGVkOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9saW5lLnNldChjb25zdHMuZk9iamVjdE9wdGlvbnMuU0VMRUNUSU9OX1NUWUxFKTtcblxuICAgICAgICBjYW52YXMuYWRkKHRoaXMuX2xpbmUpO1xuXG4gICAgICAgIGNhbnZhcy5vbih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiB0aGlzLl9saXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW91c2Vtb3ZlIGV2ZW50IGhhbmRsZXIgaW4gZmFicmljIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7e3RhcmdldDogZmFicmljLk9iamVjdCwgZTogTW91c2VFdmVudH19IGZFdmVudCAtIEZhYnJpYyBldmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkZhYnJpY01vdXNlTW92ZTogZnVuY3Rpb24oZkV2ZW50KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKTtcblxuICAgICAgICB0aGlzLl9saW5lLnNldCh7XG4gICAgICAgICAgICB4MjogcG9pbnRlci54LFxuICAgICAgICAgICAgeTI6IHBvaW50ZXIueVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9saW5lLnNldENvb3JkcygpO1xuXG4gICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW91c2V1cCBldmVudCBoYW5kbGVyIGluIGZhYnJpYyBjYW52YXNcbiAgICAgKiBAcGFyYW0ge3t0YXJnZXQ6IGZhYnJpYy5PYmplY3QsIGU6IE1vdXNlRXZlbnR9fSBmRXZlbnQgLSBGYWJyaWMgZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgdGhpcy5fbGluZSA9IG51bGw7XG5cbiAgICAgICAgY2FudmFzLm9mZih7XG4gICAgICAgICAgICAnbW91c2U6bW92ZSc6IHRoaXMuX2xpc3RlbmVycy5tb3VzZW1vdmUsXG4gICAgICAgICAgICAnbW91c2U6dXAnOiB0aGlzLl9saXN0ZW5lcnMubW91c2V1cFxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lO1xuIiwiLyoqXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIERldmVsb3BtZW50IFRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBmaWxlb3ZlcnZpZXcgTWFpbiBjb21wb25lbnQgaGF2aW5nIGNhbnZhcyAmIGltYWdlLCBzZXQgY3NzLW1heC1kaW1lbnNpb24gb2YgY2FudmFzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2ludGVyZmFjZS9jb21wb25lbnQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIERFRkFVTFRfQ1NTX01BWF9XSURUSCA9IDEwMDA7XG52YXIgREVGQVVMVF9DU1NfTUFYX0hFSUdIVCA9IDgwMDtcblxudmFyIGNzc09ubHkgPSB7XG4gICAgY3NzT25seTogdHJ1ZVxufTtcbnZhciBiYWNrc3RvcmVPbmx5ID0ge1xuICAgIGJhY2tzdG9yZU9ubHk6IHRydWVcbn07XG5cbi8qKlxuICogTWFpbiBjb21wb25lbnRcbiAqIEBleHRlbmRzIHtDb21wb25lbnR9XG4gKiBAY2xhc3NcbiAqL1xudmFyIE1haW4gPSB0dWkudXRpbC5kZWZpbmVDbGFzcyhDb21wb25lbnQsIC8qKiBAbGVuZHMgTWFpbi5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgY2FudmFzIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtmYWJyaWMuQ2FudmFzfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5JbWFnZX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2FudmFzSW1hZ2UgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXggd2lkdGggb2YgY2FudmFzIGVsZW1lbnRzXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNzc01heFdpZHRoID0gREVGQVVMVF9DU1NfTUFYX1dJRFRIO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXggaGVpZ2h0IG9mIGNhbnZhcyBlbGVtZW50c1xuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jc3NNYXhIZWlnaHQgPSBERUZBVUxUX0NTU19NQVhfSEVJR0hUO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbWFnZSBuYW1lXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmltYWdlTmFtZSA9ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgbmFtZTogY29uc3RzLmNvbXBvbmVudE5hbWVzLk1BSU4sXG5cbiAgICAvKipcbiAgICAgKiBUbyBkYXRhIHVybCBmcm9tIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBET01TdHJpbmcgaW5kaWNhdGluZyB0aGUgaW1hZ2UgZm9ybWF0LiBUaGUgZGVmYXVsdCB0eXBlIGlzIGltYWdlL3BuZy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIERPTVN0cmluZyBjb250YWluaW5nIHRoZSByZXF1ZXN0ZWQgZGF0YSBVUkkuXG4gICAgICovXG4gICAgdG9EYXRhVVJMOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyAmJiB0aGlzLmNhbnZhcy50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhdmUgaW1hZ2UoYmFja2dyb3VuZCkgb2YgY2FudmFzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBOYW1lIG9mIGltYWdlXG4gICAgICogQHBhcmFtIHs/ZmFicmljLkltYWdlfSBjYW52YXNJbWFnZSAtIEZhYnJpYyBpbWFnZSBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0ltYWdlOiBmdW5jdGlvbihuYW1lLCBjYW52YXNJbWFnZSkge1xuICAgICAgICBpZiAoY2FudmFzSW1hZ2UpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLnN0YW1wKGNhbnZhc0ltYWdlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmltYWdlTmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY2FudmFzSW1hZ2UgPSBjYW52YXNJbWFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNzcyBtYXggZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fSBtYXhEaW1lbnNpb24gLSBNYXggd2lkdGggJiBNYXggaGVpZ2h0XG4gICAgICovXG4gICAgc2V0Q3NzTWF4RGltZW5zaW9uOiBmdW5jdGlvbihtYXhEaW1lbnNpb24pIHtcbiAgICAgICAgdGhpcy5jc3NNYXhXaWR0aCA9IG1heERpbWVuc2lvbi53aWR0aCB8fCB0aGlzLmNzc01heFdpZHRoO1xuICAgICAgICB0aGlzLmNzc01heEhlaWdodCA9IG1heERpbWVuc2lvbi5oZWlnaHQgfHwgdGhpcy5jc3NNYXhIZWlnaHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZWxlbWVudCB0byBmYWJyaWMuQ2FudmFzXG4gICAgICogQHBhcmFtIHtqUXVlcnl8RWxlbWVudHxzdHJpbmd9IGNhbnZhc0VsZW1lbnQgLSBDYW52YXMgZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcygkKGNhbnZhc0VsZW1lbnQpWzBdLCB7XG4gICAgICAgICAgICBjb250YWluZXJDbGFzczogJ3R1aS1pbWFnZS1lZGl0b3ItY2FudmFzLWNvbnRhaW5lcidcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkanVzdCBjYW52YXMgZGltZW5zaW9uIHdpdGggc2NhbGluZyBpbWFnZVxuICAgICAqL1xuICAgIGFkanVzdENhbnZhc0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXNJbWFnZSA9IHRoaXMuY2FudmFzSW1hZ2Uuc2NhbGUoMSk7XG4gICAgICAgIHZhciBib3VuZGluZ1JlY3QgPSBjYW52YXNJbWFnZS5nZXRCb3VuZGluZ1JlY3QoKTtcbiAgICAgICAgdmFyIHdpZHRoID0gYm91bmRpbmdSZWN0LndpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gYm91bmRpbmdSZWN0LmhlaWdodDtcbiAgICAgICAgdmFyIG1heERpbWVuc2lvbiA9IHRoaXMuX2NhbGNNYXhEaW1lbnNpb24od2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5zZXRDYW52YXNDc3NEaW1lbnNpb24oe1xuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLCAvLyBTZXQgaGVpZ2h0ICcnIGZvciBJRTlcbiAgICAgICAgICAgICdtYXgtd2lkdGgnOiBtYXhEaW1lbnNpb24ud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBtYXhEaW1lbnNpb24uaGVpZ2h0ICsgJ3B4J1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRDYW52YXNCYWNrc3RvcmVEaW1lbnNpb24oe1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2FudmFzLmNlbnRlck9iamVjdChjYW52YXNJbWFnZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBtYXggZGltZW5zaW9uIG9mIGNhbnZhc1xuICAgICAqIFRoZSBjc3MtbWF4IGRpbWVuc2lvbiBpcyBkeW5hbWljYWxseSBkZWNpZGVkIHdpdGggbWFpbnRhaW5pbmcgaW1hZ2UgcmF0aW9cbiAgICAgKiBUaGUgY3NzLW1heCBkaW1lbnNpb24gaXMgbG93ZXIgdGhhbiBjYW52YXMgZGltZW5zaW9uIChhdHRyaWJ1dGUgb2YgY2FudmFzLCBub3QgY3NzKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIENhbnZhcyB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBDYW52YXMgaGVpZ2h0XG4gICAgICogQHJldHVybnMge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IC0gTWF4IHdpZHRoICYgTWF4IGhlaWdodFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNNYXhEaW1lbnNpb246IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIHdTY2FsZUZhY3RvciA9IHRoaXMuY3NzTWF4V2lkdGggLyB3aWR0aDtcbiAgICAgICAgdmFyIGhTY2FsZUZhY3RvciA9IHRoaXMuY3NzTWF4SGVpZ2h0IC8gaGVpZ2h0O1xuICAgICAgICB2YXIgY3NzTWF4V2lkdGggPSBNYXRoLm1pbih3aWR0aCwgdGhpcy5jc3NNYXhXaWR0aCk7XG4gICAgICAgIHZhciBjc3NNYXhIZWlnaHQgPSBNYXRoLm1pbihoZWlnaHQsIHRoaXMuY3NzTWF4SGVpZ2h0KTtcblxuICAgICAgICBpZiAod1NjYWxlRmFjdG9yIDwgMSAmJiB3U2NhbGVGYWN0b3IgPCBoU2NhbGVGYWN0b3IpIHtcbiAgICAgICAgICAgIGNzc01heFdpZHRoID0gd2lkdGggKiB3U2NhbGVGYWN0b3I7XG4gICAgICAgICAgICBjc3NNYXhIZWlnaHQgPSBoZWlnaHQgKiB3U2NhbGVGYWN0b3I7XG4gICAgICAgIH0gZWxzZSBpZiAoaFNjYWxlRmFjdG9yIDwgMSAmJiBoU2NhbGVGYWN0b3IgPCB3U2NhbGVGYWN0b3IpIHtcbiAgICAgICAgICAgIGNzc01heFdpZHRoID0gd2lkdGggKiBoU2NhbGVGYWN0b3I7XG4gICAgICAgICAgICBjc3NNYXhIZWlnaHQgPSBoZWlnaHQgKiBoU2NhbGVGYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IE1hdGguZmxvb3IoY3NzTWF4V2lkdGgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLmZsb29yKGNzc01heEhlaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBjc3Mgb25seVxuICAgICAqICB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5DYW52YXMuaHRtbCNzZXREaW1lbnNpb25zfVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgY3NzIGRpbWVuc2lvblxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0Nzc0RpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnNldERpbWVuc2lvbnMoZGltZW5zaW9uLCBjc3NPbmx5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBiYWNrc3RvcmUgb25seVxuICAgICAqICB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5DYW52YXMuaHRtbCNzZXREaW1lbnNpb25zfVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgYmFja3N0b3JlIGRpbWVuc2lvblxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnNldERpbWVuc2lvbnMoZGltZW5zaW9uLCBiYWNrc3RvcmVPbmx5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGltYWdlIHByb3BlcnRpZXNcbiAgICAgKiB7QGxpbmsgaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5JbWFnZS5odG1sI3NldH1cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZyAtIEltYWdlIHByb3BlcnRpZXNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt3aXRoUmVuZGVyaW5nXSAtIElmIHRydWUsIFRoZSBjaGFuZ2VkIGltYWdlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHRoZSBjYW52YXNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBzZXRJbWFnZVByb3BlcnRpZXM6IGZ1bmN0aW9uKHNldHRpbmcsIHdpdGhSZW5kZXJpbmcpIHtcbiAgICAgICAgdmFyIGNhbnZhc0ltYWdlID0gdGhpcy5jYW52YXNJbWFnZTtcblxuICAgICAgICBpZiAoIWNhbnZhc0ltYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXNJbWFnZS5zZXQoc2V0dGluZykuc2V0Q29vcmRzKCk7XG4gICAgICAgIGlmICh3aXRoUmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNhbnZhcyBlbGVtZW50IG9mIGZhYnJpYy5DYW52YXNbW2xvd2VyLWNhbnZhc11dXG4gICAgICogQHJldHVybnMge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGdldENhbnZhc0VsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZmFicmljLkNhbnZhcyBpbnN0YW5jZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtmYWJyaWMuQ2FudmFzfVxuICAgICAqL1xuICAgIGdldENhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhbnZhc0ltYWdlIChmYWJyaWMuSW1hZ2UgaW5zdGFuY2UpXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5JbWFnZX1cbiAgICAgKi9cbiAgICBnZXRDYW52YXNJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhc0ltYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaW1hZ2UgbmFtZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0SW1hZ2VOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1hZ2VOYW1lO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1haW47XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZSByb3RhdGlvbiBtb2R1bGVcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL0NvbXBvbmVudCcpO1xudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG4vKipcbiAqIEltYWdlIFJvdGF0aW9uIGNvbXBvbmVudFxuICogQGNsYXNzIFJvdGF0aW9uXG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICogQHBhcmFtIHtDb21wb25lbnR9IHBhcmVudCAtIHBhcmVudCBjb21wb25lbnRcbiAqL1xudmFyIFJvdGF0aW9uID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoQ29tcG9uZW50LCAvKiogQGxlbmRzIFJvdGF0aW9uLnByb3RvdHlwZSAqLyB7XG4gICAgaW5pdDogZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgIHRoaXMuc2V0UGFyZW50KHBhcmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBvbmVudCBuYW1lXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBuYW1lOiBjb25zdHMuY29tcG9uZW50TmFtZXMuUk9UQVRJT04sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBhbmdsZVxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0Q3VycmVudEFuZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKS5hbmdsZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGFuZ2xlIG9mIHRoZSBpbWFnZVxuICAgICAqXG4gICAgICogIERvIG5vdCBjYWxsIFwidGhpcy5zZXRJbWFnZVByb3BlcnRpZXNcIiBmb3Igc2V0dGluZyBhbmdsZSBkaXJlY3RseS5cbiAgICAgKiAgQmVmb3JlIHNldHRpbmcgYW5nbGUsIFRoZSBvcmlnaW5YLFkgb2YgaW1hZ2Ugc2hvdWxkIGJlIHNldCB0byBjZW50ZXIuXG4gICAgICogICAgICBTZWUgXCJodHRwOi8vZmFicmljanMuY29tL2RvY3MvZmFicmljLk9iamVjdC5odG1sI3NldEFuZ2xlXCJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIEFuZ2xlIHZhbHVlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICBzZXRBbmdsZTogZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgdmFyIG9sZEFuZ2xlID0gdGhpcy5nZXRDdXJyZW50QW5nbGUoKSAlIDM2MDsgLy9UaGUgYW5nbGUgaXMgbG93ZXIgdGhhbiAyKlBJKD09PTM2MCBkZWdyZWVzKVxuICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgdmFyIG9sZEltYWdlQ2VudGVyLCBuZXdJbWFnZUNlbnRlciwgY2FudmFzSW1hZ2U7XG5cbiAgICAgICAgYW5nbGUgJT0gMzYwO1xuICAgICAgICBpZiAoYW5nbGUgPT09IG9sZEFuZ2xlKSB7XG4gICAgICAgICAgICByZXR1cm4ganFEZWZlci5yZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXNJbWFnZSA9IHRoaXMuZ2V0Q2FudmFzSW1hZ2UoKTtcblxuICAgICAgICBvbGRJbWFnZUNlbnRlciA9IGNhbnZhc0ltYWdlLmdldENlbnRlclBvaW50KCk7XG4gICAgICAgIGNhbnZhc0ltYWdlLnNldEFuZ2xlKGFuZ2xlKS5zZXRDb29yZHMoKTtcbiAgICAgICAgdGhpcy5hZGp1c3RDYW52YXNEaW1lbnNpb24oKTtcbiAgICAgICAgbmV3SW1hZ2VDZW50ZXIgPSBjYW52YXNJbWFnZS5nZXRDZW50ZXJQb2ludCgpO1xuICAgICAgICB0aGlzLl9yb3RhdGVGb3JFYWNoT2JqZWN0KG9sZEltYWdlQ2VudGVyLCBuZXdJbWFnZUNlbnRlciwgYW5nbGUgLSBvbGRBbmdsZSk7XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXIucmVzb2x2ZShhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSBmb3IgZWFjaCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge2ZhYnJpYy5Qb2ludH0gb2xkSW1hZ2VDZW50ZXIgLSBJbWFnZSBjZW50ZXIgcG9pbnQgYmVmb3JlIHJvdGF0aW9uXG4gICAgICogQHBhcmFtIHtmYWJyaWMuUG9pbnR9IG5ld0ltYWdlQ2VudGVyIC0gSW1hZ2UgY2VudGVyIHBvaW50IGFmdGVyIHJvdGF0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlRGlmZiAtIEltYWdlIGFuZ2xlIGRpZmZlcmVuY2UgYWZ0ZXIgcm90YXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yb3RhdGVGb3JFYWNoT2JqZWN0OiBmdW5jdGlvbihvbGRJbWFnZUNlbnRlciwgbmV3SW1hZ2VDZW50ZXIsIGFuZ2xlRGlmZikge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICAgICAgdmFyIGNlbnRlckRpZmYgPSB7XG4gICAgICAgICAgICB4OiBvbGRJbWFnZUNlbnRlci54IC0gbmV3SW1hZ2VDZW50ZXIueCxcbiAgICAgICAgICAgIHk6IG9sZEltYWdlQ2VudGVyLnkgLSBuZXdJbWFnZUNlbnRlci55XG4gICAgICAgIH07XG5cbiAgICAgICAgY2FudmFzLmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICB2YXIgb2JqQ2VudGVyID0gb2JqLmdldENlbnRlclBvaW50KCk7XG4gICAgICAgICAgICB2YXIgcmFkaWFuID0gZmFicmljLnV0aWwuZGVncmVlc1RvUmFkaWFucyhhbmdsZURpZmYpO1xuICAgICAgICAgICAgdmFyIG5ld09iakNlbnRlciA9IGZhYnJpYy51dGlsLnJvdGF0ZVBvaW50KG9iakNlbnRlciwgb2xkSW1hZ2VDZW50ZXIsIHJhZGlhbik7XG5cbiAgICAgICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgICAgIGxlZnQ6IG5ld09iakNlbnRlci54IC0gY2VudGVyRGlmZi54LFxuICAgICAgICAgICAgICAgIHRvcDogbmV3T2JqQ2VudGVyLnkgLSBjZW50ZXJEaWZmLnksXG4gICAgICAgICAgICAgICAgYW5nbGU6IChvYmouYW5nbGUgKyBhbmdsZURpZmYpICUgMzYwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9iai5zZXRDb29yZHMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoZSBpbWFnZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhZGRpdGlvbmFsQW5nbGUgLSBBZGRpdGlvbmFsIGFuZ2xlXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICByb3RhdGU6IGZ1bmN0aW9uKGFkZGl0aW9uYWxBbmdsZSkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0Q3VycmVudEFuZ2xlKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QW5nbGUoY3VycmVudCArIGFkZGl0aW9uYWxBbmdsZSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUm90YXRpb247XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBUZXh0IG1vZHVsZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9pbnRlcmZhY2UvY29tcG9uZW50Jyk7XG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbnZhciBkZWZhdWx0U3R5bGVzID0ge1xuICAgIGZpbGw6ICcjMDAwMDAwJyxcbiAgICBsZWZ0OiAwLFxuICAgIHRvcDogMCxcbiAgICBwYWRkaW5nOiAyMFxufTtcbnZhciByZXNldFN0eWxlcyA9IHtcbiAgICBmaWxsOiAnIzAwMDAwMCcsXG4gICAgZm9udFN0eWxlOiAnbm9ybWFsJyxcbiAgICBmb250V2VpZ2h0OiAnbm9ybWFsJyxcbiAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICB0ZXh0RGVjb3JhaXRvbjogJydcbn07XG5cbi8qKlxuICogVGV4dFxuICogQGNsYXNzIFRleHRcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnQgLSBwYXJlbnQgY29tcG9uZW50XG4gKiBAZXh0ZW5kcyB7Q29tcG9uZW50fVxuICovXG52YXIgVGV4dCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKENvbXBvbmVudCwgLyoqIEBsZW5kcyBUZXh0LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRQYXJlbnQocGFyZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVmYXVsdCB0ZXh0IHN0eWxlXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kZWZhdWx0U3R5bGVzID0gZGVmYXVsdFN0eWxlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIG5hbWU6IGNvbnN0cy5jb21wb25lbnROYW1lcy5URVhULFxuXG4gICAgLyoqXG4gICAgICogQWRkIG5ldyB0ZXh0IG9uIGNhbnZhcyBpbWFnZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gSW5pdGlhbCBpbnB1dCB0ZXh0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gT3B0aW9ucyBmb3IgZ2VuZXJhdGluZyB0ZXh0XG4gICAgICogICAgIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3Muc3R5bGVzXSBJbml0aWFsIHN0eWxlc1xuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5zdHlsZXMuZmlsbF0gQ29sb3JcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Muc3R5bGVzLmZvbnRGYW1pbHldIEZvbnQgdHlwZSBmb3IgdGV4dFxuICAgICAqICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5zdHlsZXMuZm9udFNpemVdIFNpemVcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Muc3R5bGVzLmZvbnRTdHlsZV0gVHlwZSBvZiBpbmNsaW5hdGlvbiAobm9ybWFsIC8gaXRhbGljKVxuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5zdHlsZXMuZm9udFdlaWdodF0gVHlwZSBvZiB0aGlja2VyIG9yIHRoaW5uZXIgbG9va2luZyAobm9ybWFsIC8gYm9sZClcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Muc3R5bGVzLnRleHRBbGlnbl0gVHlwZSBvZiB0ZXh0IGFsaWduIChsZWZ0IC8gY2VudGVyIC8gcmlnaHQpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnN0eWxlcy50ZXh0RGVjb3JhaXRvbl0gVHlwZSBvZiBsaW5lICh1bmRlcmxpbmUgLyBsaW5lLXRocm9naCAvIG92ZXJsaW5lKVxuICAgICAqICAgICBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IFtzZXR0aW5nLnBvc2l0aW9uXSAtIEluaXRpYWwgcG9zaXRpb25cbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgICAgICB2YXIgc3R5bGVzID0gdGhpcy5fZGVmYXVsdFN0eWxlcztcbiAgICAgICAgdmFyIG5ld1RleHQ7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLnN0eWxlcykge1xuICAgICAgICAgICAgc3R5bGVzID0gdHVpLnV0aWwuZXh0ZW5kKHNldHRpbmdzLnN0eWxlcywgc3R5bGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldEluaXRQb3Moc2V0dGluZ3MucG9zaXRpb24pO1xuXG4gICAgICAgIG5ld1RleHQgPSBuZXcgZmFicmljLlRleHQodGV4dCwgc3R5bGVzKTtcblxuICAgICAgICBuZXdUZXh0LnNldChjb25zdHMuZk9iamVjdE9wdGlvbnMuU0VMRUNUSU9OX1NUWUxFKTtcblxuICAgICAgICBjYW52YXMuYWRkKG5ld1RleHQpO1xuXG4gICAgICAgIGlmICghY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpKSB7XG4gICAgICAgICAgICBjYW52YXMuc2V0QWN0aXZlT2JqZWN0KG5ld1RleHQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0ZXh0IG9mIGFjdGl2YXRlIG9iamVjdCBvbiBjYW52YXMgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYWN0aXZlT2JqIC0gQ3VycmVudCBzZWxlY3RlZCB0ZXh0IG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gQ2hhZ2luZyB0ZXh0XG4gICAgICovXG4gICAgY2hhbmdlOiBmdW5jdGlvbihhY3RpdmVPYmosIHRleHQpIHtcbiAgICAgICAgYWN0aXZlT2JqLnNldCgndGV4dCcsIHRleHQpO1xuXG4gICAgICAgIHRoaXMuZ2V0Q2FudmFzKCkucmVuZGVyQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzdHlsZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhY3RpdmVPYmogLSBDdXJyZW50IHNlbGVjdGVkIHRleHQgb2JqZWN0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHN0eWxlT2JqIC0gSW5pdGlhbCBzdHlsZXNcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai5maWxsXSBDb2xvclxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLmZvbnRGYW1pbHldIEZvbnQgdHlwZSBmb3IgdGV4dFxuICAgICAqICAgICBAcGFyYW0ge251bWJlcn0gW3N0eWxlT2JqLmZvbnRTaXplXSBTaXplXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZm9udFN0eWxlXSBUeXBlIG9mIGluY2xpbmF0aW9uIChub3JtYWwgLyBpdGFsaWMpXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZm9udFdlaWdodF0gVHlwZSBvZiB0aGlja2VyIG9yIHRoaW5uZXIgbG9va2luZyAobm9ybWFsIC8gYm9sZClcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai50ZXh0QWxpZ25dIFR5cGUgb2YgdGV4dCBhbGlnbiAobGVmdCAvIGNlbnRlciAvIHJpZ2h0KVxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLnRleHREZWNvcmFpdG9uXSBUeXBlIG9mIGxpbmUgKHVuZGVybGluZSAvIGxpbmUtdGhyb2doIC8gb3ZlcmxpbmUpXG4gICAgICovXG4gICAgc2V0U3R5bGU6IGZ1bmN0aW9uKGFjdGl2ZU9iaiwgc3R5bGVPYmopIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzdHlsZU9iaiwgZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgICAgICAgICAgIGlmIChhY3RpdmVPYmpba2V5XSA9PT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVPYmpba2V5XSA9IHJlc2V0U3R5bGVzW2tleV0gfHwgJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGFjdGl2ZU9iai5zZXQoc3R5bGVPYmopO1xuXG4gICAgICAgIHRoaXMuZ2V0Q2FudmFzKCkucmVuZGVyQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbml0aWFsIHBvc2l0aW9uIG9uIGNhbnZhcyBpbWFnZVxuICAgICAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gW3Bvc2l0aW9uXSAtIFNlbGVjdGVkIHBvc2l0aW9uXG4gICAgICovXG4gICAgX3NldEluaXRQb3M6IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gfHwgdGhpcy5nZXRDYW52YXNJbWFnZSgpLmdldENlbnRlclBvaW50KCk7XG5cbiAgICAgICAgdGhpcy5fZGVmYXVsdFN0eWxlcy5sZWZ0ID0gcG9zaXRpb24ueDtcbiAgICAgICAgdGhpcy5fZGVmYXVsdFN0eWxlcy50b3AgPSBwb3NpdGlvbi55O1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHQ7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb25zdGFudHNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgbmFtZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgY29tcG9uZW50TmFtZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTUFJTicsXG4gICAgICAgICdJTUFHRV9MT0FERVInLFxuICAgICAgICAnQ1JPUFBFUicsXG4gICAgICAgICdGTElQJyxcbiAgICAgICAgJ1JPVEFUSU9OJyxcbiAgICAgICAgJ0ZSRUVfRFJBV0lORycsXG4gICAgICAgICdMSU5FJyxcbiAgICAgICAgJ1RFWFQnLFxuICAgICAgICAnSUNPTicsXG4gICAgICAgICdGSUxURVInXG4gICAgKSxcblxuICAgIC8qKlxuICAgICAqIENvbW1hbmQgbmFtZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgY29tbWFuZE5hbWVzOiB1dGlsLmtleU1pcnJvcihcbiAgICAgICAgJ0NMRUFSJyxcbiAgICAgICAgJ0xPQURfSU1BR0UnLFxuICAgICAgICAnRkxJUF9JTUFHRScsXG4gICAgICAgICdST1RBVEVfSU1BR0UnLFxuICAgICAgICAnQUREX09CSkVDVCcsXG4gICAgICAgICdSRU1PVkVfT0JKRUNUJyxcbiAgICAgICAgJ0FQUExZX0ZJTFRFUidcbiAgICApLFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgbmFtZXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59XG4gICAgICovXG4gICAgZXZlbnROYW1lczoge1xuICAgICAgICBMT0FEX0lNQUdFOiAnbG9hZEltYWdlJyxcbiAgICAgICAgQ0xFQVJfT0JKRUNUUzogJ2NsZWFyT2JqZWN0cycsXG4gICAgICAgIENMRUFSX0lNQUdFOiAnY2xlYXJJbWFnZScsXG4gICAgICAgIFNUQVJUX0NST1BQSU5HOiAnc3RhcnRDcm9wcGluZycsXG4gICAgICAgIEVORF9DUk9QUElORzogJ2VuZENyb3BwaW5nJyxcbiAgICAgICAgRkxJUF9JTUFHRTogJ2ZsaXBJbWFnZScsXG4gICAgICAgIFJPVEFURV9JTUFHRTogJ3JvdGF0ZUltYWdlJyxcbiAgICAgICAgQUREX09CSkVDVDogJ2FkZE9iamVjdCcsXG4gICAgICAgIFJFTU9WRV9PQkpFQ1Q6ICdyZW1vdmVPYmplY3QnLFxuICAgICAgICBBREpVU1RfT0JKRUNUOiAnYWRqdXN0T2JqZWN0JyxcbiAgICAgICAgU1RBUlRfRlJFRV9EUkFXSU5HOiAnc3RhcnRGcmVlRHJhd2luZycsXG4gICAgICAgIEVORF9GUkVFX0RSQVdJTkc6ICdlbmRGcmVlRHJhd2luZycsXG4gICAgICAgIFNUQVJUX0xJTkVfRFJBV0lORzogJ3N0YXJ0TGluZURyYXdpbmcnLFxuICAgICAgICBFTkRfTElORV9EUkFXSU5HOiAnZW5kTGluZURyYXdpbmcnLFxuICAgICAgICBFTVBUWV9SRURPX1NUQUNLOiAnZW1wdHlSZWRvU3RhY2snLFxuICAgICAgICBFTVBUWV9VTkRPX1NUQUNLOiAnZW1wdHlVbmRvU3RhY2snLFxuICAgICAgICBQVVNIX1VORE9fU1RBQ0s6ICdwdXNoVW5kb1N0YWNrJyxcbiAgICAgICAgUFVTSF9SRURPX1NUQUNLOiAncHVzaFJlZG9TdGFjaycsXG4gICAgICAgIEFDVElWQVRFX1RFWFQ6ICdhY3RpdmF0ZVRleHQnLFxuICAgICAgICBBUFBMWV9GSUxURVI6ICdhcHBseUZpbHRlcidcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRWRpdG9yIHN0YXRlc1xuICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn1cbiAgICAgKi9cbiAgICBzdGF0ZXM6IHV0aWwua2V5TWlycm9yKFxuICAgICAgICAnTk9STUFMJyxcbiAgICAgICAgJ0NST1AnLFxuICAgICAgICAnRlJFRV9EUkFXSU5HJyxcbiAgICAgICAgJ0xJTkUnLFxuICAgICAgICAnVEVYVCdcbiAgICApLFxuXG4gICAgLyoqXG4gICAgICogU2hvcnRjdXQga2V5IHZhbHVlc1xuICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgbnVtYmVyPn1cbiAgICAgKi9cbiAgICBrZXlDb2Rlczoge1xuICAgICAgICBaOiA5MCxcbiAgICAgICAgWTogODksXG4gICAgICAgIFNISUZUOiAxNlxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGYWJyaWMgb2JqZWN0IG9wdGlvbnNcbiAgICAgKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIE9iamVjdD59XG4gICAgICovXG4gICAgZk9iamVjdE9wdGlvbnM6IHtcbiAgICAgICAgU0VMRUNUSU9OX1NUWUxFOiB7XG4gICAgICAgICAgICBib3JkZXJDb2xvcjogJ3JlZCcsXG4gICAgICAgICAgICBjb3JuZXJDb2xvcjogJ2dyZWVuJyxcbiAgICAgICAgICAgIGNvcm5lclNpemU6IDEwLFxuICAgICAgICAgICAgb3JpZ2luWDogJ2NlbnRlcicsXG4gICAgICAgICAgICBvcmlnaW5ZOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50Q29ybmVyczogZmFsc2UsXG4gICAgICAgICAgICByb3RhdGluZ1BvaW50T2Zmc2V0OiAzMFxuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IENyb3B6b25lIGV4dGVuZGluZyBmYWJyaWMuUmVjdFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcbnZhciBjbGFtcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS5jbGFtcDtcblxudmFyIENPUk5FUl9UWVBFX1RPUF9MRUZUID0gJ3RsJztcbnZhciBDT1JORVJfVFlQRV9UT1BfUklHSFQgPSAndHInO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9UT1AgPSAnbXQnO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9MRUZUID0gJ21sJztcbnZhciBDT1JORVJfVFlQRV9NSURETEVfUklHSFQgPSAnbXInO1xudmFyIENPUk5FUl9UWVBFX01JRERMRV9CT1RUT00gPSAnbWInO1xudmFyIENPUk5FUl9UWVBFX0JPVFRPTV9MRUZUID0gJ2JsJztcbnZhciBDT1JORVJfVFlQRV9CT1RUT01fUklHSFQgPSAnYnInO1xuXG4vKipcbiAqIENyb3B6b25lIG9iamVjdFxuICogSXNzdWU6IElFNywgOCh3aXRoIGV4Y2FudmFzKVxuICogIC0gQ3JvcHpvbmUgaXMgYSBibGFjayB6b25lIHdpdGhvdXQgdHJhbnNwYXJlbmN5LlxuICogQGNsYXNzIENyb3B6b25lXG4gKiBAZXh0ZW5kcyB7ZmFicmljLlJlY3R9XG4gKi9cbnZhciBDcm9wem9uZSA9IGZhYnJpYy51dGlsLmNyZWF0ZUNsYXNzKGZhYnJpYy5SZWN0LCAvKiogQGxlbmRzIENyb3B6b25lLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0XG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBvcHRpb25zLnR5cGUgPSAnY3JvcHpvbmUnO1xuICAgICAgICB0aGlzLmNhbGxTdXBlcignaW5pdGlhbGl6ZScsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9uKHtcbiAgICAgICAgICAgICdtb3ZpbmcnOiB0aGlzLl9vbk1vdmluZyxcbiAgICAgICAgICAgICdzY2FsaW5nJzogdGhpcy5fb25TY2FsaW5nXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgQ3JvcC16b25lXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIF9yZW5kZXI6IGZ1bmN0aW9uKGN0eCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxGbGlwWCwgb3JpZ2luYWxGbGlwWSxcbiAgICAgICAgICAgIG9yaWdpbmFsU2NhbGVYLCBvcmlnaW5hbFNjYWxlWSxcbiAgICAgICAgICAgIGNyb3B6b25lRGFzaExpbmVXaWR0aCA9IDcsXG4gICAgICAgICAgICBjcm9wem9uZURhc2hMaW5lT2Zmc2V0ID0gNztcbiAgICAgICAgdGhpcy5jYWxsU3VwZXIoJ19yZW5kZXInLCBjdHgpO1xuXG4gICAgICAgIC8vIENhbGMgb3JpZ2luYWwgc2NhbGVcbiAgICAgICAgb3JpZ2luYWxGbGlwWCA9IHRoaXMuZmxpcFggPyAtMSA6IDE7XG4gICAgICAgIG9yaWdpbmFsRmxpcFkgPSB0aGlzLmZsaXBZID8gLTEgOiAxO1xuICAgICAgICBvcmlnaW5hbFNjYWxlWCA9IG9yaWdpbmFsRmxpcFggLyB0aGlzLnNjYWxlWDtcbiAgICAgICAgb3JpZ2luYWxTY2FsZVkgPSBvcmlnaW5hbEZsaXBZIC8gdGhpcy5zY2FsZVk7XG5cbiAgICAgICAgLy8gU2V0IG9yaWdpbmFsIHNjYWxlXG4gICAgICAgIGN0eC5zY2FsZShvcmlnaW5hbFNjYWxlWCwgb3JpZ2luYWxTY2FsZVkpO1xuXG4gICAgICAgIC8vIFJlbmRlciBvdXRlciByZWN0XG4gICAgICAgIHRoaXMuX2ZpbGxPdXRlclJlY3QoY3R4LCAncmdiYSgwLCAwLCAwLCAwLjU1KScpO1xuXG4gICAgICAgIC8vIEJsYWNrIGRhc2ggbGluZVxuICAgICAgICB0aGlzLl9zdHJva2VCb3JkZXIoY3R4LCAncmdiKDAsIDAsIDApJywgY3JvcHpvbmVEYXNoTGluZVdpZHRoKTtcblxuICAgICAgICAvLyBXaGl0ZSBkYXNoIGxpbmVcbiAgICAgICAgdGhpcy5fc3Ryb2tlQm9yZGVyKGN0eCwgJ3JnYigyNTUsIDI1NSwgMjU1KScsIGNyb3B6b25lRGFzaExpbmVXaWR0aCwgY3JvcHpvbmVEYXNoTGluZU9mZnNldCk7XG5cbiAgICAgICAgLy8gUmVzZXQgc2NhbGVcbiAgICAgICAgY3R4LnNjYWxlKDEgLyBvcmlnaW5hbFNjYWxlWCwgMSAvIG9yaWdpbmFsU2NhbGVZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JvcHpvbmUtY29vcmRpbmF0ZXMgd2l0aCBvdXRlciByZWN0YW5nbGVcbiAgICAgKlxuICAgICAqICAgICB4MCAgICAgeDEgICAgICAgICB4MiAgICAgIHgzXG4gICAgICogIHkwICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfCAgICAvLyA8LS0tIFwiT3V0ZXItcmVjdGFuZ2xlXCJcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICB5MSArLS0tLS0tLSstLS0tLS0tLS0tKy0tLS0tLS0rXG4gICAgICogICAgIHwvLy8vLy8vfCBDcm9wem9uZSB8Ly8vLy8vL3wgICAgQ3JvcHpvbmUgaXMgdGhlIFwiSW5uZXItcmVjdGFuZ2xlXCJcbiAgICAgKiAgICAgfC8vLy8vLy98ICAoMCwgMCkgIHwvLy8vLy8vfCAgICBDZW50ZXIgcG9pbnQgKDAsIDApXG4gICAgICogIHkyICstLS0tLS0tKy0tLS0tLS0tLS0rLS0tLS0tLStcbiAgICAgKiAgICAgfC8vLy8vLy98Ly8vLy8vLy8vL3wvLy8vLy8vfFxuICAgICAqICAgICB8Ly8vLy8vL3wvLy8vLy8vLy8vfC8vLy8vLy98XG4gICAgICogIHkzICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiAgICAgKlxuICAgICAqIEB0eXBlZGVmIHt7eDogQXJyYXk8bnVtYmVyPiwgeTogQXJyYXk8bnVtYmVyPn19IGNyb3B6b25lQ29vcmRpbmF0ZXNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEZpbGwgb3V0ZXIgcmVjdGFuZ2xlXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xDYW52YXNHcmFkaWVudHxDYW52YXNQYXR0ZXJufSBmaWxsU3R5bGUgLSBGaWxsLXN0eWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsbE91dGVyUmVjdDogZnVuY3Rpb24oY3R4LCBmaWxsU3R5bGUpIHtcbiAgICAgICAgdmFyIGNvb3JkaW5hdGVzID0gdGhpcy5fZ2V0Q29vcmRpbmF0ZXMoY3R4KSxcbiAgICAgICAgICAgIHggPSBjb29yZGluYXRlcy54LFxuICAgICAgICAgICAgeSA9IGNvb3JkaW5hdGVzLnk7XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZTtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIC8vIE91dGVyIHJlY3RhbmdsZVxuICAgICAgICAvLyBOdW1iZXJzIGFyZSArLy0xIHNvIHRoYXQgb3ZlcmxheSBlZGdlcyBkb24ndCBnZXQgYmx1cnJ5LlxuICAgICAgICBjdHgubW92ZVRvKHhbMF0gLSAxLCB5WzBdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFszXSArIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyh4WzNdICsgMSwgeVszXSArIDEpO1xuICAgICAgICBjdHgubGluZVRvKHhbMF0gLSAxLCB5WzNdIC0gMSk7XG4gICAgICAgIGN0eC5saW5lVG8oeFswXSAtIDEsIHlbMF0gLSAxKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIC8vIElubmVyIHJlY3RhbmdsZVxuICAgICAgICBjdHgubW92ZVRvKHhbMV0sIHlbMV0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMV0sIHlbMl0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMl0sIHlbMl0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMl0sIHlbMV0pO1xuICAgICAgICBjdHgubGluZVRvKHhbMV0sIHlbMV0pO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvb3JkaW5hdGVzXG4gICAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIENvbnRleHRcbiAgICAgKiBAcmV0dXJucyB7Y3JvcHpvbmVDb29yZGluYXRlc30gLSB7QGxpbmsgY3JvcHpvbmVDb29yZGluYXRlc31cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb29yZGluYXRlczogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgIHZhciBjZWlsID0gTWF0aC5jZWlsLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpLFxuICAgICAgICAgICAgaGFsZldpZHRoID0gd2lkdGggLyAyLFxuICAgICAgICAgICAgaGFsZkhlaWdodCA9IGhlaWdodCAvIDIsXG4gICAgICAgICAgICBsZWZ0ID0gdGhpcy5nZXRMZWZ0KCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLmdldFRvcCgpLFxuICAgICAgICAgICAgY2FudmFzRWwgPSBjdHguY2FudmFzOyAvLyBjYW52YXMgZWxlbWVudCwgbm90IGZhYnJpYyBvYmplY3RcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogdHVpLnV0aWwubWFwKFtcbiAgICAgICAgICAgICAgICAtKGhhbGZXaWR0aCArIGxlZnQpLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIHgwXG4gICAgICAgICAgICAgICAgLShoYWxmV2lkdGgpLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB4MVxuICAgICAgICAgICAgICAgIGhhbGZXaWR0aCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geDJcbiAgICAgICAgICAgICAgICBoYWxmV2lkdGggKyAoY2FudmFzRWwud2lkdGggLSBsZWZ0IC0gd2lkdGgpIC8vIHgzXG4gICAgICAgICAgICBdLCBjZWlsKSxcbiAgICAgICAgICAgIHk6IHR1aS51dGlsLm1hcChbXG4gICAgICAgICAgICAgICAgLShoYWxmSGVpZ2h0ICsgdG9wKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8geTBcbiAgICAgICAgICAgICAgICAtKGhhbGZIZWlnaHQpLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB5MVxuICAgICAgICAgICAgICAgIGhhbGZIZWlnaHQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHkyXG4gICAgICAgICAgICAgICAgaGFsZkhlaWdodCArIChjYW52YXNFbC5oZWlnaHQgLSB0b3AgLSBoZWlnaHQpICAgLy8geTNcbiAgICAgICAgICAgIF0sIGNlaWwpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0cm9rZSBib3JkZXJcbiAgICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY3R4IC0gQ29udGV4dFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59IHN0cm9rZVN0eWxlIC0gU3Ryb2tlLXN0eWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVEYXNoV2lkdGggLSBEYXNoIHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtsaW5lRGFzaE9mZnNldF0gLSBEYXNoIG9mZnNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3N0cm9rZUJvcmRlcjogZnVuY3Rpb24oY3R4LCBzdHJva2VTdHlsZSwgbGluZURhc2hXaWR0aCwgbGluZURhc2hPZmZzZXQpIHtcbiAgICAgICAgdmFyIGhhbGZXaWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSAvIDIsXG4gICAgICAgICAgICBoYWxmSGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKSAvIDI7XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGU7XG4gICAgICAgIGlmIChjdHguc2V0TGluZURhc2gpIHtcbiAgICAgICAgICAgIGN0eC5zZXRMaW5lRGFzaChbbGluZURhc2hXaWR0aCwgbGluZURhc2hXaWR0aF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lRGFzaE9mZnNldCkge1xuICAgICAgICAgICAgY3R4LmxpbmVEYXNoT2Zmc2V0ID0gbGluZURhc2hPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHgubGluZVRvKGhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oLWhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG4gICAgICAgIGN0eC5saW5lVG8oLWhhbGZXaWR0aCwgLWhhbGZIZWlnaHQpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25Nb3ZpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbk1vdmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIGxlZnQgPSB0aGlzLmdldExlZnQoKSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMuZ2V0VG9wKCksXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCksXG4gICAgICAgICAgICBtYXhMZWZ0ID0gY2FudmFzLmdldFdpZHRoKCkgLSB3aWR0aCxcbiAgICAgICAgICAgIG1heFRvcCA9IGNhbnZhcy5nZXRIZWlnaHQoKSAtIGhlaWdodDtcblxuICAgICAgICB0aGlzLnNldExlZnQoY2xhbXAobGVmdCwgMCwgbWF4TGVmdCkpO1xuICAgICAgICB0aGlzLnNldFRvcChjbGFtcCh0b3AsIDAsIG1heFRvcCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvblNjYWxpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge3tlOiBNb3VzZUV2ZW50fX0gZkV2ZW50IC0gRmFicmljIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25TY2FsaW5nOiBmdW5jdGlvbihmRXZlbnQpIHtcbiAgICAgICAgdmFyIHBvaW50ZXIgPSB0aGlzLmNhbnZhcy5nZXRQb2ludGVyKGZFdmVudC5lKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdGhpcy5fY2FsY1NjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlcik7XG5cbiAgICAgICAgLy8gT24gc2NhbGluZyBjcm9wem9uZSxcbiAgICAgICAgLy8gY2hhbmdlIHJlYWwgd2lkdGggYW5kIGhlaWdodCBhbmQgZml4IHNjYWxlRmFjdG9yIHRvIDFcbiAgICAgICAgdGhpcy5zY2FsZSgxKS5zZXQoc2V0dGluZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjIHNjYWxlZCBzaXplIGZyb20gbW91c2UgcG9pbnRlciB3aXRoIHNlbGVjdGVkIGNvcm5lclxuICAgICAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gcG9pbnRlciAtIE1vdXNlIHBvc2l0aW9uXG4gICAgICogQHJldHVybnMge29iamVjdH0gSGF2aW5nIGxlZnQgb3IoYW5kKSB0b3Agb3IoYW5kKSB3aWR0aCBvcihhbmQpIGhlaWdodC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxjU2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24ocG9pbnRlcikge1xuICAgICAgICB2YXIgcG9pbnRlclggPSBwb2ludGVyLngsXG4gICAgICAgICAgICBwb2ludGVyWSA9IHBvaW50ZXIueSxcbiAgICAgICAgICAgIHRsU2NhbGluZ1NpemUgPSB0aGlzLl9jYWxjVG9wTGVmdFNjYWxpbmdTaXplRnJvbVBvaW50ZXIocG9pbnRlclgsIHBvaW50ZXJZKSxcbiAgICAgICAgICAgIGJyU2NhbGluZ1NpemUgPSB0aGlzLl9jYWxjQm90dG9tUmlnaHRTY2FsaW5nU2l6ZUZyb21Qb2ludGVyKHBvaW50ZXJYLCBwb2ludGVyWSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogQHRvZG86IOydvOuwmCDqsJ3ssrTsl5DshJwgc2hpZnQg7KGw7ZWp7YKk66W8IOuIhOultOuptCBmcmVlIHNpemUgc2NhbGluZ+ydtCDrkKggLS0+IO2ZleyduO2VtOuzvOqyg1xuICAgICAgICAgKiAgICAgIGNhbnZhcy5jbGFzcy5qcyAvLyBfc2NhbGVPYmplY3Q6IGZ1bmN0aW9uKC4uLil7Li4ufVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VTY2FsaW5nU2V0dGluZ3ModGxTY2FsaW5nU2l6ZSwgYnJTY2FsaW5nU2l6ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGluZyBzaXplKHBvc2l0aW9uICsgZGltZW5zaW9uKSBmcm9tIGxlZnQtdG9wIGNvcm5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gTW91c2UgcG9zaXRpb24gWFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gTW91c2UgcG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNUb3BMZWZ0U2NhbGluZ1NpemVGcm9tUG9pbnRlcjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgYm90dG9tID0gdGhpcy5nZXRIZWlnaHQoKSArIHRoaXMudG9wLFxuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLmdldFdpZHRoKCkgKyB0aGlzLmxlZnQsXG4gICAgICAgICAgICB0b3AgPSBjbGFtcCh5LCAwLCBib3R0b20gLSAxKSwgIC8vIDAgPD0gdG9wIDw9IChib3R0b20gLSAxKVxuICAgICAgICAgICAgbGVmdCA9IGNsYW1wKHgsIDAsIHJpZ2h0IC0gMSk7ICAvLyAwIDw9IGxlZnQgPD0gKHJpZ2h0IC0gMSlcblxuICAgICAgICAvLyBXaGVuIHNjYWxpbmcgXCJUb3AtTGVmdCBjb3JuZXJcIjogSXQgZml4ZXMgcmlnaHQgYW5kIGJvdHRvbSBjb29yZGluYXRlc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgd2lkdGg6IHJpZ2h0IC0gbGVmdCxcbiAgICAgICAgICAgIGhlaWdodDogYm90dG9tIC0gdG9wXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGMgc2NhbGluZyBzaXplIGZyb20gcmlnaHQtYm90dG9tIGNvcm5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gTW91c2UgcG9zaXRpb24gWFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gTW91c2UgcG9zaXRpb24gWVxuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGNCb3R0b21SaWdodFNjYWxpbmdTaXplRnJvbVBvaW50ZXI6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgbWF4WCA9IGNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIG1heFkgPSBjYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgbGVmdCA9IHRoaXMubGVmdCxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMudG9wO1xuXG4gICAgICAgIC8vIFdoZW4gc2NhbGluZyBcIkJvdHRvbS1SaWdodCBjb3JuZXJcIjogSXQgZml4ZXMgbGVmdCBhbmQgdG9wIGNvb3JkaW5hdGVzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogY2xhbXAoeCwgKGxlZnQgKyAxKSwgbWF4WCkgLSBsZWZ0LCAgICAvLyAod2lkdGggPSB4IC0gbGVmdCksIChsZWZ0ICsgMSA8PSB4IDw9IG1heFgpXG4gICAgICAgICAgICBoZWlnaHQ6IGNsYW1wKHksICh0b3AgKyAxKSwgbWF4WSkgLSB0b3AgICAgICAvLyAoaGVpZ2h0ID0geSAtIHRvcCksICh0b3AgKyAxIDw9IHkgPD0gbWF4WSlcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyplc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5Ki9cbiAgICAvKipcbiAgICAgKiBNYWtlIHNjYWxpbmcgc2V0dGluZ3NcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn19IHRsIC0gVG9wLUxlZnQgc2V0dGluZ1xuICAgICAqIEBwYXJhbSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX0gYnIgLSBCb3R0b20tUmlnaHQgc2V0dGluZ1xuICAgICAqIEByZXR1cm5zIHt7d2lkdGg6ID9udW1iZXIsIGhlaWdodDogP251bWJlciwgbGVmdDogP251bWJlciwgdG9wOiA/bnVtYmVyfX0gUG9zaXRpb24gc2V0dGluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTY2FsaW5nU2V0dGluZ3M6IGZ1bmN0aW9uKHRsLCBicikge1xuICAgICAgICB2YXIgdGxXaWR0aCA9IHRsLndpZHRoLFxuICAgICAgICAgICAgdGxIZWlnaHQgPSB0bC5oZWlnaHQsXG4gICAgICAgICAgICBickhlaWdodCA9IGJyLmhlaWdodCxcbiAgICAgICAgICAgIGJyV2lkdGggPSBici53aWR0aCxcbiAgICAgICAgICAgIHRsTGVmdCA9IHRsLmxlZnQsXG4gICAgICAgICAgICB0bFRvcCA9IHRsLnRvcCxcbiAgICAgICAgICAgIHNldHRpbmdzO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5fX2Nvcm5lcikge1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9UT1BfTEVGVDpcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9UT1BfUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBicldpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRsVG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfQk9UVE9NX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0bFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGJySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0bExlZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9CT1RUT01fUklHSFQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSBicjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX0xFRlQ6XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0bFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0bExlZnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDT1JORVJfVFlQRV9NSURETEVfVE9QOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRsSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IHRsVG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ09STkVSX1RZUEVfTUlERExFX1JJR0hUOlxuICAgICAgICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogYnJXaWR0aFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENPUk5FUl9UWVBFX01JRERMRV9CT1RUT006XG4gICAgICAgICAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogYnJIZWlnaHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9LCAvKmVzbGludC1lbmFibGUgY29tcGxleGl0eSovXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHdoZXRoZXIgdGhpcyBjcm9wem9uZSBpcyB2YWxpZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzVmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy5sZWZ0ID49IDAgJiZcbiAgICAgICAgICAgIHRoaXMudG9wID49IDAgJiZcbiAgICAgICAgICAgIHRoaXMud2lkdGggPiAwICYmXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA+IDBcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wem9uZTtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IE1hc2sgZXh0ZW5kaW5nIGZhYnJpYy5JbWFnZS5maWx0ZXJzLk1hc2tcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1hc2sgb2JqZWN0XG4gKiBAY2xhc3MgTWFza1xuICogQGV4dGVuZHMge2ZhYnJpYy5JbWFnZS5maWx0ZXJzLk1hc2t9XG4gKi9cbnZhciBNYXNrID0gZmFicmljLnV0aWwuY3JlYXRlQ2xhc3MoZmFicmljLkltYWdlLmZpbHRlcnMuTWFzaywgLyoqIEBsZW5kcyBNYXNrLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBBcHBseSBmaWx0ZXIgdG8gY2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY2FudmFzRWwgLSBDYW52YXMgZWxlbWVudCB0byBhcHBseSBmaWx0ZXJcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBhcHBseVRvOiBmdW5jdGlvbihjYW52YXNFbCkge1xuICAgICAgICB2YXIgbWFza0NhbnZhc0VsLCBjdHgsIG1hc2tDdHgsIGltYWdlRGF0YTtcbiAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQ7XG5cbiAgICAgICAgaWYgKCF0aGlzLm1hc2spIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpZHRoID0gY2FudmFzRWwud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGNhbnZhc0VsLmhlaWdodDtcblxuICAgICAgICBtYXNrQ2FudmFzRWwgPSB0aGlzLl9jcmVhdGVDYW52YXNPZk1hc2sod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgY3R4ID0gY2FudmFzRWwuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgbWFza0N0eCA9IG1hc2tDYW52YXNFbC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5fZHJhd01hc2sobWFza0N0eCk7XG4gICAgICAgIHRoaXMuX21hcERhdGEobWFza0N0eCwgaW1hZ2VEYXRhLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjYW52YXMgb2YgbWFzayBpbWFnZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCAtIFdpZHRoIG9mIG1haW4gY2FudmFzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIEhlaWdodCBvZiBtYWluIGNhbnZhc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gQ2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVDYW52YXNPZk1hc2s6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIG1hc2tDYW52YXNFbCA9IGZhYnJpYy51dGlsLmNyZWF0ZUNhbnZhc0VsZW1lbnQoKTtcblxuICAgICAgICBtYXNrQ2FudmFzRWwud2lkdGggPSB3aWR0aDtcbiAgICAgICAgbWFza0NhbnZhc0VsLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICByZXR1cm4gbWFza0NhbnZhc0VsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEcmF3IG1hc2sgaW1hZ2Ugb24gY2FudmFzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWFza0N0eCAtIENvbnRleHQgb2YgbWFzayBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kcmF3TWFzazogZnVuY3Rpb24obWFza0N0eCkge1xuICAgICAgICB2YXIgd2lkdGgsIGhlaWdodCwgbGVmdCwgdG9wO1xuICAgICAgICB2YXIgbWFzayA9IHRoaXMubWFzaztcblxuICAgICAgICB3aWR0aCA9IG1hc2suZ2V0V2lkdGgoKTtcbiAgICAgICAgaGVpZ2h0ID0gbWFzay5nZXRIZWlnaHQoKTtcbiAgICAgICAgbGVmdCA9IG1hc2suZ2V0TGVmdCgpIC0gKHdpZHRoIC8gMik7XG4gICAgICAgIHRvcCA9IG1hc2suZ2V0VG9wKCkgLSAoaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgbWFza0N0eC5kcmF3SW1hZ2UobWFzay5nZXRFbGVtZW50KCksIGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1hcCBtYXNrIGltYWdlIGRhdGEgdG8gc291cmNlIGltYWdlIGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWFza0N0eCAtIENvbnRleHQgb2YgbWFzayBjYW52YXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW1hZ2VEYXRhIC0gRGF0YSBvZiBzb3VyY2UgaW1hZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBXaWR0aCBvZiBtYWluIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBIZWlnaHQgb2YgbWFpbiBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYXBEYXRhOiBmdW5jdGlvbihtYXNrQ3R4LCBpbWFnZURhdGEsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIHNvdXJjZURhdGEgPSBpbWFnZURhdGEuZGF0YTtcbiAgICAgICAgdmFyIG1hc2tEYXRhID0gbWFza0N0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSB0aGlzLmNoYW5uZWw7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGxlbiA9IGltYWdlRGF0YS53aWR0aCAqIGltYWdlRGF0YS5oZWlnaHQgKiA0O1xuXG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICAgICAgICAgIHNvdXJjZURhdGFbaSArIDNdID0gbWFza0RhdGFbaSArIGNoYW5uZWxdOyAvLyBhZGp1c3QgdmFsdWUgb2YgYWxwaGEgZGF0YVxuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzaztcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IENvbW1hbmQgZmFjdG9yeVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDb21tYW5kID0gcmVxdWlyZSgnLi4vaW50ZXJmYWNlL2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIGNvbXBvbmVudE5hbWVzID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xudmFyIGNvbW1hbmROYW1lcyA9IGNvbnN0cy5jb21tYW5kTmFtZXM7XG52YXIgY3JlYXRvcnMgPSB7fTtcblxudmFyIE1BSU4gPSBjb21wb25lbnROYW1lcy5NQUlOO1xudmFyIElNQUdFX0xPQURFUiA9IGNvbXBvbmVudE5hbWVzLklNQUdFX0xPQURFUjtcbnZhciBGTElQID0gY29tcG9uZW50TmFtZXMuRkxJUDtcbnZhciBST1RBVElPTiA9IGNvbXBvbmVudE5hbWVzLlJPVEFUSU9OO1xudmFyIEZJTFRFUiA9IGNvbXBvbmVudE5hbWVzLkZJTFRFUjtcblxuLyoqXG4gKiBTZXQgbWFwcGluZyBjcmVhdG9yc1xuICovXG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuTE9BRF9JTUFHRV0gPSBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLkZMSVBfSU1BR0VdID0gY3JlYXRlRmxpcEltYWdlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5ST1RBVEVfSU1BR0VdID0gY3JlYXRlUm90YXRpb25JbWFnZUNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQ0xFQVJfT0JKRUNUU10gPSBjcmVhdGVDbGVhckNvbW1hbmQ7XG5jcmVhdG9yc1tjb21tYW5kTmFtZXMuQUREX09CSkVDVF0gPSBjcmVhdGVBZGRPYmplY3RDb21tYW5kO1xuY3JlYXRvcnNbY29tbWFuZE5hbWVzLlJFTU9WRV9PQkpFQ1RdID0gY3JlYXRlUmVtb3ZlQ29tbWFuZDtcbmNyZWF0b3JzW2NvbW1hbmROYW1lcy5BUFBMWV9GSUxURVJdID0gY3JlYXRlRmlsdGVyQ29tbWFuZDtcblxuLyoqXG4gKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iamVjdCAtIEZhYnJpYyBvYmplY3RcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVBZGRPYmplY3RDb21tYW5kKG9iamVjdCkge1xuICAgIHR1aS51dGlsLnN0YW1wKG9iamVjdCk7XG5cbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAoIWNhbnZhcy5jb250YWlucyhvYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmFkZChvYmplY3QpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvYmplY3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG4gICAgICAgICAgICB2YXIganFEZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKGNhbnZhcy5jb250YWlucyhvYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLnJlbW92ZShvYmplY3QpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZShvYmplY3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBJbWFnZSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWJyaWMuSW1hZ2V9IGltZyAtIEltYWdlKG9yIHVybClcbiAqIEByZXR1cm5zIHtDb21tYW5kfVxuICovXG5mdW5jdGlvbiBjcmVhdGVMb2FkSW1hZ2VDb21tYW5kKGltYWdlTmFtZSwgaW1nKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGNvbXBNYXBbSU1BR0VfTE9BREVSXTtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBsb2FkZXIuZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSB7XG4gICAgICAgICAgICAgICAgcHJldk5hbWU6IGxvYWRlci5nZXRJbWFnZU5hbWUoKSxcbiAgICAgICAgICAgICAgICBwcmV2SW1hZ2U6IGxvYWRlci5nZXRDYW52YXNJbWFnZSgpLFxuICAgICAgICAgICAgICAgIC8vIFNsaWNlOiBcImNhbnZhcy5jbGVhcigpXCIgY2xlYXJzIHRoZSBvYmplY3RzIGFycmF5LCBTbyBzaGFsbG93IGNvcHkgdGhlIGFycmF5XG4gICAgICAgICAgICAgICAgb2JqZWN0czogY2FudmFzLmdldE9iamVjdHMoKS5zbGljZSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChpbWFnZU5hbWUsIGltZyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBjb21wTWFwW0lNQUdFX0xPQURFUl07XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gbG9hZGVyLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcblxuICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG4gICAgICAgICAgICBjYW52YXMuYWRkLmFwcGx5KGNhbnZhcywgc3RvcmUub2JqZWN0cyk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZXIubG9hZChzdG9yZS5wcmV2TmFtZSwgc3RvcmUucHJldkltYWdlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gJ2ZsaXBYJyBvciAnZmxpcFknIG9yICdyZXNldCdcbiAqIEByZXR1cm5zIHskLkRlZmVycmVkfVxuICovXG5mdW5jdGlvbiBjcmVhdGVGbGlwSW1hZ2VDb21tYW5kKHR5cGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmxpcENvbXAgPSBjb21wTWFwW0ZMSVBdO1xuXG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gZmxpcENvbXAuZ2V0Q3VycmVudFNldHRpbmcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZsaXBDb21wW3R5cGVdKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmbGlwQ29tcCA9IGNvbXBNYXBbRkxJUF07XG5cbiAgICAgICAgICAgIHJldHVybiBmbGlwQ29tcC5zZXQodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdyb3RhdGUnIG9yICdzZXRBbmdsZSdcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGFuZ2xlIHZhbHVlIChkZWdyZWUpXG4gKiBAcmV0dXJucyB7JC5EZWZlcnJlZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUm90YXRpb25JbWFnZUNvbW1hbmQodHlwZSwgYW5nbGUpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHRoaXMuc3RvcmUgPSByb3RhdGlvbkNvbXAuZ2V0Q3VycmVudEFuZ2xlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXBbdHlwZV0oYW5nbGUpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRpb25Db21wID0gY29tcE1hcFtST1RBVElPTl07XG5cbiAgICAgICAgICAgIHJldHVybiByb3RhdGlvbkNvbXAuc2V0QW5nbGUodGhpcy5zdG9yZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDbGVhciBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2xlYXJDb21tYW5kKCkge1xuICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBjb21wTWFwW01BSU5dLmdldENhbnZhcygpO1xuICAgICAgICAgICAgdmFyIGpxRGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIC8vIFNsaWNlOiBcImNhbnZhcy5jbGVhcigpXCIgY2xlYXJzIHRoZSBvYmplY3RzIGFycmF5LCBTbyBzaGFsbG93IGNvcHkgdGhlIGFycmF5XG4gICAgICAgICAgICB0aGlzLnN0b3JlID0gY2FudmFzLmdldE9iamVjdHMoKS5zbGljZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAganFEZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBqcURlZmVyO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICB1bmRvOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcblxuICAgICAgICAgICAgY2FudmFzLmFkZC5hcHBseShjYW52YXMsIHRoaXMuc3RvcmUpO1xuXG4gICAgICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIFJlbW92ZSBjb21tYW5kXG4gKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R8ZmFicmljLkdyb3VwfSB0YXJnZXQgLSBPYmplY3QocykgdG8gcmVtb3ZlXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmVtb3ZlQ29tbWFuZCh0YXJnZXQpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gY29tcE1hcFtNQUlOXS5nZXRDYW52YXMoKTtcbiAgICAgICAgICAgIHZhciBqcURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIGlzVmFsaWRHcm91cCA9IHRhcmdldCAmJiB0YXJnZXQuaXNUeXBlKCdncm91cCcpICYmICF0YXJnZXQuaXNFbXB0eSgpO1xuXG4gICAgICAgICAgICBpZiAoaXNWYWxpZEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmRpc2NhcmRBY3RpdmVHcm91cCgpOyAvLyByZXN0b3JlIHN0YXRlcyBmb3IgZWFjaCBvYmplY3RzXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yZSA9IHRhcmdldC5nZXRPYmplY3RzKCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZvckVhY2hPYmplY3QoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FudmFzLmNvbnRhaW5zKHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JlID0gW3RhcmdldF07XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGpxRGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqcURlZmVyLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ganFEZWZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oY29tcE1hcCkge1xuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGNvbXBNYXBbTUFJTl0uZ2V0Q2FudmFzKCk7XG5cbiAgICAgICAgICAgIGNhbnZhcy5hZGQuYXBwbHkoY2FudmFzLCB0aGlzLnN0b3JlKTtcblxuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQoKS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJDb21tYW5kKHR5cGUsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICAgICAqL1xuICAgICAgICBleGVjdXRlOiBmdW5jdGlvbihjb21wTWFwKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyQ29tcCA9IGNvbXBNYXBbRklMVEVSXTtcblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdtYXNrJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSBvcHRpb25zLm1hc2s7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5tYXNrLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQ29tcC5hZGQodHlwZSwgb3B0aW9ucyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC48c3RyaW5nLCBDb21wb25lbnQ+fSBjb21wTWFwIC0gQ29tcG9uZW50cyBpbmplY3Rpb25cbiAgICAgICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgICAgICovXG4gICAgICAgIHVuZG86IGZ1bmN0aW9uKGNvbXBNYXApIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXJDb21wID0gY29tcE1hcFtGSUxURVJdO1xuXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ21hc2snKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyQ29tcC5nZXRDYW52YXMoKS5hZGQodGhpcy5zdG9yZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJDb21wLnJlbW92ZSh0eXBlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBjb21tYW5kXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIENvbW1hbmQgbmFtZVxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gQXJndW1lbnRzIGZvciBjcmVhdGluZyBjb21tYW5kXG4gKiBAcmV0dXJucyB7Q29tbWFuZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIGFyZ3MpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gY3JlYXRvcnNbbmFtZV0uYXBwbHkobnVsbCwgYXJncyk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3JlYXRlOiBjcmVhdGVcbn07XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBFcnJvci1tZXNzYWdlIGZhY3RvcnlcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5TWlycm9yID0gcmVxdWlyZSgnLi4vdXRpbCcpLmtleU1pcnJvcjtcblxudmFyIHR5cGVzID0ga2V5TWlycm9yKFxuICAgICdVTl9JTVBMRU1FTlRBVElPTicsXG4gICAgJ05PX0NPTVBPTkVOVF9OQU1FJ1xuKTtcblxudmFyIG1lc3NhZ2VzID0ge1xuICAgIFVOX0lNUExFTUVOVEFUSU9OOiAnU2hvdWxkIGltcGxlbWVudCBhIG1ldGhvZDogJyxcbiAgICBOT19DT01QT05FTlRfTkFNRTogJ1Nob3VsZCBzZXQgYSBjb21wb25lbnQgbmFtZSdcbn07XG5cbnZhciBtYXAgPSB7XG4gICAgVU5fSU1QTEVNRU5UQVRJT046IGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLlVOX0lNUExFTUVOVEFUSU9OICsgbWV0aG9kTmFtZTtcbiAgICB9LFxuICAgIE5PX0NPTVBPTkVOVF9OQU1FOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLk5PX0NPTVBPTkVOVF9OQU1FO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHR5cGVzOiB0dWkudXRpbC5leHRlbmQoe30sIHR5cGVzKSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgZnVuYztcblxuICAgICAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBmdW5jID0gbWFwW3R5cGVdO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcblxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbWFnZS1lZGl0b3IgYXBwbGljYXRpb24gY2xhc3NcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW52b2tlciA9IHJlcXVpcmUoJy4vaW52b2tlcicpO1xudmFyIGNvbW1hbmRGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5L2NvbW1hbmQnKTtcbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgZXZlbnRzID0gY29uc3RzLmV2ZW50TmFtZXM7XG52YXIgY29tbWFuZHMgPSBjb25zdHMuY29tbWFuZE5hbWVzO1xudmFyIGNvbXBMaXN0ID0gY29uc3RzLmNvbXBvbmVudE5hbWVzO1xudmFyIHN0YXRlcyA9IGNvbnN0cy5zdGF0ZXM7XG52YXIga2V5Q29kZXMgPSBjb25zdHMua2V5Q29kZXM7XG5cbi8qKlxuICogSW1hZ2UgZWRpdG9yXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfGpRdWVyeXxIVE1MRWxlbWVudH0gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbl0gLSBDYW52YXMgbWF4IHdpZHRoICYgaGVpZ2h0IG9mIGNzc1xuICogIEBwYXJhbSB7bnVtYmVyfSBvcHRpb24uY3NzTWF4V2lkdGggLSBDYW52YXMgY3NzLW1heC13aWR0aFxuICogIEBwYXJhbSB7bnVtYmVyfSBvcHRpb24uY3NzTWF4SGVpZ2h0IC0gQ2FudmFzIGNzcy1tYXgtaGVpZ2h0XG4gKi9cbnZhciBJbWFnZUVkaXRvciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSW1hZ2VFZGl0b3IucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhc0VsZW1lbnQsIG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwge307XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZva2VyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHtJbnZva2VyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlciA9IG5ldyBJbnZva2VyKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZhYnJpYy1DYW52YXMgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge2ZhYnJpYy5DYW52YXN9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFZGl0b3IgY3VycmVudCBzdGF0ZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuTk9STUFMO1xuXG4gICAgICAgIHRoaXMuX3NldENhbnZhcyhjYW52YXNFbGVtZW50LCBvcHRpb24uY3NzTWF4V2lkdGgsIG9wdGlvbi5jc3NNYXhIZWlnaHQpO1xuICAgICAgICB0aGlzLl9hdHRhY2hJbnZva2VyRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX2F0dGFjaENhbnZhc0V2ZW50cygpO1xuICAgICAgICB0aGlzLl9hdHRhY2hEb21FdmVudHMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGludm9rZXIgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoSW52b2tlckV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBQVVNIX1VORE9fU1RBQ0sgPSBldmVudHMuUFVTSF9VTkRPX1NUQUNLO1xuICAgICAgICB2YXIgUFVTSF9SRURPX1NUQUNLID0gZXZlbnRzLlBVU0hfUkVET19TVEFDSztcbiAgICAgICAgdmFyIEVNUFRZX1VORE9fU1RBQ0sgPSBldmVudHMuRU1QVFlfVU5ET19TVEFDSztcbiAgICAgICAgdmFyIEVNUFRZX1JFRE9fU1RBQ0sgPSBldmVudHMuRU1QVFlfUkVET19TVEFDSztcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjcHVzaFVuZG9TdGFja1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlci5vbihQVVNIX1VORE9fU1RBQ0ssICQucHJveHkodGhpcy5maXJlLCB0aGlzLCBQVVNIX1VORE9fU1RBQ0spKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3B1c2hSZWRvU3RhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oUFVTSF9SRURPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgUFVTSF9SRURPX1NUQUNLKSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNlbXB0eVVuZG9TdGFja1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW52b2tlci5vbihFTVBUWV9VTkRPX1NUQUNLLCAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgRU1QVFlfVU5ET19TVEFDSykpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjZW1wdHlSZWRvU3RhY2tcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ludm9rZXIub24oRU1QVFlfUkVET19TVEFDSywgJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIEVNUFRZX1JFRE9fU1RBQ0spKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGNhbnZhcyBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDYW52YXNFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jYW52YXMub24oe1xuICAgICAgICAgICAgJ3BhdGg6Y3JlYXRlZCc6IHRoaXMuX29uUGF0aENyZWF0ZWQsXG4gICAgICAgICAgICAnb2JqZWN0OmFkZGVkJzogJC5wcm94eShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvbW1hbmQ7XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqLmlzVHlwZSgnY3JvcHpvbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF0dWkudXRpbC5oYXNTdGFtcChvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuQUREX09CSkVDVCwgb2JqKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW52b2tlci5wdXNoVW5kb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbnZva2VyLmNsZWFyUmVkb1N0YWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhZGRPYmplY3RcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iaiAtIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdhZGRPYmplY3QnLCBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2cob2JqKTtcbiAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkFERF9PQkpFQ1QsIG9iaik7XG4gICAgICAgICAgICB9LCB0aGlzKSxcbiAgICAgICAgICAgICdvYmplY3Q6cmVtb3ZlZCc6ICQucHJveHkoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3JlbW92ZU9iamVjdFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZmFicmljLk9iamVjdH0gb2JqIC0gaHR0cDovL2ZhYnJpY2pzLmNvbS9kb2NzL2ZhYnJpYy5PYmplY3QuaHRtbFxuICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ3JlbW92ZU9iamVjdCcsIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhvYmopO1xuICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShldmVudHMuUkVNT1ZFX09CSkVDVCwgZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgIH0sIHRoaXMpLFxuICAgICAgICAgICAgJ29iamVjdDptb3ZpbmcnOiAkLnByb3h5KGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclJlZG9TdGFjaygpO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhZGp1c3RPYmplY3RcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iaiAtIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gQWN0aW9uIHR5cGUgKG1vdmUpXG4gICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAgKiBpbWFnZUVkaXRvci5vbignYWRqdXN0T2JqZWN0JywgZnVuY3Rpb24ob2JqLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShldmVudHMuQURKVVNUX09CSkVDVCwgZXZlbnQudGFyZ2V0LCAnbW92ZScpO1xuICAgICAgICAgICAgfSwgdGhpcyksXG4gICAgICAgICAgICAnb2JqZWN0OnNjYWxpbmcnOiAkLnByb3h5KGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclJlZG9TdGFjaygpO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhZGp1c3RPYmplY3RcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2ZhYnJpYy5PYmplY3R9IG9iaiAtIGh0dHA6Ly9mYWJyaWNqcy5jb20vZG9jcy9mYWJyaWMuT2JqZWN0Lmh0bWxcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gQWN0aW9uIHR5cGUgKHNjYWxlKVxuICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2FkanVzdE9iamVjdCcsIGZ1bmN0aW9uKG9iaiwgdHlwZSkge1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhvYmopO1xuICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkFESlVTVF9PQkpFQ1QsIGV2ZW50LnRhcmdldCwgJ3NjYWxlJyk7XG4gICAgICAgICAgICB9LCB0aGlzKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGRvbSBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hEb21FdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmYWJyaWMudXRpbC5hZGRMaXN0ZW5lcihkb2N1bWVudCwgJ2tleWRvd24nLCAkLnByb3h5KHRoaXMuX29uS2V5RG93biwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBLZXlkb3duIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGUgLSBFdmVudCBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSAmJiBlLmtleUNvZGUgPT09IGtleUNvZGVzLlopIHtcbiAgICAgICAgICAgIHRoaXMudW5kbygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSAmJiBlLmtleUNvZGUgPT09IGtleUNvZGVzLlkpIHtcbiAgICAgICAgICAgIHRoaXMucmVkbygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50TGlzdGVuZXIgLSBcInBhdGg6Y3JlYXRlZFwiXG4gICAgICogIC0gRXZlbnRzOjogXCJvYmplY3Q6YWRkZWRcIiAtPiBcInBhdGg6Y3JlYXRlZFwiXG4gICAgICogQHBhcmFtIHt7cGF0aDogZmFicmljLlBhdGh9fSBvYmogLSBQYXRoIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uUGF0aENyZWF0ZWQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICBvYmoucGF0aC5zZXQoY29uc3RzLmZPYmplY3RPcHRpb25zLlNFTEVDVElPTl9TVFlMRSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGpRdWVyeXxIVE1MRWxlbWVudH0gY2FudmFzRWxlbWVudCAtIENhbnZhcyBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNzc01heFdpZHRoIC0gQ2FudmFzIGNzcyBtYXggd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY3NzTWF4SGVpZ2h0IC0gQ2FudmFzIGNzcyBtYXggaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0Q2FudmFzOiBmdW5jdGlvbihjYW52YXNFbGVtZW50LCBjc3NNYXhXaWR0aCwgY3NzTWF4SGVpZ2h0KSB7XG4gICAgICAgIHZhciBtYWluQ29tcG9uZW50O1xuXG4gICAgICAgIG1haW5Db21wb25lbnQgPSB0aGlzLl9nZXRNYWluQ29tcG9uZW50KCk7XG4gICAgICAgIG1haW5Db21wb25lbnQuc2V0Q2FudmFzRWxlbWVudChjYW52YXNFbGVtZW50KTtcbiAgICAgICAgbWFpbkNvbXBvbmVudC5zZXRDc3NNYXhEaW1lbnNpb24oe1xuICAgICAgICAgICAgd2lkdGg6IGNzc01heFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjc3NNYXhIZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG1haW5Db21wb25lbnQuZ2V0Q2FudmFzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgbWFpbiBjb21wb25lbnRcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fSBNYWluIGNvbXBvbmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE1haW5Db21wb25lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0Lk1BSU4pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBDb21wb25lbnQgbmFtZVxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q29tcG9uZW50OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2VyLmdldENvbXBvbmVudChuYW1lKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgc3RhdGVcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIEltYWdlIGVkaXRvciBzdGF0ZXNcbiAgICAgKiAvL1xuICAgICAqIC8vICAgIE5PUk1BTDogJ05PUk1BTCdcbiAgICAgKiAvLyAgICBDUk9QOiAnQ1JPUCdcbiAgICAgKiAvLyAgICBGUkVFX0RSQVdJTkc6ICdGUkVFX0RSQVdJTkcnXG4gICAgICogLy8gICAgVEVYVDogJ1RFWFQnXG4gICAgICogLy9cbiAgICAgKiBpZiAoaW1hZ2VFZGl0b3IuZ2V0Q3VycmVudFN0YXRlKCkgPT09ICdGUkVFX0RSQVdJTkcnKSB7XG4gICAgICogICAgIGltYWdlRWRpdG9yLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICogfVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG9iamVjdHNcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5jbGVhck9iamVjdHMoKTtcbiAgICAgKi9cbiAgICBjbGVhck9iamVjdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5DTEVBUl9PQkpFQ1RTKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5DTEVBUl9PQkpFQ1RTKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjY2xlYXJPYmplY3RzXG4gICAgICAgICAqL1xuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZXhlY3V0ZShjb21tYW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGN1cnJlbnQgYWN0aW9uICYgRGVhY3RpdmF0ZVxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0RnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVpZHRvci5lbmRBbGwoKTsgLy8gPT09IGltYWdlRWlkdG9yLmVuZEZyZWVEcmF3aW5nKCk7XG4gICAgICpcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kQWxsKCk7IC8vID09PSBpbWFnZUVpZHRvci5lbmRDcm9wcGluZygpO1xuICAgICAqL1xuICAgIGVuZEFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW5kVGV4dE1vZGUoKTtcbiAgICAgICAgdGhpcy5lbmRGcmVlRHJhd2luZygpO1xuICAgICAgICB0aGlzLmVuZExpbmVEcmF3aW5nKCk7XG4gICAgICAgIHRoaXMuZW5kQ3JvcHBpbmcoKTtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLk5PUk1BTDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVhY3RpdmF0ZSBhbGwgb2JqZWN0c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgKi9cbiAgICBkZWFjdGl2YXRlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgICAgdGhpcy5fY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIENvbW1hbmRcbiAgICAgKi9cbiAgICBleGVjdXRlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHRoaXMuZW5kQWxsKCk7XG4gICAgICAgIHRoaXMuX2ludm9rZXIuaW52b2tlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IudW5kbygpO1xuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9pbnZva2VyLnVuZG8oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkb1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnJlZG8oKTtcbiAgICAgKi9cbiAgICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5faW52b2tlci5yZWRvKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgaW1hZ2UgZnJvbSBmaWxlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7RmlsZX0gaW1nRmlsZSAtIEltYWdlIGZpbGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2ltYWdlTmFtZV0gLSBpbWFnZU5hbWVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmxvYWRJbWFnZUZyb21GaWxlKGZpbGUpO1xuICAgICAqL1xuICAgIGxvYWRJbWFnZUZyb21GaWxlOiBmdW5jdGlvbihpbWdGaWxlLCBpbWFnZU5hbWUpIHtcbiAgICAgICAgaWYgKCFpbWdGaWxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoXG4gICAgICAgICAgICBVUkwuY3JlYXRlT2JqZWN0VVJMKGltZ0ZpbGUpLFxuICAgICAgICAgICAgaW1hZ2VOYW1lIHx8IGltZ0ZpbGUubmFtZVxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGltYWdlIGZyb20gdXJsXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBGaWxlIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZU5hbWUgLSBpbWFnZU5hbWVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmxvYWRJbWFnZUZyb21VUkwoJ2h0dHA6Ly91cmwvdGVzdEltYWdlLnBuZycsICdsZW5hJylcbiAgICAgKi9cbiAgICBsb2FkSW1hZ2VGcm9tVVJMOiBmdW5jdGlvbih1cmwsIGltYWdlTmFtZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjYWxsYmFjaywgY29tbWFuZDtcblxuICAgICAgICBpZiAoIWltYWdlTmFtZSB8fCAhdXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayA9ICQucHJveHkodGhpcy5fY2FsbGJhY2tBZnRlckltYWdlTG9hZGluZywgdGhpcyk7XG4gICAgICAgIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuTE9BRF9JTUFHRSwgaW1hZ2VOYW1lLCB1cmwpO1xuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soZnVuY3Rpb24ob0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9JbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhvSW1hZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNjbGVhckltYWdlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpcmUoZXZlbnRzLkNMRUFSX0lNQUdFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBhZnRlciBpbWFnZSBsb2FkaW5nXG4gICAgICogQHBhcmFtIHs/ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBJbWFnZSBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NhbGxiYWNrQWZ0ZXJJbWFnZUxvYWRpbmc6IGZ1bmN0aW9uKG9JbWFnZSkge1xuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudCA9IHRoaXMuX2dldE1haW5Db21wb25lbnQoKTtcbiAgICAgICAgdmFyICRjYW52YXNFbGVtZW50ID0gJChtYWluQ29tcG9uZW50LmdldENhbnZhc0VsZW1lbnQoKSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2xvYWRJbWFnZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uXG4gICAgICAgICAqICBAcGFyYW0ge251bWJlcn0gZGltZW5zaW9uLm9yaWdpbmFsV2lkdGggLSBvcmlnaW5hbCBpbWFnZSB3aWR0aFxuICAgICAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbi5vcmlnaW5hbEhlaWdodCAtIG9yaWdpbmFsIGltYWdlIGhlaWdodFxuICAgICAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbi5jdXJyZW50V2lkdGggLSBjdXJyZW50IHdpZHRoIChjc3MpXG4gICAgICAgICAqICBAcGFyYW0ge251bWJlcn0gZGltZW5zaW9uLmN1cnJlbnQgLSBjdXJyZW50IGhlaWdodCAoY3NzKVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpbWFnZUVkaXRvci5vbignbG9hZEltYWdlJywgZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZyhkaW1lbnNpb24ub3JpZ2luYWxXaWR0aCk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZyhkaW1lbnNpb24ub3JpZ2luYWxIZWlnaHQpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coZGltZW5zaW9uLmN1cnJlbnRXaWR0aCk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZyhkaW1lbnNpb24uY3VycmVudEhlaWdodCk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5MT0FEX0lNQUdFLCB7XG4gICAgICAgICAgICBvcmlnaW5hbFdpZHRoOiBvSW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBvcmlnaW5hbEhlaWdodDogb0ltYWdlLmhlaWdodCxcbiAgICAgICAgICAgIGN1cnJlbnRXaWR0aDogJGNhbnZhc0VsZW1lbnQud2lkdGgoKSxcbiAgICAgICAgICAgIGN1cnJlbnRIZWlnaHQ6ICRjYW52YXNFbGVtZW50LmhlaWdodCgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgaW1hZ2Ugb2JqZWN0IG9uIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWdVcmwgLSBJbWFnZSB1cmwgdG8gbWFrZSBvYmplY3RcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5hZGRJbWFnZU9iamVjdCgncGF0aC9maWxlTmFtZS5qcGcnKTtcbiAgICAgKi9cbiAgICBhZGRJbWFnZU9iamVjdDogZnVuY3Rpb24oaW1nVXJsKSB7XG4gICAgICAgIGlmICghaW1nVXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmYWJyaWMuSW1hZ2UuZnJvbVVSTChpbWdVcmwsXG4gICAgICAgICAgICAkLnByb3h5KHRoaXMuX2NhbGxiYWNrQWZ0ZXJMb2FkaW5nSW1hZ2VPYmplY3QsIHRoaXMpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNyb3NzT3JpZ2luOiAnQW5vbnltb3VzJ1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBmdW5jdGlvbiBhZnRlciBsb2FkaW5nIGltYWdlXG4gICAgICogQHBhcmFtIHtmYWJyaWMuSW1hZ2V9IG9iaiAtIEZhYnJpYyBpbWFnZSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jYWxsYmFja0FmdGVyTG9hZGluZ0ltYWdlT2JqZWN0OiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIG1haW5Db21wID0gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpO1xuICAgICAgICB2YXIgY2VudGVyUG9zID0gbWFpbkNvbXAuZ2V0Q2FudmFzSW1hZ2UoKS5nZXRDZW50ZXJQb2ludCgpO1xuXG4gICAgICAgIG9iai5zZXQoY29uc3RzLmZPYmplY3RPcHRpb25zLlNFTEVDVElPTl9TVFlMRSk7XG4gICAgICAgIG9iai5zZXQoe1xuICAgICAgICAgICAgbGVmdDogY2VudGVyUG9zLngsXG4gICAgICAgICAgICB0b3A6IGNlbnRlclBvcy55LFxuICAgICAgICAgICAgY3Jvc3NPcmlnaW46ICdhbm9ueW1vdXMnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2NhbnZhcy5hZGQob2JqKS5zZXRBY3RpdmVPYmplY3Qob2JqKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY3JvcHBpbmdcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICovXG4gICAgc3RhcnRDcm9wcGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcm9wcGVyO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09PSBzdGF0ZXMuQ1JPUCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbmRBbGwoKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuQ1JPUDtcbiAgICAgICAgY3JvcHBlciA9IHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5DUk9QUEVSKTtcbiAgICAgICAgY3JvcHBlci5zdGFydCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3Ijc3RhcnRDcm9wcGluZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5TVEFSVF9DUk9QUElORyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IGNyb3BwaW5nXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQXBwbHlpbmddIC0gV2hldGhlciB0aGUgY3JvcHBpbmcgaXMgYXBwbGllZCBvciBjYW5jZWxlZFxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRDcm9wcGluZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZENyb3BwaW5nKGZhbHNlKTsgLy8gY2FuY2VsIGNyb3BwaW5nXG4gICAgICpcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydENyb3BwaW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kQ3JvcHBpbmcodHJ1ZSk7IC8vIGFwcGx5IGNyb3BwaW5nXG4gICAgICovXG4gICAgZW5kQ3JvcHBpbmc6IGZ1bmN0aW9uKGlzQXBwbHlpbmcpIHtcbiAgICAgICAgdmFyIGNyb3BwZXIsIGRhdGE7XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgIT09IHN0YXRlcy5DUk9QKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcm9wcGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LkNST1BQRVIpO1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5OT1JNQUw7XG4gICAgICAgIGRhdGEgPSBjcm9wcGVyLmVuZChpc0FwcGx5aW5nKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2VuZENyb3BwaW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLkVORF9DUk9QUElORyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZyb21VUkwoZGF0YS51cmwsIGRhdGEuaW1hZ2VOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSAnZmxpcFgnIG9yICdmbGlwWScgb3IgJ3Jlc2V0J1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZsaXA6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5GTElQX0lNQUdFKTtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuRkxJUF9JTUFHRSwgdHlwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI2ZsaXBJbWFnZVxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gZmxpcFNldHRpbmdcbiAgICAgICAgICogIEBwYXJhbSB7Ym9vbGVhbn0gZmxpcFNldHRpbmcuZmxpcFggLSBpbWFnZS5mbGlwWFxuICAgICAgICAgKiAgQHBhcmFtIHtib29sZWFufSBmbGlwU2V0dGluZy5mbGlwWSAtIGltYWdlLmZsaXBZXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGltYWdlLmFuZ2xlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdmbGlwSW1hZ2UnLCBmdW5jdGlvbihmbGlwU2V0dGluZywgYW5nbGUpIHtcbiAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdmbGlwWDogJywgc2V0dGluZy5mbGlwWCk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZmxpcFk6ICcsIHNldHRpbmcuZmxpcFkpO1xuICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2FuZ2xlOiAnLCBhbmdsZSk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5leGVjdXRlKGNvbW1hbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGbGlwIHhcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5mbGlwWCgpO1xuICAgICAqL1xuICAgIGZsaXBYOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmxpcCgnZmxpcFgnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmxpcCB5XG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuZmxpcFkoKTtcbiAgICAgKi9cbiAgICBmbGlwWTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZsaXAoJ2ZsaXBZJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGZsaXBcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5yZXNldEZsaXAoKTtcbiAgICAgKi9cbiAgICByZXNldEZsaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9mbGlwKCdyZXNldCcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtICdyb3RhdGUnIG9yICdzZXRBbmdsZSdcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBhbmdsZSB2YWx1ZSAoZGVncmVlKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24odHlwZSwgYW5nbGUpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eSh0aGlzLmZpcmUsIHRoaXMsIGV2ZW50cy5ST1RBVEVfSU1BR0UpO1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5ST1RBVEVfSU1BR0UsIHR5cGUsIGFuZ2xlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3Ijcm90YXRlSW1hZ2VcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRBbmdsZSAtIGltYWdlLmFuZ2xlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGltYWdlRWRpdG9yLm9uKCdyb3RhdGVJbWFnZScsIGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnYW5nbGU6ICcsIGFuZ2xlKTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICBjb21tYW5kLnNldEV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaylcbiAgICAgICAgICAgIC5zZXRVbmRvQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSBpbWFnZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBBZGRpdGlvbmFsIGFuZ2xlIHRvIHJvdGF0ZSBpbWFnZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc2V0QW5nbGUoMTApOyAvLyBhbmdsZSA9IDEwXG4gICAgICogaW1hZ2VFZGl0b3Iucm90YXRlKDEwKTsgLy8gYW5nbGUgPSAyMFxuICAgICAqIGltYWdlRWlkdG9yLnNldEFuZ2xlKDUpOyAvLyBhbmdsZSA9IDVcbiAgICAgKiBpbWFnZUVpZHRvci5yb3RhdGUoLTk1KTsgLy8gYW5nbGUgPSAtOTBcbiAgICAgKi9cbiAgICByb3RhdGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHRoaXMuX3JvdGF0ZSgncm90YXRlJywgYW5nbGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYW5nbGVcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gQW5nbGUgb2YgaW1hZ2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnNldEFuZ2xlKDEwKTsgLy8gYW5nbGUgPSAxMFxuICAgICAqIGltYWdlRWRpdG9yLnJvdGF0ZSgxMCk7IC8vIGFuZ2xlID0gMjBcbiAgICAgKiBpbWFnZUVpZHRvci5zZXRBbmdsZSg1KTsgLy8gYW5nbGUgPSA1XG4gICAgICogaW1hZ2VFaWR0b3Iucm90YXRlKDUwKTsgLy8gYW5nbGUgPSA1NVxuICAgICAqIGltYWdlRWlkdG9yLnNldEFuZ2xlKC00MCk7IC8vIGFuZ2xlID0gLTQwXG4gICAgICovXG4gICAgc2V0QW5nbGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHRoaXMuX3JvdGF0ZSgnc2V0QW5nbGUnLCBhbmdsZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGZyZWUtZHJhd2luZyBtb2RlXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgY29sb3I6IHN0cmluZ319IFtzZXR0aW5nXSAtIEJydXNoIHdpZHRoICYgY29sb3JcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5zdGFydEZyZWVEcmF3aW5nKCk7XG4gICAgICogaW1hZ2VFZGl0b3IuZW5kRnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVpZHRvci5zdGFydEZyZWVEcmF3aW5nKHtcbiAgICAgKiAgICAgd2lkdGg6IDEyLFxuICAgICAqICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC41KSdcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBzdGFydEZyZWVEcmF3aW5nOiBmdW5jdGlvbihzZXR0aW5nKSB7XG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09PSBzdGF0ZXMuRlJFRV9EUkFXSU5HKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuRlJFRV9EUkFXSU5HKS5zdGFydChzZXR0aW5nKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuRlJFRV9EUkFXSU5HO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNzdGFydEZyZWVEcmF3aW5nXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnRzLlNUQVJUX0ZSRUVfRFJBV0lORyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkcmF3aW5nIGJydXNoXG4gICAgICogQHBhcmFtIHt7d2lkdGg6IG51bWJlciwgY29sb3I6IHN0cmluZ319IHNldHRpbmcgLSBCcnVzaCB3aWR0aCAmIGNvbG9yXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRGcmVlRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLnNldEJydXNoKHtcbiAgICAgKiAgICAgd2lkdGg6IDEyLFxuICAgICAqICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC41KSdcbiAgICAgKiB9KTtcbiAgICAgKiBpbWFnZUVkaXRvci5zZXRCcnVzaCh7XG4gICAgICogICAgIHdpZHRoOiA4LFxuICAgICAqICAgICBjb2xvcjogJ0ZGRkZGRidcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBzZXRCcnVzaDogZnVuY3Rpb24oc2V0dGluZykge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLl9zdGF0ZTtcbiAgICAgICAgdmFyIGNvbXBOYW1lO1xuXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2Ugc3RhdGVzLkxJTkU6XG4gICAgICAgICAgICAgICAgY29tcE5hbWUgPSBjb21wTGlzdC5MSU5FO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb21wTmFtZSA9IGNvbXBMaXN0LkZSRUVfRFJBV0lORztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTmFtZSkuc2V0QnJ1c2goc2V0dGluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuZCBmcmVlLWRyYXdpbmcgbW9kZVxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0RnJlZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRGcmVlRHJhd2luZygpO1xuICAgICAqL1xuICAgIGVuZEZyZWVEcmF3aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgIT09IHN0YXRlcy5GUkVFX0RSQVdJTkcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuRlJFRV9EUkFXSU5HKS5lbmQoKTtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuTk9STUFMO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNlbmRGcmVlRHJhd2luZ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKGV2ZW50cy5FTkRfRlJFRV9EUkFXSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgbGluZS1kcmF3aW5nIG1vZGVcbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBjb2xvcjogc3RyaW5nfX0gW3NldHRpbmddIC0gQnJ1c2ggd2lkdGggJiBjb2xvclxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLnN0YXJ0TGluZURyYXdpbmcoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5lbmRMaW5lRHJhd2luZygpO1xuICAgICAqIGltYWdlRWlkdG9yLnN0YXJ0TGluZURyYXdpbmcoe1xuICAgICAqICAgICB3aWR0aDogMTIsXG4gICAgICogICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJ1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHN0YXJ0TGluZURyYXdpbmc6IGZ1bmN0aW9uKHNldHRpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT09IHN0YXRlcy5MSU5FKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuTElORSkuc3RhcnQoc2V0dGluZyk7XG4gICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLkxJTkU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEltYWdlRWRpdG9yI3N0YXJ0TGluZURyYXdpbmdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuU1RBUlRfTElORV9EUkFXSU5HKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5kIGxpbmUtZHJhd2luZyBtb2RlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRMaW5lRHJhd2luZygpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZExpbmVEcmF3aW5nKCk7XG4gICAgICovXG4gICAgZW5kTGluZURyYXdpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSAhPT0gc3RhdGVzLkxJTkUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuTElORSkuZW5kKCk7XG4gICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLk5PUk1BTDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjZW5kTGluZURyYXdpbmdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuRU5EX0xJTkVfRFJBV0lORyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHRleHQgaW5wdXQgbW9kZVxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmVuZFRleHRNb2RlKCk7XG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRUZXh0TW9kZSgpO1xuICAgICAqL1xuICAgIHN0YXJ0VGV4dE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuZEFsbCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09PSBzdGF0ZXMuVEVYVCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZXMuVEVYVDtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lciA9ICQucHJveHkodGhpcy5fb25GYWJyaWNNb3VzZURvd24sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX2NhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmouaXNUeXBlKCd0ZXh0JykpIHtcbiAgICAgICAgICAgICAgICBvYmouZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9jYW52YXMuc2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ3RleHQnO1xuICAgICAgICB0aGlzLl9jYW52YXMub24oJ21vdXNlOmRvd24nLCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCB0ZXh0IG9uIGltYWdlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gSW5pdGlhbCBpbnB1dCB0ZXh0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5nc10gT3B0aW9ucyBmb3IgZ2VuZXJhdGluZyB0ZXh0XG4gICAgICogICAgIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3Muc3R5bGVzXSBJbml0aWFsIHN0eWxlc1xuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5zdHlsZXMuZmlsbF0gQ29sb3JcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Muc3R5bGVzLmZvbnRGYW1pbHldIEZvbnQgdHlwZSBmb3IgdGV4dFxuICAgICAqICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5zdHlsZXMuZm9udFNpemVdIFNpemVcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Muc3R5bGVzLmZvbnRTdHlsZV0gVHlwZSBvZiBpbmNsaW5hdGlvbiAobm9ybWFsIC8gaXRhbGljKVxuICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5zdHlsZXMuZm9udFdlaWdodF0gVHlwZSBvZiB0aGlja2VyIG9yIHRoaW5uZXIgbG9va2luZyAobm9ybWFsIC8gYm9sZClcbiAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Muc3R5bGVzLnRleHRBbGlnbl0gVHlwZSBvZiB0ZXh0IGFsaWduIChsZWZ0IC8gY2VudGVyIC8gcmlnaHQpXG4gICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnN0eWxlcy50ZXh0RGVjb3JhaXRvbl0gVHlwZSBvZiBsaW5lICh1bmRlcmxpbmUgLyBsaW5lLXRocm9naCAvIG92ZXJsaW5lKVxuICAgICAqICAgICBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlcn19IFtzZXR0aW5nLnBvc2l0aW9uXSAtIEluaXRpYWwgcG9zaXRpb25cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmFkZFRleHQoKTtcbiAgICAgKiBpbWFnZUVkaXRvci5hZGRUZXh0KCdpbml0IHRleHQnLCB7XG4gICAgICogXHRcdHN0eWxlczoge1xuICAgICAqIFx0XHRcdGZpbGw6ICcjMDAwJyxcbiAgICAgKiBcdFx0XHRmb250U2l6ZTogJzIwJyxcbiAgICAgKiBcdFx0XHRmb250V2VpZ2h0OiAnYm9sZCdcbiAgICAgKiBcdFx0fSxcbiAgICAgKiBcdFx0cG9zaXRpb246IHtcbiAgICAgKiBcdFx0XHR4OiAxMCxcbiAgICAgKiBcdFx0XHR5OiAxMFxuICAgICAqIFx0XHR9XG4gICAgICogfSk7XG4gICAgICovXG4gICAgYWRkVGV4dDogZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgIT09IHN0YXRlcy5URVhUKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlcy5URVhUO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LlRFWFQpLmFkZCh0ZXh0IHx8ICcnLCBzZXR0aW5ncyB8fCB7fSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBjb250ZW50cyBvZiBzZWxlY3RlZCB0ZXh0IG9iamVjdCBvbiBpbWFnZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIENoYW5naW5nIHRleHRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmNoYW5nZVRleHQoJ2NoYW5nZSB0ZXh0Jyk7XG4gICAgICovXG4gICAgY2hhbmdlVGV4dDogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICB2YXIgYWN0aXZlT2JqID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpICE9PSBzdGF0ZXMuVEVYVCB8fFxuICAgICAgICAgICAgIWFjdGl2ZU9iaikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LlRFWFQpLmNoYW5nZShhY3RpdmVPYmosIHRleHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3R5bGVcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHN0eWxlT2JqIC0gSW5pdGlhbCBzdHlsZXNcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai5maWxsXSBDb2xvclxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLmZvbnRGYW1pbHldIEZvbnQgdHlwZSBmb3IgdGV4dFxuICAgICAqICAgICBAcGFyYW0ge251bWJlcn0gW3N0eWxlT2JqLmZvbnRTaXplXSBTaXplXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZm9udFN0eWxlXSBUeXBlIG9mIGluY2xpbmF0aW9uIChub3JtYWwgLyBpdGFsaWMpXG4gICAgICogICAgIEBwYXJhbSB7c3RyaW5nfSBbc3R5bGVPYmouZm9udFdlaWdodF0gVHlwZSBvZiB0aGlja2VyIG9yIHRoaW5uZXIgbG9va2luZyAobm9ybWFsIC8gYm9sZClcbiAgICAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IFtzdHlsZU9iai50ZXh0QWxpZ25dIFR5cGUgb2YgdGV4dCBhbGlnbiAobGVmdCAvIGNlbnRlciAvIHJpZ2h0KVxuICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gW3N0eWxlT2JqLnRleHREZWNvcmFpdG9uXSBUeXBlIG9mIGxpbmUgKHVuZGVybGluZSAvIGxpbmUtdGhyb2doIC8gb3ZlcmxpbmUpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5jaGFuZ2VUZXh0U3R5bGUoe1xuICAgICAqIFx0XHRmb250U3R5bGU6ICdpdGFsaWMnXG4gICAgICogfSk7XG4gICAgICovXG4gICAgY2hhbmdlVGV4dFN0eWxlOiBmdW5jdGlvbihzdHlsZU9iaikge1xuICAgICAgICB2YXIgYWN0aXZlT2JqID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEN1cnJlbnRTdGF0ZSgpICE9PSBzdGF0ZXMuVEVYVCB8fFxuICAgICAgICAgICAgIWFjdGl2ZU9iaikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29tcG9uZW50KGNvbXBMaXN0LlRFWFQpLnNldFN0eWxlKGFjdGl2ZU9iaiwgc3R5bGVPYmopO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmQgdGV4dCBpbnB1dCBtb2RlXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3Iuc3RhcnRUZXh0TW9kZSgpO1xuICAgICAqIGltYWdlRWRpdG9yLmVuZFRleHRNb2RlKCk7XG4gICAgICovXG4gICAgZW5kVGV4dE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50U3RhdGUoKSA9PT0gc3RhdGVzLlRFWFQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGVzLk5PUk1BTDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NhbnZhcy5mb3JFYWNoT2JqZWN0KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5pc1R5cGUoJ3RleHQnKSAmJiBvYmoudGV4dCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICBvYmoucmVtb3ZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9iai5ldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzLnNlbGVjdGlvbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5kZWZhdWx0Q3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLl9jYW52YXMub2ZmKCdtb3VzZTpkb3duJywgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIE1vdXNlZG93biBldmVudCBoYW5kbGVyXG4gICAgICAqIEBwYXJhbSB7ZmFicmljLkV2ZW50fSBldmVudCAtIEN1cnJlbnQgbW91c2Vkb3duIGV2ZW50IG9iamVjdFxuICAgICAgKi9cbiAgICBfb25GYWJyaWNNb3VzZURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBvYmogPSBldmVudC50YXJnZXQ7XG4gICAgICAgIHZhciBlID0gZXZlbnQuZTtcbiAgICAgICAgdmFyIG9yaWdpblBvaW50ZXIgPSB0aGlzLl9jYW52YXMuZ2V0UG9pbnRlcihlKTtcblxuICAgICAgICBpZiAob2JqICYmICFvYmouaXNUeXBlKCd0ZXh0JykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBJbWFnZUVkaXRvciNhY3RpdmF0ZVRleHRcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzXG4gICAgICAgICAqICAgICBAcGFyYW0ge2Jvb2xlYW59IHNldHRpbmdzLnR5cGUgLSBUeXBlIG9mIHRleHQgb2JqZWN0IChuZXcgLyBzZWxlY3QpXG4gICAgICAgICAqICAgICBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ3MudGV4dCAtIEN1cnJlbnQgdGV4dFxuICAgICAgICAgKiAgICAgQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzLnN0eWxlcyAtIEN1cnJlbnQgc3R5bGVzXG4gICAgICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdzLnN0eWxlcy5maWxsIC0gQ29sb3JcbiAgICAgICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ3Muc3R5bGVzLmZvbnRGYW1pbHkgLSBGb250IHR5cGUgZm9yIHRleHRcbiAgICAgICAgICogICAgICAgICBAcGFyYW0ge251bWJlcn0gc2V0dGluZ3Muc3R5bGVzLmZvbnRTaXplIC0gU2l6ZVxuICAgICAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5ncy5zdHlsZXMuZm9udFN0eWxlIC0gVHlwZSBvZiBpbmNsaW5hdGlvbiAobm9ybWFsIC8gaXRhbGljKVxuICAgICAgICAgKiAgICAgICAgIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5ncy5zdHlsZXMuZm9udFdlaWdodCAtIFR5cGUgb2YgdGhpY2tlciBvciB0aGlubmVyIGxvb2tpbmcgKG5vcm1hbCAvIGJvbGQpXG4gICAgICAgICAqICAgICAgICAgQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdzLnN0eWxlcy50ZXh0QWxpZ24gLSBUeXBlIG9mIHRleHQgYWxpZ24gKGxlZnQgLyBjZW50ZXIgLyByaWdodClcbiAgICAgICAgICogICAgICAgICBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ3Muc3R5bGVzLnRleHREZWNvcmFpdG9uIC0gVHlwZSBvZiBsaW5lICh1bmRlcmxpbmUgLyBsaW5lLXRocm9naCAvIG92ZXJsaW5lKVxuICAgICAgICAgKiAgICAgQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBzZXR0aW5ncy5vcmlnaW5Qb3NpdGlvbiAtIEN1cnJlbnQgcG9zaXRpb24gb24gb3JpZ2luIGNhbnZhc1xuICAgICAgICAgKiAgICAgQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBzZXR0aW5ncy5jbGllbnRQb3NpdGlvbiAtIEN1cnJlbnQgcG9zaXRpb24gb24gY2xpZW50IGFyZWFcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogaW1hZ2VFZGl0b3Iub24oJ2FjdGl2YXRlVGV4dCcsIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgKiBcdFx0Y29uc29sZS5sb2coJ3RleHQgb2JqZWN0IHR5cGU6ICcgKyBvYmoudHlwZSk7XG4gICAgICAgICAqIFx0XHRjb25zb2xlLmxvZygndGV4dCBjb250ZW50czogJyArIG9iai50ZXh0KTtcbiAgICAgICAgICogXHRcdGNvbnNvbGUubG9nKCd0ZXh0IHN0eWxlczogJyArIG9iai5zdHlsZXMpO1xuICAgICAgICAgKiBcdFx0Y29uc29sZS5sb2coJ3RleHQgcG9zaXRpb24gb24gY2FudmFzOiAnICsgb2JqLm9yaWdpblBvc2l0aW9uKTtcbiAgICAgICAgICogXHRcdGNvbnNvbGUubG9nKCd0ZXh0IHBvc2l0aW9uIG9uIGJyd29zZXI6ICcgKyBvYmouY2xpZW50UG9zaXRpb24pO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZShldmVudHMuQUNUSVZBVEVfVEVYVCwge1xuICAgICAgICAgICAgdHlwZTogb2JqID8gJ3NlbGVjdCcgOiAnbmV3JyxcbiAgICAgICAgICAgIHRleHQ6IG9iaiA/IG9iai50ZXh0IDogJycsXG4gICAgICAgICAgICBzdHlsZXM6IG9iaiA/IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBvYmouZmlsbCxcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBvYmouZm9udEZhbWlseSxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogb2JqLmZvbnRTaXplLFxuICAgICAgICAgICAgICAgIGZvbnRTdHlsZTogb2JqLmZvbnRTdHlsZSxcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246IG9iai50ZXh0QWxpZ24sXG4gICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246IG9iai50ZXh0RGVjb3JhdGlvblxuICAgICAgICAgICAgfSA6IHt9LFxuICAgICAgICAgICAgb3JpZ2luUG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB4OiBvcmlnaW5Qb2ludGVyLngsXG4gICAgICAgICAgICAgICAgeTogb3JpZ2luUG9pbnRlci55XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xpZW50UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgeTogZS5jbGllbnRZXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBjdXN0b20gaWNvbnNcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHt7aWNvblR5cGU6IHN0cmluZywgcGF0aFZhbHVlOiBzdHJpbmd9fSBpbmZvcyAtIEluZm9zIHRvIHJlZ2lzdGVyIGljb25zXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5yZWdpc3Rlckljb25zKHtcbiAgICAgKiBcdFx0Y3VzdG9tSWNvbjogJ00gMCAwIEwgMjAgMjAgTCAxMCAxMCBaJyxcbiAgICAgKiBcdFx0Y3VzdG9tQXJyb3c6ICdNIDYwIDAgTCAxMjAgNjAgSCA5MCBMIDc1IDQ1IFYgMTgwIEggNDUgViA0NSBMIDMwIDYwIEggMCBaJ1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHJlZ2lzdGVySWNvbnM6IGZ1bmN0aW9uKGluZm9zKSB7XG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5JQ09OKS5yZWdpc3RlclBhdGhzKGluZm9zKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGljb24gb24gY2FudmFzXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gSWNvbiB0eXBlIChhcnJvdyAvIGNhbmNlbClcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGltYWdlRWRpdG9yLmFkZEljb24oJ2Fycm93Jyk7XG4gICAgICovXG4gICAgYWRkSWNvbjogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB0aGlzLl9nZXRDb21wb25lbnQoY29tcExpc3QuSUNPTikuYWRkKHR5cGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgaWNvbiBjb2xvclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBDb2xvciBmb3IgaWNvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuY2hhbmdlSWNvbkNvbG9yKCcjMDAwMDAwJyk7XG4gICAgICovXG4gICAgY2hhbmdlSWNvbkNvbG9yOiBmdW5jdGlvbihjb2xvcikge1xuICAgICAgICB2YXIgYWN0aXZlT2JqID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xuXG4gICAgICAgIHRoaXMuX2dldENvbXBvbmVudChjb21wTGlzdC5JQ09OKS5zZXRDb2xvcihjb2xvciwgYWN0aXZlT2JqKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFjdGl2ZSBvYmplY3Qgb3IgZ3JvdXBcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5yZW1vdmVBY3RpdmVPYmplY3QoKTtcbiAgICAgKi9cbiAgICByZW1vdmVBY3RpdmVPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5fY2FudmFzO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpIHx8IGNhbnZhcy5nZXRBY3RpdmVHcm91cCgpO1xuICAgICAgICB2YXIgY29tbWFuZCA9IGNvbW1hbmRGYWN0b3J5LmNyZWF0ZShjb21tYW5kcy5SRU1PVkVfT0JKRUNULCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGx5IGZpbHRlciBvbiBjYW52YXMgaW1hZ2VcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBGaWx0ZXIgdHlwZSAoY3VycmVudCBmaWx0ZXIgdHlwZSBpcyBvbmx5ICdtYXNrJylcbiAgICAgKiBAcGFyYW0ge29wdGlvbnN9IG9wdGlvbnMgLSBPcHRpb25zIHRvIGFwcGx5IGZpbHRlclxuICAgICAqIEBleGFtcGxlXG4gICAgICogaW1hZ2VFZGl0b3IuYXBwbHlGaWx0ZXIoJ21hc2snKTtcbiAgICAgKiBpbWFnZUVkaXRvci5hcHBseUZpbHRlcignbWFzaycsIHtcbiAgICAgKiBcdFx0bWFzazogZmFicmljSW1nT2JqXG4gICAgICogfSk7XG4gICAgICovXG4gICAgYXBwbHlGaWx0ZXI6IGZ1bmN0aW9uKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQsIGNhbGxiYWNrLCBhY3RpdmVPYmo7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdtYXNrJyAmJiAhb3B0aW9ucykge1xuICAgICAgICAgICAgYWN0aXZlT2JqID0gdGhpcy5fY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpO1xuXG4gICAgICAgICAgICBpZiAoIShhY3RpdmVPYmogJiYgYWN0aXZlT2JqLmlzVHlwZSgnaW1hZ2UnKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgbWFzazogYWN0aXZlT2JqXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sgPSAkLnByb3h5KHRoaXMuZmlyZSwgdGhpcywgZXZlbnRzLkFQUExZX0ZJTFRFUik7XG4gICAgICAgIGNvbW1hbmQgPSBjb21tYW5kRmFjdG9yeS5jcmVhdGUoY29tbWFuZHMuQVBQTFlfRklMVEVSLCB0eXBlLCBvcHRpb25zKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgSW1hZ2VFZGl0b3IjYXBwbHlGaWx0ZXJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbHRlclR5cGUgLSBBcHBsaWVkIGZpbHRlclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0VHlwZSAtIEFjdGlvbiB0eXBlIChcImFkZFwiIG9yIFwicmVtb3ZlXCIgZmlsdGVyKVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpbWFnZUVkaXRvci5vbignYXBwbHlGaWx0ZXInLCBmdW5jdGlvbihmaWx0ZXJUeXBlLCBhY3RUeXBlKSB7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZmlsdGVyVHlwZTogJywgZmlsdGVyVHlwZSk7XG4gICAgICAgICAqICAgICBjb25zb2xlLmxvZygnYWN0VHlwZTogJywgYWN0VHlwZSk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgY29tbWFuZC5zZXRFeGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spXG4gICAgICAgICAgICAuc2V0VW5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuICAgICAgICB0aGlzLmV4ZWN1dGUoY29tbWFuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRhIHVybFxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIEEgRE9NU3RyaW5nIGluZGljYXRpbmcgdGhlIGltYWdlIGZvcm1hdC4gVGhlIGRlZmF1bHQgdHlwZSBpcyBpbWFnZS9wbmcuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQSBET01TdHJpbmcgY29udGFpbmluZyB0aGUgcmVxdWVzdGVkIGRhdGEgVVJJXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWdFbC5zcmMgPSBpbWFnZUVkaXRvci50b0RhdGFVUkwoKTtcbiAgICAgKi9cbiAgICB0b0RhdGFVUkw6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldE1haW5Db21wb25lbnQoKS50b0RhdGFVUkwodHlwZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGltYWdlIG5hbWVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnNvbGUubG9nKGltYWdlRWRpdG9yLmdldEltYWdlTmFtZSgpKTtcbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0TWFpbkNvbXBvbmVudCgpLmdldEltYWdlTmFtZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB1bmRvU3RhY2tcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5jbGVhclVuZG9TdGFjaygpO1xuICAgICAqL1xuICAgIGNsZWFyVW5kb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclVuZG9TdGFjaygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpbWFnZUVkaXRvci5jbGVhclJlZG9TdGFjaygpO1xuICAgICAqL1xuICAgIGNsZWFyUmVkb1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW52b2tlci5jbGVhclJlZG9TdGFjaygpO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oSW1hZ2VFZGl0b3IpO1xubW9kdWxlLmV4cG9ydHMgPSBJbWFnZUVkaXRvcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IENvbXBvbmVudCBpbnRlcmZhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbXBvbmVudCBpbnRlcmZhY2VcbiAqIEBjbGFzc1xuICovXG52YXIgQ29tcG9uZW50ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBDb21wb25lbnQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGltYWdlKGJhY2tncm91bmQpIG9mIGNhbnZhc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiBpbWFnZVxuICAgICAqIEBwYXJhbSB7ZmFicmljLkltYWdlfSBvSW1hZ2UgLSBGYWJyaWMgaW1hZ2UgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBzZXRDYW52YXNJbWFnZTogZnVuY3Rpb24obmFtZSwgb0ltYWdlKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldENhbnZhc0ltYWdlKG5hbWUsIG9JbWFnZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY2FudmFzIGVsZW1lbnQgb2YgZmFicmljLkNhbnZhc1tbbG93ZXItY2FudmFzXV1cbiAgICAgKiBAcmV0dXJucyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvb3QoKS5nZXRDYW52YXNFbGVtZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBmYWJyaWMuQ2FudmFzIGluc3RhbmNlXG4gICAgICogQHJldHVybnMge2ZhYnJpYy5DYW52YXN9XG4gICAgICovXG4gICAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FudmFzSW1hZ2UgKGZhYnJpYy5JbWFnZSBpbnN0YW5jZSlcbiAgICAgKiBAcmV0dXJucyB7ZmFicmljLkltYWdlfVxuICAgICAqL1xuICAgIGdldENhbnZhc0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldENhbnZhc0ltYWdlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBuYW1lXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRJbWFnZU5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuZ2V0SW1hZ2VOYW1lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBlZGl0b3JcbiAgICAgKiBAcmV0dXJucyB7SW1hZ2VFZGl0b3J9XG4gICAgICovXG4gICAgZ2V0RWRpdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um9vdCgpLmdldEVkaXRvcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gY29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nIC0gSW1hZ2UgcHJvcGVydGllc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3dpdGhSZW5kZXJpbmddIC0gSWYgdHJ1ZSwgVGhlIGNoYW5nZWQgaW1hZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgaW4gdGhlIGNhbnZhc1xuICAgICAqL1xuICAgIHNldEltYWdlUHJvcGVydGllczogZnVuY3Rpb24oc2V0dGluZywgd2l0aFJlbmRlcmluZykge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRJbWFnZVByb3BlcnRpZXMoc2V0dGluZywgd2l0aFJlbmRlcmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjYW52YXMgZGltZW5zaW9uIC0gY3NzIG9ubHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGltZW5zaW9uIC0gQ2FudmFzIGNzcyBkaW1lbnNpb25cbiAgICAgKi9cbiAgICBzZXRDYW52YXNDc3NEaW1lbnNpb246IGZ1bmN0aW9uKGRpbWVuc2lvbikge1xuICAgICAgICB0aGlzLmdldFJvb3QoKS5zZXRDYW52YXNDc3NEaW1lbnNpb24oZGltZW5zaW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNhbnZhcyBkaW1lbnNpb24gLSBjc3Mgb25seVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkaW1lbnNpb24gLSBDYW52YXMgYmFja3N0b3JlIGRpbWVuc2lvblxuICAgICAqL1xuICAgIHNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbjogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLnNldENhbnZhc0JhY2tzdG9yZURpbWVuc2lvbihkaW1lbnNpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcGFyZW50XG4gICAgICogQHBhcmFtIHtDb21wb25lbnR8bnVsbH0gcGFyZW50IC0gUGFyZW50XG4gICAgICovXG4gICAgc2V0UGFyZW50OiBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50IHx8IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkanVzdCBjYW52YXMgZGltZW5zaW9uIHdpdGggc2NhbGluZyBpbWFnZVxuICAgICAqL1xuICAgIGFkanVzdENhbnZhc0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZ2V0Um9vdCgpLmFkanVzdENhbnZhc0RpbWVuc2lvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcGFyZW50LlxuICAgICAqIElmIHRoZSB2aWV3IGlzIHJvb3QsIHJldHVybiBudWxsXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudHxudWxsfVxuICAgICAqL1xuICAgIGdldFBhcmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiByb290XG4gICAgICogQHJldHVybnMge0NvbXBvbmVudH1cbiAgICAgKi9cbiAgICBnZXRSb290OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLmdldFBhcmVudCgpO1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC10aGlzXG5cbiAgICAgICAgd2hpbGUgKG5leHQpIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgICAgICAgbmV4dCA9IGN1cnJlbnQuZ2V0UGFyZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBDb21tYW5kIGludGVyZmFjZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBlcnJvck1lc3NhZ2UgPSByZXF1aXJlKCcuLi9mYWN0b3J5L2Vycm9yTWVzc2FnZScpO1xuXG52YXIgY3JlYXRlTWVzc2FnZSA9IGVycm9yTWVzc2FnZS5jcmVhdGUsXG4gICAgZXJyb3JUeXBlcyA9IGVycm9yTWVzc2FnZS50eXBlcztcblxuLyoqXG4gKiBDb21tYW5kIGNsYXNzXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7e2V4ZWN1dGU6IGZ1bmN0aW9uLCB1bmRvOiBmdW5jdGlvbn19IGFjdGlvbnMgLSBDb21tYW5kIGFjdGlvbnNcbiAqL1xudmFyIENvbW1hbmQgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIENvbW1hbmQucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKGFjdGlvbnMpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4ZWN1dGUgZnVuY3Rpb25cbiAgICAgICAgICogQHR5cGUge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leGVjdXRlID0gYWN0aW9ucy5leGVjdXRlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVbmRvIGZ1bmN0aW9uXG4gICAgICAgICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudW5kbyA9IGFjdGlvbnMudW5kbztcblxuICAgICAgICAvKipcbiAgICAgICAgICogZXhlY3V0ZUNhbGxiYWNrXG4gICAgICAgICAqIEB0eXBlIHtudWxsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leGVjdXRlQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1bmRvQ2FsbGJhY2tcbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVuZG9DYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn0gY29tcE1hcCAtIENvbXBvbmVudHMgaW5qZWN0aW9uXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVNZXNzYWdlKGVycm9yVHlwZXMuVU5fSU1QTEVNRU5UQVRJT04sICdleGVjdXRlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmRvIGFjdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIENvbXBvbmVudD59IGNvbXBNYXAgLSBDb21wb25lbnRzIGluamVjdGlvblxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY3JlYXRlTWVzc2FnZShlcnJvclR5cGVzLlVOX0lNUExFTUVOVEFUSU9OLCAndW5kbycpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV4ZWN1dGUgY2FsbGFiY2tcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrIGFmdGVyIGV4ZWN1dGlvblxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kfSB0aGlzXG4gICAgICovXG4gICAgc2V0RXhlY3V0ZUNhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmV4ZWN1dGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggdW5kbyBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgYWZ0ZXIgdW5kb1xuICAgICAqIEByZXR1cm5zIHtDb21tYW5kfSB0aGlzXG4gICAgICovXG4gICAgc2V0VW5kb0NhbGxiYWNrOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnVuZG9DYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmQ7XG4iLCIvKipcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgRGV2ZWxvcG1lbnQgVGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGZpbGVvdmVydmlldyBJbnZva2VyIC0gaW52b2tlIGNvbW1hbmRzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIEltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaW1hZ2VMb2FkZXInKTtcbnZhciBDcm9wcGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQvY3JvcHBlcicpO1xudmFyIE1haW5Db21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9tYWluJyk7XG52YXIgRmxpcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ZsaXAnKTtcbnZhciBSb3RhdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9uZW50L3JvdGF0aW9uJyk7XG52YXIgRnJlZURyYXdpbmcgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9mcmVlRHJhd2luZycpO1xudmFyIExpbmUgPSByZXF1aXJlKCcuL2NvbXBvbmVudC9saW5lJyk7XG52YXIgVGV4dCA9IHJlcXVpcmUoJy4vY29tcG9uZW50L3RleHQnKTtcbnZhciBJY29uID0gcmVxdWlyZSgnLi9jb21wb25lbnQvaWNvbicpO1xudmFyIEZpbHRlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50L2ZpbHRlcicpO1xudmFyIGV2ZW50TmFtZXMgPSByZXF1aXJlKCcuL2NvbnN0cycpLmV2ZW50TmFtZXM7XG5cbi8qKlxuICogSW52b2tlclxuICogQGNsYXNzXG4gKi9cbnZhciBJbnZva2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJbnZva2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEN1c3RvbSBFdmVudHNcbiAgICAgICAgICogQHR5cGUge3R1aS51dGlsLkN1c3RvbUV2ZW50c31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2N1c3RvbUV2ZW50cyA9IG5ldyB0dWkudXRpbC5DdXN0b21FdmVudHMoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVW5kbyBzdGFja1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPENvbW1hbmQ+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdW5kb1N0YWNrID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZG8gc3RhY2tcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxDb21tYW5kPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21wb25lbnQgbWFwXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgQ29tcG9uZW50Pn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudE1hcCA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2NrLWZsYWcgZm9yIGV4ZWN1dGluZyBjb21tYW5kXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faXNMb2NrZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb21wb25lbnRzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjb21wb25lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY3JlYXRlQ29tcG9uZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtYWluID0gbmV3IE1haW5Db21wb25lbnQoKTtcblxuICAgICAgICB0aGlzLl9yZWdpc3RlcihtYWluKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IEltYWdlTG9hZGVyKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IENyb3BwZXIobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgRmxpcChtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBSb3RhdGlvbihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBGcmVlRHJhd2luZyhtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBMaW5lKG1haW4pKTtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIobmV3IFRleHQobWFpbikpO1xuICAgICAgICB0aGlzLl9yZWdpc3RlcihuZXcgSWNvbihtYWluKSk7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKG5ldyBGaWx0ZXIobWFpbikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge0NvbXBvbmVudH0gY29tcG9uZW50IC0gQ29tcG9uZW50IGhhbmRsaW5nIHRoZSBjYW52YXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZWdpc3RlcjogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudE1hcFtjb21wb25lbnQuZ2V0TmFtZSgpXSA9IGNvbXBvbmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlIGNvbW1hbmQgZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW52b2tlRXhlY3V0aW9uOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmxvY2soKTtcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQuZXhlY3V0ZSh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoVW5kb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQuZXhlY3V0ZUNhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVubG9jaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBjb21tYW5kIHVuZG9cbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbnZva2VVbmRvOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmxvY2soKTtcblxuICAgICAgICByZXR1cm4gJC53aGVuKGNvbW1hbmQudW5kbyh0aGlzLl9jb21wb25lbnRNYXApKVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wdXNoUmVkb1N0YWNrKGNvbW1hbmQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGNvbW1hbmQudW5kb0NhbGxiYWNrKVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnVubG9jaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUuZmlyZX1cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cyAtIEFyZ3VtZW50cyB0byBmaXJlIGEgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5maXJlLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggY3VzdG9tIGV2ZW50c1xuICAgICAqIEBzZWUge0BsaW5rIHR1aS51dGlsLkN1c3RvbUV2ZW50cy5wcm90b3R5cGUub259XG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMgLSBBcmd1bWVudHMgdG8gYXR0YWNoIGV2ZW50c1xuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5fY3VzdG9tRXZlbnRzO1xuICAgICAgICBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gQ29tcG9uZW50IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50fVxuICAgICAqL1xuICAgIGdldENvbXBvbmVudDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50TWFwW25hbWVdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2NrIHRoaXMgaW52b2tlclxuICAgICAqL1xuICAgIGxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9jayB0aGlzIGludm9rZXJcbiAgICAgKi9cbiAgICB1bmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0xvY2tlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2UgY29tbWFuZFxuICAgICAqIFN0b3JlIHRoZSBjb21tYW5kIHRvIHRoZSB1bmRvU3RhY2tcbiAgICAgKiBDbGVhciB0aGUgcmVkb1N0YWNrXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgaW52b2tlOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuICQuRGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlRXhlY3V0aW9uKGNvbW1hbmQpXG4gICAgICAgICAgICAuZG9uZSgkLnByb3h5KHRoaXMuY2xlYXJSZWRvU3RhY2ssIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5kbyBjb21tYW5kXG4gICAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH1cbiAgICAgKi9cbiAgICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLl91bmRvU3RhY2sucG9wKCk7XG4gICAgICAgIHZhciBqcURlZmVyO1xuXG4gICAgICAgIGlmIChjb21tYW5kICYmIHRoaXMuX2lzTG9ja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2hVbmRvU3RhY2soY29tbWFuZCwgdHJ1ZSk7XG4gICAgICAgICAgICBjb21tYW5kID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1VORE9fU1RBQ0spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganFEZWZlciA9IHRoaXMuX2ludm9rZVVuZG8oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZG8gY29tbWFuZFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9XG4gICAgICovXG4gICAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5fcmVkb1N0YWNrLnBvcCgpO1xuICAgICAgICB2YXIganFEZWZlcjtcblxuICAgICAgICBpZiAoY29tbWFuZCAmJiB0aGlzLl9pc0xvY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoUmVkb1N0YWNrKGNvbW1hbmQsIHRydWUpO1xuICAgICAgICAgICAgY29tbWFuZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW1wdHlSZWRvU3RhY2soKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9SRURPX1NUQUNLKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpxRGVmZXIgPSB0aGlzLl9pbnZva2VFeGVjdXRpb24oY29tbWFuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcURlZmVyID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpxRGVmZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1c2ggdW5kbyBzdGFja1xuICAgICAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NpbGVudF0gLSBGaXJlIGV2ZW50IG9yIG5vdFxuICAgICAqL1xuICAgIHB1c2hVbmRvU3RhY2s6IGZ1bmN0aW9uKGNvbW1hbmQsIGlzU2lsZW50KSB7XG4gICAgICAgIHRoaXMuX3VuZG9TdGFjay5wdXNoKGNvbW1hbmQpO1xuICAgICAgICBpZiAoIWlzU2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9maXJlKGV2ZW50TmFtZXMuUFVTSF9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXNoIHJlZG8gc3RhY2tcbiAgICAgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBjb21tYW5kXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaWxlbnRdIC0gRmlyZSBldmVudCBvciBub3RcbiAgICAgKi9cbiAgICBwdXNoUmVkb1N0YWNrOiBmdW5jdGlvbihjb21tYW5kLCBpc1NpbGVudCkge1xuICAgICAgICB0aGlzLl9yZWRvU3RhY2sucHVzaChjb21tYW5kKTtcbiAgICAgICAgaWYgKCFpc1NpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLlBVU0hfUkVET19TVEFDSyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHJlZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlSZWRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVkb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIHVuZG9TdGFjayBpcyBlbXB0eVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRW1wdHlVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5kb1N0YWNrLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdW5kb1N0YWNrXG4gICAgICovXG4gICAgY2xlYXJVbmRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNFbXB0eVVuZG9TdGFjaygpKSB7XG4gICAgICAgICAgICB0aGlzLl91bmRvU3RhY2sgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX2ZpcmUoZXZlbnROYW1lcy5FTVBUWV9VTkRPX1NUQUNLKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciByZWRvU3RhY2tcbiAgICAgKi9cbiAgICBjbGVhclJlZG9TdGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0VtcHR5UmVkb1N0YWNrKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZG9TdGFjayA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZmlyZShldmVudE5hbWVzLkVNUFRZX1JFRE9fU1RBQ0spO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW52b2tlcjtcbiIsIi8qKlxuICogQGF1dGhvciBOSE4gRW50LiBGRSBEZXZlbG9wbWVudCBUZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWxcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluID0gTWF0aC5taW4sXG4gICAgbWF4ID0gTWF0aC5tYXg7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIENsYW1wIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWluVmFsdWUgLSBNaW5pbXVtIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heFZhbHVlIC0gTWF4aW11bSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGNsYW1wZWQgdmFsdWVcbiAgICAgKi9cbiAgICBjbGFtcDogZnVuY3Rpb24odmFsdWUsIG1pblZhbHVlLCBtYXhWYWx1ZSkge1xuICAgICAgICB2YXIgdGVtcDtcbiAgICAgICAgaWYgKG1pblZhbHVlID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgIHRlbXAgPSBtaW5WYWx1ZTtcbiAgICAgICAgICAgIG1pblZhbHVlID0gbWF4VmFsdWU7XG4gICAgICAgICAgICBtYXhWYWx1ZSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF4KG1pblZhbHVlLCBtaW4odmFsdWUsIG1heFZhbHVlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2Uga2V5LXZhbHVlIG9iamVjdCBmcm9tIGFyZ3VtZW50c1xuICAgICAqIEByZXR1cm5zIHtvYmplY3QuPHN0cmluZywgc3RyaW5nPn1cbiAgICAgKi9cbiAgICBrZXlNaXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb2JqID0ge307XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChhcmd1bWVudHMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgb2JqW2tleV0gPSBrZXk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxufTtcbiJdfQ==
