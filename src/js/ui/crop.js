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
        this._els = {
            apply: this.selector('#tie-crop-button .apply'),
            cancel: this.selector('#tie-crop-button .cancel')
        };
    }

    changeStartMode() {
        this.actions.modeChange('crop');
    }

    /**
     * Add event for crop
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.crop - crop action
     *   @param {Function} actions.cancel - cancel action
     */
    addEvent(actions) {
        this.actions = actions;
        this._els.apply.addEventListener('click', () => {
            this.actions.crop();
            this._els.apply.classList.remove('active');
        });

        this._els.cancel.addEventListener('click', () => {
            this.actions.cancel();
            this._els.apply.classList.remove('active');
        });
    }

    /**
     * Change apply button status
     * @param {Boolean} enableStatus - apply button status
     */
    changeApplyButtonStatus(enableStatus) {
        if (enableStatus) {
            this._els.apply.classList.add('active');
        } else {
            this._els.apply.classList.remove('active');
        }
    }
}
