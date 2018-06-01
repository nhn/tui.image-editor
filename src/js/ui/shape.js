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
    addEvent({changeShape, setDrawingShape}) {
        this._el.shapeSelectButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            if (button) {
                const shapeType = this.getButtonType(button, ['circle', 'triangle', 'rect']);
                this.changeClass(event.currentTarget, this.type, shapeType);

                this.type = shapeType;
                setDrawingShape(shapeType);
            }
        });

        this._el.strokeRange.on('change', value => {
            this.options.strokeWidth = toInteger(value);
            this._el.strokeRangeValue.value = toInteger(value);

            changeShape({
                strokeWidth: value
            });

            setDrawingShape(this.type, this.options);
        });
        this._el.strokeRangeValue.value = this._el.strokeRange.getValue();

        this._el.fillColorpicker.on('change', color => {
            color = color || 'transparent';
            this.options.fill = color;
            changeShape({
                fill: color
            });
        });

        this._el.strokeColorpicker.on('change', color => {
            color = color || 'transparent';
            this.options.stroke = color;
            changeShape({
                stroke: color
            });
        });
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
}

