import snippet from 'tui-code-snippet';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/flip';

/**
 * Flip ui class
 * @class
 */
export default class Flip extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'flip',
            iconStyle,
            templateHtml
        });
        this.flipStatus = false;

        this._el = {
            flipButton: this.selector('#flip-button')
        };
    }

    /**
     * Add event for flip
     * @param {Object} actions - actions for flip
     *   @param {Function} actions.flip - flip action
     */
    addEvent({flip}) {
        this._el.flipButton.addEventListener('click', event => {
            const flipType = this.getButton(event.target, ['flipX', 'flipY', 'resetFlip']);

            if (!this.flipStatus && flipType === 'resetFlip') {
                return;
            }

            flip(flipType).then(flipStatus => {
                const flipClassList = this._el.flipButton.classList;
                this.flipStatus = false;

                flipClassList.remove('resetFlip');
                snippet.forEach(['flipX', 'flipY'], type => {
                    flipClassList.remove(type);
                    if (flipStatus[type]) {
                        flipClassList.add(type);
                        flipClassList.add('resetFlip');
                        this.flipStatus = true;
                    }
                });
            });
        });
    }
}
