import Submenu from './submenuBase';
import templateHtml from './template/submenu/crop';

/**
 * Crop ui class
 * @class
 */
export default class Crop extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'crop',
            iconStyle,
            templateHtml
        });

        this.status = 'active';
        this._el = {
            apply: this.selector('#crop-button .apply'),
            cancel: this.selector('#crop-button .cancel')
        };
    }

    /**
     * Add event for crop
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.crop - crop action
     *   @param {Function} actions.cancel - cancel action
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
}
