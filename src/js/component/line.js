/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Free drawing module, Set brush
 */
import fabric from 'fabric';
import snippet from 'tui-code-snippet';
import Component from '../interface/component';
import {eventNames, componentNames, fObjectOptions} from '../consts';

/**
 * Line
 * @class Line
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Line extends Component {
    constructor(graphics) {
        super(componentNames.LINE, graphics);

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
            mousedown: this._onFabricMouseDown.bind(this),
            mousemove: this._onFabricMouseMove.bind(this),
            mouseup: this._onFabricMouseUp.bind(this)
        };
    }

    /**
     * Start drawing line mode
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    start(setting) {
        const canvas = this.getCanvas();

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;

        this.setBrush(setting);

        canvas.forEachObject(obj => {
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
    setBrush(setting) {
        const brush = this.getCanvas().freeDrawingBrush;

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
    end() {
        const canvas = this.getCanvas();

        canvas.defaultCursor = 'default';
        canvas.selection = true;

        canvas.forEachObject(obj => {
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
    _onFabricMouseDown(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);
        const points = [pointer.x, pointer.y, pointer.x, pointer.y];

        this._line = new fabric.Line(points, {
            stroke: this._oColor.toRgba(),
            strokeWidth: this._width,
            evented: false
        });

        this._line.set(fObjectOptions.SELECTION_STYLE);

        canvas.add(this._line);

        canvas.on({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });

        this.fire(eventNames.ADD_OBJECT, this._createLineEventObjectProperties());
    }

    /**
     * Mousemove event handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseMove(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);

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
    _onFabricMouseUp() {
        const canvas = this.getCanvas();

        this.fire(eventNames.OBJECT_ADDED, this._createLineEventObjectProperties());

        this._line = null;

        canvas.off({
            'mouse:move': this._listeners.mousemove,
            'mouse:up': this._listeners.mouseup
        });
    }

    /**
     * create line event object properties
     * @returns {Object} properties line object
     * @private
     */
    _createLineEventObjectProperties() {
        const params = this.graphics.createObjectProperties(this._line);
        const {x1, x2, y1, y2} = this._line;

        return snippet.extend({}, params, {
            startPosition: {
                x: x1,
                y: y1
            },
            endPosition: {
                x: x2,
                y: y2
            }
        });
    }
}

export default Line;
