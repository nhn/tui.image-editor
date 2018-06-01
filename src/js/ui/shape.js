import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/shape';
import {toInteger} from '../util';

/**
 * Shape ui class
 * @class
 */
export default class Shape extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'shape',
            iconStyle,
            templateHtml
        });
        this.type = 'rect';
        this.options = {
            stroke: '#ffbb3b',
            fill: '',
            strokeWidth: 3
        };

        this._el = {
            shapeSelectButton: this.selector('#shape-button'),
            shapeColorButton: this.selector('#shape-color-button'),
            strokeRange: new Range(this.selector('#stroke-range'), {
                realTimeEvent: true,
                min: 0,
                max: 300,
                value: 3
            }),
            strokeRangeValue: this.selector('#stroke-range-value'),
            fillColorpicker: new Colorpicker(this.selector('#color-fill'), ''),
            strokeColorpicker: new Colorpicker(this.selector('#color-stroke'), '#ffbb3b')
        };
    }

    /**
     * Add event for shape
     * @param {Object} actions - actions for shape
     *   @param {Function} actions.changeShape - change shape mode
     *   @param {Function} actions.setDrawingShape - set dreawing shape
     */
    addEvent(actions) {
        this.actions = actions;

        this._el.shapeSelectButton.addEventListener('click', this._changeShape.bind(this));
        this._el.strokeRange.on('change', this._changeStrokeRange.bind(this));
        this._el.fillColorpicker.on('change', this._changeFillColor.bind(this));
        this._el.strokeColorpicker.on('change', this._changeStrokeColor.bind(this));

        this._el.strokeRangeValue.value = this._el.strokeRange.getValue();
    }

    /**
     * Set Shape status
     * @param {Object} options - options of shape status
     *   @param {string} strokeWidth - stroke width
     *   @param {string} strokeColor - stroke color
     *   @param {string} fillColor - fill color
     */
    setShapeStatus({strokeWidth, strokeColor, fillColor}) {
        this._el.strokeRange.setValue(strokeWidth);
        this._el.strokeColorpicker.setColor(strokeColor);
        this._el.fillColorpicker.setColor(fillColor);
        this.options.stroke = strokeColor;
        this.options.fill = fillColor;
        this.options.strokeWidth = strokeWidth;
    }

    /**
     * Change icon color
     * @param {object} event - add button event object
     */
    _changeShape(event) {
        const button = event.target.closest('.button');
        if (button) {
            const shapeType = this.getButtonType(button, ['circle', 'triangle', 'rect']);
            this.changeClass(event.currentTarget, this.type, shapeType);

            this.type = shapeType;
            this.actions.setDrawingShape(shapeType);
        }
    }

    /**
     * Change stroke range
     * @param {number} value - stroke range value
     */
    _changeStrokeRange(value) {
        this.options.strokeWidth = toInteger(value);
        this._el.strokeRangeValue.value = toInteger(value);

        this.actions.changeShape({
            strokeWidth: value
        });

        this.actions.setDrawingShape(this.type, this.options);
    }

    /**
     * Change shape color
     * @param {string} color - fill color
     */
    _changeFillColor(color) {
        color = color || 'transparent';
        this.options.fill = color;
        this.actions.changeShape({
            fill: color
        });
    }

    /**
     * Change shape stroke color
     * @param {string} color - fill color
     */
    _changeStrokeColor(color) {
        color = color || 'transparent';
        this.options.stroke = color;
        this.actions.changeShape({
            stroke: color
        });
    }
}

