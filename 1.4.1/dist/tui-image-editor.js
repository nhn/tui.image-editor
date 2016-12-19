/*!
 * tui-image-editor.js
 * @version 1.4.1
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

	var _imageEditor = __webpack_require__(1);

	var _imageEditor2 = _interopRequireDefault(_imageEditor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	tui.util.defineNamespace('tui.component.ImageEditor', _imageEditor2.default, true);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Image-editor application class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _invoker = __webpack_require__(2);

	var _invoker2 = _interopRequireDefault(_invoker);

	var _command = __webpack_require__(84);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var events = _consts2.default.eventNames;
	var components = _consts2.default.componentNames;
	var commands = _consts2.default.commandNames;
	var states = _consts2.default.states,
	    keyCodes = _consts2.default.keyCodes,
	    fObjectOptions = _consts2.default.fObjectOptions;
	var _tui$util = tui.util,
	    isUndefined = _tui$util.isUndefined,
	    bind = _tui$util.bind,
	    forEach = _tui$util.forEach,
	    extend = _tui$util.extend,
	    hasStamp = _tui$util.hasStamp;

	/**
	 * Image editor
	 * @class
	 * @param {string|jQuery|HTMLElement} element - Wrapper or canvas element or selector
	 * @param {object} [option] - Canvas max width & height of css
	 *  @param {number} option.cssMaxWidth - Canvas css-max-width
	 *  @param {number} option.cssMaxHeight - Canvas css-max-height
	 */

	var ImageEditor = function () {
	    function ImageEditor(element, option) {
	        _classCallCheck(this, ImageEditor);

	        option = option || {};
	        /**
	         * Invoker
	         * @type {Invoker}
	         * @private
	         */
	        this._invoker = new _invoker2.default();

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
	    }

	    /**
	     * Set selection style of fabric object by init option
	     * @param {object} styles - Selection styles
	     * @private
	     */


	    _createClass(ImageEditor, [{
	        key: '_setSelectionStyle',
	        value: function _setSelectionStyle(styles) {
	            extend(fObjectOptions.SELECTION_STYLE, styles);
	        }

	        /**
	         * Attach invoker events
	         * @private
	         */

	    }, {
	        key: '_attachInvokerEvents',
	        value: function _attachInvokerEvents() {
	            var PUSH_UNDO_STACK = events.PUSH_UNDO_STACK,
	                PUSH_REDO_STACK = events.PUSH_REDO_STACK,
	                EMPTY_UNDO_STACK = events.EMPTY_UNDO_STACK,
	                EMPTY_REDO_STACK = events.EMPTY_REDO_STACK;

	            /**
	             * @event ImageEditor#pushUndoStack
	             */

	            this._invoker.on(PUSH_UNDO_STACK, this.fire.bind(this, PUSH_UNDO_STACK));
	            /**
	             * @event ImageEditor#pushRedoStack
	             */
	            this._invoker.on(PUSH_REDO_STACK, this.fire.bind(this, PUSH_REDO_STACK));
	            /**
	             * @event ImageEditor#emptyUndoStack
	             */
	            this._invoker.on(EMPTY_UNDO_STACK, this.fire.bind(this, EMPTY_UNDO_STACK));
	            /**
	             * @event ImageEditor#emptyRedoStack
	             */
	            this._invoker.on(EMPTY_REDO_STACK, this.fire.bind(this, EMPTY_REDO_STACK));
	        }

	        /**
	         * Attach canvas events
	         * @private
	         */

	    }, {
	        key: '_attachCanvasEvents',
	        value: function _attachCanvasEvents() {
	            this._canvas.on({
	                'mouse:down': this._handlers.mousedown,
	                'object:added': this._handlers.addedObject,
	                'object:removed': this._handlers.removedObject,
	                'object:moving': this._handlers.movingObject,
	                'object:scaling': this._handlers.scalingObject,
	                'object:selected': this._handlers.selectedObject,
	                'path:created': this._handlers.createdPath
	            });
	        }

	        /**
	         * Attach dom events
	         * @private
	         */

	    }, {
	        key: '_attachDomEvents',
	        value: function _attachDomEvents() {
	            fabric.util.addListener(document, 'keydown', this._handlers.keydown);
	        }

	        /**
	         * Detach dom events
	         * @private
	         */

	    }, {
	        key: '_detachDomEvents',
	        value: function _detachDomEvents() {
	            fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
	        }

	        /**
	         * Keydown event handler
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */
	        /* eslint-disable complexity */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown(e) {
	            if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Z) {
	                this.undo();
	            }

	            if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Y) {
	                this.redo();
	            }

	            if ((e.keyCode === keyCodes.BACKSPACE || e.keyCode === keyCodes.DEL) && this._canvas.getActiveObject()) {
	                e.preventDefault();
	                this.removeActiveObject();
	            }
	        }
	        /* eslint-enable complexity */

	        /**
	         * "mouse:down" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onMouseDown',
	        value: function _onMouseDown(fEvent) {
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
	        }

	        /**
	         * "object:added" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onAddedObject',
	        value: function _onAddedObject(fEvent) {
	            var obj = fEvent.target;

	            if (obj.isType('cropzone') || obj.isType('text')) {
	                return;
	            }

	            if (!hasStamp(obj)) {
	                var command = _command2.default.create(commands.ADD_OBJECT, obj);
	                this._invoker.pushUndoStack(command);
	                this._invoker.clearRedoStack();
	            }

	            /**
	             * @event ImageEditor#addObject
	             * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	             * @example
	             * imageEditor.on('addObject', function(obj) {
	             *     console.log(obj);
	             * });
	             */
	            this.fire(events.ADD_OBJECT, obj);
	        }

	        /**
	         * "object:removed" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onRemovedObject',
	        value: function _onRemovedObject(fEvent) {
	            /**
	             * @event ImageEditor#removeObject
	             * @param {fabric.Object} obj - http://fabricjs.com/docs/fabric.Object.html
	             * @example
	             * imageEditor.on('removeObject', function(obj) {
	             *     console.log(obj);
	             * });
	             */
	            this.fire(events.REMOVE_OBJECT, fEvent.target);
	        }

	        /**
	         * "object:selected" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onSelectedObject',
	        value: function _onSelectedObject(fEvent) {
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
	        }

	        /**
	         * "object:moving" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onMovingObject',
	        value: function _onMovingObject(fEvent) {
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
	        }

	        /**
	         * "object:scaling" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onScalingObject',
	        value: function _onScalingObject(fEvent) {
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
	        }

	        /**
	         * EventListener - "path:created"
	         *  - Events:: "object:added" -> "path:created"
	         * @param {{path: fabric.Path}} obj - Path object
	         * @private
	         */

	    }, {
	        key: '_onCreatedPath',
	        value: function _onCreatedPath(obj) {
	            obj.path.set(_consts2.default.fObjectOptions.SELECTION_STYLE);
	        }

	        /**
	         * onSelectClear handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricSelectClear',
	        value: function _onFabricSelectClear(fEvent) {
	            var textComp = this._getComponent(components.TEXT);
	            var obj = textComp.getSelectedObj();

	            textComp.isPrevEditing = true;

	            textComp.setSelectedInfo(fEvent.target, false);

	            if (obj.text === '') {
	                obj.remove();
	            } else if (!hasStamp(obj)) {
	                var command = _command2.default.create(commands.ADD_OBJECT, obj);
	                this._invoker.pushUndoStack(command);
	                this._invoker.clearRedoStack();
	            }
	        }

	        /**
	         * onSelect handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricSelect',
	        value: function _onFabricSelect(fEvent) {
	            var textComp = this._getComponent(components.TEXT);
	            var obj = textComp.getSelectedObj();

	            textComp.isPrevEditing = true;

	            if (obj.text === '') {
	                obj.remove();
	            } else if (!hasStamp(obj) && textComp.isSelected()) {
	                var command = _command2.default.create(commands.ADD_OBJECT, obj);
	                this._invoker.pushUndoStack(command);
	                this._invoker.clearRedoStack();
	            }

	            textComp.setSelectedInfo(fEvent.target, true);
	        }

	        /**
	         * Set canvas element
	         * @param {string|jQuery|HTMLElement} element - Wrapper or canvas element or selector
	         * @param {number} cssMaxWidth - Canvas css max width
	         * @param {number} cssMaxHeight - Canvas css max height
	         * @private
	         */

	    }, {
	        key: '_setCanvas',
	        value: function _setCanvas(element, cssMaxWidth, cssMaxHeight) {
	            var mainComponent = this._getMainComponent();
	            mainComponent.setCanvasElement(element);
	            mainComponent.setCssMaxDimension({
	                width: cssMaxWidth,
	                height: cssMaxHeight
	            });
	            this._canvas = mainComponent.getCanvas();
	        }

	        /**
	         * Returns main component
	         * @returns {Component} Main component
	         * @private
	         */

	    }, {
	        key: '_getMainComponent',
	        value: function _getMainComponent() {
	            return this._getComponent(components.MAIN);
	        }

	        /**
	         * Get component
	         * @param {string} name - Component name
	         * @returns {Component}
	         * @private
	         */

	    }, {
	        key: '_getComponent',
	        value: function _getComponent(name) {
	            return this._invoker.getComponent(name);
	        }

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

	    }, {
	        key: 'getCurrentState',
	        value: function getCurrentState() {
	            return this._state;
	        }

	        /**
	         * Clear all objects
	         * @example
	         * imageEditor.clearObjects();
	         */

	    }, {
	        key: 'clearObjects',
	        value: function clearObjects() {
	            var command = _command2.default.create(commands.CLEAR_OBJECTS);
	            var callback = this.fire.bind(this, events.CLEAR_OBJECTS);

	            /**
	             * @event ImageEditor#clearObjects
	             */
	            command.setExecuteCallback(callback);
	            this.execute(command);
	        }

	        /**
	         * End current action & Deactivate
	         * @example
	         * imageEditor.startFreeDrawing();
	         * imageEidtor.endAll(); // === imageEidtor.endFreeDrawing();
	         *
	         * imageEditor.startCropping();
	         * imageEditor.endAll(); // === imageEidtor.endCropping();
	         */

	    }, {
	        key: 'endAll',
	        value: function endAll() {
	            this.endTextMode();
	            this.endFreeDrawing();
	            this.endLineDrawing();
	            this.endCropping();
	            this.endDrawingShapeMode();
	            this.deactivateAll();
	            this._state = states.NORMAL;
	        }

	        /**
	         * Deactivate all objects
	         * @example
	         * imageEditor.deactivateAll();
	         */

	    }, {
	        key: 'deactivateAll',
	        value: function deactivateAll() {
	            this._canvas.deactivateAll();
	            this._canvas.renderAll();
	        }

	        /**
	         * Invoke command
	         * @param {Command} command - Command
	         * @ignore
	         */

	    }, {
	        key: 'execute',
	        value: function execute(command) {
	            this.endAll();
	            this._invoker.invoke(command);
	        }

	        /**
	         * Undo
	         * @example
	         * imageEditor.undo();
	         */

	    }, {
	        key: 'undo',
	        value: function undo() {
	            this.endAll();
	            this._invoker.undo();
	        }

	        /**
	         * Redo
	         * @example
	         * imageEditor.redo();
	         */

	    }, {
	        key: 'redo',
	        value: function redo() {
	            this.endAll();
	            this._invoker.redo();
	        }

	        /**
	         * Load image from file
	         * @param {File} imgFile - Image file
	         * @param {string} [imageName] - imageName
	         * @example
	         * imageEditor.loadImageFromFile(file);
	         */

	    }, {
	        key: 'loadImageFromFile',
	        value: function loadImageFromFile(imgFile, imageName) {
	            if (!imgFile) {
	                return;
	            }

	            this.loadImageFromURL(URL.createObjectURL(imgFile), imageName || imgFile.name);
	        }

	        /**
	         * Load image from url
	         * @param {string} url - File url
	         * @param {string} imageName - imageName
	         * @example
	         * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena')
	         */

	    }, {
	        key: 'loadImageFromURL',
	        value: function loadImageFromURL(url, imageName) {
	            var _this = this;

	            if (!imageName || !url) {
	                return;
	            }

	            var callback = bind(this._callbackAfterImageLoading, this);
	            var command = _command2.default.create(commands.LOAD_IMAGE, imageName, url);
	            command.setExecuteCallback(callback).setUndoCallback(function (oImage) {
	                if (oImage) {
	                    callback(oImage);
	                } else {
	                    /**
	                     * @event ImageEditor#clearImage
	                     */
	                    _this.fire(events.CLEAR_IMAGE);
	                }
	            });
	            this.execute(command);
	        }

	        /**
	         * Callback after image loading
	         * @param {?fabric.Image} oImage - Image instance
	         * @private
	         */

	    }, {
	        key: '_callbackAfterImageLoading',
	        value: function _callbackAfterImageLoading(oImage) {
	            var mainComponent = this._getMainComponent();
	            var canvasElement = mainComponent.getCanvasElement();

	            var _canvasElement$getBou = canvasElement.getBoundingClientRect(),
	                width = _canvasElement$getBou.width,
	                height = _canvasElement$getBou.height;

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
	                currentWidth: width,
	                currentHeight: height
	            });
	        }

	        /**
	         * Add image object on canvas
	         * @param {string} imgUrl - Image url to make object
	         * @example
	         * imageEditor.addImageObject('path/fileName.jpg');
	         */

	    }, {
	        key: 'addImageObject',
	        value: function addImageObject(imgUrl) {
	            if (!imgUrl) {
	                return;
	            }

	            fabric.Image.fromURL(imgUrl, bind(this._callbackAfterLoadingImageObject, this), {
	                crossOrigin: 'Anonymous'
	            });
	        }

	        /**
	         * Callback function after loading image
	         * @param {fabric.Image} obj - Fabric image object
	         * @private
	         */

	    }, {
	        key: '_callbackAfterLoadingImageObject',
	        value: function _callbackAfterLoadingImageObject(obj) {
	            var mainComp = this._getMainComponent();
	            var centerPos = mainComp.getCanvasImage().getCenterPoint();

	            obj.set(_consts2.default.fObjectOptions.SELECTION_STYLE);
	            obj.set({
	                left: centerPos.x,
	                top: centerPos.y,
	                crossOrigin: 'anonymous'
	            });

	            this._canvas.add(obj).setActiveObject(obj);
	        }

	        /**
	         * Start cropping
	         * @example
	         * imageEditor.startCropping();
	         */

	    }, {
	        key: 'startCropping',
	        value: function startCropping() {
	            if (this.getCurrentState() === states.CROP) {
	                return;
	            }

	            this.endAll();
	            this._state = states.CROP;
	            var cropper = this._getComponent(components.CROPPER);
	            cropper.start();
	            /**
	             * @event ImageEditor#startCropping
	             */
	            this.fire(events.START_CROPPING);
	        }

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

	    }, {
	        key: 'endCropping',
	        value: function endCropping(isApplying) {
	            var _this2 = this;

	            if (this.getCurrentState() !== states.CROP) {
	                return;
	            }

	            var cropper = this._getComponent(components.CROPPER);
	            this._state = states.NORMAL;
	            var data = cropper.end(isApplying);

	            this.once('loadImage', function () {
	                /**
	                 * @event ImageEditor#endCropping
	                 */
	                _this2.fire(events.END_CROPPING);
	            });

	            if (data) {
	                this.loadImageFromURL(data.url, data.imageName);
	            }
	        }

	        /**
	         * Flip
	         * @param {string} type - 'flipX' or 'flipY' or 'reset'
	         * @private
	         */

	    }, {
	        key: '_flip',
	        value: function _flip(type) {
	            var _this3 = this;

	            var command = _command2.default.create(commands.FLIP_IMAGE, type);
	            var callback = function callback(_ref) {
	                var setting = _ref.setting,
	                    angle = _ref.angle;

	                _this3.fire(events.FLIP_IMAGE, setting, angle);
	            };

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
	            command.setExecuteCallback(callback).setUndoCallback(callback);
	            this.execute(command);
	        }

	        /**
	         * Flip x
	         * @example
	         * imageEditor.flipX();
	         */

	    }, {
	        key: 'flipX',
	        value: function flipX() {
	            this._flip('flipX');
	        }

	        /**
	         * Flip y
	         * @example
	         * imageEditor.flipY();
	         */

	    }, {
	        key: 'flipY',
	        value: function flipY() {
	            this._flip('flipY');
	        }

	        /**
	         * Reset flip
	         * @example
	         * imageEditor.resetFlip();
	         */

	    }, {
	        key: 'resetFlip',
	        value: function resetFlip() {
	            this._flip('reset');
	        }

	        /**
	         * @param {string} type - 'rotate' or 'setAngle'
	         * @param {number} angle - angle value (degree)
	         * @private
	         */

	    }, {
	        key: '_rotate',
	        value: function _rotate(type, angle) {
	            var callback = this.fire.bind(this, events.ROTATE_IMAGE);
	            var command = _command2.default.create(commands.ROTATE_IMAGE, type, angle);

	            /**
	             * @event ImageEditor#rotateImage
	             * @param {number} currentAngle - image.angle
	             * @example
	             * imageEditor.on('rotateImage', function(angle) {
	             *     console.log('angle: ', angle);
	             * });
	             */
	            command.setExecuteCallback(callback).setUndoCallback(callback);
	            this.execute(command);
	        }

	        /**
	         * Rotate image
	         * @param {number} angle - Additional angle to rotate image
	         * @example
	         * imageEditor.setAngle(10); // angle = 10
	         * imageEditor.rotate(10); // angle = 20
	         * imageEidtor.setAngle(5); // angle = 5
	         * imageEidtor.rotate(-95); // angle = -90
	         */

	    }, {
	        key: 'rotate',
	        value: function rotate(angle) {
	            this._rotate('rotate', angle);
	        }

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

	    }, {
	        key: 'setAngle',
	        value: function setAngle(angle) {
	            this._rotate('setAngle', angle);
	        }

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

	    }, {
	        key: 'startFreeDrawing',
	        value: function startFreeDrawing(setting) {
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
	        }

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

	    }, {
	        key: 'setBrush',
	        value: function setBrush(setting) {
	            var state = this._state;
	            var compName = void 0;

	            switch (state) {
	                case states.LINE:
	                    compName = components.LINE;
	                    break;
	                default:
	                    compName = components.FREE_DRAWING;
	            }

	            this._getComponent(compName).setBrush(setting);
	        }

	        /**
	         * End free-drawing mode
	         * @example
	         * imageEditor.startFreeDrawing();
	         * imageEditor.endFreeDrawing();
	         */

	    }, {
	        key: 'endFreeDrawing',
	        value: function endFreeDrawing() {
	            if (this.getCurrentState() !== states.FREE_DRAWING) {
	                return;
	            }
	            this._getComponent(components.FREE_DRAWING).end();
	            this._state = states.NORMAL;

	            /**
	             * @event ImageEditor#endFreeDrawing
	             */
	            this.fire(events.END_FREE_DRAWING);
	        }

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

	    }, {
	        key: 'startLineDrawing',
	        value: function startLineDrawing(setting) {
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
	        }

	        /**
	         * End line-drawing mode
	         * @example
	         * imageEditor.startLineDrawing();
	         * imageEditor.endLineDrawing();
	         */

	    }, {
	        key: 'endLineDrawing',
	        value: function endLineDrawing() {
	            if (this.getCurrentState() !== states.LINE) {
	                return;
	            }
	            this._getComponent(components.LINE).end();
	            this._state = states.NORMAL;

	            /**
	             * @event ImageEditor#endLineDrawing
	             */
	            this.fire(events.END_LINE_DRAWING);
	        }

	        /**
	         * Start to draw shape on canvas (bind event on canvas)
	         * @example
	         * imageEditor.startDrawingShapeMode();
	         */

	    }, {
	        key: 'startDrawingShapeMode',
	        value: function startDrawingShapeMode() {
	            if (this.getCurrentState() !== states.SHAPE) {
	                this._state = states.SHAPE;
	                this._getComponent(components.SHAPE).startDrawingMode();
	            }
	        }

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

	    }, {
	        key: 'setDrawingShape',
	        value: function setDrawingShape(type, options) {
	            this._getComponent(components.SHAPE).setStates(type, options);
	        }

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

	    }, {
	        key: 'addShape',
	        value: function addShape(type, options) {
	            options = options || {};

	            this._setPositions(options);
	            this._getComponent(components.SHAPE).add(type, options);
	        }

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

	    }, {
	        key: 'changeShape',
	        value: function changeShape(options) {
	            var activeObj = this._canvas.getActiveObject();
	            var shapeComponent = this._getComponent(components.SHAPE);

	            if (!activeObj) {
	                return;
	            }

	            shapeComponent.change(activeObj, options);
	        }

	        /**
	         * End to draw shape on canvas (unbind event on canvas)
	         * @example
	         * imageEditor.startDrawingShapeMode();
	         * imageEditor.endDrawingShapeMode();
	         */

	    }, {
	        key: 'endDrawingShapeMode',
	        value: function endDrawingShapeMode() {
	            if (this.getCurrentState() === states.SHAPE) {
	                this._getComponent(components.SHAPE).endDrawingMode();
	                this._state = states.NORMAL;
	            }
	        }

	        /**
	         * Start text input mode
	         * @example
	         * imageEditor.endTextMode();
	         * imageEditor.startTextMode();
	         */

	    }, {
	        key: 'startTextMode',
	        value: function startTextMode() {
	            if (this.getCurrentState() !== states.TEXT) {
	                this._state = states.TEXT;

	                this._getComponent(components.TEXT).start({
	                    mousedown: bind(this._onFabricMouseDown, this),
	                    select: bind(this._onFabricSelect, this),
	                    selectClear: bind(this._onFabricSelectClear, this),
	                    dbclick: bind(this._onDBClick, this),
	                    remove: this._handlers.removedObject
	                });
	            }
	        }

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

	    }, {
	        key: 'addText',
	        value: function addText(text, options) {
	            if (this.getCurrentState() !== states.TEXT) {
	                this._state = states.TEXT;
	            }

	            this._getComponent(components.TEXT).add(text || '', options || {});
	        }

	        /**
	         * Change contents of selected text object on image
	         * @param {string} text - Changing text
	         * @example
	         * imageEditor.changeText('change text');
	         */

	    }, {
	        key: 'changeText',
	        value: function changeText(text) {
	            var activeObj = this._canvas.getActiveObject();

	            if (this.getCurrentState() !== states.TEXT || !activeObj) {
	                return;
	            }

	            this._getComponent(components.TEXT).change(activeObj, text);
	        }

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

	    }, {
	        key: 'changeTextStyle',
	        value: function changeTextStyle(styleObj) {
	            var activeObj = this._canvas.getActiveObject();

	            if (this.getCurrentState() !== states.TEXT || !activeObj) {
	                return;
	            }

	            this._getComponent(components.TEXT).setStyle(activeObj, styleObj);
	        }

	        /**
	         * End text input mode
	         * @example
	         * imageEditor.startTextMode();
	         * imageEditor.endTextMode();
	         */

	    }, {
	        key: 'endTextMode',
	        value: function endTextMode() {
	            if (this.getCurrentState() !== states.TEXT) {
	                return;
	            }

	            this._state = states.NORMAL;

	            this._getComponent(components.TEXT).end();
	        }

	        /**
	         * Double click event handler
	         * @private
	         */

	    }, {
	        key: '_onDBClick',
	        value: function _onDBClick() {
	            /**
	             * @event ImageEditor#editText
	             * @example
	             * imageEditor.on('editText', function(obj) {
	             *     console.log('text object: ' + obj);
	             * });
	             */
	            this.fire(events.EDIT_TEXT);
	        }

	        /**
	         * Mousedown event handler
	         * @param {fabric.Event} event - Current mousedown event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(event) {
	            // eslint-disable-line
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
	        }

	        /**
	         * Register custom icons
	         * @param {{iconType: string, pathValue: string}} infos - Infos to register icons
	         * @example
	         * imageEditor.registerIcons({
	         *     customIcon: 'M 0 0 L 20 20 L 10 10 Z',
	         *     customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
	         * });
	         */

	    }, {
	        key: 'registerIcons',
	        value: function registerIcons(infos) {
	            this._getComponent(components.ICON).registerPaths(infos);
	        }

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

	    }, {
	        key: 'addIcon',
	        value: function addIcon(type, options) {
	            options = options || {};

	            this._setPositions(options);
	            this._getComponent(components.ICON).add(type, options);
	        }

	        /**
	         * Change icon color
	         * @param {string} color - Color for icon
	         * @example
	         * imageEditor.changeIconColor('#000000');
	         */

	    }, {
	        key: 'changeIconColor',
	        value: function changeIconColor(color) {
	            var activeObj = this._canvas.getActiveObject();

	            this._getComponent(components.ICON).setColor(color, activeObj);
	        }

	        /**
	         * Remove active object or group
	         * @example
	         * imageEditor.removeActiveObject();
	         */

	    }, {
	        key: 'removeActiveObject',
	        value: function removeActiveObject() {
	            var canvas = this._canvas;
	            var target = canvas.getActiveObject() || canvas.getActiveGroup();
	            var command = _command2.default.create(commands.REMOVE_OBJECT, target);
	            this.execute(command);
	        }

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

	    }, {
	        key: 'applyFilter',
	        value: function applyFilter(type, options) {
	            var _this4 = this;

	            if (type === 'mask' && !options) {
	                var activeObj = this._canvas.getActiveObject();

	                if (!(activeObj && activeObj.isType('image'))) {
	                    return;
	                }

	                options = {
	                    mask: activeObj
	                };
	            }

	            var command = _command2.default.create(commands.APPLY_FILTER, type, options);
	            var callback = function callback(obj) {
	                _this4.fire(events.APPLY_FILTER, obj.type, obj.action);
	            };

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
	            command.setExecuteCallback(callback).setUndoCallback(callback);

	            this.execute(command);
	        }

	        /**
	         * Get data url
	         * @param {string} type - A DOMString indicating the image format. The default type is image/png.
	         * @returns {string} A DOMString containing the requested data URI
	         * @example
	         * imgEl.src = imageEditor.toDataURL();
	         */

	    }, {
	        key: 'toDataURL',
	        value: function toDataURL(type) {
	            return this._getMainComponent().toDataURL(type);
	        }

	        /**
	         * Get image name
	         * @returns {string} image name
	         * @example
	         * console.log(imageEditor.getImageName());
	         */

	    }, {
	        key: 'getImageName',
	        value: function getImageName() {
	            return this._getMainComponent().getImageName();
	        }

	        /**
	         * Clear undoStack
	         * @example
	         * imageEditor.clearUndoStack();
	         */

	    }, {
	        key: 'clearUndoStack',
	        value: function clearUndoStack() {
	            this._invoker.clearUndoStack();
	        }

	        /**
	         * Clear redoStack
	         * @example
	         * imageEditor.clearRedoStack();
	         */

	    }, {
	        key: 'clearRedoStack',
	        value: function clearRedoStack() {
	            this._invoker.clearRedoStack();
	        }

	        /**
	         * Whehter the undo stack is empty or not
	         * @returns {boolean}
	         * imageEditor.isEmptyUndoStack();
	         */

	    }, {
	        key: 'isEmptyUndoStack',
	        value: function isEmptyUndoStack() {
	            return this._invoker.isEmptyUndoStack();
	        }

	        /**
	         * Whehter the redo stack is empty or not
	         * @returns {boolean}
	         * imageEditor.isEmptyRedoStack();
	         */

	    }, {
	        key: 'isEmptyRedoStack',
	        value: function isEmptyRedoStack() {
	            return this._invoker.isEmptyRedoStack();
	        }

	        /**
	         * Resize canvas dimension
	         * @param {{width: number, height: number}} dimension - Max width & height
	         */

	    }, {
	        key: 'resizeCanvasDimension',
	        value: function resizeCanvasDimension(dimension) {
	            var mainComponent = this._getMainComponent();

	            if (!dimension) {
	                return;
	            }

	            mainComponent.setCssMaxDimension(dimension);
	            mainComponent.adjustCanvasDimension();
	        }

	        /**
	         * Destroy
	         */

	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            var _this5 = this;

	            var wrapperEl = this._canvas.wrapperEl;

	            this.endAll();
	            this._detachDomEvents();

	            this._canvas.clear();

	            wrapperEl.parentNode.removeChild(wrapperEl);

	            forEach(this, function (value, key) {
	                _this5[key] = null;
	            }, this);
	        }

	        /**
	         * Set position
	         * @param {object} options - Position options (left or top)
	         * @private
	         */

	    }, {
	        key: '_setPositions',
	        value: function _setPositions(options) {
	            var centerPosition = this._canvas.getCenter();

	            if (isUndefined(options.left)) {
	                options.left = centerPosition.left;
	            }

	            if (isUndefined(options.top)) {
	                options.top = centerPosition.top;
	            }
	        }
	    }]);

	    return ImageEditor;
	}();

	tui.util.CustomEvents.mixin(ImageEditor);
	module.exports = ImageEditor;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Invoker - invoke commands
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _promise = __webpack_require__(3);

	var _promise2 = _interopRequireDefault(_promise);

	var _imageLoader = __webpack_require__(67);

	var _imageLoader2 = _interopRequireDefault(_imageLoader);

	var _cropper = __webpack_require__(71);

	var _cropper2 = _interopRequireDefault(_cropper);

	var _main = __webpack_require__(73);

	var _main2 = _interopRequireDefault(_main);

	var _flip = __webpack_require__(74);

	var _flip2 = _interopRequireDefault(_flip);

	var _rotation = __webpack_require__(75);

	var _rotation2 = _interopRequireDefault(_rotation);

	var _freeDrawing = __webpack_require__(76);

	var _freeDrawing2 = _interopRequireDefault(_freeDrawing);

	var _line = __webpack_require__(77);

	var _line2 = _interopRequireDefault(_line);

	var _text = __webpack_require__(78);

	var _text2 = _interopRequireDefault(_text);

	var _icon = __webpack_require__(79);

	var _icon2 = _interopRequireDefault(_icon);

	var _filter = __webpack_require__(80);

	var _filter2 = _interopRequireDefault(_filter);

	var _shape = __webpack_require__(82);

	var _shape2 = _interopRequireDefault(_shape);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var eventNames = _consts2.default.eventNames,
	    rejectMessages = _consts2.default.rejectMessages;

	/**
	 * Invoker
	 * @class
	 * @ignore
	 */

	var Invoker = function () {
	    function Invoker() {
	        _classCallCheck(this, Invoker);

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
	    }

	    /**
	     * Create components
	     * @private
	     */


	    _createClass(Invoker, [{
	        key: '_createComponents',
	        value: function _createComponents() {
	            var main = new _main2.default();

	            this._register(main);
	            this._register(new _imageLoader2.default(main));
	            this._register(new _cropper2.default(main));
	            this._register(new _flip2.default(main));
	            this._register(new _rotation2.default(main));
	            this._register(new _freeDrawing2.default(main));
	            this._register(new _line2.default(main));
	            this._register(new _text2.default(main));
	            this._register(new _icon2.default(main));
	            this._register(new _filter2.default(main));
	            this._register(new _shape2.default(main));
	        }

	        /**
	         * Register component
	         * @param {Component} component - Component handling the canvas
	         * @private
	         */

	    }, {
	        key: '_register',
	        value: function _register(component) {
	            this._componentMap[component.getName()] = component;
	        }

	        /**
	         * Invoke command execution
	         * @param {Command} command - Command
	         * @returns {Promise}
	         * @private
	         */

	    }, {
	        key: '_invokeExecution',
	        value: function _invokeExecution(command) {
	            var _this = this;

	            this.lock();

	            return command.execute(this._componentMap).then(function (value) {
	                _this.pushUndoStack(command);
	                if (tui.util.isFunction(command.executeCallback)) {
	                    command.executeCallback(value);
	                }

	                return value;
	            }).catch(function () {}) // do nothing with exception
	            .then(function (value) {
	                _this.unlock();

	                return value;
	            });
	        }

	        /**
	         * Invoke command undo
	         * @param {Command} command - Command
	         * @returns {Promise}
	         * @private
	         */

	    }, {
	        key: '_invokeUndo',
	        value: function _invokeUndo(command) {
	            var _this2 = this;

	            this.lock();

	            return command.undo(this._componentMap).then(function (value) {
	                _this2.pushRedoStack(command);
	                if (tui.util.isFunction(command.undoCallback)) {
	                    command.undoCallback(value);
	                }

	                return value;
	            }).catch(function () {}) // do nothing with exception
	            .then(function (value) {
	                _this2.unlock();

	                return value;
	            });
	        }

	        /**
	         * Fire custom events
	         * @see {@link tui.util.CustomEvents.prototype.fire}
	         * @param {...*} arguments - Arguments to fire a event
	         * @private
	         */

	    }, {
	        key: '_fire',
	        value: function _fire() {
	            var event = this._customEvents;
	            var eventContext = event;

	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                args[_key] = arguments[_key];
	            }

	            event.fire.apply(eventContext, args);
	        }

	        /**
	         * Attach custom events
	         * @see {@link tui.util.CustomEvents.prototype.on}
	         * @param {...*} arguments - Arguments to attach events
	         */

	    }, {
	        key: 'on',
	        value: function on() {
	            var event = this._customEvents;
	            var eventContext = event;

	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	                args[_key2] = arguments[_key2];
	            }

	            event.on.apply(eventContext, args);
	        }

	        /**
	         * Get component
	         * @param {string} name - Component name
	         * @returns {Component}
	         */

	    }, {
	        key: 'getComponent',
	        value: function getComponent(name) {
	            return this._componentMap[name];
	        }

	        /**
	         * Lock this invoker
	         */

	    }, {
	        key: 'lock',
	        value: function lock() {
	            this._isLocked = true;
	        }

	        /**
	         * Unlock this invoker
	         */

	    }, {
	        key: 'unlock',
	        value: function unlock() {
	            this._isLocked = false;
	        }

	        /**
	         * Invoke command
	         * Store the command to the undoStack
	         * Clear the redoStack
	         * @param {Command} command - Command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'invoke',
	        value: function invoke(command) {
	            var _this3 = this;

	            if (this._isLocked) {
	                return _promise2.default.reject(rejectMessages.isLock);
	            }

	            return this._invokeExecution(command).then(function (value) {
	                _this3.clearRedoStack();

	                return value;
	            });
	        }

	        /**
	         * Undo command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'undo',
	        value: function undo() {
	            var command = this._undoStack.pop();
	            var promise = void 0;

	            if (command && this._isLocked) {
	                this.pushUndoStack(command, true);
	                command = null;
	            }
	            if (command) {
	                if (this.isEmptyUndoStack()) {
	                    this._fire(eventNames.EMPTY_UNDO_STACK);
	                }
	                promise = this._invokeUndo(command);
	            } else {
	                promise = _promise2.default.reject(rejectMessages.undo);
	            }

	            return promise;
	        }

	        /**
	         * Redo command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'redo',
	        value: function redo() {
	            var command = this._redoStack.pop();
	            var promise = void 0;

	            if (command && this._isLocked) {
	                this.pushRedoStack(command, true);
	                command = null;
	            }
	            if (command) {
	                if (this.isEmptyRedoStack()) {
	                    this._fire(eventNames.EMPTY_REDO_STACK);
	                }
	                promise = this._invokeExecution(command);
	            } else {
	                promise = _promise2.default.reject(rejectMessages.redo);
	            }

	            return promise;
	        }

	        /**
	         * Push undo stack
	         * @param {Command} command - command
	         * @param {boolean} [isSilent] - Fire event or not
	         */

	    }, {
	        key: 'pushUndoStack',
	        value: function pushUndoStack(command, isSilent) {
	            this._undoStack.push(command);
	            if (!isSilent) {
	                this._fire(eventNames.PUSH_UNDO_STACK);
	            }
	        }

	        /**
	         * Push redo stack
	         * @param {Command} command - command
	         * @param {boolean} [isSilent] - Fire event or not
	         */

	    }, {
	        key: 'pushRedoStack',
	        value: function pushRedoStack(command, isSilent) {
	            this._redoStack.push(command);
	            if (!isSilent) {
	                this._fire(eventNames.PUSH_REDO_STACK);
	            }
	        }

	        /**
	         * Return whether the redoStack is empty
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isEmptyRedoStack',
	        value: function isEmptyRedoStack() {
	            return this._redoStack.length === 0;
	        }

	        /**
	         * Return whether the undoStack is empty
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isEmptyUndoStack',
	        value: function isEmptyUndoStack() {
	            return this._undoStack.length === 0;
	        }

	        /**
	         * Clear undoStack
	         */

	    }, {
	        key: 'clearUndoStack',
	        value: function clearUndoStack() {
	            if (!this.isEmptyUndoStack()) {
	                this._undoStack = [];
	                this._fire(eventNames.EMPTY_UNDO_STACK);
	            }
	        }

	        /**
	         * Clear redoStack
	         */

	    }, {
	        key: 'clearRedoStack',
	        value: function clearRedoStack() {
	            if (!this.isEmptyRedoStack()) {
	                this._redoStack = [];
	                this._fire(eventNames.EMPTY_REDO_STACK);
	            }
	        }
	    }]);

	    return Invoker;
	}();

	module.exports = Invoker;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(49);
	__webpack_require__(53);
	module.exports = __webpack_require__(13).Promise;

