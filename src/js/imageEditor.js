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
var components = consts.componentNames;
var states = consts.states;
var keyCodes = consts.keyCodes;
var fObjectOptions = consts.fObjectOptions;

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

        if (option.selectionStyle) {
            this._setSelectionStyle(option.selectionStyle);
        }
    },

    /**
     * Set selection style of fabric object by init option
     * @param {object} styles - Selection styles
     * @private
     */
    _setSelectionStyle: function(styles) {
        tui.util.extend(fObjectOptions.SELECTION_STYLE, styles);
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
        this._removeEventHandler = $.proxy(this._onFabricRemoved, this);

        this._canvas.on({
            'path:created': this._onPathCreated,
            'object:added': $.proxy(function(event) {
                var obj = event.target;
                var command;

                if (obj.isType('cropzone') || obj.isType('text')) {
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
            'object:removed': this._removeEventHandler,
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
            }, this),
            'object:selected': $.proxy(function(event) {
                if (event.target.type === 'text' &&
                    this.getCurrentState() !== 'TEXT') {
                    this.startTextMode();
                }

                /**
                 * @event ImageEditor#selectObject
                 * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
                 * @example
                 * imageEditor.on('selectObject', function(obj) {
                 *     console.log(obj);
                 *     console.log(obj.type);
                 *     console.log(obj.getType());
                 * });
                 */
                this.fire(events.SELECT_OBJECT, event.target);
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
     /*eslint-disable complexity*/
    _onKeyDown: function(e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Z) {
            this.undo();
        }

        if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Y) {
            this.redo();
        }

        if ((e.keyCode === keyCodes.BACKSPACE || e.keyCode === keyCodes.DEL) &&
            this._canvas.getActiveObject()) {
            e.preventDefault();

            this.removeActiveObject();
        }
    },

    /**
     * onSelectClear handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     */
    _onFabricSelectClear: function(fEvent) {
        var textComp = this._getComponent(components.TEXT);
        var obj = textComp.getSelectedObj();
        var command;

        textComp.isPrevEditing = true;

        textComp.setSelectedInfo(fEvent.target, false);

        if (obj.text === '') {
            obj.remove();
        } else if (!tui.util.hasStamp(obj)) {
            command = commandFactory.create(commands.ADD_OBJECT, obj);
            this._invoker.pushUndoStack(command);
            this._invoker.clearRedoStack();
        }
    },

    /**
     * onSelect handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     */
    _onFabricSelect: function(fEvent) {
        var textComp = this._getComponent(components.TEXT);
        var obj = textComp.getSelectedObj();
        var command;

        textComp.isPrevEditing = true;

        if (obj.text === '') {
            obj.remove();
        } else if (!tui.util.hasStamp(obj) && textComp.isSelected()) {
            command = commandFactory.create(commands.ADD_OBJECT, obj);
            this._invoker.pushUndoStack(command);
            this._invoker.clearRedoStack();
        }

        textComp.setSelectedInfo(fEvent.target, true);
    },

    /**
     * onRemoved handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     */
    _onFabricRemoved: function(fEvent) {
        /**
         * @api
         * @event ImageEditor#removeObject
         * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
         * @example
         * imageEditor.on('removeObject', function(obj) {
         *     console.log(obj);
         * });
         */
        this.fire(events.REMOVE_OBJECT, fEvent.target);
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
        return this._getComponent(components.MAIN);
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
        this.endDrawingShapeMode();
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
        cropper = this._getComponent(components.CROPPER);
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
        var eventHandler;

        if (this.getCurrentState() !== states.CROP) {
            return;
        }

        cropper = this._getComponent(components.CROPPER);
        this._state = states.NORMAL;
        data = cropper.end(isApplying);

        eventHandler = tui.util.bind(function() {
            /**
             * @api
             * @event ImageEditor#endCropping
             */
            this.fire(events.END_CROPPING);
            this.off('loadImage', eventHandler);
        }, this);

        this.on('loadImage', eventHandler);

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
        this._getComponent(components.FREE_DRAWING).start(setting);
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
                compName = components.LINE;
                break;
            default:
                compName = components.FREE_DRAWING;
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
        this._getComponent(components.FREE_DRAWING).end();
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
        this._getComponent(components.LINE).start(setting);
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
        this._getComponent(components.LINE).end();
        this._state = states.NORMAL;

        /**
         * @api
         * @event ImageEditor#endLineDrawing
         */
        this.fire(events.END_LINE_DRAWING);
    },

    /**
     * Start to draw shape on canvas (bind event on canvas)
     * @api
     * @example
     * imageEditor.startDrawingShapeMode();
     */
    startDrawingShapeMode: function() {
        if (this.getCurrentState() !== states.SHAPE) {
            this.endAll();
            this._state = states.SHAPE;
            this._getComponent(components.SHAPE).startDrawingMode();
        }
    },

    /**
     * Set states of current drawing shape
     * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
     * @param {object} [options] - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
     * @api
     * @example
     * imageEditor.setDrawingShape('rect', {
     *     fill: 'red',
     *     width: 100,
     *     height: 200
     * });
     * imageEditor.setDrawingShape('circle', {
     *     fill: 'transparent',
     *     stroke: 'blue',
     *     strokeWidth: 3,
     *     rx: 10,
     *     ry: 100
     * });
     * imageEditor.setDrawingShape('triangle', { // When resizing, the shape keep the 1:1 ratio
     *     width: 1,
     *     height: 1,
     *     isRegular: true
     * });
     * imageEditor.setDrawingShape('circle', { // When resizing, the shape keep the 1:1 ratio
     *     rx: 10,
     *     ry: 10,
     *     isRegular: true
     * });
     */
    setDrawingShape: function(type, options) {
        this._getComponent(components.SHAPE).setStates(type, options);
    },

    /**
     * Add shape
     * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.left] - Shape x position
     *      @param {number} [options.top] - Shape y position
     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
     * @api
     * @example
     * imageEditor.addShape('rect', {
     *     fill: 'red',
     *     stroke: 'blue',
     *     strokeWidth: 3,
     *     width: 100,
     *     height: 200,
     *     left: 10,
     *     top: 10,
     *     isRegular: true
     * });
     * imageEditor.addShape('circle', {
     *     fill: 'red',
     *     stroke: 'blue',
     *     strokeWidth: 3,
     *     rx: 10,
     *     ry: 100,
     *     isRegular: false
     * });
     */
    addShape: function(type, options) {
        this._getComponent(components.SHAPE).add(type, options);
    },

    /**
     * Change shape
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
     * @api
     * @example
     * // call after selecting shape object on canvas
     * imageEditor.changeShape({ // change rectagle or triangle
     *     fill: 'red',
     *     stroke: 'blue',
     *     strokeWidth: 3,
     *     width: 100,
     *     height: 200
     * });
     * imageEditor.changeShape({ // change circle
     *     fill: 'red',
     *     stroke: 'blue',
     *     strokeWidth: 3,
     *     rx: 10,
     *     ry: 100
     * });
     */
    changeShape: function(options) {
        var activeObj = this._canvas.getActiveObject();
        var shapeComponent = this._getComponent(components.SHAPE);

        if (!activeObj) {
            return;
        }

        shapeComponent.change(activeObj, options);
    },

    /**
     * End to draw shape on canvas (unbind event on canvas)
     * @api
     * @example
     * imageEditor.startDrawingShapeMode();
     * imageEditor.endDrawingShapeMode();
     */
    endDrawingShapeMode: function() {
        if (this.getCurrentState() === states.SHAPE) {
            this._getComponent(components.SHAPE).endDrawingMode();
            this._state = states.NORMAL;
        }
    },

    /**
     * Start text input mode
     * @api
     * @example
     * imageEditor.endTextMode();
     * imageEditor.startTextMode();
     */
    startTextMode: function() {
        if (this.getCurrentState() === states.TEXT) {
            return;
        }

        this.endAll();
        this._state = states.TEXT;

        this._getComponent(components.TEXT).start({
            mousedown: $.proxy(this._onFabricMouseDown, this),
            select: $.proxy(this._onFabricSelect, this),
            selectClear: $.proxy(this._onFabricSelectClear, this),
            dbclick: $.proxy(this._onDBClick, this),
            remove: this._removeEventHandler
        });
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

        this._getComponent(components.TEXT).add(text || '', options || {});
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

        this._getComponent(components.TEXT).change(activeObj, text);
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

        this._getComponent(components.TEXT).setStyle(activeObj, styleObj);
    },

    /**
     * End text input mode
     * @api
     * @example
     * imageEditor.startTextMode();
     * imageEditor.endTextMode();
     */
    endTextMode: function() {
        if (this.getCurrentState() !== states.TEXT) {
            return;
        }

        this._state = states.NORMAL;

        this._getComponent(components.TEXT).end();
    },

    /**
     * Double click event handler
     * @private
     */
    _onDBClick: function() {
        /**
         * @api
         * @event ImageEditor#editText
         * @example
         * imageEditor.on('editText', function(obj) {
         *     console.log('text object: ' + obj);
         * });
         */
        this.fire(events.EDIT_TEXT);
    },

     /**
      * Mousedown event handler
      * @param {fabric.Event} event - Current mousedown event object
      * @private
      */
    _onFabricMouseDown: function(event) { // eslint-disable-line
        var obj = event.target;
        var e = event.e || {};
        var originPointer = this._canvas.getPointer(e);
        var textComp = this._getComponent(components.TEXT);

        if (obj && !obj.isType('text')) {
            return;
        }

        if (textComp.isPrevEditing) {
            textComp.isPrevEditing = false;

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
                x: e.clientX || 0,
                y: e.clientY || 0
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
        this._getComponent(components.ICON).registerPaths(infos);
    },

    /**
     * Add icon on canvas
     * @api
     * @param {string} type - Icon type (arrow / cancel)
     * @example
     * imageEditor.addIcon('arrow');
     */
    addIcon: function(type) {
        this._getComponent(components.ICON).add(type);
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

        this._getComponent(components.ICON).setColor(color, activeObj);
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
    },

    /**
     * Whehter the undo stack is empty or not
     * @api
     * @returns {boolean}
     * imageEditor.isEmptyUndoStack();
     */
    isEmptyUndoStack: function() {
        return this._invoker.isEmptyUndoStack();
    },

    /**
     * Whehter the redo stack is empty or not
     * @api
     * @returns {boolean}
     * imageEditor.isEmptyRedoStack();
     */
    isEmptyRedoStack: function() {
        return this._invoker.isEmptyRedoStack();
    },

    /**
     * Resize canvas dimension
     * @param {{width: number, height: number}} dimension - Max width & height
     */
    resizeCanvasDimension: function(dimension) {
        var mainComponent = this._getMainComponent();

        if (!dimension) {
            return;
        }

        mainComponent.setCssMaxDimension(dimension);
        mainComponent.adjustCanvasDimension();
    },

    startDrawingIcon: function() {
        var iconComponent = this._getComponent(components.ICON);

        iconComponent.start();
    }
});

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;
