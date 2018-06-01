import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/rotate';
import {toInteger} from '../util';

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

        this._el = {
            rotateButton: this.selector('#retate-button'),
            rotateRange: new Range(this.selector('#rotate-range'), {
                min: -360,
                max: 360,
                value: 0,
                realTimeEvent: true
            }),
            rotateRangeValue: this.selector('#ratate-range-value')
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
        this._el.rotateButton.addEventListener('click', this._changeRotateForButton.bind(this));
        this._el.rotateRange.on('change', this._changeRotateForRange.bind(this));
    }

    /**
     * Change rotate for range
     * @param {number} value - angle value
     */
    _changeRotateForRange(value) {
        const angle = toInteger(value);
        this._el.rotateRangeValue.value = angle;
        this.actions.setAngle(angle);
    }

    /**
     * Change rotate for button
     * @param {object} event - add button event object
     */
    _changeRotateForButton(event) {
        const button = event.target.closest('.button');
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
