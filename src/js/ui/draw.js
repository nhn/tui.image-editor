import util from '../util';
import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/draw';
import {defaultDrawRangeValus} from '../consts';

/**
 * Draw ui class
 * @class
 */
export default class Draw extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'draw',
            iconStyle,
            templateHtml
        });

        this._els = {
            lineSelectButton: this.selector('#draw-line-select-button'),
            drawColorpicker: new Colorpicker(this.selector('#draw-color')),
            drawRange: new Range(this.selector('#draw-range'), defaultDrawRangeValus),
            drawRangeValue: this.selector('#draw-range-value')
        };

        this.type = 'line';
        this.color = this._els.drawColorpicker.color;
        this.width = this._els.drawRange.value;
    }

    /**
     * Add event for draw
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.setDrawMode - set draw mode
     */
    addEvent(actions) {
        this.actions = actions;

        this._els.lineSelectButton.addEventListener('click', this._changeDrawType.bind(this));
        this._els.drawColorpicker.on('change', this._changeDrawColor.bind(this));
        this._els.drawRange.on('change', this._changeDrawRange.bind(this));
        this._els.drawRangeValue.value = this._els.drawRange.value;
        this._els.drawRangeValue.setAttribute('readonly', true);
    }

    /**
     * set draw mode - action runner
     */
    setDrawMode() {
        this.actions.setDrawMode(this.type, {
            width: this.width,
            color: util.getRgb(this.color, 0.7)
        });
    }

    /**
     * Change draw type event
     * @param {object} event - line select event
     */
    _changeDrawType(event) {
        const button = event.target.closest('.button');
        if (button) {
            const lineType = this.getButtonType(button, ['free', 'line']);
            this.changeClass(this._els.lineSelectButton, this.type, lineType);

            this.type = lineType;
            this.setDrawMode();
        }
    }

    /**
     * Change drawing color
     * @param {string} color - select drawing color
     */
    _changeDrawColor(color) {
        color = color || 'transparent';
        this.color = color;
        this.setDrawMode();
    }

    /**
     * Change drawing Range
     * @param {number} value - select drawing range
     */
    _changeDrawRange(value) {
        value = util.toInteger(value);
        this._els.drawRangeValue.value = value;
        this.width = value;
        this.setDrawMode();
    }
}
