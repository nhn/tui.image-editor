import Submenu from './submenuBase';
import templateHtml from './template/submenu/crop';

/**
 * Crop ui class
 * @class
 * @ignore
 */
class Crop extends Submenu {
    constructor(subMenuElement, {iconStyle, menuBarPosition}) {
        super(subMenuElement, {
            name: 'crop',
            iconStyle,
            menuBarPosition,
            templateHtml
        });

        this.status = 'active';
        this._els = {
            apply: this.selector('#tie-crop-button .apply'),
            cancel: this.selector('#tie-crop-button .cancel'),
            'preset-none': this.selector('#tie-crop-button .preset-none'),
            'preset-square': this.selector('#tie-crop-button .preset-square'),
            'preset-3-2': this.selector('#tie-crop-button .preset-3-2'),
            'preset-4-3': this.selector('#tie-crop-button .preset-4-3'),
            'preset-5-4': this.selector('#tie-crop-button .preset-5-4'),
            'preset-7-5': this.selector('#tie-crop-button .preset-7-5'),
            'preset-16-9': this.selector('#tie-crop-button .preset-16-9')
        };
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

        this._els['preset-none'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-none');
            this.actions['preset-none']();
        });

        this._els['preset-square'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-square');
            this.actions['preset-square']();
        });

        this._els['preset-3-2'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-3-2');
            this.actions['preset-3-2']();
        });

        this._els['preset-4-3'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-4-3');
            this.actions['preset-4-3']();
        });

        this._els['preset-5-4'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-5-4');
            this.actions['preset-5-4']();
        });

        this._els['preset-7-5'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-7-5');
            this.actions['preset-7-5']();
        });

        this._els['preset-16-9'].addEventListener('click', () => {
            this.setPresetButtonActive('preset-16-9');
            this.actions['preset-16-9']();
        });
    }

    /**
     * Executed when the menu starts.
     */
    changeStartMode() {
        this.actions.modeChange('crop');
    }

    /**
     * Returns the menu to its default state.
     */
    changeStandbyMode() {
        this.actions.stopDrawingMode();
        this.setPresetButtonActive();
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

    /**
     * Set preset button to active status
     * @param {String} preset - preset name
     */
    setPresetButtonActive(preset) {
        const excludeList = [preset, 'apply', 'cancel'];
        Object.keys(this._els).forEach(key => {
            if (!excludeList.includes(key)) {
                this._els[key].classList.remove('active');
            }
        });
        if (preset) {
            this._els[preset].classList.add('active');
        }
    }
}

export default Crop;
