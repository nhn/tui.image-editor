import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/rotate';
import {toInteger} from '../util';
import {defaultRotateRangeValus} from '../consts';

/**
 * Rotate ui class
 * @class
 */
export default class Rotate extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'rotate',
            iconStyle,
            templateHtml
        });

        this._els = {
            rotateButton: this.selector('#tie-retate-button'),
            rotateRange: new Range(this.selector('#tie-rotate-range'), defaultRotateRangeValus),
            rotateRangeValue: this.selector('#tie-ratate-range-value')
        };
    }

    /**
     * Add event for rotate
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.rotate - rotate action
     *   @param {Function} actions.setAngle - set angle action
     */
    addEvent(actions) {
        // {rotate, setAngle}
        this.actions = actions;
        this._els.rotateButton.addEventListener('click', this._changeRotateForButton.bind(this));
        this._els.rotateRange.on('change', this._changeRotateForRange.bind(this));
        this._els.rotateRangeValue.setAttribute('readonly', true);
    }

    /**
     * Change rotate for range
     * @param {number} value - angle value
     */
    _changeRotateForRange(value) {
        const angle = toInteger(value);
        this._els.rotateRangeValue.value = angle;
        this.actions.setAngle(angle);
    }

    /**
     * Change rotate for button
     * @param {object} event - add button event object
     */
    _changeRotateForButton(event) {
        const button = event.target.closest('.tui-image-editor-button');
        if (button) {
            const rotateType = this.getButtonType(button, ['counterclockwise', 'clockwise']);
            const rotateAngle = {
                'clockwise': 30,
                'counterclockwise': -30
            }[rotateType];
            this.actions.rotate(rotateAngle);
        }
    }
}
