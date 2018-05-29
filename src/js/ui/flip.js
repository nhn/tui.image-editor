import snippet from 'tui-code-snippet';
import flipHtml from './template/submenu/flip';

/**
 * Flip ui class
 * @class
 */
export default class Flip {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.flipStatus = false;
        this._makeSubMenuElement(subMenuElement);

        this._el = {
            flipButton: selector('#flip-button')
        };
    }

    /**
     * Add event for flip
     * @param {Object} actions - actions for flip
     *   @param {Function} flip - flip action
     */
    addEvent({flip}) {
        this._el.flipButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [flipType] = button.className.match(/(flipX|flipY|resetFlip)/);

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

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @private
     */
    _makeSubMenuElement(subMenuElement) {
        const filpSubMenu = document.createElement('div');
        filpSubMenu.className = 'flip';
        filpSubMenu.innerHTML = flipHtml;

        subMenuElement.appendChild(filpSubMenu);
    }
}
