/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Image-editor application class
 */
import Invoker from './invoker';
import commandFactory from './factory/command';
import consts from './consts';


const events = consts.eventNames;
const components = consts.componentNames;
const commands = consts.commandNames;
const {drawingModes, keyCodes, fObjectOptions, rejectMessages} = consts;
const {isUndefined, bind, forEach, extend, hasStamp} = tui.util;

/**
 * Image editor
 * @class
 * @param {string|jQuery|HTMLElement} element - Wrapper or canvas element or selector
 * @param {object} [option] - Canvas max width & height of css
 *  @param {number} option.cssMaxWidth - Canvas css-max-width
 *  @param {number} option.cssMaxHeight - Canvas css-max-height
 */
class ImageEditor {
    constructor(element, option) {
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
         * Editor current drawing mode
         * @private
         * @type {string}
         */
        this._drawingMode = drawingModes.NORMAL;

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
     * @typedef {object} FilterResult
     * @property {string} type - filter type like 'mask', 'Grayscale' and so on
     * @property {string} action - action type like 'add', 'remove'
     */

     /**
      * @typedef {object} FlipStatus
      * @property {object} flipStatus - x and y axis
      * @property {boolean} flipStatus.flipX - x
      * @property {boolean} flipStatus.flipY - x
      * @property {Number} angle - angle
      */

      /**
       * @typedef {Number} RotateStatus - {Number} angle
       */

    /**
     * @typedef {string} ErrorMsg - {string} error message
     */

    /**
     * Set selection style of fabric object by init option
     * @param {object} styles - Selection styles
     * @private
     */
    _setSelectionStyle(styles) {
        extend(fObjectOptions.SELECTION_STYLE, styles);
    }

    /**
     * Attach invoker events
     * @private
     */
    _attachInvokerEvents() {
        const {
            PUSH_UNDO_STACK,
            PUSH_REDO_STACK,
            EMPTY_UNDO_STACK,
            EMPTY_REDO_STACK
        } = events;

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
    _attachCanvasEvents() {
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
    _attachDomEvents() {
        fabric.util.addListener(document, 'keydown', this._handlers.keydown);
    }

    /**
     * Detach dom events
     * @private
     */
    _detachDomEvents() {
        fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
    }

    /**
     * Keydown event handler
     * @param {KeyboardEvent} e - Event object
     * @private
     */
     /* eslint-disable complexity */
    _onKeyDown(e) {
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
    }
    /* eslint-enable complexity */

    /**
     * "mouse:down" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onMouseDown(fEvent) {
        const originPointer = this._canvas.getPointer(fEvent.e);

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
            originPointer
        });
    }

    /**
     * Add a 'addObject' command
     * @param {object} obj - Fabric object
     * @private
     */
    _pushAddObjectCommand(obj) {
        const command = commandFactory.create(commands.ADD_OBJECT, obj);
        this._invoker.pushUndoStack(command);
        this._invoker.clearRedoStack();
    }

    /**
     * "object:added" canvas event handler
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onAddedObject(fEvent) {
        const obj = fEvent.target;

        if (obj.isType('cropzone') || obj.isType('text')) {
            return;
        }

        if (!hasStamp(obj)) {
            this._pushAddObjectCommand(obj);
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
    _onRemovedObject(fEvent) {
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
    _onSelectedObject(fEvent) {
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
    _onMovingObject(fEvent) {
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
    _onScalingObject(fEvent) {
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
    _onCreatedPath(obj) {
        obj.path.set(consts.fObjectOptions.SELECTION_STYLE);
    }

    /**
     * onSelectClear handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricSelectClear(fEvent) {
        const textComp = this._getComponent(components.TEXT);
        const obj = textComp.getSelectedObj();

        textComp.isPrevEditing = true;

        textComp.setSelectedInfo(fEvent.target, false);

        if (obj) {
            if (obj.text === '') {
                obj.remove();
            } else if (!hasStamp(obj)) {
                this._pushAddObjectCommand(obj);
            }
        }
    }

    /**
     * onSelect handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricSelect(fEvent) {
        const textComp = this._getComponent(components.TEXT);
        const obj = textComp.getSelectedObj();

        textComp.isPrevEditing = true;

        if (obj.text === '') {
            obj.remove();
        } else if (!hasStamp(obj) && textComp.isSelected()) {
            this._pushAddObjectCommand(obj);
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
    _setCanvas(element, cssMaxWidth, cssMaxHeight) {
        const mainComponent = this._getMainComponent();
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
    _getMainComponent() {
        return this._getComponent(components.MAIN);
    }

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     * @private
     */
    _getComponent(name) {
        return this._invoker.getComponent(name);
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
     * //    TEXT: 'TEXT'
     * //
     * if (imageEditor.getDrawingMode() === 'FREE_DRAWING') {
     *     imageEditor.stopDrawingMode();
     * }
     */
    getDrawingMode() {
        return this._drawingMode;
    }

    /**
     * Clear all objects
     * @returns {Promise}
     * @example
     * imageEditor.clearObjects();
     */
    clearObjects() {
        const command = commandFactory.create(commands.CLEAR_OBJECTS);

        return this.execute(command);
    }

    /**
     * Deactivate all objects
     * @example
     * imageEditor.deactivateAll();
     */
    deactivateAll() {
        this._canvas.deactivateAll();
        this._canvas.renderAll();
    }

    /**
     * Invoke command
     * @param {Command} command - Command
     * @returns {Promise}
     * @private
     */
    execute(command) {
        this.stopDrawingMode();

        return this._invoker.invoke(command);
    }

    /**
     * Undo
     * @returns {Promise}
     * @example
     * imageEditor.undo();
     */
    undo() {
        this.stopDrawingMode();

        return this._invoker.undo();
    }

    /**
     * Redo
     * @returns {Promise}
     * @example
     * imageEditor.redo();
     */
    redo() {
        this.stopDrawingMode();

        return this._invoker.redo();
    }

    /**
     * Load image from file
     * @param {File} imgFile - Image file
     * @param {string} [imageName] - imageName
     * @returns {Promise}
     * @example
     * imageEditor.loadImageFromFile(file);
     */
    loadImageFromFile(imgFile, imageName) {
        if (!imgFile) {
            return Promise.reject(rejectMessages.invalidParameters);
        }

        return this.loadImageFromURL(
            URL.createObjectURL(imgFile),
            imageName || imgFile.name
        );
    }

    /**
     * Load image from url
     * @param {string} url - File url
     * @param {string} imageName - imageName
     * @returns {Promise}
     * @example
     * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena')
     */
    loadImageFromURL(url, imageName) {
        if (!imageName || !url) {
            return Promise.reject(rejectMessages.invalidParameters);
        }

        const callback = bind(this._callbackAfterImageLoading, this);
        const command = commandFactory.create(commands.LOAD_IMAGE, imageName, url);
        command.setExecuteCallback(callback)
            .setUndoCallback(oImage => {
                if (oImage) {
                    callback(oImage);
                } else {
                    /**
                     * @event ImageEditor#clearImage
                     */
                    this.fire(events.CLEAR_IMAGE);
                }
            });

        return this.execute(command);
    }

    /**
     * Callback after image loading
     * @param {?fabric.Image} oImage - Image instance
     * @private
     */
    _callbackAfterImageLoading(oImage) {
        const mainComponent = this._getMainComponent();
        const canvasElement = mainComponent.getCanvasElement();
        const {width, height} = canvasElement.getBoundingClientRect();

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
     * @returns {Promise}
     * @example
     * imageEditor.addImageObject('path/fileName.jpg');
     */
    addImageObject(imgUrl) {
        if (!imgUrl) {
            return Promise.reject(rejectMessages.invalidParameters);
        }

        const command = commandFactory.create(commands.ADD_IMAGE_OBJECT, imgUrl);

        return this.execute(command);
    }

    /**
     * Start a drawing mode
     * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE', 'TEXT', 'SHAPE'</I>
     * @param {Object} [option] parameters of drawing mode
     * @returns {Boolean} true if success or false
     * @example
     * imageEditor.startDrawingMode('FREE_DRAWING', option);
     */
    startDrawingMode(mode, option) {
        if (this.getDrawingMode() === mode) {
            return true;
        }

        const component = this._getComponent(mode);
        if (component) {
            this._drawingMode = mode;

            if (component.start) {
                if (mode === drawingModes.TEXT) {
                    component.start({
                        mousedown: bind(this._onFabricMouseDown, this),
                        select: bind(this._onFabricSelect, this),
                        selectClear: bind(this._onFabricSelectClear, this),
                        dbclick: bind(this._onDBClick, this),
                        remove: this._handlers.removedObject
                    });
                } else {
                    component.start(option);
                }
            }
        }

        return !!component;
    }

    /**
     * Stop the current drawing mode
     * @example
     * imageEditor.stopDrawingMode();
     */
    stopDrawingMode() {
        const drawingMode = this.getDrawingMode();
        if (drawingMode === drawingModes.NORMAL) {
            return;
        }

        this._drawingMode = drawingModes.NORMAL;
        const component = this._getComponent(drawingMode);
        if (component && component.end) {
            component.end();
        }
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
    crop(rect) {
        const cropper = this._getComponent(components.CROPPER);
        const data = cropper.getCroppedImageData(rect);
        if (!data) {
            return Promise.reject(rejectMessages.invalidParameters);
        }

        return this.loadImageFromURL(data.url, data.imageName);
    }

    /**
     * Get the cropping rect
     * @returns {Object} rect
     *  @returns {Number} rect.left left position
     *  @returns {Number} rect.top left position
     *  @returns {Number} rect.width width
     *  @returns {Number} rect.height height
     */
    getCropzoneRect() {
        const cropper = this._getComponent(components.CROPPER);

        return cropper.getCropzoneRect();
    }

    /**
     * Flip
     * @returns {Promise}
     * @param {string} type - 'flipX' or 'flipY' or 'reset'
     * @returns {Promise<FlipStatus, ErrorMsg>}
     * @private
     */
    _flip(type) {
        const command = commandFactory.create(commands.FLIP_IMAGE, type);

        return this.execute(command);
    }

    /**
     * Flip x
     * @returns {Promise<FlipStatus, ErrorMsg>}
     * @example
     * imageEditor.flipX().then((flipStatus, angle) => {
     *     console.log('flipX: ', flipStatus.flipX);
     *     console.log('flipY: ', flipStatus.flipY);
     *     console.log('angle: ', angle);
     * }).catch(message => {
     *     console.log('error: ', message);
     * });
     */
    flipX() {
        return this._flip('flipX');
    }

    /**
     * Flip y
     * @returns {Promise<FlipStatus, ErrorMsg>}
     * @example
     * imageEditor.flipY().then((flipStatus, angle) => {
     *     console.log('flipX: ', flipStatus.flipX);
     *     console.log('flipY: ', flipStatus.flipY);
     *     console.log('angle: ', angle);
     * }).catch(message => {
     *     console.log('error: ', message);
     * });
     */
    flipY() {
        return this._flip('flipY');
    }

    /**
     * Reset flip
     * @returns {Promise<FlipStatus, ErrorMsg>}
     * @example
     * imageEditor.resetFlip().then((flipStatus, angle) => {
     *     console.log('flipX: ', flipStatus.flipX);
     *     console.log('flipY: ', flipStatus.flipY);
     *     console.log('angle: ', angle);
     * }).catch(message => {
     *     console.log('error: ', message);
     * });;
     */
    resetFlip() {
        return this._flip('reset');
    }

    /**
     * @param {string} type - 'rotate' or 'setAngle'
     * @param {number} angle - angle value (degree)
     * @returns {Promise<RotateStatus, ErrorMsg>}
     * @private
     */
    _rotate(type, angle) {
        const command = commandFactory.create(commands.ROTATE_IMAGE, type, angle);

        return this.execute(command);
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
     * imageEditor.rotate(10).then(angle => {
     *     console.log('angle: ', angle);
     * })).catch(message => {
     *     console.log('error: ', message);
     * });
     */
    rotate(angle) {
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
     * imageEditor.setAngle(10).then(angle => {
     *     console.log('angle: ', angle);
     * })).catch(message => {
     *     console.log('error: ', message);
     * });
     */
    setAngle(angle) {
        return this._rotate('setAngle', angle);
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
    setBrush(setting) {
        const drawingMode = this._drawingMode;
        let compName;

        switch (drawingMode) {
            case drawingModes.LINE:
                compName = components.LINE;
                break;
            default:
                compName = components.FREE_DRAWING;
        }

        this._getComponent(compName).setBrush(setting);
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
    setDrawingShape(type, options) {
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
     * @returns {Promise}
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
    addShape(type, options) {
        options = options || {};

        this._setPositions(options);

        const command = commandFactory.create(commands.ADD_SHAPE, type, options);

        return this.execute(command);
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
     * @returns {Promise}
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
    changeShape(options) {
        const command = commandFactory.create(commands.CHANGE_SHAPE, options);

        return this.execute(command);
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
     * @returns {Promise}
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
    addText(text, options) {
        if (this.getDrawingMode() !== drawingModes.TEXT) {
            return Promise.reject(rejectMessages.invalidDrawingMode);
        }

        text = text || '';
        options = options || {};

        const command = commandFactory.create(commands.ADD_TEXT, text, options);

        return this.execute(command);
    }

    /**
     * Change contents of selected text object on image
     * @param {string} text - Changing text
     * @returns {Promise}
     * @example
     * imageEditor.changeText('change text');
     */
    changeText(text) {
        if (this.getDrawingMode() !== drawingModes.TEXT) {
            return Promise.reject(rejectMessages.invalidDrawingMode);
        }

        text = text || '';

        const command = commandFactory.create(commands.CHANGE_TEXT, text);

        return this.execute(command);
    }

    /**
     * Set style
     * @param {object} styleObj - text styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     * @returns {Promise}
     * @example
     * imageEditor.changeTextStyle({
     *     fontStyle: 'italic'
     * });
     */
    changeTextStyle(styleObj) {
        if (this.getDrawingMode() !== drawingModes.TEXT) {
            return Promise.reject(rejectMessages.invalidDrawingMode);
        }

        const command = commandFactory.create(commands.CHANGE_TEXT_STYLE, styleObj);

        return this.execute(command);
    }

    /**
     * Double click event handler
     * @private
     */
    _onDBClick() {
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
    _onFabricMouseDown(event) { // eslint-disable-line
        const obj = event.target;
        const e = event.e || {};
        const originPointer = this._canvas.getPointer(e);
        const textComp = this._getComponent(components.TEXT);

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
    registerIcons(infos) {
        this._getComponent(components.ICON).registerPaths(infos);
    }

    /**
     * Add icon on canvas
     * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
     * @param {object} options - Icon options
     *      @param {string} [options.fill] - Icon foreground color
     *      @param {string} [options.left] - Icon x position
     *      @param {string} [options.top] - Icon y position
     * @returns {Promise}
     * @example
     * imageEditor.addIcon('arrow'); // The position is center on canvas
     * imageEditor.addIcon('arrow', {
     *     left: 100,
     *     top: 100
     * });
     */
    addIcon(type, options) {
        options = options || {};

        this._setPositions(options);
        const command = commandFactory.create(commands.ADD_ICON, type, options);

        return this.execute(command);
    }

    /**
     * Change icon color
     * @param {string} color - Color for icon
     * @returns {Promise}
     * @example
     * imageEditor.changeIconColor('#000000');
     */
    changeIconColor(color) {
        const command = commandFactory.create(commands.CHANGE_ICON_COLOR, color);

        return this.execute(command);
    }

    /**
     * Remove active object or group
     * @returns {Promise}
     * @example
     * imageEditor.removeActiveObject();
     */
    removeActiveObject() {
        const canvas = this._canvas;
        const target = canvas.getActiveObject() || canvas.getActiveGroup();
        const command = commandFactory.create(commands.REMOVE_OBJECT, target);

        return this.execute(command);
    }

    /**
     * Whether it has the filter or not
     * @param {string} type - Filter type
     * @returns {boolean} true if it has the filter
     */
    hasFilter(type) {
        return this._getComponent(components.FILTER).hasFilter(type);
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
    removeFilter(type) {
        const command = commandFactory.create(commands.REMOVE_FILTER, type);

        return this.execute(command);
    }

    /**
     * Apply filter on canvas image
     * @param {string} type - Filter type
     * @param {options} options - Options to apply filter
     * @returns {Promise<FilterResult, ErrorMsg>}
     * @example
     * imageEditor.applyFilter('mask');
     * imageEditor.applyFilter('mask', {
     *     mask: fabricImgObj
     * }).then(obj => {
     *     console.log('filterType: ', obj.type);
     *     console.log('actType: ', obj.action);
     * }).catch(message => {
     *     console.log('error: ', message);
     * });;
     */
    applyFilter(type, options) {
        if (type === 'mask' && !options) {
            const activeObj = this._canvas.getActiveObject();

            if (!(activeObj && activeObj.isType('image'))) {
                return Promise.reject(rejectMessages.invalidParameters);
            }

            options = {
                mask: activeObj
            };
        }

        const command = commandFactory.create(commands.APPLY_FILTER, type, options);

        return this.execute(command);
    }

    /**
     * Get data url
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI
     * @example
     * imgEl.src = imageEditor.toDataURL();
     */
    toDataURL(type) {
        return this._getMainComponent().toDataURL(type);
    }

    /**
     * Get image name
     * @returns {string} image name
     * @example
     * console.log(imageEditor.getImageName());
     */
    getImageName() {
        return this._getMainComponent().getImageName();
    }

    /**
     * Clear undoStack
     * @example
     * imageEditor.clearUndoStack();
     */
    clearUndoStack() {
        this._invoker.clearUndoStack();
    }

    /**
     * Clear redoStack
     * @example
     * imageEditor.clearRedoStack();
     */
    clearRedoStack() {
        this._invoker.clearRedoStack();
    }

    /**
     * Whehter the undo stack is empty or not
     * @returns {boolean}
     * imageEditor.isEmptyUndoStack();
     */
    isEmptyUndoStack() {
        return this._invoker.isEmptyUndoStack();
    }

    /**
     * Whehter the redo stack is empty or not
     * @returns {boolean}
     * imageEditor.isEmptyRedoStack();
     */
    isEmptyRedoStack() {
        return this._invoker.isEmptyRedoStack();
    }

    /**
     * Resize canvas dimension
     * @param {{width: number, height: number}} dimension - Max width & height
     * @returns {Promise}
     */
    resizeCanvasDimension(dimension) {
        if (!dimension) {
            return Promise.reject(rejectMessages.invalidParameters);
        }

        const command = commandFactory.create(commands.RESIZE_CANVAS_DIMENSION, dimension);

        return this.execute(command);
    }

    /**
     * Destroy
     */
    destroy() {
        const wrapperEl = this._canvas.wrapperEl;

        this.stopDrawingMode();
        this._detachDomEvents();

        this._canvas.clear();

        wrapperEl.parentNode.removeChild(wrapperEl);

        forEach(this, (value, key) => {
            this[key] = null;
        }, this);
    }

    /**
     * Set position
     * @param {object} options - Position options (left or top)
     * @private
     */
    _setPositions(options) {
        const centerPosition = this._canvas.getCenter();

        if (isUndefined(options.left)) {
            options.left = centerPosition.left;
        }

        if (isUndefined(options.top)) {
            options.top = centerPosition.top;
        }
    }
}

tui.util.CustomEvents.mixin(ImageEditor);
module.exports = ImageEditor;
