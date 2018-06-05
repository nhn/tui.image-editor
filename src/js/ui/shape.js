import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/shape';
import {toInteger} from '../util';
import {defaultShapeStrokeValus} from '../consts';

const SHAPE_DEFAULT_OPTION = {
    stroke: '#ffbb3b',
    fill: '',
    strokeWidth: 3
};

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
        this.options = SHAPE_DEFAULT_OPTION;

        this._els = {
            shapeSelectButton: this.selector('#tie-shape-button'),
            shapeColorButton: this.selector('#tie-shape-color-button'),
            strokeRange: new Range(this.selector('#tie-stroke-range'), defaultShapeStrokeValus),
            strokeRangeValue: this.selector('#tie-stroke-range-value'),
            fillColorpicker: new Colorpicker(this.selector('#tie-color-fill'), ''),
            strokeColorpicker: new Colorpicker(this.selector('#tie-color-stroke'), '#ffbb3b')
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

        this._els.shapeSelectButton.addEventListener('click', this._changeShape.bind(this));
        this._els.strokeRange.on('change', this._changeStrokeRange.bind(this));
        this._els.fillColorpicker.on('change', this._changeFillColor.bind(this));
        this._els.strokeColorpicker.on('change', this._changeStrokeColor.bind(this));
        this._els.strokeRangeValue.value = this._els.strokeRange.value;
        this._els.strokeRangeValue.setAttribute('readonly', true);
    }

    /**
     * Set Shape status
     * @param {Object} options - options of shape status
     *   @param {string} strokeWidth - stroke width
     *   @param {string} strokeColor - stroke color
     *   @param {string} fillColor - fill color
     */
    setShapeStatus({strokeWidth, strokeColor, fillColor}) {
        this._els.strokeRange.value = strokeWidth;
        this._els.strokeRange.trigger('change');

        this._els.strokeColorpicker.color = strokeColor;
        this._els.fillColorpicker.color = fillColor;
        this.options.stroke = strokeColor;
        this.options.fill = fillColor;
        this.options.strokeWidth = strokeWidth;
    }

    /**
     * Change icon color
     * @param {object} event - add button event object
     * @private
     */
    _changeShape(event) {
        const button = event.target.closest('.tui-image-editor-button');
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
     * @private
     */
    _changeStrokeRange(value) {
        this.options.strokeWidth = toInteger(value);
        this._els.strokeRangeValue.value = toInteger(value);

        this.actions.changeShape({
            strokeWidth: value
        });

        this.actions.setDrawingShape(this.type, this.options);
    }

    /**
     * Change shape color
     * @param {string} color - fill color
     * @private
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
     * @private
     */
    _changeStrokeColor(color) {
        color = color || 'transparent';
        this.options.stroke = color;
        this.actions.changeShape({
            stroke: color
        });
    }
}

