import flipHtml from '../template/submenu/flip';

export default class Flip {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);

        this._el = {
            flipButton: selector('#flip-button')
        };
    }

    _makeSubMenuElement(subMenuElement) {
        const filpSubMenu = document.createElement('div');
        filpSubMenu.className = 'flip';
        filpSubMenu.innerHTML = flipHtml;

        subMenuElement.appendChild(filpSubMenu);
    }

    addEvent({flip}) {
        this._el.flipButton.addEventListener('click', event => {
            const button = event.target.closest('.button');
            const [flipType] = button.className.match(/(flipX|flipY|resetFlip)/);
            flip(flipType);
        });
    }
}
