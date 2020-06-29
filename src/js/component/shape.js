/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape component
 */
import fabric from 'fabric';
import Component from '../interface/component';
import {
    rejectMessages,
    eventNames,
    keyCodes as KEY_CODES,
    componentNames,
    fObjectOptions,
    SHAPE_DEFAULT_OPTIONS
} from '../consts';
import resizeHelper from '../helper/shapeResizeHelper';
import {Promise} from '../util';
import {extend, inArray} from 'tui-code-snippet';

const SHAPE_INIT_OPTIONS = extend({
    strokeWidth: 1,
    stroke: '#000000',
    fill: '#ffffff',
    width: 1,
    height: 1,
    rx: 0,
    ry: 0
}, SHAPE_DEFAULT_OPTIONS);

const DEFAULT_TYPE = 'rect';
const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;

const shapeType = ['rect', 'circle', 'triangle'];

/**
 * Shape
 * @class Shape
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
export default class Shape extends Component {
    constructor(graphics) {
        super(componentNames.SHAPE, graphics);

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
         * @type {Object}
         * @private
         */
        this._options = extend({}, SHAPE_INIT_OPTIONS);

        /**
         * Whether the shape object is selected or not
         * @type {boolean}
         * @private
         */
        this._isSelected = false;

        /**
         * Pointer for drawing shape (x, y)
         * @type {Object}
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
         * @type {Object}
         * @private
         */
        this._handlers = {
            mousedown: this._onFabricMouseDown.bind(this),
            mousemove: this._onFabricMouseMove.bind(this),
            mouseup: this._onFabricMouseUp.bind(this),
            keydown: this._onKeyDown.bind(this),
            keyup: this._onKeyUp.bind(this)
        };
    }

    /**
     * Start to draw the shape on canvas
     * @ignore
     */
    start() {
        const canvas = this.getCanvas();

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
    end() {
        const canvas = this.getCanvas();

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
     * @param {Object} [options] - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     */
    setStates(type, options) {
        this._type = type;

        if (options) {
            this._options = extend(this._options, options);
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
    add(type, options) {
        return new Promise(resolve => {
            const canvas = this.getCanvas();
            options = this._extendOptions(options);

            const shapeObj = this._createInstance(type, options);

            this._bindEventOnShape(shapeObj);

            canvas.add(shapeObj).setActiveObject(shapeObj);

            const objectProperties = this.graphics.createObjectProperties(shapeObj);

            resolve(objectProperties);
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
    change(shapeObj, options) {
        return new Promise((resolve, reject) => {
            if (inArray(shapeObj.get('type'), shapeType) < 0) {
                reject(rejectMessages.unsupportedType);
            }

            shapeObj.set(options);
            this.getCanvas().renderAll();
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
    _createInstance(type, options) {
        let instance;

        switch (type) {
            case 'rect':
                instance = new fabric.Rect(extend({}, options, this._makePattern()));
                break;
            case 'circle':
                instance = new fabric.Ellipse(extend({
                    type: 'circle'
                }, options, this._makePattern()));
                break;
            case 'triangle':
                instance = new fabric.Triangle(extend({}, options, this._makePattern()));
                break;
            default:
                instance = {};
        }

        return instance;
    }

    _makePattern() {
        const canvas = this.getCanvas();
        const copiedCanvas = canvas.toCanvasElement();

        const blurredImage = new fabric.Image(copiedCanvas);
        const patternSourceCanvas = new fabric.StaticCanvas();
        const filter = new fabric.Image.filters.Pixelate({
            blocksize: 10
        });
        blurredImage.filters.push(filter);
        blurredImage.applyFilters();

        patternSourceCanvas.add(blurredImage);
        patternSourceCanvas.renderAll();

        return {
            fill: new fabric.Pattern({
                source: () => {
                    patternSourceCanvas.setDimensions({
                        width: copiedCanvas.width,
                        height: copiedCanvas.height
                    });
                    patternSourceCanvas.renderAll();

                    return patternSourceCanvas.getElement();
                },
                repeat: 'no-repeat'
            }),
            patternSourceCanvas,
            objectCaching: false
        };
    }

    /**
     * Get the options to create the shape
     * @param {Object} options - Options to creat the shape
     * @returns {Object} Shape options
     * @private
     */
    _extendOptions(options) {
        const selectionStyles = fObjectOptions.SELECTION_STYLE;

        options = extend({}, SHAPE_INIT_OPTIONS, this._options, selectionStyles, options);

        if (options.isRegular) {
            options.lockUniScaling = true;
        }

        return options;
    }

    _reMakePatternImageSource(shapeObj) {
        const {patternSourceCanvas} = shapeObj;
        const [blurredImage] = patternSourceCanvas.getObjects();
        patternSourceCanvas.remove(blurredImage);

        shapeObj.visible = false;
        const canvasa = this.getCanvas();
        const copiedCanvas = canvasa.toCanvasElement();
        shapeObj.visible = true;

        const mm = new fabric.Image(copiedCanvas);
        const filter = new fabric.Image.filters.Pixelate({
            blocksize: 10
        });
        mm.filters.push(filter);
        mm.applyFilters();

        patternSourceCanvas.add(mm);

        this._fillFilterRePosition();
    }

    /**
     * Bind fabric events on the creating shape object
     * @param {fabric.Object} shapeObj - Shape object
     * @private
     */
    _bindEventOnShape(shapeObj) {
        const self = this;
        const canvas = this.getCanvas();

        shapeObj.on({
            added() {
                self._shapeObj = this;
                resizeHelper.setOrigins(self._shapeObj);
            },
            selected(aa) {
                console.log('AAA', aa.type);
                self._isSelected = true;
                self._shapeObj = this;
                canvas.uniScaleTransform = true;
                canvas.defaultCursor = 'default';
                resizeHelper.setOrigins(self._shapeObj);

                // self._reMakePatternImageSource(shapeObj);
            },
            deselected() {
                self._isSelected = false;
                self._shapeObj = null;
                canvas.defaultCursor = 'crosshair';
                canvas.uniScaleTransform = false;
            },
            modified() {
                const currentObj = self._shapeObj;

                resizeHelper.adjustOriginToCenter(currentObj);
                resizeHelper.setOrigins(currentObj);
                self._fillFilterRePosition();
            },
            modifiedInGroup(fEvent) {
                self._fillFilterRePositionInGroup(shapeObj, fEvent);
            },
            moving() {
                self._fillFilterRePosition();
            },
            rotating() {
                self._fillFilterRePosition();
            },
            scaling(fEvent) {
                const pointer = canvas.getPointer(fEvent.e);
                const currentObj = self._shapeObj;

                canvas.setCursor('crosshair');
                resizeHelper.resize(currentObj, pointer, true);

                self._fillFilterRePosition();
            }
        });
    }

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown(fEvent) {
        if (!fEvent.target) {
            this._isSelected = false;
            this._shapeObj = false;
        }

        if (!this._isSelected && !this._shapeObj) {
            const canvas = this.getCanvas();
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
    _onFabricMouseMove(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);
        const startPointX = this._startPoint.x;
        const startPointY = this._startPoint.y;
        const width = startPointX - pointer.x;
        const height = startPointY - pointer.y;
        const shape = this._shapeObj;

        if (!shape) {
            this.add(this._type, {
                left: startPointX,
                top: startPointY,
                width,
                height
            }).then(objectProps => {
                this.fire(eventNames.ADD_OBJECT, objectProps);
            });
        } else {
            this._shapeObj.set({
                isRegular: this._withShiftKey
            });

            resizeHelper.resize(shape, pointer);
            canvas.renderAll();
        }
        this._fillFilterRePosition();
    }

    _tempOriginalProps(instance) {
        const layoutProps = ['angle', 'left', 'top'];
        const originalValues = {};
        layoutProps.forEach(prop => {
            originalValues[prop] = instance[prop];
        });

        return originalValues;
    }

    _fillFilterRePositionInGroup(instance, fEvent) {
        const groupInstance = fEvent.target;

        if (groupInstance.scaleX !== 1 || groupInstance.scaleY !== 1) {
            groupInstance.addWithUpdate();
        }

        const originalProps = this._tempOriginalProps(instance);

        groupInstance.realizeTransform(instance);
        this._fillFilterRePosition(instance);

        if (originalProps) {
            instance.set(originalProps);
        }
    }

    _fillFilterRePosition(instance = this._shapeObj) {
        const originalOrigin = {
            originX: instance.originX,
            originY: instance.originY
        };
        this._adjustOriginPosition(instance, 'end');

        const {patternSourceCanvas} = instance;
        const [blurredImage] = patternSourceCanvas.getObjects();

        instance.width *= instance.scaleX;
        instance.height *= instance.scaleY;
        instance.scaleX = 1;
        instance.scaleY = 1;

        const as = this._getRotatedLeft(instance);
        const diffLeft = (as.width - instance.width) / 2;
        const diffTop = (as.height - instance.height) / 2;
        const cropX = instance.left - (instance.width / 2);
        const cropY = instance.top - (instance.height / 2);

        this._adjustOriginPosition(blurredImage, 'end');
        blurredImage.set('angle', instance.angle * -1);
        blurredImage.set({
            left: (diffLeft * -1) + (as.width / 2),
            top: (diffTop * -1) + (as.height / 2),
            width: as.width,
            height: as.height,
            cropX: cropX - diffLeft,
            cropY: cropY - diffTop
        });
        this._adjustOriginPosition(blurredImage, 'start');
        this._restoreOrigionPosition(instance, originalOrigin);

        const canvas = this.getCanvas();
        canvas.renderAll();
    }

    _getRotatedLeft(instance) {
        const {x: ax, y: ay} = instance.getPointByOrigin('left', 'top');
        const {x: bx, y: by} = instance.getPointByOrigin('right', 'top');
        const {x: cx, y: cy} = instance.getPointByOrigin('left', 'bottom');
        const {x: dx, y: dy} = instance.getPointByOrigin('right', 'bottom');

        const left = Math.min(ax, bx, cx, dx);
        const top = Math.min(ay, by, cy, dy);
        const right = Math.max(ax, bx, cx, dx);
        const bottom = Math.max(ay, by, cy, dy);

        const width = right - left;
        const height = bottom - top;

        return {
            left,
            top,
            width,
            height
        };
    }

    _restoreOrigionPosition(instance, originPosition) {
        const {originX, originY} = originPosition;
        const {x: left, y: top} = instance.getPointByOrigin(originX, originY);

        instance.set({
            left,
            top,
            originX,
            originY
        });
    }

    _adjustOriginPosition(text, editStatus) {
        let [originX, originY] = ['center', 'center'];
        if (editStatus === 'start') {
            [originX, originY] = ['left', 'top'];
        }

        const {x: left, y: top} = text.getPointByOrigin(originX, originY);
        text.set({
            left,
            top,
            originX,
            originY
        });
        text.setCoords();
    }

    /**
     * MouseUp event handler on canvas
     * @private
     */
    _onFabricMouseUp() {
        const canvas = this.getCanvas();
        const startPointX = this._startPoint.x;
        const startPointY = this._startPoint.y;
        const shape = this._shapeObj;

        if (!shape) {
            this.add(this._type, {
                left: startPointX,
                top: startPointY,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT
            }).then(objectProps => {
                this.fire(eventNames.ADD_OBJECT, objectProps);
            });
        } else if (shape) {
            resizeHelper.adjustOriginToCenter(shape);
            this.fire(eventNames.ADD_OBJECT_AFTER, this.graphics.createObjectProperties(shape));
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
    _onKeyDown(e) {
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
    _onKeyUp(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._withShiftKey = false;

            if (this._shapeObj) {
                this._shapeObj.isRegular = false;
            }
        }
    }
}
