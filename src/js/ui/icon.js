import snippet from 'tui-code-snippet';
import Colorpicker from './tools/colorpicker';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/icon';
import {isSupportFileApi} from '../util';
import {defaultIconPath} from '../consts';

/**
 * Icon ui class
 * @class
 */
export default class Icon extends Submenu {
    constructor(subMenuElement, {iconStyle}) {
        super(subMenuElement, {
            name: 'icon',
            iconStyle,
            templateHtml
        });

        this.iconType = null;
        this._iconMap = {};

        this._els = {
            registIconButton: this.selector('#tie-icon-image-file'),
            addIconButton: this.selector('#tie-icon-add-button'),
            iconColorpicker: new Colorpicker(this.selector('#tie-icon-color'))
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

        this._els.iconColorpicker.on('change', this._changeColor.bind(this));
        this._els.registIconButton.addEventListener('change', this._registeIcon.bind(this));
        this._els.addIconButton.addEventListener('click', this._addIcon.bind(this));
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
     * Change icon color
     * @param {string} color - color for change
     * @private
     */
    _changeColor(color) {
        color = color || 'transparent';
        this.actions.changeColor(color);
    }

    /**
     * Change icon color
     * @param {object} event - add button event object
     * @private
     */
    _addIcon(event) {
        const button = event.target.closest('.tui-image-editor-button');
        if (button) {
            const iconType = button.getAttribute('data-icontype');
            this._els.addIconButton.classList.remove(this.iconType);
            this._els.addIconButton.classList.add(iconType);

            this.iconType = iconType;
            this.actions.addIcon(iconType);
        }
    }

    /**
     * register icon
     * @param {object} event - file change event object
     * @private
     */
    _registeIcon(event) {
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
