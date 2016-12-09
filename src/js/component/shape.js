/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Shape component
 */
import Component from '../interface/component';
import consts from '../consts';
import resizeHelper from '../helper/shapeResizeHelper';

const {extend, bind, inArray} = tui.util;

const KEY_CODES = consts.keyCodes;
const DEFAULT_TYPE = 'rect';
const DEFAULT_OPTIONS = {
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

const shapeType = ['rect', 'circle', 'triangle'];

/**
 * Shape
 * @class Shape
 * @param {Component} parent - parent component
 * @extends {Component}
 * @ignore
 */
class Shape extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.SHAPE;

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
    }

    /**
     * Start to draw the shape on canvas
     * @ignore
     */
    startDrawingMode() {
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
    endDrawingMode() {
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
     * @param {object} [options] - Shape options
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
    add(type, options) {
        const canvas = this.getCanvas();
        options = this._createOptions(options);
        const shapeObj = this._createInstance(type, options);

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
    change(shapeObj, options) {
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
    _createInstance(type, options) {
        let instance;

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
    _createOptions(options) {
        const selectionStyles = consts.fObjectOptions.SELECTION_STYLE;

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
    _bindEventOnShape(shapeObj) {
        const self = this;
        const canvas = this.getCanvas();

        shapeObj.on({
            added() {
                self._shapeObj = this;
                resizeHelper.setOrigins(self._shapeObj);
            },
            selected() {
                self._isSelected = true;
                self._shapeObj = this;
                canvas.uniScaleTransform = true;
                canvas.defaultCursor = 'default';
                resizeHelper.setOrigins(self._shapeObj);
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
            },
            scaling(fEvent) {
                const pointer = canvas.getPointer(fEvent.e);
                const currentObj = self._shapeObj;

                canvas.setCursor('crosshair');
                resizeHelper.resize(currentObj, pointer, true);
            }
        });
    }

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown(fEvent) {
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
            });
        } else {
            this._shapeObj.set({
                isRegular: this._withShiftKey
            });
            resizeHelper.resize(shape, pointer);
            canvas.renderAll();
        }
    }

    /**
     * MouseUp event handler on canvas
     * @private
     */
    _onFabricMouseUp() {
        const canvas = this.getCanvas();
        const shape = this._shapeObj;

        if (shape) {
            resizeHelper.adjustOriginToCenter(shape);
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

module.exports = Shape;