/***/ },
/* 4 */
/***/ function(module, exports) {

	

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(6)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(9)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(7)
	  , defined   = __webpack_require__(8);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(10)
	  , $export        = __webpack_require__(11)
	  , redefine       = __webpack_require__(26)
	  , hide           = __webpack_require__(16)
	  , has            = __webpack_require__(27)
	  , Iterators      = __webpack_require__(28)
	  , $iterCreate    = __webpack_require__(29)
	  , setToStringTag = __webpack_require__(45)
	  , getPrototypeOf = __webpack_require__(47)
	  , ITERATOR       = __webpack_require__(46)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(12)
	  , core      = __webpack_require__(13)
	  , ctx       = __webpack_require__(14)
	  , hide      = __webpack_require__(16)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 12 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 13 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(15);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(17)
	  , createDesc = __webpack_require__(25);
	module.exports = __webpack_require__(21) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(18)
	  , IE8_DOM_DEFINE = __webpack_require__(20)
	  , toPrimitive    = __webpack_require__(24)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(21) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(21) && !__webpack_require__(22)(function(){
	  return Object.defineProperty(__webpack_require__(23)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(22)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19)
	  , document = __webpack_require__(12).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(19);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);

/***/ },
/* 27 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(30)
	  , descriptor     = __webpack_require__(25)
	  , setToStringTag = __webpack_require__(45)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(16)(IteratorPrototype, __webpack_require__(46)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(18)
	  , dPs         = __webpack_require__(31)
	  , enumBugKeys = __webpack_require__(43)
	  , IE_PROTO    = __webpack_require__(40)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(23)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(44).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(17)
	  , anObject = __webpack_require__(18)
	  , getKeys  = __webpack_require__(32);

	module.exports = __webpack_require__(21) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(33)
	  , enumBugKeys = __webpack_require__(43);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(27)
	  , toIObject    = __webpack_require__(34)
	  , arrayIndexOf = __webpack_require__(37)(false)
	  , IE_PROTO     = __webpack_require__(40)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(35)
	  , defined = __webpack_require__(8);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(36);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(34)
	  , toLength  = __webpack_require__(38)
	  , toIndex   = __webpack_require__(39);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(7)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(7)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(41)('keys')
	  , uid    = __webpack_require__(42);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(12)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12).document && document.documentElement;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(17).f
	  , has = __webpack_require__(27)
	  , TAG = __webpack_require__(46)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(41)('wks')
	  , uid        = __webpack_require__(42)
	  , Symbol     = __webpack_require__(12).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(27)
	  , toObject    = __webpack_require__(48)
	  , IE_PROTO    = __webpack_require__(40)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(8);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(50);
	var global        = __webpack_require__(12)
	  , hide          = __webpack_require__(16)
	  , Iterators     = __webpack_require__(28)
	  , TO_STRING_TAG = __webpack_require__(46)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(51)
	  , step             = __webpack_require__(52)
	  , Iterators        = __webpack_require__(28)
	  , toIObject        = __webpack_require__(34);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(9)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(10)
	  , global             = __webpack_require__(12)
	  , ctx                = __webpack_require__(14)
	  , classof            = __webpack_require__(54)
	  , $export            = __webpack_require__(11)
	  , isObject           = __webpack_require__(19)
	  , aFunction          = __webpack_require__(15)
	  , anInstance         = __webpack_require__(55)
	  , forOf              = __webpack_require__(56)
	  , speciesConstructor = __webpack_require__(60)
	  , task               = __webpack_require__(61).set
	  , microtask          = __webpack_require__(63)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;

	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(46)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();

	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};

	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(64)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(45)($Promise, PROMISE);
	__webpack_require__(65)(PROMISE);
	Wrapper = __webpack_require__(13)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(66)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(36)
	  , TAG = __webpack_require__(46)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(14)
	  , call        = __webpack_require__(57)
	  , isArrayIter = __webpack_require__(58)
	  , anObject    = __webpack_require__(18)
	  , toLength    = __webpack_require__(38)
	  , getIterFn   = __webpack_require__(59)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(18);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(28)
	  , ITERATOR   = __webpack_require__(46)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(54)
	  , ITERATOR  = __webpack_require__(46)('iterator')
	  , Iterators = __webpack_require__(28);
	module.exports = __webpack_require__(13).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(18)
	  , aFunction = __webpack_require__(15)
	  , SPECIES   = __webpack_require__(46)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(14)
	  , invoke             = __webpack_require__(62)
	  , html               = __webpack_require__(44)
	  , cel                = __webpack_require__(23)
	  , global             = __webpack_require__(12)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(36)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 62 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(12)
	  , macrotask = __webpack_require__(61).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(36)(process) == 'process';

	module.exports = function(){
	  var head, last, notify;

	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };

	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(16);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(12)
	  , core        = __webpack_require__(13)
	  , dP          = __webpack_require__(17)
	  , DESCRIPTORS = __webpack_require__(21)
	  , SPECIES     = __webpack_require__(46)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(46)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _promise = __webpack_require__(3);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image loader
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages;

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

	var ImageLoader = function (_Component) {
	    _inherits(ImageLoader, _Component);

	    function ImageLoader(parent) {
	        _classCallCheck(this, ImageLoader);

	        var _this = _possibleConstructorReturn(this, (ImageLoader.__proto__ || Object.getPrototypeOf(ImageLoader)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = componentNames.IMAGE_LOADER;
	        return _this;
	    }

	    /**
	     * Load image from url
	     * @param {?string} imageName - File name
	     * @param {?(fabric.Image|string)} img - fabric.Image instance or URL of an image
	     * @returns {jQuery.Deferred} deferred
	     */


	    _createClass(ImageLoader, [{
	        key: 'load',
	        value: function load(imageName, img) {
	            var _this2 = this;

	            var promise = void 0;

	            if (!imageName && !img) {
	                // Back to the initial state, not error.
	                var canvas = this.getCanvas();

	                canvas.backgroundImage = null;
	                canvas.renderAll();

	                promise = new _promise2.default(function (resolve) {
	                    _this2.setCanvasImage('', null);
	                    resolve();
	                });
	            } else {
	                promise = this._setBackgroundImage(img).then(function (oImage) {
	                    _this2.setCanvasImage(imageName, oImage);
	                    _this2.adjustCanvasDimension();

	                    return oImage;
	                });
	            }

	            return promise;
	        }

	        /**
	         * Set background image
	         * @param {?(fabric.Image|String)} img fabric.Image instance or URL of an image to set background to
	         * @returns {$.Deferred} deferred
	         * @private
	         */

	    }, {
	        key: '_setBackgroundImage',
	        value: function _setBackgroundImage(img) {
	            var _this3 = this;

	            if (!img) {
	                return _promise2.default.reject(rejectMessages.loadImage);
	            }

	            return new _promise2.default(function (resolve, reject) {
	                var canvas = _this3.getCanvas();

	                canvas.setBackgroundImage(img, function () {
	                    var oImage = canvas.backgroundImage;

	                    if (oImage.getElement()) {
	                        resolve(oImage);
	                    } else {
	                        reject();
	                    }
	                }, imageOption);
	            });
	        }
	    }]);

	    return ImageLoader;
	}(_component2.default);

	module.exports = ImageLoader;

