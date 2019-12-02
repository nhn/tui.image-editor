import snippet from 'tui-code-snippet';
import Colorpicker from './tools/colorpicker';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/icon';
import {isSupportFileApi} from '../util';
import {defaultIconPath} from '../consts';

/**
 * Icon ui class
 * @class
 * @ignore
 */
class Icon extends Submenu {
    constructor(subMenuElement, {locale, iconStyle, menuBarPosition, usageStatistics}) {
        super(subMenuElement, {
            locale,
            name: 'icon',
            iconStyle,
            menuBarPosition,
            templateHtml,
            usageStatistics
        });

        this.iconType = null;
        this._iconMap = {};

        this._els = {
            registIconButton: this.selector('.tie-icon-image-file'),
            addIconButton: this.selector('.tie-icon-add-button'),
            iconColorpicker: new Colorpicker(
                this.selector('.tie-icon-color'), '#ffbb3b', this.toggleDirection, this.usageStatistics
            )
        };
    }

    /**
     * Add event for icon
     * @param {Object} actions - actions for icon
     *   @param {Function} actions.registCustomIcon - register icon
     *   @param {Function} actions.addIcon - add icon
     *   @param {Function} actions.changeColor - change icon color
     */
    addEvent(actions) {
        this.actions = actions;

        this._els.iconColorpicker.on('change', this._changeColorHandler.bind(this));
        this._els.registIconButton.addEventListener('change', this._registeIconHandler.bind(this));
        this._els.addIconButton.addEventListener('click', this._addIconHandler.bind(this));
    }

    /**
     * Clear icon type
     */
    clearIconType() {
        this._els.addIconButton.classList.remove(this.iconType);
        this.iconType = null;
    }

    /**
     * Register default icon
     */
    registDefaultIcon() {
        snippet.forEach(defaultIconPath, (path, type) => {
            this.actions.registDefalutIcons(type, path);
        });
    }

    /**
     * Set icon picker color
     * @param {string} iconColor - rgb color string
     */
    setIconPickerColor(iconColor) {
        this._els.iconColorpicker.color = iconColor;
    }

    /**
     * Returns the menu to its default state.
     */
    changeStandbyMode() {
        this.clearIconType();
        this.actions.cancelAddIcon();
    }

    /**
     * Change icon color
     * @param {string} color - color for change
     * @private
     */
    _changeColorHandler(color) {
        color = color || 'transparent';
        this.actions.changeColor(color);
    }

    /**
     * Change icon color
     * @param {object} event - add button event object
     * @private
     */
    _addIconHandler(event) {
        const button = event.target.closest('.tui-image-editor-button');

        if (button) {
            const iconType = button.getAttribute('data-icontype');
            const iconColor = this._els.iconColorpicker.color;
            this.actions.discardSelection();
            this.actions.changeSelectableAll(false);
            this._els.addIconButton.classList.remove(this.iconType);
            this._els.addIconButton.classList.add(iconType);

            if (this.iconType === iconType) {
                this.changeStandbyMode();
            } else {
                this.actions.addIcon(iconType, iconColor);
                this.iconType = iconType;
            }
        }
    }

    /**
     * register icon
     * @param {object} event - file change event object
     * @private
     */
    _registeIconHandler(event) {
        let imgUrl;

        if (!isSupportFileApi) {
            alert('This browser does not support file-api');
        }

        const [file] = event.target.files;

        if (file) {
            imgUrl = URL.createObjectURL(file);
            this.actions.registCustomIcon(imgUrl, file);
        }
    }
}

export default Icon;
