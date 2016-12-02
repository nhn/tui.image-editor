/*!
 * tui-image-editor.js
 * @version 1.4.0
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @license MIT
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	tui.util.defineNamespace('tui.component.ImageEditor', __webpack_require__(1), true);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Image-editor application class
	 */
	'use strict';

	var Invoker = __webpack_require__(2);
	var commandFactory = __webpack_require__(20);
	var consts = __webpack_require__(5);

	var events = consts.eventNames;
	var commands = consts.commandNames;
	var components = consts.componentNames;
	var states = consts.states;
	var keyCodes = consts.keyCodes;
	var fObjectOptions = consts.fObjectOptions;

	var util = tui.util;
	var isUndefined = util.isUndefined;
	var bind = util.bind;
	var forEach = util.forEach;

	/**
	 * Image editor
	 * @class
	 * @param {string|jQuery|HTMLElement} element - Wrapper or canvas element or selector
	 * @param {object} [option] - Canvas max width & height of css
	 *  @param {number} option.cssMaxWidth - Canvas css-max-width
	 *  @param {number} option.cssMaxHeight - Canvas css-max-height
	 */
	var ImageEditor = tui.util.defineClass(/** @lends ImageEditor.prototype */{
	    init: function(element, option) {
	        option = option || {};
	        /**
	         * Invoker
	         * @type {Invoker}
	         * @private
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

	        /**
	         * Event handler list
	         * @type {object}
	         * @private
	         */
	        this._handlers = {
	            keydown: bind(this._onKeyDown, this),
	            mousedown: bind(this._onMouseDown, this),
	            addedObject: bind(this._onAddedObject, this),
	            removedObject: bind(this._onRemovedObject, this),
	            selectedObject: bind(this._onSelectedObject, this),
	            movingObject: bind(this._onMovingObject, this),
	            scalingObject: bind(this._onScalingObject, this),
	            createdPath: this._onCreatedPath
	        };

	        this._setCanvas(element, option.cssMaxWidth, option.cssMaxHeight);
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
	         * @event ImageEditor#pushUndoStack
	         */
	        this._invoker.on(PUSH_UNDO_STACK, $.proxy(this.fire, this, PUSH_UNDO_STACK));
	        /**
	         * @event ImageEditor#pushRedoStack
	         */
	        this._invoker.on(PUSH_REDO_STACK, $.proxy(this.fire, this, PUSH_REDO_STACK));
	        /**
	         * @event ImageEditor#emptyUndoStack
	         */
	        this._invoker.on(EMPTY_UNDO_STACK, $.proxy(this.fire, this, EMPTY_UNDO_STACK));
	        /**
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
	            'mouse:down': this._handlers.mousedown,
	            'object:added': this._handlers.addedObject,
	            'object:removed': this._handlers.removedObject,
	            'object:moving': this._handlers.movingObject,
	            'object:scaling': this._handlers.scalingObject,
	            'object:selected': this._handlers.selectedObject,
	            'path:created': this._handlers.createdPath
	        });
	    },

	    /**
	     * Attach dom events
	     * @private
	     */
	    _attachDomEvents: function() {
	        fabric.util.addListener(document, 'keydown', this._handlers.keydown);
	    },

	    /**
	     * Detach dom events
	     * @private
	     */
	    _detachDomEvents: function() {
	        fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
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
	     * "mouse:down" canvas event handler
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onMouseDown: function(fEvent) {
	        var originPointer = this._canvas.getPointer(fEvent.e);

	        /**
	         * @event ImageEditor#mousedown
	         * @param {object} event - Event object
	         * @example
	         * imageEditor.on('mousedown', function(event) {
	         *     console.log(event.e);
	         *     console.log(event.originPointer);
	         * });
	         */
	        this.fire(events.MOUSE_DOWN, {
	            e: fEvent.e,
	            originPointer: originPointer
	        });
	    },

	    /**
	     * "object:added" canvas event handler
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onAddedObject: function(fEvent) {
	        var obj = fEvent.target;
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
	         * @event ImageEditor#addedObject
	         * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	         * @example
	         * imageEditor.on('addedObject', function(obj) {
	         *     console.log(obj);
	         * });
	         */
	        this.fire(events.ADD_OBJECT, obj);
	    },

	    /**
	     * "object:removed" canvas event handler
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onRemovedObject: function(fEvent) {
	        /**
	         * @event ImageEditor#removedObject
	         * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	         * @example
	         * imageEditor.on('removedObject', function(obj) {
	         *     console.log(obj);
	         * });
	         */
	        this.fire(events.REMOVE_OBJECT, fEvent.target);
	    },

	    /**
	     * "object:selected" canvas event handler
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onSelectedObject: function(fEvent) {
	        /**
	         * @event ImageEditor#selectObject
	         * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	         * @example
	         * imageEditor.on('selectObject', function(obj) {
	         *     console.log(obj);
	         *     console.log(obj.type);
	         * });
	         */
	        this.fire(events.SELECT_OBJECT, fEvent.target);
	    },

	    /**
	     * "object:moving" canvas event handler
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onMovingObject: function(fEvent) {
	        /**
	         * @event ImageEditor#adjustObject
	         * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	         * @param {string} Action type (move / scale)
	         * @example
	         * imageEditor.on('adjustObject', function(obj, type) {
	         *     console.log(obj);
	         *     console.log(type);
	         * });
	         */
	        this.fire(events.ADJUST_OBJECT, fEvent.target, 'move');
	    },

	    /**
	     * "object:scaling" canvas event handler
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
	     */
	    _onScalingObject: function(fEvent) {
	        /**
	         * @ignore
	         * @event ImageEditor#adjustObject
	         * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	         * @param {string} Action type (move / scale)
	         * @example
	         * imageEditor.on('adjustObject', function(obj, type) {
	         *     console.log(obj);
	         *     console.log(type);
	         * });
	         */
	        this.fire(events.ADJUST_OBJECT, fEvent.target, 'move');
	    },

	    /**
	     * EventListener - "path:created"
	     *  - Events:: "object:added" -> "path:created"
	     * @param {{path: fabric.Path}} obj - Path object
	     * @private
	     */
	    _onCreatedPath: function(obj) {
	        obj.path.set(consts.fObjectOptions.SELECTION_STYLE);
	    },

	    /**
	     * onSelectClear handler in fabric canvas
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	     * @private
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
	     * @private
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
	     * Set canvas element
	     * @param {string|jQuery|HTMLElement} element - Wrapper or canvas element or selector
	     * @param {number} cssMaxWidth - Canvas css max width
	     * @param {number} cssMaxHeight - Canvas css max height
	     * @private
	     */
	    _setCanvas: function(element, cssMaxWidth, cssMaxHeight) {
	        var mainComponent;

	        mainComponent = this._getMainComponent();
	        mainComponent.setCanvasElement(element);
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
	     * @example
	     * imageEditor.clearObjects();
	     */
	    clearObjects: function() {
	        var command = commandFactory.create(commands.CLEAR_OBJECTS);
	        var callback = $.proxy(this.fire, this, events.CLEAR_OBJECTS);

	        /**
	         * @event ImageEditor#clearObjects
	         */
	        command.setExecuteCallback(callback);
	        this.execute(command);
	    },

	    /**
	     * End current action & Deactivate
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
	     * @ignore
	     */
	    execute: function(command) {
	        this.endAll();
	        this._invoker.invoke(command);
	    },

	    /**
	     * Undo
	     * @example
	     * imageEditor.undo();
	     */
	    undo: function() {
	        this.endAll();
	        this._invoker.undo();
	    },

	    /**
	     * Redo
	     * @example
	     * imageEditor.redo();
	     */
	    redo: function() {
	        this.endAll();
	        this._invoker.redo();
	    },

	    /**
	     * Load image from file
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
	         * @event ImageEditor#startCropping
	         */
	        this.fire(events.START_CROPPING);
	    },

	    /**
	     * Apply cropping
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
	     * @example
	     * imageEditor.flipX();
	     */
	    flipX: function() {
	        this._flip('flipX');
	    },

	    /**
	     * Flip y
	     * @example
	     * imageEditor.flipY();
	     */
	    flipY: function() {
	        this._flip('flipY');
	    },

	    /**
	     * Reset flip
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
	         * @event ImageEditor#startFreeDrawing
	         */
	        this.fire(events.START_FREE_DRAWING);
	    },

	    /**
	     * Set drawing brush
	     * @param {{width: number, color: string}} setting - Brush width & color
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
	         * @event ImageEditor#endFreeDrawing
	         */
	        this.fire(events.END_FREE_DRAWING);
	    },

	    /**
	     * Start line-drawing mode
	     * @param {{width: number, color: string}} [setting] - Brush width & color
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
	         * @event ImageEditor#startLineDrawing
	         */
	        this.fire(events.START_LINE_DRAWING);
	    },

	    /**
	     * End line-drawing mode
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
	         * @event ImageEditor#endLineDrawing
	         */
	        this.fire(events.END_LINE_DRAWING);
	    },

	    /**
	     * Start to draw shape on canvas (bind event on canvas)
	     * @example
	     * imageEditor.startDrawingShapeMode();
	     */
	    startDrawingShapeMode: function() {
	        if (this.getCurrentState() !== states.SHAPE) {
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
	     *      @param {string} [options.stroke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     *      @param {number} [options.left] - Shape x position
	     *      @param {number} [options.top] - Shape y position
	     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
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
	        options = options || {};

	        this._setPositions(options);
	        this._getComponent(components.SHAPE).add(type, options);
	    },

	    /**
	     * Change shape
	     * @param {object} options - Shape options
	     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	     *      @param {string} [options.stroke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
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
	     * @example
	     * imageEditor.endTextMode();
	     * imageEditor.startTextMode();
	     */
	    startTextMode: function() {
	        if (this.getCurrentState() !== states.TEXT) {
	            this._state = states.TEXT;

	            this._getComponent(components.TEXT).start({
	                mousedown: $.proxy(this._onFabricMouseDown, this),
	                select: $.proxy(this._onFabricSelect, this),
	                selectClear: $.proxy(this._onFabricSelectClear, this),
	                dbclick: $.proxy(this._onDBClick, this),
	                remove: this._handlers.removedObject
	            });
	        }
	    },

	    /**
	     * Add text on image
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
	     * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
	     * @param {object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     * @example
	     * imageEditor.addIcon('arrow'); // The position is center on canvas
	     * imageEditor.addIcon('arrow', {
	     *     left: 100,
	     *     top: 100
	     * });
	     */
	    addIcon: function(type, options) {
	        options = options || {};

	        this._setPositions(options);
	        this._getComponent(components.ICON).add(type, options);
	    },

	    /**
	     * Change icon color
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
	     * @returns {string} image name
	     * @example
	     * console.log(imageEditor.getImageName());
	     */
	    getImageName: function() {
	        return this._getMainComponent().getImageName();
	    },

	    /**
	     * Clear undoStack
	     * @example
	     * imageEditor.clearUndoStack();
	     */
	    clearUndoStack: function() {
	        this._invoker.clearUndoStack();
	    },

	    /**
	     * Clear redoStack
	     * @example
	     * imageEditor.clearRedoStack();
	     */
	    clearRedoStack: function() {
	        this._invoker.clearRedoStack();
	    },

	    /**
	     * Whehter the undo stack is empty or not
	     * @returns {boolean}
	     * imageEditor.isEmptyUndoStack();
	     */
	    isEmptyUndoStack: function() {
	        return this._invoker.isEmptyUndoStack();
	    },

	    /**
	     * Whehter the redo stack is empty or not
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

	    /**
	     * Destroy
	     */
	    destroy: function() {
	        var wrapperEl = this._canvas.wrapperEl;

	        this.endAll();
	        this._detachDomEvents();

	        this._canvas.clear();

	        wrapperEl.parentNode.removeChild(wrapperEl);

	        forEach(this, function(value, key) {
	            this[key] = null;
	        }, this);
	    },

	    /**
	     * Set position
	     * @param {object} options - Position options (left or top)
	     * @private
	     */
	    _setPositions: function(options) {
	        var centerPosition = this._canvas.getCenter();

	        if (isUndefined(options.left)) {
	            options.left = centerPosition.left;
	        }

	        if (isUndefined(options.top)) {
	            options.top = centerPosition.top;
	        }
	    }
	});

	tui.util.CustomEvents.mixin(ImageEditor);
	module.exports = ImageEditor;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Invoker - invoke commands
	 */
	'use strict';

	var ImageLoader = __webpack_require__(3);
	var Cropper = __webpack_require__(7);
	var MainComponent = __webpack_require__(9);
	var Flip = __webpack_require__(10);
	var Rotation = __webpack_require__(11);
	var FreeDrawing = __webpack_require__(12);
	var Line = __webpack_require__(13);
	var Text = __webpack_require__(14);
	var Icon = __webpack_require__(15);
	var Filter = __webpack_require__(16);
	var Shape = __webpack_require__(18);
	var eventNames = __webpack_require__(5).eventNames;

	/**
	 * Invoker
	 * @class
	 * @ignore
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
	        this._register(new Shape(main));
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Image loader
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

	var imageOption = {
	    padding: 0,
	    crossOrigin: 'anonymous'
	};

	/**
	 * ImageLoader components
	 * @extends {Component}
	 * @class ImageLoader
	 * @param {Component} parent - parent component
	 * @ignore
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


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Component interface
	 */
	'use strict';

	/**
	 * Component interface
	 * @class
	 * @ignore
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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Constants
	 */
	'use strict';

	var util = __webpack_require__(6);

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
	        'FILTER',
	        'SHAPE'
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
	        SELECT_OBJECT: 'selectObject',
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
	        APPLY_FILTER: 'applyFilter',
	        EDIT_TEXT: 'editText',
	        MOUSE_DOWN: 'mousedown'
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
	        'TEXT',
	        'SHAPE'
	    ),

	    /**
	     * Shortcut key values
	     * @type {Object.<string, number>}
	     */
	    keyCodes: {
	        Z: 90,
	        Y: 89,
	        SHIFT: 16,
	        BACKSPACE: 8,
	        DEL: 46
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
	            transparentCorners: false
	        }
	    }
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

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
	    },

	    /**
	     * Make CSSText
	     * @param {object} styleObj - Style info object
	     * @returns {string} Connected string of style
	     */
	    makeStyleText: function(styleObj) {
	        var styleStr = '';

	        tui.util.forEach(styleObj, function(value, prop) {
	            styleStr += prop + ': ' + value + ';';
	        });

	        return styleStr;
	    }
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Image crop module (start cropping, end cropping)
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var Cropzone = __webpack_require__(8);
	var consts = __webpack_require__(5);
	var util = __webpack_require__(6);

	var MOUSE_MOVE_THRESHOLD = 10;

	var abs = Math.abs;
	var clamp = util.clamp;
	var keyCodes = consts.keyCodes;

	/**
	 * Cropper components
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @class Cropper
	 * @ignore
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


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Cropzone extending fabric.Rect
	 */
	'use strict';

	var clamp = __webpack_require__(6).clamp;

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
	 * @ignore
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
	     * @ignore
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


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Main component having canvas & image, set css-max-dimension of canvas
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

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
	 * @class Main
	 * @extends {Component}
	 * @ignore
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
	     * @param {jQuery|Element|string} element - Wrapper or canvas element or selector
	     * @override
	     */
	    setCanvasElement: function(element) {
	        var canvasElement = $(element)[0];

	        if (canvasElement.nodeName.toUpperCase() !== 'CANVAS') {
	            canvasElement = $('<canvas>').appendTo(element)[0];
	        }

	        this.canvas = new fabric.Canvas(canvasElement, {
	            containerClass: 'tui-image-editor-canvas-container',
	            enableRetinaScaling: false
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Image flip module
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

	/**
	 * Flip
	 * @class Flip
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
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


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Image rotation module
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

	/**
	 * Image Rotation component
	 * @class Rotation
	 * @extends {Component}
	 * @param {Component} parent - parent component
	 * @ignore
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


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Free drawing module, Set brush
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

	/**
	 * FreeDrawing
	 * @class FreeDrawing
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
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


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Free drawing module, Set brush
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

	/**
	 * Line
	 * @class Line
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
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


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Text module
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);
	var util = __webpack_require__(6);

	var defaultStyles = {
	    fill: '#000000',
	    left: 0,
	    top: 0
	};
	var resetStyles = {
	    fill: '#000000',
	    fontStyle: 'normal',
	    fontWeight: 'normal',
	    textAlign: 'left',
	    textDecoraiton: ''
	};
	var browser = tui.util.browser;

	var TEXTAREA_CLASSNAME = 'tui-image-eidtor-textarea';
	var TEXTAREA_STYLES = util.makeStyleText({
	    position: 'absolute',
	    padding: 0,
	    display: 'none',
	    border: '1px dotted red',
	    overflow: 'hidden',
	    resize: 'none',
	    outline: 'none',
	    'border-radius': 0,
	    'background-color': 'transparent',
	    '-webkit-appearance': 'none',
	    'z-index': 9999,
	    'white-space': 'pre'
	});
	var EXTRA_PIXEL_LINEHEIGHT = 0.1;
	var DBCLICK_TIME = 500;

	/**
	 * Text
	 * @class Text
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */
	var Text = tui.util.defineClass(Component, /** @lends Text.prototype */{
	    init: function(parent) {
	        this.setParent(parent);

	        /**
	         * Default text style
	         * @type {object}
	         */
	        this._defaultStyles = defaultStyles;

	        /**
	         * Selected state
	         * @type {boolean}
	         */
	        this._isSelected = false;

	        /**
	         * Selected text object
	         * @type {object}
	         */
	        this._selectedObj = {};

	        /**
	         * Editing text object
	         * @type {object}
	         */
	        this._editingObj = {};

	        /**
	         * Listeners for fabric event
	         * @type {object}
	         */
	        this._listeners = {};

	        /**
	         * Textarea element for editing
	         * @type {HTMLElement}
	         */
	        this._textarea = null;

	        /**
	         * Ratio of current canvas
	         * @type {number}
	         */
	        this._ratio = 1;

	        /**
	         * Last click time
	         * @type {Date}
	         */
	        this._lastClickTime = (new Date()).getTime();

	        /**
	         * Text object infos before editing
	         * @type {Object}
	         */
	        this._editingObjInfos = {};

	        /**
	         * Previous state of editing
	         * @type {boolean}
	         */
	        this.isPrevEditing = false;
	    },

	    /**
	     * Component name
	     * @type {string}
	     */
	    name: consts.componentNames.TEXT,

	    /**
	     * Start input text mode
	     * @param {object} listeners - Callback functions of fabric event
	     */
	    start: function(listeners) {
	        var canvas = this.getCanvas();

	        this._listeners = listeners;

	        canvas.selection = false;
	        canvas.defaultCursor = 'text';
	        canvas.on({
	            'mouse:down': this._listeners.mousedown,
	            'object:selected': this._listeners.select,
	            'before:selection:cleared': this._listeners.selectClear,
	            'object:scaling': this._onFabricScaling
	        });

	        this._createTextarea();

	        this.setCanvasRatio();
	    },

	    /**
	     * End input text mode
	     */
	    end: function() {
	        var canvas = this.getCanvas();

	        canvas.selection = true;
	        canvas.defaultCursor = 'default';
	        canvas.deactivateAllWithDispatch(); // action for undo stack
	        canvas.off({
	            'mouse:down': this._listeners.mousedown,
	            'object:selected': this._listeners.select,
	            'before:selection:cleared': this._listeners.selectClear,
	            'object:scaling': this._onFabricScaling
	        });

	        this._removeTextarea();

	        this._listeners = {};
	    },

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

	        this._setInitPos(options.position);

	        if (options.styles) {
	            styles = tui.util.extend(options.styles, styles);
	        }

	        newText = new fabric.Text(text, styles);

	        newText.set(consts.fObjectOptions.SELECTION_STYLE);

	        newText.on({
	            mouseup: $.proxy(this._onFabricMouseUp, this)
	        });

	        canvas.add(newText);

	        if (!canvas.getActiveObject()) {
	            canvas.setActiveObject(newText);
	        }

	        this.isPrevEditing = true;
	    },

	    /**
	     * Change text of activate object on canvas image
	     * @param {object} activeObj - Current selected text object
	     * @param {string} text - Changed text
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
	     * Set infos of the current selected object
	     * @param {fabric.Text} obj - Current selected text object
	     * @param {boolean} state - State of selecting
	     */
	    setSelectedInfo: function(obj, state) {
	        this._selectedObj = obj;
	        this._isSelected = state;
	    },

	    /**
	     * Whether object is selected or not
	     * @returns {boolean} State of selecting
	     */
	    isSelected: function() {
	        return this._isSelected;
	    },

	    /**
	     * Get current selected text object
	     * @returns {fabric.Text} Current selected text object
	     */
	    getSelectedObj: function() {
	        return this._selectedObj;
	    },

	    /**
	     * Set ratio value of canvas
	     */
	    setCanvasRatio: function() {
	        var canvasElement = this.getCanvasElement();
	        var cssWidth = parseInt(canvasElement.style.maxWidth, 10);
	        var originWidth = canvasElement.width;
	        var ratio = originWidth / cssWidth;

	        this._ratio = ratio;
	    },

	    /**
	     * Get ratio value of canvas
	     * @returns {number} Ratio value
	     */
	    getCanvasRatio: function() {
	        return this._ratio;
	    },

	    /**
	     * Set initial position on canvas image
	     * @param {{x: number, y: number}} [position] - Selected position
	     * @private
	     */
	    _setInitPos: function(position) {
	        position = position || this.getCanvasImage().getCenterPoint();

	        this._defaultStyles.left = position.x;
	        this._defaultStyles.top = position.y;
	    },

	    /**
	     * Create textarea element on canvas container
	     * @private
	     */
	    _createTextarea: function() {
	        var container = this.getCanvasElement().parentNode;
	        var textarea = document.createElement('textarea');

	        textarea.className = TEXTAREA_CLASSNAME;
	        textarea.setAttribute('style', TEXTAREA_STYLES);
	        textarea.setAttribute('wrap', 'off');

	        container.appendChild(textarea);

	        this._textarea = textarea;

	        this._listeners = tui.util.extend(this._listeners, {
	            input: tui.util.bind(this._onInput, this),
	            keydown: tui.util.bind(this._onKeyDown, this),
	            blur: tui.util.bind(this._onBlur, this),
	            scroll: tui.util.bind(this._onScroll, this)
	        });

	        if (browser.msie && browser.version === 9) {
	            fabric.util.addListener(textarea, 'keydown', this._listeners.keydown);
	        } else {
	            fabric.util.addListener(textarea, 'input', this._listeners.input);
	        }
	        fabric.util.addListener(textarea, 'blur', this._listeners.blur);
	        fabric.util.addListener(textarea, 'scroll', this._listeners.scroll);
	    },

	    /**
	     * Remove textarea element on canvas container
	     * @private
	     */
	    _removeTextarea: function() {
	        var container = this.getCanvasElement().parentNode;
	        var textarea = container.querySelector('textarea');

	        container.removeChild(textarea);

	        this._textarea = null;

	        if (browser.msie && browser.version < 10) {
	            fabric.util.removeListener(textarea, 'keydown', this._listeners.keydown);
	        } else {
	            fabric.util.removeListener(textarea, 'input', this._listeners.input);
	        }
	        fabric.util.removeListener(textarea, 'blur', this._listeners.blur);
	        fabric.util.removeListener(textarea, 'scroll', this._listeners.scroll);
	    },

	    /**
	     * Input event handler
	     * @private
	     */
	    _onInput: function() {
	        var ratio = this.getCanvasRatio();
	        var obj = this._editingObj;
	        var textareaStyle = this._textarea.style;

	        obj.setText(this._textarea.value);

	        textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	        textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	    },

	    /**
	     * Keydown event handler
	     * @private
	     */
	    _onKeyDown: function() {
	        var ratio = this.getCanvasRatio();
	        var obj = this._editingObj;
	        var textareaStyle = this._textarea.style;
	        var self = this;

	        setTimeout(function() {
	            obj.setText(self._textarea.value);

	            textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	            textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	        }, 0);
	    },

	    /**
	     * Blur event handler
	     * @private
	     */
	    _onBlur: function() {
	        var ratio = this.getCanvasRatio();
	        var editingObj = this._editingObj;
	        var editingObjInfos = this._editingObjInfos;
	        var transWidth = (editingObj.getWidth() / ratio) - (editingObjInfos.width / ratio);
	        var transHeight = (editingObj.getHeight() / ratio) - (editingObjInfos.height / ratio);

	        if (ratio === 1) {
	            transWidth /= 2;
	            transHeight /= 2;
	        }

	        this._textarea.style.display = 'none';

	        this._editingObj.set({
	            left: editingObjInfos.left + transWidth,
	            top: editingObjInfos.top + transHeight
	        });

	        this.getCanvas().add(this._editingObj);

	        this.getCanvas().on('object:removed', this._listeners.remove);
	    },

	    /**
	     * Scroll event handler
	     * @private
	     */
	    _onScroll: function() {
	        this._textarea.scrollLeft = 0;
	        this._textarea.scrollTop = 0;
	    },

	    /**
	     * Fabric scaling event handler
	     * @param {fabric.Event} fEvent - Current scaling event on selected object
	     * @private
	     */
	    _onFabricScaling: function(fEvent) {
	        var obj = fEvent.target;
	        var scalingSize = obj.getFontSize() * obj.getScaleY();

	        obj.setFontSize(scalingSize);
	        obj.setScaleX(1);
	        obj.setScaleY(1);
	    },

	    /**
	     * Fabric mouseup event handler
	     * @param {fabric.Event} fEvent - Current mousedown event on selected object
	     * @private
	     */
	    _onFabricMouseUp: function(fEvent) {
	        var newClickTime = (new Date()).getTime();

	        if (this._isDoubleClick(newClickTime)) {
	            this._changeToEditingMode(fEvent.target);
	            this._listeners.dbclick(); // fire dbclick event
	        }

	        this._lastClickTime = newClickTime;
	    },

	    /**
	     * Get state of firing double click event
	     * @param {Date} newClickTime - Current clicked time
	     * @returns {boolean} Whether double clicked or not
	     * @private
	     */
	    _isDoubleClick: function(newClickTime) {
	        return (newClickTime - this._lastClickTime < DBCLICK_TIME);
	    },

	    /**
	     * Change state of text object for editing
	     * @param {fabric.Text} obj - Text object fired event
	     * @private
	     */
	    _changeToEditingMode: function(obj) {
	        var ratio = this.getCanvasRatio();
	        var textareaStyle = this._textarea.style;

	        this.isPrevEditing = true;

	        this.getCanvas().off('object:removed', this._listeners.remove);

	        obj.remove();

	        this._editingObj = obj;
	        this._textarea.value = obj.getText();

	        this._editingObjInfos = {
	            left: this._editingObj.getLeft(),
	            top: this._editingObj.getTop(),
	            width: this._editingObj.getWidth(),
	            height: this._editingObj.getHeight()
	        };

	        textareaStyle.display = 'block';
	        textareaStyle.left = (obj.oCoords.tl.x / ratio) + 'px';
	        textareaStyle.top = (obj.oCoords.tl.y / ratio) + 'px';
	        textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	        textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	        textareaStyle.transform = 'rotate(' + obj.getAngle() + 'deg)';
	        textareaStyle.color = obj.getFill();

	        textareaStyle['font-size'] = (obj.getFontSize() / ratio) + 'px';
	        textareaStyle['font-family'] = obj.getFontFamily();
	        textareaStyle['font-style'] = obj.getFontStyle();
	        textareaStyle['font-weight'] = obj.getFontWeight();
	        textareaStyle['text-align'] = obj.getTextAlign();
	        textareaStyle['line-height'] = obj.getLineHeight() + EXTRA_PIXEL_LINEHEIGHT;
	        textareaStyle['transform-origin'] = 'left top';

	        this._textarea.focus();
	    }
	});

	module.exports = Text;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Add icon module
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);

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
	 * @ignore
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
	     * @param {object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     */
	    add: function(type, options) {
	        var canvas = this.getCanvas();
	        var path = this._pathMap[type];
	        var selectionStyle = consts.fObjectOptions.SELECTION_STYLE;
	        var icon;

	        if (!path) {
	            return;
	        }

	        icon = this._createIcon(path);

	        icon.set(tui.util.extend({
	            type: 'icon',
	            fill: this._oColor
	        }, selectionStyle, options));

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


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Add filter module
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var Mask = __webpack_require__(17);
	var consts = __webpack_require__(5);

	/**
	 * Filter
	 * @class Filter
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
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
	            case 'removeWhite':
	                filterObj = new fabric.Image.filters.RemoveWhite(options);
	                break;
	            default:
	                filterObj = null;
	        }

	        return filterObj;
	    }
	});

	module.exports = Filter;


/***/ },
/* 17 */
/***/ function(module, exports) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Mask extending fabric.Image.filters.Mask
	 */
	'use strict';

	/**
	 * Mask object
	 * @class Mask
	 * @extends {fabric.Image.filters.Mask}
	 * @ignore
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

	        this._drawMask(maskCtx, canvasEl, ctx);

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
	        var left, top, angle;
	        var mask = this.mask;
	        var maskImg = mask.getElement();

	        left = mask.getLeft();
	        top = mask.getTop();
	        angle = mask.getAngle();

	        maskCtx.save();
	        maskCtx.translate(left, top);
	        maskCtx.rotate(angle * Math.PI / 180);
	        maskCtx.scale(mask.scaleX, mask.scaleY);
	        maskCtx.drawImage(maskImg, -maskImg.width / 2, -maskImg.height / 2);
	        maskCtx.restore();
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


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Shape component
	 */
	'use strict';

	var Component = __webpack_require__(4);
	var consts = __webpack_require__(5);
	var resizeHelper = __webpack_require__(19);

	var util = tui.util;
	var extend = util.extend;
	var bind = util.bind;
	var inArray = util.inArray;

	var KEY_CODES = consts.keyCodes;
	var DEFAULT_TYPE = 'rect';
	var DEFAULT_OPTIONS = {
	    strokeWidth: 1,
	    stroke: '#000000',
	    fill: '#ffffff',
	    width: 1,
	    height: 1,
	    rx: 0,
	    ry: 0,
	    lockSkewingX: true,
	    lockSkewingY: true,
	    lockUniScaling: false,
	    bringForward: true,
	    isRegular: false
	};

	var shapeType = ['rect', 'circle', 'triangle'];

	/**
	 * Shape
	 * @class Shape
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */
	var Shape = tui.util.defineClass(Component, /** @lends Shape.prototype */{
	    init: function(parent) {
	        this.setParent(parent);

	        /**
	         * Object of The drawing shape
	         * @type {fabric.Object}
	         * @private
	         */
	        this._shapeObj = null;

	        /**
	         * Type of the drawing shape
	         * @type {string}
	         * @private
	         */
	        this._type = DEFAULT_TYPE;

	        /**
	         * Options to draw the shape
	         * @type {object}
	         * @private
	         */
	        this._options = DEFAULT_OPTIONS;

	        /**
	         * Whether the shape object is selected or not
	         * @type {boolean}
	         * @private
	         */
	        this._isSelected = false;

	        /**
	         * Pointer for drawing shape (x, y)
	         * @type {object}
	         * @private
	         */
	        this._startPoint = {};

	        /**
	         * Using shortcut on drawing shape
	         * @type {boolean}
	         * @private
	         */
	        this._withShiftKey = false;


	        /**
	         * Event handler list
	         * @type {object}
	         * @private
	         */
	        this._handlers = {
	            mousedown: bind(this._onFabricMouseDown, this),
	            mousemove: bind(this._onFabricMouseMove, this),
	            mouseup: bind(this._onFabricMouseUp, this),
	            keydown: bind(this._onKeyDown, this),
	            keyup: bind(this._onKeyUp, this)
	        };
	    },

	    /**
	     * Component name
	     * @type {string}
	     */
	    name: consts.componentNames.SHAPE,

	    /**
	     * Start to draw the shape on canvas
	     * @ignore
	     */
	    startDrawingMode: function() {
	        var canvas = this.getCanvas();

	        this._isSelected = false;

	        canvas.defaultCursor = 'crosshair';
	        canvas.selection = false;
	        canvas.uniScaleTransform = true;
	        canvas.on({
	            'mouse:down': this._handlers.mousedown
	        });

	        fabric.util.addListener(document, 'keydown', this._handlers.keydown);
	        fabric.util.addListener(document, 'keyup', this._handlers.keyup);
	    },

	    /**
	     * End to draw the shape on canvas
	     * @ignore
	     */
	    endDrawingMode: function() {
	        var canvas = this.getCanvas();

	        this._isSelected = false;

	        canvas.defaultCursor = 'default';
	        canvas.selection = true;
	        canvas.uniScaleTransform = false;
	        canvas.off({
	            'mouse:down': this._handlers.mousedown
	        });

	        fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
	        fabric.util.removeListener(document, 'keyup', this._handlers.keyup);
	    },

	    /**
	     * Set states of the current drawing shape
	     * @ignore
	     * @param {string} type - Shape type (ex: 'rect', 'circle')
	     * @param {object} [options] - Shape options
	     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	     *      @param {string} [options.stoke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     */
	    setStates: function(type, options) {
	        this._type = type;

	        if (options) {
	            this._options = extend(this._options, options);
	        }
	    },

	    /**
	     * Add the shape
	     * @ignore
	     * @param {string} type - Shape type (ex: 'rect', 'circle')
	     * @param {object} options - Shape options
	     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	     *      @param {string} [options.stroke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
	     */
	    add: function(type, options) {
	        var canvas = this.getCanvas();
	        var shapeObj;

	        options = this._createOptions(options);
	        shapeObj = this._createInstance(type, options);

	        this._bindEventOnShape(shapeObj);

	        canvas.add(shapeObj);
	    },

	    /**
	     * Change the shape
	     * @ignore
	     * @param {fabric.Object} shapeObj - Selected shape object on canvas
	     * @param {object} options - Shape options
	     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	     *      @param {string} [options.stroke] - Shape outline color
	     *      @param {number} [options.strokeWidth] - Shape outline width
	     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	     *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
	     */
	    change: function(shapeObj, options) {
	        if (inArray(shapeObj.get('type'), shapeType) < 0) {
	            return;
	        }

	        shapeObj.set(options);
	        this.getCanvas().renderAll();
	    },

	    /**
	     * Create the instance of shape
	     * @param {string} type - Shape type
	     * @param {object} options - Options to creat the shape
	     * @returns {fabric.Object} Shape instance
	     * @private
	     */
	    _createInstance: function(type, options) {
	        var instance;

	        switch (type) {
	            case 'rect':
	                instance = new fabric.Rect(options);
	                break;
	            case 'circle':
	                instance = new fabric.Ellipse(extend({
	                    type: 'circle'
	                }, options));
	                break;
	            case 'triangle':
	                instance = new fabric.Triangle(options);
	                break;
	            default:
	                instance = {};
	        }

	        return instance;
	    },

	    /**
	     * Get the options to create the shape
	     * @param {object} options - Options to creat the shape
	     * @returns {object} Shape options
	     * @private
	     */
	    _createOptions: function(options) {
	        var selectionStyles = consts.fObjectOptions.SELECTION_STYLE;

	        options = extend({}, DEFAULT_OPTIONS, selectionStyles, options);

	        if (options.isRegular) {
	            options.lockUniScaling = true;
	        }

	        return options;
	    },

	    /**
	     * Bind fabric events on the creating shape object
	     * @param {fabric.Object} shapeObj - Shape object
	     * @private
	     */
	    _bindEventOnShape: function(shapeObj) {
	        var self = this;
	        var canvas = this.getCanvas();

	        shapeObj.on({
	            added: function() {
	                self._shapeObj = this;
	                resizeHelper.setOrigins(self._shapeObj);
	            },
	            selected: function() {
	                self._isSelected = true;
	                self._shapeObj = this;
	                canvas.uniScaleTransform = true;
	                canvas.defaultCursor = 'default';
	                resizeHelper.setOrigins(self._shapeObj);
	            },
	            deselected: function() {
	                self._isSelected = false;
	                self._shapeObj = null;
	                canvas.defaultCursor = 'crosshair';
	                canvas.uniScaleTransform = false;
	            },
	            modified: function() {
	                var currentObj = self._shapeObj;

	                resizeHelper.adjustOriginToCenter(currentObj);
	                resizeHelper.setOrigins(currentObj);
	            },
	            scaling: function(fEvent) {
	                var pointer = canvas.getPointer(fEvent.e);
	                var currentObj = self._shapeObj;

	                canvas.setCursor('crosshair');
	                resizeHelper.resize(currentObj, pointer, true);
	            }
	        });
	    },

	    /**
	     * MouseDown event handler on canvas
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	     * @private
	     */
	    _onFabricMouseDown: function(fEvent) {
	        var canvas;

	        if (!this._isSelected && !this._shapeObj) {
	            canvas = this.getCanvas();
	            this._startPoint = canvas.getPointer(fEvent.e);

	            canvas.on({
	                'mouse:move': this._handlers.mousemove,
	                'mouse:up': this._handlers.mouseup
	            });
	        }
	    },

	    /**
	     * MouseDown event handler on canvas
	     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	     * @private
	     */
	    _onFabricMouseMove: function(fEvent) {
	        var canvas = this.getCanvas();
	        var pointer = canvas.getPointer(fEvent.e);
	        var startPointX = this._startPoint.x;
	        var startPointY = this._startPoint.y;
	        var width = startPointX - pointer.x;
	        var height = startPointY - pointer.y;
	        var shape = this._shapeObj;

	        if (!shape) {
	            this.add(this._type, {
	                left: startPointX,
	                top: startPointY,
	                width: width,
	                height: height
	            });
	        } else {
	            this._shapeObj.set({
	                isRegular: this._withShiftKey
	            });
	            resizeHelper.resize(shape, pointer);
	            canvas.renderAll();
	        }
	    },

	    /**
	     * MouseUp event handler on canvas
	     * @private
	     */
	    _onFabricMouseUp: function() {
	        var canvas = this.getCanvas();
	        var shape = this._shapeObj;

	        if (shape) {
	            resizeHelper.adjustOriginToCenter(shape);
	        }

	        this._shapeObj = null;

	        canvas.off({
	            'mouse:move': this._handlers.mousemove,
	            'mouse:up': this._handlers.mouseup
	        });
	    },

	    /**
	     * Keydown event handler on document
	     * @param {KeyboardEvent} e - Event object
	     * @private
	     */
	    _onKeyDown: function(e) {
	        if (e.keyCode === KEY_CODES.SHIFT) {
	            this._withShiftKey = true;

	            if (this._shapeObj) {
	                this._shapeObj.isRegular = true;
	            }
	        }
	    },

	    /**
	     * Keyup event handler on document
	     * @param {KeyboardEvent} e - Event object
	     * @private
	     */
	    _onKeyUp: function(e) {
	        if (e.keyCode === KEY_CODES.SHIFT) {
	            this._withShiftKey = false;

	            if (this._shapeObj) {
	                this._shapeObj.isRegular = false;
	            }
	        }
	    }
	});

	module.exports = Shape;


/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Shape resize helper
	 */
	'use strict';

	var DIVISOR = {
	    rect: 1,
	    circle: 2,
	    triangle: 1
	};
	var DIMENSION_KEYS = {
	    rect: {
	        w: 'width',
	        h: 'height'
	    },
	    circle: {
	        w: 'rx',
	        h: 'ry'
	    },
	    triangle: {
	        w: 'width',
	        h: 'height'
	    }
	};

	/**
	 * Set the start point value to the shape object
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function setStartPoint(shape) {
	    var originX = shape.getOriginX();
	    var originY = shape.getOriginY();
	    var originKey = originX.substring(0, 1) + originY.substring(0, 1);

	    shape.startPoint = shape.origins[originKey];
	}

	/**
	 * Get the positions of ratated origin by the pointer value
	 * @param {{x: number, y: number}} origin - Origin value
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {number} angle - Rotating angle
	 * @returns {object} Postions of origin
	 * @ignore
	 */
	function getPositionsOfRotatedOrigin(origin, pointer, angle) {
	    var sx = origin.x;
	    var sy = origin.y;
	    var px = pointer.x;
	    var py = pointer.y;
	    var r = angle * Math.PI / 180;
	    var rx = (px - sx) * Math.cos(r) - (py - sy) * Math.sin(r) + sx;
	    var ry = (px - sx) * Math.sin(r) + (py - sy) * Math.cos(r) + sy;

	    return {
	        originX: (sx > rx) ? 'right' : 'left',
	        originY: (sy > ry) ? 'bottom' : 'top'
	    };
	}

	/**
	 * Whether the shape has the center origin or not
	 * @param {fabric.Object} shape - Shape object
	 * @returns {boolean} State
	 * @ignore
	 */
	function hasCenterOrigin(shape) {
	    return (shape.getOriginX() === 'center' &&
	            shape.getOriginY() === 'center');
	}

	/**
	 * Adjust the origin of shape by the start point
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustOriginByStartPoint(pointer, shape) {
	    var centerPoint = shape.getPointByOrigin('center', 'center');
	    var angle = -shape.getAngle();
	    var originPositions = getPositionsOfRotatedOrigin(centerPoint, pointer, angle);
	    var originX = originPositions.originX;
	    var originY = originPositions.originY;
	    var origin = shape.getPointByOrigin(originX, originY);
	    var left = shape.getLeft() - (centerPoint.x - origin.x);
	    var top = shape.getTop() - (centerPoint.x - origin.y);

	    shape.set({
	        originX: originX,
	        originY: originY,
	        left: left,
	        top: top
	    });

	    shape.setCoords();
	}

	/**
	 * Adjust the origin of shape by the moving pointer value
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustOriginByMovingPointer(pointer, shape) {
	    var origin = shape.startPoint;
	    var angle = -shape.getAngle();
	    var originPositions = getPositionsOfRotatedOrigin(origin, pointer, angle);
	    var originX = originPositions.originX;
	    var originY = originPositions.originY;

	    shape.setPositionByOrigin(origin, originX, originY);
	}

	/**
	 * Adjust the dimension of shape on firing scaling event
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustDimensionOnScaling(shape) {
	    var type = shape.type;
	    var dimensionKeys = DIMENSION_KEYS[type];
	    var scaleX = shape.scaleX;
	    var scaleY = shape.scaleY;
	    var width = shape[dimensionKeys.w] * scaleX;
	    var height = shape[dimensionKeys.h] * scaleY;
	    var options, maxScale;

	    if (shape.isRegular) {
	        maxScale = Math.max(scaleX, scaleY);

	        width = shape[dimensionKeys.w] * maxScale;
	        height = shape[dimensionKeys.h] * maxScale;
	    }

	    options = {
	        hasControls: false,
	        hasBorders: false,
	        scaleX: 1,
	        scaleY: 1
	    };

	    options[dimensionKeys.w] = width;
	    options[dimensionKeys.h] = height;

	    shape.set(options);
	}

	/**
	 * Adjust the dimension of shape on firing mouse move event
	 * @param {{x: number, y: number}} pointer - Pointer value
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustDimensionOnMouseMove(pointer, shape) {
	    var origin = shape.startPoint;
	    var type = shape.type;
	    var divisor = DIVISOR[type];
	    var dimensionKeys = DIMENSION_KEYS[type];
	    var width = Math.abs(origin.x - pointer.x) / divisor;
	    var height = Math.abs(origin.y - pointer.y) / divisor;
	    var strokeWidth = shape.strokeWidth;
	    var isTriangle = !!(shape.type === 'triangle');
	    var options = {};

	    if (width > strokeWidth) {
	        width -= strokeWidth / divisor;
	    }

	    if (height > strokeWidth) {
	        height -= strokeWidth / divisor;
	    }

	    if (shape.isRegular) {
	        width = height = Math.max(width, height);

	        if (isTriangle) {
	            height = Math.sqrt(3) / 2 * width;
	        }
	    }

	    options[dimensionKeys.w] = width;
	    options[dimensionKeys.h] = height;

	    shape.set(options);
	}

	module.exports = {
	    /**
	     * Set each origin value to shape
	     * @param {fabric.Object} shape - Shape object
	     */
	    setOrigins: function(shape) {
	        var leftTopPoint = shape.getPointByOrigin('left', 'top');
	        var rightTopPoint = shape.getPointByOrigin('right', 'top');
	        var rightBottomPoint = shape.getPointByOrigin('right', 'bottom');
	        var leftBottomPoint = shape.getPointByOrigin('left', 'bottom');

	        shape.origins = {
	            lt: leftTopPoint,
	            rt: rightTopPoint,
	            rb: rightBottomPoint,
	            lb: leftBottomPoint
	        };
	    },

	    /**
	     * Resize the shape
	     * @param {fabric.Object} shape - Shape object
	     * @param {{x: number, y: number}} pointer - Mouse pointer values on canvas
	     * @param {boolean} isScaling - Whether the resizing action is scaling or not
	     */
	    resize: function(shape, pointer, isScaling) {
	        if (hasCenterOrigin(shape)) {
	            adjustOriginByStartPoint(pointer, shape);
	            setStartPoint(shape);
	        }

	        if (isScaling) {
	            adjustDimensionOnScaling(shape, pointer);
	        } else {
	            adjustDimensionOnMouseMove(pointer, shape);
	        }

	        adjustOriginByMovingPointer(pointer, shape);
	    },

	    /**
	     * Adjust the origin position of shape to center
	     * @param {fabric.Object} shape - Shape object
	     */
	    adjustOriginToCenter: function(shape) {
	        var centerPoint = shape.getPointByOrigin('center', 'center');
	        var originX = shape.getOriginX();
	        var originY = shape.getOriginY();
	        var origin = shape.getPointByOrigin(originX, originY);
	        var left = shape.getLeft() + (centerPoint.x - origin.x);
	        var top = shape.getTop() + (centerPoint.y - origin.y);

	        shape.set({
	            hasControls: true,
	            hasBorders: true,
	            originX: 'center',
	            originY: 'center',
	            left: left,
	            top: top
	        });

	        shape.setCoords(); // For left, top properties
	    }
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Command factory
	 */
	'use strict';

	var Command = __webpack_require__(21);
	var consts = __webpack_require__(5);

	var componentNames = consts.componentNames;
	var commandNames = consts.commandNames;
	var creators = {};

	var MAIN = componentNames.MAIN;
	var IMAGE_LOADER = componentNames.IMAGE_LOADER;
	var FLIP = componentNames.FLIP;
	var ROTATION = componentNames.ROTATION;
	var FILTER = componentNames.FILTER;

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
	 * @ignore
	 */
	function createAddObjectCommand(object) {
	    tui.util.stamp(object);

	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
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
	         * @ignore
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
	 * @ignore
	 */
	function createLoadImageCommand(imageName, img) {
	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
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
	         * @ignore
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
	 * @ignore
	 */
	function createFlipImageCommand(type) {
	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
	         */
	        execute: function(compMap) {
	            var flipComp = compMap[FLIP];

	            this.store = flipComp.getCurrentSetting();

	            return flipComp[type]();
	        },
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
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
	 * @ignore
	 */
	function createRotationImageCommand(type, angle) {
	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
	         */
	        execute: function(compMap) {
	            var rotationComp = compMap[ROTATION];

	            this.store = rotationComp.getCurrentAngle();

	            return rotationComp[type](angle);
	        },
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
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
	 * @ignore
	 */
	function createClearCommand() {
	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
	         */
	        execute: function(compMap) {
	            var canvas = compMap[MAIN].getCanvas();
	            var jqDefer = $.Deferred();
	            var objs = canvas.getObjects();

	            // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
	            this.store = objs.slice();
	            if (this.store.length) {
	                tui.util.forEach(objs.slice(), function(obj) {
	                    obj.remove();
	                });
	                jqDefer.resolve();
	            } else {
	                jqDefer.reject();
	            }

	            return jqDefer;
	        },
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
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
	 * @ignore
	 */
	function createRemoveCommand(target) {
	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
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
	         * @ignore
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
	 * @ignore
	 */
	function createFilterCommand(type, options) {
	    return new Command({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {jQuery.Deferred}
	         * @ignore
	         */
	        execute: function(compMap) { // eslint-disable-line
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
	         * @ignore
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
	 * @ignore
	 */
	function create(name, args) {
	    args = Array.prototype.slice.call(arguments, 1);

	    return creators[name].apply(null, args);
	}


	module.exports = {
	    create: create
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Command interface
	 */
	'use strict';

	var errorMessage = __webpack_require__(22);

	var createMessage = errorMessage.create,
	    errorTypes = errorMessage.types;

	/**
	 * Command class
	 * @class
	 * @param {{execute: function, undo: function}} actions - Command actions
	 * @ignore
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


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Error-message factory
	 */
	'use strict';

	var keyMirror = __webpack_require__(6).keyMirror;

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


/***/ }
/******/ ]);