/***/ },
/* 68 */
/***/ function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Component interface
	 */

	/**
	 * Component interface
	 * @class
	 * @ignore
	 */
	var Component = function () {
	  function Component() {
	    _classCallCheck(this, Component);
	  }

	  _createClass(Component, [{
	    key: "setCanvasImage",

	    /**
	     * Save image(background) of canvas
	     * @param {string} name - Name of image
	     * @param {fabric.Image} oImage - Fabric image instance
	     */
	    value: function setCanvasImage(name, oImage) {
	      this.getRoot().setCanvasImage(name, oImage);
	    }

	    /**
	     * Returns canvas element of fabric.Canvas[[lower-canvas]]
	     * @returns {HTMLCanvasElement}
	     */

	  }, {
	    key: "getCanvasElement",
	    value: function getCanvasElement() {
	      return this.getRoot().getCanvasElement();
	    }

	    /**
	     * Get fabric.Canvas instance
	     * @returns {fabric.Canvas}
	     */

	  }, {
	    key: "getCanvas",
	    value: function getCanvas() {
	      return this.getRoot().getCanvas();
	    }

	    /**
	     * Get canvasImage (fabric.Image instance)
	     * @returns {fabric.Image}
	     */

	  }, {
	    key: "getCanvasImage",
	    value: function getCanvasImage() {
	      return this.getRoot().getCanvasImage();
	    }

	    /**
	     * Get image name
	     * @returns {string}
	     */

	  }, {
	    key: "getImageName",
	    value: function getImageName() {
	      return this.getRoot().getImageName();
	    }

	    /**
	     * Get image editor
	     * @returns {ImageEditor}
	     */

	  }, {
	    key: "getEditor",
	    value: function getEditor() {
	      return this.getRoot().getEditor();
	    }

	    /**
	     * Return component name
	     * @returns {string}
	     */

	  }, {
	    key: "getName",
	    value: function getName() {
	      return this.name;
	    }

	    /**
	     * Set image properties
	     * @param {object} setting - Image properties
	     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
	     */

	  }, {
	    key: "setImageProperties",
	    value: function setImageProperties(setting, withRendering) {
	      this.getRoot().setImageProperties(setting, withRendering);
	    }

	    /**
	     * Set canvas dimension - css only
	     * @param {object} dimension - Canvas css dimension
	     */

	  }, {
	    key: "setCanvasCssDimension",
	    value: function setCanvasCssDimension(dimension) {
	      this.getRoot().setCanvasCssDimension(dimension);
	    }

	    /**
	     * Set canvas dimension - css only
	     * @param {object} dimension - Canvas backstore dimension
	     */

	  }, {
	    key: "setCanvasBackstoreDimension",
	    value: function setCanvasBackstoreDimension(dimension) {
	      this.getRoot().setCanvasBackstoreDimension(dimension);
	    }

	    /**
	     * Set parent
	     * @param {Component|null} parent - Parent
	     */

	  }, {
	    key: "setParent",
	    value: function setParent(parent) {
	      this._parent = parent || null;
	    }

	    /**
	     * Adjust canvas dimension with scaling image
	     */

	  }, {
	    key: "adjustCanvasDimension",
	    value: function adjustCanvasDimension() {
	      this.getRoot().adjustCanvasDimension();
	    }

	    /**
	     * Return parent.
	     * If the view is root, return null
	     * @returns {Component|null}
	     */

	  }, {
	    key: "getParent",
	    value: function getParent() {
	      return this._parent;
	    }

	    /**
	     * Return root
	     * @returns {Component}
	     */

	  }, {
	    key: "getRoot",
	    value: function getRoot() {
	      var next = this.getParent();
	      var current = this; // eslint-disable-line consistent-this

	      while (next) {
	        current = next;
	        next = current.getParent();
	      }

	      return current;
	    }
	  }]);

	  return Component;
	}();

	module.exports = Component;

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _util = __webpack_require__(70);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	    /**
	     * Component names
	     * @type {Object.<string, string>}
	     */
	    componentNames: _util2.default.keyMirror('MAIN', 'IMAGE_LOADER', 'CROPPER', 'FLIP', 'ROTATION', 'FREE_DRAWING', 'LINE', 'TEXT', 'ICON', 'FILTER', 'SHAPE'),

	    /**
	     * Command names
	     * @type {Object.<string, string>}
	     */
	    commandNames: _util2.default.keyMirror('CLEAR', 'LOAD_IMAGE', 'FLIP_IMAGE', 'ROTATE_IMAGE', 'ADD_OBJECT', 'REMOVE_OBJECT', 'APPLY_FILTER'),

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
	    states: _util2.default.keyMirror('NORMAL', 'CROP', 'FREE_DRAWING', 'LINE', 'TEXT', 'SHAPE'),

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
	    },

	    /**
	     * Promise reject messages
	     * @type {Object.<string, string>}
	     */
	    rejectMessages: {
	        flip: 'The flipX and flipY setting values are not changed.',
	        rotation: 'The current angle is same the old angle.',
	        loadImage: 'The background image is empty.',
	        isLock: 'The executing command state is locked.',
	        undo: 'The promise of undo command is reject.',
	        redo: 'The promise of redo command is reject.'
	    }
	}; /**
	    * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	    * @fileoverview Constants
	    */

