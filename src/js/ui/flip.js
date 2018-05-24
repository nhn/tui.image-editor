import snippet from 'tui-code-snippet';
import flipHtml from '../template/submenu/flip';

export default class Flip {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.flipStatus = false;
        this._makeSubMenuElement(subMenuElement);

        this._el = {
            flipButton: selector('#flip-button')
        };
    }

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

    _makeSubMenuElement(subMenuElement) {
        const filpSubMenu = document.createElement('div');
        filpSubMenu.className = 'flip';
        filpSubMenu.innerHTML = flipHtml;

        subMenuElement.appendChild(filpSubMenu);
    }
}
