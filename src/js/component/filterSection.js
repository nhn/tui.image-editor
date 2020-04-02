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
    FILTER_SECTION_DEFAULT_OPTIONS
} from '../consts';
import resizeHelper from '../helper/shapeResizeHelper';
import {Promise} from '../util';
import {extend, inArray} from 'tui-code-snippet';

const FILTER_SECTION_INIT_OPTIONS = extend(
    {
        strokeWidth: 3,
        stroke: '#000000',
        fill: '#ffffff',
        width: 1,
        height: 1,
        rx: 0,
        ry: 0,
        radiusValue: 0,
        pixelateValue: 25
    },
    FILTER_SECTION_DEFAULT_OPTIONS
);

const DEFAULT_TYPE = 'rect-filtersection';
const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;

const filtersectionType = [
    'rect-filtersection',
    'circle-filtersection',
    'triangle-filtersection'
];

/**
 * Shape
 * @class Shape
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
export default class Filtersection extends Component {
    constructor(graphics) {
        super(componentNames.FILTER_SECTION, graphics);

        /**
         * Object of The drawing shape
         * @type {fabric.Object}
         * @private
         */
        this._filtersectionObj = null;

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
        this._options = extend({}, FILTER_SECTION_INIT_OPTIONS);

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

            const filtersectionObj = this._createInstance(type, options);

            this._bindEventOnFiltersection(filtersectionObj);

            canvas.add(filtersectionObj).setActiveObject(filtersectionObj);

            const objectProperties = this.graphics.createObjectProperties(
                filtersectionObj
            );

            resolve(objectProperties);
        });
    }

    /**
     * Change the shape
     * @ignore
     * @param {fabric.Object} filtersectionObj - Selected shape object on canvas
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
    change(filtersectionObj, options) {
        return new Promise((resolve, reject) => {
            if (inArray(filtersectionObj.get('type'), filtersectionType) < 0) {
                reject(rejectMessages.unsupportedType);
            }
            if (options.radiusValue) {
                options.rx = options.radiusValue;
                options.ry = options.radiusValue;
            }
            filtersectionObj.set(options);
            this.getCanvas().renderAll();
            resolve();
        });
    }

    apply(filtersectionObj) {
        return new Promise((resolve, reject) => {
            if (inArray(filtersectionObj.get('type'), filtersectionType) < 0) {
                reject(rejectMessages.unsupportedType);
            }
            this.getCanvas().backgroundImage.clone(cloned => {
                const {
                    left,
                    top,
                    width,
                    height
                } = this.getCanvas().getActiveObject();
                const leftPosition = ((width / 2) - left);
                const topPosition = (top - (height / 2));
                // const filter2 = new fabric.Image.filters.Grayscale();
                const filter = new fabric.Image.filters.Pixelate({
                    blocksize: filtersectionObj.pixelateValue
                });
                cloned.filters.push(filter);
                // cloned.filters.push(filter2);
                cloned.applyFilters();

                const imageData = {
                    imageName: this.getImageName(),
                    url: cloned.toDataURL({
                        leftPosition,
                        topPosition,
                        width,
                        height
                    })
                };

                fabric.Image.fromURL(imageData.url, oImg => {
                    oImg.set({
                        leftPosition,
                        topPosition,
                        lockMovementX: true,
                        lockMovementY: true,
                        hasControls: false,
                        clipPath: new fabric.Rect({
                            originX: 'center',
                            originY: 'center',
                            width,
                            height,
                            rx: filtersectionObj.radiusValue,
                            ry: filtersectionObj.radiusValue,
                            transparentCorners: false,
                            dirty: true
                        })
                    });

                    this.getCanvas().add(oImg);

                    this.getCanvas().remove(filtersectionObj);

                    this.getCanvas().renderAll();
                    resolve();
                });
            });
        });
    }

    unapply() {
        return new Promise(resolve => {
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
            case 'rect-filtersection':
                instance = new fabric.Rect(options);
                break;
            case 'circle-filtersection':
                instance = new fabric.Ellipse(
                    extend(
                        {
                            type: 'circle'
                        },
                        options
                    )
                );
                break;
            case 'triangle-filtersection':
                instance = new fabric.Triangle(options);
                break;
            default:
                instance = {};
        }
        instance.my = {
            type
        };

        return instance;
    }

    /**
     * Get the options to create the shape
     * @param {Object} options - Options to creat the shape
     * @returns {Object} Shape options
     * @private
     */
    _extendOptions(options) {
        const selectionStyles = fObjectOptions.SELECTION_STYLE;

        options = extend(
            {},
            FILTER_SECTION_INIT_OPTIONS,
            this._options,
            selectionStyles,
            options
        );

        if (options.isRegular) {
            options.lockUniScaling = true;
        }

        return options;
    }

    /**
     * Bind fabric events on the creating shape object
     * @param {fabric.Object} filtersectionObj - Shape object
     * @private
     */
    _bindEventOnFiltersection(filtersectionObj) {
        const self = this;
        const canvas = this.getCanvas();
        filtersectionObj.on({
            added() {
                self._filtersectionObj = this;
                resizeHelper.setOrigins(self._filtersectionObj);
            },
            selected() {
                self._isSelected = true;
                self._filtersectionObj = this;
                canvas.uniScaleTransform = true;
                canvas.defaultCursor = 'default';
                resizeHelper.setOrigins(self._filtersectionObj);
            },
            deselected() {
                self._isSelected = false;
                self._filtersectionObj = null;
                canvas.defaultCursor = 'crosshair';
                canvas.uniScaleTransform = false;
            },
            modified() {
                const currentObj = self._filtersectionObj;

                resizeHelper.adjustOriginToCenter(currentObj);
                resizeHelper.setOrigins(currentObj);
            },
            scaling(fEvent) {
                const pointer = canvas.getPointer(fEvent.e);
                const currentObj = self._filtersectionObj;

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
        if (!fEvent.target) {
            this._isSelected = false;
            this._filtersectionObj = false;
        }

        if (!this._isSelected && !this._filtersectionObj) {
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
        const filtersection = this._filtersectionObj;

        if (!filtersection) {
            this.add(this._type, {
                left: startPointX,
                top: startPointY,
                width,
                height
            }).then(objectProps => {
                this.fire(eventNames.ADD_OBJECT, objectProps);
            });
        } else {
            this._filtersectionObj.set({
                isRegular: this._withShiftKey
            });

            resizeHelper.resize(filtersection, pointer);
            canvas.renderAll();
        }
    }

    /**
     * MouseUp event handler on canvas
     * @private
     */
    _onFabricMouseUp() {
        const canvas = this.getCanvas();
        const startPointX = this._startPoint.x;
        const startPointY = this._startPoint.y;
        const filtersection = this._filtersectionObj;
        if (!filtersection) {
            this.add(this._type, {
                left: startPointX,
                top: startPointY,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT
            }).then(objectProps => {
                this.fire(eventNames.ADD_OBJECT, objectProps);
            });
        } else if (filtersection) {
            resizeHelper.adjustOriginToCenter(filtersection);
            this.fire(
                eventNames.ADD_OBJECT_AFTER,
                this.graphics.createObjectProperties(filtersection)
            );
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

            if (this._filtersectionObj) {
                this._filtersectionObj.isRegular = true;
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

            if (this._filtersectionObj) {
                this._filtersectionObj.isRegular = false;
            }
        }
    }
}