/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Util
	 */
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
	    clamp: function clamp(value, minValue, maxValue) {
	        var temp = void 0;
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
	    keyMirror: function keyMirror() {
	        var obj = {};

	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }

	        tui.util.forEach(args, function (key) {
	            obj[key] = key;
	        });

	        return obj;
	    },


	    /**
	     * Make CSSText
	     * @param {object} styleObj - Style info object
	     * @returns {string} Connected string of style
	     */
	    makeStyleText: function makeStyleText(styleObj) {
	        var styleStr = '';

	        tui.util.forEach(styleObj, function (value, prop) {
	            styleStr += prop + ': ' + value + ';';
	        });

	        return styleStr;
	    }
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _cropzone = __webpack_require__(72);

	var _cropzone2 = _interopRequireDefault(_cropzone);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(70);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image crop module (start cropping, end cropping)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var MOUSE_MOVE_THRESHOLD = 10;
	var abs = Math.abs;
	var clamp = _util2.default.clamp;
	var keyCodes = _consts2.default.keyCodes;
	var bind = tui.util.bind;

	/**
	 * Cropper components
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @class Cropper
	 * @ignore
	 */

	var Cropper = function (_Component) {
	    _inherits(Cropper, _Component);

	    function Cropper(parent) {
	        _classCallCheck(this, Cropper);

	        var _this = _possibleConstructorReturn(this, (Cropper.__proto__ || Object.getPrototypeOf(Cropper)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = _consts2.default.componentNames.CROPPER;

	        /**
	         * Cropzone
	         * @type {Cropzone}
	         * @private
	         */
	        _this._cropzone = null;

	        /**
	         * StartX of Cropzone
	         * @type {number}
	         * @private
	         */
	        _this._startX = null;

	        /**
	         * StartY of Cropzone
	         * @type {number}
	         * @private
	         */
	        _this._startY = null;

	        /**
	         * State whether shortcut key is pressed or not
	         * @type {boolean}
	         * @private
	         */
	        _this._withShiftKey = false;

	        /**
	         * Listeners
	         * @type {object.<string, function>}
	         * @private
	         */
	        _this._listeners = {
	            keydown: bind(_this._onKeyDown, _this),
	            keyup: bind(_this._onKeyUp, _this),
	            mousedown: bind(_this._onFabricMouseDown, _this),
	            mousemove: bind(_this._onFabricMouseMove, _this),
	            mouseup: bind(_this._onFabricMouseUp, _this)
	        };
	        return _this;
	    }

	    /**
	     * Start cropping
	     */


	    _createClass(Cropper, [{
	        key: 'start',
	        value: function start() {
	            if (this._cropzone) {
	                return;
	            }
	            var canvas = this.getCanvas();
	            canvas.forEachObject(function (obj) {
	                // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
	                obj.evented = false;
	            });
	            this._cropzone = new _cropzone2.default({
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
	        }

	        /**
	         * End cropping
	         * @param {boolean} isApplying - Is applying or not
	         * @returns {?{imageName: string, url: string}} cropped Image data
	         */

	    }, {
	        key: 'end',
	        value: function end(isApplying) {
	            var canvas = this.getCanvas();
	            var cropzone = this._cropzone;
	            var data = void 0;

	            if (!cropzone) {
	                return null;
	            }
	            cropzone.remove();
	            canvas.selection = true;
	            canvas.defaultCursor = 'default';
	            canvas.off('mouse:down', this._listeners.mousedown);
	            canvas.forEachObject(function (obj) {
	                obj.evented = true;
	            });
	            if (isApplying) {
	                data = this._getCroppedImageData();
	            }
	            this._cropzone = null;

	            fabric.util.removeListener(document, 'keydown', this._listeners.keydown);
	            fabric.util.removeListener(document, 'keyup', this._listeners.keyup);

	            return data;
	        }

	        /**
	         * onMousedown handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            var canvas = this.getCanvas();

	            if (fEvent.target) {
	                return;
	            }

	            canvas.selection = false;
	            var coord = canvas.getPointer(fEvent.e);

	            this._startX = coord.x;
	            this._startY = coord.y;

	            canvas.on({
	                'mouse:move': this._listeners.mousemove,
	                'mouse:up': this._listeners.mouseup
	            });
	        }

	        /**
	         * onMousemove handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseMove',
	        value: function _onFabricMouseMove(fEvent) {
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
	        }

	        /**
	         * Get rect dimension setting from Canvas-Mouse-Position(x, y)
	         * @param {number} x - Canvas-Mouse-Position x
	         * @param {number} y - Canvas-Mouse-Position Y
	         * @returns {{left: number, top: number, width: number, height: number}}
	         * @private
	         */

	    }, {
	        key: '_calcRectDimensionFromPoint',
	        value: function _calcRectDimensionFromPoint(x, y) {
	            var canvas = this.getCanvas();
	            var canvasWidth = canvas.getWidth();
	            var canvasHeight = canvas.getHeight();
	            var startX = this._startX;
	            var startY = this._startY;
	            var left = clamp(x, 0, startX);
	            var top = clamp(y, 0, startY);
	            var width = clamp(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
	            var height = clamp(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

	            if (this._withShiftKey) {
	                // make fixed ratio cropzone
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
	        }

	        /**
	         * onMouseup handler in fabric canvas
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp() {
	            var cropzone = this._cropzone;
	            var listeners = this._listeners;
	            var canvas = this.getCanvas();

	            canvas.setActiveObject(cropzone);
	            canvas.off({
	                'mouse:move': listeners.mousemove,
	                'mouse:up': listeners.mouseup
	            });
	        }

	        /**
	         * Get cropped image data
	         * @returns {?{imageName: string, url: string}} cropped Image data
	         * @private
	         */

	    }, {
	        key: '_getCroppedImageData',
	        value: function _getCroppedImageData() {
	            var cropzone = this._cropzone;

	            if (!cropzone.isValid()) {
	                return null;
	            }

	            var cropInfo = {
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

	        /**
	         * Keydown event handler
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown(e) {
	            if (e.keyCode === keyCodes.SHIFT) {
	                this._withShiftKey = true;
	            }
	        }

	        /**
	         * Keyup event handler
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyUp',
	        value: function _onKeyUp(e) {
	            if (e.keyCode === keyCodes.SHIFT) {
	                this._withShiftKey = false;
	            }
	        }
	    }]);

	    return Cropper;
	}(_component2.default);

	module.exports = Cropper;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _util = __webpack_require__(70);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var clamp = _util2.default.clamp; /**
	                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                   * @fileoverview Cropzone extending fabric.Rect
	                                   */


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
	    initialize: function initialize(options) {
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
	    _render: function _render(ctx) {
	        var cropzoneDashLineWidth = 7;
	        var cropzoneDashLineOffset = 7;
	        this.callSuper('_render', ctx);

	        // Calc original scale
	        var originalFlipX = this.flipX ? -1 : 1;
	        var originalFlipY = this.flipY ? -1 : 1;
	        var originalScaleX = originalFlipX / this.scaleX;
	        var originalScaleY = originalFlipY / this.scaleY;

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
	    _fillOuterRect: function _fillOuterRect(ctx, fillStyle) {
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
	    _getCoordinates: function _getCoordinates(ctx) {
	        var ceil = Math.ceil,
	            width = this.getWidth(),
	            height = this.getHeight(),
	            halfWidth = width / 2,
	            halfHeight = height / 2,
	            left = this.getLeft(),
	            top = this.getTop(),
	            canvasEl = ctx.canvas; // canvas element, not fabric object

	        return {
	            x: tui.util.map([-(halfWidth + left), // x0
	            -halfWidth, // x1
	            halfWidth, // x2
	            halfWidth + (canvasEl.width - left - width) // x3
	            ], ceil),
	            y: tui.util.map([-(halfHeight + top), // y0
	            -halfHeight, // y1
	            halfHeight, // y2
	            halfHeight + (canvasEl.height - top - height) // y3
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
	    _strokeBorder: function _strokeBorder(ctx, strokeStyle, lineDashWidth, lineDashOffset) {
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
	    _onMoving: function _onMoving() {
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
	    _onScaling: function _onScaling(fEvent) {
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
	    _calcScalingSizeFromPointer: function _calcScalingSizeFromPointer(pointer) {
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
	    _calcTopLeftScalingSizeFromPointer: function _calcTopLeftScalingSizeFromPointer(x, y) {
	        var bottom = this.getHeight() + this.top,
	            right = this.getWidth() + this.left,
	            top = clamp(y, 0, bottom - 1),
	            // 0 <= top <= (bottom - 1)
	        left = clamp(x, 0, right - 1); // 0 <= left <= (right - 1)

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
	    _calcBottomRightScalingSizeFromPointer: function _calcBottomRightScalingSizeFromPointer(x, y) {
	        var canvas = this.canvas,
	            maxX = canvas.width,
	            maxY = canvas.height,
	            left = this.left,
	            top = this.top;

	        // When scaling "Bottom-Right corner": It fixes left and top coordinates
	        return {
	            width: clamp(x, left + 1, maxX) - left, // (width = x - left), (left + 1 <= x <= maxX)
	            height: clamp(y, top + 1, maxY) - top // (height = y - top), (top + 1 <= y <= maxY)
	        };
	    },


	    /* eslint-disable complexity */
	    /**
	     * Make scaling settings
	     * @param {{width: number, height: number, left: number, top: number}} tl - Top-Left setting
	     * @param {{width: number, height: number}} br - Bottom-Right setting
	     * @returns {{width: ?number, height: ?number, left: ?number, top: ?number}} Position setting
	     * @private
	     */
	    _makeScalingSettings: function _makeScalingSettings(tl, br) {
	        var tlWidth = tl.width;
	        var tlHeight = tl.height;
	        var brHeight = br.height;
	        var brWidth = br.width;
	        var tlLeft = tl.left;
	        var tlTop = tl.top;
	        var settings = void 0;

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
	    },
	    /* eslint-enable complexity */

	    /**
	     * Return the whether this cropzone is valid
	     * @returns {boolean}
	     */
	    isValid: function isValid() {
	        return this.left >= 0 && this.top >= 0 && this.width > 0 && this.height > 0;
	    }
	});

	module.exports = Cropzone;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Main component having canvas & image, set css-max-dimension of canvas
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


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

	var Main = function (_Component) {
	    _inherits(Main, _Component);

	    function Main() {
	        _classCallCheck(this, Main);

	        /**
	         * Component name
	         * @type {string}
	         */
	        var _this = _possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).call(this));

	        _this.name = _consts2.default.componentNames.MAIN;

	        /**
	         * Fabric canvas instance
	         * @type {fabric.Canvas}
	         */
	        _this.canvas = null;

	        /**
	         * Fabric image instance
	         * @type {fabric.Image}
	         */
	        _this.canvasImage = null;

	        /**
	         * Max width of canvas elements
	         * @type {number}
	         */
	        _this.cssMaxWidth = DEFAULT_CSS_MAX_WIDTH;

	        /**
	         * Max height of canvas elements
	         * @type {number}
	         */
	        _this.cssMaxHeight = DEFAULT_CSS_MAX_HEIGHT;

	        /**
	         * Image name
	         * @type {string}
	         */
	        _this.imageName = '';
	        return _this;
	    }

	    /**
	     * To data url from canvas
	     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
	     * @returns {string} A DOMString containing the requested data URI.
	     */


	    _createClass(Main, [{
	        key: 'toDataURL',
	        value: function toDataURL(type) {
	            return this.canvas && this.canvas.toDataURL(type);
	        }

	        /**
	         * Save image(background) of canvas
	         * @param {string} name - Name of image
	         * @param {?fabric.Image} canvasImage - Fabric image instance
	         * @override
	         */

	    }, {
	        key: 'setCanvasImage',
	        value: function setCanvasImage(name, canvasImage) {
	            if (canvasImage) {
	                tui.util.stamp(canvasImage);
	            }
	            this.imageName = name;
	            this.canvasImage = canvasImage;
	        }

	        /**
	         * Set css max dimension
	         * @param {{width: number, height: number}} maxDimension - Max width & Max height
	         */

	    }, {
	        key: 'setCssMaxDimension',
	        value: function setCssMaxDimension(maxDimension) {
	            this.cssMaxWidth = maxDimension.width || this.cssMaxWidth;
	            this.cssMaxHeight = maxDimension.height || this.cssMaxHeight;
	        }

	        /**
	         * Set canvas element to fabric.Canvas
	         * @param {jQuery|Element|string} element - Wrapper or canvas element or selector
	         * @override
	         */

	    }, {
	        key: 'setCanvasElement',
	        value: function setCanvasElement(element) {
	            var selectedElement = void 0;
	            var canvasElement = void 0;

	            if (element.jquery) {
	                selectedElement = element[0];
	            } else if (element.nodeType) {
	                selectedElement = element;
	            } else {
	                selectedElement = document.querySelector(element);
	            }

	            if (selectedElement.nodeName.toUpperCase() !== 'CANVAS') {
	                canvasElement = document.createElement('canvas');
	                selectedElement.appendChild(canvasElement);
	            }

	            this.canvas = new fabric.Canvas(canvasElement, {
	                containerClass: 'tui-image-editor-canvas-container',
	                enableRetinaScaling: false
	            });
	        }

	        /**
	         * Adjust canvas dimension with scaling image
	         */

	    }, {
	        key: 'adjustCanvasDimension',
	        value: function adjustCanvasDimension() {
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
	        }

	        /**
	         * Calculate max dimension of canvas
	         * The css-max dimension is dynamically decided with maintaining image ratio
	         * The css-max dimension is lower than canvas dimension (attribute of canvas, not css)
	         * @param {number} width - Canvas width
	         * @param {number} height - Canvas height
	         * @returns {{width: number, height: number}} - Max width & Max height
	         * @private
	         */

	    }, {
	        key: '_calcMaxDimension',
	        value: function _calcMaxDimension(width, height) {
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
	        }

	        /**
	         * Set canvas dimension - css only
	         *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
	         * @param {object} dimension - Canvas css dimension
	         * @override
	         */

	    }, {
	        key: 'setCanvasCssDimension',
	        value: function setCanvasCssDimension(dimension) {
	            this.canvas.setDimensions(dimension, cssOnly);
	        }

	        /**
	         * Set canvas dimension - backstore only
	         *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
	         * @param {object} dimension - Canvas backstore dimension
	         * @override
	         */

	    }, {
	        key: 'setCanvasBackstoreDimension',
	        value: function setCanvasBackstoreDimension(dimension) {
	            this.canvas.setDimensions(dimension, backstoreOnly);
	        }

	        /**
	         * Set image properties
	         * {@link http://fabricjs.com/docs/fabric.Image.html#set}
	         * @param {object} setting - Image properties
	         * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
	         * @override
	         */

	    }, {
	        key: 'setImageProperties',
	        value: function setImageProperties(setting, withRendering) {
	            var canvasImage = this.canvasImage;

	            if (!canvasImage) {
	                return;
	            }

	            canvasImage.set(setting).setCoords();
	            if (withRendering) {
	                this.canvas.renderAll();
	            }
	        }

	        /**
	         * Returns canvas element of fabric.Canvas[[lower-canvas]]
	         * @returns {HTMLCanvasElement}
	         * @override
	         */

	    }, {
	        key: 'getCanvasElement',
	        value: function getCanvasElement() {
	            return this.canvas.getElement();
	        }

	        /**
	         * Get fabric.Canvas instance
	         * @override
	         * @returns {fabric.Canvas}
	         */

	    }, {
	        key: 'getCanvas',
	        value: function getCanvas() {
	            return this.canvas;
	        }

	        /**
	         * Get canvasImage (fabric.Image instance)
	         * @override
	         * @returns {fabric.Image}
	         */

	    }, {
	        key: 'getCanvasImage',
	        value: function getCanvasImage() {
	            return this.canvasImage;
	        }

	        /**
	         * Get image name
	         * @override
	         * @returns {string}
	         */

	    }, {
	        key: 'getImageName',
	        value: function getImageName() {
	            return this.imageName;
	        }
	    }]);

	    return Main;
	}(_component2.default);

	module.exports = Main;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _promise = __webpack_require__(3);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image flip module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages;

	/**
	 * Flip
	 * @class Flip
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */

	var Flip = function (_Component) {
	    _inherits(Flip, _Component);

	    function Flip(parent) {
	        _classCallCheck(this, Flip);

	        var _this = _possibleConstructorReturn(this, (Flip.__proto__ || Object.getPrototypeOf(Flip)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = componentNames.FLIP;
	        return _this;
	    }

	    /**
	     * Get current flip settings
	     * @returns {{flipX: Boolean, flipY: Boolean}}
	     */


	    _createClass(Flip, [{
	        key: 'getCurrentSetting',
	        value: function getCurrentSetting() {
	            var canvasImage = this.getCanvasImage();

	            return {
	                flipX: canvasImage.flipX,
	                flipY: canvasImage.flipY
	            };
	        }

	        /**
	         * Set flipX, flipY
	         * @param {{flipX: Boolean, flipY: Boolean}} newSetting - Flip setting
	         * @returns {jQuery.Deferred}
	         */

	    }, {
	        key: 'set',
	        value: function set(newSetting) {
	            var setting = this.getCurrentSetting();
	            var isChangingFlipX = setting.flipX !== newSetting.flipX;
	            var isChangingFlipY = setting.flipY !== newSetting.flipY;

	            if (!isChangingFlipX && !isChangingFlipY) {
	                return _promise2.default.reject(rejectMessages.flip);
	            }

	            tui.util.extend(setting, newSetting);
	            this.setImageProperties(setting, true);
	            this._invertAngle(isChangingFlipX, isChangingFlipY);
	            this._flipObjects(isChangingFlipX, isChangingFlipY);

	            return _promise2.default.resolve({
	                setting: setting,
	                angle: this.getCanvasImage().angle
	            });
	        }

	        /**
	         * Invert image angle for flip
	         * @param {boolean} isChangingFlipX - Change flipX
	         * @param {boolean} isChangingFlipY - Change flipY
	         */

	    }, {
	        key: '_invertAngle',
	        value: function _invertAngle(isChangingFlipX, isChangingFlipY) {
	            var canvasImage = this.getCanvasImage();
	            var angle = canvasImage.angle;

	            if (isChangingFlipX) {
	                angle *= -1;
	            }
	            if (isChangingFlipY) {
	                angle *= -1;
	            }
	            canvasImage.setAngle(parseFloat(angle)).setCoords(); // parseFloat for -0 to 0
	        }

	        /**
	         * Flip objects
	         * @param {boolean} isChangingFlipX - Change flipX
	         * @param {boolean} isChangingFlipY - Change flipY
	         * @private
	         */

	    }, {
	        key: '_flipObjects',
	        value: function _flipObjects(isChangingFlipX, isChangingFlipY) {
	            var canvas = this.getCanvas();

	            if (isChangingFlipX) {
	                canvas.forEachObject(function (obj) {
	                    obj.set({
	                        angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
	                        flipX: !obj.flipX,
	                        left: canvas.width - obj.left
	                    }).setCoords();
	                });
	            }
	            if (isChangingFlipY) {
	                canvas.forEachObject(function (obj) {
	                    obj.set({
	                        angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
	                        flipY: !obj.flipY,
	                        top: canvas.height - obj.top
	                    }).setCoords();
	                });
	            }
	            canvas.renderAll();
	        }

	        /**
	         * Reset flip settings
	         * @returns {jQuery.Deferred}
	         */

	    }, {
	        key: 'reset',
	        value: function reset() {
	            return this.set({
	                flipX: false,
	                flipY: false
	            });
	        }

	        /**
	         * Flip x
	         * @returns {jQuery.Deferred}
	         */

	    }, {
	        key: 'flipX',
	        value: function flipX() {
	            var current = this.getCurrentSetting();

	            return this.set({
	                flipX: !current.flipX,
	                flipY: current.flipY
	            });
	        }

	        /**
	         * Flip y
	         * @returns {jQuery.Deferred}
	         */

	    }, {
	        key: 'flipY',
	        value: function flipY() {
	            var current = this.getCurrentSetting();

	            return this.set({
	                flipX: current.flipX,
	                flipY: !current.flipY
	            });
	        }
	    }]);

	    return Flip;
	}(_component2.default);

	module.exports = Flip;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _promise = __webpack_require__(3);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image rotation module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages;

	/**
	 * Image Rotation component
	 * @class Rotation
	 * @extends {Component}
	 * @param {Component} parent - parent component
	 * @ignore
	 */

	var Rotation = function (_Component) {
	    _inherits(Rotation, _Component);

	    function Rotation(parent) {
	        _classCallCheck(this, Rotation);

	        var _this = _possibleConstructorReturn(this, (Rotation.__proto__ || Object.getPrototypeOf(Rotation)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = componentNames.ROTATION;
	        return _this;
	    }

	    /**
	     * Get current angle
	     * @returns {Number}
	     */


	    _createClass(Rotation, [{
	        key: 'getCurrentAngle',
	        value: function getCurrentAngle() {
	            return this.getCanvasImage().angle;
	        }

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

	    }, {
	        key: 'setAngle',
	        value: function setAngle(angle) {
	            var oldAngle = this.getCurrentAngle() % 360; // The angle is lower than 2*PI(===360 degrees)

	            angle %= 360;
	            if (angle === oldAngle) {
	                return _promise2.default.reject(rejectMessages.rotation);
	            }
	            var canvasImage = this.getCanvasImage();
	            var oldImageCenter = canvasImage.getCenterPoint();
	            canvasImage.setAngle(angle).setCoords();
	            this.adjustCanvasDimension();
	            var newImageCenter = canvasImage.getCenterPoint();
	            this._rotateForEachObject(oldImageCenter, newImageCenter, angle - oldAngle);

	            return _promise2.default.resolve(angle);
	        }

	        /**
	         * Rotate for each object
	         * @param {fabric.Point} oldImageCenter - Image center point before rotation
	         * @param {fabric.Point} newImageCenter - Image center point after rotation
	         * @param {number} angleDiff - Image angle difference after rotation
	         * @private
	         */

	    }, {
	        key: '_rotateForEachObject',
	        value: function _rotateForEachObject(oldImageCenter, newImageCenter, angleDiff) {
	            var canvas = this.getCanvas();
	            var centerDiff = {
	                x: oldImageCenter.x - newImageCenter.x,
	                y: oldImageCenter.y - newImageCenter.y
	            };

	            canvas.forEachObject(function (obj) {
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
	        }

	        /**
	         * Rotate the image
	         * @param {number} additionalAngle - Additional angle
	         * @returns {jQuery.Deferred}
	         */

	    }, {
	        key: 'rotate',
	        value: function rotate(additionalAngle) {
	            var current = this.getCurrentAngle();

	            return this.setAngle(current + additionalAngle);
	        }
	    }]);

	    return Rotation;
	}(_component2.default);

	module.exports = Rotation;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Free drawing module, Set brush
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	/**
	 * FreeDrawing
	 * @class FreeDrawing
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */
	var FreeDrawing = function (_Component) {
	  _inherits(FreeDrawing, _Component);

	  function FreeDrawing(parent) {
	    _classCallCheck(this, FreeDrawing);

	    var _this = _possibleConstructorReturn(this, (FreeDrawing.__proto__ || Object.getPrototypeOf(FreeDrawing)).call(this));

	    _this.setParent(parent);

	    /**
	     * Component name
	     * @type {string}
	     */
	    _this.name = _consts2.default.componentNames.FREE_DRAWING;

	    /**
	     * Brush width
	     * @type {number}
	     */
	    _this.width = 12;

	    /**
	     * fabric.Color instance for brush color
	     * @type {fabric.Color}
	     */
	    _this.oColor = new fabric.Color('rgba(0, 0, 0, 0.5)');
	    return _this;
	  }

	  /**
	   * Start free drawing mode
	   * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	   */


	  _createClass(FreeDrawing, [{
	    key: 'start',
	    value: function start(setting) {
	      var canvas = this.getCanvas();

	      canvas.isDrawingMode = true;
	      this.setBrush(setting);
	    }

	    /**
	     * Set brush
	     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	     */

	  }, {
	    key: 'setBrush',
	    value: function setBrush(setting) {
	      var brush = this.getCanvas().freeDrawingBrush;

	      setting = setting || {};
	      this.width = setting.width || this.width;
	      if (setting.color) {
	        this.oColor = new fabric.Color(setting.color);
	      }
	      brush.width = this.width;
	      brush.color = this.oColor.toRgba();
	    }

	    /**
	     * End free drawing mode
	     */

	  }, {
	    key: 'end',
	    value: function end() {
	      var canvas = this.getCanvas();

	      canvas.isDrawingMode = false;
	    }
	  }]);

	  return FreeDrawing;
	}(_component2.default);

	module.exports = FreeDrawing;

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Free drawing module, Set brush
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var bind = tui.util.bind;

	/**
	 * Line
	 * @class Line
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */

	var Line = function (_Component) {
	    _inherits(Line, _Component);

	    function Line(parent) {
	        _classCallCheck(this, Line);

	        var _this = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = _consts2.default.componentNames.LINE;

	        /**
	         * Brush width
	         * @type {number}
	         * @private
	         */
	        _this._width = 12;

	        /**
	         * fabric.Color instance for brush color
	         * @type {fabric.Color}
	         * @private
	         */
	        _this._oColor = new fabric.Color('rgba(0, 0, 0, 0.5)');

	        /**
	         * Listeners
	         * @type {object.<string, function>}
	         * @private
	         */
	        _this._listeners = {
	            mousedown: bind(_this._onFabricMouseDown, _this),
	            mousemove: bind(_this._onFabricMouseMove, _this),
	            mouseup: bind(_this._onFabricMouseUp, _this)
	        };
	        return _this;
	    }

	    /**
	     * Start drawing line mode
	     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	     */


	    _createClass(Line, [{
	        key: 'start',
	        value: function start(setting) {
	            var canvas = this.getCanvas();

	            canvas.defaultCursor = 'crosshair';
	            canvas.selection = false;

	            this.setBrush(setting);

	            canvas.forEachObject(function (obj) {
	                obj.set({
	                    evented: false
	                });
	            });

	            canvas.on({
	                'mouse:down': this._listeners.mousedown
	            });
	        }

	        /**
	         * Set brush
	         * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
	         */

	    }, {
	        key: 'setBrush',
	        value: function setBrush(setting) {
	            var brush = this.getCanvas().freeDrawingBrush;

	            setting = setting || {};
	            this._width = setting.width || this._width;

	            if (setting.color) {
	                this._oColor = new fabric.Color(setting.color);
	            }
	            brush.width = this._width;
	            brush.color = this._oColor.toRgba();
	        }

	        /**
	         * End drawing line mode
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();

	            canvas.defaultCursor = 'default';
	            canvas.selection = true;

	            canvas.forEachObject(function (obj) {
	                obj.set({
	                    evented: true
	                });
	            });

	            canvas.off('mouse:down', this._listeners.mousedown);
	        }

	        /**
	         * Mousedown event handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            var canvas = this.getCanvas();
	            var pointer = canvas.getPointer(fEvent.e);
	            var points = [pointer.x, pointer.y, pointer.x, pointer.y];

	            this._line = new fabric.Line(points, {
	                stroke: this._oColor.toRgba(),
	                strokeWidth: this._width,
	                evented: false
	            });

	            this._line.set(_consts2.default.fObjectOptions.SELECTION_STYLE);

	            canvas.add(this._line);

	            canvas.on({
	                'mouse:move': this._listeners.mousemove,
	                'mouse:up': this._listeners.mouseup
	            });
	        }

	        /**
	         * Mousemove event handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseMove',
	        value: function _onFabricMouseMove(fEvent) {
	            var canvas = this.getCanvas();
	            var pointer = canvas.getPointer(fEvent.e);

	            this._line.set({
	                x2: pointer.x,
	                y2: pointer.y
	            });

	            this._line.setCoords();

	            canvas.renderAll();
	        }

	        /**
	         * Mouseup event handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp() {
	            var canvas = this.getCanvas();

	            this._line = null;

	            canvas.off({
	                'mouse:move': this._listeners.mousemove,
	                'mouse:up': this._listeners.mouseup
	            });
	        }
	    }]);

	    return Line;
	}(_component2.default);

	module.exports = Line;

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(70);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Text module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


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
	var TEXTAREA_STYLES = _util2.default.makeStyleText({
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

	var Text = function (_Component) {
	    _inherits(Text, _Component);

	    function Text(parent) {
	        _classCallCheck(this, Text);

	        var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = _consts2.default.componentNames.TEXT;

	        /**
	         * Default text style
	         * @type {object}
	         */
	        _this._defaultStyles = defaultStyles;

	        /**
	         * Selected state
	         * @type {boolean}
	         */
	        _this._isSelected = false;

	        /**
	         * Selected text object
	         * @type {object}
	         */
	        _this._selectedObj = {};

	        /**
	         * Editing text object
	         * @type {object}
	         */
	        _this._editingObj = {};

	        /**
	         * Listeners for fabric event
	         * @type {object}
	         */
	        _this._listeners = {};

	        /**
	         * Textarea element for editing
	         * @type {HTMLElement}
	         */
	        _this._textarea = null;

	        /**
	         * Ratio of current canvas
	         * @type {number}
	         */
	        _this._ratio = 1;

	        /**
	         * Last click time
	         * @type {Date}
	         */
	        _this._lastClickTime = new Date().getTime();

	        /**
	         * Text object infos before editing
	         * @type {Object}
	         */
	        _this._editingObjInfos = {};

	        /**
	         * Previous state of editing
	         * @type {boolean}
	         */
	        _this.isPrevEditing = false;
	        return _this;
	    }

	    /**
	     * Start input text mode
	     * @param {object} listeners - Callback functions of fabric event
	     */


	    _createClass(Text, [{
	        key: 'start',
	        value: function start(listeners) {
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
	        }

	        /**
	         * End input text mode
	         */

	    }, {
	        key: 'end',
	        value: function end() {
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
	        }

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

	    }, {
	        key: 'add',
	        value: function add(text, options) {
	            var canvas = this.getCanvas();
	            var styles = this._defaultStyles;

	            this._setInitPos(options.position);

	            if (options.styles) {
	                styles = tui.util.extend(options.styles, styles);
	            }

	            var newText = new fabric.Text(text, styles);
	            newText.set(_consts2.default.fObjectOptions.SELECTION_STYLE);
	            newText.on({
	                mouseup: tui.util.bind(this._onFabricMouseUp, this)
	            });

	            canvas.add(newText);

	            if (!canvas.getActiveObject()) {
	                canvas.setActiveObject(newText);
	            }

	            this.isPrevEditing = true;
	        }

	        /**
	         * Change text of activate object on canvas image
	         * @param {object} activeObj - Current selected text object
	         * @param {string} text - Changed text
	         */

	    }, {
	        key: 'change',
	        value: function change(activeObj, text) {
	            activeObj.set('text', text);

	            this.getCanvas().renderAll();
	        }

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

	    }, {
	        key: 'setStyle',
	        value: function setStyle(activeObj, styleObj) {
	            tui.util.forEach(styleObj, function (val, key) {
	                if (activeObj[key] === val) {
	                    styleObj[key] = resetStyles[key] || '';
	                }
	            }, this);

	            activeObj.set(styleObj);

	            this.getCanvas().renderAll();
	        }

	        /**
	         * Set infos of the current selected object
	         * @param {fabric.Text} obj - Current selected text object
	         * @param {boolean} state - State of selecting
	         */

	    }, {
	        key: 'setSelectedInfo',
	        value: function setSelectedInfo(obj, state) {
	            this._selectedObj = obj;
	            this._isSelected = state;
	        }

	        /**
	         * Whether object is selected or not
	         * @returns {boolean} State of selecting
	         */

	    }, {
	        key: 'isSelected',
	        value: function isSelected() {
	            return this._isSelected;
	        }

	        /**
	         * Get current selected text object
	         * @returns {fabric.Text} Current selected text object
	         */

	    }, {
	        key: 'getSelectedObj',
	        value: function getSelectedObj() {
	            return this._selectedObj;
	        }

	        /**
	         * Set ratio value of canvas
	         */

	    }, {
	        key: 'setCanvasRatio',
	        value: function setCanvasRatio() {
	            var canvasElement = this.getCanvasElement();
	            var cssWidth = parseInt(canvasElement.style.maxWidth, 10);
	            var originWidth = canvasElement.width;
	            var ratio = originWidth / cssWidth;

	            this._ratio = ratio;
	        }

	        /**
	         * Get ratio value of canvas
	         * @returns {number} Ratio value
	         */

	    }, {
	        key: 'getCanvasRatio',
	        value: function getCanvasRatio() {
	            return this._ratio;
	        }

	        /**
	         * Set initial position on canvas image
	         * @param {{x: number, y: number}} [position] - Selected position
	         * @private
	         */

	    }, {
	        key: '_setInitPos',
	        value: function _setInitPos(position) {
	            position = position || this.getCanvasImage().getCenterPoint();

	            this._defaultStyles.left = position.x;
	            this._defaultStyles.top = position.y;
	        }

	        /**
	         * Create textarea element on canvas container
	         * @private
	         */

	    }, {
	        key: '_createTextarea',
	        value: function _createTextarea() {
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
	        }

	        /**
	         * Remove textarea element on canvas container
	         * @private
	         */

	    }, {
	        key: '_removeTextarea',
	        value: function _removeTextarea() {
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
	        }

	        /**
	         * Input event handler
	         * @private
	         */

	    }, {
	        key: '_onInput',
	        value: function _onInput() {
	            var ratio = this.getCanvasRatio();
	            var obj = this._editingObj;
	            var textareaStyle = this._textarea.style;

	            obj.setText(this._textarea.value);

	            textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	            textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	        }

	        /**
	         * Keydown event handler
	         * @private
	         */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown() {
	            var _this2 = this;

	            var ratio = this.getCanvasRatio();
	            var obj = this._editingObj;
	            var textareaStyle = this._textarea.style;

	            setTimeout(function () {
	                obj.setText(_this2._textarea.value);

	                textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	                textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	            }, 0);
	        }

	        /**
	         * Blur event handler
	         * @private
	         */

	    }, {
	        key: '_onBlur',
	        value: function _onBlur() {
	            var ratio = this.getCanvasRatio();
	            var editingObj = this._editingObj;
	            var editingObjInfos = this._editingObjInfos;
	            var transWidth = editingObj.getWidth() / ratio - editingObjInfos.width / ratio;
	            var transHeight = editingObj.getHeight() / ratio - editingObjInfos.height / ratio;

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
	        }

	        /**
	         * Scroll event handler
	         * @private
	         */

	    }, {
	        key: '_onScroll',
	        value: function _onScroll() {
	            this._textarea.scrollLeft = 0;
	            this._textarea.scrollTop = 0;
	        }

	        /**
	         * Fabric scaling event handler
	         * @param {fabric.Event} fEvent - Current scaling event on selected object
	         * @private
	         */

	    }, {
	        key: '_onFabricScaling',
	        value: function _onFabricScaling(fEvent) {
	            var obj = fEvent.target;
	            var scalingSize = obj.getFontSize() * obj.getScaleY();

	            obj.setFontSize(scalingSize);
	            obj.setScaleX(1);
	            obj.setScaleY(1);
	        }

	        /**
	         * Fabric mouseup event handler
	         * @param {fabric.Event} fEvent - Current mousedown event on selected object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp(fEvent) {
	            var newClickTime = new Date().getTime();

	            if (this._isDoubleClick(newClickTime)) {
	                this._changeToEditingMode(fEvent.target);
	                this._listeners.dbclick(); // fire dbclick event
	            }

	            this._lastClickTime = newClickTime;
	        }

	        /**
	         * Get state of firing double click event
	         * @param {Date} newClickTime - Current clicked time
	         * @returns {boolean} Whether double clicked or not
	         * @private
	         */

	    }, {
	        key: '_isDoubleClick',
	        value: function _isDoubleClick(newClickTime) {
	            return newClickTime - this._lastClickTime < DBCLICK_TIME;
	        }

	        /**
	         * Change state of text object for editing
	         * @param {fabric.Text} obj - Text object fired event
	         * @private
	         */

	    }, {
	        key: '_changeToEditingMode',
	        value: function _changeToEditingMode(obj) {
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
	            textareaStyle.left = obj.oCoords.tl.x / ratio + 'px';
	            textareaStyle.top = obj.oCoords.tl.y / ratio + 'px';
	            textareaStyle.width = Math.ceil(obj.getWidth() / ratio) + 'px';
	            textareaStyle.height = Math.ceil(obj.getHeight() / ratio) + 'px';
	            textareaStyle.transform = 'rotate(' + obj.getAngle() + 'deg)';
	            textareaStyle.color = obj.getFill();

	            textareaStyle['font-size'] = obj.getFontSize() / ratio + 'px';
	            textareaStyle['font-family'] = obj.getFontFamily();
	            textareaStyle['font-style'] = obj.getFontStyle();
	            textareaStyle['font-weight'] = obj.getFontWeight();
	            textareaStyle['text-align'] = obj.getTextAlign();
	            textareaStyle['line-height'] = obj.getLineHeight() + EXTRA_PIXEL_LINEHEIGHT;
	            textareaStyle['transform-origin'] = 'left top';

	            this._textarea.focus();
	        }
	    }]);

	    return Text;
	}(_component2.default);

	module.exports = Text;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Add icon module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var pathMap = {
	    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
	    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' + 'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
	};

	/**
	 * Icon
	 * @class Icon
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */

	var Icon = function (_Component) {
	    _inherits(Icon, _Component);

	    function Icon(parent) {
	        _classCallCheck(this, Icon);

	        var _this = _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = _consts2.default.componentNames.ICON;

	        /**
	         * Default icon color
	         * @type {string}
	         */
	        _this._oColor = '#000000';

	        /**
	         * Path value of each icon type
	         * @type {object}
	         */
	        _this._pathMap = pathMap;
	        return _this;
	    }

	    /**
	     * Add icon
	     * @param {string} type - Icon type
	     * @param {object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     */


	    _createClass(Icon, [{
	        key: 'add',
	        value: function add(type, options) {
	            var canvas = this.getCanvas();
	            var path = this._pathMap[type];
	            var selectionStyle = _consts2.default.fObjectOptions.SELECTION_STYLE;

	            if (!path) {
	                return;
	            }

	            var icon = this._createIcon(path);

	            icon.set(tui.util.extend({
	                type: 'icon',
	                fill: this._oColor
	            }, selectionStyle, options));

	            canvas.add(icon).setActiveObject(icon);
	        }

	        /**
	         * Register icon paths
	         * @param {{key: string, value: string}} pathInfos - Path infos
	         */

	    }, {
	        key: 'registerPaths',
	        value: function registerPaths(pathInfos) {
	            var _this2 = this;

	            tui.util.forEach(pathInfos, function (path, type) {
	                _this2._pathMap[type] = path;
	            }, this);
	        }

	        /**
	         * Set icon object color
	         * @param {strign} color - Color to set
	         * @param {fabric.Path}[obj] - Current activated path object
	         */

	    }, {
	        key: 'setColor',
	        value: function setColor(color, obj) {
	            this._oColor = color;

	            if (obj && obj.get('type') === 'icon') {
	                obj.setFill(this._oColor);
	                this.getCanvas().renderAll();
	            }
	        }

	        /**
	         * Create icon object
	         * @param {string} path - Path value to create icon
	         * @returns {fabric.Path} Path object
	         */

	    }, {
	        key: '_createIcon',
	        value: function _createIcon(path) {
	            return new fabric.Path(path);
	        }
	    }]);

	    return Icon;
	}(_component2.default);

	module.exports = Icon;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _promise = __webpack_require__(3);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _mask = __webpack_require__(81);

	var _mask2 = _interopRequireDefault(_mask);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Add filter module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	/**
	 * Filter
	 * @class Filter
	 * @param {Component} parent - parent component
	 * @extends {Component}
	 * @ignore
	 */
	var Filter = function (_Component) {
	    _inherits(Filter, _Component);

	    function Filter(parent) {
	        _classCallCheck(this, Filter);

	        var _this = _possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = _consts2.default.componentNames.FILTER;
	        return _this;
	    }

	    /**
	     * Add filter to source image (a specific filter is added on fabric.js)
	     * @param {string} type - Filter type
	     * @param {object} [options] - Options of filter
	     * @returns {Promise}
	     */


	    _createClass(Filter, [{
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var filter = _this2._createFilter(type, options);
	                var sourceImg = _this2._getSourceImage();
	                var canvas = _this2.getCanvas();

	                if (!filter) {
	                    reject();
	                }

	                sourceImg.filters.push(filter);

	                _this2._apply(sourceImg, function () {
	                    canvas.renderAll();
	                    resolve({
	                        type: type,
	                        action: 'add'
	                    });
	                });
	            });
	        }

	        /**
	         * Remove filter to source image
	         * @param {string} type - Filter type
	         * @returns {Promise}
	         */

	    }, {
	        key: 'remove',
	        value: function remove(type) {
	            var _this3 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var sourceImg = _this3._getSourceImage();
	                var canvas = _this3.getCanvas();

	                if (!sourceImg.filters.length) {
	                    reject();
	                }

	                sourceImg.filters.pop();

	                _this3._apply(sourceImg, function () {
	                    canvas.renderAll();
	                    resolve({
	                        type: type,
	                        atction: 'remove'
	                    });
	                });
	            });
	        }

	        /**
	         * Apply filter
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {function} callback - Executed function after applying filter
	         * @private
	         */

	    }, {
	        key: '_apply',
	        value: function _apply(sourceImg, callback) {
	            sourceImg.applyFilters(callback);
	        }

	        /**
	         * Get source image on canvas
	         * @returns {fabric.Image} Current source image on canvas
	         * @private
	         */

	    }, {
	        key: '_getSourceImage',
	        value: function _getSourceImage() {
	            return this.getCanvasImage();
	        }

	        /**
	         * Create filter instance
	         * @param {string} type - Filter type
	         * @param {object} [options] - Options of filter
	         * @returns {object} Fabric object of filter
	         * @private
	         */

	    }, {
	        key: '_createFilter',
	        value: function _createFilter(type, options) {
	            var filterObj = void 0;

	            switch (type) {
	                case 'mask':
	                    filterObj = new _mask2.default(options);
	                    break;
	                case 'removeWhite':
	                    filterObj = new fabric.Image.filters.RemoveWhite(options);
	                    break;
	                default:
	                    filterObj = null;
	            }

	            return filterObj;
	        }
	    }]);

	    return Filter;
	}(_component2.default);

	module.exports = Filter;

/***/ },
/* 81 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Mask extending fabric.Image.filters.Mask
	 */
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
	    applyTo: function applyTo(canvasEl) {
	        if (!this.mask) {
	            return;
	        }

	        var width = canvasEl.width;
	        var height = canvasEl.height;
	        var maskCanvasEl = this._createCanvasOfMask(width, height);
	        var ctx = canvasEl.getContext('2d');
	        var maskCtx = maskCanvasEl.getContext('2d');
	        var imageData = ctx.getImageData(0, 0, width, height);

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
	    _createCanvasOfMask: function _createCanvasOfMask(width, height) {
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
	    _drawMask: function _drawMask(maskCtx) {
	        var mask = this.mask;
	        var maskImg = mask.getElement();

	        var left = mask.getLeft();
	        var top = mask.getTop();
	        var angle = mask.getAngle();

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
	    _mapData: function _mapData(maskCtx, imageData, width, height) {
	        var sourceData = imageData.data;
	        var maskData = maskCtx.getImageData(0, 0, width, height).data;
	        var channel = this.channel;
	        var len = imageData.width * imageData.height * 4;

	        for (var i = 0; i < len; i += 4) {
	            sourceData[i + 3] = maskData[i + channel]; // adjust value of alpha data
	        }
	    }
	});

	module.exports = Mask;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _component = __webpack_require__(68);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	var _shapeResizeHelper = __webpack_require__(83);

	var _shapeResizeHelper2 = _interopRequireDefault(_shapeResizeHelper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Shape component
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var _tui$util = tui.util,
	    extend = _tui$util.extend,
	    bind = _tui$util.bind,
	    inArray = _tui$util.inArray;


	var KEY_CODES = _consts2.default.keyCodes;
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

	var Shape = function (_Component) {
	    _inherits(Shape, _Component);

	    function Shape(parent) {
	        _classCallCheck(this, Shape);

	        var _this = _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this));

	        _this.setParent(parent);

	        /**
	         * Component name
	         * @type {string}
	         */
	        _this.name = _consts2.default.componentNames.SHAPE;

	        /**
	         * Object of The drawing shape
	         * @type {fabric.Object}
	         * @private
	         */
	        _this._shapeObj = null;

	        /**
	         * Type of the drawing shape
	         * @type {string}
	         * @private
	         */
	        _this._type = DEFAULT_TYPE;

	        /**
	         * Options to draw the shape
	         * @type {object}
	         * @private
	         */
	        _this._options = DEFAULT_OPTIONS;

	        /**
	         * Whether the shape object is selected or not
	         * @type {boolean}
	         * @private
	         */
	        _this._isSelected = false;

	        /**
	         * Pointer for drawing shape (x, y)
	         * @type {object}
	         * @private
	         */
	        _this._startPoint = {};

	        /**
	         * Using shortcut on drawing shape
	         * @type {boolean}
	         * @private
	         */
	        _this._withShiftKey = false;

	        /**
	         * Event handler list
	         * @type {object}
	         * @private
	         */
	        _this._handlers = {
	            mousedown: bind(_this._onFabricMouseDown, _this),
	            mousemove: bind(_this._onFabricMouseMove, _this),
	            mouseup: bind(_this._onFabricMouseUp, _this),
	            keydown: bind(_this._onKeyDown, _this),
	            keyup: bind(_this._onKeyUp, _this)
	        };
	        return _this;
	    }

	    /**
	     * Start to draw the shape on canvas
	     * @ignore
	     */


	    _createClass(Shape, [{
	        key: 'startDrawingMode',
	        value: function startDrawingMode() {
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
	        }

	        /**
	         * End to draw the shape on canvas
	         * @ignore
	         */

	    }, {
	        key: 'endDrawingMode',
	        value: function endDrawingMode() {
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
	        }

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

	    }, {
	        key: 'setStates',
	        value: function setStates(type, options) {
	            this._type = type;

	            if (options) {
	                this._options = extend(this._options, options);
	            }
	        }

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

	    }, {
	        key: 'add',
	        value: function add(type, options) {
	            var canvas = this.getCanvas();
	            options = this._createOptions(options);
	            var shapeObj = this._createInstance(type, options);

	            this._bindEventOnShape(shapeObj);

	            canvas.add(shapeObj);
	        }

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

	    }, {
	        key: 'change',
	        value: function change(shapeObj, options) {
	            if (inArray(shapeObj.get('type'), shapeType) < 0) {
	                return;
	            }

	            shapeObj.set(options);
	            this.getCanvas().renderAll();
	        }

	        /**
	         * Create the instance of shape
	         * @param {string} type - Shape type
	         * @param {object} options - Options to creat the shape
	         * @returns {fabric.Object} Shape instance
	         * @private
	         */

	    }, {
	        key: '_createInstance',
	        value: function _createInstance(type, options) {
	            var instance = void 0;

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
	        }

	        /**
	         * Get the options to create the shape
	         * @param {object} options - Options to creat the shape
	         * @returns {object} Shape options
	         * @private
	         */

	    }, {
	        key: '_createOptions',
	        value: function _createOptions(options) {
	            var selectionStyles = _consts2.default.fObjectOptions.SELECTION_STYLE;

	            options = extend({}, DEFAULT_OPTIONS, selectionStyles, options);

	            if (options.isRegular) {
	                options.lockUniScaling = true;
	            }

	            return options;
	        }

	        /**
	         * Bind fabric events on the creating shape object
	         * @param {fabric.Object} shapeObj - Shape object
	         * @private
	         */

	    }, {
	        key: '_bindEventOnShape',
	        value: function _bindEventOnShape(shapeObj) {
	            var self = this;
	            var canvas = this.getCanvas();

	            shapeObj.on({
	                added: function added() {
	                    self._shapeObj = this;
	                    _shapeResizeHelper2.default.setOrigins(self._shapeObj);
	                },
	                selected: function selected() {
	                    self._isSelected = true;
	                    self._shapeObj = this;
	                    canvas.uniScaleTransform = true;
	                    canvas.defaultCursor = 'default';
	                    _shapeResizeHelper2.default.setOrigins(self._shapeObj);
	                },
	                deselected: function deselected() {
	                    self._isSelected = false;
	                    self._shapeObj = null;
	                    canvas.defaultCursor = 'crosshair';
	                    canvas.uniScaleTransform = false;
	                },
	                modified: function modified() {
	                    var currentObj = self._shapeObj;

	                    _shapeResizeHelper2.default.adjustOriginToCenter(currentObj);
	                    _shapeResizeHelper2.default.setOrigins(currentObj);
	                },
	                scaling: function scaling(fEvent) {
	                    var pointer = canvas.getPointer(fEvent.e);
	                    var currentObj = self._shapeObj;

	                    canvas.setCursor('crosshair');
	                    _shapeResizeHelper2.default.resize(currentObj, pointer, true);
	                }
	            });
	        }

	        /**
	         * MouseDown event handler on canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            if (!this._isSelected && !this._shapeObj) {
	                var canvas = this.getCanvas();
	                this._startPoint = canvas.getPointer(fEvent.e);

	                canvas.on({
	                    'mouse:move': this._handlers.mousemove,
	                    'mouse:up': this._handlers.mouseup
	                });
	            }
	        }

	        /**
	         * MouseDown event handler on canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseMove',
	        value: function _onFabricMouseMove(fEvent) {
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
	                _shapeResizeHelper2.default.resize(shape, pointer);
	                canvas.renderAll();
	            }
	        }

	        /**
	         * MouseUp event handler on canvas
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseUp',
	        value: function _onFabricMouseUp() {
	            var canvas = this.getCanvas();
	            var shape = this._shapeObj;

	            if (shape) {
	                _shapeResizeHelper2.default.adjustOriginToCenter(shape);
	            }

	            this._shapeObj = null;

	            canvas.off({
	                'mouse:move': this._handlers.mousemove,
	                'mouse:up': this._handlers.mouseup
	            });
	        }

	        /**
	         * Keydown event handler on document
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyDown',
	        value: function _onKeyDown(e) {
	            if (e.keyCode === KEY_CODES.SHIFT) {
	                this._withShiftKey = true;

	                if (this._shapeObj) {
	                    this._shapeObj.isRegular = true;
	                }
	            }
	        }

	        /**
	         * Keyup event handler on document
	         * @param {KeyboardEvent} e - Event object
	         * @private
	         */

	    }, {
	        key: '_onKeyUp',
	        value: function _onKeyUp(e) {
	            if (e.keyCode === KEY_CODES.SHIFT) {
	                this._withShiftKey = false;

	                if (this._shapeObj) {
	                    this._shapeObj.isRegular = false;
	                }
	            }
	        }
	    }]);

	    return Shape;
	}(_component2.default);

	module.exports = Shape;

/***/ },
/* 83 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Shape resize helper
	 */
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
	        originX: sx > rx ? 'right' : 'left',
	        originY: sy > ry ? 'bottom' : 'top'
	    };
	}

	/**
	 * Whether the shape has the center origin or not
	 * @param {fabric.Object} shape - Shape object
	 * @returns {boolean} State
	 * @ignore
	 */
	function hasCenterOrigin(shape) {
	    return shape.getOriginX() === 'center' && shape.getOriginY() === 'center';
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

	    if (shape.isRegular) {
	        var maxScale = Math.max(scaleX, scaleY);

	        width = shape[dimensionKeys.w] * maxScale;
	        height = shape[dimensionKeys.h] * maxScale;
	    }

	    var options = {
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
	    var strokeWidth = shape.strokeWidth;
	    var isTriangle = !!(shape.type === 'triangle');
	    var options = {};
	    var width = Math.abs(origin.x - pointer.x) / divisor;
	    var height = Math.abs(origin.y - pointer.y) / divisor;

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
	    setOrigins: function setOrigins(shape) {
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
	    resize: function resize(shape, pointer, isScaling) {
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
	    adjustOriginToCenter: function adjustOriginToCenter(shape) {
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
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(3);

	var _promise2 = _interopRequireDefault(_promise);

	var _command = __webpack_require__(85);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(69);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Command factory
	                                                   */

	var MAIN = componentNames.MAIN,
	    IMAGE_LOADER = componentNames.IMAGE_LOADER,
	    FLIP = componentNames.FLIP,
	    ROTATION = componentNames.ROTATION,
	    FILTER = componentNames.FILTER;

	var creators = {};

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

	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
	            return new _promise2.default(function (resolve, reject) {
	                var canvas = compMap[MAIN].getCanvas();

	                if (!canvas.contains(object)) {
	                    canvas.add(object);
	                    resolve(object);
	                } else {
	                    reject();
	                }
	            });
	        },

	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
	            return new _promise2.default(function (resolve, reject) {
	                var canvas = compMap[MAIN].getCanvas();

	                if (canvas.contains(object)) {
	                    canvas.remove(object);
	                    resolve(object);
	                } else {
	                    reject();
	                }
	            });
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
	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
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
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
	            var loader = compMap[IMAGE_LOADER];
	            var canvas = loader.getCanvas();
	            var store = this.store;
	            var canvasContext = canvas;

	            canvas.clear();
	            canvas.add.apply(canvasContext, store.objects);

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
	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
	            var flipComp = compMap[FLIP];

	            this.store = flipComp.getCurrentSetting();

	            return flipComp[type]();
	        },

	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
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
	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
	            var rotationComp = compMap[ROTATION];

	            this.store = rotationComp.getCurrentAngle();

	            return rotationComp[type](angle);
	        },

	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
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
	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
	            var _this = this;

	            return new _promise2.default(function (resolve, reject) {
	                var canvas = compMap[MAIN].getCanvas();
	                var objs = canvas.getObjects();

	                // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
	                _this.store = objs.slice();
	                if (_this.store.length) {
	                    tui.util.forEach(objs.slice(), function (obj) {
	                        obj.remove();
	                    });
	                    resolve();
	                } else {
	                    reject();
	                }
	            });
	        },

	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
	            var canvas = compMap[MAIN].getCanvas();
	            var canvasContext = canvas;

	            canvas.add.apply(canvasContext, this.store);

	            return _promise2.default.resolve();
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
	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var canvas = compMap[MAIN].getCanvas();
	                var isValidGroup = target && target.isType('group') && !target.isEmpty();

	                if (isValidGroup) {
	                    canvas.discardActiveGroup(); // restore states for each objects
	                    _this2.store = target.getObjects();
	                    target.forEachObject(function (obj) {
	                        obj.remove();
	                    });
	                    resolve();
	                } else if (canvas.contains(target)) {
	                    _this2.store = [target];
	                    target.remove();
	                    resolve();
	                } else {
	                    reject();
	                }
	            });
	        },

	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
	            var canvas = compMap[MAIN].getCanvas();
	            var canvasContext = canvas;

	            canvas.add.apply(canvasContext, this.store);

	            return _promise2.default.resolve();
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
	    return new _command2.default({
	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        execute: function execute(compMap) {
	            var filterComp = compMap[FILTER];

	            if (type === 'mask') {
	                this.store = options.mask;
	                options.mask.remove();
	            }

	            return filterComp.add(type, options);
	        },

	        /**
	         * @param {object.<string, Component>} compMap - Components injection
	         * @returns {Promise}
	         * @ignore
	         */
	        undo: function undo(compMap) {
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
	function create(name) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }

	    return creators[name].apply(null, args);
	}

	module.exports = {
	    create: create
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Command interface
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _errorMessage = __webpack_require__(86);

	var _errorMessage2 = _interopRequireDefault(_errorMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var createMessage = _errorMessage2.default.create;
	var errorTypes = _errorMessage2.default.types;

	/**
	 * Command class
	 * @class
	 * @param {{execute: function, undo: function}} actions - Command actions
	 * @ignore
	 */

	var Command = function () {
	  function Command(actions) {
	    _classCallCheck(this, Command);

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
	  }

	  /**
	   * Execute action
	   * @param {Object.<string, Component>} compMap - Components injection
	   * @abstract
	   */


	  _createClass(Command, [{
	    key: 'execute',
	    value: function execute() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'execute'));
	    }

	    /**
	     * Undo action
	     * @param {Object.<string, Component>} compMap - Components injection
	     * @abstract
	     */

	  }, {
	    key: 'undo',
	    value: function undo() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'undo'));
	    }

	    /**
	     * Attach execute callabck
	     * @param {function} callback - Callback after execution
	     * @returns {Command} this
	     */

	  }, {
	    key: 'setExecuteCallback',
	    value: function setExecuteCallback(callback) {
	      this.executeCallback = callback;

	      return this;
	    }

	    /**
	     * Attach undo callback
	     * @param {function} callback - Callback after undo
	     * @returns {Command} this
	     */

	  }, {
	    key: 'setUndoCallback',
	    value: function setUndoCallback(callback) {
	      this.undoCallback = callback;

	      return this;
	    }
	  }]);

	  return Command;
	}();

	module.exports = Command;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _util = __webpack_require__(70);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var keyMirror = _util2.default.keyMirror; /**
	                                           * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                           * @fileoverview Error-message factory
	                                           */

	var types = keyMirror('UN_IMPLEMENTATION', 'NO_COMPONENT_NAME');
	var messages = {
	    UN_IMPLEMENTATION: 'Should implement a method: ',
	    NO_COMPONENT_NAME: 'Should set a component name'
	};
	var map = {
	    UN_IMPLEMENTATION: function UN_IMPLEMENTATION(methodName) {
	        return messages.UN_IMPLEMENTATION + methodName;
	    },
	    NO_COMPONENT_NAME: function NO_COMPONENT_NAME() {
	        return messages.NO_COMPONENT_NAME;
	    }
	};

	module.exports = {
	    types: tui.util.extend({}, types),

	    create: function create(type) {
	        type = type.toLowerCase();
	        var func = map[type];

	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        return func.apply(undefined, args);
	    }
	};

/***/ }
/******/ ]);