import Range from './tools/range';
import rotateHtml from './template/submenu/rotate';

/**
 * Rotate ui class
 * @class
 */
export default class Rotate {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);

        this._el = {
            rotateButton: selector('#retate-button'),
            rotateRange: new Range(selector('#rotate-range'), {
                min: -360,
                max: 360,
                value: 0,
                realTimeEvent: true
            }),
            rotateRangeValue: selector('#ratate-range-value')
        };
    }

    /**
     * Add event for rotate
     * @param {Object} actions - actions for crop
     *   @param {Function} rotate - rotate action
     *   @param {Function} setAngle - set angle action
     */
    addEvent({rotate, setAngle}) {
        this._el.rotateButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [rotateType] = button.className.match(/(counterclockwise|clockwise)/);
            const rotateAngle = {
                'clockwise': 30,
                'counterclockwise': -30
            }[rotateType];
            rotate(rotateAngle);
        });
        this._el.rotateRange.on('change', value => {
            const angle = parseInt(value, 10);
            this._el.rotateRangeValue.value = angle;
            setAngle(angle);
        });
    }

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @private
     */
    _makeSubMenuElement(subMenuElement) {
        const rotateSubMenu = document.createElement('div');
        rotateSubMenu.className = 'rotate';
        rotateSubMenu.innerHTML = rotateHtml;

        subMenuElement.appendChild(rotateSubMenu);
    }
}
