import cropHtml from '../template/submenu/crop';

export default class Crop {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);
        this.status = 'active';

        this.controlOption = {
            cornerStyle: 'circle',
            cornerSize: 20,
            cornerColor: '#fff',
            cornerStrokeColor: '#000',
            transparentCorners: false,
            lineWidth: 2
        };
        this._el = {
            apply: selector('#crop-button .apply'),
            cancel: selector('#crop-button .cancel')
        };
    }

    _makeSubMenuElement(subMenuElement) {
        const cropSubMenu = document.createElement('div');
        cropSubMenu.className = 'crop';
        cropSubMenu.innerHTML = cropHtml;

        subMenuElement.appendChild(cropSubMenu);
    }

    addEvent({crop, cancel}) {
        this._el.apply.addEventListener('click', () => {
            crop();
            this._el.apply.classList.remove('active');
        });

        this._el.cancel.addEventListener('click', () => {
            cancel();
            this._el.apply.classList.remove('active');
        });
    }
}
