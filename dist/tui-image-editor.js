/*!
 * tui-image-editor.js
 * @version 3.0.2
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("tui-code-snippet"), require("fabric/dist/fabric.require"));
	else if(typeof define === 'function' && define.amd)
		define(["tui-code-snippet", "fabric/dist/fabric.require"], factory);
	else if(typeof exports === 'object')
		exports["ImageEditor"] = factory(require("tui-code-snippet"), require("fabric/dist/fabric.require"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["ImageEditor"] = factory((root["tui"] && root["tui"]["util"]), root["fabric"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_74__) {
return /******/ (function(modules) { // webpackBootstrap
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
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _imageEditor = __webpack_require__(1);

	var _imageEditor2 = _interopRequireDefault(_imageEditor);

	__webpack_require__(99);

	__webpack_require__(100);

	__webpack_require__(101);

	__webpack_require__(102);

	__webpack_require__(103);

	__webpack_require__(104);

	__webpack_require__(105);

	__webpack_require__(106);

	__webpack_require__(107);

	__webpack_require__(108);

	__webpack_require__(109);

	__webpack_require__(110);

	__webpack_require__(111);

	__webpack_require__(112);

	__webpack_require__(113);

	__webpack_require__(114);

	__webpack_require__(115);

	__webpack_require__(116);

	__webpack_require__(117);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = _imageEditor2.default;

	// commands

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Image-editor application class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _invoker2 = __webpack_require__(3);

	var _invoker3 = _interopRequireDefault(_invoker2);

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _graphics = __webpack_require__(73);

	var _graphics2 = _interopRequireDefault(_graphics);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var events = _consts2.default.eventNames;
	var commands = _consts2.default.commandNames;
	var keyCodes = _consts2.default.keyCodes,
	    rejectMessages = _consts2.default.rejectMessages;
	var isUndefined = _tuiCodeSnippet2.default.isUndefined,
	    forEach = _tuiCodeSnippet2.default.forEach,
	    CustomEvents = _tuiCodeSnippet2.default.CustomEvents;

	/**
	 * Image editor
	 * @class
	 * @param {string|jQuery|HTMLElement} wrapper - Wrapper's element or selector
	 * @param {Object} [option] - Canvas max width & height of css
	 *  @param {number} option.cssMaxWidth - Canvas css-max-width
	 *  @param {number} option.cssMaxHeight - Canvas css-max-height
	 */

	var ImageEditor = function () {
	    function ImageEditor(wrapper, option) {
	        _classCallCheck(this, ImageEditor);

	        option = option || {};

	        /**
	         * Invoker
	         * @type {Invoker}
	         * @private
	         */
	        this._invoker = new _invoker3.default();

	        /**
	         * Graphics instance
	         * @type {Graphics}
	         * @private
	         */
	        this._graphics = new _graphics2.default(wrapper, option.cssMaxWidth, option.cssMaxHeight);

	        /**
	         * Event handler list
	         * @type {Object}
	         * @private
	         */
	        this._handlers = {
	            keydown: this._onKeyDown.bind(this),
	            mousedown: this._onMouseDown.bind(this),
	            objectActivated: this._onObjectActivated.bind(this),
	            objectMoved: this._onObjectMoved.bind(this),
	            objectScaled: this._onObjectScaled.bind(this),
	            createdPath: this._onCreatedPath,
	            addText: this._onAddText.bind(this),
	            addObject: this._onAddObject.bind(this),
	            textEditing: this._onTextEditing.bind(this),
	            textChanged: this._onTextChanged.bind(this)
	        };

	        this._attachInvokerEvents();
	        this._attachGraphicsEvents();
	        this._attachDomEvents();

	        if (option.selectionStyle) {
	            this._setSelectionStyle(option.selectionStyle);
	        }
	    }

	    /**
	     * Image filter result
	     * @typedef {Object} FilterResult
	     * @property {string} type - filter type like 'mask', 'Grayscale' and so on
	     * @property {string} action - action type like 'add', 'remove'
	     */

	    /**
	     * Flip status
	     * @typedef {Object} FlipStatus
	     * @property {boolean} flipX - x axis
	     * @property {boolean} flipY - y axis
	     * @property {Number} angle - angle
	     */

	    /**
	     * Rotation status
	     * @typedef {Number} RotateStatus
	     * @property {Number} angle - angle
	     */

	    /**
	     * Old and new Size
	     * @typedef {Object} SizeChange
	     * @property {Number} oldWidth - old width
	     * @property {Number} oldHeight - old height
	     * @property {Number} newWidth - new width
	     * @property {Number} newHeight - new height
	     */

	    /**
	     * @typedef {string} ErrorMsg - {string} error message
	     */

	    /**
	     * @typedef {Object} ObjectProps - graphics object properties
	     * @property {number} id - object id
	     * @property {string} type - object type
	     * @property {string} text - text content
	     * @property {string} left - Left
	     * @property {string} top - Top
	     * @property {string} width - Width
	     * @property {string} height - Height
	     * @property {string} fill - Color
	     * @property {string} stroke - Stroke
	     * @property {string} strokeWidth - StrokeWidth
	     * @property {string} fontFamily - Font type for text
	     * @property {number} fontSize - Font Size
	     * @property {string} fontStyle - Type of inclination (normal / italic)
	     * @property {string} fontWeight - Type of thicker or thinner looking (normal / bold)
	     * @property {string} textAlign - Type of text align (left / center / right)
	     * @property {string} textDecoraiton - Type of line (underline / line-throgh / overline)
	     */

	    /**
	     * Set selection style by init option
	     * @param {Object} styles - Selection styles
	     * @private
	     */


	    _createClass(ImageEditor, [{
	        key: '_setSelectionStyle',
	        value: function _setSelectionStyle(styles) {
	            this._graphics.setSelectionStyle(styles);
	        }

	        /**
	         * Attach invoker events
	         * @private
	         */

	    }, {
	        key: '_attachInvokerEvents',
	        value: function _attachInvokerEvents() {
	            var UNDO_STACK_CHANGED = events.UNDO_STACK_CHANGED,
	                REDO_STACK_CHANGED = events.REDO_STACK_CHANGED;

	            /**
	             * Undo stack changed event
	             * @event ImageEditor#undoStackChanged
	             * @param {Number} length - undo stack length
	             * @example
	             * imageEditor.on('undoStackChanged', function(length) {
	             *     console.log(length);
	             * });
	             */

	            this._invoker.on(UNDO_STACK_CHANGED, this.fire.bind(this, UNDO_STACK_CHANGED));
	            /**
	             * Redo stack changed event
	             * @event ImageEditor#redoStackChanged
	             * @param {Number} length - redo stack length
	             * @example
	             * imageEditor.on('redoStackChanged', function(length) {
	             *     console.log(length);
	             * });
	             */
	            this._invoker.on(REDO_STACK_CHANGED, this.fire.bind(this, REDO_STACK_CHANGED));
	        }

	        /**
	         * Attach canvas events
	         * @private
	         */

	    }, {
	        key: '_attachGraphicsEvents',
	        value: function _attachGraphicsEvents() {
	            this._graphics.on({
	                'mousedown': this._handlers.mousedown,
	                'objectMoved': this._handlers.objectMoved,
	                'objectScaled': this._handlers.objectScaled,
	                'objectActivated': this._handlers.objectActivated,
	                'addText': this._handlers.addText,
	                'addObject': this._handlers.addObject,
	                'textEditing': this._handlers.textEditing,
	                'textChanged': this._handlers.textChanged
	            });
	        }

	        /**
	         * Attach dom events
	         * @private
	         */

	    }, {
	        key: '_attachDomEvents',
	        value: function _attachDomEvents() {
	            // ImageEditor supports IE 9 higher
	            document.addEventListener('keydown', this._handlers.keydown);
	        }

	        /**
	         * Detach dom events
	         * @private
	         */

	    }, {
	        key: '_detachDomEvents',
	        value: function _detachDomEvents() {
	            // ImageEditor supports IE 9 higher
	            document.removeEventListener('keydown', this._handlers.keydown);
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
	            var activeObject = this._graphics.getActiveObject();
	            var activeObjectId = this._graphics.getObjectId(activeObject);

	            if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Z) {
	                // There is no error message on shortcut when it's empty
	                this.undo()['catch'](function () {});
	            }

	            if ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.Y) {
	                // There is no error message on shortcut when it's empty
	                this.redo()['catch'](function () {});
	            }

	            if ((e.keyCode === keyCodes.BACKSPACE || e.keyCode === keyCodes.DEL) && activeObject) {
	                e.preventDefault();
	                this.removeObject(activeObjectId);
	            }
	        }
	        /* eslint-enable complexity */

	        /**
	         * mouse down event handler
	         * @param {Event} event mouse down event
	         * @param {Object} originPointer origin pointer
	         *  @param {Number} originPointer.x x position
	         *  @param {Number} originPointer.y y position
	         * @private
	         */

	    }, {
	        key: '_onMouseDown',
	        value: function _onMouseDown(event, originPointer) {
	            /**
	             * The mouse down event with position x, y on canvas
	             * @event ImageEditor#mousedown
	             * @param {Object} event - browser mouse event object
	             * @param {Object} originPointer origin pointer
	             *  @param {Number} originPointer.x x position
	             *  @param {Number} originPointer.y y position
	             * @example
	             * imageEditor.on('mousedown', function(event, originPointer) {
	             *     console.log(event);
	             *     console.log(originPointer);
	             *     if (imageEditor.hasFilter('colorFilter')) {
	             *         imageEditor.applyFilter('colorFilter', {
	             *             x: parseInt(originPointer.x, 10),
	             *             y: parseInt(originPointer.y, 10)
	             *         });
	             *     }
	             * });
	             */
	            this.fire(events.MOUSE_DOWN, event, originPointer);
	        }

	        /**
	         * Add a 'addObject' command
	         * @param {Object} obj - Fabric object
	         * @private
	         */

	    }, {
	        key: '_pushAddObjectCommand',
	        value: function _pushAddObjectCommand(obj) {
	            var command = _command2.default.create(commands.ADD_OBJECT, this._graphics, obj);
	            this._invoker.pushUndoStack(command);
	        }

	        /**
	         * 'objectActivated' event handler
	         * @param {ObjectProps} props - object properties
	         * @private
	         */

	    }, {
	        key: '_onObjectActivated',
	        value: function _onObjectActivated(props) {
	            /**
	             * The event when object is selected(aka activated).
	             * @event ImageEditor#objectActivated
	             * @param {ObjectProps} objectProps - object properties
	             * @example
	             * imageEditor.on('objectActivated', function(props) {
	             *     console.log(props);
	             *     console.log(props.type);
	             *     console.log(props.id);
	             * });
	             */
	            this.fire(events.OBJECT_ACTIVATED, props);
	        }

	        /**
	         * 'objectMoved' event handler
	         * @param {ObjectProps} props - object properties
	         * @private
	         */

	    }, {
	        key: '_onObjectMoved',
	        value: function _onObjectMoved(props) {
	            /**
	             * The event when object is moved
	             * @event ImageEditor#objectMoved
	             * @param {ObjectProps} props - object properties
	             * @example
	             * imageEditor.on('objectMoved', function(props) {
	             *     console.log(props);
	             *     console.log(props.type);
	             * });
	             */
	            this.fire(events.OBJECT_MOVED, props);
	        }

	        /**
	         * 'objectScaled' event handler
	         * @param {ObjectProps} props - object properties
	         * @private
	         */

	    }, {
	        key: '_onObjectScaled',
	        value: function _onObjectScaled(props) {
	            /**
	             * The event when scale factor is changed
	             * @event ImageEditor#objectScaled
	             * @param {ObjectProps} props - object properties
	             * @example
	             * imageEditor.on('objectScaled', function(props) {
	             *     console.log(props);
	             *     console.log(props.type);
	             * });
	             */
	            this.fire(events.OBJECT_SCALED, props);
	        }

	        /**
	         * Get current drawing mode
	         * @returns {string}
	         * @example
	         * // Image editor drawing mode
	         * //
	         * //    NORMAL: 'NORMAL'
	         * //    CROPPER: 'CROPPER'
	         * //    FREE_DRAWING: 'FREE_DRAWING'
	         * //    LINE_DRAWING: 'LINE_DRAWING'
	         * //    TEXT: 'TEXT'
	         * //
	         * if (imageEditor.getDrawingMode() === 'FREE_DRAWING') {
	         *     imageEditor.stopDrawingMode();
	         * }
	         */

	    }, {
	        key: 'getDrawingMode',
	        value: function getDrawingMode() {
	            return this._graphics.getDrawingMode();
	        }

	        /**
	         * Clear all objects
	         * @returns {Promise}
	         * @example
	         * imageEditor.clearObjects();
	         */

	    }, {
	        key: 'clearObjects',
	        value: function clearObjects() {
	            return this.execute(commands.CLEAR_OBJECTS);
	        }

	        /**
	         * Deactivate all objects
	         * @example
	         * imageEditor.deactivateAll();
	         */

	    }, {
	        key: 'deactivateAll',
	        value: function deactivateAll() {
	            this._graphics.deactivateAll();
	            this._graphics.renderAll();
	        }

	        /**
	         * Invoke command
	         * @param {String} commandName - Command name
	         * @param {...*} args - Arguments for creating command
	         * @returns {Promise}
	         * @private
	         */

	    }, {
	        key: 'execute',
	        value: function execute(commandName) {
	            var _invoker;

	            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	                args[_key - 1] = arguments[_key];
	            }

	            // Inject an Graphics instance as first parameter
	            var theArgs = [this._graphics].concat(args);

	            return (_invoker = this._invoker).execute.apply(_invoker, [commandName].concat(theArgs));
	        }

	        /**
	         * Undo
	         * @returns {Promise}
	         * @example
	         * imageEditor.undo();
	         */

	    }, {
	        key: 'undo',
	        value: function undo() {
	            return this._invoker.undo();
	        }

	        /**
	         * Redo
	         * @returns {Promise}
	         * @example
	         * imageEditor.redo();
	         */

	    }, {
	        key: 'redo',
	        value: function redo() {
	            return this._invoker.redo();
	        }

	        /**
	         * Load image from file
	         * @param {File} imgFile - Image file
	         * @param {string} [imageName] - imageName
	         * @returns {Promise<SizeChange, ErrorMsg>}
	         * @example
	         * imageEditor.loadImageFromFile(file).then(result => {
	         *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
	         *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
	         * });
	         */

	    }, {
	        key: 'loadImageFromFile',
	        value: function loadImageFromFile(imgFile, imageName) {
	            if (!imgFile) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            var imgUrl = URL.createObjectURL(imgFile);
	            imageName = imageName || imgFile.name;

	            return this.loadImageFromURL(imgUrl, imageName).then(function (value) {
	                URL.revokeObjectURL(imgFile);

	                return value;
	            });
	        }

	        /**
	         * Load image from url
	         * @param {string} url - File url
	         * @param {string} imageName - imageName
	         * @returns {Promise<SizeChange, ErrorMsg>}
	         * @example
	         * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena').then(result => {
	         *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
	         *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
	         * });
	         */

	    }, {
	        key: 'loadImageFromURL',
	        value: function loadImageFromURL(url, imageName) {
	            if (!imageName || !url) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            return this.execute(commands.LOAD_IMAGE, imageName, url);
	        }

	        /**
	         * Add image object on canvas
	         * @param {string} imgUrl - Image url to make object
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.addImageObject('path/fileName.jpg').then(objectProps => {
	         *     console.log(ojectProps.id);
	         * });
	         */

	    }, {
	        key: 'addImageObject',
	        value: function addImageObject(imgUrl) {
	            if (!imgUrl) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            return this.execute(commands.ADD_IMAGE_OBJECT, imgUrl);
	        }

	        /**
	         * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
	         * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'</I>
	         * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
	         *  @param {Number} [option.width] brush width
	         *  @param {String} [option.color] brush color
	         * @returns {boolean} true if success or false
	         * @example
	         * imageEditor.startDrawingMode('FREE_DRAWING', {
	         *      width: 10,
	         *      color: 'rgba(255,0,0,0.5)'
	         * });
	         */

	    }, {
	        key: 'startDrawingMode',
	        value: function startDrawingMode(mode, option) {
	            return this._graphics.startDrawingMode(mode, option);
	        }

	        /**
	         * Stop the current drawing mode and back to the 'NORMAL' mode
	         * @example
	         * imageEditor.stopDrawingMode();
	         */

	    }, {
	        key: 'stopDrawingMode',
	        value: function stopDrawingMode() {
	            this._graphics.stopDrawingMode();
	        }

	        /**
	         * Crop this image with rect
	         * @param {Object} rect crop rect
	         *  @param {Number} rect.left left position
	         *  @param {Number} rect.top top position
	         *  @param {Number} rect.width width
	         *  @param {Number} rect.height height
	         * @returns {Promise}
	         * @example
	         * imageEditor.crop(imageEditor.getCropzoneRect());
	         */

	    }, {
	        key: 'crop',
	        value: function crop(rect) {
	            var data = this._graphics.getCroppedImageData(rect);
	            if (!data) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            return this.loadImageFromURL(data.url, data.imageName);
	        }

	        /**
	         * Get the cropping rect
	         * @returns {Object}  {{left: number, top: number, width: number, height: number}} rect
	         */

	    }, {
	        key: 'getCropzoneRect',
	        value: function getCropzoneRect() {
	            return this._graphics.getCropzoneRect();
	        }

	        /**
	         * Flip
	         * @returns {Promise}
	         * @param {string} type - 'flipX' or 'flipY' or 'reset'
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @private
	         */

	    }, {
	        key: '_flip',
	        value: function _flip(type) {
	            return this.execute(commands.FLIP_IMAGE, type);
	        }

	        /**
	         * Flip x
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @example
	         * imageEditor.flipX().then((status => {
	         *     console.log('flipX: ', status.flipX);
	         *     console.log('flipY: ', status.flipY);
	         *     console.log('angle: ', status.angle);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'flipX',
	        value: function flipX() {
	            return this._flip('flipX');
	        }

	        /**
	         * Flip y
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @example
	         * imageEditor.flipY().then(status => {
	         *     console.log('flipX: ', status.flipX);
	         *     console.log('flipY: ', status.flipY);
	         *     console.log('angle: ', status.angle);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'flipY',
	        value: function flipY() {
	            return this._flip('flipY');
	        }

	        /**
	         * Reset flip
	         * @returns {Promise<FlipStatus, ErrorMsg>}
	         * @example
	         * imageEditor.resetFlip().then(status => {
	         *     console.log('flipX: ', status.flipX);
	         *     console.log('flipY: ', status.flipY);
	         *     console.log('angle: ', status.angle);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });;
	         */

	    }, {
	        key: 'resetFlip',
	        value: function resetFlip() {
	            return this._flip('reset');
	        }

	        /**
	         * @param {string} type - 'rotate' or 'setAngle'
	         * @param {number} angle - angle value (degree)
	         * @returns {Promise<RotateStatus, ErrorMsg>}
	         * @private
	         */

	    }, {
	        key: '_rotate',
	        value: function _rotate(type, angle) {
	            return this.execute(commands.ROTATE_IMAGE, type, angle);
	        }

	        /**
	         * Rotate image
	         * @returns {Promise}
	         * @param {number} angle - Additional angle to rotate image
	         * @returns {Promise<RotateStatus, ErrorMsg>}
	         * @example
	         * imageEditor.setAngle(10); // angle = 10
	         * imageEditor.rotate(10); // angle = 20
	         * imageEidtor.setAngle(5); // angle = 5
	         * imageEidtor.rotate(-95); // angle = -90
	         * imageEditor.rotate(10).then(status => {
	         *     console.log('angle: ', status.angle);
	         * })).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'rotate',
	        value: function rotate(angle) {
	            return this._rotate('rotate', angle);
	        }

	        /**
	         * Set angle
	         * @param {number} angle - Angle of image
	         * @returns {Promise<RotateStatus, ErrorMsg>}
	         * @example
	         * imageEditor.setAngle(10); // angle = 10
	         * imageEditor.rotate(10); // angle = 20
	         * imageEidtor.setAngle(5); // angle = 5
	         * imageEidtor.rotate(50); // angle = 55
	         * imageEidtor.setAngle(-40); // angle = -40
	         * imageEditor.setAngle(10).then(status => {
	         *     console.log('angle: ', status.angle);
	         * })).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'setAngle',
	        value: function setAngle(angle) {
	            return this._rotate('setAngle', angle);
	        }

	        /**
	         * Set drawing brush
	         * @param {Object} option brush option
	         *  @param {Number} option.width width
	         *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
	         * @example
	         * imageEditor.startDrawingMode('FREE_DRAWING');
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
	        value: function setBrush(option) {
	            this._graphics.setBrush(option);
	        }

	        /**
	         * Set states of current drawing shape
	         * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	         * @param {Object} [options] - Shape options
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
	         * @example
	         * imageEditor.setDrawingShape('circle', {
	         *     fill: 'transparent',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     rx: 10,
	         *     ry: 100
	         * });
	         * @example
	         * imageEditor.setDrawingShape('triangle', { // When resizing, the shape keep the 1:1 ratio
	         *     width: 1,
	         *     height: 1,
	         *     isRegular: true
	         * });
	         * @example
	         * imageEditor.setDrawingShape('circle', { // When resizing, the shape keep the 1:1 ratio
	         *     rx: 10,
	         *     ry: 10,
	         *     isRegular: true
	         * });
	         */

	    }, {
	        key: 'setDrawingShape',
	        value: function setDrawingShape(type, options) {
	            this._graphics.setDrawingShape(type, options);
	        }

	        /**
	         * Add shape
	         * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	         * @param {Object} options - Shape options
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
	         * @returns {Promise<ObjectProps, ErrorMsg>}
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
	         * @example
	         * imageEditor.addShape('circle', {
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     rx: 10,
	         *     ry: 100,
	         *     isRegular: false
	         * }).then(objectProps => {
	         *     console.log(objectProps.id);
	         * });
	         */

	    }, {
	        key: 'addShape',
	        value: function addShape(type, options) {
	            options = options || {};

	            this._setPositions(options);

	            return this.execute(commands.ADD_SHAPE, type, options);
	        }

	        /**
	         * Change shape
	         * @param {number} id - object id
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	         * @returns {Promise}
	         * @example
	         * // call after selecting shape object on canvas
	         * imageEditor.changeShape(id, { // change rectagle or triangle
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     width: 100,
	         *     height: 200
	         * });
	         * @example
	         * // call after selecting shape object on canvas
	         * imageEditor.changeShape(id, { // change circle
	         *     fill: 'red',
	         *     stroke: 'blue',
	         *     strokeWidth: 3,
	         *     rx: 10,
	         *     ry: 100
	         * });
	         */

	    }, {
	        key: 'changeShape',
	        value: function changeShape(id, options) {
	            return this.execute(commands.CHANGE_SHAPE, id, options);
	        }

	        /**
	         * Add text on image
	         * @param {string} text - Initial input text
	         * @param {Object} [options] Options for generating text
	         *     @param {Object} [options.styles] Initial styles
	         *         @param {string} [options.styles.fill] Color
	         *         @param {string} [options.styles.fontFamily] Font type for text
	         *         @param {number} [options.styles.fontSize] Size
	         *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
	         *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
	         *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	         *     @param {{x: number, y: number}} [options.position] - Initial position
	         * @returns {Promise}
	         * @example
	         * imageEditor.addText('init text');
	         * @example
	         * imageEditor.addText('init text', {
	         *     styles: {
	         *         fill: '#000',
	         *         fontSize: '20',
	         *         fontWeight: 'bold'
	         *     },
	         *     position: {
	         *         x: 10,
	         *         y: 10
	         *     }
	         * }).then(objectProps => {
	         *     console.log(objectProps.id);
	         * });
	         */

	    }, {
	        key: 'addText',
	        value: function addText(text, options) {
	            text = text || '';
	            options = options || {};

	            return this.execute(commands.ADD_TEXT, text, options);
	        }

	        /**
	         * Change contents of selected text object on image
	         * @param {number} id - object id
	         * @param {string} text - Changing text
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.changeText(id, 'change text');
	         */

	    }, {
	        key: 'changeText',
	        value: function changeText(id, text) {
	            text = text || '';

	            return this.execute(commands.CHANGE_TEXT, id, text);
	        }

	        /**
	         * Set style
	         * @param {number} id - object id
	         * @param {Object} styleObj - text styles
	         *     @param {string} [styleObj.fill] Color
	         *     @param {string} [styleObj.fontFamily] Font type for text
	         *     @param {number} [styleObj.fontSize] Size
	         *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
	         *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
	         *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
	         * @returns {Promise}
	         * @example
	         * imageEditor.changeTextStyle(id, {
	         *     fontStyle: 'italic'
	         * });
	         */

	    }, {
	        key: 'changeTextStyle',
	        value: function changeTextStyle(id, styleObj) {
	            return this.execute(commands.CHANGE_TEXT_STYLE, id, styleObj);
	        }

	        /**
	         * 'textChanged' event handler
	         * @param {Object} objectProps changed object properties
	         * @private
	         */

	    }, {
	        key: '_onTextChanged',
	        value: function _onTextChanged(objectProps) {
	            this.changeText(objectProps.id, objectProps.text);
	        }

	        /**
	         * 'textEditing' event handler
	         * @private
	         */

	    }, {
	        key: '_onTextEditing',
	        value: function _onTextEditing() {
	            /**
	             * The event which starts to edit text object
	             * @event ImageEditor#textEditing
	             * @example
	             * imageEditor.on('textEditing', function() {
	             *     console.log('text editing');
	             * });
	             */
	            this.fire(events.TEXT_EDITING);
	        }

	        /**
	         * Mousedown event handler in case of 'TEXT' drawing mode
	         * @param {fabric.Event} event - Current mousedown event object
	         * @private
	         */

	    }, {
	        key: '_onAddText',
	        value: function _onAddText(event) {
	            /**
	             * The event when 'TEXT' drawing mode is enabled and click non-object area.
	             * @event ImageEditor#addText
	             * @param {Object} pos
	             *  @param {Object} pos.originPosition - Current position on origin canvas
	             *      @param {Number} pos.originPosition.x - x
	             *      @param {Number} pos.originPosition.y - y
	             *  @param {Object} pos.clientPosition - Current position on client area
	             *      @param {Number} pos.clientPosition.x - x
	             *      @param {Number} pos.clientPosition.y - y
	             * @example
	             * imageEditor.on('addText', function(pos) {
	             *     imageEditor.addText('Double Click', {
	             *         position: pos.originPosition
	             *     });
	             *     console.log('text position on canvas: ' + pos.originPosition);
	             *     console.log('text position on brwoser: ' + pos.clientPosition);
	             * });
	             */
	            this.fire(events.ADD_TEXT, {
	                originPosition: event.originPosition,
	                clientPosition: event.clientPosition
	            });
	        }

	        /**
	         * 'addObject' event handler
	         * @param {Object} objectProps added object properties
	         * @private
	         */

	    }, {
	        key: '_onAddObject',
	        value: function _onAddObject(objectProps) {
	            var obj = this._graphics.getObject(objectProps.id);
	            this._pushAddObjectCommand(obj);
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
	            this._graphics.registerPaths(infos);
	        }

	        /**
	         * Add icon on canvas
	         * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
	         * @param {Object} options - Icon options
	         *      @param {string} [options.fill] - Icon foreground color
	         *      @param {string} [options.left] - Icon x position
	         *      @param {string} [options.top] - Icon y position
	         * @returns {Promise<ObjectProps, ErrorMsg>}
	         * @example
	         * imageEditor.addIcon('arrow'); // The position is center on canvas
	         * @example
	         * imageEditor.addIcon('arrow', {
	         *     left: 100,
	         *     top: 100
	         * }).then(objectProps => {
	         *     console.log(objectProps.id);
	         * });
	         */

	    }, {
	        key: 'addIcon',
	        value: function addIcon(type, options) {
	            options = options || {};

	            this._setPositions(options);

	            return this.execute(commands.ADD_ICON, type, options);
	        }

	        /**
	         * Change icon color
	         * @param {number} id - object id
	         * @param {string} color - Color for icon
	         * @returns {Promise}
	         * @example
	         * imageEditor.changeIconColor(id, '#000000');
	         */

	    }, {
	        key: 'changeIconColor',
	        value: function changeIconColor(id, color) {
	            return this.execute(commands.CHANGE_ICON_COLOR, id, color);
	        }

	        /**
	         * Remove an object or group by id
	         * @param {number} id - object id
	         * @returns {Promise}
	         * @example
	         * imageEditor.removeObject(id);
	         */

	    }, {
	        key: 'removeObject',
	        value: function removeObject(id) {
	            return this.execute(commands.REMOVE_OBJECT, id);
	        }

	        /**
	         * Whether it has the filter or not
	         * @param {string} type - Filter type
	         * @returns {boolean} true if it has the filter
	         */

	    }, {
	        key: 'hasFilter',
	        value: function hasFilter(type) {
	            return this._graphics.hasFilter(type);
	        }

	        /**
	         * Remove filter on canvas image
	         * @param {string} type - Filter type
	         * @returns {Promise<FilterResult, ErrorMsg>}
	         * @example
	         * imageEditor.removeFilter('Grayscale').then(obj => {
	         *     console.log('filterType: ', obj.type);
	         *     console.log('actType: ', obj.action);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });
	         */

	    }, {
	        key: 'removeFilter',
	        value: function removeFilter(type) {
	            return this.execute(commands.REMOVE_FILTER, type);
	        }

	        /**
	         * Apply filter on canvas image
	         * @param {string} type - Filter type
	         * @param {Object} options - Options to apply filter
	         *  @param {number} options.maskObjId - masking image object id
	         * @returns {Promise<FilterResult, ErrorMsg>}
	         * @example
	         * imageEditor.applyFilter('Grayscale');
	         * @example
	         * imageEditor.applyFilter('mask', {maskObjId: id}).then(obj => {
	         *     console.log('filterType: ', obj.type);
	         *     console.log('actType: ', obj.action);
	         * }).catch(message => {
	         *     console.log('error: ', message);
	         * });;
	         */

	    }, {
	        key: 'applyFilter',
	        value: function applyFilter(type, options) {
	            return this.execute(commands.APPLY_FILTER, type, options);
	        }

	        /**
	         * Get data url
	         * @param {string} type - A DOMString indicating the image format. The default type is image/png.
	         * @returns {string} A DOMString containing the requested data URI
	         * @example
	         * imgEl.src = imageEditor.toDataURL();
	         *
	         * imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage').then(() => {
	         *      imageEditor.addImageObject(imgUrl);
	         * });
	         */

	    }, {
	        key: 'toDataURL',
	        value: function toDataURL(type) {
	            return this._graphics.toDataURL(type);
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
	            return this._graphics.getImageName();
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
	         * @returns {Promise}
	         */

	    }, {
	        key: 'resizeCanvasDimension',
	        value: function resizeCanvasDimension(dimension) {
	            if (!dimension) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            return this.execute(commands.RESIZE_CANVAS_DIMENSION, dimension);
	        }

	        /**
	         * Destroy
	         */

	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            var _this = this;

	            this.stopDrawingMode();
	            this._detachDomEvents();
	            this._graphics.destroy();
	            this._graphics = null;

	            forEach(this, function (value, key) {
	                _this[key] = null;
	            }, this);
	        }

	        /**
	         * Set position
	         * @param {Object} options - Position options (left or top)
	         * @private
	         */

	    }, {
	        key: '_setPositions',
	        value: function _setPositions(options) {
	            var centerPosition = this._graphics.getCenter();

	            if (isUndefined(options.left)) {
	                options.left = centerPosition.left;
	            }

	            if (isUndefined(options.top)) {
	                options.top = centerPosition.top;
	            }
	        }

	        /**
	         * Set properties of active object
	         * @param {number} id - object id
	         * @param {Object} keyValue - key & value
	         * @returns {Promise}
	         * @example
	         * imageEditor.setObjectProperties(id, {
	         *     left:100,
	         *     top:100,
	         *     width: 200,
	         *     height: 200,
	         *     opacity: 0.5
	         * });
	         */

	    }, {
	        key: 'setObjectProperties',
	        value: function setObjectProperties(id, keyValue) {
	            return this.execute(commands.SET_OBJECT_PROPERTIES, id, keyValue);
	        }

	        /**
	         * Get properties of active object corresponding key
	         * @param {number} id - object id
	         * @param {Array<string>|ObjectProps|string} keys - property's key
	         * @returns {ObjectProps} properties if id is valid or null
	         * @example
	         * var props = imageEditor.getObjectProperties(id, 'left');
	         * console.log(props);
	         * @example
	         * var props = imageEditor.getObjectProperties(id, ['left', 'top', 'width', 'height']);
	         * console.log(props);
	         * @example
	         * var props = imageEditor.getObjectProperties(id, {
	         *     left: null,
	         *     top: null,
	         *     width: null,
	         *     height: null,
	         *     opacity: null
	         * });
	         * console.log(props);
	         */

	    }, {
	        key: 'getObjectProperties',
	        value: function getObjectProperties(id, keys) {
	            var object = this._graphics.getObject(id);
	            if (!object) {
	                return null;
	            }

	            return this._graphics.getObjectProperties(id, keys);
	        }

	        /**
	         * Get the canvas size
	         * @returns {Object} {{width: number, height: number}} canvas size
	         * @example
	         * var canvasSize = imageEditor.getCanvasSize();
	         * console.log(canvasSize.width);
	         * console.height(canvasSize.height);
	         */

	    }, {
	        key: 'getCanvasSize',
	        value: function getCanvasSize() {
	            return this._graphics.getCanvasSize();
	        }

	        /**
	         * Get object position by originX, originY
	         * @param {number} id - object id
	         * @param {string} originX - can be 'left', 'center', 'right'
	         * @param {string} originY - can be 'top', 'center', 'bottom'
	         * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
	         * @example
	         * var position = imageEditor.getObjectPosition(id, 'left', 'top');
	         * console.log(position);
	         */

	    }, {
	        key: 'getObjectPosition',
	        value: function getObjectPosition(id, originX, originY) {
	            return this._graphics.getObjectPosition(id, originX, originY);
	        }

	        /**
	         * Set object position  by originX, originY
	         * @param {number} id - object id
	         * @param {Object} posInfo - position object
	         *  @param {number} posInfo.x - x position
	         *  @param {number} posInfo.y - y position
	         *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
	         *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
	         * @returns {Promise}
	         * @example
	         * // align the object to 'left', 'top'
	         * imageEditor.setObjectPosition(id, {
	         *     x: 0,
	         *     y: 0,
	         *     originX: 'left',
	         *     originY: 'top'
	         * });
	         * @example
	         * // align the object to 'right', 'top'
	         * var canvasSize = imageEditor.getCanvasSize();
	         * imageEditor.setObjectPosition(id, {
	         *     x: canvasSize.width,
	         *     y: 0,
	         *     originX: 'right',
	         *     originY: 'top'
	         * });
	         * @example
	         * // align the object to 'left', 'bottom'
	         * var canvasSize = imageEditor.getCanvasSize();
	         * imageEditor.setObjectPosition(id, {
	         *     x: 0,
	         *     y: canvasSize.height,
	         *     originX: 'left',
	         *     originY: 'bottom'
	         * });
	         * @example
	         * // align the object to 'right', 'bottom'
	         * var canvasSize = imageEditor.getCanvasSize();
	         * imageEditor.setObjectPosition(id, {
	         *     x: canvasSize.width,
	         *     y: canvasSize.height,
	         *     originX: 'right',
	         *     originY: 'bottom'
	         * });
	         */

	    }, {
	        key: 'setObjectPosition',
	        value: function setObjectPosition(id, posInfo) {
	            return this.execute(commands.SET_OBJECT_POSITION, id, posInfo);
	        }
	    }]);

	    return ImageEditor;
	}();

	CustomEvents.mixin(ImageEditor);
	module.exports = ImageEditor;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Invoker - invoke commands
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var eventNames = _consts2.default.eventNames,
	    rejectMessages = _consts2.default.rejectMessages;
	var isFunction = _tuiCodeSnippet2.default.isFunction,
	    isString = _tuiCodeSnippet2.default.isString,
	    CustomEvents = _tuiCodeSnippet2.default.CustomEvents;

	/**
	 * Invoker
	 * @class
	 * @ignore
	 */

	var Invoker = function () {
	    function Invoker() {
	        _classCallCheck(this, Invoker);

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
	         * Lock-flag for executing command
	         * @type {boolean}
	         * @private
	         */
	        this._isLocked = false;
	    }

	    /**
	     * Invoke command execution
	     * @param {Command} command - Command
	     * @returns {Promise}
	     * @private
	     */


	    _createClass(Invoker, [{
	        key: '_invokeExecution',
	        value: function _invokeExecution(command) {
	            var _this = this;

	            this.lock();

	            var args = command.args;

	            if (!args) {
	                args = [];
	            }

	            return command.execute.apply(command, args).then(function (value) {
	                _this.pushUndoStack(command);
	                _this.unlock();
	                if (isFunction(command.executeCallback)) {
	                    command.executeCallback(value);
	                }

	                return value;
	            })['catch'](function (message) {
	                _this.unlock();

	                return _promise2.default.reject(message);
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

	            var args = command.args;

	            if (!args) {
	                args = [];
	            }

	            return command.undo.apply(command, args).then(function (value) {
	                _this2.pushRedoStack(command);
	                _this2.unlock();
	                if (isFunction(command.undoCallback)) {
	                    command.undoCallback(value);
	                }

	                return value;
	            })['catch'](function (message) {
	                _this2.unlock();

	                return _promise2.default.reject(message);
	            });
	        }

	        /**
	         * fire REDO_STACK_CHANGED event
	         * @private
	         */

	    }, {
	        key: '_fireRedoStackChanged',
	        value: function _fireRedoStackChanged() {
	            this.fire(eventNames.REDO_STACK_CHANGED, this._redoStack.length);
	        }

	        /**
	         * fire UNDO_STACK_CHANGED event
	         * @private
	         */

	    }, {
	        key: '_fireUndoStackChanged',
	        value: function _fireUndoStackChanged() {
	            this.fire(eventNames.UNDO_STACK_CHANGED, this._undoStack.length);
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
	         * @param {String} commandName - Command name
	         * @param {...*} args - Arguments for creating command
	         * @returns {Promise}
	         */

	    }, {
	        key: 'execute',
	        value: function execute() {
	            var _this3 = this;

	            if (this._isLocked) {
	                return _promise2.default.reject(rejectMessages.isLock);
	            }

	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                args[_key] = arguments[_key];
	            }

	            var command = args[0];

	            if (isString(command)) {
	                command = _command2.default.create.apply(_command2.default, args);
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
	            var message = '';

	            if (command && this._isLocked) {
	                this.pushUndoStack(command, true);
	                command = null;
	            }
	            if (command) {
	                if (this.isEmptyUndoStack()) {
	                    this._fireUndoStackChanged();
	                }
	                promise = this._invokeUndo(command);
	            } else {
	                message = rejectMessages.undo;
	                if (this._isLocked) {
	                    message = message + ' Because ' + rejectMessages.isLock;
	                }
	                promise = _promise2.default.reject(message);
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
	            var message = '';

	            if (command && this._isLocked) {
	                this.pushRedoStack(command, true);
	                command = null;
	            }
	            if (command) {
	                if (this.isEmptyRedoStack()) {
	                    this._fireRedoStackChanged();
	                }
	                promise = this._invokeExecution(command);
	            } else {
	                message = rejectMessages.redo;
	                if (this._isLocked) {
	                    message = message + ' Because ' + rejectMessages.isLock;
	                }
	                promise = _promise2.default.reject(message);
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
	                this._fireUndoStackChanged();
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
	                this._fireRedoStackChanged();
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
	                this._fireUndoStackChanged();
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
	                this._fireRedoStackChanged();
	            }
	        }
	    }]);

	    return Invoker;
	}();

	CustomEvents.mixin(Invoker);
	module.exports = Invoker;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(50);
	__webpack_require__(54);
	module.exports = __webpack_require__(14).Promise;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(7)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(10)(String, 'String', function(iterated){
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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(8)
	  , defined   = __webpack_require__(9);
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

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(11)
	  , $export        = __webpack_require__(12)
	  , redefine       = __webpack_require__(27)
	  , hide           = __webpack_require__(17)
	  , has            = __webpack_require__(28)
	  , Iterators      = __webpack_require__(29)
	  , $iterCreate    = __webpack_require__(30)
	  , setToStringTag = __webpack_require__(46)
	  , getPrototypeOf = __webpack_require__(48)
	  , ITERATOR       = __webpack_require__(47)('iterator')
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

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = true;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(13)
	  , core      = __webpack_require__(14)
	  , ctx       = __webpack_require__(15)
	  , hide      = __webpack_require__(17)
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

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(16);
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

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(18)
	  , createDesc = __webpack_require__(26);
	module.exports = __webpack_require__(22) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(19)
	  , IE8_DOM_DEFINE = __webpack_require__(21)
	  , toPrimitive    = __webpack_require__(25)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(22) ? Object.defineProperty : function defineProperty(O, P, Attributes){
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

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(20);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(22) && !__webpack_require__(23)(function(){
	  return Object.defineProperty(__webpack_require__(24)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(23)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(20)
	  , document = __webpack_require__(13).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(20);
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

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(17);

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ }),
/* 29 */
/***/ (function(module, exports) {

	module.exports = {};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(31)
	  , descriptor     = __webpack_require__(26)
	  , setToStringTag = __webpack_require__(46)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(17)(IteratorPrototype, __webpack_require__(47)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(19)
	  , dPs         = __webpack_require__(32)
	  , enumBugKeys = __webpack_require__(44)
	  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(24)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(45).appendChild(iframe);
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


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(18)
	  , anObject = __webpack_require__(19)
	  , getKeys  = __webpack_require__(33);

	module.exports = __webpack_require__(22) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(34)
	  , enumBugKeys = __webpack_require__(44);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(28)
	  , toIObject    = __webpack_require__(35)
	  , arrayIndexOf = __webpack_require__(38)(false)
	  , IE_PROTO     = __webpack_require__(41)('IE_PROTO');

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

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(36)
	  , defined = __webpack_require__(9);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(37);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ }),
/* 37 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(35)
	  , toLength  = __webpack_require__(39)
	  , toIndex   = __webpack_require__(40);
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

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(8)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(8)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(42)('keys')
	  , uid    = __webpack_require__(43);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(13)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ }),
/* 44 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(13).document && document.documentElement;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(18).f
	  , has = __webpack_require__(28)
	  , TAG = __webpack_require__(47)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(42)('wks')
	  , uid        = __webpack_require__(43)
	  , Symbol     = __webpack_require__(13).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(28)
	  , toObject    = __webpack_require__(49)
	  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(9);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(51);
	var global        = __webpack_require__(13)
	  , hide          = __webpack_require__(17)
	  , Iterators     = __webpack_require__(29)
	  , TO_STRING_TAG = __webpack_require__(47)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(52)
	  , step             = __webpack_require__(53)
	  , Iterators        = __webpack_require__(29)
	  , toIObject        = __webpack_require__(35);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(10)(Array, 'Array', function(iterated, kind){
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

/***/ }),
/* 52 */
/***/ (function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ }),
/* 53 */
/***/ (function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(11)
	  , global             = __webpack_require__(13)
	  , ctx                = __webpack_require__(15)
	  , classof            = __webpack_require__(55)
	  , $export            = __webpack_require__(12)
	  , isObject           = __webpack_require__(20)
	  , aFunction          = __webpack_require__(16)
	  , anInstance         = __webpack_require__(56)
	  , forOf              = __webpack_require__(57)
	  , speciesConstructor = __webpack_require__(61)
	  , task               = __webpack_require__(62).set
	  , microtask          = __webpack_require__(64)()
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
	      , FakePromise = (promise.constructor = {})[__webpack_require__(47)('species')] = function(exec){ exec(empty, empty); };
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
	  Internal.prototype = __webpack_require__(65)($Promise.prototype, {
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
	__webpack_require__(46)($Promise, PROMISE);
	__webpack_require__(66)(PROMISE);
	Wrapper = __webpack_require__(14)[PROMISE];

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
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(67)(function(iter){
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

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(37)
	  , TAG = __webpack_require__(47)('toStringTag')
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

/***/ }),
/* 56 */
/***/ (function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(15)
	  , call        = __webpack_require__(58)
	  , isArrayIter = __webpack_require__(59)
	  , anObject    = __webpack_require__(19)
	  , toLength    = __webpack_require__(39)
	  , getIterFn   = __webpack_require__(60)
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

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(19);
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

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(29)
	  , ITERATOR   = __webpack_require__(47)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(55)
	  , ITERATOR  = __webpack_require__(47)('iterator')
	  , Iterators = __webpack_require__(29);
	module.exports = __webpack_require__(14).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(19)
	  , aFunction = __webpack_require__(16)
	  , SPECIES   = __webpack_require__(47)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(15)
	  , invoke             = __webpack_require__(63)
	  , html               = __webpack_require__(45)
	  , cel                = __webpack_require__(24)
	  , global             = __webpack_require__(13)
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
	  if(__webpack_require__(37)(process) == 'process'){
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

/***/ }),
/* 63 */
/***/ (function(module, exports) {

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

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(13)
	  , macrotask = __webpack_require__(62).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(37)(process) == 'process';

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

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(17);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(13)
	  , core        = __webpack_require__(14)
	  , dP          = __webpack_require__(18)
	  , DESCRIPTORS = __webpack_require__(22)
	  , SPECIES     = __webpack_require__(47)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(47)('iterator')
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

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(69);

	var _command2 = _interopRequireDefault(_command);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commands = {};

	/**
	 * Create a command
	 * @param {string} name - Command name
	 * @param {...*} args - Arguments for creating command
	 * @returns {Command}
	 * @ignore
	 */
	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Command factory
	 */
	function create(name) {
	    var actions = commands[name];
	    if (actions) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        return new _command2.default(actions, args);
	    }

	    return null;
	}

	/**
	 * Register a command with name as a key
	 * @param {Object} command - {name:{string}, execute: {function}, undo: {function}}
	 * @param {string} command.name - command name
	 * @param {function} command.execute - executable function
	 * @param {function} command.undo - undo function
	 * @ignore
	 */
	function register(command) {
	    commands[command.name] = command;
	}

	module.exports = {
	    create: create,
	    register: register
	};

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Command interface
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _errorMessage = __webpack_require__(70);

	var _errorMessage2 = _interopRequireDefault(_errorMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var createMessage = _errorMessage2.default.create;
	var errorTypes = _errorMessage2.default.types;

	/**
	 * Command class
	 * @class
	 * @param {{name:function, execute: function, undo: function,
	 *          executeCallback: function, undoCallback: function}} actions - Command actions
	 * @param {Array} args - passing arguments on execute, undo
	 * @ignore
	 */

	var Command = function () {
	  function Command(actions, args) {
	    _classCallCheck(this, Command);

	    /**
	     * command name
	     * @type {string}
	     */
	    this.name = actions.name;

	    /**
	     * arguments
	     * @type {Array}
	     */
	    this.args = args;

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
	     * @type {function}
	     */
	    this.executeCallback = actions.executeCallback || null;

	    /**
	     * undoCallback
	     * @type {function}
	     */
	    this.undoCallback = actions.undoCallback || null;

	    /**
	     * data for undo
	     * @type {Object}
	     */
	    this.undoData = {};
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

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _util = __webpack_require__(71);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Error-message factory
	 */
	var types = (0, _util.keyMirror)('UN_IMPLEMENTATION', 'NO_COMPONENT_NAME');
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
	    types: _tuiCodeSnippet2.default.extend({}, types),

	    create: function create(type) {
	        type = type.toLowerCase();
	        var func = map[type];

	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        return func.apply(undefined, args);
	    }
	};

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(2);

	var min = Math.min,
	    max = Math.max; /**
	                     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                     * @fileoverview Util
	                     */

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

	        (0, _tuiCodeSnippet.forEach)(args, function (key) {
	            obj[key] = key;
	        });

	        return obj;
	    },


	    /**
	     * Make CSSText
	     * @param {Object} styleObj - Style info object
	     * @returns {string} Connected string of style
	     */
	    makeStyleText: function makeStyleText(styleObj) {
	        var styleStr = '';

	        (0, _tuiCodeSnippet.forEach)(styleObj, function (value, prop) {
	            styleStr += prop + ': ' + value + ';';
	        });

	        return styleStr;
	    },


	    /**
	     * Get object's properties
	     * @param {Object} obj - object
	     * @param {Array} keys - keys
	     * @returns {Object} properties object
	     */
	    getProperties: function getProperties(obj, keys) {
	        var props = {};
	        var length = keys.length;

	        var i = 0;
	        var key = void 0;

	        for (i = 0; i < length; i += 1) {
	            key = keys[i];
	            props[key] = obj[key];
	        }

	        return props;
	    }
	};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _util = __webpack_require__(71);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	    /**
	     * Component names
	     * @type {Object.<string, string>}
	     */
	    componentNames: _util2.default.keyMirror('IMAGE_LOADER', 'CROPPER', 'FLIP', 'ROTATION', 'FREE_DRAWING', 'LINE', 'TEXT', 'ICON', 'FILTER', 'SHAPE'),

	    /**
	     * Command names
	     * @type {Object.<string, string>}
	     */
	    commandNames: {
	        'CLEAR_OBJECTS': 'clearObjects',
	        'LOAD_IMAGE': 'loadImage',
	        'FLIP_IMAGE': 'flip',
	        'ROTATE_IMAGE': 'rotate',
	        'ADD_OBJECT': 'addObject',
	        'REMOVE_OBJECT': 'removeObject',
	        'APPLY_FILTER': 'applyFilter',
	        'REMOVE_FILTER': 'removeFilter',
	        'ADD_ICON': 'addIcon',
	        'CHANGE_ICON_COLOR': 'changeIconColor',
	        'ADD_SHAPE': 'addShape',
	        'CHANGE_SHAPE': 'changeShape',
	        'ADD_TEXT': 'addText',
	        'CHANGE_TEXT': 'changeText',
	        'CHANGE_TEXT_STYLE': 'changeTextStyle',
	        'ADD_IMAGE_OBJECT': 'addImageObject',
	        'RESIZE_CANVAS_DIMENSION': 'resizeCanvasDimension',
	        'SET_OBJECT_PROPERTIES': 'setObjectProperties',
	        'SET_OBJECT_POSITION': 'setObjectPosition'
	    },

	    /**
	     * Event names
	     * @type {Object.<string, string>}
	     */
	    eventNames: {
	        OBJECT_ACTIVATED: 'objectActivated',
	        OBJECT_MOVED: 'objectMoved',
	        OBJECT_SCALED: 'objectScaled',
	        TEXT_EDITING: 'textEditing',
	        TEXT_CHANGED: 'textChanged',
	        ADD_TEXT: 'addText',
	        ADD_OBJECT: 'addObject',
	        MOUSE_DOWN: 'mousedown',
	        // UNDO/REDO Events
	        REDO_STACK_CHANGED: 'redoStackChanged',
	        UNDO_STACK_CHANGED: 'undoStackChanged'
	    },

	    /**
	     * Editor states
	     * @type {Object.<string, string>}
	     */
	    drawingModes: _util2.default.keyMirror('NORMAL', 'CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'),

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
	        redo: 'The promise of redo command is reject.',
	        invalidDrawingMode: 'This operation is not supported in the drawing mode',
	        invalidParameters: 'Invalid parameters',
	        noActiveObject: 'There is no active object.',
	        unsupportedType: 'Unsupported object type',
	        noObject: 'The object is not in canvas.',
	        addedObject: 'The object is already added.'
	    }
	}; /**
	    * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	    * @fileoverview Constants
	    */

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview Graphics module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _imageLoader = __webpack_require__(75);

	var _imageLoader2 = _interopRequireDefault(_imageLoader);

	var _cropper = __webpack_require__(77);

	var _cropper2 = _interopRequireDefault(_cropper);

	var _flip = __webpack_require__(79);

	var _flip2 = _interopRequireDefault(_flip);

	var _rotation = __webpack_require__(80);

	var _rotation2 = _interopRequireDefault(_rotation);

	var _freeDrawing = __webpack_require__(81);

	var _freeDrawing2 = _interopRequireDefault(_freeDrawing);

	var _line = __webpack_require__(82);

	var _line2 = _interopRequireDefault(_line);

	var _text = __webpack_require__(83);

	var _text2 = _interopRequireDefault(_text);

	var _icon = __webpack_require__(84);

	var _icon2 = _interopRequireDefault(_icon);

	var _filter = __webpack_require__(85);

	var _filter2 = _interopRequireDefault(_filter);

	var _shape = __webpack_require__(91);

	var _shape2 = _interopRequireDefault(_shape);

	var _cropper3 = __webpack_require__(93);

	var _cropper4 = _interopRequireDefault(_cropper3);

	var _freeDrawing3 = __webpack_require__(95);

	var _freeDrawing4 = _interopRequireDefault(_freeDrawing3);

	var _lineDrawing = __webpack_require__(96);

	var _lineDrawing2 = _interopRequireDefault(_lineDrawing);

	var _shape3 = __webpack_require__(97);

	var _shape4 = _interopRequireDefault(_shape3);

	var _text3 = __webpack_require__(98);

	var _text4 = _interopRequireDefault(_text3);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(71);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var components = _consts2.default.componentNames;
	var events = _consts2.default.eventNames;
	var drawingModes = _consts2.default.drawingModes,
	    fObjectOptions = _consts2.default.fObjectOptions;
	var extend = _tuiCodeSnippet2.default.extend,
	    stamp = _tuiCodeSnippet2.default.stamp,
	    isArray = _tuiCodeSnippet2.default.isArray,
	    isString = _tuiCodeSnippet2.default.isString,
	    forEachArray = _tuiCodeSnippet2.default.forEachArray,
	    forEachOwnProperties = _tuiCodeSnippet2.default.forEachOwnProperties,
	    CustomEvents = _tuiCodeSnippet2.default.CustomEvents;


	var DEFAULT_CSS_MAX_WIDTH = 1000;
	var DEFAULT_CSS_MAX_HEIGHT = 800;

	var cssOnly = {
	    cssOnly: true
	};
	var backstoreOnly = {
	    backstoreOnly: true
	};

	/**
	 * Graphics class
	 * @class
	 * @param {string|jQuery|HTMLElement} wrapper - Wrapper's element or selector
	 * @param {Object} [option] - Canvas max width & height of css
	 *  @param {number} option.cssMaxWidth - Canvas css-max-width
	 *  @param {number} option.cssMaxHeight - Canvas css-max-height
	 * @ignore
	 */

	var Graphics = function () {
	    function Graphics(element, cssMaxWidth, cssMaxHeight) {
	        _classCallCheck(this, Graphics);

	        /**
	         * Fabric image instance
	         * @type {fabric.Image}
	         */
	        this.canvasImage = null;

	        /**
	         * Max width of canvas elements
	         * @type {number}
	         */
	        this.cssMaxWidth = cssMaxWidth || DEFAULT_CSS_MAX_WIDTH;

	        /**
	         * Max height of canvas elements
	         * @type {number}
	         */
	        this.cssMaxHeight = cssMaxHeight || DEFAULT_CSS_MAX_HEIGHT;

	        /**
	         * Image name
	         * @type {string}
	         */
	        this.imageName = '';

	        /**
	         * Object Map
	         * @type {Object}
	         * @private
	         */
	        this._objects = {};

	        /**
	         * Fabric-Canvas instance
	         * @type {fabric.Canvas}
	         * @private
	         */
	        this._canvas = null;

	        /**
	         * Drawing mode
	         * @type {string}
	         * @private
	         */
	        this._drawingMode = drawingModes.NORMAL;

	        /**
	         * DrawingMode map
	         * @type {Object.<string, DrawingMode>}
	         * @private
	         */
	        this._drawingModeMap = {};

	        /**
	         * Component map
	         * @type {Object.<string, Component>}
	         * @private
	         */
	        this._componentMap = {};

	        /**
	         * fabric event handlers
	         * @type {Object.<string, function>}
	         * @private
	         */
	        this._handler = {
	            onMouseDown: this._onMouseDown.bind(this),
	            onObjectAdded: this._onObjectAdded.bind(this),
	            onObjectRemoved: this._onObjectRemoved.bind(this),
	            onObjectMoved: this._onObjectMoved.bind(this),
	            onObjectScaled: this._onObjectScaled.bind(this),
	            onObjectSelected: this._onObjectSelected.bind(this),
	            onPathCreated: this._onPathCreated.bind(this)
	        };

	        this._setCanvasElement(element);
	        this._createDrawingModeInstances();
	        this._createComponents();
	        this._attachCanvasEvents();
	    }

	    /**
	     * Destroy canvas element
	     */


	    _createClass(Graphics, [{
	        key: 'destroy',
	        value: function destroy() {
	            var wrapperEl = this._canvas.wrapperEl;


	            this._canvas.clear();

	            wrapperEl.parentNode.removeChild(wrapperEl);
	        }

	        /**
	         * Deactivates all objects on canvas
	         * @returns {Graphics} this
	         */

	    }, {
	        key: 'deactivateAll',
	        value: function deactivateAll() {
	            this._canvas.deactivateAll();

	            return this;
	        }

	        /**
	         * Renders all objects on canvas
	         * @returns {Graphics} this
	         */

	    }, {
	        key: 'renderAll',
	        value: function renderAll() {
	            this._canvas.renderAll();

	            return this;
	        }

	        /**
	         * Adds objects on canvas
	         * @param {Object|Array} objects - objects
	         */

	    }, {
	        key: 'add',
	        value: function add(objects) {
	            var _canvas;

	            var theArgs = [];
	            if (isArray(objects)) {
	                theArgs = objects;
	            } else {
	                theArgs.push(objects);
	            }

	            (_canvas = this._canvas).add.apply(_canvas, theArgs);
	        }
	        /**
	         * Removes the object or group
	         * @param {Object} target - graphics object or group
	         * @returns {boolean} true if contains or false
	         */

	    }, {
	        key: 'contains',
	        value: function contains(target) {
	            return this._canvas.contains(target);
	        }

	        /**
	         * Gets all objects or group
	         * @returns {Array} all objects, shallow copy
	         */

	    }, {
	        key: 'getObjects',
	        value: function getObjects() {
	            return this._canvas.getObjects().slice();
	        }

	        /**
	         * Get an object by id
	         * @param {number} id - object id
	         * @returns {fabric.Object} object corresponding id
	         */

	    }, {
	        key: 'getObject',
	        value: function getObject(id) {
	            return this._objects[id];
	        }

	        /**
	         * Removes the object or group
	         * @param {Object} target - graphics object or group
	         */

	    }, {
	        key: 'remove',
	        value: function remove(target) {
	            this._canvas.remove(target);
	        }

	        /**
	         * Removes all object or group
	         * @param {boolean} includesBackground - remove the background image or not
	         * @returns {Array} all objects array which is removed
	         */

	    }, {
	        key: 'removeAll',
	        value: function removeAll(includesBackground) {
	            var canvas = this._canvas;
	            var objects = canvas.getObjects().slice();
	            canvas.remove.apply(canvas, this._canvas.getObjects());

	            if (includesBackground) {
	                canvas.clear();
	            }

	            return objects;
	        }

	        /**
	         * Removes an object or group by id
	         * @param {number} id - object id
	         * @returns {Array} removed objects
	         */

	    }, {
	        key: 'removeObjectById',
	        value: function removeObjectById(id) {
	            var objects = [];
	            var canvas = this._canvas;
	            var target = this.getObject(id);
	            var isValidGroup = target && target.isType('group') && !target.isEmpty();

	            if (isValidGroup) {
	                canvas.discardActiveGroup(); // restore states for each objects
	                target.forEachObject(function (obj) {
	                    objects.push(obj);
	                    obj.remove();
	                });
	            } else if (canvas.contains(target)) {
	                objects.push(target);
	                target.remove();
	            }

	            return objects;
	        }

	        /**
	         * Get an id by object instance
	         * @param {fabric.Object} object object
	         * @returns {number} object id if it exists or null
	         */

	    }, {
	        key: 'getObjectId',
	        value: function getObjectId(object) {
	            var key = null;
	            for (key in this._objects) {
	                if (this._objects.hasOwnProperty(key)) {
	                    if (object === this._objects[key]) {
	                        return key;
	                    }
	                }
	            }

	            return null;
	        }

	        /**
	         * Gets an active object or group
	         * @returns {Object} active object or group instance
	         */

	    }, {
	        key: 'getActiveObject',
	        value: function getActiveObject() {
	            return this._canvas.getActiveObject();
	        }

	        /**
	         * Activates an object or group
	         * @param {Object} target - target object or group
	         */

	    }, {
	        key: 'setActiveObject',
	        value: function setActiveObject(target) {
	            this._canvas.setActiveObject(target);
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
	         * Get current drawing mode
	         * @returns {string}
	         */

	    }, {
	        key: 'getDrawingMode',
	        value: function getDrawingMode() {
	            return this._drawingMode;
	        }

	        /**
	         * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
	         * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE', 'TEXT', 'SHAPE'</I>
	         * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
	         *  @param {Number} [option.width] brush width
	         *  @param {String} [option.color] brush color
	         * @returns {boolean} true if success or false
	         */

	    }, {
	        key: 'startDrawingMode',
	        value: function startDrawingMode(mode, option) {
	            if (this._isSameDrawingMode(mode)) {
	                return true;
	            }

	            // If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
	            this.stopDrawingMode();

	            var drawingModeInstance = this._getDrawingModeInstance(mode);
	            if (drawingModeInstance && drawingModeInstance.start) {
	                drawingModeInstance.start(this, option);

	                this._drawingMode = mode;
	            }

	            return !!drawingModeInstance;
	        }
	        /**
	         * Stop the current drawing mode and back to the 'NORMAL' mode
	         */

	    }, {
	        key: 'stopDrawingMode',
	        value: function stopDrawingMode() {
	            if (this._isSameDrawingMode(drawingModes.NORMAL)) {
	                return;
	            }

	            var drawingModeInstance = this._getDrawingModeInstance(this.getDrawingMode());
	            if (drawingModeInstance && drawingModeInstance.end) {
	                drawingModeInstance.end(this);
	            }
	            this._drawingMode = drawingModes.NORMAL;
	        }

	        /**
	         * To data url from canvas
	         * @param {string} type - A DOMString indicating the image format. The default type is image/png.
	         * @returns {string} A DOMString containing the requested data URI.
	         */

	    }, {
	        key: 'toDataURL',
	        value: function toDataURL(type) {
	            return this._canvas && this._canvas.toDataURL(type);
	        }

	        /**
	         * Save image(background) of canvas
	         * @param {string} name - Name of image
	         * @param {?fabric.Image} canvasImage - Fabric image instance
	         */

	    }, {
	        key: 'setCanvasImage',
	        value: function setCanvasImage(name, canvasImage) {
	            if (canvasImage) {
	                stamp(canvasImage);
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
	         * Adjust canvas dimension with scaling image
	         */

	    }, {
	        key: 'adjustCanvasDimension',
	        value: function adjustCanvasDimension() {
	            var canvasImage = this.canvasImage.scale(1);

	            var _canvasImage$getBound = canvasImage.getBoundingRect(),
	                width = _canvasImage$getBound.width,
	                height = _canvasImage$getBound.height;

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
	            this._canvas.centerObject(canvasImage);
	        }

	        /**
	         * Set canvas dimension - css only
	         *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
	         * @param {Object} dimension - Canvas css dimension
	         */

	    }, {
	        key: 'setCanvasCssDimension',
	        value: function setCanvasCssDimension(dimension) {
	            this._canvas.setDimensions(dimension, cssOnly);
	        }

	        /**
	         * Set canvas dimension - backstore only
	         *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
	         * @param {Object} dimension - Canvas backstore dimension
	         */

	    }, {
	        key: 'setCanvasBackstoreDimension',
	        value: function setCanvasBackstoreDimension(dimension) {
	            this._canvas.setDimensions(dimension, backstoreOnly);
	        }

	        /**
	         * Set image properties
	         * {@link http://fabricjs.com/docs/fabric.Image.html#set}
	         * @param {Object} setting - Image properties
	         * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
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
	                this._canvas.renderAll();
	            }
	        }

	        /**
	         * Returns canvas element of fabric.Canvas[[lower-canvas]]
	         * @returns {HTMLCanvasElement}
	         */

	    }, {
	        key: 'getCanvasElement',
	        value: function getCanvasElement() {
	            return this._canvas.getElement();
	        }

	        /**
	         * Get fabric.Canvas instance
	         * @returns {fabric.Canvas}
	         * @private
	         */

	    }, {
	        key: 'getCanvas',
	        value: function getCanvas() {
	            return this._canvas;
	        }

	        /**
	         * Get canvasImage (fabric.Image instance)
	         * @returns {fabric.Image}
	         */

	    }, {
	        key: 'getCanvasImage',
	        value: function getCanvasImage() {
	            return this.canvasImage;
	        }

	        /**
	         * Get image name
	         * @returns {string}
	         */

	    }, {
	        key: 'getImageName',
	        value: function getImageName() {
	            return this.imageName;
	        }

	        /**
	         * Add image object on canvas
	         * @param {string} imgUrl - Image url to make object
	         * @returns {Promise}
	         */

	    }, {
	        key: 'addImageObject',
	        value: function addImageObject(imgUrl) {
	            var _this = this;

	            var callback = this._callbackAfterLoadingImageObject.bind(this);

	            return new _promise2.default(function (resolve) {
	                _fabric2.default.Image.fromURL(imgUrl, function (image) {
	                    callback(image);
	                    resolve(_this.createObjectProperties(image));
	                }, {
	                    crossOrigin: 'Anonymous'
	                });
	            });
	        }

	        /**
	         * Get center position of canvas
	         * @returns {Object} {left, top}
	         */

	    }, {
	        key: 'getCenter',
	        value: function getCenter() {
	            return this._canvas.getCenter();
	        }

	        /**
	         * Get cropped rect
	         * @returns {Object} rect
	         */

	    }, {
	        key: 'getCropzoneRect',
	        value: function getCropzoneRect() {
	            return this.getComponent(components.CROPPER).getCropzoneRect();
	        }

	        /**
	         * Get cropped image data
	         * @param {Object} cropRect cropzone rect
	         *  @param {Number} cropRect.left left position
	         *  @param {Number} cropRect.top top position
	         *  @param {Number} cropRect.width width
	         *  @param {Number} cropRect.height height
	         * @returns {?{imageName: string, url: string}} cropped Image data
	         */

	    }, {
	        key: 'getCroppedImageData',
	        value: function getCroppedImageData(cropRect) {
	            return this.getComponent(components.CROPPER).getCroppedImageData(cropRect);
	        }

	        /**
	         * Set brush option
	         * @param {Object} option brush option
	         *  @param {Number} option.width width
	         *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
	         */

	    }, {
	        key: 'setBrush',
	        value: function setBrush(option) {
	            var drawingMode = this._drawingMode;
	            var compName = components.FREE_DRAWING;

	            if (drawingMode === drawingModes.LINE) {
	                compName = drawingModes.LINE;
	            }

	            this.getComponent(compName).setBrush(option);
	        }

	        /**
	         * Set states of current drawing shape
	         * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	         * @param {Object} [options] - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stoke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
	         */

	    }, {
	        key: 'setDrawingShape',
	        value: function setDrawingShape(type, options) {
	            this.getComponent(components.SHAPE).setStates(type, options);
	        }

	        /**
	         * Register icon paths
	         * @param {Object} pathInfos - Path infos
	         *  @param {string} pathInfos.key - key
	         *  @param {string} pathInfos.value - value
	         */

	    }, {
	        key: 'registerPaths',
	        value: function registerPaths(pathInfos) {
	            this.getComponent(components.ICON).registerPaths(pathInfos);
	        }

	        /**
	         * Whether it has the filter or not
	         * @param {string} type - Filter type
	         * @returns {boolean} true if it has the filter
	         */

	    }, {
	        key: 'hasFilter',
	        value: function hasFilter(type) {
	            return this.getComponent(components.FILTER).hasFilter(type);
	        }

	        /**
	         * Set selection style of fabric object by init option
	         * @param {Object} styles - Selection styles
	         */

	    }, {
	        key: 'setSelectionStyle',
	        value: function setSelectionStyle(styles) {
	            extend(fObjectOptions.SELECTION_STYLE, styles);
	        }

	        /**
	         * Set object properties
	         * @param {number} id - object id
	         * @param {Object} props - props
	         *     @param {string} [props.fill] Color
	         *     @param {string} [props.fontFamily] Font type for text
	         *     @param {number} [props.fontSize] Size
	         *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
	         *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *     @param {string} [props.textAlign] Type of text align (left / center / right)
	         *     @param {string} [props.textDecoraiton] Type of line (underline / line-throgh / overline)
	         * @returns {Object} applied properties
	         */

	    }, {
	        key: 'setObjectProperties',
	        value: function setObjectProperties(id, props) {
	            var object = this.getObject(id);
	            var clone = extend({}, props);

	            object.set(clone);

	            object.setCoords();

	            this.getCanvas().renderAll();

	            return clone;
	        }

	        /**
	         * Get object properties corresponding key
	         * @param {number} id - object id
	         * @param {Array<string>|ObjectProps|string} keys - property's key
	         * @returns {Object} properties
	         */

	    }, {
	        key: 'getObjectProperties',
	        value: function getObjectProperties(id, keys) {
	            var object = this.getObject(id);
	            var props = {};

	            if (isString(keys)) {
	                props[keys] = object[keys];
	            } else if (isArray(keys)) {
	                forEachArray(keys, function (value) {
	                    props[value] = object[value];
	                });
	            } else {
	                forEachOwnProperties(keys, function (value, key) {
	                    props[key] = object[key];
	                });
	            }

	            return props;
	        }

	        /**
	         * Get object position by originX, originY
	         * @param {number} id - object id
	         * @param {string} originX - can be 'left', 'center', 'right'
	         * @param {string} originY - can be 'top', 'center', 'bottom'
	         * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
	         */

	    }, {
	        key: 'getObjectPosition',
	        value: function getObjectPosition(id, originX, originY) {
	            var targetObj = this.getObject(id);
	            if (!targetObj) {
	                return null;
	            }

	            return targetObj.getPointByOrigin(originX, originY);
	        }

	        /**
	         * Set object position  by originX, originY
	         * @param {number} id - object id
	         * @param {Object} posInfo - position object
	         *  @param {number} posInfo.x - x position
	         *  @param {number} posInfo.y - y position
	         *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
	         *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
	         * @returns {boolean} true if target id is valid or false
	         */

	    }, {
	        key: 'setObjectPosition',
	        value: function setObjectPosition(id, posInfo) {
	            var targetObj = this.getObject(id);
	            var x = posInfo.x,
	                y = posInfo.y,
	                originX = posInfo.originX,
	                originY = posInfo.originY;

	            if (!targetObj) {
	                return false;
	            }

	            var targetOrigin = targetObj.getPointByOrigin(originX, originY);
	            var centerOrigin = targetObj.getPointByOrigin('center', 'center');
	            var diffX = centerOrigin.x - targetOrigin.x;
	            var diffY = centerOrigin.y - targetOrigin.y;

	            targetObj.set({
	                left: x + diffX,
	                top: y + diffY
	            });

	            targetObj.setCoords();

	            return true;
	        }

	        /**
	         * Get the canvas size
	         * @returns {Object} {{width: number, height: number}} image size
	         */

	    }, {
	        key: 'getCanvasSize',
	        value: function getCanvasSize() {
	            var image = this.getCanvasImage();

	            return {
	                width: image ? image.width : 0,
	                height: image ? image.height : 0
	            };
	        }

	        /**
	         * Get a DrawingMode instance
	         * @param {string} modeName - DrawingMode Class Name
	         * @returns {DrawingMode} DrawingMode instance
	         * @private
	         */

	    }, {
	        key: '_getDrawingModeInstance',
	        value: function _getDrawingModeInstance(modeName) {
	            return this._drawingModeMap[modeName];
	        }

	        /**
	         * Set canvas element to fabric.Canvas
	         * @param {jQuery|Element|string} element - Wrapper or canvas element or selector
	         * @private
	         */

	    }, {
	        key: '_setCanvasElement',
	        value: function _setCanvasElement(element) {
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

	            this._canvas = new _fabric2.default.Canvas(canvasElement, {
	                containerClass: 'tui-image-editor-canvas-container',
	                enableRetinaScaling: false
	            });
	        }

	        /**
	         * Creates DrawingMode instances
	         * @private
	         */

	    }, {
	        key: '_createDrawingModeInstances',
	        value: function _createDrawingModeInstances() {
	            this._register(this._drawingModeMap, new _cropper4.default());
	            this._register(this._drawingModeMap, new _freeDrawing4.default());
	            this._register(this._drawingModeMap, new _lineDrawing2.default());
	            this._register(this._drawingModeMap, new _shape4.default());
	            this._register(this._drawingModeMap, new _text4.default());
	        }

	        /**
	         * Create components
	         * @private
	         */

	    }, {
	        key: '_createComponents',
	        value: function _createComponents() {
	            this._register(this._componentMap, new _imageLoader2.default(this));
	            this._register(this._componentMap, new _cropper2.default(this));
	            this._register(this._componentMap, new _flip2.default(this));
	            this._register(this._componentMap, new _rotation2.default(this));
	            this._register(this._componentMap, new _freeDrawing2.default(this));
	            this._register(this._componentMap, new _line2.default(this));
	            this._register(this._componentMap, new _text2.default(this));
	            this._register(this._componentMap, new _icon2.default(this));
	            this._register(this._componentMap, new _filter2.default(this));
	            this._register(this._componentMap, new _shape2.default(this));
	        }

	        /**
	         * Register component
	         * @param {Object} map - map object
	         * @param {Object} module - module which has getName method
	         * @private
	         */

	    }, {
	        key: '_register',
	        value: function _register(map, module) {
	            map[module.getName()] = module;
	        }

	        /**
	         * Get the current drawing mode is same with given mode
	         * @param {string} mode drawing mode
	         * @returns {boolean} true if same or false
	         */

	    }, {
	        key: '_isSameDrawingMode',
	        value: function _isSameDrawingMode(mode) {
	            return this.getDrawingMode() === mode;
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
	         * Callback function after loading image
	         * @param {fabric.Image} obj - Fabric image object
	         * @private
	         */

	    }, {
	        key: '_callbackAfterLoadingImageObject',
	        value: function _callbackAfterLoadingImageObject(obj) {
	            var centerPos = this.getCanvasImage().getCenterPoint();

	            obj.set(_consts2.default.fObjectOptions.SELECTION_STYLE);
	            obj.set({
	                left: centerPos.x,
	                top: centerPos.y,
	                crossOrigin: 'Anonymous'
	            });

	            this.getCanvas().add(obj).setActiveObject(obj);
	        }

	        /**
	         * Attach canvas's events
	         */

	    }, {
	        key: '_attachCanvasEvents',
	        value: function _attachCanvasEvents() {
	            var canvas = this._canvas;
	            var handler = this._handler;
	            canvas.on({
	                'mouse:down': handler.onMouseDown,
	                'object:added': handler.onObjectAdded,
	                'object:removed': handler.onObjectRemoved,
	                'object:moving': handler.onObjectMoved,
	                'object:scaling': handler.onObjectScaled,
	                'object:selected': handler.onObjectSelected,
	                'path:created': handler.onPathCreated
	            });
	        }

	        /**
	         * "mouse:down" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onMouseDown',
	        value: function _onMouseDown(fEvent) {
	            var originPointer = this._canvas.getPointer(fEvent.e);
	            this.fire(events.MOUSE_DOWN, fEvent.e, originPointer);
	        }

	        /**
	         * "object:added" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectAdded',
	        value: function _onObjectAdded(fEvent) {
	            var obj = fEvent.target;
	            if (obj.isType('cropzone')) {
	                return;
	            }

	            this._addFabricObject(obj);
	        }

	        /**
	         * "object:removed" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectRemoved',
	        value: function _onObjectRemoved(fEvent) {
	            var obj = fEvent.target;

	            this._removeFabricObject(stamp(obj));
	        }

	        /**
	         * "object:moving" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectMoved',
	        value: function _onObjectMoved(fEvent) {
	            var target = fEvent.target;

	            var params = this.createObjectProperties(target);

	            this.fire(events.OBJECT_MOVED, params);
	        }

	        /**
	         * "object:scaling" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectScaled',
	        value: function _onObjectScaled(fEvent) {
	            var target = fEvent.target;

	            var params = this.createObjectProperties(target);

	            this.fire(events.OBJECT_SCALED, params);
	        }

	        /**
	         * "object:selected" canvas event handler
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onObjectSelected',
	        value: function _onObjectSelected(fEvent) {
	            var target = fEvent.target;

	            var params = this.createObjectProperties(target);

	            this.fire(events.OBJECT_ACTIVATED, params);
	        }

	        /**
	         * "path:created" canvas event handler
	         * @param {{path: fabric.Path}} obj - Path object
	         * @private
	         */

	    }, {
	        key: '_onPathCreated',
	        value: function _onPathCreated(obj) {
	            obj.path.set(_consts2.default.fObjectOptions.SELECTION_STYLE);

	            var params = this.createObjectProperties(obj.path);

	            this.fire(events.ADD_OBJECT, params);
	        }

	        /**
	         * Return object's properties
	         * @param {fabric.Object} obj - fabric object
	         * @returns {Object} properties object
	         */

	    }, {
	        key: 'createObjectProperties',
	        value: function createObjectProperties(obj) {
	            var predefinedKeys = ['left', 'top', 'width', 'height', 'fill', 'stroke', 'strokeWidth', 'opacity'];
	            var props = {
	                id: stamp(obj),
	                type: obj.type
	            };

	            extend(props, _util2.default.getProperties(obj, predefinedKeys));

	            if (obj.type === 'text') {
	                extend(props, this._createTextProperties(obj, props));
	            }

	            return props;
	        }

	        /**
	         * Get text object's properties
	         * @param {fabric.Object} obj - fabric text object
	         * @param {Object} props - properties
	         * @returns {Object} properties object
	         */

	    }, {
	        key: '_createTextProperties',
	        value: function _createTextProperties(obj) {
	            var predefinedKeys = ['text', 'fontFamily', 'fontSize', 'fontStyle', 'textAlign', 'textDecoration'];
	            var props = {};
	            extend(props, _util2.default.getProperties(obj, predefinedKeys));

	            return props;
	        }

	        /**
	         * Add object array by id
	         * @param {fabric.Object} obj - fabric object
	         * @returns {number} object id
	         */

	    }, {
	        key: '_addFabricObject',
	        value: function _addFabricObject(obj) {
	            var id = stamp(obj);
	            this._objects[id] = obj;

	            return id;
	        }

	        /**
	         * Remove an object in array yb id
	         * @param {number} id - object id
	         */

	    }, {
	        key: '_removeFabricObject',
	        value: function _removeFabricObject(id) {
	            delete this._objects[id];
	        }
	    }]);

	    return Graphics;
	}();

	CustomEvents.mixin(Graphics);
	module.exports = Graphics;

/***/ }),
/* 74 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_74__;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

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
	    crossOrigin: 'Anonymous'
	};

	/**
	 * ImageLoader components
	 * @extends {Component}
	 * @class ImageLoader
	 * @param {Graphics} graphics - Graphics instance
	 * @ignore
	 */

	var ImageLoader = function (_Component) {
	    _inherits(ImageLoader, _Component);

	    function ImageLoader(graphics) {
	        _classCallCheck(this, ImageLoader);

	        return _possibleConstructorReturn(this, (ImageLoader.__proto__ || Object.getPrototypeOf(ImageLoader)).call(this, componentNames.IMAGE_LOADER, graphics));
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
	                        reject(rejectMessages.loadingImageFailed);
	                    }
	                }, imageOption);
	            });
	        }
	    }]);

	    return ImageLoader;
	}(_component2.default);

	module.exports = ImageLoader;

/***/ }),
/* 76 */
/***/ (function(module, exports) {

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
	 * @param {string} name - component name
	 * @param {Graphics} graphics - Graphics instance
	 * @ignore
	 */
	var Component = function () {
	  function Component(name, graphics) {
	    _classCallCheck(this, Component);

	    /**
	     * Component name
	     * @type {string}
	     */
	    this.name = name;

	    /**
	     * Graphics instance
	     * @type {Graphics}
	     */
	    this.graphics = graphics;
	  }

	  /**
	   * Fire Graphics event
	   * @param {Array} args - arguments
	   * @returns {Object} return value
	   */


	  _createClass(Component, [{
	    key: "fire",
	    value: function fire() {
	      var context = this.graphics;

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return this.graphics.fire.apply(context, args);
	    }

	    /**
	     * Save image(background) of canvas
	     * @param {string} name - Name of image
	     * @param {fabric.Image} oImage - Fabric image instance
	     */

	  }, {
	    key: "setCanvasImage",
	    value: function setCanvasImage(name, oImage) {
	      this.graphics.setCanvasImage(name, oImage);
	    }

	    /**
	     * Returns canvas element of fabric.Canvas[[lower-canvas]]
	     * @returns {HTMLCanvasElement}
	     */

	  }, {
	    key: "getCanvasElement",
	    value: function getCanvasElement() {
	      return this.graphics.getCanvasElement();
	    }

	    /**
	     * Get fabric.Canvas instance
	     * @returns {fabric.Canvas}
	     */

	  }, {
	    key: "getCanvas",
	    value: function getCanvas() {
	      return this.graphics.getCanvas();
	    }

	    /**
	     * Get canvasImage (fabric.Image instance)
	     * @returns {fabric.Image}
	     */

	  }, {
	    key: "getCanvasImage",
	    value: function getCanvasImage() {
	      return this.graphics.getCanvasImage();
	    }

	    /**
	     * Get image name
	     * @returns {string}
	     */

	  }, {
	    key: "getImageName",
	    value: function getImageName() {
	      return this.graphics.getImageName();
	    }

	    /**
	     * Get image editor
	     * @returns {ImageEditor}
	     */

	  }, {
	    key: "getEditor",
	    value: function getEditor() {
	      return this.graphics.getEditor();
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
	     * @param {Object} setting - Image properties
	     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
	     */

	  }, {
	    key: "setImageProperties",
	    value: function setImageProperties(setting, withRendering) {
	      this.graphics.setImageProperties(setting, withRendering);
	    }

	    /**
	     * Set canvas dimension - css only
	     * @param {Object} dimension - Canvas css dimension
	     */

	  }, {
	    key: "setCanvasCssDimension",
	    value: function setCanvasCssDimension(dimension) {
	      this.graphics.setCanvasCssDimension(dimension);
	    }

	    /**
	     * Set canvas dimension - css only
	     * @param {Object} dimension - Canvas backstore dimension
	     */

	  }, {
	    key: "setCanvasBackstoreDimension",
	    value: function setCanvasBackstoreDimension(dimension) {
	      this.graphics.setCanvasBackstoreDimension(dimension);
	    }

	    /**
	     * Adjust canvas dimension with scaling image
	     */

	  }, {
	    key: "adjustCanvasDimension",
	    value: function adjustCanvasDimension() {
	      this.graphics.adjustCanvasDimension();
	    }
	  }]);

	  return Component;
	}();

	module.exports = Component;

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _cropzone = __webpack_require__(78);

	var _cropzone2 = _interopRequireDefault(_cropzone);

	var _consts = __webpack_require__(72);

	var _util = __webpack_require__(71);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image crop module (start cropping, end cropping)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var MOUSE_MOVE_THRESHOLD = 10;

	/**
	 * Cropper components
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @class Cropper
	 * @ignore
	 */

	var Cropper = function (_Component) {
	    _inherits(Cropper, _Component);

	    function Cropper(graphics) {
	        _classCallCheck(this, Cropper);

	        /**
	         * Cropzone
	         * @type {Cropzone}
	         * @private
	         */
	        var _this = _possibleConstructorReturn(this, (Cropper.__proto__ || Object.getPrototypeOf(Cropper)).call(this, _consts.componentNames.CROPPER, graphics));

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
	            keydown: _this._onKeyDown.bind(_this),
	            keyup: _this._onKeyUp.bind(_this),
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            mousemove: _this._onFabricMouseMove.bind(_this),
	            mouseup: _this._onFabricMouseUp.bind(_this)
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

	            _fabric2.default.util.addListener(document, 'keydown', this._listeners.keydown);
	            _fabric2.default.util.addListener(document, 'keyup', this._listeners.keyup);
	        }

	        /**
	         * End cropping
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();
	            var cropzone = this._cropzone;

	            if (!cropzone) {
	                return;
	            }
	            cropzone.remove();
	            canvas.selection = true;
	            canvas.defaultCursor = 'default';
	            canvas.off('mouse:down', this._listeners.mousedown);
	            canvas.forEachObject(function (obj) {
	                obj.evented = true;
	            });

	            this._cropzone = null;

	            _fabric2.default.util.removeListener(document, 'keydown', this._listeners.keydown);
	            _fabric2.default.util.removeListener(document, 'keyup', this._listeners.keyup);
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
	            var x = pointer.x,
	                y = pointer.y;

	            var cropzone = this._cropzone;

	            if (Math.abs(x - this._startX) + Math.abs(y - this._startY) > MOUSE_MOVE_THRESHOLD) {
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
	            var left = (0, _util.clamp)(x, 0, startX);
	            var top = (0, _util.clamp)(y, 0, startY);
	            var width = (0, _util.clamp)(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
	            var height = (0, _util.clamp)(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

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
	         * @param {Object} cropRect cropzone rect
	         *  @param {Number} cropRect.left left position
	         *  @param {Number} cropRect.top top position
	         *  @param {Number} cropRect.width width
	         *  @param {Number} cropRect.height height
	         * @returns {?{imageName: string, url: string}} cropped Image data
	         */

	    }, {
	        key: 'getCroppedImageData',
	        value: function getCroppedImageData(cropRect) {
	            var canvas = this.getCanvas();
	            var containsCropzone = canvas.contains(this._cropzone);
	            if (!cropRect) {
	                return null;
	            }

	            if (containsCropzone) {
	                this._cropzone.remove();
	            }

	            var imageData = {
	                imageName: this.getImageName(),
	                url: canvas.toDataURL(cropRect)
	            };

	            if (containsCropzone) {
	                canvas.add(this._cropzone);
	            }

	            return imageData;
	        }

	        /**
	         * Get cropped rect
	         * @returns {Object} rect
	         */

	    }, {
	        key: 'getCropzoneRect',
	        value: function getCropzoneRect() {
	            var cropzone = this._cropzone;

	            if (!cropzone.isValid()) {
	                return null;
	            }

	            return {
	                left: cropzone.getLeft(),
	                top: cropzone.getTop(),
	                width: cropzone.getWidth(),
	                height: cropzone.getHeight()
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
	            if (e.keyCode === _consts.keyCodes.SHIFT) {
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
	            if (e.keyCode === _consts.keyCodes.SHIFT) {
	                this._withShiftKey = false;
	            }
	        }
	    }]);

	    return Cropper;
	}(_component2.default);

	module.exports = Cropper;

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _util = __webpack_require__(71);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var CORNER_TYPE_TOP_LEFT = 'tl'; /**
	                                  * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                  * @fileoverview Cropzone extending fabric.Rect
	                                  */

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
	var Cropzone = _fabric2.default.util.createClass(_fabric2.default.Rect, /** @lends Cropzone.prototype */{
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
	        var _getCoordinates = this._getCoordinates(ctx),
	            x = _getCoordinates.x,
	            y = _getCoordinates.y;

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
	        var width = this.getWidth(),
	            height = this.getHeight(),
	            halfWidth = width / 2,
	            halfHeight = height / 2,
	            left = this.getLeft(),
	            top = this.getTop(),
	            canvasEl = ctx.canvas; // canvas element, not fabric object

	        return {
	            x: _tuiCodeSnippet2.default.map([-(halfWidth + left), // x0
	            -halfWidth, // x1
	            halfWidth, // x2
	            halfWidth + (canvasEl.width - left - width) // x3
	            ], Math.ceil),
	            y: _tuiCodeSnippet2.default.map([-(halfHeight + top), // y0
	            -halfHeight, // y1
	            halfHeight, // y2
	            halfHeight + (canvasEl.height - top - height) // y3
	            ], Math.ceil)
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
	        var left = this.getLeft(),
	            top = this.getTop(),
	            width = this.getWidth(),
	            height = this.getHeight(),
	            maxLeft = this.canvas.getWidth() - width,
	            maxTop = this.canvas.getHeight() - height;

	        this.setLeft((0, _util.clamp)(left, 0, maxLeft));
	        this.setTop((0, _util.clamp)(top, 0, maxTop));
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
	     * @returns {Object} Having left or(and) top or(and) width or(and) height.
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
	            top = (0, _util.clamp)(y, 0, bottom - 1),
	            // 0 <= top <= (bottom - 1)
	        left = (0, _util.clamp)(x, 0, right - 1); // 0 <= left <= (right - 1)

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
	        var _canvas = this.canvas,
	            maxX = _canvas.width,
	            maxY = _canvas.height;
	        var left = this.left,
	            top = this.top;

	        // When scaling "Bottom-Right corner": It fixes left and top coordinates

	        return {
	            width: (0, _util.clamp)(x, left + 1, maxX) - left, // (width = x - left), (left + 1 <= x <= maxX)
	            height: (0, _util.clamp)(y, top + 1, maxY) - top // (height = y - top), (top + 1 <= y <= maxY)
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

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

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
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Flip = function (_Component) {
	    _inherits(Flip, _Component);

	    function Flip(graphics) {
	        _classCallCheck(this, Flip);

	        return _possibleConstructorReturn(this, (Flip.__proto__ || Object.getPrototypeOf(Flip)).call(this, componentNames.FLIP, graphics));
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

	            _tuiCodeSnippet2.default.extend(setting, newSetting);
	            this.setImageProperties(setting, true);
	            this._invertAngle(isChangingFlipX, isChangingFlipY);
	            this._flipObjects(isChangingFlipX, isChangingFlipY);

	            return _promise2.default.resolve({
	                flipX: setting.flipX,
	                flipY: setting.flipY,
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

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Image rotation module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var componentNames = _consts2.default.componentNames;

	/**
	 * Image Rotation component
	 * @class Rotation
	 * @extends {Component}
	 * @param {Graphics} graphics - Graphics instance
	 * @ignore
	 */

	var Rotation = function (_Component) {
	    _inherits(Rotation, _Component);

	    function Rotation(graphics) {
	        _classCallCheck(this, Rotation);

	        return _possibleConstructorReturn(this, (Rotation.__proto__ || Object.getPrototypeOf(Rotation)).call(this, componentNames.ROTATION, graphics));
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
	                var radian = _fabric2.default.util.degreesToRadians(angleDiff);
	                var newObjCenter = _fabric2.default.util.rotatePoint(objCenter, oldImageCenter, radian);

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

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

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
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */
	var FreeDrawing = function (_Component) {
	  _inherits(FreeDrawing, _Component);

	  function FreeDrawing(graphics) {
	    _classCallCheck(this, FreeDrawing);

	    /**
	     * Brush width
	     * @type {number}
	     */
	    var _this = _possibleConstructorReturn(this, (FreeDrawing.__proto__ || Object.getPrototypeOf(FreeDrawing)).call(this, _consts2.default.componentNames.FREE_DRAWING, graphics));

	    _this.width = 12;

	    /**
	     * fabric.Color instance for brush color
	     * @type {fabric.Color}
	     */
	    _this.oColor = new _fabric2.default.Color('rgba(0, 0, 0, 0.5)');
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
	        this.oColor = new _fabric2.default.Color(setting.color);
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

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Free drawing module, Set brush
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var eventNames = _consts2.default.eventNames;

	/**
	 * Line
	 * @class Line
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Line = function (_Component) {
	    _inherits(Line, _Component);

	    function Line(graphics) {
	        _classCallCheck(this, Line);

	        /**
	         * Brush width
	         * @type {number}
	         * @private
	         */
	        var _this = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this, _consts2.default.componentNames.LINE, graphics));

	        _this._width = 12;

	        /**
	         * fabric.Color instance for brush color
	         * @type {fabric.Color}
	         * @private
	         */
	        _this._oColor = new _fabric2.default.Color('rgba(0, 0, 0, 0.5)');

	        /**
	         * Listeners
	         * @type {object.<string, function>}
	         * @private
	         */
	        _this._listeners = {
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            mousemove: _this._onFabricMouseMove.bind(_this),
	            mouseup: _this._onFabricMouseUp.bind(_this)
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
	                this._oColor = new _fabric2.default.Color(setting.color);
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

	            this._line = new _fabric2.default.Line(points, {
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
	            var params = this.graphics.createObjectProperties(this._line);

	            this.fire(eventNames.ADD_OBJECT, params);

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

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	var _util = __webpack_require__(71);

	var _util2 = _interopRequireDefault(_util);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Text module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var events = _consts2.default.eventNames;

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
	var browser = _tuiCodeSnippet2.default.browser;


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
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Text = function (_Component) {
	    _inherits(Text, _Component);

	    function Text(graphics) {
	        _classCallCheck(this, Text);

	        /**
	         * Default text style
	         * @type {Object}
	         */
	        var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, _consts2.default.componentNames.TEXT, graphics));

	        _this._defaultStyles = defaultStyles;

	        /**
	         * Selected state
	         * @type {boolean}
	         */
	        _this._isSelected = false;

	        /**
	         * Selected text object
	         * @type {Object}
	         */
	        _this._selectedObj = {};

	        /**
	         * Editing text object
	         * @type {Object}
	         */
	        _this._editingObj = {};

	        /**
	         * Listeners for fabric event
	         * @type {Object}
	         */
	        _this._listeners = {
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            select: _this._onFabricSelect.bind(_this),
	            selectClear: _this._onFabricSelectClear.bind(_this),
	            scaling: _this._onFabricScaling.bind(_this)
	        };

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
	     */


	    _createClass(Text, [{
	        key: 'start',
	        value: function start() {
	            var canvas = this.getCanvas();

	            canvas.selection = false;
	            canvas.defaultCursor = 'text';
	            canvas.on({
	                'mouse:down': this._listeners.mousedown,
	                'object:selected': this._listeners.select,
	                'before:selection:cleared': this._listeners.selectClear,
	                'object:scaling': this._listeners.scaling
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
	                'object:scaling': this._listeners.scaling
	            });

	            this._removeTextarea();
	        }

	        /**
	         * Add new text on canvas image
	         * @param {string} text - Initial input text
	         * @param {Object} options - Options for generating text
	         *     @param {Object} [options.styles] Initial styles
	         *         @param {string} [options.styles.fill] Color
	         *         @param {string} [options.styles.fontFamily] Font type for text
	         *         @param {number} [options.styles.fontSize] Size
	         *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
	         *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
	         *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	         *     @param {{x: number, y: number}} [options.position] - Initial position
	         * @returns {Promise}
	         */

	    }, {
	        key: 'add',
	        value: function add(text, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve) {
	                var canvas = _this2.getCanvas();
	                var styles = _this2._defaultStyles;

	                _this2._setInitPos(options.position);

	                if (options.styles) {
	                    styles = _tuiCodeSnippet2.default.extend(options.styles, styles);
	                }

	                var newText = new _fabric2.default.Text(text, styles);
	                newText.set(_consts2.default.fObjectOptions.SELECTION_STYLE);
	                newText.on({
	                    mouseup: _this2._onFabricMouseUp.bind(_this2)
	                });

	                canvas.add(newText);

	                if (!canvas.getActiveObject()) {
	                    canvas.setActiveObject(newText);
	                }

	                _this2.isPrevEditing = true;
	                resolve(_this2.graphics.createObjectProperties(newText));
	            });
	        }

	        /**
	         * Change text of activate object on canvas image
	         * @param {Object} activeObj - Current selected text object
	         * @param {string} text - Changed text
	         * @returns {Promise}
	         */

	    }, {
	        key: 'change',
	        value: function change(activeObj, text) {
	            var _this3 = this;

	            return new _promise2.default(function (resolve) {
	                activeObj.set('text', text);

	                _this3.getCanvas().renderAll();
	                resolve();
	            });
	        }

	        /**
	         * Set style
	         * @param {Object} activeObj - Current selected text object
	         * @param {Object} styleObj - Initial styles
	         *     @param {string} [styleObj.fill] Color
	         *     @param {string} [styleObj.fontFamily] Font type for text
	         *     @param {number} [styleObj.fontSize] Size
	         *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
	         *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
	         *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
	         *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
	         * @returns {Promise}
	         */

	    }, {
	        key: 'setStyle',
	        value: function setStyle(activeObj, styleObj) {
	            var _this4 = this;

	            return new _promise2.default(function (resolve) {
	                _tuiCodeSnippet2.default.forEach(styleObj, function (val, key) {
	                    if (activeObj[key] === val) {
	                        styleObj[key] = resetStyles[key] || '';
	                    }
	                }, _this4);

	                activeObj.set(styleObj);

	                _this4.getCanvas().renderAll();
	                resolve();
	            });
	        }

	        /**
	         * Get the text
	         * @param {Object} activeObj - Current selected text object
	         * @returns {String} text
	         */

	    }, {
	        key: 'getText',
	        value: function getText(activeObj) {
	            return activeObj.getText();
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

	            this._listeners = _tuiCodeSnippet2.default.extend(this._listeners, {
	                input: this._onInput.bind(this),
	                keydown: this._onKeyDown.bind(this),
	                blur: this._onBlur.bind(this),
	                scroll: this._onScroll.bind(this)
	            });

	            if (browser.msie && browser.version === 9) {
	                _fabric2.default.util.addListener(textarea, 'keydown', this._listeners.keydown);
	            } else {
	                _fabric2.default.util.addListener(textarea, 'input', this._listeners.input);
	            }
	            _fabric2.default.util.addListener(textarea, 'blur', this._listeners.blur);
	            _fabric2.default.util.addListener(textarea, 'scroll', this._listeners.scroll);
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
	                _fabric2.default.util.removeListener(textarea, 'keydown', this._listeners.keydown);
	            } else {
	                _fabric2.default.util.removeListener(textarea, 'input', this._listeners.input);
	            }
	            _fabric2.default.util.removeListener(textarea, 'blur', this._listeners.blur);
	            _fabric2.default.util.removeListener(textarea, 'scroll', this._listeners.scroll);
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
	            var _this5 = this;

	            var ratio = this.getCanvasRatio();
	            var obj = this._editingObj;
	            var textareaStyle = this._textarea.style;

	            setTimeout(function () {
	                obj.setText(_this5._textarea.value);

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
	            var textContent = this._textarea.value;
	            var transWidth = editingObj.getWidth() / ratio - editingObjInfos.width / ratio;
	            var transHeight = editingObj.getHeight() / ratio - editingObjInfos.height / ratio;

	            if (ratio === 1) {
	                transWidth /= 2;
	                transHeight /= 2;
	            }

	            this._textarea.style.display = 'none';

	            editingObj.set({
	                left: editingObjInfos.left + transWidth,
	                top: editingObjInfos.top + transHeight
	            });

	            if (textContent.length) {
	                this.getCanvas().add(editingObj);

	                var params = {
	                    id: _tuiCodeSnippet2.default.stamp(editingObj),
	                    type: editingObj.type,
	                    text: textContent
	                };

	                this.fire(events.TEXT_CHANGED, params);
	            }
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
	         * onSelectClear handler in fabric canvas
	         * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
	         * @private
	         */

	    }, {
	        key: '_onFabricSelectClear',
	        value: function _onFabricSelectClear(fEvent) {
	            var obj = this.getSelectedObj();

	            this.isPrevEditing = true;

	            this.setSelectedInfo(fEvent.target, false);

	            if (obj) {
	                // obj is empty object at initial time, will be set fabric object
	                if (obj.text === '') {
	                    obj.remove();
	                }
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
	            this.isPrevEditing = true;

	            this.setSelectedInfo(fEvent.target, true);
	        }

	        /**
	         * Fabric 'mousedown' event handler
	         * @param {fabric.Event} fEvent - Current mousedown event on selected object
	         * @private
	         */

	    }, {
	        key: '_onFabricMouseDown',
	        value: function _onFabricMouseDown(fEvent) {
	            var obj = fEvent.target;
	            if (obj && !obj.isType('text')) {
	                return;
	            }

	            if (this.isPrevEditing) {
	                this.isPrevEditing = false;

	                return;
	            }

	            this._fireAddText(fEvent);
	        }

	        /**
	         * Fire 'addText' event if object is not selected.
	         * @param {fabric.Event} fEvent - Current mousedown event on selected object
	         * @private
	         */

	    }, {
	        key: '_fireAddText',
	        value: function _fireAddText(fEvent) {
	            var obj = fEvent.target;
	            var e = fEvent.e || {};
	            var originPointer = this.getCanvas().getPointer(e);

	            if (!obj) {
	                this.fire(events.ADD_TEXT, {
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
	                this.fire(events.TEXT_EDITING); // fire editing text event
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

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Add icon module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var rejectMessages = _consts2.default.rejectMessages;


	var pathMap = {
	    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
	    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' + 'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
	};

	/**
	 * Icon
	 * @class Icon
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Icon = function (_Component) {
	    _inherits(Icon, _Component);

	    function Icon(graphics) {
	        _classCallCheck(this, Icon);

	        /**
	         * Default icon color
	         * @type {string}
	         */
	        var _this = _possibleConstructorReturn(this, (Icon.__proto__ || Object.getPrototypeOf(Icon)).call(this, _consts2.default.componentNames.ICON, graphics));

	        _this._oColor = '#000000';

	        /**
	         * Path value of each icon type
	         * @type {Object}
	         */
	        _this._pathMap = pathMap;
	        return _this;
	    }

	    /**
	     * Add icon
	     * @param {string} type - Icon type
	     * @param {Object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     * @returns {Promise}
	     */


	    _createClass(Icon, [{
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var canvas = _this2.getCanvas();
	                var path = _this2._pathMap[type];
	                var selectionStyle = _consts2.default.fObjectOptions.SELECTION_STYLE;

	                if (!path) {
	                    reject(rejectMessages.invalidParameters);
	                }

	                var icon = _this2._createIcon(path);

	                icon.set(_tuiCodeSnippet2.default.extend({
	                    type: 'icon',
	                    fill: _this2._oColor
	                }, selectionStyle, options));

	                canvas.add(icon).setActiveObject(icon);
	                resolve(_this2.graphics.createObjectProperties(icon));
	            });
	        }

	        /**
	         * Register icon paths
	         * @param {{key: string, value: string}} pathInfos - Path infos
	         */

	    }, {
	        key: 'registerPaths',
	        value: function registerPaths(pathInfos) {
	            var _this3 = this;

	            _tuiCodeSnippet2.default.forEach(pathInfos, function (path, type) {
	                _this3._pathMap[type] = path;
	            }, this);
	        }

	        /**
	         * Set icon object color
	         * @param {string} color - Color to set
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
	         * Get icon color
	         * @param {fabric.Path}[obj] - Current activated path object
	         * @returns {string} color
	         */

	    }, {
	        key: 'getColor',
	        value: function getColor(obj) {
	            return obj.fill;
	        }

	        /**
	         * Create icon object
	         * @param {string} path - Path value to create icon
	         * @returns {fabric.Path} Path object
	         */

	    }, {
	        key: '_createIcon',
	        value: function _createIcon(path) {
	            return new _fabric2.default.Path(path);
	        }
	    }]);

	    return Icon;
	}(_component2.default);

	module.exports = Icon;

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tuiCodeSnippet = __webpack_require__(2);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _mask = __webpack_require__(86);

	var _mask2 = _interopRequireDefault(_mask);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	var _blur = __webpack_require__(87);

	var _blur2 = _interopRequireDefault(_blur);

	var _sharpen = __webpack_require__(88);

	var _sharpen2 = _interopRequireDefault(_sharpen);

	var _emboss = __webpack_require__(89);

	var _emboss2 = _interopRequireDefault(_emboss);

	var _colorFilter = __webpack_require__(90);

	var _colorFilter2 = _interopRequireDefault(_colorFilter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Add filter module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var rejectMessages = _consts2.default.rejectMessages;
	var filters = _fabric2.default.Image.filters;

	filters.Mask = _mask2.default;
	filters.Blur = _blur2.default;
	filters.Sharpen = _sharpen2.default;
	filters.Emboss = _emboss2.default;
	filters.ColorFilter = _colorFilter2.default;

	/**
	 * Filter
	 * @class Filter
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Filter = function (_Component) {
	    _inherits(Filter, _Component);

	    function Filter(graphics) {
	        _classCallCheck(this, Filter);

	        return _possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).call(this, _consts2.default.componentNames.FILTER, graphics));
	    }

	    /**
	     * Add filter to source image (a specific filter is added on fabric.js)
	     * @param {string} type - Filter type
	     * @param {Object} [options] - Options of filter
	     * @returns {Promise}
	     */


	    _createClass(Filter, [{
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve, reject) {
	                var sourceImg = _this2._getSourceImage();
	                var canvas = _this2.getCanvas();
	                var imgFilter = _this2._getFilter(sourceImg, type);
	                if (!imgFilter) {
	                    imgFilter = _this2._createFilter(sourceImg, type, options);
	                }

	                if (!imgFilter) {
	                    reject(rejectMessages.invalidParameters);
	                }

	                _this2._changeFilterValues(imgFilter, options);

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
	                    reject(rejectMessages.unsupportedOperation);
	                }

	                _this3._removeFilter(sourceImg, type);

	                _this3._apply(sourceImg, function () {
	                    canvas.renderAll();
	                    resolve({
	                        type: type,
	                        action: 'remove'
	                    });
	                });
	            });
	        }

	        /**
	         * Whether this has the filter or not
	         * @param {string} type - Filter type
	         * @returns {boolean} true if it has the filter
	         */

	    }, {
	        key: 'hasFilter',
	        value: function hasFilter(type) {
	            return !!this._getFilter(this._getSourceImage(), type);
	        }

	        /**
	         * Get a filter options
	         * @param {string} type - Filter type
	         * @returns {Object} filter options or null if there is no that filter
	         */

	    }, {
	        key: 'getOptions',
	        value: function getOptions(type) {
	            var sourceImg = this._getSourceImage();
	            var imgFilter = this._getFilter(sourceImg, type);
	            if (!imgFilter) {
	                return null;
	            }

	            return (0, _tuiCodeSnippet.extend)({}, imgFilter.options);
	        }

	        /**
	         * Change filter values
	         * @param {Object} imgFilter object of filter
	         * @param {Object} options object
	         * @private
	         */

	    }, {
	        key: '_changeFilterValues',
	        value: function _changeFilterValues(imgFilter, options) {
	            (0, _tuiCodeSnippet.forEach)(options, function (value, key) {
	                if (!(0, _tuiCodeSnippet.isUndefined)(imgFilter[key])) {
	                    imgFilter[key] = value;
	                }
	            });
	            (0, _tuiCodeSnippet.forEach)(imgFilter.options, function (value, key) {
	                if (!(0, _tuiCodeSnippet.isUndefined)(options[key])) {
	                    imgFilter.options[key] = options[key];
	                }
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
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {string} type - Filter type
	         * @param {Object} [options] - Options of filter
	         * @returns {Object} Fabric object of filter
	         * @private
	         */

	    }, {
	        key: '_createFilter',
	        value: function _createFilter(sourceImg, type, options) {
	            var filterObj = void 0;
	            // capitalize first letter for matching with fabric image filter name
	            var fabricType = this._getFabricFilterType(type);
	            var ImageFilter = _fabric2.default.Image.filters[fabricType];
	            if (ImageFilter) {
	                filterObj = new ImageFilter(options);
	                filterObj.options = options;
	                sourceImg.filters.push(filterObj);
	            }

	            return filterObj;
	        }

	        /**
	         * Get applied filter instance
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {string} type - Filter type
	         * @returns {Object} Fabric object of filter
	         * @private
	         */

	    }, {
	        key: '_getFilter',
	        value: function _getFilter(sourceImg, type) {
	            var imgFilter = null;

	            if (sourceImg) {
	                var fabricType = this._getFabricFilterType(type);
	                var length = sourceImg.filters.length;

	                var item = void 0,
	                    i = void 0;

	                for (i = 0; i < length; i += 1) {
	                    item = sourceImg.filters[i];
	                    if (item.type === fabricType) {
	                        imgFilter = item;
	                        break;
	                    }
	                }
	            }

	            return imgFilter;
	        }

	        /**
	         * Remove applied filter instance
	         * @param {fabric.Image} sourceImg - Source image to apply filter
	         * @param {string} type - Filter type
	         * @private
	         */

	    }, {
	        key: '_removeFilter',
	        value: function _removeFilter(sourceImg, type) {
	            var fabricType = this._getFabricFilterType(type);
	            sourceImg.filters = (0, _tuiCodeSnippet.filter)(sourceImg.filters, function (value) {
	                return value.type !== fabricType;
	            });
	        }

	        /**
	         * Change filter class name to fabric's, especially capitalizing first letter
	         * @param {string} type - Filter type
	         * @example
	         * 'grayscale' -> 'Grayscale'
	         * @returns {string} Fabric filter class name
	         */

	    }, {
	        key: '_getFabricFilterType',
	        value: function _getFabricFilterType(type) {
	            return type.charAt(0).toUpperCase() + type.slice(1);
	        }
	    }]);

	    return Filter;
	}(_component2.default);

	module.exports = Filter;

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Mask object
	 * @class Mask
	 * @extends {fabric.Image.filters.Mask}
	 * @ignore
	 */
	var Mask = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Mask, /** @lends Mask.prototype */{
	    /**
	     * Apply filter to canvas element
	     * @param {Object} canvasEl - Canvas element to apply filter
	     * @override
	     */
	    applyTo: function applyTo(canvasEl) {
	        if (!this.mask) {
	            return;
	        }

	        var width = canvasEl.width,
	            height = canvasEl.height;

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
	        var maskCanvasEl = _fabric2.default.util.createCanvasElement();

	        maskCanvasEl.width = width;
	        maskCanvasEl.height = height;

	        return maskCanvasEl;
	    },


	    /**
	     * Draw mask image on canvas element
	     * @param {Object} maskCtx - Context of mask canvas
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
	     * @param {Object} maskCtx - Context of mask canvas
	     * @param {Object} imageData - Data of source image
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
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Mask extending fabric.Image.filters.Mask
	     */


	module.exports = Mask;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Blur object
	 * @class Blur
	 * @extends {fabric.Image.filters.Convolute}
	 * @ignore
	 */
	var Blur = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Convolute, /** @lends Convolute.prototype */{
	  /**
	   * Filter type
	   * @param {String} type
	   * @default
	   */
	  type: 'Blur',

	  /**
	   * constructor
	   * @override
	   */
	  initialize: function initialize() {
	    var matrix = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
	    this.matrix = matrix;
	  }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Blur extending fabric.Image.filters.Convolute
	     */


	module.exports = Blur;

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Sharpen object
	 * @class Sharpen
	 * @extends {fabric.Image.filters.Convolute}
	 * @ignore
	 */
	var Sharpen = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Convolute, /** @lends Convolute.prototype */{
	  /**
	   * Filter type
	   * @param {String} type
	   * @default
	   */
	  type: 'Sharpen',

	  /**
	   * constructor
	   * @override
	   */
	  initialize: function initialize() {
	    var matrix = [0, -1, 0, -1, 5, -1, 0, -1, 0];
	    this.matrix = matrix;
	  }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Sharpen extending fabric.Image.filters.Convolute
	     */


	module.exports = Sharpen;

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Emboss object
	 * @class Emboss
	 * @extends {fabric.Image.filters.Convolute}
	 * @ignore
	 */
	var Emboss = _fabric2.default.util.createClass(_fabric2.default.Image.filters.Convolute, /** @lends Convolute.prototype */{
	  /**
	   * Filter type
	   * @param {String} type
	   * @default
	   */
	  type: 'Emboss',

	  /**
	   * constructor
	   * @override
	   */
	  initialize: function initialize() {
	    var matrix = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];
	    this.matrix = matrix;
	  }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview Emboss extending fabric.Image.filters.Convolute
	     */


	module.exports = Emboss;

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * ColorFilter object
	 * @class ColorFilter
	 * @extends {fabric.Image.filters.BaseFilter}
	 * @ignore
	 */
	var ColorFilter = _fabric2.default.util.createClass(_fabric2.default.Image.filters.BaseFilter, /** @lends BaseFilter.prototype */{
	    /**
	     * Filter type
	     * @param {String} type
	     * @default
	     */
	    type: 'ColorFilter',

	    /**
	     * Constructor
	     * @member fabric.Image.filters.ColorFilter.prototype
	     * @param {Object} [options] Options object
	     * @param {Number} [options.color='#FFFFFF'] Value of color (0...255)
	     * @param {Number} [options.threshold=45] Value of threshold (0...255)
	     * @override
	     */
	    initialize: function initialize(options) {
	        if (!options) {
	            options = {};
	        }
	        this.color = options.color || '#FFFFFF';
	        this.threshold = options.threshold || 45;
	        this.x = options.x || null;
	        this.y = options.y || null;
	    },


	    /**
	     * Applies filter to canvas element
	     * @param {Object} canvasEl Canvas element to apply filter to
	     */
	    applyTo: function applyTo(canvasEl) {
	        var context = canvasEl.getContext('2d');
	        var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
	        var data = imageData.data;
	        var threshold = this.threshold;

	        var filterColor = _fabric2.default.Color.sourceFromHex(this.color);
	        var i = void 0,
	            len = void 0;

	        if (this.x && this.y) {
	            filterColor = this._getColor(imageData, this.x, this.y);
	        }

	        for (i = 0, len = data.length; i < len; i += 4) {
	            if (this._isOutsideThreshold(data[i], filterColor[0], threshold) || this._isOutsideThreshold(data[i + 1], filterColor[1], threshold) || this._isOutsideThreshold(data[i + 2], filterColor[2], threshold)) {
	                continue;
	            }
	            data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
	        }
	        context.putImageData(imageData, 0, 0);
	    },


	    /**
	     * Check color if it is within threshold
	     * @param {Number} color1 source color
	     * @param {Number} color2 filtering color
	     * @param {Number} threshold threshold
	     * @returns {boolean} true if within threshold or false
	     */
	    _isOutsideThreshold: function _isOutsideThreshold(color1, color2, threshold) {
	        var diff = color1 - color2;

	        return Math.abs(diff) > threshold;
	    },


	    /**
	     * Get color at (x, y)
	     * @param {Object} imageData of canvas
	     * @param {Number} x left position
	     * @param {Number} y top position
	     * @returns {Array} color array
	     */
	    _getColor: function _getColor(imageData, x, y) {
	        var color = [0, 0, 0, 0];
	        var data = imageData.data,
	            width = imageData.width;

	        var bytes = 4;
	        var position = (width * y + x) * bytes;

	        color[0] = data[position];
	        color[1] = data[position + 1];
	        color[2] = data[position + 2];
	        color[3] = data[position + 3];

	        return color;
	    }
	}); /**
	     * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	     * @fileoverview ColorFilter extending fabric.Image.filters.BaseFilter
	     */


	module.exports = ColorFilter;

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _fabric = __webpack_require__(74);

	var _fabric2 = _interopRequireDefault(_fabric);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _component = __webpack_require__(76);

	var _component2 = _interopRequireDefault(_component);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	var _shapeResizeHelper = __webpack_require__(92);

	var _shapeResizeHelper2 = _interopRequireDefault(_shapeResizeHelper);

	var _tuiCodeSnippet = __webpack_require__(2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview Shape component
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var rejectMessages = _consts2.default.rejectMessages,
	    eventNames = _consts2.default.eventNames;

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
	 * @param {Graphics} graphics - Graphics instance
	 * @extends {Component}
	 * @ignore
	 */

	var Shape = function (_Component) {
	    _inherits(Shape, _Component);

	    function Shape(graphics) {
	        _classCallCheck(this, Shape);

	        /**
	         * Object of The drawing shape
	         * @type {fabric.Object}
	         * @private
	         */
	        var _this = _possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).call(this, _consts2.default.componentNames.SHAPE, graphics));

	        _this._shapeObj = null;

	        /**
	         * Type of the drawing shape
	         * @type {string}
	         * @private
	         */
	        _this._type = DEFAULT_TYPE;

	        /**
	         * Options to draw the shape
	         * @type {Object}
	         * @private
	         */
	        _this._options = (0, _tuiCodeSnippet.extend)({}, DEFAULT_OPTIONS);

	        /**
	         * Whether the shape object is selected or not
	         * @type {boolean}
	         * @private
	         */
	        _this._isSelected = false;

	        /**
	         * Pointer for drawing shape (x, y)
	         * @type {Object}
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
	         * @type {Object}
	         * @private
	         */
	        _this._handlers = {
	            mousedown: _this._onFabricMouseDown.bind(_this),
	            mousemove: _this._onFabricMouseMove.bind(_this),
	            mouseup: _this._onFabricMouseUp.bind(_this),
	            keydown: _this._onKeyDown.bind(_this),
	            keyup: _this._onKeyUp.bind(_this)
	        };
	        return _this;
	    }

	    /**
	     * Start to draw the shape on canvas
	     * @ignore
	     */


	    _createClass(Shape, [{
	        key: 'start',
	        value: function start() {
	            var canvas = this.getCanvas();

	            this._isSelected = false;

	            canvas.defaultCursor = 'crosshair';
	            canvas.selection = false;
	            canvas.uniScaleTransform = true;
	            canvas.on({
	                'mouse:down': this._handlers.mousedown
	            });

	            _fabric2.default.util.addListener(document, 'keydown', this._handlers.keydown);
	            _fabric2.default.util.addListener(document, 'keyup', this._handlers.keyup);
	        }

	        /**
	         * End to draw the shape on canvas
	         * @ignore
	         */

	    }, {
	        key: 'end',
	        value: function end() {
	            var canvas = this.getCanvas();

	            this._isSelected = false;

	            canvas.defaultCursor = 'default';
	            canvas.selection = true;
	            canvas.uniScaleTransform = false;
	            canvas.off({
	                'mouse:down': this._handlers.mousedown
	            });

	            _fabric2.default.util.removeListener(document, 'keydown', this._handlers.keydown);
	            _fabric2.default.util.removeListener(document, 'keyup', this._handlers.keyup);
	        }

	        /**
	         * Set states of the current drawing shape
	         * @ignore
	         * @param {string} type - Shape type (ex: 'rect', 'circle')
	         * @param {Object} [options] - Shape options
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
	                this._options = (0, _tuiCodeSnippet.extend)(this._options, options);
	            }
	        }

	        /**
	         * Add the shape
	         * @ignore
	         * @param {string} type - Shape type (ex: 'rect', 'circle')
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
	         * @returns {Promise}
	         */

	    }, {
	        key: 'add',
	        value: function add(type, options) {
	            var _this2 = this;

	            return new _promise2.default(function (resolve) {
	                var canvas = _this2.getCanvas();
	                options = _this2._createOptions(options);
	                var shapeObj = _this2._createInstance(type, options);

	                _this2._bindEventOnShape(shapeObj);

	                canvas.add(shapeObj).setActiveObject(shapeObj);
	                resolve(_this2.graphics.createObjectProperties(shapeObj));
	            });
	        }

	        /**
	         * Change the shape
	         * @ignore
	         * @param {fabric.Object} shapeObj - Selected shape object on canvas
	         * @param {Object} options - Shape options
	         *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
	         *      @param {string} [options.stroke] - Shape outline color
	         *      @param {number} [options.strokeWidth] - Shape outline width
	         *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
	         *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
	         *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
	         *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
	         *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
	         * @returns {Promise}
	         */

	    }, {
	        key: 'change',
	        value: function change(shapeObj, options) {
	            var _this3 = this;

	            return new _promise2.default(function (resolve, reject) {
	                if ((0, _tuiCodeSnippet.inArray)(shapeObj.get('type'), shapeType) < 0) {
	                    reject(rejectMessages.unsupportedType);
	                }

	                shapeObj.set(options);
	                _this3.getCanvas().renderAll();
	                resolve();
	            });
	        }

	        /**
	         * Create the instance of shape
	         * @param {string} type - Shape type
	         * @param {Object} options - Options to creat the shape
	         * @returns {fabric.Object} Shape instance
	         * @private
	         */

	    }, {
	        key: '_createInstance',
	        value: function _createInstance(type, options) {
	            var instance = void 0;

	            switch (type) {
	                case 'rect':
	                    instance = new _fabric2.default.Rect(options);
	                    break;
	                case 'circle':
	                    instance = new _fabric2.default.Ellipse((0, _tuiCodeSnippet.extend)({
	                        type: 'circle'
	                    }, options));
	                    break;
	                case 'triangle':
	                    instance = new _fabric2.default.Triangle(options);
	                    break;
	                default:
	                    instance = {};
	            }

	            return instance;
	        }

	        /**
	         * Get the options to create the shape
	         * @param {Object} options - Options to creat the shape
	         * @returns {Object} Shape options
	         * @private
	         */

	    }, {
	        key: '_createOptions',
	        value: function _createOptions(options) {
	            var selectionStyles = _consts2.default.fObjectOptions.SELECTION_STYLE;

	            options = (0, _tuiCodeSnippet.extend)({}, DEFAULT_OPTIONS, this._options, selectionStyles, options);

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
	            var _this4 = this;

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
	                }).then(function (objectProps) {
	                    _this4.fire(eventNames.ADD_OBJECT, objectProps);
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

/***/ }),
/* 92 */
/***/ (function(module, exports) {

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
	 * @returns {Object} Postions of origin
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
	    var originX = originPositions.originX,
	        originY = originPositions.originY;

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
	    var originX = originPositions.originX,
	        originY = originPositions.originY;


	    shape.setPositionByOrigin(origin, originX, originY);
	}

	/**
	 * Adjust the dimension of shape on firing scaling event
	 * @param {fabric.Object} shape - Shape object
	 * @ignore
	 */
	function adjustDimensionOnScaling(shape) {
	    var type = shape.type,
	        scaleX = shape.scaleX,
	        scaleY = shape.scaleY;

	    var dimensionKeys = DIMENSION_KEYS[type];
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
	    var type = shape.type,
	        strokeWidth = shape.strokeWidth,
	        origin = shape.startPoint;

	    var divisor = DIVISOR[type];
	    var dimensionKeys = DIMENSION_KEYS[type];
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

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(94);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview CropperDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * CropperDrawingMode class
	 * @class
	 * @ignore
	 */

	var CropperDrawingMode = function (_DrawingMode) {
	    _inherits(CropperDrawingMode, _DrawingMode);

	    function CropperDrawingMode() {
	        _classCallCheck(this, CropperDrawingMode);

	        return _possibleConstructorReturn(this, (CropperDrawingMode.__proto__ || Object.getPrototypeOf(CropperDrawingMode)).call(this, drawingModes.CROPPER));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @override
	    */


	    _createClass(CropperDrawingMode, [{
	        key: 'start',
	        value: function start(graphics) {
	            var cropper = graphics.getComponent(components.CROPPER);
	            cropper.start();
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var cropper = graphics.getComponent(components.CROPPER);
	            cropper.end();
	        }
	    }]);

	    return CropperDrawingMode;
	}(_drawingMode2.default);

	module.exports = CropperDrawingMode;

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileoverview DrawingMode interface
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _errorMessage = __webpack_require__(70);

	var _errorMessage2 = _interopRequireDefault(_errorMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var createMessage = _errorMessage2.default.create;
	var errorTypes = _errorMessage2.default.types;

	/**
	 * DrawingMode interface
	 * @class
	 * @param {string} name - drawing mode name
	 * @ignore
	 */

	var DrawingMode = function () {
	  function DrawingMode(name) {
	    _classCallCheck(this, DrawingMode);

	    /**
	     * the name of drawing mode
	     * @type {string}
	     */
	    this.name = name;
	  }

	  /**
	   * Get this drawing mode name;
	   * @returns {string} drawing mode name
	   */


	  _createClass(DrawingMode, [{
	    key: 'getName',
	    value: function getName() {
	      return this.name;
	    }

	    /**
	    * start this drawing mode
	    * @param {Object} options - drawing mode options
	    * @abstract
	    */

	  }, {
	    key: 'start',
	    value: function start() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'start'));
	    }

	    /**
	     * stop this drawing mode
	     * @abstract
	     */

	  }, {
	    key: 'stop',
	    value: function stop() {
	      throw new Error(createMessage(errorTypes.UN_IMPLEMENTATION, 'stop'));
	    }
	  }]);

	  return DrawingMode;
	}();

	module.exports = DrawingMode;

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(94);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview FreeDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * FreeDrawingMode class
	 * @class
	 * @ignore
	 */

	var FreeDrawingMode = function (_DrawingMode) {
	    _inherits(FreeDrawingMode, _DrawingMode);

	    function FreeDrawingMode() {
	        _classCallCheck(this, FreeDrawingMode);

	        return _possibleConstructorReturn(this, (FreeDrawingMode.__proto__ || Object.getPrototypeOf(FreeDrawingMode)).call(this, drawingModes.FREE_DRAWING));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
	    * @override
	    */


	    _createClass(FreeDrawingMode, [{
	        key: 'start',
	        value: function start(graphics, options) {
	            var freeDrawing = graphics.getComponent(components.FREE_DRAWING);
	            freeDrawing.start(options);
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var freeDrawing = graphics.getComponent(components.FREE_DRAWING);
	            freeDrawing.end();
	        }
	    }]);

	    return FreeDrawingMode;
	}(_drawingMode2.default);

	module.exports = FreeDrawingMode;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(94);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview LineDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * LineDrawingMode class
	 * @class
	 * @ignore
	 */

	var LineDrawingMode = function (_DrawingMode) {
	    _inherits(LineDrawingMode, _DrawingMode);

	    function LineDrawingMode() {
	        _classCallCheck(this, LineDrawingMode);

	        return _possibleConstructorReturn(this, (LineDrawingMode.__proto__ || Object.getPrototypeOf(LineDrawingMode)).call(this, drawingModes.LINE_DRAWING));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
	    * @override
	    */


	    _createClass(LineDrawingMode, [{
	        key: 'start',
	        value: function start(graphics, options) {
	            var lineDrawing = graphics.getComponent(components.LINE);
	            lineDrawing.start(options);
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var lineDrawing = graphics.getComponent(components.LINE);
	            lineDrawing.end();
	        }
	    }]);

	    return LineDrawingMode;
	}(_drawingMode2.default);

	module.exports = LineDrawingMode;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(94);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview ShapeDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * ShapeDrawingMode class
	 * @class
	 * @ignore
	 */

	var ShapeDrawingMode = function (_DrawingMode) {
	    _inherits(ShapeDrawingMode, _DrawingMode);

	    function ShapeDrawingMode() {
	        _classCallCheck(this, ShapeDrawingMode);

	        return _possibleConstructorReturn(this, (ShapeDrawingMode.__proto__ || Object.getPrototypeOf(ShapeDrawingMode)).call(this, drawingModes.SHAPE));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @override
	    */


	    _createClass(ShapeDrawingMode, [{
	        key: 'start',
	        value: function start(graphics) {
	            var shape = graphics.getComponent(components.SHAPE);
	            shape.start();
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var shape = graphics.getComponent(components.SHAPE);
	            shape.end();
	        }
	    }]);

	    return ShapeDrawingMode;
	}(_drawingMode2.default);

	module.exports = ShapeDrawingMode;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _drawingMode = __webpack_require__(94);

	var _drawingMode2 = _interopRequireDefault(_drawingMode);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileoverview TextDrawingMode class
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


	var drawingModes = _consts2.default.drawingModes;

	var components = _consts2.default.componentNames;

	/**
	 * TextDrawingMode class
	 * @class
	 * @ignore
	 */

	var TextDrawingMode = function (_DrawingMode) {
	    _inherits(TextDrawingMode, _DrawingMode);

	    function TextDrawingMode() {
	        _classCallCheck(this, TextDrawingMode);

	        return _possibleConstructorReturn(this, (TextDrawingMode.__proto__ || Object.getPrototypeOf(TextDrawingMode)).call(this, drawingModes.TEXT));
	    }

	    /**
	    * start this drawing mode
	    * @param {Graphics} graphics - Graphics instance
	    * @override
	    */


	    _createClass(TextDrawingMode, [{
	        key: 'start',
	        value: function start(graphics) {
	            var text = graphics.getComponent(components.TEXT);
	            text.start();
	        }

	        /**
	         * stop this drawing mode
	         * @param {Graphics} graphics - Graphics instance
	         * @override
	         */

	    }, {
	        key: 'end',
	        value: function end(graphics) {
	            var text = graphics.getComponent(components.TEXT);
	            text.end();
	        }
	    }]);

	    return TextDrawingMode;
	}(_drawingMode2.default);

	module.exports = TextDrawingMode;

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add an icon
	                                                   */

	var ICON = componentNames.ICON;


	var command = {
	    name: commandNames.ADD_ICON,

	    /**
	     * Add an icon
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
	     * @param {Object} options - Icon options
	     *      @param {string} [options.fill] - Icon foreground color
	     *      @param {string} [options.left] - Icon x position
	     *      @param {string} [options.top] - Icon y position
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, type, options) {
	        var _this = this;

	        var iconComp = graphics.getComponent(ICON);

	        return iconComp.add(type, options).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add an image object
	                                                   */

	var command = {
	    name: commandNames.ADD_IMAGE_OBJECT,

	    /**
	     * Add an image object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} imgUrl - Image url to make object
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, imgUrl) {
	        var _this = this;

	        return graphics.addImageObject(imgUrl).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages; /**
	                                                       * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                       * @fileoverview Add an object
	                                                       */

	var command = {
	    name: commandNames.ADD_OBJECT,

	    /**
	     * Add an object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {Object} object - Fabric object
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, object) {
	        return new _promise2.default(function (resolve, reject) {
	            if (!graphics.contains(object)) {
	                graphics.add(object);
	                resolve(object);
	            } else {
	                reject(rejectMessages.addedObject);
	            }
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @param {Object} object - Fabric object
	     * @returns {Promise}
	     */
	    undo: function undo(graphics, object) {
	        return new _promise2.default(function (resolve, reject) {
	            if (graphics.contains(object)) {
	                graphics.remove(object);
	                resolve(object);
	            } else {
	                reject(rejectMessages.noObject);
	            }
	        });
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add a shape
	                                                   */

	var SHAPE = componentNames.SHAPE;


	var command = {
	    name: commandNames.ADD_SHAPE,

	    /**
	     * Add a shape
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
	     * @param {Object} options - Shape options
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
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, type, options) {
	        var _this = this;

	        var shapeComp = graphics.getComponent(SHAPE);

	        return shapeComp.add(type, options).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Add a text object
	                                                   */

	var TEXT = componentNames.TEXT;


	var command = {
	    name: commandNames.ADD_TEXT,

	    /**
	     * Add a text object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} text - Initial input text
	     * @param {Object} [options] Options for text styles
	     *     @param {Object} [options.styles] Initial styles
	     *         @param {string} [options.styles.fill] Color
	     *         @param {string} [options.styles.fontFamily] Font type for text
	     *         @param {number} [options.styles.fontSize] Size
	     *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
	     *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	     *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
	     *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	     *     @param {{x: number, y: number}} [options.position] - Initial position
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, text, options) {
	        var _this = this;

	        var textComp = graphics.getComponent(TEXT);

	        return textComp.add(text, options).then(function (objectProps) {
	            _this.undoData.object = graphics.getObject(objectProps.id);

	            return objectProps;
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.remove(this.undoData.object);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Apply a filter into an image
	 */
	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames;
	var FILTER = componentNames.FILTER;


	var command = {
	    name: commandNames.APPLY_FILTER,

	    /**
	     * Apply a filter into an image
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Filter type
	     * @param {Object} options - Filter options
	     *  @param {number} options.maskObjId - masking image object id
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, type, options) {
	        var filterComp = graphics.getComponent(FILTER);

	        if (type === 'mask') {
	            var maskObj = graphics.getObject(options.maskObjId);

	            if (!(maskObj && maskObj.isType('image'))) {
	                return Promise.reject(rejectMessages.invalidParameters);
	            }

	            options = {
	                mask: maskObj
	            };
	        }

	        if (type === 'mask') {
	            this.undoData.object = options.mask;
	            graphics.remove(options.mask);
	        } else {
	            this.undoData.options = filterComp.getOptions(type);
	        }

	        return filterComp.add(type, options);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} type - Filter type
	     * @returns {Promise}
	     */
	    undo: function undo(graphics, type) {
	        var filterComp = graphics.getComponent(FILTER);

	        if (type === 'mask') {
	            var mask = this.undoData.object;
	            graphics.add(mask);
	            graphics.setActiveObject(mask);

	            return filterComp.remove(type);
	        }

	        // options changed case
	        if (this.undoData.options) {
	            return filterComp.add(type, this.undoData.options);
	        }

	        // filter added case
	        return filterComp.remove(type);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Change icon color
	                                                   */

	var ICON = componentNames.ICON;


	var command = {
	    name: commandNames.CHANGE_ICON_COLOR,

	    /**
	     * Change icon color
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {string} color - Color for icon
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, color) {
	        var _this = this;

	        return new _promise2.default(function (resolve, reject) {
	            var iconComp = graphics.getComponent(ICON);
	            var targetObj = graphics.getObject(id);

	            if (!targetObj) {
	                reject(rejectMessages.noObject);
	            }

	            _this.undoData.object = targetObj;
	            _this.undoData.color = iconComp.getColor(targetObj);
	            iconComp.setColor(color, targetObj);
	            resolve();
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var iconComp = graphics.getComponent(ICON);
	        var _undoData$object = this.undoData.object,
	            icon = _undoData$object.object,
	            color = _undoData$object.color;


	        iconComp.setColor(color, icon);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview change a shape
	 */
	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames;
	var SHAPE = componentNames.SHAPE;


	var command = {
	    name: commandNames.CHANGE_SHAPE,

	    /**
	     * Change a shape
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} options - Shape options
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
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, options) {
	        var _this = this;

	        var shapeComp = graphics.getComponent(SHAPE);
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.object = targetObj;
	        this.undoData.options = {};
	        _tuiCodeSnippet2.default.forEachOwnProperties(options, function (value, key) {
	            _this.undoData.options[key] = targetObj[key];
	        });

	        return shapeComp.change(targetObj, options);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var shapeComp = graphics.getComponent(SHAPE);
	        var _undoData = this.undoData,
	            shape = _undoData.object,
	            options = _undoData.options;


	        return shapeComp.change(shape, options);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Change a text
	                                                   */

	var TEXT = componentNames.TEXT;


	var command = {
	    name: commandNames.CHANGE_TEXT,

	    /**
	     * Change a text
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {string} text - Changing text
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, text) {
	        var textComp = graphics.getComponent(TEXT);
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.object = targetObj;
	        this.undoData.text = textComp.getText(targetObj);

	        return textComp.change(targetObj, text);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var textComp = graphics.getComponent(TEXT);
	        var _undoData = this.undoData,
	            textObj = _undoData.object,
	            text = _undoData.text;


	        return textComp.change(textObj, text);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Change text styles
	 */
	var componentNames = _consts2.default.componentNames,
	    rejectMessages = _consts2.default.rejectMessages,
	    commandNames = _consts2.default.commandNames;
	var TEXT = componentNames.TEXT;


	var command = {
	    name: commandNames.CHANGE_TEXT_STYLE,

	    /**
	     * Change text styles
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} styles - text styles
	     *     @param {string} [styles.fill] Color
	     *     @param {string} [styles.fontFamily] Font type for text
	     *     @param {number} [styles.fontSize] Size
	     *     @param {string} [styles.fontStyle] Type of inclination (normal / italic)
	     *     @param {string} [styles.fontWeight] Type of thicker or thinner looking (normal / bold)
	     *     @param {string} [styles.textAlign] Type of text align (left / center / right)
	     *     @param {string} [styles.textDecoraiton] Type of line (underline / line-throgh / overline)
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, styles) {
	        var _this = this;

	        var textComp = graphics.getComponent(TEXT);
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.object = targetObj;
	        this.undoData.styles = {};
	        _tuiCodeSnippet2.default.forEachOwnProperties(styles, function (value, key) {
	            _this.undoData.styles[key] = targetObj[key];
	        });

	        return textComp.setStyle(targetObj, styles);
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var textComp = graphics.getComponent(TEXT);
	        var _undoData = this.undoData,
	            textObj = _undoData.object,
	            styles = _undoData.styles;


	        return textComp.setStyle(textObj, styles);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Clear all objects
	                                                   */

	var command = {
	    name: commandNames.CLEAR_OBJECTS,

	    /**
	     * Clear all objects without background (main) image
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    execute: function execute(graphics) {
	        var _this = this;

	        return new _promise2.default(function (resolve) {
	            _this.undoData.objects = graphics.removeAll();
	            resolve();
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     * @ignore
	     */
	    undo: function undo(graphics) {
	        graphics.add(this.undoData.objects);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Flip an image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var FLIP = componentNames.FLIP;


	var command = {
	  name: commandNames.FLIP_IMAGE,

	  /**
	   * flip an image
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - 'flipX' or 'flipY' or 'reset'
	   * @returns {Promise}
	   */
	  execute: function execute(graphics, type) {
	    var flipComp = graphics.getComponent(FLIP);

	    this.undoData.setting = flipComp.getCurrentSetting();

	    return flipComp[type]();
	  },

	  /**
	   * @param {Graphics} graphics - Graphics instance
	   * @returns {Promise}
	   */
	  undo: function undo(graphics) {
	    var flipComp = graphics.getComponent(FLIP);

	    return flipComp.set(this.undoData.setting);
	  }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Load a background (main) image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var IMAGE_LOADER = componentNames.IMAGE_LOADER;


	var command = {
	    name: commandNames.LOAD_IMAGE,

	    /**
	     * Load a background (main) image
	     * @param {Graphics} graphics - Graphics instance
	     * @param {string} imageName - Image name
	     * @param {string} imgUrl - Image Url
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, imageName, imgUrl) {
	        var loader = graphics.getComponent(IMAGE_LOADER);
	        var prevImage = loader.getCanvasImage();
	        var prevImageWidth = prevImage ? prevImage.width : 0;
	        var prevImageHeight = prevImage ? prevImage.height : 0;

	        this.undoData = {
	            name: loader.getImageName(),
	            image: prevImage,
	            objects: graphics.removeAll(true)
	        };

	        return loader.load(imageName, imgUrl).then(function (newImage) {
	            return {
	                oldWidth: prevImageWidth,
	                oldHeight: prevImageHeight,
	                newWidth: newImage.width,
	                newHeight: newImage.height
	            };
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var loader = graphics.getComponent(IMAGE_LOADER);
	        var _undoData = this.undoData,
	            objects = _undoData.objects,
	            name = _undoData.name,
	            image = _undoData.image;


	        graphics.removeAll(true);
	        graphics.add(objects);

	        return loader.load(name, image);
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Remove a filter from an image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var FILTER = componentNames.FILTER;


	var command = {
	  name: commandNames.REMOVE_FILTER,

	  /**
	   * Remove a filter from an image
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - Filter type
	   * @returns {Promise}
	   */
	  execute: function execute(graphics, type) {
	    var filterComp = graphics.getComponent(FILTER);

	    this.undoData.options = filterComp.getOptions(type);

	    return filterComp.remove(type);
	  },

	  /**
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - Filter type
	   * @returns {Promise}
	   */
	  undo: function undo(graphics, type) {
	    var filterComp = graphics.getComponent(FILTER);
	    var options = this.undoData.options;


	    return filterComp.add(type, options);
	  }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages; /**
	                                                       * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                       * @fileoverview Remove an object
	                                                       */

	var command = {
	    name: commandNames.REMOVE_OBJECT,

	    /**
	     * Remove an object
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id) {
	        var _this = this;

	        return new _promise2.default(function (resolve, reject) {
	            _this.undoData.objects = graphics.removeObjectById(id);
	            if (_this.undoData.objects.length) {
	                resolve();
	            } else {
	                reject(rejectMessages.noObject);
	            }
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.add(this.undoData.objects);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames; /**
	                                                   * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                   * @fileoverview Resize a canvas
	                                                   */

	var command = {
	    name: commandNames.RESIZE_CANVAS_DIMENSION,

	    /**
	     * resize the canvas with given dimension
	     * @param {Graphics} graphics - Graphics instance
	     * @param {{width: number, height: number}} dimension - Max width & height
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, dimension) {
	        var _this = this;

	        return new _promise2.default(function (resolve) {
	            _this.undoData.size = {
	                width: graphics.cssMaxWidth,
	                height: graphics.cssMaxHeight
	            };

	            graphics.setCssMaxDimension(dimension);
	            graphics.adjustCanvasDimension();
	            resolve();
	        });
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        graphics.setCssMaxDimension(this.undoData.size);
	        graphics.adjustCanvasDimension();

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Rotate an image
	 */
	var componentNames = _consts2.default.componentNames,
	    commandNames = _consts2.default.commandNames;
	var ROTATION = componentNames.ROTATION;


	var command = {
	  name: commandNames.ROTATE_IMAGE,

	  /**
	   * Rotate an image
	   * @param {Graphics} graphics - Graphics instance
	   * @param {string} type - 'rotate' or 'setAngle'
	   * @param {number} angle - angle value (degree)
	   * @returns {Promise}
	   */
	  execute: function execute(graphics, type, angle) {
	    var rotationComp = graphics.getComponent(ROTATION);

	    this.undoData.angle = rotationComp.getCurrentAngle();

	    return rotationComp[type](angle);
	  },

	  /**
	   * @param {Graphics} graphics - Graphics instance
	   * @returns {Promise}
	   */
	  undo: function undo(graphics) {
	    var rotationComp = graphics.getComponent(ROTATION);
	    var angle = this.undoData.angle;


	    return rotationComp.setAngle(angle);
	  }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _tuiCodeSnippet = __webpack_require__(2);

	var _tuiCodeSnippet2 = _interopRequireDefault(_tuiCodeSnippet);

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	 * @fileoverview Set object properties
	 */
	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages;


	var command = {
	    name: commandNames.SET_OBJECT_PROPERTIES,

	    /**
	     * Set object properties
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} props - properties
	     *     @param {string} [props.fill] Color
	     *     @param {string} [props.fontFamily] Font type for text
	     *     @param {number} [props.fontSize] Size
	     *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
	     *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
	     *     @param {string} [props.textAlign] Type of text align (left / center / right)
	     *     @param {string} [props.textDecoraiton] Type of line (underline / line-throgh / overline)
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, props) {
	        var _this = this;

	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.props = {};
	        _tuiCodeSnippet2.default.forEachOwnProperties(props, function (value, key) {
	            _this.undoData.props[key] = targetObj[key];
	        });

	        graphics.setObjectProperties(id, props);

	        return _promise2.default.resolve();
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @returns {Promise}
	     */
	    undo: function undo(graphics, id) {
	        var props = this.undoData.props;


	        graphics.setObjectProperties(id, props);

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _command = __webpack_require__(68);

	var _command2 = _interopRequireDefault(_command);

	var _promise = __webpack_require__(4);

	var _promise2 = _interopRequireDefault(_promise);

	var _consts = __webpack_require__(72);

	var _consts2 = _interopRequireDefault(_consts);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var commandNames = _consts2.default.commandNames,
	    rejectMessages = _consts2.default.rejectMessages; /**
	                                                       * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
	                                                       * @fileoverview Set object properties
	                                                       */

	var command = {
	    name: commandNames.SET_OBJECT_POSITION,

	    /**
	     * Set object properties
	     * @param {Graphics} graphics - Graphics instance
	     * @param {number} id - object id
	     * @param {Object} posInfo - position object
	     *  @param {number} posInfo.x - x position
	     *  @param {number} posInfo.y - y position
	     *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
	     *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
	     * @returns {Promise}
	     */
	    execute: function execute(graphics, id, posInfo) {
	        var targetObj = graphics.getObject(id);

	        if (!targetObj) {
	            return _promise2.default.reject(rejectMessages.noObject);
	        }

	        this.undoData.objectId = id;
	        this.undoData.props = graphics.getObjectProperties(id, ['left', 'top']);

	        graphics.setObjectPosition(id, posInfo);
	        graphics.renderAll();

	        return _promise2.default.resolve();
	    },

	    /**
	     * @param {Graphics} graphics - Graphics instance
	     * @returns {Promise}
	     */
	    undo: function undo(graphics) {
	        var _undoData = this.undoData,
	            objectId = _undoData.objectId,
	            props = _undoData.props;


	        graphics.setObjectProperties(objectId, props);
	        graphics.renderAll();

	        return _promise2.default.resolve();
	    }
	};

	_command2.default.register(command);

	module.exports = command;

/***/ })
/******/ ])
});
;