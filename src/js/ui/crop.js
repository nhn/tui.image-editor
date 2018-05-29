import cropHtml from './template/submenu/crop';

/**
 * Crop ui class
 * @class
 */
export default class Crop {
    constructor(subMenuElement, {submenuIcon}) {
        const selector = str => subMenuElement.querySelector(str);
        this._makeSubMenuElement(subMenuElement, submenuIcon);
        this.status = 'active';
        this._el = {
            apply: selector('#crop-button .apply'),
            cancel: selector('#crop-button .cancel')
        };
    }

    /**
     * Add event for crop
     * @param {Object} actions - actions for crop
     *   @param {Function} crop - crop action
     *   @param {Function} cancel - cancel action
     */
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

    /**
     * Change apply button status
     * @param {Boolean} enableStatus - apply button status
     */
    changeApplyButtonStatus(enableStatus) {
        if (enableStatus) {
            this._el.apply.classList.add('active');
        } else {
            this._el.apply.classList.remove('active');
        }
    }

    /**
     * Make submenu dom element
     * @param {HTMLElement} subMenuElement - subment dom element
     * @param {Object} submenuIcon - subment icon
     * @private
     */
    _makeSubMenuElement(subMenuElement, submenuIcon) {
        const cropSubMenu = document.createElement('div');
        cropSubMenu.className = 'crop';
        cropSubMenu.innerHTML = cropHtml({submenuIcon});

        subMenuElement.appendChild(cropSubMenu);
    }
}
