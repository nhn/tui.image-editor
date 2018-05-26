import cropHtml from '../template/submenu/crop';

export default class Crop {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement);
        this.status = 'active';
        this._el = {
            apply: selector('#crop-button .apply'),
            cancel: selector('#crop-button .cancel')
        };
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

    changeApplyButtonStatus(enableStatus) {
        if (enableStatus) {
            this._el.apply.classList.add('active');
        } else {
            this._el.apply.classList.remove('active');
        }
    }

    _makeSubMenuElement(subMenuElement) {
        const cropSubMenu = document.createElement('div');
        cropSubMenu.className = 'crop';
        cropSubMenu.innerHTML = cropHtml;

        subMenuElement.appendChild(cropSubMenu);
    }
}
